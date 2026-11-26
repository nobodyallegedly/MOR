# The check before draft 26, part 1: versions (exchanges 1 to 5)

*A record of work by the scribe's session K1, 26 November 2026, one of four sessions of the check. It changes no text, code or vector, proposes no remedy and no wording for draft 26, and decides nothing. Where an answer can be read two ways, both are given and neither is chosen. Everything not in quote marks is this session's wording.*

**The wish** (Nobody, allegedly, at the top of `docs/decisions.md` on `main`): "Current wish: extract data, knowledge and understanding from the simulation run"

On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications."

On this wave (26 November, 16:37): "Yes, with attacks but using Fable 5.1, not 5.2"

On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

## In plain words

1. Five answers of 26 November change draft 25 of the Agreements rules: a late version 3 is rejected; "named signers" and "buyer by assent" stay optional add-on modules, not built-in rules; a checker without the needed module answers only "unchecked"; a "resolve" (an act meant to settle a split) with no split to settle is answered "not shown", with the reason; and only a buyer's own signature can now change what she bought.
2. Hardest conflict: under draft 25's default, a buyer must sign every later change to the agreement, so she has a say in each; exchange 5 says a buyer "has no say in the updating of it, only the known parties can."
3. Exchange 1 says a new version counts only once its signers have confirmed it by a later act ("pinned"); two other answers say it counts as soon as the agreement's own rule for changes says yes. A checker looking at an unconfirmed version 2 gets two different answers.
4. Where two rival new versions appear, exchanges 1 and 11 call it a "race" (both fail, the old version stays); draft 25 calls it a "fork" (both are kept, and a later act can pick one). Exchange 1 also counts fewer kinds of act as proof that a version came too late than draft 25 does.
5. Exchange 5 lets a deal end by itself ("a month"); draft 25 and a ledger entry of November say nothing ends by itself, only by a signed change; another answer adds that an agreement naming no shared clock or record cannot hold a time limit at all.
6. Exchange 3's "only unchecked" meets three rules that let a checker go on without the module; exchange 4 keeps "unchecked" for a checker that lacks something, while draft 25 also says "unchecked" where nothing is lacking but the reading does not settle.

**Words used below.** *Draft 25*: the unmerged rewrite of the Agreements rules of MOR. *Verifier*: software that checks acts against the rules. *cMIP*: an add-on module an agreement names to answer one question. *Update condition*: the module, or by default the rule "everyone who signed the original signs", that says whether a new version may replace the old. *Spot*, *role*, *filling*: a place in an agreement for someone unknown when it was signed (a buyer), and her taking it. *Pinned*: the order of the signatures confirmed, by a shared record or by each signer acting again afterwards. *Knot*: one act naming another by its fingerprint, which shows it came after. *Anchor*, *place*, *clock*: a shared record or clock an agreement names, for order and time. *Fork*: two rival next acts of one line. *The ledger*: `docs/decisions.md`. *Exchange N*: one of the seventeen questions of 26 November. *L1a, L5d, …*: this file's labels for the "Arrived at" lines of each exchange. *O, F, L* (from draft 25, G4.7): O is a version already replaced, F the version that replaced it, L a later version that still names O. *The MICS*: the shared rules of all of MOR's layers.

## How to read this file

- **TRACED**: to a rule, a ledger entry or a line of code, cited. **COUNTED**: by a script, named. **INFERRED**: this session's reading.
- His words are quoted exactly, typos as the ledger has them. Every quote of his in this file was checked against `docs/decisions.md` on `main` by a script of this session (`k1_quotes.py`, kept in the session's scratch space, not in the repository): each quoted string attributed to him is found character for character in the ledger (COUNTED; the result is under "How it was made").
- An "Arrived at (to check)" line is the MOR lead's reading. Where it says more than his words, the extra is listed as **unsaid**, both quoted.
- "Draft 25" is `docs/agreements-from-scratch/draft-25.md` on `claude/agreements-clean-1-hahuwn` (pull request 183). "The brief" is `docs/agreements-from-scratch/draft-26-brief.md` on `claude/draft-26-brief-ucdzo3` (pull request 206). "Verifier answers" is `docs/code/round-2-verifier-answers.md` on `claude/round-2-verifier-answers-5ng7wz` (pull request 229). "The research" is `docs/research/round-2-what-the-language-could-not-say.md` on `claude/research-round-2-could-not-say` (pull request 232). "The record" is `docs/simulation/round-2-record.md` on `claude/round-2-record` (pull request 226).
- "Exchange 11" and "exchange 13" are other sessions' share of the seventeen ("Valid means in force: one gate for an update"; "'Before the close' was the simulation's"). They are read here only as ground, where one of exchanges 1 to 5 meets them.
- Words: AGREES, EXTENDS, REPLACES (the ledger marks it), CONFLICTS, UNSAID.

---

## Exchange 1. A late version 3 is rejected

(26 November, 15:33–15:37, and his addition at 15:38.)

**His words, in order:** "Version 3 is the one the network needs to reject" Then: "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it." Then (15:38): "What I can state… when trying to build an agreement layer that could make everyone happy it became clear that it was best to treat it almost as a language and let the community implementations write the rules"

**The question, the MOR lead's:** where a reader lacks an act that "might be what shows L came late" (G4.7(c)), does any missing act leave the answer unchecked, or only one that could carry a knot? The MOR lead put the case as version 1 replaced by version 2, then version 3 naming version 1.

**Lines arrived at (to check):** (L1a) a version 3 that names a version already replaced is rejected once the replacing version is in force; only a missing act that could carry a knot ("an act in a signer's own line, or an anchoring") leaves the answer unchecked; where the replacing version was never pinned, it is a race: the change fails and the earlier version stays. (L1b) this Agreements is not to be used bare and carries a big warning; where and how is for the rewrite.

### 1. Rules of draft 25 it touches, and the brief's sort

| Rule | Draft 25, short | Brief's sort |
|---|---|---|
| G4.7 | "L is a **late update** where the knots, or an anchoring, show that L came after O was replaced. A late update replaces nothing, and is no tip of a fork" ... "Where neither the knots nor an anchoring show it, L and F are a fork" | CHANGES ("The two gates"; whether rival tips keep "fork" beside a race's "not shown" is the MOR lead's to word) |
| G4.7(a) | knots are "every field that holds a fingerprint, of every act the verifier holds, Terms or Statement, of this agreement or another, and a report's naming of its call"; late by knots where L names "enough acts for F to be valid and in force" | CHANGES (the "in force" half is the gate that goes) |
| G4.7(b) | late per place: "the first position at which ... L is valid and in force comes after the first position at which ... F is valid and in force" | CHANGES |
| G4.7(c) | "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late, whether L is late is **unchecked**" | stays as it is |
| G4.7(e) | "A verifier MUST answer **fork** for which Terms replace them, show both tips" | stays as it is |
| G4.1 | "Terms are in force when the assents their `in_force` rule requires are present." | CHANGES ("In force once pinned") |
| G4.5 | "Terms stop being in force when Terms that replace them ... are in force." | CHANGES ("Terms stop once the update condition answers valid") |
| G4.8(e) | one update that cannot be checked: "which Terms are in force is **unchecked** from there on" | stays as it is |
| G12.1 | "A **fork** is two updates of the same act of one line" | CHANGES |
| G12.3 | a resolving update names every tip and continues one | stays as it is |
| G13.3 | "after Terms came into force where the acts it names ... are enough for those Terms to be in force (G4.1) and, for a replacing version, valid (G4.11)" | CHANGES |
| G9.1 | "lacks an act named by fingerprint ... MUST answer **unchecked** for every answer that depends on it" | MOVES (to the MICS) |

(TRACED, draft 25 section 4; the brief's table, "Rule by rule".) L1b touches no numbered rule (INFERRED); the brief lists "not to be used bare" among things that are "Not rules of the text" (TRACED, the brief, end of "What is new").

### 2. Earlier ledger entries it meets

- **"A late rival"** (draft 20 period, his words "Only the knots or anchoring can"): line "Where they show it, the update replaces nothing and is no tip of a fork. Where they do not, it is a fork". L1a's rejection **AGREES**; L1a's "a race" where nothing pins version 2 **CONFLICTS** with "it is a fork" (see conflict C3). TRACED.
- **"In force once pinned"** (18 November): "Terms are in force only once the order of the signatures that put them in force is pinned". L1a **EXTENDS** it to an update ("version 2 is in force only once pinned", the MOR lead in the exchange). The brief's two-way reading 1 asked exactly this ("whether an update needs pinning too"); TRACED.
- **"The two gates"** (17 November): "Where the update condition answers valid, the update replaces the version it names. The new version's own `in_force` governs only its own later life, not whether it replaces the old one." **CONFLICTS** with L1a's "once the replacing version is in force" (conflict C2). TRACED.
- **"What a race stops"** (18 November): "in a race, the change of state fails and the earlier state stays ... A verifier answers "not shown"". L1a's race **AGREES**. TRACED.
- **Exchange 11, "Valid means in force"** (26 November): "where the update condition of the version it replaces answers valid, it is the version in force; no other assent is asked" and "Two updates answered valid against one version are a race: neither replaces it, and it stays." Meets L1a twice: on pinning (C2) and on whether a version 3 shown late is a race or rejected (C4). TRACED.
- **"Agreements is not to be used bare"** (18 November, in "No default way out"): "Yes, it.s still true under the right cMIPs. Agreements is not to be used bare. It's to build on top of." L1b **AGREES**, and **EXTENDS** it with the warning. TRACED.
- **"Only rules in the hashed text"** (17 November): "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested." Meets L1b's warning: two readings (C15). TRACED.
- **"Between a protocol and a language"** and **"Built on top, as a test"** (17 and 18 November): "Yes, agreement is now closer to language than protocol. It.s all about what is built on top." His 15:38 line **AGREES**. TRACED.

### 3. Conflicts

**C2 (pinning an update).** Side by side:

> Exchange 1, the MOR lead in the exchange: "version 2 is in force only once pinned, so a version 3 naming version 1 after that is rejected"; its line: "rejected once the replacing version is in force" and "Where the replacing version was never pinned, it is a race: the change fails and the earlier version stays."

> "The two gates" (17 November), line: "Where the update condition answers valid, the update replaces the version it names." Exchange 11, line: "where the update condition of the version it replaces answers valid, it is the version in force; no other assent is asked."

In plain words: one text says an update counts only after a further confirming step (the pin); the other two say it counts the moment its update condition says yes, with no further step. For a valid version 2 that no one has yet confirmed, the first gives "version 1 still stands", the others "version 2 stands". TRACED for the texts; INFERRED that a verifier's answer turns on it.

INFERRED, sharper: in a line of one signer, the act that would pin version 2 ("each signer whose signature was needed has acted after the completion, citing it", "In force once pinned") can be version 3, or the assent to it, itself. In the round's seven entries, version 3's `previous` names the author's assent to version 2 (TRACED, verifier answers, 1b, records 652 to 819). Read with the pin, version 3 does not name a pin of version 2, so it is not shown late and the case is a race; read with "The two gates", version 3 names enough for version 2 to be valid, so it is late. The round's case comes out differently.

**C3 (race, or fork).** Side by side:

> Exchange 1, line: "Where the replacing version was never pinned, it is a race: the change fails and the earlier version stays." Exchange 11, line: "Two updates answered valid against one version are a race: neither replaces it, and it stays."

> Draft 25, G4.7(e): "A verifier MUST answer **fork** for which Terms replace them, show both tips, and MUST NOT choose between them"; G12.3: a fork "is resolved by an update of the shared act ... which names one of them in `continues`"; "What a race stops" (18 November): "A verifier answers "not shown" for what would have changed. Whoever wants the change makes it again".

In plain words: draft 25 keeps two rival versions alive as a fork, answered "fork", which a later act can settle by picking one; a race is answered "not shown" and nothing is kept to pick from: the change must be made again. Both cannot be the answer for the same two rival versions. Whether a resolving update can still continue one of two raced versions is in neither. TRACED; the brief lists "whether rival tips keep the word 'fork'" as open (TRACED, the brief, "What is new", item 7).

**C4 (exchange 1 against exchange 11, two readings).** Side by side:

> Exchange 1, line: "a version 3 that names a version already replaced is rejected once the replacing version is in force."

> Exchange 11, line: "Two updates answered valid against one version are a race: neither replaces it, and it stays."

("Answered valid": the rule for changes of version 1 said yes. "Shown late": the acts themselves, or a shared record, show that version 3 was made after version 2 had replaced version 1.) Reading (i): exchange 11 speaks of two updates with no order between them; exchange 1 of one shown late. Then no conflict. Reading (ii): by its letter, version 2 and version 3 are two updates against version 1, both answered valid by version 1's condition (version 3 "which O's update condition answers valid", G4.7), so exchange 11 makes them a race and version 1 stays; exchange 1 makes version 2 stand. INFERRED; neither chosen.

**C5 (which missing act counts).** Side by side:

> Exchange 1, line: "Only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked; any other missing act does not."

> Draft 25, G4.7(a): "The knots are the namings G13.1 reads: every field that holds a fingerprint, of every act the verifier holds, Terms or Statement, of this agreement or another, and a report's naming of its call and the acts it relied on (G11.3)."

In plain words: draft 25 lets any act, of any agreement, or a report, show that version 3 came late; the line's bracket names only acts in a signer's own line and an anchoring. A missing act of another agreement, or a missing report, that could carry a knot is "unchecked" by draft 25 and, by the bracket's letter, not by the line. TRACED. His words ("Version 3 is the one the network needs to reject"; "Probably right.") do not name the bracket (see item 4).

**C15 (the warning, two readings).** Exchange 1, his words: "Big warning needs to be placed on it." "Only rules in the hashed text" (17 November): "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested." Reading (i): the warning goes in a companion, a README or a client, and the two agree. Reading (ii): the warning is placed on the hashed text of Agreements itself (the fixed rule text whose fingerprint is checked), which by the earlier words holds rules only. The warning is that this Agreements is not to be used bare, without modules on top. INFERRED; the line leaves "where and how" to the rewrite.

### 4. Unsaid

- **The bracket.** L1a's "(an act in a signer's own line, or an anchoring)" is the MOR lead's; his words are "Probably right." to a reading that did not state the bracket in those words (the exchange: "a missing act that cannot carry a knot (the work itself) never stops the rejection"). Unsaid by him: whether acts of another agreement and reports count.
- **What replaces the in-force step for a first version's own fork** (asked in particular). INFERRED, on this session's reading of the phrase: in draft 25, two updates of version 1 are a fork only where "each has the assents its own `in_force` requires (G4.1)" (G4.7), and F's lateness test asks "valid and in force" (G4.7(a), (b)). "The two gates" took that second step out; the brief marks those clauses CHANGES. The answers then say two things about what stands in its place: exchange 1, the pin ("version 2 is in force only once pinned"); exchange 11, nothing ("no other assent is asked", "with no separate step"). So the answers leave it two ways, not unsaid. Unsaid in both: for a lateness test by knots, what act shows that F was pinned (which act pins is listed by the brief as "Decided, not yet worded", item 1, TRACED).
  On the other reading of the phrase (version 1 itself coming into force): exchange 11's line says "The first version comes into force by the assents of its named parties" and names no pin; "In force once pinned" adds the pin. Whether exchange 11 meant to keep the pin for a first version is unsaid. INFERRED.
- **Which change fails in the race.** L1a: "the change fails" (singular). Whether version 2 also fails, and whether version 2, pinned later, then stands, is unsaid. INFERRED.
- **The answer word in the race.** "not shown" ("What a race stops") or "fork" (G4.7(e)): unsaid by exchange 1.
- **A place named.** Whether knots still show lateness where Terms name a place (the brief's open question 10, research Q2): unsaid.
- **The warning.** Where it is written: the line leaves it "for the rewrite". Whether it is in the hashed text: unsaid.
- **A note on the exchange's premise, not a conflict.** The MOR lead read "the "unchecked" came only from the kit lacking two cMIPs". Verifier answers (1b, difference 2) also traces an "unchecked" to G4.7(c) with the work not held as a piece, with the library's defaults standing in for the cMIPs (`chain.rs` lines 298 to 306 on `claude/agreements-verifier-2`: "names an act this verifier does not hold ... which might be what shows it came late (G4.7(c), G9)"). TRACED. Exchange 1's rule on which missing act counts speaks to that second source; the premise names only the first. INFERRED.

---

## Exchange 2. Named signers and buyer by assent stay cMIPs

(26 November, 15:38–15:40.)

**His words:** his 15:38 line above, given to exchange 1; then: "But now I see it adddresses the next question too, sorry"

**The question, the MOR lead's:** should named signers and buyer by assent, "the two cMIPs most windows leaned on and the kit could not check", become the grammar's defaults? The MOR lead leaned that they stay cMIPs.

**Lines arrived at (to check):** (L2a) "named signers and buyer by assent stay cMIPs, not grammar defaults. Agreements is treated almost as a language; the community's implementations write the rules." (L2b) "That a verifier or client should hold the common cMIPs so they can be checked is the MOR lead's wording, for Development, not yet asked."

### 1. Rules of draft 25 it touches, and the brief's sort

| Rule | Draft 25, short | Brief's sort |
|---|---|---|
| G4.1 | "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer" | CHANGES (pinning) |
| G4.2 | "Terms that name a party by role MUST carry `in_force`." | stays as it is |
| G10.1, G10.2 | a role names its spot socket, "the cMIP that says who fills it" (K5); "A spot is filled, by a signer, when its K5 cMIP ... names that signer on the strength of a **proof**" | stays as it is |
| G10.3 | "Each signer who fills a spot is a party in it from then on. They are bound only by their own assent (G5)." | stays as it is |
| G11.7 | "it MUST NOT show a payment as received on the buyer's word alone (G8.3)" | the brief's open question 5 (Agreements, or Money and the MICS) |
| Section 2, "Buyer" | "A buyer signs by an assent to the version they buy under, as anyone fills a spot and is bound by their own assent (G10.3, G5.1(a))." | not a rule; not sorted |
| Section 5, K2 and K5 | the sockets the two cMIPs sit in (research: "K2 named signers ... `ed7e3956…`") | K2, K5 rows: by the brief's "The eight tasks" (not changed by an entry here, INFERRED) |

TRACED (draft 25 sections 2, 4, 5; the brief's table; the research, section 6.a).

### 2. Earlier ledger entries it meets

- **"What the grammar is for"** (Fable's window, after draft 14): line "The previous Agreements solved issues; this one specifies the language for creating solutions." **AGREES**. TRACED.
- **"The wrong cMIP"**: "The answer is often: you did not use the right cMIP then." **AGREES**. TRACED.
- **"Built on top, as a test"** (18 November): "Yes, agreement is now closer to language than protocol. It.s all about what is built on top." **AGREES**. TRACED.
- **"No default way out"** (17 November): "Agreements is not to be used bare. It's to build on top of." **AGREES**. TRACED.
- **"The buyer signs the offer"** (draft 20 period): "A buyer signs terms of an agreement with unknown party, that requires the buyer to pay, as a consequence." Meets the definition of Buyer in draft 25, which reads close to a buyer-by-assent default (C17, two readings). TRACED.
- **"May and can't"** (13 November): "MOR is built on the concept of « may »". **AGREES**. TRACED.

### 3. Conflicts

- **C16 (a grammar default already exists, two readings).** L2a: "not grammar defaults"; draft 25, G4.1: "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer". Reading (i): the question was about Terms with a role, where G4.2 forces an `in_force` cMIP; there L2a and G4.2 agree. Reading (ii): by its letter, L2a says named signers is not a grammar default, and G4.1 is one (for Terms with no role). INFERRED.
- **C17 (the definition of Buyer, two readings).** Draft 25, section 2: "A buyer signs by an assent to the version they buy under, as anyone fills a spot and is bound by their own assent". L2a: buyer by assent stays a cMIP (K5). Reading (i): the definition says how a buyer is bound (by her assent, G10.3), and who fills the spot stays K5's; no conflict. Reading (ii): "as anyone fills a spot" reads as the grammar saying that an assent fills a spot, which is what buyer by assent does as a cMIP. INFERRED.

### 4. Unsaid

- **How the answer meets the round's ask** (asked in particular; described, not judged). The prompt points to the record's section 4 and to the research. In the record, section 4 names the two cMIPs once, in DubLaw's line ("Did: cMIP "shower work" drafts 1–12; "named signers", "buyer by assent", "an arbiter's award""), and the word "default" does not appear anywhere in the record (COUNTED, `grep -c -i default` over the record: 0 lines; "named signers": 1 line). So the ask is not in the record's section 4 as this session reads it (TRACED). The ask is in the research, section 11: "A counted, by window, 7 asking that the core carry named signers as a default, 6 that a verifier hold it, 5 that it is the wrong rule, 7 silent; for buyer by assent, 2 asking for a grammar case" (TRACED; the research's own count). Against that: the 7 who asked for a default are answered no by L2a; the 6 who asked that a verifier hold it meet L2b, which is the MOR lead's, for Development, "not yet asked"; the 5 who called it the wrong rule and the 2 who asked for a buyer case in the grammar are answered by L2a's "stay cMIPs" (INFERRED). The research's own kind for "A-named-signers-as-default" is "cannot-tell" (TRACED, the research, the counts table).
- **What his words cover.** His words do not name named signers or buyer by assent; L2a reads his 15:38 line as answering the question in the direction of the MOR lead's lean. Unsaid by him, in so many words, that the two "stay cMIPs".
- **L2b** is unsaid by him, as the line says.
- **The silent signer for later versions** (DubLaw's P2, the MOR lead's reason): how later versions avoid it is not said here (exchange 11 speaks to it).
- **The bare grammar and offers.** With G4.2 and L2a, every offer needs a K2 cMIP, so a verifier holding no common cMIP answers every offer's in force "unchecked" (TRACED, G4.2 with G9.1; COUNTED by the research: "93 Terms named named signers and 79 roles named buyer by assent ... no verifier held either"). Whether that is the "big warning" of exchange 1 or another thing is unsaid.

---

## Exchange 3. A hand count is the client's choice

(26 November, 15:41–15:44, and his addition at 15:46.)

**His words, in order:** "I got surprised by the decision. I later encouraged everyone to think about automation.  The question is unclear to men" Then: "Yes, so it’s like if they were using a client that did not support the cMIP, right?" Then: "It should only say unchecked. If the client dev wishes to accept other methods instead of just supporting the cMIP, that’s their choice." Then (15:46): "Just to stay with the previous one… it is just strange. Something was cooked with a cMIP then a group of people say, we don’t use it, and try to find another way to cook the result. What they should find is a closed door. The simulation had apps, they needed an app that supported the cMIP."

**The question, the MOR lead's:** what is a cMIP applied by hand worth: (a) a verifier's answer, (b) the reader's own signed word, shown with who said it, or (c) nothing; leaned (b).

**Lines arrived at (to check):** (L3a) "where a reader lacks a cMIP the answer is only "unchecked". The core gives a hand reading no answer and no form of its own. Whether a client accepts other methods, in place of supporting the cMIP, is the client developer's choice. The MOR lead's (b) is not taken." (L3b) "Terms made with a cMIP are read with that cMIP. A reader without it should find a closed door ("unchecked"), not another way to the result."

### 1. Rules of draft 25 it touches, and the brief's sort

| Rule | Draft 25, short | Brief's sort |
|---|---|---|
| G9.1 | "lacks a cMIP named by fingerprint ... MUST answer **unchecked** for every answer that depends on it" | MOVES (to the MICS) |
| Section 2, "A task's output" | "where it lacks the cMIP, the answer is **unchecked** (G9)" | not sorted |
| G4.8(a) | "**A role's cMIP not held.** ... Where it holds no such assent, no one who fills a role is shown to have signed the original, and none is asked." | CHANGES (for "the gate that goes"; this sentence not named) |
| G4.11(h) | "Where the verifier lacks the cMIP, whether the update replaces is **unchecked**" | stays as it is |
| G8.1 | "a verifier MUST report who stated it" | MOVES (to the MICS) |
| G11.3 | "What K6's row asks of a leg report MUST be readable without any cMIP those Terms name"; "Whether what was passed on is what those Terms and cMIPs require is answered by those cMIPs, and is **unchecked** where the verifier lacks them" | (G11.3 is in the brief's two-way reading 14) |

TRACED.

### 2. Earlier ledger entries it meets

- **"Unclear means unchecked"** (17 November): "Where it is unclear whether someone's assent counts, every answer that depends on it is unchecked". **AGREES**. TRACED.
- **"The simulation grows cMIPs"** (18 November) and **"May and can't"** (13 November): the client's choice **AGREES** with "May for the good stuff". TRACED.
- **"How a reader answers goes to the MICS"** (18 November): "the rules on how any reader must answer ... move to the MICS". L3a's word is a rule of how a reader answers; it meets the MICS's own word for it (C20). TRACED.
- **"When "now" is read"** (12 November): "Then, anyone accept the anchoring they are willing to accept." A reader's own anchoring is a form the core gives a reader's choice (draft 25's "per anchoring"); L3a gives a hand reading none. Not a conflict: an anchoring is not a cMIP (INFERRED).

### 3. Conflicts

- **C8 (G4.8(a) goes on without the cMIP).** L3a: "where a reader lacks a cMIP the answer is only "unchecked"". Draft 25, G4.8(a): "Where the verifier lacks the cMIP of a role of the original (K5) ... whether everyone who signed the original has signed an update is then **unchecked** only where the verifier holds an assent to the original by someone the original does not name as a signer, who might fill that role (G9). Where it holds no such assent, no one who fills a role is shown to have signed the original, and none is asked." In plain words: draft 25 lets a verifier without the spot's module still answer whether an update has everyone's signatures, by asking no role-filler; exchange 3 says a reader without the module says only "unchecked". TRACED.
- **C9 (the MICS v37 on collectives).** L3a and L3b against MICS v37, "Collectives": "**A collective whose control model's cMIP a verifier does not hold is judged under the constitutional rule alone for its way out** (leaving, stepping down, succession, absence, a fork or closing ...)". In plain words: the MICS gives a verifier another way to the result where it lacks the module; exchange 3 says the door is closed. TRACED. The MICS v37 names Agreements draft 24, which draft 25 rewrites (TRACED, `spec/README.md`); whether the sentence outlives draft 25 is unsaid.
- **C20 (invalid beats unknown, two readings).** L3a: "only "unchecked"". MICS v37, encoding: "**Invalid beats unknown** (Envelopes rule 30). A verifier that can show an act invalid by any rule it can apply ... does so, whatever else in it the verifier cannot read". Reading (i): "only" is set against a hand reading, not against "invalid"; no conflict. Reading (ii): by its letter, a reader lacking a cMIP says only "unchecked", even where another rule shows the act invalid. Also the words differ ("unchecked" in draft 25, "unknown" in the MICS), and the rule is to move to the MICS. INFERRED.
- **C14 (Development 12, two readings).** L3a: "Whether a client accepts other methods, in place of supporting the cMIP, is the client developer's choice." Development 12, part one: "A client adopts a specification by the user's choice, and shows acts under any other as unknown." Reading (i): "acts under" a specification are acts whose type it defines; a Terms act naming a cMIP in a socket is under Agreements, so the client is free. Reading (ii): an answer resting on a cMIP the client has not adopted is "unknown" to it, so a client that accepts another method breaks Development's rule. INFERRED.
- **C19 (within his own words, two readings).** "If the client dev wishes to accept other methods instead of just supporting the cMIP, that’s their choice." and, two minutes later, "What they should find is a closed door." Reading (i): the core's door is closed (it says "unchecked"); a client may still open its own, as L3a says. Reading (ii): the later words narrow the earlier: no other way to the result should be found, by the core or a client, as L3b's "not another way to the result" reads. INFERRED.

### 4. Unsaid

- **A hand reading signed as an act.** A count made by hand and published as a signed Statement is an act; draft 25 reads acts and "MUST report who stated it" (G8.1). L3a's "no answer and no form of its own" can mean (i) no special form, the act still read as its signer's word, or (ii) nothing at all. Unsaid. INFERRED.
- **What "unchecked" a client shows** for a cMIP it chose not to support, beside a method it accepted: unsaid.
- **L3b's "closed door"** is the line's word for his; "a closed door ("unchecked")" equating the two is the MOR lead's.

---

## Exchange 4. A resolve with nothing to resolve: "not shown", with the reason

(26 November, 15:45–15:48.)

**His words:** "Agreed. It’s a different reason for a “sorry can’t do” and it’s always good to state why"

**The question, the MOR lead's:** what a verifier answers for a resolve Statement where there is no fork: "unchecked", as verifier 2 does, or "not shown, nothing to resolve"; leaned "not shown", "since the verifier lacks nothing and can see there is no fork".

**Line arrived at (to check):** (L4) "a resolve that resolves nothing is answered "not shown", with the reason: nothing to resolve. "Unchecked" is kept for a reader that lacks something. Every refusal states its own reason."

### 1. Rules of draft 25 it touches, and the brief's sort

| Rule | Draft 25, short | Brief's sort |
|---|---|---|
| G12.3 | "An act that names `resolves` and does not in fact resolve the fork it sits in (... or there is no fork ...) is an act like any other, and may itself be a tip" | stays as it is |
| Section 2, answers | "**not shown**: the acts held do not establish it; an act not held might"; "**unchecked**: the verifier could not apply a rule it needed (G9)" | not sorted |
| G4.3 | "otherwise **not shown**, with the reason" | stays as it is |
| G9.1, G9.2 | G9.2: "Where forks, and powers to resolve them, lean on one another so that a verifier's reading of a set of acts does not settle, every answer that rests on a fork in that set is **unchecked**" | MOVES (to the MICS) |
| G7.2 | "Where the verifier holds two answers of one place that contradict each other, it has no answer from that place: **unchecked** (G9)." | MOVES (with "the rest of G7"; two-way reading 2) |
| G13.4 | "Where the reader accepts an anchoring from which the verifier holds no answer, or holds two that contradict each other, every answer that rests on it is **unchecked**" | STAYS or CHANGES |

TRACED.

### 2. Earlier ledger entries it meets

- **"What a race stops"** (18 November): "A verifier answers "not shown" for what would have changed" (line). **AGREES** in its use of "not shown" for a change that did not happen. TRACED.
- **Exchange 13** (26 November), the MOR lead's reading, "to check": "a verifier answers such a condition "not shown", with that reason." **AGREES**. TRACED.
- **"How a reader answers goes to the MICS"** (18 November): L4's "Every refusal states its own reason" is a rule of how a reader answers, for the MICS (EXTENDS). TRACED.
- **Verifier 2.** `core/src/agreements_new/grammar/order.rs` line 356 on `claude/agreements-verifier-2`: "it resolves nothing, and is read as an act like any other (G12.3): {}", where `{}` is the answer of `update`, which answers "unchecked" (TRACED, verifier answers, 1c, and this session's read of the line). Code against text, already named by verifier answers as "a **possible** translation error"; L4 agrees with that file's lean B. TRACED.

### 3. Conflicts

- **C10 ("unchecked is kept for a reader that lacks something").** L4: ""Unchecked" is kept for a reader that lacks something." Draft 25, G9.2: "Where forks, and powers to resolve them, lean on one another so that a verifier's reading of a set of acts does not settle, every answer that rests on a fork in that set is **unchecked**"; G7.2 and G13.4: two contradicting answers of a place or an anchoring give **unchecked**. In plain words: draft 25 says "unchecked" in cases where the verifier lacks nothing (a reading that does not settle; two answers that contradict); the line keeps "unchecked" for a reader that lacks something. Reading (i): "lacks something" includes lacking one settled answer; no conflict. Reading (ii): by its letter, those cases need another word. TRACED for the texts; the two readings INFERRED. His words do not say it (see item 4).
- **C18 (the reason given, against the definition, two readings).** The MOR lead's lean: "since the verifier lacks nothing and can see there is no fork". Draft 25, section 2: "**not shown**: the acts held do not establish it; an act not held might". Reading (i): "not shown" fits, since a tip the verifier does not hold might make a fork the resolve does resolve. Reading (ii): the lean's "can see there is no fork" is a statement that no act could change it, which is not what "not shown" says. No verifier's answer turns on it (INFERRED).

### 4. Unsaid

- **"Unchecked is kept for a reader that lacks something"** and **"Every refusal states its own reason"** are the line's. His words: "It’s a different reason for a “sorry can’t do” and it’s always good to state why". "Always good" is said; "every refusal states", as a rule, is the line's.
- **Which answers are refusals.** Whether "not valid", "invalid", "rejected" ("which is no answer of this text", section 2) and "unchecked" each state a reason, and whether G9.1's "unchecked" must name what was lacking: unsaid.
- **The resolve that is itself a tip.** G12.3: such an act "may itself be a tip: a fork is not hidden by adding the field". Where an empty resolve makes a fork with another act, which answer comes first, "fork" for the line or "not shown" for the resolve: unsaid.
- **The word for the reason.** "nothing to resolve" is the line's; the exact words a verifier gives are unsaid.

---

## Exchange 5. A buyer under a replaced version: what version 2 says

(26 November, 15:49–16:03.)

**His words, in order:** "What are the terms of version 2? Would be my answer" Then (15:52): "Let’s stay on the previous one a lil longer pls" And: "What do my words mean… Ana acted when version 2 was in force. She is now bound by the agreement layer and so is the seller.  What did she buy?" Then: "Yes, and the what she bought creates different scenarios probably addressed differently under different cMIPs. We’re talking about the right to update terms on an ongoing agreement. Ana is a different class of participant, she is unknown at the time of creation of the agreement. Therefore, she has no say in the updating of it, only the known parties can. She should be protected. Version 2 is what she bought, and she has no say in the update. Let”s look at a service… it would protect her from terms being changed on her. If she bought for a month of service to an LLM for example, the deal is valid a month. If it was year, version 2 is valid a year. Protect the unknown parties." Then: "How does it says that speaking Core?" Then: "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under" Then (16:00–16:01): "The previous one about removing (B)… why was it added in the first place?" Then: "Yes, but me saying something does not mean that something was necessarily a good idea"

**Lines arrived at (to check):** (L5a) "the Terms of the version she signed decide it, and the cMIPs they name. The grammar keeps her assent to version 2 as a signed fact; what it means once version 2 is replaced is whatever version 2 says." (L5b) "protect the unknown parties. A participant who joins through a role after the agreement was made (a filling) has no say in its updates; only the known parties have. What she bought is the version she acted under, for as long as that version says (a month, a year). The scenarios of what is bought are the cMIPs'." (L5c) "G10.6(b) goes. No later version changes the rights of a filling already earned except by an assent its holder signs in their own name. An update condition cannot reach what an unknown party bought. A deal meant to change says so in its own words, and is bought as such." (L5d) "this replaces "Earned rights leave the grammar" (18 November). G10.6 comes back with (a) only ... A deal that ends by itself (a month's plan, a licence ending at a creator's statement) says so in its own version's words; that is not an update and (a) does not stop it. His words: what he said earlier binds as the record of an exchange, not as proof it was a good idea; it can be revisited."

### 1. Rules of draft 25 it touches, and the brief's sort

| Rule | Draft 25, short | Brief's sort |
|---|---|---|
| G10.6 | "A filling has exactly the rights offered by the version it was earned under ... Nothing stops those rights by itself (G4.11(f)). No later version changes the rights of a filling already earned unless:" | GOES |
| G10.6(a) | "it carries an assent to it signed by that filling's holder in their own name (G5.1(a))" | GOES or STAYS (two-way reading 11) |
| G10.6(b) | "the version the filling was earned under names an update condition, and that condition's cMIP ... answers valid" | GOES |
| G10.5 | a filling "keeps the rights of the version it was earned under (G10.6)" | CHANGES (rests on G10.6 going) |
| G10.7 | "No condition triggers: these grammar rules have no answer **triggered**, and none that a filling's rights **no longer apply**" | CHANGES (rests on G10.6 going) |
| G4.11(f) | "**Nothing changes by itself.** ... What a version offers, and the rights of those who earned a filling under it, change only through an update (G10.6, G10.7)." | stays as it is |
| G4.11(i) | "in G4.8 and in G10.6" | STAYS or CHANGES ("It names G10.6, which goes") |
| G4.8(a) | "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; ...)" | CHANGES (for the gate; this sentence not named) |
| G5.1(c), G5.2 | bound by an update one did not sign where the update condition answers valid | G5.1(c) STAYS (two-way reading 8); G5.2 stays |
| G5.7 | "a filling's rights change only as G10.6 says" | (in "Decided, not yet worded", item 10) |
| G12.5 | "no version of the continued line is named as a later version that changes its rights (G10.6)" | CHANGES (rests on G10.6 going) |
| G10.3 | "They are bound only by their own assent (G5)." | stays as it is |
| Section 5, K4 row | inputs: "or, where a filling is asked about, the version it was earned under and the later version (G10.6)" | (in "Decided, not yet worded", item 10) |
| Section 7, stated cost | "Nothing stops by itself: rights meant to stop on a date stop, as these grammar rules read them, only when someone makes the update"; "Whoever earns a filling keeps what they earned only as far as the update condition of the version they earned under lets no update take it (G10.6)." | not sorted (the brief did not read section 7) |

TRACED.

### 2. Earlier ledger entries it meets

- **"Earned rights leave the grammar"** (18 November): "(b). G10.6 goes." **REPLACES**; the ledger marks it ("*Replaced on 26 November*"). TRACED. The brief's rows G10.5, G10.6, G10.6(a), G10.6(b), G10.7 and G12.5 rest on the replaced entry (C13).
- **"A later version and a closed spot"** (12 November): "Whoever paid the agreement has the rights the agreement offer." and "That version could have conditions tied to time, creators statements… bla bla bla… core does not care"; line: "No later version changes them without the holder's own signature." L5c **AGREES**; L5d's "a deal that ends by itself" **AGREES** with "conditions tied to time". TRACED.
- **"The update condition"** (draft 16 period): first line "Nothing changes by itself: rights stop applying, or an offer stops taking new people, only through an update the condition answers valid." **CONFLICTS** with L5d (C6). The later line of the same exchange replaces the first only "where they differ" and does not restate "nothing changes by itself" (TRACED); whether the first line's sentence still stands is the reading C6 rests on.
- **"Which version a discharge divides by"** (13 November): "Then, dynamic conditions (we reserve the right to…) can only work if the signed deal stated so. Only a signed condition can update the agreement on one end" Meets L5c (C12). TRACED.
- **"An offer that closes by itself"** (13 November): line "as proposed" ("an offer may close by its own signed condition ("open until June", "first 100 buyers")"). **AGREES** with L5d. TRACED.
- **"Participants who arrive later"** (12 November): "some participants are not tied to a specific ID when the agreement is drafted, they are tied to a role that will be linked to an ID in the future." **AGREES** with "Ana is a different class of participant". TRACED.
- **"A power given binds its giver"** (18 November): line "Whoever grants a power through a cMIP is bound by what is done under it, as if by her own signature". Meets L5c's "in their own name" (C11). TRACED.
- **"Nothing about me without my signature"** (18 November): "Nothing about me is accepted without my signature." **AGREES**. TRACED.
- **"Whose place counts; protect the unknown party, as a principle"** and **"Protect the unknown party is an Agreements principle"** (26 November, 15:51–16:05): "Protect the unknown party" as a principle; then "It’s an agreements principle". L5b **AGREES**; the MOR lead's lean there names G10.6 as a rule that applies it. TRACED.
- **Exchange 13** (26 November, 16:33): "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition" Meets L5b's "a month, a year" (C7). TRACED.

### 3. Conflicts

- **C1 (a role-filler is asked to sign every update by default).** L5b, his words: "Therefore, she has no say in the updating of it, only the known parties can." Draft 25, G4.8(a): "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; ...)"; G4.11(e): "Where Terms name no update condition, an update is valid when everyone who signed the original signs it." In plain words: under draft 25's default, a buyer who filled a role is one of those whose signature every update needs, so she has a say (indeed one veto); exchange 5 says she has none. A verifier asked whether an update is valid by default without her assent answers "not shown" by draft 25 and, by exchange 5, valid on the known parties' signatures. TRACED for the texts; INFERRED for the verifier.
- **C6 (a deal that ends by itself).** L5d: "A deal that ends by itself (a month's plan, a licence ending at a creator's statement) says so in its own version's words; that is not an update and (a) does not stop it." Draft 25, section 7: "Nothing stops by itself: rights meant to stop on a date stop, as these grammar rules read them, only when someone makes the update"; G4.11(f): "the rights of those who earned a filling under it, change only through an update"; G10.7: no answer "that a filling's rights **no longer apply**, and a verifier MUST NOT give" it; the ledger, "The update condition": "Nothing changes by itself". In plain words: draft 25 says a month's plan does not end until someone updates it, and forbids a verifier to say it ended; the line says it ends by its own words, with no update. Reading (i): the month is a condition inside the rights (G10.6: "with every condition that version puts on them"), read by the body's cMIP, and the grammar never says "ended"; then only section 7's sentence conflicts. Reading (ii): a verifier may now answer that such a filling's rights have ended, against G10.7. TRACED; the readings INFERRED.
- **C11 ("in their own name" against a power she gave).** L5c: "except by an assent its holder signs in their own name". "A power given binds its giver" (18 November), line: "as if by her own signature". In plain words: if an agent she empowered assents, for her, to version 3, the 18 November line counts it as her signature and the 26 November line, by its letter, does not. Reading (i): "in their own name" excludes acts under a power (G5.1(a) only, as G10.6(a) cites). Reading (ii): it means "by her, or for her under a power she gave", and the two agree. Neither chosen. TRACED for the texts.
- **C12 ("we reserve the right to…").** "Which version a discharge divides by" (13 November): "Then, dynamic conditions (we reserve the right to…) can only work if the signed deal stated so. Only a signed condition can update the agreement on one end" Exchange 5 (26 November): "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under", and L5c: "An update condition cannot reach what an unknown party bought. A deal meant to change says so in its own words". In plain words: on 13 November a signed condition letting one side update was allowed for a buyer; on 26 November the update-condition door for a buyer is shut, and only a deal "meant to change" in its own words remains. Reading (i): "we reserve the right to…" written in version 2's own words is such a deal, and the two agree. Reading (ii): a reserved right to change unilaterally is the "nightmare", and 26 November reverses 13 November. His 16:03 words bear on it: "Yes, but me saying something does not mean that something was necessarily a good idea". INFERRED.
- **C7 (a month needs an anchor, two readings).** L5b, his words: "If she bought for a month of service to an LLM for example, the deal is valid a month." Exchange 13, his words: "an agreement with no stated anchor cannot build a temporal condition" In plain words: a month is a condition in time; by exchange 13 an offer that names no place or clock cannot hold one. Reading (i): no conflict; a month's plan must name an anchor. Reading (ii): a month read by the plan's own cMIP, on a witness's word, is not the agreement's "temporal condition". INFERRED.
- **C13 (the brief's rows).** G10.6 is draft 25's rule on what someone who filled a spot (a buyer) keeps when later versions come. The brief: "G10.6 | **GOES.** Whoever fills a spot is bound by the Terms' update condition like any signer." (and G10.5, G10.6(a), G10.6(b), G10.7, G12.5 resting on it). L5d: "G10.6 comes back with (a) only". The ledger marks the replacement; the brief, written on 18 November, could not. REPLACES, listed here so no row is missed. TRACED.

### 4. Unsaid

- **L5a's "the cMIPs they name"** and **L5b's "only the known parties have"** turn his "she has no say in the updating of it" into a rule; whether "no say" means her signature is never asked (C1) or only that she cannot block: unsaid by him.
- **Who is a known party.** Whether a party named as a signer who signed late, or an agreement named as a party, is "known"; and whether a filler of a role of kind future is "unknown": unsaid.
- **What version 3 does to her.** "Version 2 is what she bought": what a verifier shows of her filling once version 3 is in force (version 2's rights, beside version 3 in force for everyone else), and what the receiver for her later payments is: unsaid.
- **"A deal meant to change says so in its own words"**: how a verifier tells such words from an update condition, given that "these grammar rules do not read" a version's words (G10.6): unsaid.
- **The K4 row and section 7.** What becomes of K4's input "where a filling is asked about ... (G10.6)" and of section 7's two sentences once (b) goes: unsaid (the brief's "Decided, not yet worded", item 10, lists K4 and K5 under the replaced entry).
- **"(A change to Agreements, for the list owed to the Dubsar Suite lead.)"** is the MOR lead's; no words of his name the list.

---

## The table: every rule of draft 25 these exchanges touch

One row per rule (and per section-2 or section-5/7 passage that holds a rule's text). Where two exchanges touch a rule, both are named.

| rule | the exchange | word | one line |
|---|---|---|---|
| G4.1 | 1, 2 | EXTENDS / CONFLICTS | Pinning reaches an update (1, C2); "not grammar defaults" against G4.1's own default (2, C16, two readings). |
| G4.2 | 2 | AGREES | Role Terms still need a K2 cMIP; named signers stays one. |
| G4.3 | 4 | AGREES | Already "not shown, with the reason". |
| G4.5 | 1 | CONFLICTS | Stops when valid ("The two gates"), or when the replacing version is pinned (exchange 1) (C2). |
| G4.7 | 1 | CONFLICTS | Late is rejected (agrees); unordered rivals are a "race" in the line, a "fork" in the rule (C3); exchange 11 by its letter makes even a late one a race (C4). |
| G4.7(a) | 1 | CONFLICTS | Knots from any act or report, against the line's "an act in a signer's own line, or an anchoring" (C5); "valid and in force" or pinned (C2). |
| G4.7(b) | 1 | UNSAID | Its "valid and in force" per place: pinned or valid, left two ways. |
| G4.7(c) | 1 | EXTENDS | Settles "might be what shows L came late": only a missing act that could carry a knot. |
| G4.7(e) | 1 | CONFLICTS | "MUST answer **fork**" against "a race" (C3). |
| G4.8(a) | 3, 5 | CONFLICTS | Goes on without a role's cMIP (3, C8); counts a role-filler among those every default update needs (5, C1). |
| G4.8(e) | 1 | AGREES | One update that cannot be checked stays unchecked. |
| G4.11(e) | 5 | CONFLICTS | The default asks "everyone who signed the original", fillers included (C1). |
| G4.11(f) | 5 | CONFLICTS | "Nothing changes by itself" against a deal that ends by itself (C6). |
| G4.11(h) | 3 | AGREES | Lacking the condition's cMIP: unchecked. |
| G4.11(i) | 5 | UNSAID | Names G10.6 "in G4.8 and in G10.6"; what it says once (b) goes. |
| G5.1(c) | 5 | UNSAID | Still binds signers by update condition; whether a filler is outside it is in C1. |
| G5.7 | 5 | AGREES | "a filling's rights change only as G10.6 says", now with (a) only. |
| G7.2 | 4 | CONFLICTS | Contradicting place answers give "unchecked" with nothing lacking (C10, two readings). |
| G8.1 | 3 | UNSAID | A hand count signed as an act: its signer's word, or nothing (item 4). |
| G9.1 | 1, 3, 4 | AGREES | "unchecked" for what is lacking; moves to the MICS, whose word is "unknown" (C20). |
| G9.2 | 4 | CONFLICTS | Unsettled readings give "unchecked" with nothing lacking (C10, two readings). |
| G10.2 | 2 | AGREES | Who fills a spot stays K5's. |
| G10.3 | 2, 5 | AGREES | A filler bound only by her own assent. |
| G10.5 | 5 | REPLACES | The brief's CHANGES rested on G10.6 going (C13). |
| G10.6 | 5 | REPLACES | Comes back with (a) only (the ledger marks it); the brief's GOES is overtaken (C13). |
| G10.6(a) | 5 | REPLACES | Stays, read as the whole rule; C11 on "in their own name". |
| G10.6(b) | 5 | AGREES | Goes, as the brief had it, for another reason. |
| G10.7 | 5 | CONFLICTS | No answer "no longer apply" against a month's plan that ends (C6); the brief's CHANGES rested on G10.6 going (C13). |
| G11.3 | 3 | AGREES | Leg reports read without the cMIP; what the cMIP decides is unchecked. |
| G11.7 | 2 | AGREES | A payment is not received on the buyer's word alone; buyer by assent proves assent, not payment. |
| G12.1 | 1 | CONFLICTS | A fork of Terms, or a race (C3). |
| G12.3 | 1, 4 | AGREES / UNSAID | An empty resolve is "an act like any other" (4); whether a raced version can be continued (1, C3). |
| G12.5 | 5 | REPLACES | The brief's CHANGES rested on G10.6 going (C13). |
| G12.7 | 1 | UNSAID | A late resolving update is a late update; under a race, unsaid. |
| G13.1 | 1 | CONFLICTS | Its list of knot fields against the line's bracket (C5). |
| G13.3 | 1 | CONFLICTS | "in force ... and valid": pinned or valid (C2). |
| G13.4 | 4 | CONFLICTS | Contradicting anchoring answers give "unchecked" with nothing lacking (C10, two readings). |
| §2 Buyer | 2 | CONFLICTS | "as anyone fills a spot" by assent, against buyer by assent staying a cMIP (C17, two readings). |
| §2 answers | 3, 4 | AGREES / CONFLICTS | "A task's output ... unchecked" agrees (3); "not shown ... an act not held might" against the lean's reason (4, C18, two readings). |
| §5 K4 row | 5 | UNSAID | Its input "where a filling is asked about ... (G10.6)" rests on (b). |
| §7 stated cost | 5 | CONFLICTS | "rights meant to stop on a date stop ... only when someone makes the update" (C6); "keeps what they earned only as far as the update condition ... lets" rests on (b). |

**Count** (COUNTED, by `k1_count.py` over this table's first column): 41 rows: 37 numbered rules of section 4 (G4.1 to G13.4) and 4 passages of sections 2, 5 and 7. By word (a row may carry two): CONFLICTS 18, AGREES 13, UNSAID 7, REPLACES 4, EXTENDS 2.

---

## The conflicts, together, hardest first

Hardest: a verifier's answer would turn on it. Each is given above in full; here, the two texts and one line of why.

1. **C1.** His words: "Therefore, she has no say in the updating of it, only the known parties can." / Draft 25, G4.8(a): "Everyone who signed the original is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; ...)", with G4.11(e)'s default. *Why not both:* the default makes every update wait on the buyer's signature; his words give her none to give. A verifier answers "not shown" or "valid" for the same update.
2. **C2.** Exchange 1: "version 2 is in force only once pinned" / "The two gates": "Where the update condition answers valid, the update replaces the version it names." and exchange 11: "no other assent is asked". *Why not both:* for a valid, unconfirmed version 2, one says version 1 stands and the others say version 2 stands; in the round's one-signer lines the act that would pin version 2 is version 3 itself, so the round's own case flips (INFERRED).
3. **C3.** Exchanges 1 and 11: "it is a race: the change fails and the earlier version stays" / Draft 25, G4.7(e): "A verifier MUST answer **fork** ... show both tips", resolved by G12.3. *Why not both:* one answer word and no way back but signing again, against another word and a resolving act that picks a tip.
4. **C5.** Exchange 1's line: "(an act in a signer's own line, or an anchoring)" / G4.7(a): knots from "every act the verifier holds, Terms or Statement, of this agreement or another, and a report's naming". *Why not both:* a missing act of another agreement, or a report, leaves lateness unchecked by the rule and not by the line.
5. **C8.** Exchange 3: "where a reader lacks a cMIP the answer is only "unchecked"" / G4.8(a): "Where it holds no such assent, no one who fills a role is shown to have signed the original, and none is asked." *Why not both:* the rule answers an update's signatures without the spot's module; the line says the reader without it says only "unchecked".
6. **C10.** Exchange 4: ""Unchecked" is kept for a reader that lacks something." / G9.2: "Where forks ... lean on one another so that a verifier's reading ... does not settle, every answer ... is **unchecked**" (also G7.2, G13.4). *Why not both, on one reading:* draft 25 says "unchecked" where nothing is lacking.
7. **C4** (two readings). Exchange 1: "a version 3 that names a version already replaced is rejected" / exchange 11: "Two updates answered valid against one version are a race: neither replaces it". *Why not both, on the letter:* version 2 and version 3 are both answered valid against version 1.
8. **C6** (two readings). Exchange 5: "A deal that ends by itself ... that is not an update" / Draft 25, section 7: "rights meant to stop on a date stop ... only when someone makes the update"; G10.7: no answer that rights "no longer apply". *Why not both:* one ends the month's plan by its own words; the other waits for an update and forbids the verifier to say it ended.
9. **C11** (two readings). Exchange 5: "except by an assent its holder signs in their own name" / "A power given binds its giver": "as if by her own signature". *Why not both, on one reading:* an assent made for her by her agent counts as hers on 18 November and not by the 26 November letter.
10. **C9.** Exchange 3: "A reader without it should find a closed door ("unchecked"), not another way to the result." / MICS v37: a collective "whose control model's cMIP a verifier does not hold is judged under the constitutional rule alone for its way out". *Why not both:* the MICS gives the reader another way to the result. (The MICS v37 names Agreements draft 24.)
11. **C20** (two readings). Exchange 3: "only "unchecked"" / MICS v37: "**Invalid beats unknown**". *Why not both, on the letter:* "only" leaves no room for "invalid".
12. **C16** (two readings). Exchange 2: "not grammar defaults" / G4.1: "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer". *Why not both, on the letter:* G4.1 is a named-signers default.
13. **C7** (two readings). Exchange 5: "the deal is valid a month" / exchange 13: "an agreement with no stated anchor cannot build a temporal condition". *Why not both, on one reading:* an offer with no place or clock cannot say "a month".
14. **C12** (two readings). 13 November: "Only a signed condition can update the agreement on one end" / 26 November: "It’s the “let me drown you in terms updatable unilaterally” nightmare". *Why not both, on one reading:* a reserved right to change, signed by the buyer, is allowed on one day and shut on the other.
15. **C13.** The brief: "G10.6 | **GOES.**" / exchange 5: "G10.6 comes back with (a) only". Marked by the ledger; the brief's six rows are overtaken.
16. **C17** (two readings). Draft 25's Buyer: "A buyer signs by an assent to the version they buy under, as anyone fills a spot" / exchange 2: buyer by assent stays a cMIP.
17. **C18** (two readings). The lean: "the verifier lacks nothing and can see there is no fork" / Draft 25: "**not shown**: the acts held do not establish it; an act not held might". No answer turns on it.
18. **C14** (two readings, a client's). Exchange 3: "is the client developer's choice" / Development 12: "shows acts under any other as unknown".
19. **C15** (two readings). Exchange 1: "Big warning needs to be placed on it." / "Only rules in the hashed text": "Yes, the text should be just that. Everything else goes into companion documents". *Why not both, on one reading:* a warning in the hashed text is not a rule.
20. **C19** (two readings, within his words). "If the client dev wishes to accept other methods instead of just supporting the cMIP, that’s their choice." / "What they should find is a closed door."

**Answers found two ways:** C4, C6, C7, C11, C12, C14, C15, C16, C17, C18, C19, C20, and, in item 4 of exchange 1, what replaces the in-force step (pinned, or nothing).

---

## How it was made

- Read: `CLAUDE.md`; the ledger's head, the five exchanges whole, exchanges 6, 6b, 11 and 13 where mine meet them, and the earlier entries named above, each whole; draft 25 sections 2 to 4 and the K4 row and section 7 sentences quoted; the brief's "On one page", table rows quoted, "What is new", "Decided, not yet worded", "Open", "His words against the lines", "Readings that can go two ways"; verifier answers 1b, 1c, 1g; the research's sections 6.a, 9, 11 and its counts table; the record, by search only; `spec/README.md`; the MICS v37 and Development 12, by search only; two lines of verifier 2's code. Nothing else was read through.
- `k1_quotes.py`: takes every string this file attributes to him (in quote marks after "His words", "He:" or named as his) and looks for it, character for character, in `docs/decisions.md` on `main`. Result given below.
- `k1_count.py`: counts the rows of the table above, and the rows whose first cell begins with "G".
- `grep -c -i default` and `grep -c -i "named signers"` over the record, for exchange 2.
- Results: `k1_quotes.py` found all 43 quotes of his, all 36 quoted "Arrived at" and ledger lines, 24 quotes of draft 25, 3 of the brief, 4 of the research, 1 of verifier answers and 3 of the MICS v37 and Development 12 (COUNTED; 0 missing). `k1_count.py`: 41 rows, as above. Over the record: "default" 0 lines, "named signers" 1 line.

### The blind reader, and what could not be fixed

"In plain words" and three conflicts drawn at random (C15, C13, C4, by `random.SystemRandom().sample`) were handed to a subagent that had seen neither the ledger nor the prompt, asking: "what are the two texts, and why can they not both stand?" It could say, for all three. It stumbled on words: "it" in C15 (which text the warning sits on), "L5d" and "the ledger", how G10.6 relates to a buyer, "O", "answered valid", "pinned", "knots", "anchor", "verifier", "the MICS", "cMIP". Fixed: "In plain words" rewritten without rule numbers or undefined terms; a list of words added under it; C15, C13 and C4 given the missing words. Not fixed: the sections after "In plain words" still use rule numbers and the grammar's own terms, since they quote the rules; and the changed text was not put to a second blind reader.

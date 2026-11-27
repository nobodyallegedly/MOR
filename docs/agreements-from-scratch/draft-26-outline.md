# Draft 26 of Agreements: the outline

*A record of work by the scribe's session M1, 27 November 2026: the first session of stage two of wave three of the stint of 26 November. It lays out the three files of draft 26 (the text, encoding 3 and the companion) section by section, for the MOR lead to read before any section is written. It writes no rule text, no definition's wording and no remedy, and decides nothing. Where the sources can be read two ways, both are given and neither is chosen. Everything not in quotation marks is this session's wording, unless a cell says whose it is.*

**The wish** (Nobody, allegedly, 26 November, 16:46, at the top of `docs/decisions.md` on main):

> "We need to change the current wish to updating the core after the findings"

On what carries over (16:47): "Yes, we’ll go back to analysis, maybe add the focus on agreements"

On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

**Why** (the MOR lead's wording): wave three of the stint of 26 November is the draft 26 brief redone (done: pull request 289), then draft 26, a new file beside draft 25, which stays as it is. The MOR lead asked for the outline first, in its own session, sent to the lead before any section is written.

**Marks.** **TRACED**: to a rule or a ledger entry, cited. **COUNTED**: by a script, named in section 11. **INFERRED**: this session's reading. *The ledger* is `docs/decisions.md` on main; entries are cited by their bold heading and date. *The brief* is `docs/agreements-from-scratch/draft-26-brief-2.md` (pull request 289); its rows, its new rules N1 to N10 and its unsaid items 1 to 35 are cited by their numbers. *The settled note* is `docs/lead/notes/2026-11-27-settled-by-the-lead.md` (its M, F and Q rows); *the changes note* is `docs/lead/notes/2026-11-27-what-changed-in-agreements.md`. Draft 25 and encoding 2 are on `claude/agreements-clean-1-hahuwn` (pull request 183). *The impact sheet* is `docs/code/impact-26-november.md` on `claude/impact-26-november-4vze7a`. *The rulings* are the MOR lead's three rulings of 27 November on the brief's items 1, 4 and 28, and its ruling on the other unsaid items, given to this session in its assignment and not yet in the ledger; they are quoted as the MOR lead's, never as his.

**The rulings, quoted** (the MOR lead, 27 November, to the scribe; the lead's reading, marked so):

- Item 1: "a first version still waits for the pin. "In force once pinned" (18 November) carries over; the 16:19 line was about who signs, not when it counts." G4.1, G4.10 and G5.7(c) are written on it.
- Item 4: "a keeper's record for Identity's rule 34 waits for draft 26 to exist; write draft 26's keeper as decided, and list rule 34 under "for Identity"."
- Item 28: ""shown after" stays the lead's reading, marked so in the companion."
- The other unsaid items: "write draft 26 where the ledger or a note answers them; where only a new choice would, leave the rule out and list it."

## 1. In plain words

1. Draft 26 is the next text of the Agreements rules, written as a new file beside draft 25, from the brief (pull request 289), which sorted each of draft 25's 124 rules: stays, changes, goes, moves, or two ways.
2. Three files: `draft-26.md`, the rules a verifier applies, opening with a short introduction; `encoding-3.md`, how each act is written as bytes; `draft-26-companion.md`, the reasons, costs, examples and where each rule came from.
3. The rules are grouped in 13 sections (draft 26's §5, laid out in section 3 below; draft 26's own sections are written with § here, the outline's without). Who signs an update by default is in *Updates: the gate and the pin* (§5.5, G4.8(a), G4.11(e)); where an agreement is kept, and who vouches for its order, is in *The keeper, and the clock* (§5.8); what a buyer keeps when the terms change is in *Spots, and the unknown party (the buyer who joins later)* (§5.10).
4. Unlike draft 25: an update needs both the old version's permission (the gate) and its place in the order shown (the pin); only the parties named when the Terms were made sign an update; no update reaches a buyer who came in later; "place" becomes "keeper"; any naming by fingerprint, in any act, counts as order; time conditions need a stated clock or keeper.
5. 95 of draft 25's rules stay in the text; 3 go; 26 move to other texts (the MICS, Envelopes). Of the 95, 10 wait whole and 4 wait in part until the MOR lead reads them one way. 19 of the brief's 35 open points have no answer yet, and the parts of rules they touch are left out (section 7).
6. Ten writing sessions follow this one: the text in six, encoding 3 in one, the companion in two, a whole check in one (section 9).

## 2. The three files

| File | What it is for | What goes in it | What never goes in it |
|---|---|---|---|
| `draft-26.md` | The hashed text: what a verifier applies and a cMIP author needs. Acts of Agreements are written under its spec hash. | The introduction (§0 below), then the MIR shape only: purpose; dependencies; definitions; the data each act carries; the validity rules a verifier checks (MUST, SHOULD, MAY); the tasks handed to cMIPs, with what each accepts and produces; open technical parameters. TRACED: "Only rules in the hashed text" (17 Nov): "a hashed text holds its rules and nothing else"; "Agreements gets an introduction" (27 Nov). | Reasons, the *lie exposed / protects* lines of draft 25 (INFERRED: they are reasoning), stated costs, scenarios, history of earlier drafts, finding or review numbers, ledger quotations, pointers to files outside the core texts, names of sessions or windows. TRACED: "Only rules in the hashed text" (17 Nov); "Those old drafts should be buried deep, only for people who wish to do some archeology…" ("The place vouches for the chaining only", 26 Nov). |
| `encoding-3.md` | The bytes: how a Terms act and a Statement of draft 26 are written and checked, as encoding 2 does for draft 25. | Encoding 2's rules E1 to E24, each kept, changed or gone (section 5 below); the new forms (the set of acts, the words named by act id, the keeper field or fields); what the checker answers; the byte choices still open, marked, not chosen. | Grammar rules (they are draft 26's); reasons (the companion's); any choice nobody has made, written as if made. INFERRED. |
| `draft-26-companion.md` | Why Agreements is shaped as it is and how it got there, for the few who want it. TRACED: "A companion for Agreements" (17 Nov). | Its spine, "What is the minimum two people have to write"; the principle "Protect the unknown party"; the reasoning behind each changed or new rule; the stated costs; the scenarios (the impact sheet's 22 new vectors among them); the trace of each rule to its ledger entry; the readings marked as the MOR lead's; the history, buried at the back. TRACED: "A companion for Agreements" (17 Nov); "Protect the unknown party is an Agreements principle" (26 Nov, 16:05). | Any rule a verifier needs (a rule found only here would be no rule: INFERRED, from "Only rules in the hashed text"); his words paraphrased (CLAUDE.md: quote, never paraphrase). |

**Not one of the three, and not touched:** draft 25, encoding 2 and the brief stay as they are (the assignment). The MICS, Identity, Envelopes, Text and Development are not edited by draft 26's sessions; what draft 26 hands them is listed in section 8, not written.

## 3. `draft-26.md`, section by section

Section numbers here are this session's layout (INFERRED), in the MIR shape; the writers may renumber, and the companion carries the table from draft 25's numbers to draft 26's. *Rests on* is the brief's column, copied by script from its table (COUNTED, `gen.py`); each entry is its ledger heading and date. *In draft 26* says what the writer does with the rule: "as draft 25 has it" (with "keeper" for "place" where the word occurs, the brief's counting rule), "changed, as the brief's row says", or what waits. **HELD** marks a rule the brief reads two ways, which this outline does not choose (the first question, at the end of the report); a held rule has its slot in the section and is not written until the MOR lead reads it one way.

### §0. The introduction

TRACED: "Agreements gets an introduction" (27 November, 07:18–07:37), read whole; its "Arrived at (to check)" lines are the MOR lead's reading. Listed in the order the entry has them; nothing drafted.

1. **Not to be used bare.** His: "Not to be used bare." With the earlier "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it." ("A late version 3 is rejected", 26 Nov, 15:37), whose line has "Where and how the warning is written is for the rewrite." The settled note, Q22: "The warning is the introduction's, not the verifier's output."
2. **Sockets for rule books, not one way of agreeing; more a language.** His: "Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." With "What I can state… when trying to build an agreement layer that could make everyone happy it became clear that it was best to treat it almost as a language and let the community implementations write the rules" (26 Nov, 15:38, under "A late version 3 is rejected").
3. **The keeper, as the drafters' way to agree where the agreement is kept.** His: "Keepers (old “place”) gives the drafters of agreements a way to agree on where the agreement shall be stored. (This can be simply mentioned when introducing the concept of keeper)". Then (07:27): "Yes, stored like on any other relay, no?" Two readings of where this sits, neither chosen: (i) in the introduction, as the entry's line lists it ("The keeper is introduced as the drafters' way to agree where the agreement is kept"); (ii) in passing where the keeper is first defined (section 3.4 below) or ruled on (§5.8), as his bracket says. INFERRED.
4. **Knots are MOR-wide; their importance in Agreements is discussed where Rely is.** His: "Knots is a MOR wide concept, but in agreement Rely is a good place to discuss their importance." Two readings of "where Rely is", neither chosen: (i) the rules on what an act names and relies on (`relies_on`, draft 25's G13, here §5.13); (ii) relying as a witness act signed by the client (N10, which this outline does not place in draft 26: section 7). INFERRED.
5. **What it does not say as such.** His: "I think agreement need an introduction that states a few things yes. I don’t think it should be stated as such." That answers the MOR lead's one-sentence warning that Terms naming no keeper depend on every needed signer's knots: not written as such.

Not in the entry, so not listed as its content: the principle (stated in the companion, by the 16:05 line); the three verbs and the relay market (07:27, 07:37), which are definitions (3.5) and the companion's; whether the introduction sits inside the hashed text (the brief's item 15; this assignment puts it in `draft-26.md`: section 10, row 2).

### §1. Purpose

*Holds:* what Agreements is (a grammar of the acts in which agreeing is written, read by a verifier from acts alone) and the one constraint on every rule (checked from copies of acts, plus the keeper's answers where the Terms name one). From draft 25's section 1, with "place" read as keeper (TRACED: draft 25, section 1; "The place vouches for the chaining only", 26 Nov). Its "two questions" sentence (which lie, whom it protects) is reasoning, for the companion (INFERRED).

### §2. Dependencies

*Holds:* the texts draft 26 reads and what it takes from each, by their LATEST (`spec/README.md` on main). Listed, not written:

- **Identity draft 16**: the signer, keys and rotation; the witness act (rule 10); rule 34 and the keeper's record (section 8, *For Identity*). TRACED.
- **Text draft 11**: the Text act that carries the words (N4; rule 14, the fields a text act carries). TRACED: "The words of Terms are a Text act" (26 Nov).
- **Envelopes draft 12**: the act format (the outside, the inside, `prev`, sequences); what relays do; the bake and its chain, where the baker's rule moves (G14). TRACED: encoding 2, E1; "Where three rules live" (17 Nov).
- **Money draft 14**: the settlement and the payment (G8.5, G11.7). TRACED: draft 25, G11.7.
- **Development draft 12**: how a cMIP is named (its spec hash). TRACED: encoding 2, E5. What a cMIP declares it needs is not yet in it (item 34(b), section 7).
- **The MICS**: the rules on how any reader answers, and the report block, which the 26 moved rules join (13 of them; the settled note, M24: "The MICS is rewritten after draft 26"). Until it is, those 13 have no written home (INFERRED; section 10, row 10).

### §3. Definitions

*Holds:* every word draft 26 defines, each once, in six groups (3.1 the acts and their parts; 3.2 parties; 3.3 versions, updates and forks; 3.4 order and time; 3.5 what relays do; 3.6 the verifier and its answers). The words, their group and their source are section 4 of this outline. Draft 25's definitions that are history ("no longer a term of this text": Triggered, Join) and its pointer to the research's 49 tasks go to the companion (INFERRED, from "Only rules in the hashed text", 17 Nov).

### §4. The data each act carries

*Holds:* the kinds of value and the fields of Terms and of a Statement, each with the rule that reads it, as draft 25's section 3 does.

- **4.1 The kinds of value**: a fingerprint; a list of fingerprints; an identifier (of a signer, a keeper, a clock); a socket; and, new, **the set of acts** (**N3**: "One way to name a set of acts, in Agreements", 26 Nov, 16:11–16:16; the settled note M21, F12, F13). TRACED.
- **4.2 Terms**: draft 25's table, with these changes (TRACED to the brief's "Outside the 124" paragraph unless marked): `body` names the words' Text act by its act id beside the K1 socket (N4); `place` becomes the keeper field, one keeper or several (N2; "The place vouches for the chaining only", 26 Nov, 17:49: "Yes, they should."); `clock` stays as draft 25 has it until item 34(a) is answered (section 7); `in_force` on an update is left unread, listed with the rest (the settled note, Q7); `condition` absent means the known parties' default (G4.11(e)); `envelope` and `envelope_at` stay as fields while the rules that read them move to Envelopes (INFERRED; section 10, row 8).
- **4.3 Statement**: draft 25's table, unchanged but for the rules named in its "Read by" column (INFERRED: no entry changes a Statement field).
- **What a resolving update carries**, **an author's first act** and **one fault, one rule**: as draft 25's section 3 has them (TRACED: the brief sorts no rule of section 3); the "author's first act" paragraph turns on G6.1, held (INFERRED).

### §5. Validity rules (the grammar rules)

*Holds:* the rules a verifier checks, MUST, SHOULD and MAY. Thirteen sections. The tables below are generated from the brief's sort and this outline's placement (COUNTED, `gen.py`): 95 of draft 25's 124 rules land here, each once; the other 29 are listed after the tables.

#### 5.1. An agreement as a party

*Holds:* Naming an agreement as a party, who signs for it, and the receiver.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G1.1 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G1.2 | changes | "Nothing about me without my signature" (18 Nov); "Delegation is a leftover" (18 Nov) | changed, as the brief's row says |
| G1.3 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G1.4 | two ways: stays / changes | "Whose place counts; protect the unknown party, as a principle" (26 Nov); settled note, M20 | written as far as both readings agree (a receiver is taken from the Terms in force); the clause "per the anchoring the reader accepts" is held |
| G1.5 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |

#### 5.2. The words, and what the Terms use

*Holds:* The words named as a Text act; what Terms rest on; what is left unread.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G2.1 | stays | "The words of Terms are a Text act" (26 Nov) | as draft 25 has it |
| G2.2 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |

*New rules here:* **N4**, resting on "The words of Terms are a Text act" (26 Nov, 16:25–16:28).

#### 5.3. Authors

*Holds:* Who the authors are, and that authors bear unclear words.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G3.1 | two ways: stays / changes | "There is no unsigned act: the author is a known party" (27 Nov) | written as far as both readings agree (an author not among the parties makes the Terms invalid); whether an author named by role is a known party is held (item 3) |
| G3.2 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |

#### 5.4. The first version, and what an assent binds

*Holds:* How a first version comes into force (waiting for the pin); what an assent binds; a counter signature.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G4.1 | two ways: stays / changes | "Valid means in force: one gate for an update" (26 Nov); "In force once pinned" (18 Nov); "The gate and the pin; a fork, not a race" (26 Nov); settled note, M19 | written on the MOR lead's ruling on item 1: a first version waits for the pin |
| G4.2 | stays | "Who signs an update by default: the known parties" (26 Nov); settled note, M11 | as draft 25 has it |
| G4.3 | changes | "For the unknown party there is no update, only the agreement she signed" (27 Nov); "Who signs an update by default: the known parties" (26 Nov); settled note, M15 | changed, as the brief's row says |
| G4.4 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G4.10 | changes | "A fork is a fork" (27 Nov); "What a race stops" (18 Nov); "In force once pinned" (18 Nov); "The place vouches for the chaining only" (26 Nov) | written on the ruling on item 1; how the fork it may make is resolved in bytes is left out (item 7) |

#### 5.5. Updates: the gate and the pin

*Holds:* When an update replaces a version: valid (the gate), its order shown (the pin), who signs an update by default (G4.8(a), G4.11(e); other sections cite it), a late update, an update condition.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G4.5 | changes | "The gate and the pin; a fork, not a race" (26 Nov); "Valid and in force, two words, two jobs" (26 Nov) | changed, as the brief's row says |
| G4.6 | changes | "The place vouches for the chaining only" (26 Nov); "Whose place counts; protect the unknown party, as a principle" (26 Nov); settled note, M20 | changed, as the brief's row says |
| G4.7 | changes | "The gate and the pin; a fork, not a race" (26 Nov); "A fork is a fork" (27 Nov) | changed, as the brief's row says |
| G4.7(a) | changes | "Knots are knots: one reading, "shown after"" (27 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | changed, as the brief's row says |
| G4.7(b) | changes | "The place vouches for the chaining only" (26 Nov); "Ana's month ends by the clock the agreement names" (27 Nov); "Whose place counts; protect the unknown party, as a principle" (26 Nov); settled note, M20 | changed, as the brief's row says |
| G4.7(c) | changes | "A missing act stays unchecked: no door around it" (26 Nov); "Knots are knots: one reading, "shown after"" (27 Nov); "A late version 3 is rejected" (26 Nov) | written on the ruling on item 28 ("shown after"); the brief's two ways on the missing act are one reading (a missing act named in a field is unchecked): see section 10, row 9 |
| G4.7(d) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G4.7(e) | stays | "A fork is a fork" (27 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | as draft 25 has it |
| G4.8 | changes | "The gate and the pin; a fork, not a race" (26 Nov); "Valid and in force, two words, two jobs" (26 Nov); "Valid means in force: one gate for an update" (26 Nov) | changed, as the brief's row says |
| G4.8(a) | changes | "Who signs an update by default: the known parties" (26 Nov); "There is no unsigned act: the author is a known party" (27 Nov); settled note, M11 | written; the case of a party a later version adds is left out (item 2) |
| G4.8(b) | stays | "Who signs an update by default: the known parties" (26 Nov) | as draft 25 has it |
| G4.8(c) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G4.8(d) | changes | "The place vouches for the chaining only" (26 Nov) | changed, as the brief's row says |
| G4.8(e) | stays | "A missing act stays unchecked: no door around it" (26 Nov) | as draft 25 has it |
| G4.8(g) | two ways: moves / changes | "Only rules in the hashed text" (17 Nov); "The gate and the pin; a fork, not a race" (26 Nov); "Who signs an update by default: the known parties" (26 Nov) | its history goes to the companion on both readings; whether a clause restating the default stays is held |
| G4.9 | changes | "The gate and the pin; a fork, not a race" (26 Nov); "What a dissolution is" (18 Nov); "Leaving takes two acts" (18 Nov); "For the unknown party there is no update, only the agreement she signed" (27 Nov) | written as far as G4.5 reaches it; the two ways inside it, as the first brief found them, are held, and items 13 and 29 are left out |
| G4.11 | stays | "Valid and in force, two words, two jobs" (26 Nov) | as draft 25 has it |
| G4.11(a) | changes | "A condition in time with no anchor is refused" (26 Nov, both copies) | changed, as the brief's row says |
| G4.11(b) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G4.11(c) | changes | "A condition in time with no anchor is refused" (26 Nov, both copies) | changed, as the brief's row says |
| G4.11(d) | changes | "The gate and the pin; a fork, not a race" (26 Nov); "Valid and in force, two words, two jobs" (26 Nov) | changed, as the brief's row says |
| G4.11(e) | changes | "Who signs an update by default: the known parties" (26 Nov); "There is no unsigned act: the author is a known party" (27 Nov); "Delegation is a leftover" (18 Nov) | written; item 2 left out as for G4.8(a) |
| G4.11(f) | changes | "Ana's month ends by the clock the agreement names" (27 Nov); "A buyer under a replaced version: what version 2 says" (26 Nov) | written; how long a version binds where its words state no term is left out (item 11) |
| G4.11(g) | changes | "Who signs an update by default: the known parties" (26 Nov); "Only rules in the hashed text" (17 Nov) | changed, as the brief's row says |
| G4.11(h) | stays | "A hand count is the client's choice" (26 Nov) | as draft 25 has it |
| G4.11(i) | changes | "A buyer under a replaced version: what version 2 says" (26 Nov); "What a dissolution is" (18 Nov) | written as far as G10.6 reaches it; the first brief's two ways on "can never be updated" are held |

*New rules here:* **N1**, resting on "The gate and the pin; a fork, not a race" (26 Nov, 17:39–17:46), refining "Valid and in force, two words, two jobs" (26 Nov, 18:00) and "Valid means in force: one gate for an update" (26 Nov, 16:19).

#### 5.6. Who is bound

*Holds:* The ways to be bound: one's own signature, a power, an update one did not sign; the three branches of an agreement; what an agent made.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G5.1 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.1(a) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.1(b) | changes | "Nothing about me without my signature" (18 Nov) | changed, as the brief's row says |
| G5.1(c) | changes | "For the unknown party there is no update, only the agreement she signed" (27 Nov); "A buyer under a replaced version: what version 2 says" (26 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | changed, as the brief's row says |
| G5.2 | changes | "For the unknown party there is no update, only the agreement she signed" (27 Nov); "Only rules in the hashed text" (17 Nov) | changed, as the brief's row says |
| G5.3 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.4 | changes | "The gate and the pin; a fork, not a race" (26 Nov); "The place vouches for the chaining only" (26 Nov); "A fork is a fork" (27 Nov) | written as the gate and the pin; whether an agent's act against the end of its power is a fork is left out (item 8) |
| G5.6 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.6(a) | changes | "Who signs an update by default: the known parties" (26 Nov) | changed, as the brief's row says |
| G5.6(b) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.6(c) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.6(d) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.6(e) | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G5.6(f) | two ways: stays / changes | "A power given binds its giver" (18 Nov); "Nothing about me without my signature" (18 Nov) | HELD whole until the MOR lead reads it one way |
| G5.7 | changes | "Delegation is a leftover" (18 Nov); "Who signs an update by default: the known parties" (26 Nov); "A buyer under a replaced version: what version 2 says" (26 Nov) | changed, as the brief's row says |
| G5.7(a) | changes | "Delegation is a leftover" (18 Nov); "Firing an employee" (18 Nov) | changed, as the brief's row says |
| G5.7(b) | changes | "Who signs an update by default: the known parties" (26 Nov) | changed, as the brief's row says |
| G5.7(c) | changes | "A fork is a fork" (27 Nov); "In force once pinned" (18 Nov) | written on the ruling on item 1 |

#### 5.7. A signer's own line

*Holds:* A signer's acts within one agreement, each naming the one before. HELD whole: the brief reads it two ways (stays in Agreements, or the lower layer's).

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G6.1 | two ways: stays / moves | "Two threads, two owners" (17 Nov); "Knots are knots: one reading, "shown after"" (27 Nov) | HELD whole until the MOR lead reads it one way |
| G6.2 | two ways: stays / moves | "Two threads, two owners" (17 Nov) | HELD whole until the MOR lead reads it one way |

#### 5.8. The keeper, and the clock

*Holds:* Where the agreement is kept: the keeper or keepers the Terms name (the agreement's official relay), vouching for the chaining only; the clock the Terms name; no condition in time without a stated anchor.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G7.1 | changes | "The place vouches for the chaining only" (26 Nov); "Agreements gets an introduction" (27 Nov) | changed, as the brief's row says |
| G7.2 | changes | "The place vouches for the chaining only" (26 Nov) | written for order only; the rest of its list (who holds what, a period passed, made public) is left out (item 6); a keeper silent where another shows the order is left out (item 5) |
| G7.4 | changes | "The place vouches for the chaining only" (26 Nov); "Ana's month ends by the clock the agreement names" (27 Nov) | changed, as the brief's row says; how Terms name their clock is left out (item 34(a)) |

*New rules here:* **N2**, resting on "The place vouches for the chaining only" (26 Nov, 17:47–17:49, with its additions); "Agreements gets an introduction" (27 Nov, 07:27–07:37); **N9**, resting on "A condition in time with no anchor is refused" (26 Nov, 18:00–18:30, both copies; their six differences left out, item 35); ""Before the close" was the simulation's" (26 Nov, 16:33). Its client half (a client refuses to sign) goes to *For Development*.

#### 5.9. The settlement

*Holds:* The settlement socket an act may be tied to.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G8.5 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |

#### 5.10. Spots, and the unknown party (the buyer who joins later)

*Holds:* Roles, spots and fillings; no update reaches a filling; what she signed binds her and the seller for as long as its words say, on the clock the Terms name.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G10.1 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G10.2 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G10.3 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G10.4 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G10.5 | changes | "A condition in time with no anchor is refused" (26 Nov, both copies); "A buyer under a replaced version: what version 2 says" (26 Nov) | changed, as the brief's row says |
| G10.6 | changes | "A buyer under a replaced version: what version 2 says" (26 Nov); "For the unknown party there is no update, only the agreement she signed" (27 Nov); "Ana's month ends by the clock the agreement names" (27 Nov) | changed, as the brief's row says |
| G10.6(a) | two ways: stays / changes | "A buyer under a replaced version: what version 2 says" (26 Nov); settled note, M22; "A power given binds its giver" (18 Nov) | written as far as both readings agree (her own assent in her own name); whether an assent made for her under a power she gave counts is held (item 18) |
| G10.7 | changes | "Ana's month ends by the clock the agreement names" (27 Nov); "Only rules in the hashed text" (17 Nov) | written; what "the anchoring of the purchase" anchors is left out (item 12) |

*New rules here:* **N5**, resting on "A buyer under a replaced version: what version 2 says" (26 Nov, 15:49–16:03); "Protect the unknown party is an Agreements principle" (26 Nov, 16:05); "For the unknown party there is no update, only the agreement she signed" (27 Nov, 07:53–07:55). The principle itself is stated in the companion (16:05 line); here only the rules that apply it; **N6**, resting on "Ana's month ends by the clock the agreement names" (27 Nov, 07:50–07:53).

#### 5.11. Legs of a sequence

*Holds:* What Agreements keeps of legs once reading reports leaves for the MICS: the call in Terms, the consent to data, the buyer's leg, the contest.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G11.1 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G11.2 | stays | "Where three rules live" (17 Nov) | as draft 25 has it |
| G11.3 | two ways: stays / moves | "Where three rules live" (17 Nov) | HELD whole until the MOR lead reads it one way |
| G11.4(e) | two ways: stays / moves | "Where three rules live" (17 Nov) | HELD whole until the MOR lead reads it one way |
| G11.5 | two ways: stays / moves | "Where three rules live" (17 Nov) | HELD whole until the MOR lead reads it one way |
| G11.6(a) | stays | "Where three rules live" (17 Nov); "Seeing and being told" (18 Nov) | as draft 25 has it |
| G11.6(b) | two ways: stays / changes | "Seeing and being told" (18 Nov) | HELD whole until the MOR lead reads it one way |
| G11.6(c) | two ways: stays / moves | "Where three rules live" (17 Nov) | HELD whole until the MOR lead reads it one way |
| G11.7 | stays | "Where three rules live" (17 Nov) | as draft 25 has it |
| G11.8 | stays | "Where three rules live" (17 Nov) | as draft 25 has it |
| G14.5(e) | two ways: moves / stays | "Where three rules live" (17 Nov) | HELD whole until the MOR lead reads it one way |

#### 5.12. Forks

*Holds:* One fork for every competing change; both sides stop; how a fork is resolved; strangers who relied; a client's duty.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G12.1 | changes | "A fork is a fork" (27 Nov); "Delegation is a leftover" (18 Nov); "Who signs an update by default: the known parties" (26 Nov) | written to the ledger's words; the test for "competing to change the same state" is left out (item 8) |
| G12.2 | stays | "No release by a fork or a key" (18 Nov); "A fork is a fork" (27 Nov) | as draft 25 has it |
| G12.3 | changes | "A resolve with nothing to resolve: "not shown", with the reason" (26 Nov); "Who signs an update by default: the known parties" (26 Nov); "A fork is a fork" (27 Nov) | written for forks of a line; how a fork not of a line is resolved in bytes is left out (item 7) |
| G12.4 | stays | "The gate and the pin; a fork, not a race" (26 Nov) | as draft 25 has it |
| G12.5 | stays | "A fork is a fork" (27 Nov); "A missing act stays unchecked: no door around it" (26 Nov) | as draft 25 has it |
| G12.6 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G12.7 | stays | no entry (the brief: draft 25's text stands) | written as draft 25 has it; whether a resolving update needs the pin is left out (item 10) |
| G12.8 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |

*New rules here:* **N8**, resting on "A fork is a fork" (27 Nov, 07:01–07:08).

#### 5.13. Knots: what an act names, and "shown after"

*Holds:* What an act is read against; any fingerprint in a field is a knot; the one reading "shown after"; a reader's own anchoring only as the reader's.

| draft 25 rule | the brief's sort | rests on (heading, date) | in draft 26 |
|---|---|---|---|
| G13.1 | two ways: stays / changes | "Knots are knots: one reading, "shown after"" (27 Nov); "The words of Terms are a Text act" (26 Nov) | HELD whole until the MOR lead reads it one way |
| G13.2 | stays | no entry (the brief: draft 25's text stands) | as draft 25 has it |
| G13.3 | changes | "Knots are knots: one reading, "shown after"" (27 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | changed, as the brief's row says |
| G13.4 | changes | "A condition in time with no anchor is refused" (26 Nov, both copies); "Whose place counts; protect the unknown party, as a principle" (26 Nov) | changed, as the brief's row says |

*New rules here:* **N7**, resting on "Knots are knots: one reading, "shown after"" (27 Nov, 07:38–07:49); "A missing act stays unchecked: no door around it" (26 Nov, 18:34–18:57). The one-line reading is the MOR lead's (ruling on item 28).

#### Not in `draft-26.md`: the 29 rules that leave

TRACED to the brief's sort (its section 6); COUNTED, `gen.py`.

- **Go (3)**, written nowhere: G4.8(f), G5.5 ("Delegation is a leftover", 18 Nov); G10.6(b) ("A buyer under a replaced version: what version 2 says", 26 Nov).
- **Move to the MICS (13)**: G7.3, G8.1, G8.2 (moving changed: its last clause meets "A condition in time with no anchor is refused", 26 Nov), G8.3, G8.4, G9.1, G9.2 ("How a reader answers goes to the MICS", 18 Nov); G11.4, G11.4(a) to (d), G11.6 ("Where three rules live", 17 Nov).
- **Move to Envelopes (13)**: G14.1, G14.2 (changing there), G14.3, G14.3(a) to (d), G14.4, G14.5, G14.5(a) to (d) ("Where three rules live"; "The holder at the act cited", 17 Nov).
- **Held where they would land** (counted among the 95 above): G6.1, G6.2 in §5.7; G11.3, G11.4(e), G11.5, G11.6(b), G11.6(c), G14.5(e) in §5.11; G5.6(f) in §5.6; G13.1 in §5.13. If the MOR lead reads a "stays or moves" row as moving, it joins the list it moves to in section 8.

**New rules not placed in `draft-26.md`:** N3 lands in part 4.1 (a value form, not a validity rule). N10 is not placed: the ledger's line says "nothing is added to Identity or Agreements" ("Signing an agreement relies on its words", 26 Nov, 18:30), and the brief lists where it is written as unsaid (its item 17): section 7, and *For Development* in section 8.

### §6. Tasks handed to cMIPs

*Holds:* the eight sockets K1 to K8, each with its one question, what its cMIP accepts and produces, where the output is used, and whom it makes you trust, as draft 25's section 5 table has them. TRACED to the brief's "Outside the 124" paragraph:

| Task | In draft 26 | Rests on |
|---|---|---|
| K1 Body | changes: its output "for a delegation" goes; it reads the words' Text act | "Delegation is a leftover" (18 Nov); "The words of Terms are a Text act" (26 Nov); settled note Q24, Q25 |
| K2 In force | stays: read for the first version and for who fills a spot, not for an update | settled note M11; "Who signs an update by default: the known parties" (26 Nov) |
| K3 Power | stays | — |
| K4 Update condition | changes: no longer asked about a filling | "A buyer under a replaced version: what version 2 says" (26 Nov); the check's row "§5 K4 row" (as the brief cites it) |
| K5 Spot | stays: gives the version a filling was earned under | as the brief has it |
| K6 Control | stays or changes with G11.3 (HELD with it) | "Where three rules live" (17 Nov) |
| K7 Kind | stays | — |
| K8 Data | stays | — |

Draft 25's sections 5.1 to 5.3 (five things built on the blocks; what can be said in the language; modules): rules on what a socket's cMIP may lean on stay in the text; the explanations (*five things built on the blocks*, *what can be said*) are reasoning, for the companion. INFERRED. What a cMIP declares it needs (a clock, a keeper), which N9's verifier half reads, is listed for Development (item 34(b)).

### §7. Open technical parameters

*Holds:* the values the rules depend on and draft 26 does not fix. Two readings of what sits here, neither chosen (INFERRED): (i) the MIR shape keeps a short list of open technical parameters in the hashed text (the assignment's MIR shape, from `spec/README.md`); (ii) "The history, the open lists and the reasons go into companion documents beside it" ("Only rules in the hashed text", 17 Nov), so the list is the companion's. Of draft 25's P1 to P21, the entries reach P4 (one place or several: answered, several keepers, N2), P9 (what a fork removes: N8 widens it), P11 and P16 (dates, the clock: item 34(a)), P1 (the default for `in_force`: G4.1 on the ruling on item 1). TRACED for P4 and P9 by the entries named; INFERRED for the others.

## 4. The words

Every word `draft-26.md` defines, each in one place: its group in part 3 of the text (section 3 above). *From* is the draft 25 definition (D25, its section 2) or the ledger entry, by heading and date. Words that only change "place" to "keeper" in their text are marked so. TRACED unless marked.

### 3.1 The acts and their parts

| Word | From |
|---|---|
| act; fingerprint; grammar rule (the validity rule); task, socket; module; cMIP; rule (one people choose) | D25, as it has them |
| Terms; agreement | D25, with "There is no unsigned act: the author is a known party" (27 Nov): "terms are record, agreement is law, right?" |
| Statement; assent; counter signature; signature of an agreement | D25 |
| the words (of Terms), named by their Text act's act id | **new**: "The words of Terms are a Text act" (26 Nov, 16:25–16:28) |
| the set of acts | **new**: "One way to name a set of acts, in Agreements" (26 Nov); settled note M21 (empty set, no knot by itself: the note's reading, ledger silent, item 23) |
| report, call; payment; settlement; vow; contest; data cMIP | D25; the report itself is the MICS's block (draft 25 already uses it, defines it not) |
| leg report | D25; HELD with G11.3 |

### 3.2 Parties

| Word | From |
|---|---|
| party; spot (with its five kinds); fill, filling; rights; receiver; receiver for an act; work; shares; service, deal; bound; power; constitution, executive, judicial | D25 |
| author | D25, with "There is no unsigned act: the author is a known party" (27 Nov) |
| **known party** | **new**: "Who signs an update by default: the known parties" (26 Nov, 17:51–17:56, the MOR lead's reading), on his "only the known parties can" ("A buyer under a replaced version", 26 Nov, 15:52); "There is no unsigned act" (27 Nov). Which version fixes them is left out (item 2) |
| **unknown party** (said of a filling) | **new**: "A buyer under a replaced version: what version 2 says" (26 Nov); "For the unknown party there is no update, only the agreement she signed" (27 Nov); settled note M15 ("A filling is any filling of a role, whenever made": the note's reading, ledger silent, item 19) |
| buyer; offer | D25 |
| delegation | **goes**: "Delegation is a leftover" (18 Nov) |

### 3.3 Versions, updates and forks

| Word | From |
|---|---|
| version (the original, the last version); chain; sequence; succession; leg; doer, receiving side; line; built on a tip; resolve, resolving update; set aside; condition (update condition) | D25 |
| update | D25, its "signed by all the parties that needed to sign it" changing with the gate (INFERRED, from "Valid means in force", 26 Nov, 16:19: "no other assent is asked") |
| **gate**; **pin** | **new**: "The gate and the pin; a fork, not a race" (26 Nov, 17:39–17:46) |
| **valid**, not valid | D25, with "Valid and in force, two words, two jobs" (26 Nov, 18:00): the gate's answer only |
| **in force** | D25, with "Valid and in force, two words, two jobs" (26 Nov): gate and pin; for a first version, the ruling on item 1 |
| **fork** | D25, widened: "A fork is a fork" (27 Nov, 07:01–07:08): two acts competing to change the same state, no order shown; the test for "the same state" left out (item 8) |
| **late** (late update) | D25, with "Knots are knots: one reading, "shown after"" (27 Nov) and settled note M5 (late: "shown after the version that replaced the one it names") |
| never ended | D25; the two ways inside G4.9 held with it |
| apply, no longer applies | D25, changing: a filling's term ends by the clock, not only "through an update" ("Ana's month ends by the clock the agreement names", 27 Nov) |
| triggered; join | already "no longer a term" in D25: the note is history, for the companion |

### 3.4 Order and time

| Word | From |
|---|---|
| name (cite) | D25 |
| **knot** | D25 (the word his), widened: "Knots are knots: one reading, "shown after"" (27 Nov): any fingerprint in a field of any act held, of any layer |
| **shown after** | **new**: "Knots are knots: one reading, "shown after"" (27 Nov, 07:38–07:49); the one-line reading is the MOR lead's (ruling on item 28), marked so in the companion |
| **keeper** (replacing **place**) | **new word, old field**: "The place vouches for the chaining only" (26 Nov, 17:47–17:49 and its additions): "the agreement's official relay, named in its Terms, vouching for the chaining only, defined in draft 26 as that and nothing more"; "Agreements gets an introduction" (27 Nov) |
| **clock** | D25, with "Ana's month ends by the clock the agreement names" (27 Nov): "The clock specified in the agreement and its anchoring."; how Terms name it left out (item 34(a)) |
| **anchoring** | D25, changing: a reader's own anchoring answers only as the reader's ("Whose place counts; protect the unknown party, as a principle", 26 Nov; settled note M20); a condition in time needs a stated anchor ("A condition in time with no anchor is refused", 26 Nov) |

### 3.5 What relays do

| Word | From |
|---|---|
| **lodge** (an uploader lodges an act at a relay); **relay** (the relay relays it); **fetch** (a client fetches it) | **new**: "Agreements gets an introduction" (27 Nov, 07:27): "Agreed. An uploader lodges, the relay relays, and the client fetches." Whether these three are defined here or in a text below Agreements is section 10, row 6 |

### 3.6 The verifier and its answers

| Word | From |
|---|---|
| client; verifier | D25 |
| answers: shown; **not shown** (always with its reason); **unchecked**; invalid; disputed | D25's "Answers" (valid, in force, fork and late, also answers, are defined once, in 3.3), with: "A resolve with nothing to resolve: "not shown", with the reason" (26 Nov: "Every refusal states its own reason"); "A hand count is the client's choice" (26 Nov) and "A missing act stays unchecked: no door around it" (26 Nov) for unchecked; "The place vouches for the chaining only" (26 Nov, 17:49) for "not shown" where keepers disagree; settled note M12 (unchecked for a reader that lacks something) |
| rejected | not an answer word in the settled note (M5); "Version 3 is the one the network needs to reject" in his words: left out (item 24) |

**Count** (COUNTED, `words.py`): 90 words and phrases in the rows above, none in two rows; each of the eleven words the assignment names (lodge, relay, fetch, keeper, shown after, late, fork, valid, in force, not shown, unchecked) has its row. Of them, new in draft 26 (a **new** row): the words, the set of acts, known party, unknown party, gate, pin, shown after, keeper, lodge, relay, fetch; one goes (delegation); "place" is renamed keeper; the others are draft 25's, some widened or changed as their row says.

## 5. `encoding-3.md`, section by section

Encoding 2's layout is kept (INFERRED). For each entry: stays, changes or goes, with its source. *[open]* marks a byte choice nobody has made: listed, not picked.

| Encoding 2 | In encoding 3 | Source |
|---|---|---|
| In plain words; 1. How to read | changes: draft 26 named, three answers kept apart as encoding 2 does | INFERRED |
| E1 An everyday act | stays | TRACED: brief, no row reaches the act format |
| E2 Spec hash and type | changes in value only: draft 26's spec hash, computed as E2 says, once the text is final | INFERRED, from draft 25's own "a later draft is a new specification, with a hash of its own" |
| E3 No `objects`, no `acks` | stays: N10's reliance is a separate witness act (Identity rule 10), not an `acks` on an Agreements act | TRACED: "Signing an agreement relies on its words" (26 Nov) |
| E4 A closed map | stays | INFERRED |
| E5 A fingerprint (its table) | changes: the row "the body's words" (work hash, [lead]) goes; the words are named by the Text act's act id, as any act; a row or rule for the set of acts is new (below) | TRACED: "The words of Terms are a Text act" (26 Nov): "The hash choice for loose words goes." |
| E6 An identifier of a place or a clock | changes: "place" becomes keeper; the clock's part waits on item 34(a) | TRACED: "The place vouches for the chaining only" (26 Nov) |
| E7 A socket | stays | INFERRED |
| E8 The body | changes: `words` is the Text act's act id | TRACED: as E5 |
| E9 A party; E10 A role; E11 `for`, to whom; E12 The receiver | stay (G1.4's held clause reads no field) | INFERRED |
| E13 Authors | stays in bytes; item 3 (an author named by role) is a reading, not a byte | INFERRED |
| E14 A power; E15 A Statement's kind; E16 A call; E17 `previous`; E18 Lists | stay | INFERRED |
| E19 Presence (Terms) and the Terms map | changes: key 8 becomes the keeper field; key 13's comment, the default, becomes the known parties; key 6 on an update left unread with a note (settled note Q7); keys 11 and 12 stay while G14 moves | TRACED: N2; G4.11(e); Q7. INFERRED: keys 11, 12 |
| E20 Presence (Statement) | stays | INFERRED |
| 6. The report, E21, E22 | moves with the report block to the MICS | TRACED: "Where three rules live" (17 Nov) |
| 7. Among the acts held: E23 | HELD with G6.1 | TRACED: brief, G6.1 two ways |
| 8. One signing, E24 | stays | INFERRED: G1.2's change reads the power, not the matching |
| 9. What the checker answers | changes: N9's invalidity added to the order of "What Terms show by themselves", if the checker can see a cMIP's declared needs from bytes alone (item 34(b)) | TRACED: "A condition in time with no anchor is refused" (26 Nov) |
| 10. Draft 25's section 10, item by item | becomes draft 26's: the encoding tasks of draft 26, item by item | INFERRED |
| 11. The choices marked [lead] | carried, each re-read; the body's work hash goes | TRACED: E5 above |
| 12. What changed from encoding 1 | becomes *What changed from encoding 2* | INFERRED |

**New in encoding 3**, each with its source:

1. **The set form** (N3). The ids as 32 bytes, sorted, repeats dropped, hashed with a label; a bare fingerprint, the field saying it is a set; the empty set has the label and no members; no knot by itself. TRACED: "One way to name a set of acts" (26 Nov); settled note M21, F12, F13. The impact sheet: one recipe, one label, a vector file of 5. *[open]*: the label's bytes; whether it is a row of E5 or an E-rule of its own (the impact sheet gives both: "one row of encoding 2's E5 table or one new E-rule"); which fields may hold a set's value (`relies_on` at least, by the impact sheet's fifth vector, INFERRED).
2. **The words named by act id** (N4). `body`'s `words` is the Text act's act id. TRACED: as E5. *[open]*: whether a `words` that names an act the verifier does not hold is unchecked or simply not read (settled note Q24: "The verifier need not hold the words to answer the grammar's questions"; INFERRED that this answers it, section 10, row 11).
3. **The keeper field or fields** (N2). One keeper or several, by identifier. TRACED: "Yes, they should." (26 Nov, 17:49). *[open]*: one form for one and several (a list always) or two forms; whether the list is a set (sorted, repeats dropped) or ordered; what a keeper's identifier is the hash of (encoding 2's E6 [lead] still: "no layer gives one yet").
4. **The clock field.** *[open]*, and more than bytes: whether key 9 stands against the 17 November cut of G7 (item 34(a)).

## 6. `draft-26-companion.md`, section by section

1. **The spine: "What is the minimum two people have to write".** TRACED: "A companion for Agreements" (17 Nov): "The how we got there needs to build around the research we ran on agreeing. « What is the minimum two people have to write »"; and "It's also a good place to state that what the review found was MOR other layers and the sockets." Built around the research on agreeing; ends with what the review found.
2. **The evidence-and-accounting line.** TRACED: "An evidence and accounting layer" (17 Nov): the stranger's "The record becomes an evidence and accounting layer: it proves who owes what and who lied, and it moves nothing. Its only force is what a proven liar stands to lose."; his "That bit has to complement the opening definition of MOR". The entry places it in the MICS when the MICS is rewritten; the companion quotes it as the record and points to that placing (INFERRED: it is the MICS's to place, so the companion only quotes it).
3. **The principle: protect the unknown party.** TRACED: "Protect the unknown party is an Agreements principle" (26 Nov, 16:05): "stated in the Agreements companion, applied by Agreements' rules". His words: "Protect the unknown parties.", "It is worth turning it into a principle. Protect the unknown party", "It’s an agreements principle", "There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?" With settled note F16 (G10.6(a) as a guarantee no module may break), marked the lead's.
4. **Why the text is shaped so**: the introduction's points, each with his words (section 3, §0); the language, not the solution (15:38); the layers split so relays can specialize (27 Nov, 07:37); the three verbs.
5. **The reasoning, rule by rule**, in draft 26's section order: for each changed rule (39 by the brief) and each new rule (N1 to N9; N10 with its section 7 status), the exchange that made it, his words quoted, the lead's line labelled. Draft 25's *lie exposed / protects* lines come here (INFERRED).
6. **The readings marked as the MOR lead's.** Item 1, the pin for a first version (the ruling, quoted); item 28, "shown after" (the ruling: ""shown after" stays the lead's reading, marked so in the companion"), against his last words "Knots a cross acts by nature, and possibly cross layer." and his question "are we defining how knots should be leveraged?"; item 31, the wording of G4.8 and G4.7; item 32, the stall ("only someone the update condition accepts can make it"); item 33, the default signers ("the MOR lead's reading"). TRACED: the brief's items; the rulings.
7. **The stated costs.** Draft 25's section 7, all 38, move here (TRACED: "Only rules in the hashed text"; COUNTED, `costs.py`). Those an entry reaches (INFERRED): "Without a place, no scarcity and no freshness" and "Ownership is as wide as its place" (keeper); "Order without an anchoring is partial" (N9); "A fork of Terms holds the agreement where it was" and "Honest forks" (N8); "Bound by an update one did not sign" (no longer a filling, N5); "Withdrawing before in force" (the pin, ruling on item 1); "An offer that stops taking new people" (the known parties may close the offer, item 29); "What an agent signed stays signed" (delegation goes); "The baker is as the envelope says" (moves with G14: Envelopes' or here, section 10, row 8). New costs, each the MOR lead's or his, as the ledger has it: two keepers, two dependencies (26 Nov, 17:49, the lead's); one more act per agreement for the words (26 Nov, 16:27, the lead's); one more round of signatures for a bare agreement ("In force once pinned", 18 Nov, the lead's); the stall, a forced deadlock ("A missing act stays unchecked", 26 Nov); the seller bound to a filling for her term, "a problem that really only impacts subscriptions models I think" (his, 27 Nov, 07:53).
8. **The scenarios.** The ledger's (Ana, Ben and Carla; Ana's month; version 3 naming version 1; two keepers that disagree; the silent signer; the stall) and the impact sheet's **22 new vectors**, by its line (COUNTED from its totals row and its sections): line 1, 3 (a version 3 naming version 1 with a Text act, a piece, a private act in `relies_on`); line 6, 2 (a resolve in an unforked line; a Terms resolving update with no fork); line 7, 2 (a buyer's assent to a replaced version, with and without her cMIP); line 8, 3 (an offer updated by its maker alone; the filler not bound; K5 lacking); line 9, 1 (a condition that answers valid leaves her rights unchanged); line 10, 1 (her own assent on a later version); line 16, 5 (the set recipe); line 18, 3 (valid by a condition; late by knots; an update's own `in_force`); line 19, 2 (Terms naming a Text act; that act in a late update's `relies_on`). The impact sheet covers the exchanges up to "Wave two" only; each vector's expected answer is re-read against the later entries (the pin, the keeper, the known parties, the fork, the knots, the month) by the session that writes it, and where an answer turns on a left-out item it is listed, not chosen. INFERRED.
9. **The trace, rule by rule.** One row per rule of draft 26: its draft 25 number, the brief's sort, its ledger entry by heading and date, the settled-note row where one carries it. Headings as the ledger has them, never the notes' headings that are no ledger heading (the brief's item 27). TRACED: brief, item 27.
10. **The table from draft 25's numbers to draft 26's**, and the 29 rules that left, with where each went.
11. **Archaeology, at the back.** Draft 25's history paragraphs (in G4.8(g), G4.11(g), G5.2, G5.6(e), G10.7, G12.4, and its front matter on drafts 18 to 24), draft 25's open lists (its sections 8 to 10), and the notes "no longer a term". TRACED: "Those old drafts should be buried deep, only for people who wish to do some archeology…" (26 Nov); "Only rules in the hashed text" (17 Nov).

## 7. Left out

Every point of the brief's unsaid list (its section 7) that neither the ledger nor a note answers, with what draft 26 will therefore not carry. Nothing chosen. The rulings answer items 1, 4 and 28; the ledger or a note answers the rest (section 11 says how each was judged). COUNTED, `leftout.py`: **19 of the 35 items left out, wholly or in part**; they touch 20 rules (14 of draft 25, by number, and 6 of the new N rules).

| Item | What draft 26 will not carry | Rules touched |
|---|---|---|
| 2 | Which Terms "when made" fix the known parties, and whether a party a later version adds is known | G4.8(a), G4.11(e), the word "known party" |
| 3 | Whether an author named by role is a known party | G3.1 (in part) |
| 5 | With several keepers, whether the pin needs every keeper to show the order, or those that show it where none disagrees | G7.2, N2 |
| 6 | What a keeper answers beyond order (G7.2's "what is whole, who holds what, whether a period has passed, or whether something was made public"): (i) nothing, the keeper being "defined in draft 26 as that and nothing more"; (ii) a period passed, the keeper being one of the Terms' anchors (the 27 Nov line: "a keeper, a clock to anchor to, or both") | G7.2 |
| 7 | How a fork that is not of a line (a completing assent against a counter signature) is resolved in bytes | G12.3, G4.10 |
| 8 | Which acts compete "to change the same state": a list or a test; whether an agent's act against the end of its power is one | G12.1, N8, G5.4 |
| 10 | Whether a resolving update must itself be pinned | G12.3, G12.7 |
| 11 | How long a version binds a filling whose words state no term | G4.11(f), N6 |
| 12 | Which act "the anchoring of the purchase" anchors (the assent, the payment, the proof) | G10.7, N6 |
| 13 | What a verifier shows of an agreement the known parties dissolved among themselves while a filling's version still binds, against G4.9's "MUST NOT answer that Terms or an agreement have ended" | G4.9 |
| 17 | Where N10's client reliance is written: beside G12.8 in draft 26, or with the other client duties outside it (the ledger's line: "nothing is added to Identity or Agreements") | N10 (whole) |
| 18 | Whether an assent made for her under a power she gave counts as hers for G10.6(a) (settled note M22 against the 26 Nov line's "in their own name") | G10.6(a) (in part) |
| 21 | Whether her client relies on the other parties' assents too (settled note F4) or on the words' Text act only, as the entry says | N10 |
| 22 | That private words' key is delivered to each party first (settled note F10): the content is the note's, but where client duties are written turns on item 17 | N10 |
| 24 | Whether "rejected" is a verifier's answer for a late update (his "Version 3 is the one the network needs to reject") or only the checker's word (settled note M5) | the answers (3.6) |
| 29 | The line's list of what the known parties may still do ("close the offer, or dissolve it among themselves"), beyond his "There is no valid update for her anymore. Only a valid agreement" | N5, G4.9 |
| 30 | The line's "Terms state their anchors (a keeper, a clock to anchor to, or both)" as a rule for all Terms, and its "stands for the agreement's own versions", beyond his "valid update does not apply in the same way" | N6, N9 |
| 34 | (a) how Terms name their clock: whether the `clock` field stands against the 17 November cut of G7; (b) whether a cMIP's declared needs are written in Development or in each cMIP's text (both sent back to him by the settled note) | G7.4, N9, E6, the checker's order (encoding 3, section 9) |
| 35 | The six places where the two copies of "A condition in time with no anchor is refused" differ (whether "not shown" is withdrawn for such conditions; invalid "as an act missing what it needs"; "a client warns before signing"; and the rest, as the brief lists them); N9 is written from his words and what both copies share | N9 |

**Also held** (not from the unsaid list; the brief's two-way rows, which no ruling reads one way): 10 rules whole, 4 in part (section 3, §5). With N10, **11 rules wait whole** (COUNTED, `gen.py`).

## 8. What draft 26 hands to other texts

Listed, not written.

**For Identity**
- Rule 34 and the keeper's record: Identity draft 16 gives an act standing where "a named keeper recorded it before recording the rotation (Agreements: the keeper record, type 2, and Agreements rules 41 and 42)", says "Keepers MUST (see Agreements)", and has "Agreements' exception for a keeper's record" (Agreements rule 42). Draft 26's keeper is the pointer and its one rule, and no keeper record. On the ruling on item 4, the keeper's record waits for draft 26 to exist; then Identity's rule 34 and its two references name what draft 26 gives. TRACED: Identity draft 16, rule 34 and section 3; the ruling.
- Identity's pair "Agreements rule 6, and "Made before, made after", 4" (a collective's line), which names draft 24. TRACED: Identity draft 16.
- A key change continues the signer's line and never starts a fresh one; and, if G6.1 and G6.2 are read as moving, the signer's line. TRACED: "Two threads, two owners" (17 Nov).
- Nothing added for N10: the witness act (rule 10) is the client's tool. TRACED: "Signing an agreement relies on its words" (26 Nov).

**For Envelopes**
- The 13 rules of the baker (G14.1 to G14.5(d)), G14.2 changing there; and G14.5(e) if read as moving. TRACED: brief.
- What Agreements still asks of Envelopes (the first brief's item, carried), and the one question Agreements keeps: "Agreements asking only whether the current holder is a party" ("Where three rules live", 17 Nov). TRACED.
- The three verbs, when the text is next touched: "store and pass on" (Envelopes draft 12) and the other words for what relays do give way to lodge, relay, fetch. TRACED: "Agreements gets an introduction" (27 Nov, 07:27 line).

**For the MICS**
- The 13 rules: G7.3, G8.1 to G8.4, G9.1, G9.2, G11.4, G11.4(a) to (d), G11.6; and G11.3, G11.4(e), G11.5, G11.6(c) if read as moving. TRACED: brief. With the condition in "How a reader answers goes to the MICS" (18 Nov): "the scribe checks, when the MICS is rewritten, that each of the seven holds outside Agreements, and brings back any that does not."
- The report block, encoding 2's E21 and E22 with it. TRACED: "Where three rules live" (17 Nov).
- The evidence-and-accounting sentence beside MOR's opening definition. TRACED: "An evidence and accounting layer" (17 Nov).
- The MICS v37's "another way to the result" for a collective's way out does not outlive draft 25; the MICS is rewritten after draft 26. TRACED: settled note M24.
- The answer words across layers (where "invalid" stops, draft 25's P19; "rejected", item 24). INFERRED.

**For Development**
- What a cMIP declares it needs (a clock, a keeper), which N9's verifier half reads: settled note Q26 ("a line for Development to carry"); item 34(b). TRACED.
- The common cMIPs a verifier or client should hold, "the MOR lead's wording, for Development, not yet asked" ("Named signers and buyer by assent stay cMIPs", 26 Nov). TRACED.
- Client conformance, wherever client duties are written (item 17): N10's reliance on the words; private words' key delivered first (F10); a client refuses to sign Terms whose words speak of time with no anchor (N9's client half); clients warn, and tools that check words against fields are built above the core (M28; "Tools that verify that text and agreement state the same thing will be needed", 26 Nov). TRACED to those rows.

**For Text** (not asked for; listed because N4 leans on it): a Text act, public or private, that Terms name by act id and that comes first ("Text comes first as a rule since agreement needs to point to it", 26 Nov, 16:28). Nothing is asked of Text draft 11 that this session found missing. INFERRED.

## 9. The session plan

Ten sessions after this one; the scribe turns each into a prompt, and the MOR lead may change any. Each writes on this branch, one part, and checks it before the next starts. Before the first: the MOR lead's answer to which reading each held row is written on (the first question in the report), since held rows have slots in M3, M4, M5 and M7. INFERRED throughout.

| Session | Writes | Needs from before |
|---|---|---|
| M2 | `draft-26.md`: §0 the introduction, §1 Purpose, §2 Dependencies, §3 Definitions (all of section 4 of this outline) | this outline, read by the MOR lead |
| M3 | §4 The data each act carries (4.1 with the set form, 4.2, 4.3); §5.1, §5.2, §5.3 | M2's definitions, by their final words |
| M4 | §5.4 The first version; §5.5 Updates: the gate and the pin (31 rules and N1; the largest share) | M3's fields (`condition`, keeper, `in_force`) |
| M5 | §5.6 Who is bound; §5.7 A signer's own line (if read one way); §5.8 The keeper, and the clock (with N2, N9); §5.9 The settlement | M4's gate and pin, which G5.1(c), G5.4 and G5.7(c) cite |
| M6 | §5.10 Spots, and the unknown party (with N5, N6); §5.11 Legs of a sequence | M5's keeper and clock, which N6 counts on; M4's G4.3 |
| M7 | §5.12 Forks (with N8); §5.13 Knots and "shown after" (with N7); §6 Tasks; §7 Open technical parameters | every earlier section, since "shown after" and the fork are cited throughout; the cross-references are then closed |
| M8 | `encoding-3.md`, whole | `draft-26.md` complete (fields, invalid cases, the checker's order) |
| M9 | `draft-26-companion.md`, sections 1 to 6: the spine, the evidence line, the principle, the shape, the reasoning rule by rule, the marked readings | `draft-26.md` complete; may run beside M8 |
| M10 | the companion, sections 7 to 11: stated costs, scenarios (the 22 vectors re-read), the trace, the number table, archaeology | M9; M8 for the vectors' bytes |
| M11 | the whole check: every quotation against the ledger by script; each word defined once; every cross-reference; the spec hash computed; a blind reader on the three files | M2 to M10 |

## 10. Rows to check

Where the brief looks wrong to this session, with the reason. Nothing corrected; the outline follows the brief.

1. **Item 9 may be answered.** The brief lists the answer word inside a widened fork as unsaid. "A fork is a fork" (27 Nov) says the effect of "What a race stops" "stands under the word fork", and the settled note's M5 gives fork as "two competing, none shown after the other". Read so, the word is "fork"; this outline writes it so, and marks it here. INFERRED.
2. **Item 15.** The brief lists whether the introduction is in the hashed text as unsaid; the 27 Nov line says "draft 26 opens with an introduction", and the assignment puts it in `draft-26.md`. Against it stands "a hashed text holds its rules and nothing else" (17 Nov). Followed as the assignment says. TRACED.
3. **N10 is listed as a new rule of draft 26**, but its entry's line says "nothing is added to Identity or Agreements" (26 Nov, 18:30). The brief's own item 17 leaves where it is written unsaid. This outline does not place N10 (section 7). TRACED.
4. **G4.7(c)'s two ways** come to one rule under "Knots are knots" (any missing act named in a field is unchecked); the two readings differ only on whether that is a change. Sorted "changes", as the brief has it. INFERRED.
5. **The brief's "Outside the 124"** says encoding 2 "changes nowhere else" than the body and a new value form, citing the impact sheet, which stops at "Wave two"; the keeper, one or several (26 Nov, 17:49), changes key 8 and E6 as well. INFERRED.
6. **The three verbs** are MOR-wide ("give way to these when the texts are next touched"); the assignment lists them among draft 26's words. Two readings: defined in draft 26 (where the exchange was had), or below it, where relays are defined, and used by draft 26. The outline gives them one row (3.5) and lists them for Envelopes. INFERRED.
7. **Item 4's ruling and the definition of keeper.** Identity reads a keeper record from Agreements draft 24 today; until rule 34 is rewritten, Identity names a record draft 26 does not have. The ruling accepts this; noted so the gap is seen. TRACED.
8. **G14's fields.** The brief moves all 13 G14 rules to Envelopes and says nothing of the fields `envelope` and `envelope_at`, which those rules read, or of "Agreements asking only whether the current holder is a party" (17 Nov). The outline keeps the fields and lists the question; neither is sorted in the brief. INFERRED.
9. **G11.6 and G11.4 move while sub-clauses stay or are two ways** (G11.6(a) stays; G11.6(b), G11.6(c), G11.4(e) two ways). A sub-clause without its clause needs a home of its own in §5.11; the brief does not say which. INFERRED.
10. **The 13 rules moving to the MICS** have no written home until the MICS is rewritten after draft 26 (settled note M24); between the two, a verifier of draft 26 has no text for "say who said it" and "unchecked is not passed". INFERRED.
11. **Settled note Q24** ("The verifier need not hold the words to answer the grammar's questions") may answer encoding 3's open point on a `words` act not held; listed as open there, not chosen. INFERRED.
12. **Item 34(a)**: his words of 27 Nov, "The clock specified in the agreement and its anchoring.", say that Terms specify a clock, which may answer more of item 34(a) than the settled note sends back; left out as the note asks. INFERRED.

## 11. The record

**How the file was made.** This session read, whole: `CLAUDE.md`; the brief (pull request 289); the ledger on main, its stint of 26 November (every entry of 26 and 27 November), its stint of 20 November from "A late version 3 is rejected" to "Wave two", and, of the stint of 10 to 20 November, the entries the brief cites ("Two threads, two owners", "Where three rules live", "The place is a pointer", "Only rules in the hashed text", "A companion for Agreements", "An evidence and accounting layer", "In force once pinned", "How a reader answers goes to the MICS") with every heading of the rest; the two notes of 27 November; draft 25's front matter, sections 1 to 3 (definitions and field tables), section 5's table, the headings of sections 6 to 10 and section 8.1; encoding 2's sections 1 to 4 and its headings; the impact sheet's table, its vector costs and totals; `spec/README.md`'s LATEST list; Identity draft 16 where it names keepers, rule 34 and the witness act; Envelopes draft 12 where it says what relays do. Not read: draft 25's section 4 rule by rule (the brief's sort and one-lines were used instead), its sections 6 to 10 in full, Text draft 11, Fable §5.1's attack, the check (pull request 266). **How each unsaid item was judged** answered or left out: answered where the ledger's words, an "Arrived at" line not going beyond his words, or a note with the ledger silent gives the rule (items 9, 14, 15, 16, 19, 20, 23, 25, 26, 27, 31, 32, 33); answered by the rulings (1, 4, 28); left out where the sources can be read two ways or are silent (section 7). The judgement on each is this session's (INFERRED).

**What was counted, by which script** (Python 3, in this session's scratch space, not in the repository: the assignment touches one file):

- `sortdata.py`: reads the brief's table of 124 rows: 41 stays, 39 changes, 26 moves, 3 goes, 15 two ways, the brief's figures.
- `gen.py`: holds this outline's placement; checks every one of the 124 rules is placed exactly once (in a section of draft 26, or among the 29 that leave); generates section 3's thirteen tables. Result: 95 in draft 26, 3 go, 13 to the MICS, 13 to Envelopes; 10 held whole, 4 held in part.
- `words.py`: counts section 4's rows by kind and checks no word appears twice.
- `costs.py`: counts draft 25's stated costs in its section 7: 38.
- `leftout.py`: counts section 7's items (19) and the distinct rules they touch.
- `quotes.py`: checks every quotation of eight characters or more in this file against the ledger, the two notes, the brief, draft 25, encoding 2, Identity draft 16 and the assignment's rulings.

**What the blind reader could not follow.** A subagent that had seen neither the ledger nor the assignment was given section 1 and section 3 alone and asked: *where would you look for the rule on who signs an update, on where an agreement is kept, and on what a buyer keeps when the terms change?* It found all three: §5.5 (G4.8(a), G4.11(e)), about 80% sure; §5.8 (G7.1, N2, the keeper field in §4.2), about 65%; §5.10 (G10.6, G10.6(a), N5, G10.7, N6), about 75%. What it stumbled on, and what was done:
- Who signs an update seemed spread over §5.4, §5.5 and §5.6, since rows in all three rest on "Who signs an update by default: the known parties": section 1 and §5.5's *Holds* line now name G4.8(a) and G4.11(e) as the default, the others citing it.
- §5.8's *Holds* line spoke only of "vouching for the chaining only", never of where the agreement is kept: it now says so.
- §5.10's heading said "unknown party", not "buyer": the heading now adds "the buyer who joins later".
- Draft 26's section numbers clashed with this outline's own (its "section 7" could be either): draft 26's sections are now written with §, the outline's without, and the introduction is §0, not "I".
- **Not fixed**: §0's item 3 still gives two readings of where the keeper is first mentioned (introduction, or the keeper's definition or rule), which is the source's, not the layout's; §0's item 4 gives two readings of "where Rely is"; the rows say *changed, as the brief's row says* and so do not say what a rule will say, since this outline writes no rule text (the brief's row says it); the tables follow draft 25's numbers, not plain questions; and the words it could not follow without outside knowledge (gate, pin, knot, "shown after", spot, filling, socket, cMIP, anchoring, known and unknown party, the marks, the item numbers) are defined in section 4 or the brief, which it was not given.

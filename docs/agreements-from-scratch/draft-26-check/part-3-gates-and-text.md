# Draft 26 check, part 3: one gate, the words as Text, anchors in time

*A record of work by the scribe's session K3, 26 November 2026, one of four sessions of wave two's check. It finds and decides nothing. It changes no text, code or vector, proposes no remedy and no wording for draft 26, and where an answer can be read two ways it gives both and chooses neither. Everything here not quoted from Nobody, allegedly, is the scribe's wording.*

**The wish** (Nobody, allegedly, 20 November, at the top of `docs/decisions.md` on main):

> "Current wish: extract data, knowledge and understanding from the simulation run"

On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications." On this wave (26 November, 16:37): "Yes, with attacks but using Fable 5.1, not 5.2". On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea".

**Marks.** TRACED: to a rule or an act, cited. COUNTED: by a script, named. INFERRED: the scribe's reading. **Ledger** means `docs/decisions.md` on main. **Draft 25** is `docs/agreements-from-scratch/draft-25.md` on `claude/agreements-clean-1-hahuwn` (pull request 183); **encoding 2** is `encoding-2.md` beside it. **The brief** is `docs/agreements-from-scratch/draft-26-brief.md` on `claude/draft-26-brief-ucdzo3` (pull request 206), with its sorts: stays, changes, goes, moves, two ways, new. **Text 11** is `spec/MIR-text-draft-11.md`, LATEST by `spec/README.md`.

**Numbering.** The exchanges are numbered 12 to 17 as the prompt for this session numbers them. The ledger itself calls the first four the pow wow's eleventh to fourteenth questions; the last two are not numbered questions (TRACED, the ledger's headings).

---

## In plain words

*Words used (the scribe's short glosses): **Terms**, a signed act saying what is agreed; an **update**, a new version of Terms; the **update condition**, the rule a version names for who may approve its next version ("valid" is its yes); a **pin**, from 18 November, each needed signer acting once more after the last signature, so the order is fixed; a **fork**, two competing next versions; an **anchor**, a place or a clock the agreement names to say what came first or what time it was; a **knot**, one act naming another, which shows it came after.*

1. Exchange 12: an update needs one yes only, from the old version's update condition, and is then the version in force. Only one version stands at a time.
2. That clashes with the pin of 18 November, and with this morning's "version 2 is in force only once pinned", if updates must still be pinned: one says no step after the yes, the other says one more step.
3. Exchange 12 calls two approved updates of one version a race, which both lose; draft 25 calls them a fork, which the verifier must answer "fork" and which a later act can settle by picking one (G12.3 to G12.7). And it makes "valid" mean "in force", where draft 25 says "valid" only of a proposal: in a race both proposals are "valid" and neither is in force.
4. Exchange 13 puts the words of Terms into a separate text message (an act of the Text layer), which the Terms point to by its id and which must exist first. That fits draft 25, but it touches six rules of the Text specification, and leaves open what a verifier says when that message is private, missing, or itself shows an order of events.
5. Exchange 14: an agreement that names no place or clock cannot have a deadline. Draft 25, and ledger lines of 12 and 13 November, let each reader use a clock of their own choosing for a deadline in that case. Both cannot hold.
6. Exchanges 15, 16 and 17 change no rule of draft 25: two keys are kept apart and nothing is added to the Identity layer; the round's money findings wait for the Money layer's own review; and this wave's order is set (check, attack, then draft 26). That order goes against his 16 November words "no redrafts, no recode", if those still hold.

---

## 12. Valid means in force: one gate for an update

**The exchange, as the ledger has it** (26 November, 16:19 to 16:23). His words, in order: "I agree with CP. to me it means the same thing… valid, in force, what’s the difference for the core? The core should only see one version as valid", and, to the MOR lead's reading (one gate; one version at a time; two valid updates a race in which the old one stays; the first version in force by its named parties' assents, G4.1; "valid" keeps its plain sense for acts): "Yes, I always assumed in force to be human speech, and valid to be its translation for the verifier to be honest".

**Arrived at (to check), the MOR lead's line:** "for an update there is one gate: where the update condition of the version it replaces answers valid, it is the version in force; no other assent is asked. The core sees one version at a time. Two updates answered valid against one version are a race: neither replaces it, and it stays. The first version comes into force by the assents of its named parties. "In force" is the human word; "valid" is its translation for the verifier."

**Where the line says more than his words.** His "Yes" opens a sentence about the two words; it can be read as a yes to the whole reading the MOR lead gave, or to its last part, the words (INFERRED; both given). Read the second way, these parts of the line are the MOR lead's and unsaid by him: "no other assent is asked"; "Two updates answered valid against one version are a race: neither replaces it, and it stays"; "The first version comes into force by the assents of its named parties". His own words that carry the rule are "The core should only see one version as valid".

### 1. Rules of draft 25 it touches, with the brief's sort

| rule | draft 25, quoted short | brief's sort |
|---|---|---|
| G4.1 | "Terms are in force when the assents their `in_force` rule requires are present" | changes (pinning) |
| G4.2 | "Terms that name a party by role MUST carry `in_force`" | stays |
| G4.5 | "Terms stop being in force when Terms that replace them (G5.2, G4.8) are in force" | changes ("once the update condition answers valid") |
| G4.7 | "and each has the assents its own `in_force` requires (G4.1), they are a fork" | changes |
| G4.7(a) | "enough for F to be valid and in force" | changes |
| G4.7(b) | "L is valid and in force comes after the first position at which … F is valid and in force" | changes |
| G4.7(e) | "A verifier MUST answer **fork** … Both tips stop … the last shared version, stay in force" | stays |
| G4.8 | "Whether the replacing Terms are themselves in force is G4.1's, as draft 18 has it" | changes |
| G4.8(a) | "a Terms act that replaces it needs only to be in force by its own `in_force`" | changes |
| G4.9 | "Terms stop being in force only as G4.5 says: when a version replacing them is in force" | changes |
| G4.10 | "A counter signature is available only until every party has signed, which these grammar rules read as: until those Terms are in force" | changes |
| G4.11(d) | "the verifier answers **valid** … and the update replaces the version in force" | stays |
| G4.11(e) | "an update is valid when everyone who signed the original signs it" | changes (delegation sentence) |
| G5.1(c), G5.2 | bound by "a Terms act that replaces Terms by which they are bound, and the update condition of those Terms answers valid for it" | stays; stays |
| G5.4 | "the replacing Terms are valid (G4.11) and in force (G4.1)" | changes |
| G12.1 | "for Terms, those whose signing the update condition asks … and those whose assent G4.1 asks for" | changes |
| G12.2 | "While a fork stands, neither tip counts as the next act of its line" | stays (confirmed) |
| G12.3 | "A fork is resolved by an update of the shared act … which names every tip in `resolves`" | stays |
| G12.4 | "Terms MAY give, in advance, a power … to sign the resolving update of a fork" | stays |
| G12.7 | "Two that continue different tips are themselves a fork" | stays |
| G13.3 | "enough for those Terms to be in force (G4.1) and, for a replacing version, valid (G4.11)" | changes |

Outside the numbered rules (the brief gives them no rows): section 2, **Valid, not valid** ("said of a proposed update, and of nothing else in this text … This text never says "valid" of an act"); **In force** ("The words are said of Terms only"); **Version** ("The **last version** is the one in force"); **Fork**; and K2's row (TRACED, draft 25 section 2 and section 5).

**Brief lines it meets.** Two-way reading 1, "When is a replacing version in force?" (i) "replaces and is in force at once" or (ii) "itself "not yet in force" until its own rule is met and pinned". Exchange 12 reads as (i) on the second gate; on the pin, see conflict 12-A. "Decided, not yet worded" 5 (the sentences that carry the second gate) and 7 ("whether rival tips keep "fork""). New item 7, "One rule for every race". (TRACED, the brief.)

### 2. Earlier ledger entries it meets

| entry, date | quoted short | how |
|---|---|---|
| "The two gates", 17 November | "(a). Where the update condition answers valid, the update replaces the version it names. The new version's own `in_force` governs only its own later life" | EXTENDS: (a) said the condition decides replacing; exchange 12 adds that the update is then in force, with no step after. What "its own later life" leaves to a replacing version's `in_force` is not said (item 4) |
| "In force once pinned", 18 November | "Terms are in force only once the order of the signatures that put them in force is pinned … Until then they are "not yet in force"" | CONFLICTS, or two readings: conflict 12-A |
| "A late version 3 is rejected", 26 November, 15:33 | "version 2 is in force only once pinned, so a version 3 naming version 1 after that is rejected" (the MOR lead's reading, answered "Probably right") | CONFLICTS on the pin (12-A); and its line meets "two updates answered valid against one version are a race" (12-D) |
| "What a race stops", 18 November | "in a race, the change of state fails and the earlier state stays … A verifier answers "not shown" for what would have changed. Whoever wants the change makes it again" | AGREES on the outcome; carries the answer word into conflict 12-B |
| "A race changes nothing", 17 November | "the last version everyone shared stays in force, as with rival tips" | AGREES |
| "Forks", 12 November | "a join, or a resolver named in advance; meanwhile the last shared Terms stay in force" | CONFLICTS on how it ends: 12-B |
| "A fork, from MOR's side" (under the 13 November heading; draft 15) | "a fork is two updates, each signed by all the parties that needed to sign it … It is resolved by an update, signed as an update must be, that continues one tip" | CONFLICTS on the word and the way out: 12-B |
| "The update condition" (13 November heading; draft 16) | "given the version in force and a proposed update, it answers valid or not valid" | CONFLICTS on the word: 12-C |
| "The default update condition" (13 November heading; draft 17) | "the default update condition is everyone who signed the original" | AGREES: with one gate the default asked is the old version's |
| "Unclear means unchecked", 17 November | "an update is not shown as replacing the old Terms until that person's position is clear" | AGREES |
| "Old Terms stopping", 12 November | "one rule for replacing, no cases" | AGREES |

### 3. Conflicts

**12-A. One gate, or a pin after it.**

> Exchange 12, the MOR lead's reading that he answered "Yes": "an update the old version's condition answers valid is the version, with no separate step"; its line: "it is the version in force; no other assent is asked."

> "In force once pinned", 18 November, line: "Terms are in force only once the order of the signatures that put them in force is pinned: a named place shows it, or each signer whose signature was needed has acted after the completion, citing it. Until then they are "not yet in force"." And 26 November, 15:33, the MOR lead's reading answered "Probably right": "version 2 is in force only once pinned".

In plain words: the first says an approved update is in force at once; the second says Terms wait, "not yet in force", until each needed signer acts again. Both cannot hold for an update in an agreement that names no place, unless the pin is not "a separate step". Read one way (i): a pin is not an assent, so "no other assent is asked" leaves it standing and an update waits for its pin. Read the other way (ii): "no separate step" removes it for updates, and only the first version is pinned. A verifier's answer turns on it: whether version 2 is in force before anyone pins it, and so whether a version 3 naming version 1 is rejected or races (TRACED, the three lines; INFERRED, the two readings).

**12-B. A race, or a fork to resolve.**

> Exchange 12, line: "Two updates answered valid against one version are a race: neither replaces it, and it stays."

> Draft 25, G4.7(e): "A verifier MUST answer **fork** for which Terms replace them, show both tips, and MUST NOT choose between them"; G12.3: "A fork is resolved by an update of the shared act … The tip it names in `continues` then counts as the next act of the line"; G12.4 a power to resolve; G12.7 rival resolving updates. Ledger, "A fork, from MOR's side": "It is resolved by an update … that continues one tip". "What a race stops", 18 November: "A verifier answers "not shown" for what would have changed. Whoever wants the change makes it again".

In plain words: both keep the old version in force. They part on what follows. Under draft 25 the two updates wait as tips, and a later act can pick one, so one of them can still become the version. Under the race rule both fail, nothing is waiting to be picked, and whoever wants the change signs it again; the verifier says "not shown", not "fork". If two approved updates are a race, G12.3, G12.4 and G12.7 have no fork of Terms left to resolve; if they are a fork, they are not a race. Either "race" is a plain word for draft 25's fork (G12 stands and the answer is "fork"), or it is "What a race stops" (G12's Terms half loses its object and the answer is "not shown"). The brief left the answer word to the MOR lead (TRACED, brief, "Decided, not yet worded" 7).

**12-C. "Valid" said of a version, or of a proposed update.**

> His words: "The core should only see one version as valid"; "in force to be human speech, and valid to be its translation for the verifier". The line: ""In force" is the human word; "valid" is its translation for the verifier."

> Draft 25, section 2: "**Valid**, **not valid**: said of a proposed update, and of nothing else in this text: the output of the task `condition` … This text never says "valid" of an act". G4.11: "Asked of a proposed update, that is **valid** or **not valid**, as that cMIP answers." "The update condition" (draft 16): "given the version in force and a proposed update, it answers valid or not valid".

In plain words: in draft 25, "valid" is the update condition's yes to a proposal, and many proposals can each get that yes; "in force" is said of one version. If "valid" is the verifier's word for "in force", then in a race two updates that the condition answers valid would be two versions in force, which his "only one version as valid" and the line's "neither replaces it" both deny. So one word cannot be both the condition's answer about each proposal and the name of the single version in force. A verifier's answer word turns on it. The MOR lead's further sentence, ""valid" keeps its plain sense for acts", adds a third use beside draft 25's "This text never says "valid" of an act" (TRACED; INFERRED, the reading).

**12-D. "Valid against one version": the race, or the late update.**

> Exchange 12, line: "Two updates answered valid against one version are a race: neither replaces it, and it stays."

> "A late version 3 is rejected", 26 November, line: "a version 3 that names a version already replaced is rejected once the replacing version is in force." Draft 25, G4.11(a): the condition is asked of "the version its `replaces` names" even "for an update of a version already replaced".

In plain words: in the morning's case, version 2 and version 3 each name version 1 and each is answered valid by version 1's condition. Read by its letter, exchange 12's line makes that a race in which neither replaces version 1; the morning's line has version 2 stand and version 3 rejected. Both stand only if "race" means two such updates that nothing orders, the morning's case being ordered by version 2's pin. The line does not say so. A verifier's answer turns on it (TRACED, the two lines; INFERRED, the reading that joins them).

**12-E. "The first version … by the assents of its named parties".**

> Exchange 12, line: "The first version comes into force by the assents of its named parties."

> Draft 25, G4.1: "Terms are in force when the assents their `in_force` rule requires are present. If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer; Terms that name no party as a signer, and carry no `in_force`, are in force at once." G4.4: "A party named as an agreement is not counted by the default of G4.1."

In plain words: the line can be read as G4.1 said short (the MOR lead cited "(G4.1)"), or as every named party's assent, which an offer whose `in_force` asks only its maker, or a party named as an agreement, would not meet. A verifier's answer about an offer's first version turns on which (TRACED, both; INFERRED, the two readings). The brief lists the agreement-as-party half as open (its question 16).

### 4. Unsaid, that draft 26 would need

- Whether a pin is asked of an update, of the first version only, or of both (12-A).
- The answer word for two updates of one version that nothing orders: "fork" or "not shown" (12-B).
- What "valid" names once it translates "in force": the condition's answer, the version, or both, and what the condition's answer is called if not "valid" (12-C).
- What a replacing version's own `in_force` still does, after "governs only its own later life" (17 November) and "no other assent is asked"; and whether G4.2 ("MUST carry `in_force`") still binds a replacing version that names a role.
- G4.8(a)'s case of an original no one signed: the default then asks no one's signature, and with no second gate any Terms act naming it would be in force; draft 25 lists that as open (section 8.4) (INFERRED).
- Until when an assent to an update may be taken back (G4.10), once "in force" for an update is the condition's yes.

---

## 13. The words of Terms are a Text act

**The exchange** (26 November, 16:25 to 16:28). His words, in order: "Let’s continue… remember we have already some changes in store for money and agreement, are you looking at all this under their lights"; "How many acts are involved here?"; to the two-act way: "I think it”s cleaner, it keeps text to text and agreement grammar to agreement grammar, both have their own hashes to verify"; then: "Text comes first as a rule since agreement needs to point to it".

**Arrived at (to check):** "the words of Terms are an act of the Text layer, public or private, and the Terms name it by its act id. Text keeps text; the agreement grammar keeps the grammar; each is verified by its own hash. The hash choice for loose words goes." And: "the Text act carrying the words comes first, as a rule: Terms can name only an act that already exists, so the words are published before the Terms that point to them."

**Where the line says more than his words.** "Text comes first as a rule since agreement needs to point to it" says the order and its reason. The line adds "published": his words do not say published, nor where, nor to whom; "public or private" is the MOR lead's two-act proposal, which he called cleaner. "As a rule" can be read as a grammar rule a verifier applies, or as how clients must work (INFERRED; both given).

### 1. Rules of draft 25 it touches, with the brief's sort

| rule | draft 25, quoted short | brief's sort |
|---|---|---|
| G2.1 | "The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint." | stays |
| G2.2 | "Anything a Terms act refers to in another way is not part of those Terms." | stays |
| G4.7(c) | "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late, whether L is late is **unchecked**" | stays |
| G5.5 | "read from their words, as the body's cMIP gives them (task K1)" | goes |
| G9.1 | "lacks an act named by fingerprint … it MUST answer **unchecked**" | moves (MICS) |
| G11.2 | "Whether Terms give a part to a party is read from their words, as the body's cMIP gives them … Where the verifier cannot read the body … **unchecked**" | stays |
| G13.1 | "in any field that holds a fingerprint (`terms`, `under`, `replaces`, `previous`, `answers`, `resolves`, `relies_on`, `settlement`)" | stays |
| G13.2 | "An act that relied on a version or an act … names it" | stays |
| G13.3 | "An act that names another, directly or through acts that name it, came after it: each naming is a knot." | changes (gate, pin, place) |

Outside the numbered rules: section 3.1, field `body`: "fingerprint of the words, and the socket for the cMIP that says how to read them (task K1)"; section 2, **Fingerprint**, "the identifier the core gives to fixed bytes", and **Act**, whose fields include "the act's own fingerprint"; K1's row, "Accepts: the `body` bytes"; G12.3, "carries no words of its own". Encoding 2, E5's row: "the body's words | the work hash, `tagged_hash("MOR/work", words)` **[lead]** | … for text, its canonical text as UTF-8"; and E8, `body = [ words: any, socket ]` (TRACED).

The brief sorts G2.1, G2.2, G13.1 and G13.2 as staying and K1 as changing for the delegation only; it gives fields no rows. Exchange 13 reaches the `body` field and K1's "Accepts", which the brief does not list (TRACED, the brief, "The table, counted" and "Outside the 124").

**Text 11, the rules "published first, named by act id" reaches** (named, not judged; TRACED, Text 11):

- Section 2, the text act: "a public text carries its key, a private one is delivered to its recipients, possibly in a sealed container."
- Rule 14, what a text act carries: `signer`, `binding`, "its content key if it is public", `to`, `prev`, `refs`; no `acks`; `objects` only in its two cases; "A text act belongs to no core chain"; and its answer "unknown" where a verifier lacks what it names.
- Rule 1: "For a private act, only those who hold its key can check this, and they MUST before relying on it."
- Rule 6 (client conformance): "Before signing terms, a grant or a clone (Agreements), a client MUST show every bidirectional control visibly".
- Rules 3 and 4, and Part three: the text act's own format, `? 1 => hash`, "the cMIP that gives the text extra meaning", beside the Terms' K1 socket.
- Part three: "field 0 a text string" (`0 => tstr`, "the text, canonical").
- Reasoning, "One form, one hash": "Agreements, names and text works are compared and hashed as bytes."

### 2. Earlier ledger entries it meets

| entry, date | quoted short | how |
|---|---|---|
| "What the core is for", 17 November | "ID and text are universal, development is definition, the rest is to build on top of." | AGREES |
| "Only rules in the hashed text", 17 November | "a hashed text holds its rules and nothing else" | does not meet (that is the spec's text, not Terms' words) (INFERRED) |
| "When "now" is read", 12 November; G13.3 | "an act's "now" is what it cites" | AGREES: naming the Text act is a knot, so it comes first by citing |
| "A late version 3 is rejected", 26 November, 15:33 | "a missing act that cannot carry a knot (the work itself) never stops the rejection" | two readings: conflict 13-A |
| "What a dissolution is", 18 November | "What it says, previous agreement not in force anymore as agreed by all parties." | EXTENDS: what a dissolution says now sits in a Text act, read by K1; draft 25's resolving update carries no words and needs none (G12.3) |
| "Unclear means unchecked", 17 November | "every answer that depends on it is unchecked" | AGREES for a words act not held |

The ledger marks nothing in exchange 13 as replacing an earlier entry. "The hash choice for loose words goes" replaces encoding 2's E5 row, which is the MOR lead's choice marked **[lead]**, not his (TRACED).

### 3. Conflicts

**13-A. The words: an act that cannot carry a knot, or one that can.**

> "A late version 3 is rejected" (26 November, 15:33), the MOR lead's reading answered "Probably right": "a missing act that cannot carry a knot (the work itself) never stops the rejection"; its line: "Only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked".

> Exchange 13, line: "the words of Terms are an act of the Text layer". Text 11, rule 14: a text act carries "the everyday fields (`prev`, position and running summary, Envelopes rule 13)" and "optionally `refs` (the acts or web resources it responds to or mentions)".

In plain words: the morning's rule lets a verifier ignore a missing piece that cannot show order, and its example is loose bytes. Once the words are a Text act, they sit in their writer's own line and may name other acts, so a missing words act may be able to show order. Both stand only if "a signer's own line" means the Agreements line of G6 (then the Text act is still exempt), not the act format's line (then a missing words act makes lateness unchecked). A verifier's answer turns on it (TRACED, the lines and rule 14; INFERRED, the two readings; also whether `refs`, a mention, is a knot: the ledger's "Knots of different kinds", 26 November, calls a mention "a knot too, of another kind (order, not reliance)").

### 4. Unsaid, that draft 26 would need

- Which field names the Text act (`body` as today, beside its K1 socket, or another), and whether that naming is a knot: G13.1's list of fields does not include `body`, while G4.7(a) reads "every field that holds a fingerprint" (TRACED, both).
- What a verifier answers for Terms whose words act is private and held without its key: G9.1's **unchecked**, or Text's "unknown", for every answer read through K1 (G5.5, G11.2).
- What Terms count for where the words act they name is invalid under Text (rule 1, not canonical; Part three, not a text act).
- Words that are not text (a scan, a drawing, a recording): Text's payload is `tstr` only, and encoding 2's E5 row ("for text, its canonical text") implied other bytes could be words (TRACED; INFERRED that they were meant).
- "Comes first", and "published": by citing alone (G13.3), or shown first by a place (G7.2); for whom, where the words are private; and whether a grammar rule or a client's duty.
- Which reading wins where the Text act's own format cMIP (Part three, field 1) and the Terms' K1 socket read the same words differently.
- Whether Text rule 6's showing before signing "terms" is of the Text act's words, signed earlier, or of the Terms act that names them.

---

## 14. "Before the close" was the simulation's

**The exchange** (26 November, 16:28 to 16:33). His words, in order: "(Always assume leftovers once I send my reply. The act of sending does something to my thought process)"; "That was a simulation artifact, they had numbered windows"; then: "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition".

**Arrived at (to check):** first, ""the close" was the round's numbered windows, an artefact of the simulation, not a finding about the core. Nothing changes." Then: "an agreement that states no anchor (no place, no clock) cannot have a condition in time: no deadline, no "before", no "after the close". The MOR lead's reading, to check: a verifier answers such a condition "not shown", with that reason."

**Where the line says more than his words.** His words: "no stated anchor" and "a temporal condition". The line adds "(no place, no clock)" as what an anchor is, and lists "no "before"", which can be read as a time ("before 5 pm") or as an order between acts ("before the payment"), the second being sequence, not time ("Order is sequence", 18 November). The answer "not shown" is marked the MOR lead's. The first line's "Nothing changes" is refined by the second, as the ledger reads later answers (TRACED, the ledger's head: "later answers refining earlier ones").

### 1. Rules of draft 25 that build a condition in time, with the brief's sort

Every rule found that builds, or answers, a condition in time (TRACED, each quoted; the search was by reading G4 to G14 and grepping draft 25 for "clock", "date", "deadline", "period", "time", INFERRED complete as far as read):

| rule | draft 25, quoted short | brief's sort |
|---|---|---|
| G4.10 | "With a place, the positions it gives settle it"; stated cost "an `in_force` rule with a deadline read from a place or a clock" | changes |
| G4.11 | the condition's cMIP specifies "when, and on what" | stays |
| G4.11(c) | ground "a time, per the clock the agreement names (G7.4), or, where it names none, per the anchoring named or as shown (G13.4)" | stays |
| G5.5 | conditions on ending a delegation: "(a notice, a term, a cause)" | goes |
| G7.2 | "whether a period has passed … only once the place shows it" | changes |
| G7.4 | "Where the Terms in force name [a clock], what time it was, for that agreement, is answered per that clock by every reader" | changes |
| G8.2 | "one written in a `content` or in the words of a body is read only by the cMIP of that socket … where it names none, only per an anchoring the reader accepts" | moves (MICS) |
| G10.5 | "what the version in force itself states in advance (a date, a count) … per place, per clock, per the anchoring named or as shown" | changes |
| G10.6 | "the rights offered by the version it was earned under, with every condition that version puts on them" (with 26 November: "a month", "a year") | goes, then back with (a) only (26 November) |
| G13.4 | "Only where the agreement names none does each reader accept the anchoring it chooses." | two ways |

Rules that order acts and may or may not be "a condition in time" (two readings: time, or sequence): G4.6 (latest, "per the anchoring the reader accepts … or else **as shown**"; brief: two ways), G4.7(b) (late "per clock", "per the anchoring the reader accepts"; brief: changes), G5.4 (before or after a replacement; brief: changes).

Outside the numbered rules: section 2, **Anchoring** ("whatever a reader accepts as saying that nothing is later than an act, or what time it was … a reader accepts an anchoring of its own choosing only where the agreement names none"); section 2, **not valid** ("it may rest on a time"); K4's row ("valid or not valid, with its ground: an act, or a time"); K5's row ("whether it still takes new identities, and why"); section 5.1's row "Closing, reopening, closing by itself"; stated cost "Valid is as sure as the update condition's cMIP" ("then two readers with different anchorings can differ on whether an update is valid"); P11, P16 (TRACED).

### 2. Earlier ledger entries it meets

| entry, date | quoted short | how |
|---|---|---|
| "When "now" is read", 12 November | his: "Then, anyone accept the anchoring they are willing to accept."; line: "for "nothing later" and for time, each accepts the anchoring it is willing to accept" | CONFLICTS for time: 14-A |
| "Whose anchoring wins", 13 November | "a reader's own anchoring applies only where the agreement names none" | CONFLICTS for time: 14-A |
| "An offer that closes by itself", 13 November | "an offer may close by its own signed condition ("open until June", "first 100 buyers")" | EXTENDS: "open until June" now needs a stated anchor |
| "The update condition" (13 November heading; draft 16) | his: "No, the cMIP can run the verification via bytes, so it should be able to run." (of an offer closing on a date) | EXTENDS: the bytes include a stated anchor |
| "A later version and a closed spot", 12 November | his: "That version could have conditions tied to time, creators statements… bla bla bla… core does not care" | EXTENDS, or conflicts in the letter of "core does not care" (INFERRED) |
| "The place is a pointer", 17 November | the MOR lead's list of what leaves the grammar includes "the clock" | two readings: conflict 14-C |
| "Order is sequence", 18 November | "Order is not time, it's sequence." | AGREES; it gives the second reading of "before" |
| "Time: anchoring, cross-links, and "seen"", 20 November | "Time is a human construct. Of course you need an authority." | AGREES |
| "Whose place counts", 26 November | "a place named only by a rule the parties never signed does not order their Terms. A verifier may give an answer per such a place only as the reader's choice, named so." | AGREES on "stated"; two readings on whether a reader's choice may still answer a deadline (14-A) |
| "Protect the unknown parties", 26 November | his: "If she bought for a month of service to an LLM for example, the deal is valid a month." | CONFLICTS in one case: 14-D |
| "A resolve with nothing to resolve", 26 November | ""Unchecked" is kept for a reader that lacks something. Every refusal states its own reason." | AGREES with the MOR lead's "not shown, with that reason"; see 14-B |

### 3. Conflicts

**14-A. A deadline with no anchor named: none, or the reader's.**

> His words, exchange 14: "an agreement with no stated anchor cannot build a temporal condition".

> Draft 25, G8.2: "What time it was is answered per the clock the agreement names (G7.4); where it names none, only per an anchoring the reader accepts, with it named (G13.4)." G4.11(c): a time "per the clock the agreement names … or, where it names none, per the anchoring named or as shown". G10.5: "a date … per place, per clock, per the anchoring named or as shown". Stated cost: "two readers with different anchorings can differ on whether an update is valid". Ledger, 12 November: "for "nothing later" and for time, each accepts the anchoring it is willing to accept"; 13 November: "a reader's own anchoring applies only where the agreement names none".

In plain words: draft 25 and two ledger lines let an agreement that names no place or clock still have "open until June", or an update allowed only after a date: each reader answers it by the anchoring that reader accepts, or "as shown". His words say such an agreement cannot have that condition at all. Both cannot stand for an agreement that names no anchor. A verifier's answer turns on it: draft 25's verifier answers the date per the reader's anchoring; under exchange 14 it gives no such answer (TRACED). They can both stand only if the reader's own anchoring is read as serving "nothing later" and order, and never a condition in time (INFERRED, one reading; the other: it serves time too, and the two conflict).

**14-B. The answer word: "not shown", "unchecked", or "as shown".**

> Exchange 14, the MOR lead's reading (to check): "a verifier answers such a condition "not shown", with that reason."

> Draft 25, section 2: "**not shown**: the acts held do not establish it; an act not held might"; G13.4: "Where the reader accepts an anchoring from which the verifier holds no answer … every answer that rests on it is **unchecked** (G9), and not **as shown**"; G4.11(c): "per the anchoring named or as shown".

In plain words: where the agreement states no anchor, no act anyone could add makes the condition answerable, yet draft 25 keeps "not shown" for answers an act not held might change. So the MOR lead's "not shown" stretches draft 25's word; draft 25's own answers here are "as shown", "per anchoring" or "unchecked". The same stretch was taken this afternoon for a resolve with nothing to resolve ("not shown", with the reason). A verifier's answer word turns on it (TRACED; the reading is the MOR lead's, marked to check).

**14-C. "No place, no clock": the clock as an anchor that can be stated.**

> Exchange 14, line: "an agreement that states no anchor (no place, no clock)".

> "The place is a pointer", 17 November, the MOR lead's lean that he agreed to: "the rest of G7 (a place contradicting itself, which answers count per place, the clock, how a relay orders) is the relay's or a cMIP's". The brief, two-way reading 3: "(i) The field `clock` and "per clock" leave the grammar with the rest of G7 … (ii) Only G7.4's sentence leaves, and the clock stays a thing Terms may name."

In plain words: exchange 14's line counts a clock among the anchors an agreement can state. If, by reading (i) of 17 November, the clock left the grammar, the only anchor Terms can state is a place, and an agreement that names a clock and no place would have no stated anchor. The two stand together only on reading (ii). A verifier's answer for Terms naming a clock alone turns on it (TRACED; INFERRED, the joining).

**14-D. "Valid a month", in an offer with no anchor.**

> His words, "Protect the unknown parties", 26 November: "If she bought for a month of service to an LLM for example, the deal is valid a month. If it was year, version 2 is valid a year." Its line: "for as long as that version says (a month, a year)".

> His words, exchange 14: "an agreement with no stated anchor cannot build a temporal condition".

In plain words: a month is a condition in time. For an offer that states a place or a clock both stand. For one that states neither (263 of 269 Terms in the round named no place, research's count, TRACED to pull request 232, section 1.e), the buyer's month cannot be built, so "the deal is valid a month" has nothing to stand on. Both stand only if "a month" is read as the words' and their cMIP's (K1), outside the grammar's temporal conditions (INFERRED; both readings given).

### 4. Unsaid, that draft 26 would need

- What an anchor that can be "stated" is: a place, a clock, both; and whether a contest's or another rule's place counts (14-C; "Whose place counts").
- Whether "temporal condition" covers order ("before the payment") or time only ("before 5 pm").
- What Terms that write a deadline in their words and state no anchor count for: invalid, or Terms with a condition read as never met, or as not shown (14-B).
- Whether the reader's own anchoring (G13.4, section 2 "Anchoring") still answers "nothing later" where it no longer answers time.
- Which of draft 25's sockets may still take a time: K2 (an `in_force` deadline), K4 (G4.11(c)), K5 (G10.5) (14-A).

---

## 15. Two keys, so they are kept apart

**The exchange** (26 November, 16:31 to 16:34). His words: "I’m tempted to state… sorry, we built two keys so that they could be kept separately".

**Arrived at (to check):** "nothing is added to Identity. The chain key and the signing key exist to be kept apart; whoever keeps both in one place gives up what the second key was for, and an owner robbed of both bears the loss, as Identity already states. Keeping them apart is the clients' duty."

**Where the line says more than his words.** "Keeping them apart is the clients' duty" is the MOR lead's; his words name no one's duty. "I’m tempted to state…" can be read as a thing he would state to people (as the line takes it, nothing added) or as a sentence he would put in a text, the companion or Identity's reasoning (INFERRED; both given). "As Identity already states": Identity draft 16's reasoning says "Holding both keys is the strongest proof of ownership the protocol sees, so a thief who steals both can also leave the owner's careful homes", and "Two keys with different jobs … The chain key is used once and kept offline" (TRACED, Identity draft 16, section 11's commentary and its reasoning); the words "bears the loss" were not found there (COUNTED: grep for "loss" in `spec/MIR-identity-draft-16.md`, 2 hits, neither says it).

1. **Rules of draft 25 it touches:** none (INFERRED: draft 25 names keys only in section 2, "an identity and not one key", and in section 8.1 and section 9 as the Sign layer's). Brief: new item 8, "No release by a fork or a key", whose key half the brief places in Identity.
2. **Earlier entries:** "No release by a fork or a key", 18 November ("neither a fork of one's own line nor a change of key releases anyone from Terms in force"): AGREES. "Two threads, two owners", 17 November ("A key change continues the signer's line"): AGREES. "A key change that waits is a home's service", 26 November ("nothing is added to Identity"): AGREES.
3. **Conflicts:** none found.
4. **Unsaid:** where the clients' duty is written, if it is one (the brief's open question 3, "Where do the duties of clients live?", is about Agreements' client duties); and whether "I’m tempted to state" asks for a sentence anywhere.

---

## 16. Money's findings wait for the Money review

**The exchange** (26 November, 16:35 to 16:36). His words: "Good to go"; then "Let’s keep the focus where it is for now. Agreed".

**Arrived at (to check):** "the focus stays on Agreements. Money's findings from the round go to the Money review, after draft 26, read against draft 14, "What defines Money" and the duo."

**What it confirms or defers.** It defers to the Money review the round's Money findings the MOR lead listed: "a payment report that does not bind its payer; the payee acting first; paying an identity rather than an invoice; eleven things Money could not say". It confirms "The order after the break", 18 November ("finish agreements, then turn our attention to money"): AGREES. "read against draft 14, "What defines Money" and the duo" is the MOR lead's line; his words do not name what the review reads against.

It touches no rule of draft 25 (INFERRED). Draft 25's rules that sit beside Money (G8.3, G8.5, G11.4(b), G11.4(c), G11.7, the brief's open question 5 on the buyer's leg) are not reached by it, and stay as the brief sorts them. No conflict found.

---

## 17. Wave two: check, then attack, then draft 26

**The exchange** (26 November, 16:36 to 16:37). His words: "Yes, with attacks but using Fable 5.1, not 5.2".

**Arrived at (to check):** "that is wave two, with the attack, run on Fable 5.1, not 5.2. Draft 26 is written only after he has settled the conflicts."

**What it confirms.** The MOR lead's proposal: the scribe checks each answer of 26 November against the ledger and the brief; the codemeister writes what the changes do to verifier 2, no code changed; a Fable attack on the answers together; he settles the conflicts; then draft 26. It confirms the MOR lead's proposal recorded under exchange 13 ("To check, the MOR lead's proposal, not answered"), which this makes answered (TRACED).

It touches no rule of draft 25 (INFERRED).

**Ledger entries it meets.**

- "The budget after the simulation", 16 November, his words: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." In the letter, "then draft 26" is a redraft (TRACED). Two readings: (i) the budget rule was for that week, and the later "Yes, all the work carries … then the changes" (20 November) and this "Yes" refine it, as later answers refine earlier ones; (ii) it stands, and draft 26 is against it. Neither chosen. Not a rule; a verifier's answer does not turn on it.
- The order of 20 November: "first the findings and the problems then the changes, the review and the verifications." Two readings: (i) the check and the attack are "the problems", before "the changes" (draft 26), and the review and verifications still follow; (ii) the attack is a review, put before the changes. Neither chosen.

No conflict with a rule found.

---

## The table: every rule of draft 25 these exchanges touch

| rule | the exchange | AGREES / EXTENDS / REPLACES / CONFLICTS / UNSAID | one line |
|---|---|---|---|
| G2.1 | 13 | AGREES | an act id is a fingerprint; what the body names becomes an act |
| G2.2 | 13 | AGREES | words outside the Text act are not part of the Terms |
| G4.1 | 12 | CONFLICTS | "by the assents of its named parties" against the `in_force` rule and its default (12-E); the pin (12-A) |
| G4.2 | 12 | UNSAID | whether a replacing version that names a role must still carry `in_force` |
| G4.5 | 12 | REPLACES | stops when the update is answered valid, not when the replacing Terms are in force by their own rule |
| G4.6 | 14 | UNSAID | "latest" per the reader's anchoring: order, or time (two readings) |
| G4.7 | 12 | CONFLICTS | "fork" against "race" (12-B); a fork needs each tip in force by its own `in_force` |
| G4.7(a) | 12 | REPLACES | "valid and in force" becomes the condition's answer alone |
| G4.7(b) | 12, 14 | REPLACES; UNSAID | the second gate goes (12); per clock and per the reader's anchoring: order or time (14) |
| G4.7(c) | 13 | CONFLICTS | a missing words act that may carry a knot (13-A) |
| G4.7(e) | 12 | CONFLICTS | MUST answer "fork" against a race's "not shown" (12-B) |
| G4.8 | 12 | REPLACES | its last sentence, the second gate, goes |
| G4.8(a) | 12 | UNSAID | an original no one signed, with no second gate |
| G4.9 | 12 | EXTENDS | stops when a valid update replaces; one version at a time |
| G4.10 | 12, 14 | UNSAID; AGREES | until when an update's assent can be taken back (12); a deadline read from a place or a clock (14) |
| G4.11 | 14 | CONFLICTS | the condition may specify "when" with no anchor stated (14-A) |
| G4.11(c) | 14 | CONFLICTS | a time "per the anchoring named or as shown" where the agreement names none (14-A, 14-B) |
| G4.11(d) | 12 | CONFLICTS | "valid" said of each proposed update against "valid" as in force (12-C) |
| G4.11(e) | 12 | AGREES | the default asked is the old version's: everyone who signed it |
| G5.1(c) | 12 | AGREES | bound by an update the old condition answers valid |
| G5.2 | 12 | AGREES | a replacing act binds by the old condition's answer |
| G5.4 | 12, 14 | REPLACES; UNSAID | "valid and in force" (12); before or after: order, not time (14) |
| G5.5 | 13, 14 | UNSAID | read through K1 from words that may be private (13); "a notice, a term" in time (14); the rule goes (brief) |
| G7.2 | 14 | AGREES | "whether a period has passed" already needs the place |
| G7.4 | 14 | CONFLICTS | whether a clock is an anchor Terms can still state (14-C) |
| G8.2 | 14 | CONFLICTS | a time in a body's words, answered per the reader's anchoring (14-A) |
| G9.1 | 13 | UNSAID | "unchecked" against Text's "unknown" for words held without their key |
| G10.5 | 14 | CONFLICTS | "a date … per the anchoring named or as shown" (14-A) |
| G10.6 | 14 | CONFLICTS | "a month" for a buyer, in an offer with no anchor (14-D) |
| G11.2 | 13 | UNSAID | a part given to a party is read through K1 from the words act |
| G12.1 | 12 | REPLACES | "those whose assent G4.1 asks for" goes |
| G12.2 | 12 | EXTENDS | both tips stop: same outcome as the race; the old version stays |
| G12.3 | 12 | CONFLICTS | a fork of Terms resolved by a resolving update, against "make it again" (12-B) |
| G12.4 | 12 | CONFLICTS | a power to resolve a fork of Terms (12-B) |
| G12.7 | 12 | CONFLICTS | rival resolving updates of a fork of Terms (12-B) |
| G13.1 | 13 | UNSAID | `body` is not in its list of fields that hold a fingerprint |
| G13.2 | 13 | AGREES | Terms name what they relied on: the words act |
| G13.3 | 12, 13 | REPLACES; AGREES | "valid and in force" becomes the condition's answer (12); naming the words act puts it first by citing (13) |
| G13.4 | 14 | CONFLICTS | "each reader accept[s] the anchoring it chooses" for time where none is named (14-A) |

Exchanges 15, 16 and 17 touch no rule and have no row. **39 rules touched** (COUNTED: rows of this table, by `grep -c '^| G' ` over this section). The brief's sort of each is given in each exchange's first table; they are not totalled here.

---

## The conflicts, listed together, hardest first

Hardest: a verifier's answer turns on it.

1. **12-A. One gate, or a pin after it.** Exchange 12, "is the version, with no separate step" against "In force once pinned" (18 November) and this morning's "version 2 is in force only once pinned". Whether an approved update in an agreement with no place is in force before each signer acts again. *Verifier's answer turns on it.*
2. **12-B. A race, or a fork to resolve.** "Two updates answered valid against one version are a race: neither replaces it, and it stays" against G4.7(e)'s MUST answer "fork" and G12.3, G12.4, G12.7's resolving updates (with "A fork, from MOR's side" and "Forks", 12 November). One keeps the two updates waiting to be picked, the other makes both fail. *The answer word, and whether a later act can still make one of them the version, turn on it.*
3. **12-C. "Valid" said of a version, or of a proposed update.** His "The core should only see one version as valid" and the line's "valid" as the translation of "in force", against draft 25's "valid … said of a proposed update, and of nothing else". In a race both proposals are "valid" by the condition and neither is in force. *The answer word turns on it.*
4. **14-A. A deadline with no anchor named: none, or the reader's.** His "an agreement with no stated anchor cannot build a temporal condition" against G8.2, G4.11(c), G10.5, G13.4 and the ledger's 12 and 13 November lines letting each reader's own anchoring answer time where the agreement names none. *Whether "open until June" is answered at all turns on it.*
5. **12-D. "Valid against one version": race or late update.** Exchange 12's line, by its letter, against this morning's "a version 3 that names a version already replaced is rejected once the replacing version is in force". Both stand only if a race is only what nothing orders. *Whether version 2 stands turns on it.*
6. **13-A. The words act: no knot, or a knot.** This morning's "a missing act that cannot carry a knot (the work itself) never stops the rejection" against the words now being a Text act with its own `prev` and `refs`. *Whether a verifier lacking the words answers "unchecked" for lateness turns on it.*
7. **14-B. "Not shown" for an anchorless deadline.** The MOR lead's reading "not shown, with that reason" against draft 25's "not shown: … an act not held might" and G13.4's "unchecked". *The answer word turns on it; the reading is the MOR lead's, to check.*
8. **14-C. The clock as a statable anchor.** "No place, no clock" against the 17 November lean that the clock leaves the grammar (brief two-way reading 3). *The answer for Terms naming a clock and no place turns on it.*
9. **12-E. The first version's assents.** "By the assents of its named parties" against G4.1's `in_force` rule and its default, and G4.4. *An offer's first version turns on it; may be G4.1 said short.*
10. **14-D. "Valid a month" with no anchor.** His "the deal is valid a month" against his "cannot build a temporal condition", for an offer that states no anchor. *A verifier's answer turns on it only if the month is the grammar's, not the words' cMIP's.*

Not about a rule, and listed for completeness: exchange 17's "then draft 26" against 16 November's "no redrafts, no recode", read two ways (section 17).

**Two-way readings, collected** (none chosen): his "Yes" in exchange 12, to the whole reading or to the words; a pin as an assent or not (12-A); "race" as fork or as "What a race stops" (12-B); "a signer's own line" as G6's or the act format's (13-A); "as a rule" as grammar or client (13); "before" as time or order (14); the reader's anchoring for order only or for time too (14-A); the clock staying or leaving (14-C); "a month" as the grammar's or the words' (14-D); "I’m tempted to state" (15); the budget rule and the order (17).

---

## The blind test

Before pushing, "In plain words" and three conflicts picked at random (`shuf -n 3` over the ten gave 12-B, 12-C, 12-A) were handed, without the ledger or the prompt, to a subagent asked: "what are the two texts, and why can they not both stand?"

- **What it could say:** for all three, the two texts and why they cannot both stand, in its own words, and correctly: 12-A (in force at once against waiting for a pin, with both readings), 12-B (the fork's tips can still be picked, but under the race both are dead, and the answer word differs), 12-C (many proposals can be valid, but only one version is in force).
- **Where it stumbled:** the words "pin", "tip", "the line", "cMIP", "core" were not defined in the excerpt; it could not follow plain-words lines 4 and 6, and only partly line 5 ("anchor"); it could not say what the MOR lead's "plain sense for acts" of "valid" means.
- **What was changed:** the "In plain words" list was rewritten in plainer words, with a short gloss of the words it uses (lines 2, 4, 5 and 6 above).
- **What could not be fixed:** what "valid keeps its plain sense for acts" means. It is the MOR lead's sentence in the ledger, and neither it nor the exchange says what that plain sense is; the scribe can quote it but not explain it. "Tip" and "the line" are draft 25's terms (section 2) and are left to it.

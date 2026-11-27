# What draft 26 does to verifier 2: rules 5.7 to 5.13, and section 6

*Session 2 of 4 under the codemeister of MOR (Machine, allegedly, narrow hat), 27 November 2026. A record of work, not a decision: nothing here is chosen. Every reading is a question; a lean is labelled as the session's. Session 1 takes draft 26's rules 5.1 to 5.6, session 3 encoding 3, session 4 assembles the four parts into one sheet.*

**The wish** (Nobody, allegedly, 26 November, 16:46): "We need to change the current wish to updating the core after the findings". On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (27 November, 16:54): "Yes pls"

**Marks.** *traced*: to a rule, a line of the ledger, a line of code at commit `f1a13feb`, or an act. *counted*: by a script, named (the session's build script, `impact-part-2-build.py`, kept in the session's scratch space and not in the repository, counted every total in this file, checked every quotation against its file and every line of code cited against the commit). *inferred*: the session's reading, with what would confirm it. Nothing that would change could be run: every "after" is read or inferred.

## In plain words

1. Draft 26 rewrites the rules of Agreements; verifier 2 is the code that reads a set of signed acts by draft 25's rules and gives the answers ("in force", "fork", "unchecked" and the rest).
2. This part takes draft 26's rules 5.7 to 5.13 (a signer's own line, keepers and the clock, the settlement, spots and the unknown party, legs, forks, knots) and section 6 (the sockets), and says, rule by rule, what verifier 2 would have to answer differently.
3. Most of these rules are draft 25's, renumbered and reworded: the code keeps its answers and changes the rule it names.
4. Five things change what Dana, who holds the acts and asks a verifier, is told. A keeper may be several relays, and they must agree. A reader's own anchoring never gives the Terms' answer. Someone who filled a spot is read under the version she signed, the role and its clock included, and no update reaches her. Any fingerprint in any field of any act held, of any layer, orders acts. A resolve that resolves nothing is "not shown", with the reason.
5. Eleven of today's test cases leave Agreements: the reading of leg reports side by side ("matched", "unanswered" and the rest) moves to the MICS's report block.
6. Thirty-seven new test cases are needed; nine of them are among the twenty-two of 26 November, and five are among those the entries of 27 November add.

## Today's answers

Run on `claude/impact-draft-26-part-2`, made from `claude/agreements-verifier-2` at `f1a13feb` [counted]:

- `cargo test -p mor-core --locked`: 570 tests pass, 0 fail.
- `python3 core/vectors/agreements_new_grammar_check.py`: "grammar.json: 115 of 120 cases judged again, and agree"; the five it does not judge are cases 71, 74, 91, 58 and 59 (by their rules G10.2, G10.6, G11.4, G4.11, G5.1(b)), three of them this part's (71, 74, 91).

## The rules covered

Draft 26 sets out, in sections 5.7 to 5.13, **40 numbered rules** and **0 lettered parts** (5.7: 2; 5.8: 6; 5.9: 1; 5.10: 8; 5.11: 9; 5.12: 9; 5.13: 5); 5.10.1's three bullets are a list, not lettered parts. Section 6 sets out **8 tasks** (K1 to K8) and one paragraph on payments; section 6.1, **7 modules** and **2 more things** that answer questions and are no sockets (the keeper and the clock; standing). This part covers all of them: 40 sections for the numbered rules, one for section 6 with its tasks inside it, and one for 6.1 [counted: the build script, from `draft-26.md`]. The definitions of sections 3 and 4 are read where a rule rests on them and are not given sections of their own.

## The rules, in one table

*Vectors that change answer* counts today's vectors whose expected word or qualifier would differ, beyond two mechanical renamings that touch every case (draft 25's rule numbers become draft 26's; "per place" becomes "per keeper"); renamed cases are listed in each section and counted at the end. A case number is a position in `core/vectors/agreements-new/grammar.json`, from 0; a case is placed under the rule its `tests` field names. "if" marks a case that moves only on one reading of a question below.

| Rule | Short name | Size of the change | Vectors that change answer | Vectors retired | New vectors |
|---|---|---|---|---|---|
| 5.7.1 | A signer's previous act | a word | 0 | 0 | 0 |
| 5.7.2 | Two acts on one previous act: a fork | a word | 0 | 0 | 2 |
| 5.8.1 | The keeper | a field | 0 | 0 | 0 |
| 5.8.2 | Copies at any relay | a removal (counted at 5.13.5) | 0 | 0 | 1 |
| 5.8.3 | Several keepers | a rule | 0 | 0 | 3 |
| 5.8.4 | Order per keeper | a rule | 0 | 0 | 1 |
| 5.8.5 | Whose keepers and clock count | a rule | 0 | 0 | 1 |
| 5.8.6 | No stated anchor, no condition in time | a rule, and an interface part | 0 | 0 | 3 |
| 5.9.1 | Settlement | none | 0 | 0 | 0 |
| 5.10.1 | What a role names | none | 0 | 0 | 0 |
| 5.10.2 | A spot filled, and from which version | a rule | 0 | 0 | 1 |
| 5.10.3 | A filler is bound by her own assent | a word | 0 | 0 | 0 |
| 5.10.4 | A role of kind future | none | 0 | 0 | 0 |
| 5.10.5 | New identities | a removal (counted at 5.13.5) | 0 | 0 | 0 |
| 5.10.6 | No update reaches a filling | a rule | 0 | 0 | 1 |
| 5.10.7 | Rights | a removal, and a rule | 0 | 0 | 4 |
| 5.10.8 | How long, and no trigger | a rule, and a field | 0 | 0 | 3 |
| 5.11.1 | Sequence, and leg | none | 0 | 0 | 0 |
| 5.11.2 | The call | none | 0 | 0 | 0 |
| 5.11.3 | Leg report | a removal (counted at 5.11.4) | 0 | 0 | 0 |
| 5.11.4 | Before paying | a removal | 0 | 78, 80, 81, 82, 83, 84, 85, 86 | 0 |
| 5.11.5 | Reports are data | none | 0 | 0 | 0 |
| 5.11.6 | Who has agreed | none | 0 | 0 | 0 |
| 5.11.7 | The buyer's leg | a removal | 0 | 92, 93, 94 | 0 |
| 5.11.8 | The contest | none | 0 | 0 | 0 |
| 5.11.9 | A baker may contest | a rule | 0 | 0 | 1 |
| 5.12.1 | A fork is a fork | none | 0 | 0 | 0 |
| 5.12.2 | Lines, updates and forks | a word | 0 | 0 | 0 |
| 5.12.3 | Both tips stop | a rule, already owed (T1, T4) | 0 | 0 | 2 |
| 5.12.4 | Resolving update | a word, and a rule | 22 if | 0 | 4 |
| 5.12.5 | A power to resolve | none | 0 | 0 | 0 |
| 5.12.6 | What others relied on stands | none | 0 | 0 | 0 |
| 5.12.7 | A fork that stands | none | 0 | 0 | 0 |
| 5.12.8 | Rival resolving updates | a word | 0 | 0 | 0 |
| 5.12.9 | A client's duty | none | 0 | 0 | 0 |
| 5.13.1 | What an act is read against | a rule | 0 | 0 | 3 |
| 5.13.2 | An act names what it relied on | none | 0 | 0 | 0 |
| 5.13.3 | Shown after | a rule | 0 | 0 | 4 |
| 5.13.4 | Order from naming | a word | 0 | 0 | 0 |
| 5.13.5 | Anchoring | a removal | 64 | 0 | 2 |
| 6 | Tasks handed to cMIPs (K1 to K8) | a field, a removal, an interface part | 0 | 0 | 1 |
| 6.1 | Modules | none | 0 | 0 | 0 |
| **All** | | | **1**, and **1** if | **11** | **37** |

---

## 5.7 A signer's own line

### 5.7.1 Every act names its signer's previous act

1. **The rule.**

> **5.7.1** Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first. An act whose `previous` names, among the acts held, anything that is not an act of the same signer within the same agreement (an act of another signer, or of another agreement; a report; a payment; any record that is no Terms act and no Statement) is **invalid** (§3.6). Where `previous` names nothing the verifier holds, the act counts, and the verifier shows that signer's line as **unchecked** before it. So it is where `previous` names an act the verifier holds and cannot open (a private act, held without its key): what that act is cannot be read, so the act counts, the signer's line is **unchecked** before it (§3.6), and the act is not invalid. An act held that is not an Agreements act (§3.6) is a record that is no Terms act and no Statement: an act whose `previous` names it is **invalid**. Whether two acts of a line are a fork, and whether a line is unchecked before an act, are answered from the acts held, **as shown**, whatever a keeper shows. Whether anything is later in a line is an answer about what is latest, and is given as §5.8 says.

2. **What it replaces, and the code it meets.** Draft 25's G6.1, with two words changed [traced: the trace's row for 5.7.1, "G6.1, stays, **on the lead's reading**"]: "rejected" becomes "not an Agreements act", and "a place" becomes "a keeper". The code: `core/src/agreements_new/check.rs:228` (the check among acts held), with the note at `core/src/agreements_new/check.rs:248` and the invalid case at `core/src/agreements_new/check.rs:264`; the line's answer at `core/src/agreements_new/grammar/order.rs:294`, "unchecked before" at `core/src/agreements_new/grammar/order.rs:315` [traced].

3. **What a verifier would answer differently.** Ben's assent to Ana's Terms names, in `previous`, an act Dana does not hold. Today and under draft 26 alike, the assent counts and Ben's line is shown unchecked before it; an assent whose `previous` names Carla's act is invalid. *Before:* `line`: **shown**, G6.1, "unchecked before its first act held"; *after:* the same, naming 5.7.1 [inferred: the rule's sentences are draft 25's]. The one word that moves, "rejected", is the checker's verdict, which draft 26 calls "not an Agreements act" (§3.6); the code's verdict `Rejected` keeps its meaning.

4. **Size.** A word: "rejected" to "not an Agreements act" in the plain words; no branch of code changes.

5. **Vectors.** Renamed only: case 45 (an act whose `previous` names nothing held counts, and its signer's line is shown unchecked before it); case 46 (the act after an act not held still counts toward in force); case 47 (`previous` naming another signer's act: invalid, and it counts for nothing). In `valid.json` and `invalid.json`, the cases naming G6.1 keep their verdicts and rename their rule (counted at the end). Retired: none. New: none.

6. **The build list and the sheet.** R7 (an act held that cannot be read): 5.7.1 keeps draft 25's sentence for a `previous` that names such an act ("the act counts, the signer's line is **unchecked** before it"), and says nothing more of other answers; R7 stays as it was [traced]. R24 (a stolen key's act, `line.rs` `read_lines` not reading void acts): draft 26 is silent on void acts in a line, which are Identity's (§3.3, **Line**); R24 stays [traced].

7. **Choices the text leaves.** None found.

### 5.7.2 Two acts of one signer naming the same previous act are a fork

1. **The rule.**

> **5.7.2** Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork. A verifier holding both MUST answer **fork** for that signer, whatever a keeper shows: an act the keepers do not show is still a tip. It MUST NOT choose between the tips. Both tips stop (§5.12), and the fork is resolved only as §5.12 says. Where the two acts are assents, neither counts for any update's gate until that signer's line is resolved, by a resolving update in it (5.5.5(a), 5.5.7(a), §5.12).

2. **What it replaces, and the code it meets.** G6.2, "place" read as keepers, its reason sentence moved to the companion, and one sentence added: "Where the two acts are assents, neither counts for any update's gate until that signer's line is resolved" [traced: the trace's row for 5.7.2; the M11 report, "Two reasons carried from draft 25 moved to the companion's section 5 (from 5.6.2 and 5.7.2)"]. The code: forks are grouped by signer, agreement and `previous` at `core/src/agreements_new/grammar/line.rs:76`, whatever any place shows; the answer at `core/src/agreements_new/grammar/order.rs:298`; a tip's assent is set aside from every count at `core/src/agreements_new/grammar/force.rs:243`, inside `counted`, which the gate uses at `core/src/agreements_new/grammar/force.rs:553` [traced].

3. **What a verifier would answer differently.** Ana signs two assents, each naming her Terms act in `previous`: one to Ben's proposed version 2, one to Carla's rival version 2. *Before and after:* `line` for Ana: **fork**, both tips shown; neither assent counts toward either version's gate, so under the default each version is **not shown** as a replacement, never **not valid** [inferred: `counted` already skips a stopped assent at `force.rs:243`; draft 26 writes it as a sentence of the rule]. The sentence the code would change is its plain words: "whatever a place shows" becomes "whatever a keeper shows".

4. **Size.** A word ("place" to "keeper"); the added sentence matches what the code does.

5. **Vectors.** Renamed only: case 38 (a fork in a signer's line: two acts that name the same previous act). New:
   - **The double assent, forked** (27 November): Ana's Terms in force; Ben and Carla each propose a version 2 naming them; Ana signs two assents, one to each, both naming her Terms act in `previous`. `line` for Ana: **fork**, 5.7.2, both tips shown; `update` of each version 2: **not shown** as a replacement, by default, Ana's assent not counting; never **not valid**.
   - **A keeper shows one tip**: the same, the Terms naming keeper K, which shows only Ana's first assent. `line` for Ana: **fork**, as shown, whatever the keeper shows.

6. **The build list and the sheet.** T1 ("A fork after Terms are in force takes them out of force", `line.rs` `stopped`, `force.rs` `counted` line 243): 5.7.2's new sentence narrows the assents that a fork stops to "any update's gate"; 5.12.3 keeps "Terms that were in force before a fork was made stay in force". T1 is kept, and sharpened: the code stops a forked assent for coming into force too [inferred; see 5.12.3]. R8 (two versions by one author, one resolving act): see 5.12.4. The 27 November entry on the double assent: the forked case is this rule's; the double assent in order (5.5.5(a)) is session 1's.

7. **Choices the text leaves.**
- Does "neither counts for any update's gate" leave a forked assent counting for a first version's coming into force (5.4.1), where 5.12.3 says that nothing built on a tip counts?

---

## 5.8 The keeper, and the clock

### 5.8.1 The keeper

1. **The rule.**

> **5.8.1** **The keeper.** Terms MAY name, in `keeper`, one keeper or several, each by the identifier the layer that orders acts gives it. A keeper so named is the agreement's official relay: the way the drafters of the agreement agree on where it is kept. A keeper relays the agreement's acts as any relay does (§3.5), and vouches for the chaining only: which of them came after which, at the positions it gives them in its keeper's records (§3.4). It never vouches for an act's validity, which every verifier checks for itself. These grammar rules take a keeper's answers about order and define nothing more of it.

2. **What it replaces, and the code it meets.** G7.1, with N2: `place` becomes `keeper`, one or several [traced: the trace's row for 5.8.1; the ledger, ""place" is renamed **keeper**: the agreement's official relay, named in its Terms, vouching for the chaining only"]. The code: one place per Terms, `core/src/agreements_new/terms.rs:261`; the layer's interface, `core/src/agreements_new/grammar/layers.rs:42`; the qualifier, `core/src/agreements_new/grammar/answer.rs:91`, which holds one identifier [traced].

3. **What a verifier would answer differently.** Ana and Ben name two keepers in their Terms. Today the Terms carry one `place`, and a second identifier has nowhere to go: the bytes are encoding 3's (session 3). With one keeper named, nothing Dana is told changes but the word: **per keeper** for **per place** [inferred].

4. **Size.** A field: `place` (one identifier) becomes `keeper` (one or several), in the Terms, in the scope (`Scope.place`) and in the qualifier (`Qualifier::PerPlace`). Its bytes are session 3's.

5. **Vectors.** None renamed under this rule's number (no case tests G7.1). New: none here; the several keepers are 5.8.3's.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None for the verifier; the keeper's identifier (what it is the hash of) is listed as open in encoding 3 (the M11 report, "What waits on the codemeister", item 7) [traced].

### 5.8.2 Copies at any relay

1. **The rule.**

> **5.8.2** **Copies.** Copies of an agreement's acts MAY be lodged at any relay. Only the order given by the keepers the Terms name counts for the agreement: a relay the Terms do not name gives no order for it, whatever it relays.

2. **What it replaces, and the code it meets.** New (N2) [traced: the trace's row for 5.8.2]. The code: a reader's anchoring stands in the place's stead where the Terms name neither a place nor a clock, `core/src/agreements_new/grammar/mod.rs:252` to `core/src/agreements_new/grammar/mod.rs:256` [traced]. No code tells a named keeper from any other relay beyond this.

3. **What a verifier would answer differently.** Ben keeps copies of the agreement's acts at a relay the Terms do not name, and Dana is told to read its order. *Before:* where the Terms name neither a place nor a clock, the relay's order becomes the answer, **per anchoring** (case 64). *After:* the relay gives no order for the agreement; the Terms' answer is **as shown**, from knots, and the relay's order may be shown beside it only as Dana's own reading, named so [inferred: 5.8.2 with 5.8.5 and 5.13.5].

4. **Size.** A removal, counted under 5.13.5: the branch at `mod.rs:252` stops giving the Terms' answer.

5. **Vectors.** Case 64 is counted under 5.13.5. New:
   - **A relay the Terms do not name**: Ana's and Ben's Terms name keeper K, which shows the root and both assents; the reader accepts relay R, whose order puts Ben's assent first. `in_force`: **shown**, per keeper, K named; R's order shown only as the reader's.

6. **The build list and the sheet.** The sheet of 26 November, line 11 ("A place named only by a rule the parties never signed"), found that the code already labels such a place per anchoring; under draft 26 the label stays and the answer it labels stops being the Terms' own [traced: the sheet, section 11].

7. **Choices the text leaves.** None beyond 5.13.5's.

### 5.8.3 Several keepers

1. **The rule.**

> **5.8.3** **Several keepers.** Where the Terms name several keepers, an answer about order counts where they agree. Where they disagree, there is none: a verifier answers **not shown**, with that reason, names the keepers, and shows the records of each as evidence of the disagreement. Where the verifier holds two answers of one keeper that contradict each other, it has no answer from that keeper: **unchecked** (§3.6).

2. **What it replaces, and the code it meets.** New for several keepers (N2); its last sentence is G7.2's last, kept for one keeper [traced: the trace's row for 5.8.3]. The code: one place's answer at a time, `core/src/agreements_new/grammar/mod.rs:210`; one place contradicting itself is unchecked at `core/src/agreements_new/grammar/mod.rs:226`, from `core/src/agreements_new/grammar/layers.rs:24` [traced]. No code compares two places.

3. **What a verifier would answer differently.** Ana's and Ben's Terms name two keepers, K and M. Both show Ben's assent after Ana's: **per keeper**, K and M named. K shows Ben's assent at position 3 and M shows it before Ana's: *after:* **not shown**, "the keepers the Terms name disagree", both named, each one's records shown as evidence. Today neither answer can be given: the Terms hold one place [inferred]. K shows the assent and M shows nothing: Nobody, allegedly, answered on 27 November, "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do"; the line arrived at: "every keeper named must show an act for its order to count". Draft 26 was finished before that exchange (its last commit, `d4373f0`, 14:58; the exchange 16:40) and says only "where they agree" [traced: `git log` of the draft's branch; the ledger's times].

4. **Size.** A rule: an answer about order over a list of keepers, agreeing, disagreeing, or one silent; the "not shown, the keepers disagree" reason is new.

5. **Vectors.** Renamed only: case 63 (two answers of one place that contradict each other: no answer from that place, unchecked) (draft 25's G7.2 sentence, now 5.8.3's last; build-list row D8 had it go, and draft 26 keeps it). New:
   - **Two keepers that agree**: Terms naming K and M, each showing the root and both assents in that order. `in_force`: **shown**, per keeper, K and M named.
   - **Two keepers that disagree**: the same, M placing Ben's assent before the root. `in_force`: **not shown**, the keepers disagree, both named, each one's records shown as evidence.
   - **Two keepers, one silent** (27 November): the same, M showing nothing. `in_force`: **not shown**, on the ledger's reading (question 1, (A)); **shown**, per keeper K, on draft 26 as written (B).

6. **The build list and the sheet.** D8 ("The rest of G7: a place that contradicts itself, and the clock"): its "should" was "G7.2's sentence gone" and "no clock read", with case 63 to go. Draft 26 keeps both: the sentence is 5.8.3's last, and the clock is 5.8.5's. Case 63 stays; D8 is reversed [traced]. The draft's report lists the silent keeper as open (item 5) [traced: "**5.** With several keepers, whether the pin needs every keeper or those that show it where none disagrees (5.8.3)."].

7. **Choices the text leaves.**
- With several keepers and one silent, does the order wait for every keeper named (the ledger's line of 27 November, 16:40), or count where those that show it agree (draft 26 as written)?
- Two keepers that agree on the order of A and B and disagree on C: is every answer **not shown**, or only those that rest on C?

### 5.8.4 Order per keeper

1. **The rule.**

> **5.8.4** **Order per keeper.** Where the Terms in force name a keeper, or several, an act within the agreement counts for any answer about order (which Terms are in force, 5.5.3; the pin, 5.4.1, 5.5.1; whether an update is late, 5.5.4; whether an act under a power came before a replacement, 5.6.4) only once those keepers show it, and at the position they give it; where they are several, only where they agree (5.8.3). A verifier MUST take those answers from the keepers, qualified **per keeper**, with the keepers named. Where a new version names other keepers, or none, whether it has replaced the version in force is judged per the keepers the version it would replace names (5.5.5(d)). Before any Terms of the agreement are in force, the keepers are those its first Terms act names (5.4.1). Knots do not pin, or order the agreement's acts, in the keepers' place; they expose a keeper: a keeper's record that contradicts a knot the verifier holds (B placed before A, while A names B) gives **not shown**, with the reason that the keeper contradicts the acts, and the record is kept as evidence (5.5.4(c)).

2. **What it replaces, and the code it meets.** G7.2, narrowed to order (its list "what is whole, who holds what, whether a period has passed, or whether something was made public" goes), with the keepers named, and one sentence new: a keeper's record that contradicts a knot gives **not shown** [traced: the trace's row for 5.8.4]. The code: `core/src/agreements_new/grammar/mod.rs:210` counts an act only once the place shows it; `core/src/agreements_new/grammar/mod.rs:243` takes the place the Terms name, at `core/src/agreements_new/grammar/mod.rs:245` [traced]. Nothing in the code holds a place's record against a knot.

3. **What a verifier would answer differently.** Ana's Terms name keeper K. Ben's assent names Ana's assent in `relies_on`, and K places Ben's assent before Ana's. *Before:* the place's order is taken as it is: Ben's assent counts at the position K gives it [inferred: `counts` reads positions only]. *After:* **not shown**, "the keeper contradicts the acts", K's record kept as evidence [traced: 5.8.4].

4. **Size.** A rule: the knots held are checked against each record the keepers give.

5. **Vectors.** Renamed only: case 60 (in force per the place the Terms name); case 61 (an assent the place does not show does not count: not in force, per place); case 62 (a place named, and no answer from it: unchecked) (per place becomes per keeper, with the keeper named; case 62, a keeper named and no answer from it, stays **unchecked**). New:
   - **A keeper that contradicts a knot**: Terms naming K; Ben's assent names Ana's assent in `relies_on`; K places Ben's assent before Ana's. `in_force`: **not shown**, the keeper contradicts the acts, K's record kept as evidence.

6. **The build list and the sheet.** R15 ("ask the place for more"): draft 26 makes a keeper vouch for "the chaining only", and keeps "These grammar rules take a keeper's answers about order and define nothing more of it" (5.8.1); R15 stays a reading [traced]. Item 6 of the draft's report ("What a keeper answers beyond order") is left out of the rule; the code's place answers positions only, so nothing in it reads more [traced: `layers.rs:42`].

7. **Choices the text leaves.**
- Where a keeper's record contradicts a knot, is only the answer that rests on that record **not shown**, or every answer per that keeper?

### 5.8.5 Whose keepers and clock count

1. **The rule.**

> **5.8.5** **Whose keepers and clock count.** The keepers and the clock the Terms in force name are the ones every reader uses for that agreement, whether a party to it or not, except for a filling (below): a verifier MUST NOT give an answer of 5.8.4 for that agreement per another anchoring as the Terms' answer. A keeper or an anchoring of the reader's own choosing, or one named only by a rule the parties never signed, gives an answer only as that reader's, named so, and never the Terms' own (§3.4, 5.5.3). Terms MAY also name a `clock`. Where the Terms in force name one, what time it was, for that agreement, is answered per that clock by every reader, qualified **per clock**: for every answer that turns on a time, the ground of an update condition (5.5.7(c)) among them. For a filling, the keepers and the clock are those its own version names (the version its proof names), never those of the Terms in force: how long what a filling gave lasts is counted on that version's clock (5.4.3, 5.10.2, 5.10.8). What a clock is, and how it is identified, is for the layer that gives it.

2. **What it replaces, and the code it meets.** G7.4, with three additions: a reader's own keeper or anchoring gives only the reader's answer; the clock answers every answer that turns on a time; a filling's keepers and clock are its own version's [traced: the trace's row for 5.8.5]. The code: the anchoring branch at `core/src/agreements_new/grammar/mod.rs:252`; a filling's qualifier is the Terms in force's, `core/src/agreements_new/grammar/spots.rs:22` [traced].

3. **What a verifier would answer differently.** Carla fills a spot under version 1, which names keeper K. Version 2, in force, names keeper M. *Before:* her filling is answered per M, the Terms in force's place [traced: `spots.rs:22` takes the qualifier of the chain's last version]. *After:* per K, the keeper of the version her proof names [traced: 5.8.5, "For a filling, the keepers and the clock are those its own version names"].

4. **Size.** A rule: the scope and qualifier of a filling come from the version it was earned under.

5. **Vectors.** None renamed under this rule's number. New:
   - **A filling per its own version's keeper**: version 1 names keeper K and a role, which Carla fills, K showing her proof; version 2, in force, names keeper M, which does not show it. `fillings`: **shown**, Carla, per keeper K.

6. **The build list and the sheet.** The sheet of 26 November, line 11, is this rule's "named only by a rule the parties never signed" [traced]. Q26 is settled at 5.8.6.

7. **Choices the text leaves.**
- A filling earned under version 1, which names no keeper, while version 2 names one: is the filling answered **as shown**, by its own version, even where version 2's keeper shows its proof?

### 5.8.6 No stated anchor, no condition in time

1. **The rule.**

> **5.8.6** **No stated anchor, no condition in time.** A condition in time with no anchor the Terms state is refused, not answered. Where the bytes show it, a verifier refuses it: Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid** (§4.4, case 8). A keeper is not a clock: Terms that name a keeper and no clock do not supply a clock. Where only the words show it (the words speak of a time, and no cMIP the Terms name declares a need for a clock or a keeper), these grammar rules do not read the words (§5.2) and have no rule for it: a verifier gives no answer of these grammar rules about that time. In either case, an anchoring of the reader's own choosing gives an answer only as that reader's, named so, and never the Terms' answer (5.8.5).

2. **What it replaces, and the code it meets.** New (N9) [traced: the trace's row for 5.8.6; the ledger, "A verifier refuses where the bytes show it: Terms naming a cMIP that needs a clock or a keeper, and naming neither, are invalid."; the MOR lead's edit (e), "naming neither" going for "A keeper is not a clock"]. The code: none. The one interface every cMIP is plugged in through, `core/src/agreements_new/grammar/sockets.rs:167`, has a name and an answer, and no way to declare a need [traced].

3. **What a verifier would answer differently.** Ana sells Ben a month of access. The Terms' update condition is a cMIP that counts days, and the Terms name no clock. *Before:* the condition is asked, and its answer passed on (or **unchecked** where the verifier lacks it). *After:* the Terms are **invalid**, under 5.8.6, the fault being §4.4's case 8 [traced: §4.4, case 8]. The same where the Terms name a keeper and no clock: "A keeper is not a clock".

4. **Size.** A rule, and a field of the interface: each cMIP declares what it needs; the verifier compares that with the Terms' `keeper` and `clock`.

5. **Vectors.** New:
   - **A condition that needs a clock, and no clock**: Terms whose `condition` is a stub declaring that it needs a clock, and no `clock`. Any question resting on them: **invalid**, 5.8.6 (§4.4, case 8).
   - **A keeper is not a clock**: the same, the Terms naming a keeper and no clock: **invalid**, 5.8.6.
   - **The clock supplied**: the same, the Terms naming a clock. `update`: the condition's answer, **valid** or **not valid**, its ground per clock.

6. **The build list and the sheet.** The sheet's Q26 ("A condition in time with no stated anchor": the verifier passes the cMIP's answer on, or answers over it) is settled toward its (A) and beyond it: the verifier passes the answer on, and refuses Terms that do not supply what the cMIP declares [traced: the MOR lead's settled note, Q26, "it refuses Terms whose named cMIP declares a need (a clock, a keeper) the Terms do not supply"]. Encoding 3's M8 finds that "case 8 (5.8.6) cannot be checked from bytes" [traced: the report's found items].

7. **Choices the text leaves.**
- Where, and in what form, does a cMIP declare that it needs a clock or a keeper (§7, "How a cMIP declares what it needs")? Until it is said, no verifier can give case 8, and every such vector is written against a stub's declaration.
- A cMIP the verifier lacks: its declaration cannot be read. Are the Terms then **unchecked** (the verifier lacks something), never **invalid**?

---

## 5.9 The settlement

### 5.9.1 Settlement

1. **The rule.**

> **5.9.1** **Settlement.** A Statement MAY name a `settlement` it is tied to: the evidence, from the layer that holds value, that a payment was made. This field is where that layer's proof plugs into Agreements; what a settlement is, is that layer's to say. It names an act and no cMIP, and is not a task. A settlement named is reported on the word of whoever gave it (the MICS, §2). What is done with it (counting only what led to a settlement, dividing what one shows) is a rule's, in whichever socket it sits (§6).

2. **What it replaces, and the code it meets.** G8.5, unchanged but for its references [traced: the trace's row for 5.9.1]. The code: the field, `core/src/agreements_new/statement.rs:90`; read in the contest and the buyer's leg, `core/src/agreements_new/grammar/legs.rs:371` and `core/src/agreements_new/grammar/legs.rs:280` [traced]. G8.1 to G8.4 (say who said it) go to the MICS [traced: the trace's row for 5.9.1].

3. **What a verifier would answer differently.** Nothing. Ben's contest names the settlement of his payment; Dana is shown it on the word of whoever gave it, as today.

4. **Size.** None.

5. **Vectors.** Renamed only: in `valid.json`, "statement: answers, relies_on and settlement" (counted under 5.13.1). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

---

## 5.10 Spots, and the unknown party

### 5.10.1 What a role names

1. **The rule.**

> **5.10.1** A role in `parties` MUST name:

2. **What it replaces, and the code it meets.** G10.1, unchanged but for its references [traced: the trace's row for 5.10.1]. The code: `core/src/agreements_new/terms.rs:571` and the cases after it; at query time, `core/src/agreements_new/grammar/spots.rs:20` [traced].

3. **What a verifier would answer differently.** Nothing: a role with no kind, a kind not one of the five, or no `what` (but for kind future) is invalid, as today.

4. **Size.** None.

5. **Vectors.** Renamed only: the `valid.json` and `invalid.json` cases naming G10.1 (counted at the end). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.10.2 A spot filled, and from which version

1. **The rule.**

> **5.10.2** A spot is filled, by a signer, when its K5 cMIP, applied to the acts held and the keepers' answers, names that signer on the strength of a **proof**: the acts that earn the spot. A spot MAY be filled many times; each filling is tied to the proof that earned it. Whether a spot holds one filling or many is said by its K5 cMIP. A verifier MUST answer each filling with its proof, each act reported by who signed it (the MICS, §2), qualified per the keepers its own version names, or as shown where that version names none: a filling's keepers and clock are those of its own version, never those of the Terms in force (5.8.5). For a filling yet to be earned, the role and its cMIP are read from the Terms in force; while a fork of Terms stands, from the Terms both branches replace (5.5.4(e)). A filling already earned is read from the version its proof names, its role and that role's cMIP as that version states them, whatever a later version says of the role (5.10.6).

2. **What it replaces, and the code it meets.** G10.2, with "For a filling yet to be earned" and a sentence added for a filling already earned, and the keepers of the filling's own version [traced: the trace's row for 5.10.2, "**Added by M6, to check**"]. The code: `core/src/agreements_new/grammar/spots.rs:13` reads the role from the Terms in force only, and answers `core/src/agreements_new/grammar/spots.rs:18` where they name none; the qualifier at `core/src/agreements_new/grammar/spots.rs:22` [traced].

3. **What a verifier would answer differently.** Carla fills the spot at position 2 of version 1. Ana and Ben then make version 2, which drops the role. *Before:* `fillings` of position 2: **not shown**, G10.2, "the Terms in force name no role at that position" [traced: `spots.rs:18`]. *After:* **shown**, Carla, with her proof, earned under version 1, its role and that role's cMIP read from version 1 [traced: 5.10.2, "whatever a later version says of the role"]. Asked whether the spot still takes new identities, the answer is read from version 2, which names no such role (5.10.5) [inferred].

4. **Size.** A rule: two readings of a spot, one for fillings yet to be earned (the Terms in force) and one for each filling earned (its own version).

5. **Vectors.** Renamed only: case 71 (a spot filled: each filling with its proof, reported by who signed it). New:
   - **A filling under a dropped role** (27 November): version 1 names a role at position 2, which Carla fills; version 2, valid and in force, names no role. `fillings`: **shown**, Carla, earned under version 1, its role and cMIP read from version 1; `takes_new` under version 2: **not shown**, the version in force naming no such role.

6. **The build list and the sheet.** The 27 November entries' vector *a filling under a dropped role* (the prompt's name for it) falls here [traced: the ledger, "no update of the known parties reaches her in any way (her rights, her spot, her place in the agreement)"].

7. **Choices the text leaves.**
- Which version's K5 cMIP is asked for fillings already earned when the question is about the spot (`fillings` of a root and a position): the position in version 1, version 2, or each version that names a role there? Today a spot is named by the position in the Terms in force, and a dropped role has no position there.

### 5.10.3 A filler is a party, bound by her own assent

1. **The rule.**

> **5.10.3** Each signer who fills a spot is a party in it from then on. They are bound only by their own assent (§5.6). Filling a spot does not bind any other party; what binds the known parties to the holder of a filling is the version its proof names (5.10.6).

2. **What it replaces, and the code it meets.** G10.3, with a clause added: what binds the known parties to the holder is the version her proof names [traced: the trace's row for 5.10.3, "**Added by M6, to check**"]. The code: who is bound, `core/src/agreements_new/grammar/order.rs:221` [traced].

3. **What a verifier would answer differently.** Nothing the code gives today; the added clause is 5.10.6's, and its effect is counted there.

4. **Size.** A word: a clause, no branch.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.10.4 A role of kind future

1. **The rule.**

> **5.10.4** A role of kind **future** names no `what`: its K5 cMIP defines who the participant is as well as how they are confirmed. It is for participants none of the four kinds can describe in advance. No verifier can check that a future spot was used only for them; whether it was is the authors' word, carried by them (§5.3). A `what` on a role of kind future is left unread, and a verifier says so (5.2.3).

2. **What it replaces, and the code it meets.** G10.4, with "A `what` on a role of kind future is left unread, and a verifier says so" written here [traced: the trace's row for 5.10.4]. The code: `core/src/agreements_new/terms.rs:580`, a note the verifier lists [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: in `valid.json`, the role of kind future with a `what`, its note G10.4 (counted at the end). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.10.5 New identities

1. **The rule.**

> **5.10.5** **New identities.** Whether a spot still takes new identities is said by its K5 cMIP, applied to the version in force (the role as that version states it), the acts held, and the answers of the keepers and the clock the Terms in force name (5.8.5). These grammar rules define no act and no field for closing a spot or for opening it again: an offer stops taking new identities, or takes them again, by a new version (§5.5), or by what the version in force itself states in advance (a date, a count), as that cMIP reads them. The update condition is not asked for this answer: it is asked only of a proposed update (5.5.7). A verifier MUST give that answer with its cause, as the cMIP gives it, per keeper, per clock or as shown (§5.8, §5.13). A condition in time in that answer is answered per the clock the Terms in force name, and for a filling already earned per the clock its own version names (5.8.5, 5.10.2): an anchoring of the reader's own choosing never gives the Terms' answer (5.8.5, 5.8.6). Whatever that answer is, a filling already earned stays a filling, shown with its proof (5.10.2), and keeps the rights of the version it was earned under (5.10.7). Where the verifier lacks the cMIP, the answer is **unchecked** (§3.6).

2. **What it replaces, and the code it meets.** G10.5: "per the anchoring named" goes; a condition in time per the clock the Terms name, and for a filling per its own version's clock [traced: the trace's row for 5.10.5]. The code: `core/src/agreements_new/grammar/spots.rs:85`, its qualifier from the chain, which takes the reader's anchoring at `core/src/agreements_new/grammar/mod.rs:256` where the Terms name neither place nor clock [traced].

3. **What a verifier would answer differently.** Ana's offer names no keeper and no clock; Dana accepts an anchoring of her own. *Before:* "the spot still takes new identities", **per anchoring**. *After:* **as shown**, the Terms' answer; Dana's anchoring only beside it, as hers [inferred: 5.10.5 with 5.13.5].

4. **Size.** A removal (the anchoring as the Terms' answer), counted under 5.13.5.

5. **Vectors.** Renamed only: case 72 (whether a spot still takes new identities: the task's output, with its cause); case 73 (an offer stops taking new identities by a new version). New: none here (5.13.5's cover it).

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.10.6 No update reaches a filling

1. **The rule.**

> **5.10.6** **No update reaches a filling.** For a filling, no later update exists; each later version exists for the agreement. No update of the known parties reaches a filling in any way: its holder has no say in the agreement's updates (§3.2, 5.5.5(a)), and no update binds them (5.6.1(c)). What exists for the holder is the version the filling's proof names (5.10.7): that version binds the holder, by the assent that earned the filling (5.4.3), and binds the known parties to the holder, for as long as its words say, on the clock that version names (5.10.8), whether or not a later version is in force (5.4.3). A verifier MUST NOT read any update, or any update condition's answer, as reaching a filling (5.5.7).

2. **What it replaces, and the code it meets.** New (N5) [traced: the trace's row for 5.10.6; the ledger, "There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?"]. The code: a filling's rights changed through the condition of the version earned under, `core/src/agreements_new/grammar/spots.rs:114`; and being bound by an update without one's own assent, `core/src/agreements_new/grammar/order.rs:234`, which asks `signed_by` `core/src/agreements_new/grammar/force.rs:473`, whose "everyone who signed the original" includes a filler [traced; the sheet of 26 November, section 8].

3. **What a verifier would answer differently.** Carla fills a spot under version 1, which names a condition. Version 2 passes that condition without Carla's assent. *Before:* `bound` for Carla by version 2: **shown**, G5.1(c), where the condition answers valid and her assent to version 1 counts in "everyone who signed" [inferred, as the sheet of 26 November read it]. *After:* **not shown**: no update binds her (5.10.6, 5.6.1(c)).

4. **Size.** A rule, shared with session 1: the arm of `signed_by` that counts a filler is 5.5.5(a)'s and 5.6.1(c)'s; the (b) arm of `rights` is 5.10.7's.

5. **Vectors.** New:
   - **The filler not bound by a later version** (26 November, line 8, new vector (2)): version 1 names a role and a condition that answers valid to an update Ana alone signs; Carla fills the role; version 2 is signed by Ana. `bound` for Carla by version 2: **not shown**.

6. **The build list and the sheet.** The sheet of 26 November, line 8, new vector (2) ("the filler not bound by a later version that a condition let through: **not shown**") falls here; its (1) and (3), the default's signers, are session 1's [traced: the sheet, section 8]. Q14 ("Who is an unknown party?") is settled by §3.2, **Unknown party**: "Any filling of a role is an unknown party's, whenever it was made." [traced]. Q16 and Q17 are session 1's (5.5.7, 5.4.2).

7. **Choices the text leaves.**
- The draft's report lists item 13 (what a verifier shows of an agreement the known parties dissolved while a filling's version still binds) and item 16 (whether the principle binds a verifier beyond the rules that apply it) [traced]. Neither changes an answer the code gives today.

### 5.10.7 Rights

1. **The rule.**

> **5.10.7** **Rights.** A filling has exactly the rights offered by the version it was earned under, with every condition that version puts on them. The version a filling was earned under is the version its proof names (§5.13), as the spot's cMIP gives it with the filling (K5's row, §6). What the rights and their conditions are is that version's (§5.2, task K1); these grammar rules do not read them. Nothing stops those rights but what that version's own words say (5.10.8). Nothing changes what a filling earned except an assent its holder signs in their own name (5.6.1(a)), or one made for them under a power they gave (5.6.1(b), 5.6.5(f)). A verifier MUST name, with each filling, the version it was earned under, and each later version that changes what it earned, with the assent that rests on: the holder's own, or the one made for them under a power they gave, with that power named.

2. **What it replaces, and the code it meets.** G10.6 with (a) only, folded into one sentence, and a power she gave counted as hers; (b) goes [traced: the trace's row for 5.10.7; the MOR lead's note on what changed, "Comes back with (a) only: nothing changes what a filling earned except an assent its holder signs in their own name (or for her under a power she gave)."]. The code: `core/src/agreements_new/grammar/spots.rs:99`; the (a) arm counts only an assent with no `for`, `core/src/agreements_new/grammar/spots.rs:108`; the (b) arm asks the condition, `core/src/agreements_new/grammar/spots.rs:115`, through `core/src/agreements_new/grammar/sockets.rs:67` [traced].

3. **What a verifier would answer differently.** Carla earned 10% under version 1, whose condition lets Ana and Ben change shares. Version 2 gives her 5%, and she did not sign it. *Before:* `rights`: version 2 changes them, **valid**, G10.6(b), where the condition answers valid [traced: `spots.rs:119`]. *After:* **shown**, "no later version changes them": the condition is never asked about a filling [traced: 5.10.7, 5.10.6]. Carla signs version 3 herself: changed as far as its words say, under either text. Gil signs version 3 for her, under a power she gave: *before*, not counted (`for` is set); *after*, it changes them, the power named [traced: 5.10.7, "or one made for them under a power they gave"].

4. **Size.** A removal (the (b) arm and `Ask::FillingRights`), and a rule (an assent under a power she gave counts as hers).

5. **Vectors.** case 74 (a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid): keeps its answer (**shown**), loses its name and sentence, which quote G10.6(b), and its `stubs_asked` loses the K4 question about a filling [traced: the sheet of 26 November, section 9]. New:
   - **The condition does not reach a filling** (26 November, line 9): the same, version 2 cutting Carla's share. `rights` of Carla's filling: **shown**, no later version changes them; K4 is not asked.
   - **Her own assent** (26 November, line 10): version 2, assented by Carla in her own name. `rights`: **shown**, version 2 changes them as far as its words say, her assent named.
   - **An assent under a power she gave**: version 2, assented for Carla by Gil, under a power of kind `assent` in Terms Carla signed. `rights`: **shown**, version 2 changes them, the power and Gil named.
   - **Her own assent to a version that does not name her**: version 2 names neither Carla nor her role; Carla assents to it. `rights`: **shown**, version 2 changes them (question 6, (A)); or **shown**, no later version changes them (B).

6. **The build list and the sheet.** D7 ("Earned rights, asked apart"): the half that removes `Ask::FillingRights` stands; its "should" (Carla falls to 5%) is reversed [traced: the sheet of 26 November, section 9]. The sheet's lines 9 and 10 fall here, one new vector each. Q18 ("The holder's own assent to a version that does not name her") is settled by the MOR lead [traced: "Her own assent to a later version, counted in her name or not, is her signature for G10.6 (a)."]; draft 26 writes "an assent its holder signs in their own name" and does not say "counted or not".

7. **Choices the text leaves.**
- Must the later version count her assent in her name (as `spots.rs:108` reads, through `counted`), or is her own signature enough, counted or not (the MOR lead's note)?
- 5.10.7 names "each later version that changes what it earned": does the verifier read whether a version changes it (K1's), or name every later version she assented to?

### 5.10.8 How long, and no trigger

1. **The rule.**

> **5.10.8** **How long, and no trigger.** What a filling gave lasts as long as the words of the version it was earned under say, measured on the clock that version names, from the anchoring of the purchase; where the version names no clock, no term in time can be read from it (5.8.6). The cMIP that reads those words (task K1) answers whether what the filling gave still applies; a verifier shows that answer as that cMIP's, with the ground it gives, qualified **per clock**, and gives none of its own; where it lacks that cMIP, the answer is **unchecked** (§3.6). No update ends what a filling gave, and none is needed (5.5.7(f)). The update condition is read in one place (5.5.7), and is never asked about a filling. No condition triggers: these grammar rules have no answer **triggered**, and a verifier MUST NOT give one. What a version offers changes only through an update (§5.5); what a filling earned changes only as 5.10.7 says. Whether a spot still takes new identities under the version in force is 5.10.5's. Nothing stops a later version: one made as §5.5 says MAY offer again, and MAY rest what it offers on values already in the chain, named by fingerprint (§5.2, §5.13), or on none. Who fills a spot under it is said by its own K5 cMIP (5.10.2), and a filling under it has the rights that version offers (5.10.7).

2. **What it replaces, and the code it meets.** N6 and G10.7 in one rule [traced: the trace's row for 5.10.8]. The code: the verifier's own promise never to answer "no longer applies", `core/src/agreements_new/grammar/mod.rs:25`; K1's output has no part for it, `core/src/agreements_new/grammar/sockets.rs:119` [traced].

3. **What a verifier would answer differently.** Ana's offer, version 1, sells a month, names a clock, and its body's cMIP reads the month. Carla bought on 1 March. *Before:* no question asks it, and the code's doc says it never answers that her rights no longer apply. *After:* asked on 2 April, the verifier shows K1's answer, "no longer applies", with its ground, **per clock**, as the cMIP's and not its own; lacking the cMIP, **unchecked** [traced: 5.10.8].

4. **Size.** A rule, and a field: K1's output gains "whether what a filling gave still applies, with its ground", and the verifier a question that shows it.

5. **Vectors.** New:
   - **Still applies**: version 1 names a clock; a K1 stub answers that what Carla's filling gave still applies, with its ground. The new question, what a filling gave: **yes (the task's output)**, K1 named, per clock.
   - **No longer applies**: the same, K1 answering no: **no (the task's output)**, per clock; never **triggered**.
   - **K1 lacking**: the same, the verifier not holding the body's cMIP: **unchecked**.

6. **The build list and the sheet.** The ledger's "Ana's month ends by the clock the agreement names" falls here [traced: "The clock specified in the agreement and its anchoring."].

7. **Choices the text leaves.**
- Which act "the anchoring of the purchase" anchors (the draft's report, item 12): the assent that earned the filling, the payment, or its settlement?
- A version that names no clock: "no term in time can be read from it". Does the verifier then show nothing, or pass on K1's answer without a qualifier? Where K1 declares a clock it needs, 5.8.6 makes the Terms invalid; where it declares none, the text gives no answer word [inferred].

---

## 5.11 Legs of a sequence

### 5.11.1 Sequence, and leg

1. **The rule.**

> **5.11.1** **Sequence, and leg.** Where what one agreement gives or owes reaches another agreement (a party named as an agreement, 5.1.1; a receiver that is an agreement, 5.1.3), and so on from one to the next, those agreements are a **sequence**. A **leg** is one obligation carried out, between its two sides: the **doer**, who carries it out, and the **receiving side**, who receives it. A payment to an agreement is a leg between the payer and that agreement's receiver for the payment (5.1.4). A payout divided among several is one leg for each of them: between whoever pays out (a service, or a party who receives for the others) and each one paid; where one paid is an agreement, that agreement's receiver for the act (5.1.4). These grammar rules define the two sides of a leg, and nothing more of it. Each leg is carried out under the Terms that hold its task (5.11.2), or, for a payment, under the offer's Terms the buyer signed, which require it, the payment itself holding the task of paying and its call (5.11.7); the cMIPs that read it are the ones those Terms name (§5.2). Nothing in one agreement's choice of cMIPs binds another agreement, and nothing is chosen for a sequence as a whole. The agreements of a sequence MAY name the same cMIPs; none is required to.

2. **What it replaces, and the code it meets.** G11.1, unchanged but for references [traced: the trace's row for 5.11.1]. The code: `core/src/agreements_new/grammar/legs.rs:97` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.11.2 The call

1. **The rule.**

> **5.11.2** **The call.** Terms hold the Control task (K6) where their field `control` names a cMIP (§5.2); or, with that socket empty, where they name as `receiver` one of their own parties (5.1.3) and give a part to any other party, so that this party holds for the others and passing on to them is its obligation under those Terms. Whether Terms give a part to a party is read from their words, as the body's cMIP gives them (task K1): a share for any party other than the receiver. Where the verifier cannot read the body, or lacks the cMIP in `control`, whether those Terms hold the task is **unchecked** (§3.6). Terms that hold the task MAY carry a call for it, in `calls`, as the report block of the shared language gives it (the MICS, §2): from whom a report is expected (the doer, the receiving side, or both). A call names no keeper and no reader (§3.1). For K6, the doer is whoever carried out the passing on (the controller: a service, or a party that receives for the others): the party those Terms name as `receiver` among their own parties. Where the receiver those Terms name is not one of their own parties (another agreement, or none), no doer is shown under those Terms: what reaches them is passed on under the Terms of the agreement it reaches (5.1.4). And the receiving side of each leg is whoever something was passed on to; where that is an agreement, it is that agreement's receiver for the act (5.1.4), and no other of its parties. The call is made by the signers of those Terms, and binds no one else. In a deal, those signers are the service and the agreement it serves, which signs by its own signature (5.1.2): the call is that agreement's parties' as much as the service's, and each party that signature binds has signed the deal through its agreement. Whoever receives is the receiving side of its leg whether or not it signed the Terms that carry the call. Where it did not, itself or through an agreement's signature, these grammar rules do not make the path to it a signed one: closing that gap is a cMIP's (§6). A call is attached to a task, in the Terms under which that task is carried out; none is attached to a receiving side. A call in Terms that do not hold the task it is attached to is left unread, and the verifier says so (5.2.3). These grammar rules make no Terms carry a call, and make no one answer one. A call is part of signed Terms and is read as they are (§5.2, 5.5.3), by anyone, before any payment is made.

2. **What it replaces, and the code it meets.** G11.2, with one sentence cut for the MICS: "and a report that states a doer's lines under these Terms is listed, as its signer's word (G8), and ties nothing" [traced: the trace's row for 5.11.2]. The code: `core/src/agreements_new/grammar/legs.rs:21`, `core/src/agreements_new/grammar/legs.rs:56` [traced].

3. **What a verifier would answer differently.** Whether Ana's Terms hold the Control task: as today. A report stating a doer's lines where no doer is shown is no longer Agreements' to list; the MICS's report block reads it [inferred: the companion, "a verifier of the MICS's report block then answers what draft 25 had answered here"].

4. **Size.** None in this rule's answers; the cut sentence moves with 5.11.4's.

5. **Vectors.** Renamed only: case 79 (Terms whose `control` names a cMIP hold the Control task); case 87 (with `control` empty, a receiver among the parties who holds for others holds the Control task); case 88 (with `control` empty and no part given to another party: the Control task is not held); in `valid.json`, "terms: two calls, from the doer and from the receiving side". New: none.

6. **The build list and the sheet.** R11 (the doer where the receiver is an agreement that is a party) and R19 (`control` empty, a receiver who holds for others): draft 26 keeps G11.2's wording; both stay readings [traced].

7. **Choices the text leaves.** None new.

### 5.11.3 Leg report

1. **The rule.**

> **5.11.3** **Leg report.** A leg report is a report that answers such a call. As every report does, it carries the call it answers and the acts it relied on, each by fingerprint, and its signer. Among the acts it relied on are the version of the Terms it passed on by (§5.13) and each settlement it speaks of (5.9.1). Beyond that, it carries what K6's row says (§6). Each signer reports its own half only. What K6's row asks of a leg report MUST be readable without any cMIP those Terms name. Where one doer carries out several legs under one call (a payout to several), which lines of its report each receiving side receives (all of them, or those of its own leg) is said by the cMIP that answers the task (K6). These grammar rules do not say it. How a leg report is read is the MICS's report block's (§2).

2. **What it replaces, and the code it meets.** G11.3, on the lead's reading: what a leg report carries stays, how it is read goes to the MICS [traced: the trace's row for 5.11.3]. The code: `core/src/agreements_new/grammar/legs.rs:97` reads leg reports and ties their halves [traced].

3. **What a verifier would answer differently.** That a leg report of Ben's is readable with no cMIP stays. That the verifier reads it side by side with Ana's, and how, leaves for the MICS; see 5.11.4.

4. **Size.** A removal, counted under 5.11.4.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** D9 ("The baker's and the report block's rules, still in Agreements' verifier"): draft 26 now says what was decided, so D9 becomes a translation error against draft 26 [traced: D9, "Each moves into the translation errors once draft 25 is redrafted"].

7. **Choices the text leaves.** None.

### 5.11.4 Before paying

1. **The rule.**

> **5.11.4** **Before paying.** Asked which agreements of a sequence carry a call for reports, a verifier answers from their Terms alone (5.11.2), one agreement at a time, per keeper or as shown (5.5.3), and **unchecked** where it lacks them. It answers in the same way, from the same Terms, from whom each call expects reports, and whether those Terms name a data cMIP, in `data` (task K8), by which their signers agreed to a path beyond the leg (5.11.5): **shown**, with its fingerprint, where they name one; where `data` is empty, it answers that no path beyond the leg is agreed in those Terms. For an offer, that answer is also the path a buyer agrees to for their own leg by signing its Terms (5.11.6). The agreements of a sequence, for this question, are found from the agreement asked about by following `receiver` from agreement to agreement, until one names one of its own parties, or none (5.1.4). Parties named as agreements are not walked: which of them a payment reaches is their own Terms' and cMIPs' to say.

2. **What it replaces, and the code it meets.** G11.4(e), on the lead's reading; G11.4's opening and (a) to (d) (where to look, the tie, amounts, silence) leave Agreements for the MICS [traced: the trace's row for 5.11.4, "G11.4(e), stays, **on the lead's reading**"; the companion's section 10, row G11.4: "left: to the MICS"]. The code: `core/src/agreements_new/grammar/legs.rs:324` stays; `core/src/agreements_new/grammar/legs.rs:97` and `core/src/agreements_new/grammar/legs.rs:182` give G11.4(a) to (d)'s answers [traced].

3. **What a verifier would answer differently.** Before paying, Ben asks which agreements of the sequence carry a call: as today, per keeper for per place. Asked whether Ana's and Carla's halves of a leg match, an Agreements verifier no longer answers **matched**, **mismatched**, **one side only**, **unanswered** or **no report called for**: those are the report block's words, given by a verifier of the MICS (§3.6, "Of reports, a verifier also shows what the MICS's report block asks it to show, in that block's words, which are not answers of this text") [traced].

4. **Size.** A removal: `leg` and `silence` leave the Agreements verifier, or stay as the report block's module, named so.

5. **Vectors.** Renamed only: case 91 (before paying: which agreements of a sequence carry a call, from whom, and their data cMIP, one at a time). Retired, with G11.4(a) to (d): case 78 (one leg's call, its two halves matched); case 80 (one leg's call, its two halves mismatched: both shown, neither chosen); case 81 (one leg's call, the doer's half only: one side only); case 82 (a confirmation by a party named as a signer, of which no doer's report speaks: one side only); case 83 (a call that expects one side only: each report shown as stated, no tie answered); case 84 (a call with no report, read by a side of that leg: unanswered); case 85 (a call with no report, read on behalf of no one: that leg's reports are not shown); case 86 (Terms that hold the Control task and carry no call: no report called for). New: none.

6. **The build list and the sheet.** D9, as at 5.11.3 [traced].

7. **Choices the text leaves.**
- Do the retired cases move to a vector file of the MICS's report block (the same bytes, the same answers), or go until that block is rewritten after draft 26 (the MOR lead's settled note, M24, "The MICS is rewritten after draft 26")?

### 5.11.5 Reports are data: a path beyond one leg

1. **The rule.**

> **5.11.5** **Reports are data: a path beyond one leg.** A report is data. A path by which a report, or what it states, reaches anyone who is not a side of its leg (a partner seeing further, a request from upstream) is a path the people whose data it carries agreed to, with their signature. It is built as a cMIP about data, focused on agreements, which Terms they signed name by fingerprint (§5.2). These grammar rules give no such path themselves: no call, no field and no answer of this text carries a report beyond its leg, and a verifier MUST NOT read any as doing so. What such a cMIP says is its own: who may read what, how a reader puts together the legs it may read, how far it follows, and what a loop answers. **The data task.** Terms name such a cMIP in the field `data`: the task K8 (§6). Its one question, asked for one reader and one report of a leg carried out under those Terms: may this reader read it, or what it states, beyond its leg? It answers yes or no. These grammar rules take that output and add nothing to it. The socket speaks for the people bound by the Terms that name it (5.6.1), and for no one else. Where it is empty the answer is no: one leg. Where a report carries the data of people bound by different Terms (the two sides of a leg), the data cMIP of each is asked, and the report is read beyond its leg only where every one asked answers yes. **Which Terms are asked.** About one report: the Terms that carry the call it answers; and, for each agreement a line of the report names as passed on to or owed to, that agreement's Terms in force (5.5.3). A receiving side named as a signer of the Terms that carry the call is asked through those Terms. Where Terms that are to be asked are not held, the answer is **unchecked** (§3.6). What a data cMIP is beyond that socket is not said here.

2. **What it replaces, and the code it meets.** G11.6(a), its quotation and "that last reading is Claude's" going to the companion [traced: the trace's row for 5.11.5]. The code: `core/src/agreements_new/grammar/legs.rs:227` [traced].

3. **What a verifier would answer differently.** Nothing: where a report carries the data of people bound by two Terms, it is read beyond its leg only where every data cMIP asked answers yes, as today.

4. **Size.** None.

5. **Vectors.** Renamed only: case 89 (may a reader read a leg report beyond its leg: a data cMIP that answers yes for this reader); case 90 (may a reader read a leg report beyond its leg: an empty data socket: one leg). New: none.

6. **The build list and the sheet.** R20 (two data sockets, "that last reading is Claude's"): draft 26 states the reading as the rule, without the label; R20 is settled as the code reads it [traced].

7. **Choices the text leaves.** None.

### 5.11.6 Who has agreed

1. **The rule.**

> **5.11.6** **Who has agreed.** A verifier MUST NOT read the people of a leg as having agreed to be read from beyond their leg unless Terms they signed say so (5.6.1): by naming such a data cMIP in `data` (K8), or by a rule in them under which others decide it. Which consent a data cMIP asks of the people it reads is that cMIP's to say. Which cMIP, and which rule, apply is what the signers chose when they made the agreement, and is read from the Terms they signed (§5.2). Where those Terms say that a majority decides, the majority decides (5.6.1(b)): a verifier reads a member who was outvoted as that rule says, and MUST NOT answer, beyond it, whether that member agreed. **What the buyer agreed to.** A buyer signs Terms: those of an offer, by an assent to the version they buy under, and paying is what those Terms require of them (5.11.7). So a buyer is bound by that version by their own assent (5.6.1(a), 5.10.3), its data socket included. For a report of the buyer's leg (a confirmation of a payment), the Terms asked are the version the payment names (§5.13), where an assent of the payer to that version is held: its data cMIP speaks for the buyer, and for the receiving side where the receiver for the payment is one of that version's own parties (5.1.4). Where the receiving side is reached through another agreement (5.1.4), that agreement's Terms in force are asked too, as for any report that carries the data of people bound by different Terms (5.11.5), and the report is read beyond its leg only where every one asked answers yes. Where the version's `data` is empty, the answer is no: one leg. Where no assent of the payer to the version its payment names is held, the payer is not shown as bound by those Terms, nothing they signed says that they agreed to be read from beyond their leg, and the answer is no for every reader who is not a side of that leg.

2. **What it replaces, and the code it meets.** G11.6(b), on the lead's reading [traced: the trace's row for 5.11.6]. The code: `core/src/agreements_new/grammar/legs.rs:227` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: case 98 (the buyer's leg beyond it: the offer's `data` is empty: no, one leg). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.11.7 The buyer's leg

1. **The rule.**

> **5.11.7** **The buyer's leg.** Paying an agreement is a leg (5.11.1). Its doer is the buyer: a signer of the offer's Terms, whose assent names the version they buy under, and whom those Terms require to pay (5.11.6). Paying is the consequence of the Terms the buyer signed, as for any signer of any Terms; the buyer differs only in that their identity was not known when the offer's maker drafted and signed it (§3.2, **Offer**). The buyer also signs the payment (§5.13), which carries out what those Terms require. Its receiving side is the receiver, for that payment, of the agreement paid (5.1.4). A payment is the act that holds the task of paying: the Control task (K6), with the payer as its doer. The payer, its signer, may call for the receiving side's confirmation, as the signer of any act that holds a task may (the MICS's report block, §2). These grammar rules read every payment as carrying that call: the buyer's confirmation by default is that call, made by default, and no Terms need write it. The confirmation is a report that answers it. A report names the call it answers by naming the act that holds it; for this call, made by default, it names the act that stands for it: the settlement the payment names, the act both sides can see, and never the payment itself. A report whose call names that settlement is the confirmation of that payment. The payment is the doer's half of that leg: its signer is the buyer, and it names the settlement. The confirmation is the receiving side's report, its signer's word (the MICS, §2). How a payment and its confirmation are read together is the MICS's report block's (§2). After the confirmation comes access to what was bought. What that is, and who gives it, is said by the version the payment names and its cMIPs (5.10.7, §5.13; delivery, §6); these grammar rules do not read it. By default the buyer is shown nothing further. What the receiving side then does with the payment is further legs, and their reports go to the two sides of each (the MICS, §2). The buyer's own leg is read beyond it only as the data cMIP of the offer's Terms the buyer signed gives (5.11.6); the buyer reads a further leg only as a data cMIP the people of that leg agreed to gives (5.11.5). The call binds only its signer, the payer: these grammar rules make no one confirm (5.11.2).

2. **What it replaces, and the code it meets.** G11.7, with its reading of the two halves cut for the MICS: "As for any two halves, a verifier shows a payment so confirmed as **matched**" and what follows [traced: the trace's row for 5.11.7; the diff of the two rules' sentences, by the build script]. The code: `core/src/agreements_new/grammar/legs.rs:280` [traced].

3. **What a verifier would answer differently.** Ben pays Ana's offer; Ana confirms. An Agreements verifier still reads the payment as the doer's half and the confirmation as the receiving side's report naming the settlement; whether the two match is the report block's to show [traced: 5.11.7, "How a payment and its confirmation are read together is the MICS's report block's"].

4. **Size.** A removal: `buyer_leg`'s matching goes with 5.11.4's.

5. **Vectors.** Retired: case 92 (the buyer's leg: the payment and the receiving side's confirmation, matched); case 93 (the buyer's leg: the payment and the receiving side's confirmation, mismatched); case 94 (the buyer's leg: the payment and the receiving side's confirmation, one side only). In `valid.json`, the confirmation naming its settlement keeps its verdict (its bytes are the report block's proposal, session 3's). New: none.

6. **The build list and the sheet.** R10 (a report that names the payment itself): 5.11.7 keeps "never the payment itself"; what a verifier does with such a report is the block's now [traced]. R10 leaves Agreements.

7. **Choices the text leaves.** As at 5.11.4.

### 5.11.8 The contest

1. **The rule.**

> **5.11.8** **The contest: an act, made against an offer or a vow.** A contest is an act of these grammar rules: a Statement of kind `contest`. It is made against an offer or a vow (§3.1, **Vow**; §3.2, **Offer**): its `agreement` names the root of that offer or vow, and its `terms` names the version it is made against. Whom it reaches follows from what it is made against: the signers of that offer or vow (one level, 5.1.2), and no one else. A contest made against a vow is read exactly as one made against an offer. A verifier reads a contest made against any version alike: whether that version names a party by role is shown beside it, and changes no answer. The signers a contest reaches are the parties that version names as signers; a signer who fills a role is not counted among them. Its `terms` names Terms shown as a version, or a tip set aside (then the contest is shown as **disputed**, §5.12); otherwise the contest is **not shown**. A contest is its signer's word, reported as such (the MICS, §2), and stands in its signer's own line (§5.7). **A buyer's contest** is a contest by which a buyer says that what they bought was not delivered after payment. It is made against the offer or vow the buyer bought under, names the version the payment read (§5.13), and names in `settlement` the settlement the payment names, the act both sides can see (5.9.1), and never the payment itself. These grammar rules read a buyer's contest only there: where what was bought was not delivered after payment. A verifier shows a contest as a buyer's where it holds a payment by the same signer that names the same settlement and the same version; where it holds no such payment, whether the contest is a buyer's is **unchecked** (§3.6). That it was not delivered is the buyer's word (the MICS, §2). A verifier MUST NOT read a contest as contesting anyone but the signers of what it is made against: not a service those signers picked, not a deal of theirs, not any other agreement of the sequence. It MUST NOT read a contest as giving its signer sight of any leg (5.11.5, 5.11.7). Where those signers believe the fault is their service's, they contest the service: a contest of their own, made within the deal they signed with it (5.1.2), which reaches the service and is read no further. Whether such a deal, signed by parties who were known, is an offer or a vow is not said. A baker may contest Terms for another envelope of the same work (5.11.9). Who else may make a contest, and when, is not said. What a contest does beyond standing on the record, who answers it and how, and how money comes back, are not these grammar rules' (§6).

2. **What it replaces, and the code it meets.** G11.8, references moved, "bake" read "envelope" [traced: the trace's row for 5.11.8]. The code: `core/src/agreements_new/grammar/legs.rs:371`; a contest built on a tip counts for nothing, `core/src/agreements_new/grammar/legs.rs:407` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: case 95 (a contest made against an offer: it reaches the signers that version names, and no one else); case 96 (a buyer's contest: a payment by the same signer naming the same settlement and version is held); case 97 (a contest naming a settlement, and no such payment held: whether it is a buyer's is unchecked); in `valid.json`, the buyer's contest and the contest with no content. New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None new.

### 5.11.9 A baker may contest

1. **The rule.**

> **5.11.9** **A baker may contest.** The holder of the baker's rights in an envelope, as the envelope's chain names them (Envelopes, §2), MAY make a contest (5.11.8) against Terms that name another envelope of the same work. It reaches the signers of those Terms, is its signer's word (the MICS, §2), and stands on the record. The holder of the baker's rights is read at the act the contest cites: a contest names an envelope, whose baker's rights its signer holds, and the act of that envelope's chain it relies on (5.13.2), and the holder is read at that act of the envelope the contest names, not from the contested Terms. Who holds the baker's rights, and what follows from them, are Envelopes' (§2). That its signer is the one who made the work is not shown by any act.

2. **What it replaces, and the code it meets.** G14.5(e), on the lead's reading, worded on the holder read at the act the contest cites [traced: the trace's row for 5.11.9]. The code: none. `contest` reads the version and its signers, never the envelope's chain [traced: `legs.rs:371` to `legs.rs:412` name no envelope]. The rest of G14 goes to Envelopes [traced: the companion, "The baker's lines of draft 25 (G14) go to Envelopes with its rules"].

3. **What a verifier would answer differently.** Ana baked a work; Ben bakes the same bytes again and makes Terms for his envelope. Ana contests Ben's Terms, naming her envelope and the act of its chain she relies on. *Before:* a contest like any other, reaching the signers of Ben's Terms, with nothing said of Ana as baker. *After:* the same, and Ana's standing read at the act her contest cites, from her envelope's chain [inferred: 5.11.9; how the verifier shows that standing is not said].

4. **Size.** A rule: the contest reads the holder of the baker's rights at the act it cites.

5. **Vectors.** New:
   - **A baker's contest**: envelope E baked by Ana; envelope F, of the same work, baked by Ben; Ben's Terms name F; Ana's contest against them names E and the act of E's chain it relies on, at which she holds the baker's rights. `contest`: **shown**, 5.11.9, reaching the signers of Ben's Terms, Ana read as the holder at the act cited.
Not counted here: cases 99 to 113 test G14, which leaves for Envelopes with no rule of draft 26's 5.7 to 5.13 in its place; they fall between this part and session 1's (§4.2's `envelope` rows, read by "the baker's rules, in Envelopes"), for session 4 to place [traced: the case list, by the build script].

6. **The build list and the sheet.** D9's baker half, R2, R9, R21 to R23, R26 and T6 rest on G14 [traced: the build list's rows]; they leave Agreements with it, T6 also being moot under 5.13.5 (see the closing table).

7. **Choices the text leaves.**
- A contest whose signer is not the holder at the act it cites: is it **not shown** as a baker's contest and shown as a contest, or not shown at all ("Who else may make a contest, and when, is not said")?

---

## 5.12 Forks

### 5.12.1 A fork is a fork

1. **The rule.**

> **5.12.1** **A fork is a fork.** Where two acts compete to change the same state, with no order shown between them, these grammar rules know one thing: the fork (§3.3). Where a fork exists there may be a race between its sides, or it may be resolved among all involved; these grammar rules do not say which, and read both alike. Neither act takes effect, and the earlier state stays, until the fork is resolved by a new act, made in an order that can be told, as the agreement's own update condition asks or under a power to resolve given in advance (5.12.4, 5.12.5). A verifier answers **fork**, and MUST NOT choose between its sides. How forks are treated in different cases is not these grammar rules': it is the cMIPs' that the parties chose, and the parties' own.

2. **What it replaces, and the code it meets.** New (N8) [traced: the trace's row for 5.12.1; the ledger, "A fork is a fork. When a fork exists there could be a race between a white party and a black party. Or, the fork could be resolved amicably by all emvolved"]. The code: the word **fork**, given for a signer's line (`order.rs:298`) and for Terms (`chain.rs`) [traced].

3. **What a verifier would answer differently.** Nothing beyond 5.12.2's widening: two updates of one version, two acts of one line, and now a coming into force against a counter signature (5.4.5, session 1's) are all a **fork**. The race's word of 26 November (the sheet's Q5) is withdrawn [traced: the ledger, "A fork is a fork", 27 November, 07:01].

4. **Size.** None in this part; the counter signature's fork is session 1's (cases 36, 37).

5. **Vectors.** None.

6. **The build list and the sheet.** The sheet's Q5 is settled toward (A) (**fork**), and its Q6 toward (A) (a fork of Terms is still resolved by a resolving update) [traced: the ledger, "The gate and the pin; a fork, not a race", and "A fork is a fork"]. Cases 17, 21, 22, 23, 24, 26, 27, 28 do not move on those questions.

7. **Choices the text leaves.** "How forks are treated in different cases is not these grammar rules'": nothing for the verifier.

### 5.12.2 Lines, updates and forks

1. **The rule.**

> **5.12.2** **Lines, updates and forks.** A **line** is a set of acts of which each names the one before it, so that only one act may follow each: one signer's acts within an agreement, by `previous` (5.7.1); an agreement's Terms, by `replaces` (§5.5); and any other acts these grammar rules read as following one another. An **update** of an act is an act that names it as the one before, and that all the parties that needed to sign it have signed: for one signer's line, that signer (5.7.1); for Terms, those whose signing the update condition asks, or the default (the gate, 5.5.1(a), 5.5.5, 5.5.7). For Terms, a late update (5.5.4) is no update of the version it names. Where an act has one update, that update is the next act of the line. A **fork** is two acts competing to change the same state, with no order shown between them: two updates of the same act of one line (5.5.4, 5.7.2); Terms coming into force against a counter signature that cancels one of the assents they need (5.4.5); or any other. Three or more are one fork with that many tips. Two acts of one signer that both name no `previous` are a fork with no shared act. These grammar rules see a fork from the acts alone: for a fork of a line, two acts were signed by all the parties that needed to sign them. They say nothing of what anyone meant. Where the fork is of a line, the act both follow is the **shared act**; each of the two updates is a **tip**; a tip, with every act that follows it in the line, is a **branch**.

2. **What it replaces, and the code it meets.** G12.1, widened to two acts competing to change the same state [traced: the trace's row for 5.12.2]. The code: forks of a line, `core/src/agreements_new/grammar/line.rs:67`; forks of Terms in `chain.rs` `step_from` [traced].

3. **What a verifier would answer differently.** For lines and Terms, nothing. The new member, "Terms coming into force against a counter signature that cancels one of the assents they need", is answered in 5.4.5 (session 1).

4. **Size.** A word here ("or any other"); the rule is 5.4.5's.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** D2 ("A withdrawal racing the Terms' completion", case 36) is 5.4.5's; it is listed for session 1.

7. **Choices the text leaves.**
- "or any other": which acts compete "to change the same state" (the draft's report, item 8)? The code has two kinds of fork only (a line, a version), and a third would be a new branch [traced: the report's list; inferred for the code].

### 5.12.3 Both tips stop

1. **The rule.**

> **5.12.3** **Both tips stop.** While a fork stands, neither tip counts as the next act of its line, and nothing built on either tip counts: no act that follows a tip in the line, and no act that rests on a tip or on an act built on it (it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch), however many namings lie between. **One thing an assent to a tip still counts for.** A fork of Terms is two updates each signed by all who needed to sign, and the signing is the assents. So an assent to a tip, among the assents that count (5.5.7(a)), counts for whether that tip was signed, and for nothing else: it binds no one while the fork stands, since the Terms it names are not in force (5.4.3). Every other act that rests on a tip (through `under`, `answers` or `relies_on`, or as the version a payment read) counts for nothing while the fork stands; a payment that names a tip is read as 5.1.4 says. The shared act stays the last act of the line that counts: for Terms, the last shared version stays in force (5.5.4(e)). A verifier MUST show both tips, and what it holds that is built on them, with the fork; MUST answer **fork** where 5.5.4 and 5.7.2 say; and MUST NOT choose between the tips, by position or in any other way. A fork stands until 5.12.4 resolves it. Terms that were in force before a fork was made stay in force: Terms stop only by replacement (5.5.2).

2. **What it replaces, and the code it meets.** G12.2, unchanged but for "among the assents that count (5.5.7(a))" and references [traced: the trace's row for 5.12.3]. The code: `core/src/agreements_new/grammar/line.rs:206`, following every field an act names, at `core/src/agreements_new/grammar/line.rs:218` [traced].

3. **What a verifier would answer differently.** Ana's and Ben's Terms are in force. Ben then makes two acts naming the same `previous`, one of them his assent. *Before:* Ben's assent stops, and with it the Terms' coming into force: not in force (build-list row T1). *After, as draft 25 already says:* in force; "Terms that were in force before a fork was made stay in force" [traced: T1, `force.rs:243`].

4. **Size.** A rule, already owed (T1, T4).

5. **Vectors.** Renamed only: case 39 (both tips of a signer's fork stop: neither assent counts, and the Terms are not in force); case 40 (an assent that is a tip of a signer's fork: not shown, it does not count). New:
   - **T1**: Ana's and Ben's Terms in force; Ben's next two acts both name his assent in `previous`, one of them naming Ana's assent in `relies_on`. `in_force`: **shown**, the Terms stay in force; `line` for Ben: **fork**.
   - **T4**: Ana's line forked; Carla's Statement names one of Ana's tips only in `resolves`, resolving nothing. `assent` of Carla's: it counts; it is not built on the tip.

6. **The build list and the sheet.** T1 kept: draft 26 keeps the sentence. T4 ("Built on a tip" follows every field) kept: 5.12.3 and §3.3, **Built on a tip**, keep the list `terms`, `under`, `answers`, `relies_on`, while the code follows every field, `resolves` and `settlement` included [traced]. 5.13.1 now makes every field a knot; "built on" is a separate list, so T4 is not made moot [inferred].

7. **Choices the text leaves.**
- Does 5.13.1's widening of knots to every field widen "built on a tip" too? The text keeps two lists; the code keeps one (T4).

### 5.12.4 Resolving update

1. **The rule.**

> **5.12.4** **Resolving update.** A fork of a line is resolved by an update of the shared act: an act of the same line whose `previous`, or for Terms whose `replaces`, names the shared act; which names every tip in `resolves`, by the list of the tips' ids (§4.2, §4.3); and which names one of them in `continues`. It resolves the fork only when it is signed as an update of the shared act must be: for one signer's line, by that signer (§5.7); for Terms, so that the update condition of the shared Terms answers valid for it, which says who must sign it; by default, the known parties (5.5.5(a), 5.5.7(g)); or under a power to resolve (5.12.5). A resolving update of Terms that resolves is an update of the shared Terms and takes an update's answers: **valid**, by their update condition or its default, and **in force** once pinned (§5.5); one signed under a power to resolve is answered as 5.12.5 says. The tip it names in `continues` then counts as the next act of the line, what is built on that tip counts as these grammar rules read it, and the line goes on from that branch. Every other tip is **set aside**: it never counted as the next act of the line (for Terms, it never counted as the next version), and no act that follows it in the line counts. A resolving update is not a tip of the fork it resolves, and carries no words of its own: it carries only what §4.3 says it carries. An act that names `resolves` and no `continues` resolves nothing. An act that names `resolves` and does not in fact resolve the fork it sits in (it is not signed as this rule asks, or does not name every tip, or there is no fork: what it names in `resolves` is one update and no other) is an act like any other, and may itself be a tip: a fork is not hidden by adding the field. Where what it names in `resolves` are not the tips of a fork in its own line (for a Statement of kind `resolve`, its signer's line; for a Terms act, the agreement's chain), a verifier answers **not shown** for it as a resolving update, with the reason: nothing to resolve; where it fails otherwise, **not shown**, with the reason it fails (not signed as this rule asks, or not naming every tip). Where such an act names the shared act as the one before it, it is an update of that act beside the one it names, and the two are a fork. A resolving update MUST name every tip, and MAY name more acts than the tips. Where the two tips of a signer's line both name no `previous`, a resolving update that also names none resolves them. **After a fork is resolved.** An act that names the resolving update as the one before it (in `previous`, or for Terms in `replaces`) is read as following the last act of the continued branch. So the next act MAY name either. But two acts, one that names the resolving update and one that names the last act of the continued branch, are two updates of the same act, and a fork. For Terms the same holds: a version whose `replaces` names a resolving update replaces the last version of the continued branch, and the update condition asked of it is that version's (5.5.7(e)). These grammar rules give the form of a resolving update for a fork of a line only.

2. **What it replaces, and the code it meets.** G12.3, changed: the default signers are the known parties; `resolves` is the list of the tips' ids; a resolving update of Terms takes an update's answers; one that resolves nothing is **not shown**, with the reason [traced: the trace's row for 5.12.4]. The code: `core/src/agreements_new/grammar/order.rs:334`; a line's resolve, `core/src/agreements_new/grammar/order.rs:352`; the fall-through, `core/src/agreements_new/grammar/order.rs:355`, which for any act that is not a Terms act answers `core/src/agreements_new/grammar/order.rs:121`; Terms resolving updates checked at `core/src/agreements_new/grammar/chain.rs:697`, "no fork" at `core/src/agreements_new/grammar/chain.rs:700` [traced].

3. **What a verifier would answer differently.** In the round, the author of root `db3ce515…` signed `06b0f886…`, a Statement of kind resolve, naming in `resolves` two Terms acts, `5b9e8c91…` and `bba99964…` [traced: the round's answers, entry 571]. Those are not tips of a fork in that signer's own line. *Before:* `resolution`: **unchecked**, G4.8, "it resolves nothing, and is read as an act like any other (G12.3): not held (G9)" [traced: the round's answers, 1c, "`order.rs` line 355 falls through to `update`, which at line 121 answers **unchecked**"]. *After:* **not shown**, 5.12.4, "nothing to resolve" [traced: 5.12.4]. A Terms act shaped as a resolving update where there is no fork: *before*, its answer as an update; *after*, **not shown** as a resolving update, "nothing to resolve", beside its answer as an update [traced]. A fork of Terms resolved: *before*, `resolution` **shown**, G12.3 (case 22); *after*, on one reading, **valid** by the shared Terms' condition or its default, and **in force** once pinned [inferred; question below]. Carla filled a spot of the shared version and Ana and Ben, its known parties, sign the resolving update: *before*, not resolved (the default asked everyone who signed the shared version, Carla among them) [inferred, as the sheet of 26 November read `signed_by`, section 8]; *after*, resolved, **valid** by default [traced: 5.12.4, "by default, the known parties"].

4. **Size.** A word ("not shown, nothing to resolve" for the fall-through), and a rule (the default signers, and an update's answers for a resolving update of Terms).

5. **Vectors.** Changes answer, if read so: case 22 (a fork of Terms resolved by an update of the shared Terms that names every tip and the one that continues); renamed only on the other reading. Renamed only: case 23 (after the resolving update, the tip continued is in force); case 24 (the other tip is set aside: it never counted as the next version); case 26 (an act shaped as a resolving update where there is no fork is an update like any other: with the other, a fork); case 41 (a signer's fork resolved by that signer's resolving update: the line goes on from the tip continued); case 42 (after the resolution, the continued assent counts: the Terms are in force). New:
   - **A resolve in an unforked line** (26 November, line 6, (1); the round's `06b0f886…`): Ana's resolve names two Terms acts in `resolves`. `resolution`: **not shown**, 5.12.4, nothing to resolve.
   - **A Terms act shaped as a resolving update, no fork** (line 6, (2)): `resolution`: **not shown**, nothing to resolve, beside its answer as an update.
   - **A resolve in an unchecked line**: Ana's resolve names two acts in `resolves`, one of them not held. `resolution`: **unchecked** (the MOR lead's note, Q11).
   - **The known parties resolve**: version 1 names a role, which Carla fills; two version 2s fork; Ana and Ben sign the resolving update. `resolution`: **valid** by default, the known parties; `last_version`: the continued tip, in force once pinned.

6. **The build list and the sheet.** The resolve that resolves nothing (`order.rs:355`, G12.3): changed, toward the sheet's Q10 (A) and the round's Q3 (B), both "not shown" [traced: the settled note, M13, Q10, Q11, "A resolve that resolves nothing: "not shown, nothing to resolve". A resolve in a line that is itself unchecked: unchecked."]. The sheet's line 6 and its two new vectors fall here; its Q10 is settled (A) and its Q11 (A) by the MOR lead's note, though draft 26 does not write Q11's case [traced]. R8 (two versions by one author, one resolving act) stays a reading: §4.3 lets a Terms act written as a resolving update resolve "a fork in one signer's line" where that line forked in Terms acts, and does not say whether one act resolves both the signer's line and the chain [traced: §4.3]. R14 (the condition asked of a resolving update): draft 26 asks it, as the code does (5.5.7(g), session 1's) [traced].

7. **Choices the text leaves.**
- Asked `resolution` of a resolving update of Terms that resolves, is the answer **valid** and **in force** (5.12.4, "takes an update's answers") in place of today's **shown**? Case 22 moves if so.
- A resolve in one signer's line that resolves has no answer word in 5.12.4 (the draft's report, found items): **shown**, as today (cases 41, 43)?
- Must a resolving update itself be pinned (the draft's report, item 10; 5.12.4 writes "in force once pinned" for Terms)? For a resolve in a line, nothing says.

### 5.12.5 A power to resolve

1. **The rule.**

> **5.12.5** **A power to resolve.** Terms MAY give, in advance, a power (§5.6) to sign the resolving update of a fork: an entry in `powers` whose rule (task K3) says who may sign it, and which resolving update it accepts. A resolving update signed under such a power carries the signatures 5.12.4 asks for, and resolves the fork as 5.12.4 says. For a fork of Terms, the power is read from the Terms both tips replace, which stay in force (5.5.4(e)); it is an entry of `powers` of kind `resolves`, and of no other kind. A power to resolve is part of the judicial: it is set in the Terms, and it is given, changed or removed only by an update the update condition answers valid, never by a power (5.6.5). For a fork in one signer's line too, it is an entry of `powers` of kind `resolves`, in Terms by which that signer is bound: a power to make that act for the signer (5.6.1(b)): the resolving update then stands in the line of whoever signed it, its `previous` is that signer's own, its `for` names the signer whose line forked, and it resolves by naming the tips. That resolving update is a Statement of kind `resolve` (§4.3): a power of kind `resolves` is for Statements of that kind in a signer's line, and for no Statement of another kind. How the fork is resolved is the power's rule's: it may accept only the resolving update it computes from the acts and the keepers' answers, whoever signs it, or accept the one a named person signs (a judge, named in those Terms: 5.6.5; §6), or anything else; these grammar rules force no single way. A verifier MUST report such a resolving update with the power it was signed under and whoever it rests on (5.6.1; the MICS, §2). Its answer about it is **shown**, naming this rule, the power and its rule's answer, and the signer: the update condition is not asked of it (5.5.7(g)), so it is neither valid nor not valid.

2. **What it replaces, and the code it meets.** G12.4, its history sentence moved to the companion [traced: the trace's row for 5.12.5]. The code: `core/src/agreements_new/grammar/line.rs:125` for lines; for Terms, `core/src/agreements_new/grammar/order.rs:341` [traced].

3. **What a verifier would answer differently.** Nothing: **shown**, naming the power and its signer, the condition not asked.

4. **Size.** None.

5. **Vectors.** Renamed only: case 28 (a fork resolved under a power to resolve given in advance: shown, naming G12.4, the power and its signer); case 43 (a signer's fork resolved by a resolve made for that signer under a power to resolve); case 44 (after a resolve under a power, the continued assent counts); in `valid.json`, the resolve made under a power of kind `resolves`. New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None new.

### 5.12.6 What others relied on stands

1. **The rule.**

> **5.12.6** **What others relied on stands.** An act signed by someone who signed none of the acts of a branch whose tip is set aside, and that rests on an act of that branch (it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch), stands: it has the effect these grammar rules gave it, or would have given it had that tip stood alone. A payment that names a version of that branch as the one it read (5.13.2) is such an act. A verifier MUST show that act, and every answer resting on it, as **disputed**. "The acts of a branch" are the acts of the line: for Terms, the Terms acts; whoever signed one of them is not protected here for what they built on it. What stands differs by act. A payment that names a version of that branch is read as if the tip had stood alone: its receiver is read from that version (5.1.4), and both are shown as disputed. **As if the tip had stood alone** means: the line is read with every other tip of that fork, every act built on them, and the resolving update, left out. A version further along that branch is then a version where it would have been one, and a payment that names it is read against it. **A filling earned within that branch** by a proof made by someone who signed none of its Terms acts stands in the same way: it is shown as **disputed**, with the version of that branch it was earned under named; no version of the continued line is named as a later version that changes its rights (5.10.7). An assent, or another Statement made within that branch, by someone who signed none of its Terms acts, stands as an act, shown as disputed, and binds no one: the Terms it names never counted as a version, and an assent binds only while the Terms it names are in force (5.4.3).

2. **What it replaces, and the code it meets.** G12.5, unchanged but for references [traced: the trace's row for 5.12.6; the diff by the build script finds no change of words]. The code: `core/src/agreements_new/grammar/line.rs:255`; the payment's receiver from a set-aside branch, `core/src/agreements_new/grammar/receiver.rs:73`; the branch read as if alone, `core/src/agreements_new/grammar/chain.rs:453` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** Renamed only: case 25 (a payment that names a version of a branch set aside stands: its receiver read from that version, disputed). New: none.

6. **The build list and the sheet.** R16 (a payment naming a version further along a set-aside branch) stays as it was: the sentence it rests on is draft 25's [traced]. T3 ("Stopping without saying unchecked", `chain.rs` `as_if_alone`, 10,000 steps): draft 25's G9.2 ("It MUST NOT answer **not shown** or **invalid** because it stopped") has no general sentence in draft 26; only 5.1.4 says, for receivers, that a verifier that stops answers **unchecked** [traced: a search of draft 26 for "because it stopped" finds nothing]. T3 is changed: for `as_if_alone` and `line_end`, the text no longer says what a verifier that stops answers.

7. **Choices the text leaves.**
- A verifier that stops reading a branch as if alone (or a line's end) before it ends: **unchecked**, as G9.2 had it, or is that left to §3.6's "the verifier lacks something it needs"?

### 5.12.7 A fork that stands

1. **The rule.**

> **5.12.7** A fork that no resolving update has resolved stands: of Terms, as 5.5.4 says; in one signer's line, as 5.7.2 says.

2. **What it replaces, and the code it meets.** G12.6, references moved [traced]. The code: the chain's end, `End::Fork`, read at `core/src/agreements_new/grammar/order.rs:113` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.12.8 Rival resolving updates

1. **The rule.**

> **5.12.8** **Rival resolving updates.** Two resolving updates of the same fork, each signed as 5.12.4 asks, that continue the same tip resolve it, and are no fork. A resolving update of a fork of Terms is an update of the shared Terms (5.5.7(g)): one that is shown, as 5.5.4 says, to have come after another had resolved the fork is a late update, and resolves nothing (5.5.4). Two that continue different tips are themselves a fork: two updates of the same shared act. Neither resolves the first fork while the other stands: every tip stays stopped (5.12.3), and the shared act stays the last act of the line that counts. That fork is resolved the same way: by a resolving update that names the two rival ones in `resolves` and one of them in `continues`, signed as 5.12.4 asks or under a power given in advance (5.12.5).

2. **What it replaces, and the code it meets.** G12.7, "one that the knots or an anchoring show came after" written "one that is shown, as 5.5.4 says" [traced: the trace's row for 5.12.8]. The code: `core/src/agreements_new/grammar/chain.rs:657` [traced].

3. **What a verifier would answer differently.** Only where a reader's anchoring would have shown a resolving update late: under draft 26 it does not (5.13.5) [inferred; counted under 5.13.5].

4. **Size.** A word.

5. **Vectors.** Renamed only: case 27 (two resolving updates that continue different tips: neither resolves the first fork while the other stands). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.12.9 A client's duty

1. **The rule.**

> **5.12.9** **A client's duty (client conformance).** A client that holds both tips of a fork MUST NOT show either tip, or anything built on either, as a resolved act: not as the next version, not as in force, not as that signer's latest act. It shows the fork as unresolved, until 5.12.4 resolves it. This is a duty of clients and not a grammar rule a verifier applies. No verifier can check it: what a client showed a person leaves no act. It is written here and nowhere else.

2. **What it replaces, and the code it meets.** G12.8, unchanged [traced]. The code: none; a client's duty, not a grammar rule.

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

---

## 5.13 Knots: what an act names, and "shown after"

### 5.13.1 What an act is read against

1. **The rule.**

> **5.13.1** **What an act is read against.** An act is read against the versions and acts it names, in any field that holds a fingerprint (`body`, `terms`, `under`, `replaces`, `agreement`, `previous`, `answers`, `resolves`, `continues`, `relies_on`, `settlement`, `envelope`, `envelope_at`, and any other), the body's field included. Each such naming is a knot (§3.4): any fingerprint in any field of any act the verifier holds, whatever layer either act belongs to. A verifier reads knots in fields, never in an act's content. A report is read in the same way, against the call and the acts it names (5.11.3). A version that replaces one an act names does not change what these grammar rules read that act as having done. Whether the act's signer is bound from then on is 5.4.3 and §5.6, unchanged.

2. **What it replaces, and the code it meets.** G13.1, changed on the lead's reading: any fingerprint in any field, the body's included, of any act of any layer, is a knot [traced: the trace's row for 5.13.1; the ledger, "Knots a cross acts by nature, and possibly cross layer."]. The code: `core/src/agreements_new/grammar/held.rs:140` lists the payload fields of Terms, Statements and reports, and no `body`: for Terms, from `core/src/agreements_new/grammar/held.rs:152` to `core/src/agreements_new/grammar/held.rs:159`; the one other layer read is Money's, `core/src/agreements_new/grammar/mod.rs:264` [traced]. The act format's `prev`, and the fields of a Text, Identity or Envelopes act, are not read.

3. **What a verifier would answer differently.** Ana's version 3 names version 1 in `replaces`, version 2 having already replaced it. Version 3's `relies_on` names Carla's witness act (an Identity act), whose own field names Ben's assent to version 2. *Before:* the witness act is no Agreements act; it is not read, and version 3 and version 2 are not ordered by it: **fork** or **unchecked** [inferred: `namings` reads Agreements payloads only]. *After:* version 3 is shown after Ben's assent through the witness act, and is **late**, as shown [inferred: 5.13.1 with 5.5.4(a)]. In the round, the two assents never lodged, `81374b4f…` and `b6c78860…`, stand before their voters' lineups in the voters' own sequences [traced: the round's answers, 1d]: under 5.13.1, read with §3.3's "A signer's acts across their whole life, by `prev`, are the layer below's (Envelopes, Identity); this text reads them", the sequence's `prev` would order them [inferred].

4. **Size.** A rule: the verifier holds acts of every layer it reads, decoded to their fields, and reads every fingerprint field of each.

5. **Vectors.** Renamed only: in `valid.json`, "statement: answers, relies_on and settlement" (tests G13.1, G13.2, G8.5). New:
   - **A late update shown by knots across layers** (27 November): version 3 names version 1, version 2 having replaced it; version 3's `relies_on` names an Identity witness act whose own field names Ben's assent to version 2. `update` of version 3: **late**, as shown.
   - **The body is a knot**: Ben's assent names version 2, whose `body` names Text act T. `order` of Ben's assent and T: **shown**, the assent after T.
   - **The act format's `prev`** (R25; the round's `81374b4f…`): Ana's assent, and her later act in another agreement that names the assent only by its sequence's `prev`. `order`: **shown** (question 8, (A)).

6. **The build list and the sheet.** R25 ("The act format's `prev` as a knot"): moves toward its "should" [inferred; question below]. The sheet's Q23 ("Is the body's naming of the Text act a knot?") is settled, yes: "the body's field included" [traced]. Q21 (a set's fingerprint a knot) is settled, no: §4.1, "it is no knot by itself" [traced; the set's form is session 3's]. The round's question Q4 (the act format's `prev`) is this rule's [traced: the round's answers, 1g]. The 27 November entries' vector *a late update shown by knots across layers* (the prompt's name) falls here; session 1 may meet it at 5.5.4(a).

7. **Choices the text leaves.**
- Is the act format's `prev` (the outer act's field, not the payload's) a "field of an act" in 5.13.1's sense?
- Which layers' acts must the verifier decode, to read their fields? A layer it does not decode: is its act "held" (a piece, read for nothing), or lacking?

### 5.13.2 An act names what it relied on

1. **The rule.**

> **5.13.2** **An act names what it relied on.** An act that relied on a version or an act, of its own agreement or of another, names it: a Statement in `relies_on` where no other field names it, a Terms act in `relies_on` (§5.2). A verifier MUST NOT read an act as having relied on a version or act it does not name. A payment to a work names the version of the work agreement it read; how a settlement carries that name is for the layer that gives the settlement (Money, §2).

2. **What it replaces, and the code it meets.** G13.2, unchanged but for references [traced]. The code: `relies_on` in `core/src/agreements_new/grammar/held.rs:140`; a payment's version and settlement in `core/src/agreements_new/grammar/mod.rs:264` [traced].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None under this number.

6. **The build list and the sheet.** The 27 November entry "rely is the solution to all acts someone has to rely on" asks nothing of the verifier (client conformance) [traced: the ledger, "nothing is added to Identity or Agreements."]. The vector *the words act voided and relied on* (the prompt's name) is left for session 1 (5.2.2).

7. **Choices the text leaves.** None.

### 5.13.3 Shown after

1. **The rule.**

> **5.13.3** **Shown after.** Act B is shown after act A when the verifier holds a chain of acts, each naming the one before by fingerprint, from B back to A, or a keeper's record or an anchoring that places them so (5.13.5). Here an anchoring is one to the clock the Terms name, and a keeper's record is one of a keeper the Terms name. Any other anchoring or keeper is evidence a reader may show, labelled as that reader's: it never pins, and never makes an update late (5.5.3, 5.13.5). Knots between acts (a fingerprint of one act in a field of another) count wherever the verifier holds them. This is the one reading of "shown after" in this text, and every grammar rule that asks whether one act came after another reads it so: the pin (5.4.1, 5.5.1(b)), a counter signature (5.4.5), a late update (5.5.4), an act under a power whose Terms were replaced (5.6.4), and a signer's line (§5.7). It proves that B came after A, and nothing more: never that an act came before one that does not name it, and never that an act does not exist. Where the Terms name keepers, the order of the agreement's acts is theirs: only they pin (5.5.1(b)), and knots do not order the agreement's acts in their place; knots expose a keeper whose record contradicts them (5.8.4). **A missing act.** Where a chain of acts that could show B after A needs an act that is named in a field of an act held, and the verifier does not hold it, the answer is **unchecked** (§3.6): never a yes, and never a no. No grammar rule goes around it.

2. **What it replaces, and the code it meets.** New (N7), the one reading of "shown after" [traced: the trace's row for 5.13.3, "the one-line reading of "shown after" is the MOR lead's (item 28)"]. The code: what a verifier "knows", `core/src/agreements_new/grammar/mod.rs:282` (an Agreements act held, a piece, a payment or settlement, an act of the envelope's chain), and what is lacking, `core/src/agreements_new/grammar/mod.rs:292` (everything else named, and every act held and unreadable) [traced].

3. **What a verifier would answer differently.** Ana's work is a Text act, `eeb5cef3…` in the round, named in `relies_on` by her version 3 `bba99964…`, which names the root `db3ce515…` while version 2 `5b9e8c91…` has replaced it [traced: the round's answers, entry 571]. *Before:* with the Text act held as bytes, the checker rejects it as not this encoding, it is not "known", and `last_version` is **unchecked**, G4.8, "names an act this verifier does not hold" [traced: the round's answers, 1b, and the sheet of 26 November, section 1]. *After:* the Text act is held; it names nothing that could show version 3 earlier, and version 3 is **late**, as shown [inferred: 5.13.3, "named in a field of an act held, and the verifier does not hold it"]. Where the work is a private act held without its key: still **unchecked** [inferred: 5.7.1's reading of an act held and not opened].

4. **Size.** A rule: "known" becomes "held, of any layer"; what is lacking is what is named in a field of an act held and not held.

5. **Vectors.** None renamed under this number (case 31, which tests G4.7, keeps **unchecked**: its lacking act is named in `relies_on` and held as nothing, which 5.13.3 leaves unchecked; it is session 1's to count). New:
   - **A Text act held** (26 November, line 1, (1)): version 3 names version 1, its `relies_on` naming a Text act held beside it. `update` of version 3: **late**, as shown, where today **unchecked**.
   - **A piece declared** (line 1, (2)): the same, the work declared as a piece (a `pieces` field the vectors' format lacks). `update`: **late**, as shown.
   - **A private act without its key** (line 1, (3)): the same, `relies_on` naming a private act held without its key. `last_version`: **unchecked**.
   - **The words also relied on** (line 19, (2)): the same, the Text act named in version 2's `body` and in version 3's `relies_on`. `update` of version 3: **late**, as shown.

6. **The build list and the sheet.** R5 ("which lacking act might show it late") and the sheet's Q1 are settled toward (A): any act named in a field and not held is lacking [traced: the ledger, "a missing act named in a field leaves lateness unchecked"]. Q2 ("Is an act held of another specification known?") is settled (A): any act held, of any layer [traced: 5.13.1, 5.13.3]. The sheet's line 1 (three new vectors) and line 19's second new vector fall here.

7. **Choices the text leaves.**
- A piece held that is no act (a work given as bytes): is it "held" for 5.13.3? The vectors' file has no field for pieces today (the sheet of 26 November, line 1, new vector 2).

### 5.13.4 Order from naming

1. **The rule.**

> **5.13.4** **Order from naming.** An act that names another, directly or through acts that name it, came after it. A verifier MAY give that order as **shown**, from the acts alone, with no keeper and no qualifier. Between two acts of which neither so names the other, no order is shown from the acts alone. **Before or after Terms came into force, from naming.** Where the Terms name no keeper: an act came after Terms came into force where the acts it is shown after are enough for those Terms to pass the gate and the pin (5.5.1), or, for a first version, to come into force and be pinned (5.4.1). It came before where, counting every act held but those shown after it, those Terms do not pass them. Otherwise no order between them is shown. **Per keeper**, the position at which Terms came into force is the first position at which, counting only the acts the keepers show at or before it, they pass the gate and the pin (5.4.1, 5.5.1, 5.6.4).

2. **What it replaces, and the code it meets.** G13.3, written on the gate and the pin, and scoped "Where the Terms name no keeper" [traced: the trace's row for 5.13.4]. The code: `core/src/agreements_new/grammar/order.rs:323`; before or after a replacement, `core/src/agreements_new/grammar/force.rs:182`, by citing at `core/src/agreements_new/grammar/force.rs:202` only where no place is named [traced].

3. **What a verifier would answer differently.** Ben's assent names Ana's Terms: shown after them, with no qualifier, as today. Whether an act came before Terms came into force now reads "pass the gate and the pin": the pin is session 1's (5.4.1, 5.5.1) [inferred].

4. **Size.** A word here; the gate and the pin are session 1's rules.

5. **Vectors.** Renamed only: case 3 (order from citing: B's assent names the Terms, and came after them); case 4 (order from citing: two assents that name nothing of each other: no order). New: none.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None.

### 5.13.5 Anchoring

1. **The rule.**

> **5.13.5** **Anchoring.** Whether anything is later than an act, and what time it was, are never shown by naming. For an agreement whose Terms in force name keepers, every reader takes "nothing later" from those keepers; for one whose Terms in force name a clock, every reader takes the time from that clock (5.8.5). A verifier MUST NOT give, per a reader's own anchoring, an answer that the keepers or the clock the agreement names give. An anchoring of the reader's own choosing, whether or not the agreement names any, gives an answer only as that reader's, named so: it never gives the Terms' own answer, never puts Terms in force, and never makes an update late (5.5.3, 5.8.5). Where the reader accepts an anchoring from which the verifier holds no answer, or holds two that contradict each other, every answer that rests on it is **unchecked** (§3.6), and not **as shown**. A verifier MUST give each such answer **per anchoring**, with the anchoring named (**per keeper** or **per clock** where it is one the Terms name), or **as shown**.

2. **What it replaces, and the code it meets.** G13.4, changed on the lead's reading: "Only where the agreement names none does each reader accept the anchoring it chooses" goes; a reader's own anchoring gives only that reader's answer [traced: the trace's row for 5.13.5]. The code: `core/src/agreements_new/grammar/mod.rs:252` to `core/src/agreements_new/grammar/mod.rs:256` make the reader's anchoring the Terms' scope; lateness by anchoring at `core/src/agreements_new/grammar/chain.rs:261` [traced].

3. **What a verifier would answer differently.** Ana's and Ben's Terms name no keeper and no clock; each has assented, and Dana accepts an anchoring that shows both assents. *Before (case 64):* **shown**, G4.6, **per anchoring**, Dana's anchoring named [traced: `cases.rs:1123`]. *After:* the Terms' own answer is **as shown**, from the acts; Dana's anchoring is shown beside it, labelled as hers, and never puts the Terms in force [traced: 5.13.5]. As shown, the word then rests on the pin by knots (5.4.1, session 1's): with no act of Ana's or Ben's shown after both assents, **not shown**, "no order is shown" [inferred: case 64 holds the root and the two assents only, `cases.rs:1111` to `cases.rs:1114`].

4. **Size.** A removal: the reader's anchoring stops being the Terms' scope (`scope_of`'s anchoring branch; lateness by anchoring), and becomes a second answer, the reader's, beside the Terms'.

5. **Vectors.** Changes answer: case 64 (no place named: in force per the anchoring the reader accepts, with it named). New:
   - **The reader's anchoring beside a keeper**: Terms naming keeper K, which shows the root and both assents; the reader accepts anchoring X, which shows neither assent. `in_force`: **shown**, per keeper; X's answer beside it, labelled as the reader's.
   - **No lateness by the reader's anchoring**: two versions 2 naming the root, nothing in the acts ordering them; the reader's anchoring puts one first. `last_version`: **fork**, as shown; the reader's order beside it, as hers.

6. **The build list and the sheet.** T6 ("Late Terms never read the reader's anchoring", `baker.rs`): its "should" (the reader's anchoring shows the Terms late) is now against draft 26, which never makes Terms late by a reader's anchoring; and G14.2 leaves for Envelopes. T6 is moot [traced: 5.13.5, "never makes an update late"]. The round's Q5 (does an assent the anchoring does not show count, per anchoring) is moot for the Terms' answer [inferred]. The MOR lead's settled note, M20 and F8: "A reader's chosen keeper or anchoring gives an answer only labelled as the reader's" [traced].

7. **Choices the text leaves.**
- Must a verifier still compute the reader's own answer and show it beside the Terms' ("named so"), or may it give the Terms' answer alone? The text says what the reader's answer is when given, not that it must be given.

---

## 6. Tasks handed to cMIPs

1. **The text.**

> The eight tasks (§3.1, **Task**) are listed here, each with its one question, what the cMIP in it accepts and produces, where these grammar rules use its output, and whom it makes you trust. A list field has one socket for each entry: each entry of `powers` is its own socket, and so is each role in `parties`. So an agreement may name many rules, and never two cMIPs in one socket. Every cMIP in a socket is also given its own parameters, the acts held, and the answers of the keepers and the clock the Terms name (§5.8); the column "Accepts" lists what it is given beyond those. A cMIP declares what it needs (a clock, a keeper); Terms that do not supply it are invalid (5.8.6). How a cMIP declares it is open (§7).
> | # | Task | The socket (field) | Its one question | Accepts | Produces | Where the output is used | Trust |
> |---|---|---|---|---|---|---|---|
> | K1 | Body | Terms: `body`, the cMIP beside the words | What do these words say? | the Text act `body` names, by its act id (5.2.2) | a reading for people, and any parts for machines that other cMIPs and these grammar rules read: among them the part each party is given (5.11.2), and whether what a filling gave still applies, with its ground (5.10.8). It gives nothing for the baker's rights: those are read from the envelope's chain (Envelopes, §2) | §5.2, 5.10.8, 5.11.2 | none: format only |
> | K2 | In force | Terms: `in_force` | Are the assents that put these Terms in force present? | the Terms that name it; it may ask whether an assent in a given name counts (5.4.1, 5.4.5, 5.1.2) | yes or no; the same output for the same inputs, for anyone | 5.4.1, for a first version; in an update, read for who fills a role, its answer on coming into force left unread (5.4.2, 5.2.3). Empty: the default of 5.4.1 | none: anyone can recompute |
> | K3 | Power | Terms: each entry of `powers` (its rule) | Does this act, of this power's kind, bind the parties: was it made by those who may? | the Terms that give the power; the act asked about (a Statement of that kind, or a resolving update); receivers for acts and what leg reports state (5.1.5) | yes or no. For kind `resolves`: who may sign the resolving update, and which one is accepted (5.12.5). There is no kind `replaces`: this socket is never asked about a replacing Terms act, and what is left of it for updates is nothing (5.6.2). It never answers about the Terms themselves (5.6.5) | 5.1.2, 5.6.1(b), 5.12.5. No entry: no power | none where the cMIP only computes; otherwise whoever its modules name (a judge, a teller) |
> | K4 | Update condition | Terms: `condition` | Can the agreement be updated like this? | the version the proposed update would replace (the original) and the proposed update, with the assents to it that count (5.5.7(a)). It is never asked about a filling (5.10.6) | valid or not valid, with its ground: an act, or a time per the clock the Terms name; who must sign the update is part of that one answer (5.5.5); the same output for the same inputs, for anyone | 5.5.1, 5.5.5, 5.5.7, 5.6.1(c), 5.12.4. Empty: the default, every known party (5.5.5(a), 5.5.7(e)) | none: anyone can recompute |
> | K5 | Spot | Terms: the cMIP of each role in `parties` | Who fills this spot, by which proof, and on whose word; and does it still take new identities? | the role (its kind and `what`) as the version in force states it; for a filling already earned, as the version its proof names states it (5.10.2) | each filling: the signer who fills it, the proof that earned it (the acts it rests on), and the version it was earned under (5.10.7); or none; whether the spot holds one filling or many (5.10.2); whether it still takes new identities, and why (5.10.5); for kind future, also what defines the participant (5.10.4) | §5.10, 5.1.4 | whoever the cMIP names as confirming: for done, a witness or the counterparty; for received, the previous holder; for holding, as its cMIP says; for fits, those who vouch; for future, as its cMIP says |
> | K6 | Control | Terms: `control` | Has what these Terms receive been passed on as they say? | an instruction, with the acts and the rule result behind it | the controller's signed evidence. Where the Terms that hold this task carry a call (5.11.2), a report answering it is a **leg report**. Beyond what every report carries, a leg report from the doer (the controller) states, with amounts: **what was received**, each amount with the act it came by (a settlement); **what was passed on**, each amount with to whom (a signer, or an agreement by its root) and the act it went by (a settlement); **the doer's own part**, where the doer is itself one to whom the leg's Terms give a part (a party who receives for the others): its amount, which is not a fee; **what was kept** (a fee); and, apart from both, **what is still owed**, each amount with to whom. A leg report from a receiving side (one to whom something was passed on; for an agreement, its receiver for the act, 5.11.2) confirms what it received, each amount with the act it came by. The confirmation of a buyer's payment, by the receiving side of that leg, is such a report: it answers the call the payment carries by default (5.11.7). Which of a doer's lines each receiving side receives is said by the cMIP in this socket (5.11.3). Each act so named is one of the acts the report relied on | §5.11. Empty: the task is still held where one party receives for the others (5.11.2); then what this row asks of a leg report is read with no cMIP (5.11.3) | hand (Control layer) |
> | K7 | Kind | Statement: `kind`, where it is a fingerprint | What does a Statement of this kind state, and which cMIPs read it? | the `kind` fingerprint, the Statement's `content` | the meaning of `content`, and how rules may read it | 5.6.1(b), with the power for that kind (K3) | none: definition only |
> | K8 | Data | Terms: `data` | May this reader read this report, or what it states, beyond its own leg? | the Terms that name it; the reader asked about, as the verifier is told (the MICS, §2); the report asked about: one of a leg carried out under those Terms, or that carries the data of people bound by them (5.11.5 says which Terms are asked); or, asked about silence, the call that no report answers (the MICS, §2) | yes or no, for that reader and that report, or that call, with its ground. What else the cMIP says (how a reader puts together the legs it may read, how far it follows, what a loop answers, which consent it asks) is its own, and is not read by these grammar rules (5.11.5) | 5.11.4, 5.11.5, 5.11.6, 5.11.7; the MICS (§2). Empty: no path beyond the leg | none where the cMIP only computes; otherwise whoever its modules name |
> A payment holds the task of paying, the Control task (K6), with the payer as its doer (5.11.7). Which field of a payment holds it, and what fills it, is the layer that holds value's to say (Money, §2).

2. **What it replaces, and the code it meets.** Draft 25's section 5, its K rows changed as the trace's rows K1 to K8 say [traced: the trace's rows K1 to K8; the row-by-row diff by the build script]. The code: `core/src/agreements_new/grammar/sockets.rs:49` (one question per task), `core/src/agreements_new/grammar/sockets.rs:98`, `core/src/agreements_new/grammar/sockets.rs:167` [traced].

3. **What a verifier would answer differently, task by task.**
- **K1.** It accepts the Text act `body` names, by its act id, where today the code hands it the Terms act, `core/src/agreements_new/grammar/sockets.rs:52`; its output gains whether what a filling gave still applies (5.10.8); "for a delegation" goes, `core/src/agreements_new/grammar/sockets.rs:122` (with build-list row D1, session 1's) [traced].
- **K2.** In an update, read for who fills a role only (5.4.2, session 1's) [traced].
- **K3.** References only [traced].
- **K4.** "It is never asked about a filling": `core/src/agreements_new/grammar/sockets.rs:67` goes (5.10.7). It accepts "the assents to it that count", where today it is also handed everyone who signed the original, `core/src/agreements_new/grammar/sockets.rs:64` (the sheet's Q16; session 1's 5.5.7). Its ground's time is per the clock the Terms name [traced].
- **K5.** For a filling already earned, the role as the version its proof names states it (5.10.2); today `core/src/agreements_new/grammar/sockets.rs:71` is always asked with the Terms in force [traced: `spots.rs:21`].
- **K6.** "Two reports that name the same settlement match where they state the same amount for it" goes for the MICS (5.11.4) [traced].
- **K7, K8.** References only [traced].
- **What a cMIP declares.** "A cMIP declares what it needs (a clock, a keeper); Terms that do not supply it are invalid (5.8.6)": the interface has no declaration (5.8.6) [traced].

4. **Size.** A field (K1's output part), a removal (K4's question about a filling; K1's delegation part, shared with session 1), and an interface part (what a cMIP declares).

5. **Vectors.** Changed: case 74's `stubs_asked` (counted under 5.10.7). New:
   - **A specification named by a stand-in** (27 November): Terms whose `condition` names a fingerprint that no text on MOR hashes to and no cMIP the verifier holds. `update`: **unchecked**, the cMIP lacking.

6. **The build list and the sheet.** D1 (K1's delegation) and D7 (K4 asked apart) as above. The sheet's Q24 ("Must the verifier hold the Text act of the words?") is settled (A), K1's [traced: "The verifier need not hold the words to answer the grammar's questions; K1 reads them."]. The 27 November entry "A specification is a Text act, named by its id" is a change to Development, queued behind draft 26 [traced: the ledger, "A change to the Development MIR, queued behind draft 26."]; draft 26 still names a cMIP by fingerprint (§3.1, **cMIP**), so a stand-in that names no published text is a cMIP the verifier lacks, **unchecked**, as today [inferred]. The vector of that entry is placed here; session 1 may meet it at 5.2.1.

7. **Choices the text leaves.**
- K1 accepts "the Text act `body` names": is the cMIP handed the Text act (which the verifier need not hold), or its act id?
- K5 for a filling already earned: is it asked of the version its proof names before the verifier knows the filling (the proof names the version), or asked of the Terms in force and then of each version a filling names?

### 6.1 Modules

1. **The text.**

> A cMIP in a socket may use modules to give its answer. A module is a kind of answer, not a task: no field of an act names it; the cMIP in a socket does (§3.1, **Module**). Each says whom an answer makes you trust, and a verifier reports that with every answer (the MICS, §2).
> | Module | What it answers | Whom it makes you trust |
> |---|---|---|
> | **Rule** | what follows from these acts: yes or no, a list of who, or amounts; the same output for the same inputs, for anyone | none: anyone can recompute |
> | **Identity** | who is behind this signer: signed statements by those who vouch | a witness (Sign layer) |
> | **Assurance** | what was done to make it likely that a party was able, free and understood: signed statements of what was done; never a pass | a witness |
> | **Witness** | what happened in the world: each named witness's signed statement | the witness |
> | **Tally** | what a vote decided, without showing who voted how: the result, with whatever proof the method allows | the teller |
> | **Delivery** | whether an act reached a person: the recipient's signed acknowledgment, or the Deliver layer's evidence | the recipient, or the Deliver layer |
> | **Judge** | what the named judge decided, given the Terms (with `authors`, 5.3.2) and the acts of the dispute: a signed decision, which binds only through a power (K3, §5.6). The judge is named in the Terms, by the cMIP in a socket or its parameters, and is changed only by an update, never by a power (5.6.5) | the judge |
> Two more things answer questions and are not sockets of an act.
> - **The keeper** (`keeper`) and **the clock** (`clock`) are named by Terms by an identifier, not as cMIPs. Their answers are another layer's (§5.8), and are given to every cMIP in a socket. Whether a clock is itself a module under a cMIP of another layer is that layer's to say.
> - **Standing**: what one signer's acts show about them, to anyone who looks. A reader chooses the cMIP; no act names it, so it is no task of an act. It computes from signed acts and keepers' answers only, qualified per keeper or as shown; anyone can recompute it, and nobody keeps it.

2. **What it replaces, and the code it meets.** Draft 25's section 5.3, its history and "Was" column moved to the companion [traced: the trace's row "6.1 Modules"]. The code: none; no field of an act names a module, and the verifier reports what a socket's cMIP says (`Said`, `CmipNamed`) [traced: who said what is carried by `core/src/agreements_new/grammar/answer.rs:124`, and a socket's cMIP by `core/src/agreements_new/grammar/answer.rs:179`; no type names a module].

3. **What a verifier would answer differently.** Nothing.

4. **Size.** None.

5. **Vectors.** None.

6. **The build list and the sheet.** None.

7. **Choices the text leaves.** None for the verifier.

---

## The build list's translation errors, and the resolve that resolves nothing

| Row | What it is | Under draft 26 | Whose rule |
|---|---|---|---|
| T1 | A fork after Terms are in force takes them out of force | **kept**: 5.12.3 keeps "Terms that were in force before a fork was made stay in force"; 5.7.2 narrows what a forked assent stops to "any update's gate" | this part (5.12.3, 5.7.2) |
| T2 | An agent cannot take back the assent it made | for session 1 (5.4.5) | session 1 |
| T3 | Stopping without saying unchecked | **changed**: G9.2's general sentence is not in draft 26; only 5.1.4 says it, for receivers | this part (5.12.6) and session 1 (5.1.4) |
| T4 | "Built on a tip" follows every field | **kept**: 5.12.3 and §3.3 keep the four fields | this part (5.12.3) |
| T5 | A12 with a place: the first withdrawal by id | for session 1 (5.4.5) | session 1 |
| T6 | Late Terms never read the reader's anchoring | **moot**: a reader's anchoring never makes Terms late (5.13.5), and G14.2 leaves for Envelopes | this part (5.13.5) |
| T7 | "Everyone who signed" through a version that never replaced | for session 1 (5.5.5(a): the default signers are the known parties) | session 1 |
| `order.rs:355` | The resolve that resolves nothing falls through to `update` and answers **unchecked** | **changed**: **not shown**, "nothing to resolve" (5.12.4) | this part (5.12.4) |

The marks: T1, T3, T4 traced to draft 26's sentences; T6 traced to 5.13.5; the sessions' split inferred from the rule numbers.

## The totals

Counted by the build script from the sections above; each is of today's vectors in `core/vectors/agreements-new/` unless marked new.

| What | Count | Which |
|---|---|---|
| Rules covered | **40** numbered, **0** lettered; **8** tasks, **7** modules | sections 5.7 to 5.13, 6, 6.1 [counted] |
| Grammar cases placed under this part's rules | **49** of 120 | by their `tests` field [counted] |
| Vectors that change answer | **1** | case 64 (5.13.5) [inferred] |
| Vectors that change answer, if a question goes one way | **1** | case 22 (5.12.4; question 2) [inferred] |
| Vectors renamed only (draft 25's rule to draft 26's; per place to per keeper) | **36** grammar cases (and case 22 on the other reading of question 2); **24** of 44 in `valid.json`, **11** of 116 in `invalid.json` | listed in each section; the two files by their `tests`, `rule` and `notes` [counted]. Case 74 also loses its name, sentence and one `stubs_asked` entry |
| Vectors retired, with rules that left | **11** | cases 78, 80, 81, 82, 83, 84, 85, 86, 92, 93, 94: G11.4(a) to (d) and G11.7's reading of the two halves, for the MICS [traced] |
| Listed, not counted: cases of G14 | **15** | cases 99 to 113, for session 4 to place (5.11.9) [counted] |
| New vectors | **37** | 9 of the 22 of 26 November (line 1: 3; line 6: 2; line 8: 1; line 9: 1; line 10: 1; line 19: 1), 5 of the 27 November entries (the double assent forked; two keepers, one silent; a filling under a dropped role; a late update shown by knots across layers; a specification named by a stand-in), 3 owed by the build list (T1, T4, R25), the rest new with draft 26 [counted] |
| Of the 22 of 26 November, left for session 1 | **13** | line 7: 2 (5.4.3); line 8: 2 (5.5.5(a)); line 16: 5 (§4.1; its bytes session 3's); line 18: 3 (5.5); line 19: 1 (5.2.2) [inferred] |
| Of the 27 November entries, left for session 1 | **2** | the double assent in order (5.5.5(a)); the words act voided and relied on (5.2.2) [inferred] |
| Fields | **1** act field; **2** interface parts | `place` becomes `keeper`, one or several (5.8.1; its bytes session 3's); K1's output part "whether what a filling gave still applies" (5.10.8); what a cMIP declares it needs (5.8.6) [inferred] |
| Value forms | **0** | the set of acts is §4.1's, not this part's [traced] |
| Removals | **5** | G10.6(b) and `Ask::FillingRights` (5.10.7); the reader's anchoring as the Terms' answer (5.13.5, with 5.8.2, 5.10.5); the reading of leg reports side by side (5.11.4, 5.11.7); K1's delegation part (§6, with session 1's D1); K4's `signed_original` (§6, with session 1's 5.5.7) [inferred] |
| Code lines cited | **81**, each checked at `f1a13feb` | [counted] |
| Quotations | **39** tagged spans of the ledger, the drafts, the notes and the sheets, and **42** rule blocks, each checked against its file; then every one of **225** quoted spans in this file, each found in a source file or in the code at `f1a13feb` | [counted] |

## The questions

All of this part's, those that would change a verifier's answer first. Each quotes its sentence, gives the readings and the session's lean, labelled as the session's. None is settled here.

**Those that would change a verifier's answer.**

1. **A silent keeper** (5.8.3). "Where the Terms name several keepers, an answer about order counts where they agree." (A) the order waits for every keeper named, **not shown** until each has shown the act, as the ledger's line of 27 November, 16:40, reads his words; (B) it counts where the keepers that show it agree. *The session's lean:* (A), his words being "both keepers are needed"; draft 26 would need the sentence carried.
2. **A resolving update's answer word** (5.12.4). "A resolving update of Terms that resolves is an update of the shared Terms and takes an update's answers" (A) **valid** and **in force**, in place of **shown**; (B) **shown**, as 5.12.5 gives one made under a power. *The session's lean:* (A), the sentence's own words. Moves case 22.
3. **What a cMIP declares** (5.8.6, §7). "Terms that do not supply what a cMIP they name, in any socket, declares it needs (a clock, a keeper) are **invalid**" (A) a declaration the verifier reads in the cMIP's own text (Development's); (B) a field of the socket, in the Terms' bytes. *The session's lean:* none; under neither does the code have it today, and no vector of 5.8.6 can be written against anything but a stub until one is chosen.
4. **A cMIP the verifier lacks, for 5.8.6.** The same sentence. (A) **unchecked**: its declaration cannot be read; (B) the Terms pass until it is read. *The session's lean:* (A), as §3.6 has every answer resting on a lacking cMIP.
5. **A filling under a dropped role** (5.10.2). "A filling already earned is read from the version its proof names, its role and that role's cMIP as that version states them, whatever a later version says of the role" (A) the verifier asks K5 of each version that named a role at that position, and answers each filling under its own; (B) a spot is named by the version and position the asker gives. *The session's lean:* (B), since a dropped role has no position in the Terms in force.
6. **Her own assent, counted or not** (5.10.7). "Nothing changes what a filling earned except an assent its holder signs in their own name" (A) her signature on the later version is enough, counted in her name or not, as the MOR lead's note reads; (B) only an assent the later version counts in her name, as `spots.rs:108` reads. *The session's lean:* (A).
7. **Which layers' fields are knots** (5.13.1). "any fingerprint in any field of any act the verifier holds, whatever layer either act belongs to" (A) the verifier decodes the acts of every layer in the core (Text, Identity, Envelopes, Money) and reads their fields; (B) only the layers it implements, others held as pieces. *The session's lean:* (A), the layers' own decoders being in the core library already for Identity and Envelopes [inferred: `core/src/identity.rs`, `core/src/envelopes.rs` exist].
8. **The act format's `prev`** (5.13.1, R25). The same sentence, with §3.3: "A signer's acts across their whole life, by `prev`, are the layer below's (Envelopes, Identity); this text reads them and does not define them." (A) a knot; (B) not a field of the act in 5.13.1's sense. *The session's lean:* (A).
9. **A filling's term with no clock** (5.10.8). "where the version names no clock, no term in time can be read from it (5.8.6)" (A) the verifier shows nothing about the term; (B) it passes on K1's answer with no qualifier. *The session's lean:* (A), since K1's answer would rest on a time with no anchor.
10. **A keeper that contradicts a knot** (5.8.4). "a keeper's record that contradicts a knot the verifier holds (B placed before A, while A names B) gives **not shown**" (A) only the answers that rest on that record; (B) every answer per that keeper. *The session's lean:* (A).
11. **A verifier that stops** (5.12.6, T3). Draft 25's G9.2 had "It MUST NOT answer **not shown** or **invalid** because it stopped." and draft 26 keeps it for receivers only. (A) **unchecked**, saying how far; (B) unsaid, left to §3.6. *The session's lean:* (A).
12. **A forked assent and coming into force** (5.7.2). "Where the two acts are assents, neither counts for any update's gate until that signer's line is resolved" (A) neither counts for a first version's coming into force either (5.12.3, "nothing built on either tip counts"); (B) the sentence names the gate only. *The session's lean:* (A); it is what the code does today.
13. **The reader's own answer** (5.13.5). "An anchoring of the reader's own choosing, whether or not the agreement names any, gives an answer only as that reader's, named so" (A) the verifier gives it beside the Terms' answer, when the reader accepts one; (B) it may leave it out. *The session's lean:* (A), since the reader asked.
14. **A baker's contest by one who is not the holder** (5.11.9). "The holder of the baker's rights is read at the act the contest cites" (A) shown as a contest, **not shown** as a baker's; (B) not shown. *The session's lean:* (A), "Who else may make a contest, and when, is not said" leaving it a contest.

**Those that would not change an answer today.**

15. **The line resolve's word** (5.12.4). A resolve in one signer's line that resolves has no answer word. *The session's lean:* **shown**, as today (cases 41, 43).
16. **The retired cases** (5.11.4, 5.11.7). Where the eleven cases go: a vector file of the MICS's report block, or nowhere until that block is rewritten. *The session's lean:* kept as they are, moved, so that no answer is lost.
17. **"Built on a tip" and knots** (5.12.3, T4). Does 5.13.1's widening reach "built on"? *The session's lean:* no; the text keeps two lists.
18. **The "or any other" fork** (5.12.2). Which acts compete to change the same state. *The session's lean:* none; the draft's report lists it (item 8).
19. **A piece held** (5.13.3). Is a piece that is no act "held"? *The session's lean:* yes, held and naming nothing.
20. **K1's input** (§6). The Text act, or its id. *The session's lean:* its id, since the verifier need not hold the words.

## What this part could not tell

- Nothing that would change was run: every "after" is read or inferred. The renamed cases keep their word and qualifier only if nothing in session 1's rules moves them; case 64's word rests on 5.4.1's pin, session 1's.
- Whether session 1 counts case 64 again under 5.4.1 or 5.5.3: session 4 should count it once.
- Where cases 99 to 113 (G14) fall: no rule of 5.7 to 5.13 replaces G14 but 5.11.9; they are listed, not counted, here.
- Whether the 27 November entries' vectors placed here (*the double assent forked*; *two keepers, one silent*; *a filling under a dropped role*; *a late update shown by knots across layers*; *a specification named by a stand-in*) are those the codemeister meant: their names are the prompt's, read against the ledger's entries.
- The bytes of several keepers, of `resolves` as a list, and of the spec hash every act carries are encoding 3's (session 3): every vector here is described in acts and answers, not bytes.
- Whether draft 26 will carry the five answers of 27 November, 16:40 to 16:53: it was finished before them.

# For Fable: contradictions left in the texts (S7p)

*Written by S7p (branch `claude/s7p-contradictions`) for Fable's last read of the eight texts. Each item quotes both sides from Agreements draft 22 (and the default control cMIP draft 5 where named), gives the options, the session's lean and its cost. Nothing here was changed: each needs a choice the session may not make. Line numbers are draft 22's.*

*How the core behaves today is said for each, read from `core/src`, so a choice that keeps the code as it is can be told from one that moves a verdict.*

---

## 1. Rule 98.3: is the judicial tier part of the constitution, or beside it?

**In plain words.** Rule 98.3 lists the constitution's fields, and that list includes the judicial fields (keepers, time reference, abandonment clause, arbitrators, succession plans, chain of judgment). Rules 65 and 67 speak as if the judicial tier were something next to the constitution. And field 2's judicial tasks are judicial but appear in no constitutional list.

**One side** (rule 98.3, line 1917): "A constitutional change is a change of the collective's constitution: fields 0, 1, 3, 5, 6, 9, 12, 13, 16, 17, 18, 19, 21, 22, 24 and 35 (its cMIP and its parameters alike), and the collective's split agreement. … the judicial tier's fields and the collective's split agreement need the judicial tier's rule (rule 67), and the constitutional change rule only where the clone also changes another field of the constitution".

**The other side** (rule 67, line 1949): "A version that also changes the constitution names the constitutional change rule beside it, and needs both (rule 98)." Rule 65 (line 848): "**A constitutional clone** here is one changing the constitution beyond the judicial tier (rules 67, 98)." Rule 67's list includes "the condition, time reference and anchoring cMIPs (field 2, tasks 9, 10 and 11), and the absence-proof cMIP (task 14)"; field 2 is not in rule 98.3's list.

**Where it matters.** Three readings depend on whether a judicial-only clone is "constitutional": a rotation "declares only a clone whose every change is constitutional" (rules 69, 98.3); the way out and "broken" read "along the line's constitutional clones alone" (rule 98); field 7 is read "as the latest constitutional clone's". A clone changing only field 2's task 9 is judicial but, by the list, not constitutional.

**The core today.** `core/src/agreements/tiers.rs`, `constitutional()`: "Whether a clone … makes a constitutional change, the judicial tier's included": field 2's judicial tasks count as constitutional too.

**Options.**
- (a) The judicial tier is part of the constitution, under a stricter rule of its own. Rule 98.3 adds "and field 2's judicial tasks (rule 67)" to its list; rule 67's "also changes the constitution" becomes "also changes another field of the constitution" (98.3's own words); rule 65's sentence stays (it already reads this way). Matches the core.
- (b) The judicial tier stands beside the constitution. Rule 98.3's list drops fields 3, 6, 9, 13, 16 and 21 and the split agreement, and says separately whether a rotation may declare a judicial clone and whether the way out reads judicial clones. Moves the core.

**Lean:** (a). **Cost:** two clauses; no verdict moves.

---

## 2. Issuance: parameter 32 sits in field 35, which rule 98 calls constitutional; the cMIP calls an issuance no constitutional change

**In plain words.** An issuance is a clone that names its offer in parameter 32 of the control model's parameters. The core says any change to field 35, "its parameters alike", is a constitutional change. The default cMIP says parameter 32 is never compared, so an issuance is an owners' matter, not a constitutional change. Read literally, every issuance would need the constitutional change rule, which F423 struck ("parameter 32's 'every issuance is constitutional' struck").

**One side** (rule 98.3, line 1917): "fields 0, 1, 3, … 24 and 35 (its cMIP and its parameters alike)"; and rule 98.2 (line 1915): an issuance is "also a constitutional change" only "where field 18 counts among a stake's holders by share".

**The other side** (cMIP draft 5, rule 63's comparison, line 189): "Nor are fields 31 and parameter 32, which each version states for itself"; rule 96 (line 311): an issuance "is an owners' matter (rule 95), decided by the stake's holders' rule (rule 94)".

**The core today.** `tiers.rs`, `changes()`: field 35 is compared by its cMIP, its areas (as 34) and its holders' rules (as 30); parameter 32 is not compared ("31 and 32 each version states for itself, never compared (F309, F316)"). The core follows the cMIP.

**Options.**
- (a) The core says, in rule 98.3, that what a version states for itself alone (an issuance's offer, parameter 32 of the default model) is no change of field 35. One clause, matching the core. But only this MIR reads which change is constitutional, so the clause must name what it exempts in its own words, not as "whatever the model says is per version" (that would let a model take a change out of the constitution).
- (b) The core says field 35's parameters are compared as the model's answers (areas, holders' rules) and its cMIP, nothing else. Wider: a model's other parameters would then change under its own rules. Likely a door, and against F421 ("its cMIP and parameters alike").
- (c) Keep 98.3 literal; every issuance is constitutional. Against F423, and moves the core.

**Lean:** (a), naming the issuance's offer (the act an issuance follows) as the one thing a version states for itself. **Cost:** one clause; no verdict moves.

---

## 3. The absence authority: three lists of who may declare absence

**In plain words.** Three places say who may be named to declare a party absent. Each list is different.

- **Rule 85** (line 2186): "The authority MUST be an identity: the keeper's operator; a threshold of the other parties, …; or a named third party."
- **The deal sentence** (rule 85, line 2191): "In a deal, the authority is one identity: a party, a keeper's operator, or a collective, never a threshold of the other parties."
- **The format comment** ("Terms (type 0)", `abandonment`, line 2624): "the authority: a named identity (a keeper's operator, a party, a collective, or a third party) / or a threshold of the other parties: in a collective only".

So rule 85's first list leaves out a party and a collective, and the deal sentence leaves out a third party.

**The core today.** `formats.rs`, `Authority::Named(Hash)`: any identity; the threshold in a collective only. The core follows the format comment.

**Options.**
- (a) One list, the format comment's: any named identity (a keeper's operator, a party, a collective or a third party), or, in a collective only, a threshold of the other parties; the deal sentence keeps only "never a threshold", and its point that parties deciding together form a collective. Matches the core.
- (b) Make rule 85 decide: a deal's authority can't be a third party, or a collective's can't be a single party. Moves the core, and a new rule about who can be trusted with absence, which is the founders' choice (the working rule: the choice is theirs).

**Lean:** (a). **Cost:** one sentence; no verdict moves.

---

## 4. A closing: "other than its own stake in itself" against "the collective holds no share of itself"

**In plain words.** The closing's condition says the collective holds nothing, "other than its own stake in itself", as if it could hold one. The terms format says it never can.

**One side** ("Closing (type 20)", line 3442): "**the collective holds nothing**: no stake of a latest version of an agreement a verifier holds names it as a holder, … other than its own stake in itself; …".

**The other side** ("Terms (type 0)", line 2741): "**The collective holds no share of itself.** A collective's stake in itself held by the collective is invalid".

**Reading.** The clause can only mean the stake whose target is the collective (field 7, the members' and departed holders' stake in it), which names the collective as its target, never as a holder. So no verdict depends on it; it reads as if a collective could hold a share of itself.

**Options.**
- (a) Reword: "a stake whose target is the collective itself (field 7) is none it holds".
- (b) Drop the clause: the format already makes the case impossible.

**Lean:** (a), since a builder checking "names it" might match the target. **Cost:** a few words; no verdict moves.

---

## 5. Leftovers: "to the first as listed" against "the order decides nothing"

**In plain words.** Rule 9 says the order in which holders are listed decides nothing; two paragraphs later it says that in one case of a fork, leftovers go to the first as listed.

**One side** (rule 9, line 277): "The order in which holders are listed decides nothing." The Reasoning (line 3519): "giving leftovers to the first listed holder would let a clone that only reordered holders send every small payment to one of them".

**The other side** (rule 9, line 301): "**A fork's division** keeps ties among sides by the hash of the fork act with each side … Among members counted alike, it gives leftovers to the first as listed in the agreement in force, an order every member signed."

**Reading.** The second is a deliberate exception: the share each member keeps when members are counted alike is written in the successors' founding terms before the fork act exists, so there is no fork hash to break ties with, and the list is one every member signed. The Reasoning's danger (a reorder needing no holder's signature) does not arise, since the founding terms are signed by every party.

**The core today.** `view.rs`, `divide_first`: "leftovers to the first: a fork's members counted alike, for the share each leaving member keeps, which the successors' founding terms name before the fork exists". The core follows the exception.

**Options.**
- (a) Scope the general sentence: "The order in which holders are listed decides nothing, save in a fork's division among members counted alike (below)." Matches the core.
- (b) No exception: ties among members counted alike broken by the smallest identity hash, like a split's final tie. Moves the core (and the vectors, if a case covers it).

**Lean:** (a). **Cost:** one clause; no verdict moves.

---

## Found while working (same kind)

### 6. Rule 48 corrected; the core still reads "bought under" the old way

**In plain words.** By the MOR lead's decision (S7o's question 1), rule 48 now reads as rule 10 does: a buyer bought under the rules of the version in force when the collective's line placed its transfer, not the version its transfer names, which may be stale. The core's check still reads the version the transfer names. In the usual case these are the same. They differ only when a seller names an old version in the transfer and the holders' rule changed between that version and the moment the seller signed.

**The text** (rule 48, draft 22, line 1450): "It bought under the rules binding the stake's holders in the version in force when the collective's line placed its transfer (rule 10), never the version its transfer names in its field 0, which may be a stale one. A change to the rules binding a stake's holders, made after a transfer of that stake was signed by its seller and before the line placed it, binds the buyer only with the buyer's signature."

**The core today.** `core/src/agreements/view/owning.rs`, `bought_under`: a buyer bought under rule R where a placed transfer to it names "a version whose holders' rule for that stake is R". So, where the transfer names a stale version, the core binds the buyer by the stale version's rule, and not by a rule made before the seller signed.

**Why the session did not change it.** No code was expected. Reading the version "in force when the seller signed" needs a seller's signature (on its own chain) placed against the collective's line, which rule 10 places only at the placement. Writing that is a choice, not a transcription. No vector covers the stale case (every vector is byte for byte the same), so nothing published moves.

**Options.**
- (a) A code session: the buyer is bound by the rules of the version in force at its transfer's placement, less each change of them that a version put in force after the version the transfer names and before the placement made. In other words, the named version marks where the window opens, and a stale name opens it earlier, which favours the buyer. Plus one vector for the stale case, and the six releases.
- (b) Read "made after a transfer … was signed" as "put in force after the version the transfer names", and say so in rule 48. Then the core already matches the text, at the cost that a seller naming a stale version protects the buyer from changes in between.
- (c) Leave the core and state the difference in "After the box" until the freeze.

**Lean:** (b): one clause, and the core and the published vectors stand. The seller who names a stale version only widens the buyer's protection, which no holder loses by. **Cost:** one clause, or under (a) a code session with releases.

### 7. "Made" or "placed": the window's change in rule 48

**In plain words.** The decision's words were "a change of the holders' rules **placed** after the transfer was signed and before its placement binds the buyer only with its signature". Rule 48's sentence, from F421 (11), and suite step 3.7at say "**made** after". The session kept "made", the decided F421 words, and the suite's.

**Where they differ.** A change made (signed) before the seller signed the transfer, but placed by the line only afterwards, inside the window. "Made" binds the buyer (step 3.7at: "a change made before the seller signed the transfer binds it"); "placed" does not.

**Lean:** keep "made" (F421, the suite). **Cost:** none; a word if the lead meant "placed".

### 8. Rule 69's own sentence on the departing member

Rule 69, line 1488: "A departing member hands over nothing: there is no key of the collective's to hand over but the chain key, which the members rotate to one the departing member never held". It is rule 69's own sentence, so the session left it. In a custodian grammar, though, a departing member who holds no share needs no rotation (rule 69's own commentary: "in a custodian grammar it is none"). **Lean:** "which, where the departing member held it or a share of it, the members rotate to one …". **Cost:** a clause; no verdict moves (the core's `needs_rotation` already reads it so).

### 9. The tie rule's list of decisions ending powers, beside rule 79's

**In plain words.** By the lead's decision, rule 79 and the grant format now list a change of control model among the decisions that end a grant within an area, as rule 74 already said. The tie rule, which says the ending wins over an action racing it, has its own list, and that list does not include it.

**One side** (rule 79, line 1120): "Decisions ending a grant are: a revocation, a departure emptying its area, a layer freezing, a change of control model (for a grant within an area, rule 74), a fork, a closing."

**The other side** ("Made before, made after", 7, line 1036): "A decision ending powers is a fork, a closing, a departure, a grant's revocation, or a departure emptying an area or freezing a layer." Rule 80 (line 1136) cites "(rules 71, 76, 91)" for the endings, not rule 74.

**Reading.** Rule 74 times the end by its own line: "an act under it placed after that line is not backed (rule 80)". An act placed before that line stands. So the tie rule (an action citing neither side void) may not be meant for it. That is rule 74's line-based ending against the tie rule's citation-based one.

**Options.** (a) Add it to the tie rule's list and to rule 80's pointer: an action under the grant that neither cites nor is cited by the clone putting the new model in force is void. (b) Say in rule 79 that this ending is timed by the line alone, as rule 74 says, and the tie rule does not apply to it. **Lean:** (b), the narrower reading, which rule 74's words already give. **Cost:** a clause. Whether the core's verdict moves under (a) needs checking against `view.rs`. No vector covers the race.

### 10. "Each complete clone that makes a constitutional change" in the identity chain section

"Collectives in the identity chain", line 3282: "A rotation declares, with the same kind, each complete clone that makes a constitutional change, membership included (rules 69, 98) … Only such clones need the collective's chain key to rotate." Read alone, this says every constitutional clone is declared by a rotation, against rule 69 ("a record suffices otherwise") and, now, rules 70, 83 and 89. **Lean:** "A rotation declares, with the same kind, a complete clone that makes a constitutional change, where rule 69 asks a rotation or the members choose one (rule 69: a rotation may declare any constitutional clone)". **Cost:** a clause; no verdict moves (the core's `needs_rotation`).

The suite's checklist (v35, line 150), "member leaving alone by resignation, keeping their share, then rotation plus clone, the rotation declaring the clone", reads the same way. It is a test that may well use a shares grammar, so it is not wrong. But it reads as if a rotation were always needed. **Lean:** add "(a shares grammar)". Cost: two words.

### 11. The suite's pointer to the cMIP's rule numbers (fixed)

Suite v35, line 355, said "a rule they cite numbered 62 to 64, 66 to 68 or 94 to 97 is that cMIP's". It now says "62 to 64, 66, 68 or 94 to 97 … (rule 67 is the Agreements MIR's)", the same pointer slip as rule 99's (point 2). Listed here so the change is seen.

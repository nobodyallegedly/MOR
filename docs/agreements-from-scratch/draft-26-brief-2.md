# Draft 26 of Agreements: the brief, redone

*A record of work by the scribe's session L1, 27 November 2026: stage one of wave three of the stint of 26 November. It sorts draft 25's rules again against everything now decided, for the MOR lead to check before any spec text is written. It decides nothing, writes no rule wording and no remedy, and changes no other file. Where an answer can be read two ways, both are given and neither is chosen. Everything not in quotation marks is this session's wording, unless a cell says whose it is.*

**The wish** (Nobody, allegedly, 26 November, 16:46, at the top of `docs/decisions.md` on main):

> "We need to change the current wish to updating the core after the findings"

On what carries over (16:47): "Yes, we’ll go back to analysis, maybe add the focus on agreements"

On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

**Why** (the MOR lead's wording): wave three is the draft 26 brief redone, then draft 26 itself, a new file beside draft 25, which stays as it is. This file is the brief.

**Marks.** **TRACED**: to a rule or a ledger entry, cited. **COUNTED**: by a script, named in section 8. **INFERRED**: this session's reading. *The ledger* is `docs/decisions.md` on main; *his words* are quoted exactly from it, typos and curly marks as it has them. *The settled note* is `docs/lead/notes/2026-11-27-settled-by-the-lead.md`; *the changes note* is `docs/lead/notes/2026-11-27-what-changed-in-agreements.md`; M, F and Q numbers are the settled note's. *The first brief* is `draft-26-brief.md` (pull request 206); *the check* is `draft-26-check-26-november.md` (pull request 266); *the impact sheet* is `docs/code/impact-26-november.md`. Draft 25 and encoding 2 are on `claude/agreements-clean-1-hahuwn` (pull request 183).

## 1. In plain words

1. Draft 25 is the rewrite of the Agreements rules, not yet accepted. On 26 and 27 November Nobody, allegedly, answered what the simulation round found, and earlier answers (10 to 20 November) still stand; they reach mostly the rules on updates, order and time.
2. A change of Terms now passes two checks: the old version's rule allows it ("valid"), and its place in the order is shown ("the pin"). Two allowed changes that nothing orders are a fork, which the agreement's own people resolve.
3. By default only the known parties (those named when the Terms were made) sign a change. A buyer who joined later, through an open spot (a role), is never bound by a later change: what she signed binds her and the seller, for as long as its words say, on the clock the Terms name.
4. The "place" is renamed the keeper: the agreement's official relay, vouching only for which act came after which; Terms may name several.
5. One act naming another by its fingerprint (its hash) is a knot, proof that it came after; any such naming, in any act of any layer, counts, read one way ("shown after"); a missing act is always "I don't know". A deadline with no stated keeper or clock is refused.
6. New: the words of Terms become a Text act; one form for naming a set of acts; "protect the unknown party" as an Agreements principle; an introduction saying Agreements is not to be used bare.
7. Of the 124 rules, by script: 41 stay, 39 change, 3 go, 26 move, and 15 can be read two ways, both ways given. Ten new rules are named (the six things above among them; three found by this session); 35 points the sources leave unsaid are listed for the MOR lead to take to Nobody, allegedly.

## 2. The sort

One row for each of draft 25's 124 rules: the 72 numbered clauses G1.1 to G14.5 and the 52 lettered sub-clauses, counted as the first brief counted them (COUNTED, `rules.py`, section 8: 72, 52, 124, 99 787 bytes, the first brief's figures). *Rests on* names the ledger entry by its heading and date; where the settled note carries a point, its number is added. *His* marks his words, quoted from that entry. Each row ends with its mark.

**How the words are used.** *stays*: no entry since the first brief, nor any entry it used, changes what the rule says. *changes*: it stays in Agreements and an entry changes what it says. *goes*: it leaves and is written nowhere else. *moves*: it leaves for another text (the MICS, Envelopes, the companion). *two ways*: the entries can be read two ways for this rule; both are given and neither is chosen. **A counting rule of this session's**: a rule whose only change is the word "place" becoming "keeper", or a citation of a rule that goes, is counted as staying, as the first brief counted citations; 6 rules that stay carry the word "place" (COUNTED, `words.py`; one of them, G5.6, in its everyday sense).

| rule | sort | rests on | one line |
|---|---|---|---|
| G1.1 | stays | — | Naming an agreement as a party. No entry reaches it. INFERRED |
| G1.2 | **changes** | "Nothing about me without my signature" (18 Nov); "Delegation is a leftover" (18 Nov) | A power to act for someone counts only where that person signed the version giving it; "a named delegate" carries a word that goes. His: "Nothing about me is accepted without my signature." (as the first brief had it) TRACED |
| G1.3 | stays | — | The receiver field. No entry reaches it. INFERRED |
| G1.4 | **two ways: stays / changes** | "Whose place counts; protect the unknown party, as a principle" (26 Nov); settled note, M20 | It takes a receiver from the Terms in force "per the anchoring the reader accepts": (i) stays, that answer being already named as the reader's, as "Whose place counts" allows; (ii) changes, since the settled note says a reader's anchoring "never puts Terms in force". "Place" becomes keeper either way. INFERRED |
| G1.5 | stays | — | A rule may take a receiver as input. No entry reaches it. INFERRED |
| G2.1 | stays | "The words of Terms are a Text act" (26 Nov) | The words become a Text act named by its act id, and an act id is a fingerprint (encoding 2, E5), so "named by fingerprint" holds; what `body` holds changes in section 3, not here. His: "I think it”s cleaner, it keeps text to text and agreement grammar to agreement grammar, both have their own hashes to verify" INFERRED |
| G2.2 | stays | — | What is left unread. No entry reaches it. INFERRED |
| G3.1 | **two ways: stays / changes** | "There is no unsigned act: the author is a known party" (27 Nov) | Found by this session: `authors` may name roles, and the entry calls the author "a known party": (i) stays, if the author meant is the signer of the Terms act; (ii) changes, if an author named by role is not known. His: "There is no such thing as an unsigned act on Mor" INFERRED |
| G3.2 | stays | — | Authors bear unclear words. No entry since the first brief reaches it. INFERRED |
| G4.1 | **two ways: stays / changes** | "Valid means in force: one gate for an update" (26 Nov); "In force once pinned" (18 Nov); "The gate and the pin; a fork, not a race" (26 Nov); settled note, M19 | How the first version comes into force: (i) stays, as the 16:19 line ("The first version comes into force by the assents of its named parties") and the settled note ("Unchanged") read it; (ii) changes, by the pin of 18 November, which no later entry withdraws, kept on 26 November as "order and not consent". His (18 Nov): "Agreed. Let them get stuck and cook it clean" TRACED |
| G4.2 | stays | "Who signs an update by default: the known parties" (26 Nov); settled note, M11 | A role's module is still read for who fills a spot and for the first version; not for an update. TRACED |
| G4.3 | **changes** | "For the unknown party there is no update, only the agreement she signed" (27 Nov); "Who signs an update by default: the known parties" (26 Nov); settled note, M15 | An assent binds only while its Terms are in force; for a filling, the version her proof names binds her, and the seller to her, for as long as its words say, after a later version is in force. His: "There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?" TRACED |
| G4.4 | stays | — | An agreement as a party is not counted by default. No entry reaches it. INFERRED |
| G4.5 | **changes** | "The gate and the pin; a fork, not a race" (26 Nov); "Valid and in force, two words, two jobs" (26 Nov) | Terms stop when the update replacing them passes both the gate (valid) and the pin (its order shown); draft 25 read the replacing Terms' "in force" by G4.1. The entry names G4.7 and G4.8, not this rule. His: "Ok, that”s what I was trying to remember we forced the deadlock and push them to resolve it" INFERRED |
| G4.6 | **changes** | "The place vouches for the chaining only" (26 Nov); "Whose place counts; protect the unknown party, as a principle" (26 Nov); settled note, M20 | Which Terms are in force is taken per the keeper or keepers the Terms name, or as shown; the reader's own anchoring gives only an answer labelled as the reader's. His: "Yes, vouch for the chaining only" TRACED |
| G4.7 | **changes** | "The gate and the pin; a fork, not a race" (26 Nov); "A fork is a fork" (27 Nov) | Two updates of one version that each pass the gate, and that nothing orders, are a fork, as draft 25 has it; its test "each has the assents its own `in_force` requires" goes. His: "A fork is a fork." TRACED |
| G4.7(a) | **changes** | "Knots are knots: one reading, "shown after"" (27 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | Knots become any fingerprint in a field of any act held, of any layer; its test "valid and in force" becomes the gate and the pin. His: "Knots a cross acts by nature, and possibly cross layer." TRACED |
| G4.7(b) | **changes** | "The place vouches for the chaining only" (26 Nov); "Ana's month ends by the clock the agreement names" (27 Nov); "Whose place counts; protect the unknown party, as a principle" (26 Nov); settled note, M20 | Lateness per the keeper or keepers and per the clock the Terms name; "per the anchoring the reader accepts", where the Terms name none, no longer makes an update late for the Terms' own answer. His: "The clock specified in the agreement and its anchoring." TRACED |
| G4.7(c) | **changes** | "A missing act stays unchecked: no door around it" (26 Nov); "Knots are knots: one reading, "shown after"" (27 Nov); "A late version 3 is rejected" (26 Nov) | Its answer "per anchoring" goes with (b). On a missing act, two ways: its "that act might be what shows L came late" (i) already says "unchecked" for any missing act named in a field, or (ii) is narrower and widens. His: "Missing act is always “I don’t know”" TRACED |
| G4.7(d) | stays | — | Validity after another update is the condition's to say. No entry reaches it. INFERRED |
| G4.7(e) | stays | "A fork is a fork" (27 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | Both tips stop and the last shared version stays in force: what "A fork is a fork" keeps; only its word "place" is renamed. His: "Not that it can, from core pov it has to." TRACED |
| G4.8 | **changes** | "The gate and the pin; a fork, not a race" (26 Nov); "Valid and in force, two words, two jobs" (26 Nov); "Valid means in force: one gate for an update" (26 Nov) | An update replaces only if (a) the original's update condition answers valid and (b) its order after the last replacement is shown, by the keeper(s) or the knots; its sentence handing "in force" to G4.1 goes. His: "Ok, that”s what I was trying to remember we forced the deadlock and push them to resolve it" TRACED |
| G4.8(a) | **changes** | "Who signs an update by default: the known parties" (26 Nov); "There is no unsigned act: the author is a known party" (27 Nov); settled note, M11 | "Everyone who signed the original" becomes the known parties, named in the Terms when made, the author among them, never a filling; "the default asks for no one's signature" goes, and so does "A role's cMIP not held". His: "It’s the protect the unknown party expressed the old way." TRACED |
| G4.8(b) | stays | "Who signs an update by default: the known parties" (26 Nov) | Its words stand if the phrase "everyone who signed the original" keeps its place in (a) with the new meaning; replacing the phrase would be wording. INFERRED |
| G4.8(c) | stays | — | A default update lacking a signature replaces nothing, "not shown". No entry changes it. INFERRED |
| G4.8(d) | **changes** | "The place vouches for the chaining only" (26 Nov) | Judged per the keeper or keepers the original names: order counts where they agree, and is "not shown" where they disagree, the disagreement kept as evidence; the clock stays. His: "Two disagreeing has its value though" TRACED |
| G4.8(e) | stays | "A missing act stays unchecked: no door around it" (26 Nov) | An update that cannot be checked leaves the line unchecked: what the entry keeps. His: "Dunno, I feel it should stay unchecked." TRACED |
| G4.8(f) | **goes** | "Delegation is a leftover" (18 Nov) | It only points to G5.5, which goes. His: "I think it's best. It's a leftover of the old ways" TRACED |
| G4.8(g) | **two ways: moves / changes** | "Only rules in the hashed text" (17 Nov); "The gate and the pin; a fork, not a race" (26 Nov); "Who signs an update by default: the known parties" (26 Nov) | Draft 18's history: (i) moves to the companion, as history; (ii) changes, read as the default said again, the default now being the known parties and the gate having the pin beside it. His: "Those old drafts should be buried deep, only for people who wish to do some archeology…" TRACED |
| G4.9 | **changes** | "The gate and the pin; a fork, not a race" (26 Nov); "What a dissolution is" (18 Nov); "Leaving takes two acts" (18 Nov); "For the unknown party there is no update, only the agreement she signed" (27 Nov) | Its first sentence follows G4.5. Inside it, two ways remain as the first brief found them: an agreement "can always end" by an update stating its dissolution, against its "a verifier MUST NOT answer that Terms or an agreement have ended". His (18 Nov): "Wait… an agreement can always end, it is not a feature, it is an update to the agreement that states the dissolution of it" TRACED |
| G4.10 | **changes** | "A fork is a fork" (27 Nov); "What a race stops" (18 Nov); "In force once pinned" (18 Nov); "The place vouches for the chaining only" (26 Nov) | A completing assent and a counter signature that nothing orders are a fork: neither takes effect, the earlier state stays, a new act resolves it; "per place" becomes per keeper(s); where the pin closes the window turns on G4.1. His: "A fork is a fork. When a fork exists there could be a race between a white party and a black party. Or, the fork could be resolved amicably by all emvolved" TRACED |
| G4.11 | stays | "Valid and in force, two words, two jobs" (26 Nov) | "Valid" answers the gate only, which is this rule's own job. His: "Agreed." TRACED |
| G4.11(a) | **changes** | "A condition in time with no anchor is refused" (26 Nov, both copies) | What the condition is given loses "the anchoring named where it names none": a condition in time with no stated anchor is refused. The entry names (c), not (a). His: "Yes, condition is missing, it should be refused" INFERRED |
| G4.11(b) | stays | — | The condition runs from the bytes. No entry reaches it. INFERRED |
| G4.11(c) | **changes** | "A condition in time with no anchor is refused" (26 Nov, both copies) | Its ground "where it names none, per the anchoring named or as shown" goes; Terms that name a cMIP needing a clock or a keeper, and name neither, are invalid. His: "Yes, condition is missing, it should be refused" TRACED |
| G4.11(d) | **changes** | "The gate and the pin; a fork, not a race" (26 Nov); "Valid and in force, two words, two jobs" (26 Nov) | "Valid" no longer means "the update replaces": it replaces only once its order is also shown. His: "Agreed." TRACED |
| G4.11(e) | **changes** | "Who signs an update by default: the known parties" (26 Nov); "There is no unsigned act: the author is a known party" (27 Nov); "Delegation is a leftover" (18 Nov) | The default: an update is valid when every known party signs it; its sentence on a delegation goes. His: "It’s the protect the unknown party expressed the old way." TRACED |
| G4.11(f) | **changes** | "Ana's month ends by the clock the agreement names" (27 Nov); "A buyer under a replaced version: what version 2 says" (26 Nov) | What a filling gave ends as its version's words say, on the clock the Terms name, with no update: "change only through an update" no longer holds for a filling. His: "There is no valid update to sign, only signed terms to respect." TRACED |
| G4.11(g) | **changes** | "Who signs an update by default: the known parties" (26 Nov); "Only rules in the hashed text" (17 Nov) | Who signs a resolving update (the update that ends a fork) by default changes: from "everyone who signed the shared version" to the known parties. Its last sentence, history, also goes to the companion document; the rule itself stays, so it is sorted as changing. INFERRED |
| G4.11(h) | stays | "A hand count is the client's choice" (26 Nov) | Lacking the cMIP, the answer is unchecked: what the entry keeps. His: "It should only say unchecked." TRACED |
| G4.11(i) | **changes** | "A buyer under a replaced version: what version 2 says" (26 Nov); "What a dissolution is" (18 Nov) | It uses the condition's output "in G10.6", which no longer reads it once G10.6 (b) goes; the first brief's two ways on "can never be updated", against a dissolution's "Cannot be updated.", remain. His: "Yes, it was a bad idea." TRACED |
| G5.1 | stays | — | The opening of the three ways to be bound. No entry reaches it. INFERRED |
| G5.1(a) | stays | — | Bound by one's own signature. No entry changes it. INFERRED |
| G5.1(b) | **changes** | "Nothing about me without my signature" (18 Nov) | A power binds only where the person acted for signed the version that gives it. His: "Nothing about me is accepted without my signature." (as the first brief had it) TRACED |
| G5.1(c) | **changes** | "For the unknown party there is no update, only the agreement she signed" (27 Nov); "A buyer under a replaced version: what version 2 says" (26 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | Bound by an update one did not sign: never a filling, since no update of the known parties reaches her; for a known party, by an update that also passes the pin (this session's reading). His: "There is no valid update for her anymore." TRACED |
| G5.2 | **changes** | "For the unknown party there is no update, only the agreement she signed" (27 Nov); "Only rules in the hashed text" (17 Nov) | Its binding under G5.1(c) no longer reaches a filling; its sentences on draft 18 are history, for the companion. INFERRED |
| G5.3 | stays | — | An act with no `for` is its signer's own. No entry reaches it. INFERRED |
| G5.4 | **changes** | "The gate and the pin; a fork, not a race" (26 Nov); "The place vouches for the chaining only" (26 Nov); "A fork is a fork" (27 Nov) | Its "valid (G4.11) and in force (G4.1)" becomes the gate and the pin, per keeper(s); where citing gives no order, two ways: draft 25's "not shown", or a fork under "A fork is a fork". INFERRED |
| G5.5 | **goes** | "Delegation is a leftover" (18 Nov) | Delegation and the delegator's default way out go. His: "I think it's best. It's a leftover of the old ways" TRACED |
| G5.6 | stays | — | Constitution, executive and judicial kept apart. No entry reaches it. INFERRED |
| G5.6(a) | **changes** | "Who signs an update by default: the known parties" (26 Nov) | Its "with none named, by an update everyone who signed it has signed" follows the default signers, the known parties. INFERRED |
| G5.6(b) | stays | — | The executive is the powers. No entry reaches it. INFERRED |
| G5.6(c) | stays | — | The judicial is set in the Terms. No entry reaches it. INFERRED |
| G5.6(d) | stays | — | The judicial changes only by an update. No entry reaches it. INFERRED |
| G5.6(e) | stays | — | Using it is not changing it. No entry reaches it (it holds one clause of history, "as draft 18 has it"). INFERRED |
| G5.6(f) | **two ways: stays / changes** | "A power given binds its giver" (18 Nov); "Nothing about me without my signature" (18 Nov) | As the first brief found: an agent signing for her a version that widens his power over her; no later entry answers it. His: "If you grant powers via a cMIP you take on the responsibilities" TRACED |
| G5.7 | **changes** | "Delegation is a leftover" (18 Nov); "Who signs an update by default: the known parties" (26 Nov); "A buyer under a replaced version: what version 2 says" (26 Nov) | Its "the delegator of a delegation" goes; "a filling's rights change only as G10.6 says" stands again with G10.6 (a); "bound by an update they did not sign" no longer reaches a filling. INFERRED |
| G5.7(a) | **changes** | "Delegation is a leftover" (18 Nov); "Firing an employee" (18 Nov) | When a power ends is the power's own rule's, not G5.5's. His: "True, it is now a set of agreements, no a collective having its rules, so each agreement is separate, one is the collective, one is the employment" (as the first brief had it) TRACED |
| G5.7(b) | **changes** | "Who signs an update by default: the known parties" (26 Nov) | Its default, "everyone who signed the original", with everyone "who agreed to what the agent signed", follows the known parties. INFERRED |
| G5.7(c) | **changes** | "A fork is a fork" (27 Nov); "In force once pinned" (18 Nov) | A counter signature before the Terms are in force, changing with G4.10. TRACED |
| G6.1 | **two ways: stays / moves** | "Two threads, two owners" (17 Nov); "Knots are knots: one reading, "shown after"" (27 Nov) | As the first brief found: the signer's line is the lower layer's (move), or G6's line within one agreement is Agreements' own (stay); "Knots are knots" lists "a signer's line" among Agreements' own questions of order, which fits either. His (17 Nov): "It does" TRACED |
| G6.2 | **two ways: stays / moves** | "Two threads, two owners" (17 Nov) | With G6.1. His (17 Nov): "It does" TRACED |
| G7.1 | **changes** | "The place vouches for the chaining only" (26 Nov); "Agreements gets an introduction" (27 Nov) | `place` becomes keeper: the agreement's official relay, named in its Terms, vouching for the chaining only; Terms may name more than one. His: "Yes, vouch for the chaining only" TRACED |
| G7.2 | **changes** | "The place vouches for the chaining only" (26 Nov) | Order counts where the keepers named agree; where they disagree, "not shown", the disagreement kept as evidence. Whether the rest of its list (who holds what, a period passed, made public) stays the keeper's is unsaid. His: "Two disagreeing has its value though" TRACED |
| G7.3 | **moves** | "How a reader answers goes to the MICS" (18 Nov); "Whose place counts; protect the unknown party, as a principle" (26 Nov) | To the MICS, as the first brief had it. His: "The MICS, I assume they are overarching rules" TRACED |
| G7.4 | **changes** | "The place vouches for the chaining only" (26 Nov); "Ana's month ends by the clock the agreement names" (27 Nov) | "Place" becomes keeper(s); the clock the Terms name stays, and now counts a filling's term, against the 17 November list of what leaves G7. His: "The clock specified in the agreement and its anchoring." TRACED |
| G8.1 | **moves** | "How a reader answers goes to the MICS" (18 Nov) | To the MICS. His: "The MICS, I assume they are overarching rules" TRACED |
| G8.2 | **moves** | "How a reader answers goes to the MICS" (18 Nov); "A condition in time with no anchor is refused" (26 Nov, both copies) | To the MICS; its last clause ("where it names none, only per an anchoring the reader accepts") meets the refusal, so it moves changed. His: "The MICS, I assume they are overarching rules" TRACED |
| G8.3 | **moves** | "How a reader answers goes to the MICS" (18 Nov) | To the MICS. His: "The MICS, I assume they are overarching rules" TRACED |
| G8.4 | **moves** | "How a reader answers goes to the MICS" (18 Nov) | To the MICS. His: "The MICS, I assume they are overarching rules" TRACED |
| G8.5 | stays | — | The settlement socket. No entry reaches it. INFERRED |
| G9.1 | **moves** | "How a reader answers goes to the MICS" (18 Nov); "A hand count is the client's choice" (26 Nov) | To the MICS; his "It should only say unchecked.", for a reader lacking a cMIP, agrees with it. His: "The MICS, I assume they are overarching rules" TRACED |
| G9.2 | **moves** | "How a reader answers goes to the MICS" (18 Nov) | To the MICS. His: "The MICS, I assume they are overarching rules" TRACED |
| G10.1 | stays | — | What a role names. No entry reaches it. INFERRED |
| G10.2 | stays | — | A spot filled, with its proof. No entry changes it. INFERRED |
| G10.3 | stays | — | A filler (a buyer who came in through a role) is a party, bound only by their own assent: what the principle "protect the unknown party" keeps. No entry changes it. INFERRED |
| G10.4 | stays | — | A role of kind future. No entry reaches it. INFERRED |
| G10.5 | **changes** | "A condition in time with no anchor is refused" (26 Nov, both copies); "A buyer under a replaced version: what version 2 says" (26 Nov) | Its "per the anchoring named" goes; "keeps the rights of the version it was earned under (G10.6)" stands again. His: "Yes, condition is missing, it should be refused" TRACED |
| G10.6 | **changes** | "A buyer under a replaced version: what version 2 says" (26 Nov); "For the unknown party there is no update, only the agreement she signed" (27 Nov); "Ana's month ends by the clock the agreement names" (27 Nov) | Comes back with (a) only; its paragraph on (b) and "or the condition named and its answer" go; "Nothing stops those rights by itself" meets the term ending by the clock; no update reaches the filling at all, not only its rights. His: "Version 2 is what she bought, and she has no say in the update." TRACED |
| G10.6(a) | **two ways: stays / changes** | "A buyer under a replaced version: what version 2 says" (26 Nov); settled note, M22; "A power given binds its giver" (18 Nov) | (i) stays as written, "in their own name" (G5.1(a)), as the 26 November line has it; (ii) changes, to count an assent made for her under a power she gave, as the settled note reads it from 18 November. His (18 Nov): "If you grant powers via a cMIP you take on the responsibilities" TRACED |
| G10.6(b) | **goes** | "A buyer under a replaced version: what version 2 says" (26 Nov) | The update condition of her version no longer reaches what she earned. His: "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under" TRACED |
| G10.7 | **changes** | "Ana's month ends by the clock the agreement names" (27 Nov); "Only rules in the hashed text" (17 Nov) | Its "No condition triggers", with no answer that a filling's rights no longer apply, meets the cMIP that answers whether what she bought still applies, which the verifier shows; its opening is history. His: "There is no valid update to sign, only signed terms to respect." TRACED |
| G11.1 | stays | — | Sequence and leg. No entry reaches it. INFERRED |
| G11.2 | stays | "Where three rules live" (17 Nov) | "The call in Terms" is kept, by the line only, as the first brief had it. TRACED |
| G11.3 | **two ways: stays / moves** | "Where three rules live" (17 Nov) | As the first brief found (its reading 14): kept, or leaving with the report block. His (17 Nov): "Agreed for the first, not sure I get the second, expand on third too" TRACED |
| G11.4 | **moves** | "Where three rules live" (17 Nov) | To the MICS, with the report block. His (17 Nov): "Agreed for the first, not sure I get the second, expand on third too" TRACED |
| G11.4(a) | **moves** | "Where three rules live" (17 Nov) | To the MICS. TRACED |
| G11.4(b) | **moves** | "Where three rules live" (17 Nov) | To the MICS. TRACED |
| G11.4(c) | **moves** | "Where three rules live" (17 Nov) | To the MICS. TRACED |
| G11.4(d) | **moves** | "Where three rules live" (17 Nov) | To the MICS. TRACED |
| G11.4(e) | **two ways: stays / moves** | "Where three rules live" (17 Nov) | As the first brief found: "before paying" answers from signed Terms alone (stay), or goes with the reading of reports (move). TRACED |
| G11.5 | **two ways: stays / moves** | "Where three rules live" (17 Nov) | As the first brief found: no entry names it; both maps read it as leaving. TRACED |
| G11.6 | **moves** | "Where three rules live" (17 Nov) | To the MICS, by its own words and the line only. TRACED |
| G11.6(a) | stays | "Where three rules live" (17 Nov); "Seeing and being told" (18 Nov) | The consent to data beyond one leg, the socket kept, by the line only. His (18 Nov): "Sounds good" TRACED |
| G11.6(b) | **two ways: stays / changes** | "Seeing and being told" (18 Nov) | As the first brief found: the socket whole, or narrower than the guarantee it gives. His (18 Nov): "Sounds good" TRACED |
| G11.6(c) | **two ways: stays / moves** | "Where three rules live" (17 Nov) | As the first brief found: one sentence is the block's, one is how people agree to a further path. TRACED |
| G11.7 | stays | "Where three rules live" (17 Nov) | The buyer's leg, kept by the line only; it names G10.6, which stands again. TRACED |
| G11.8 | stays | "Where three rules live" (17 Nov) | The contest, kept by the line only. TRACED |
| G12.1 | **changes** | "A fork is a fork" (27 Nov); "Delegation is a leftover" (18 Nov); "Who signs an update by default: the known parties" (26 Nov) | Its fork, "two updates of the same act of one line", widens to two acts competing to change the same state with no order shown; the delegation clause and "those whose assent G4.1 asks for" go. His: "Not that it can, from core pov it has to." TRACED |
| G12.2 | stays | "No release by a fork or a key" (18 Nov); "A fork is a fork" (27 Nov) | Both tips stop; a signer's own fork releases no one. His (18 Nov): "Confirmed" TRACED |
| G12.3 | **changes** | "A resolve with nothing to resolve: "not shown", with the reason" (26 Nov); "Who signs an update by default: the known parties" (26 Nov); "A fork is a fork" (27 Nov) | A resolve with nothing to resolve is answered "not shown, nothing to resolve"; its default signers follow the known parties; how a fork that is not of a line is resolved is unsaid. His: "Agreed. It’s a different reason for a “sorry can’t do” and it’s always good to state why" TRACED |
| G12.4 | stays | "The gate and the pin; a fork, not a race" (26 Nov) | A power to resolve, named in advance: the way out the entry keeps ("G12.3, G12.4"). It holds one sentence of history. TRACED |
| G12.5 | stays | "A fork is a fork" (27 Nov); "A missing act stays unchecked: no door around it" (26 Nov) | The line's "strangers who relied on one side keep it, disputed" is what this rule says; its sentence on a filling rests on G10.6, which stands again; the lean to extend it to a stall was withdrawn. TRACED |
| G12.6 | stays | — | An unresolved fork stands. No entry changes it. INFERRED |
| G12.7 | stays | — | Rival resolving updates (two acts that each try to end the same fork). No entry names it, so it stays as written; whether a resolving update also needs the pin is unsaid (section 7, item 10), and if it does, this rule changes. INFERRED |
| G12.8 | stays | — | A client's duty on forks. No entry changes it. INFERRED |
| G13.1 | **two ways: stays / changes** | "Knots are knots: one reading, "shown after"" (27 Nov); "The words of Terms are a Text act" (26 Nov) | (i) changes: G4.7(a) takes its list as "the knots", which now covers every fingerprint field of any act of any layer, `body` among them; (ii) stays: it says what an act is read against, and "shown after" is written elsewhere. INFERRED |
| G13.2 | stays | — | An act names what it relied on. No entry changes it. INFERRED |
| G13.3 | **changes** | "Knots are knots: one reading, "shown after"" (27 Nov); "The gate and the pin; a fork, not a race" (26 Nov) | It becomes the one reading "shown after": B after A where a chain of namings runs from B back to A, or a keeper's record or an anchoring places them; its "valid and in force" becomes gate and pin; "per place" per keeper(s). His: "Knots a cross acts by nature, and possibly cross layer." TRACED |
| G13.4 | **changes** | "A condition in time with no anchor is refused" (26 Nov, both copies); "Whose place counts; protect the unknown party, as a principle" (26 Nov) | "Only where the agreement names none does each reader accept the anchoring it chooses" no longer answers for the Terms: such an answer is the reader's, labelled. His: "Yes, condition is missing, it should be refused" TRACED |
| G14.1 | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.2 | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, and changes there (a power binds only where she signed the version giving it), as the first brief had it. TRACED |
| G14.3 | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.3(a) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.3(b) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.3(c) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.3(d) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.4 | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.5 | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.5(a) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.5(b) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.5(c) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.5(d) | **moves** | "Where three rules live" (17 Nov); "The holder at the act cited" (17 Nov) | To Envelopes, with the baker's rule, as the first brief had it. TRACED |
| G14.5(e) | **two ways: moves / stays** | "Where three rules live" (17 Nov) | As the first brief found: under the baker's rule (move), or a use of the contest, which stays. TRACED |

**Outside the 124, and not sorted as rules.** Section 2's definitions and section 3's fields are not rules. The entries reach at least these: the definitions of Place, Clock, Anchoring, In force, Buyer and Offer, and the verifier's Answers; and the fields `body` (now a Text act's id), `place` (now the keeper, one or several), `clock` and `in_force` on an update (left unread, settled note Q7). Encoding 2 changes at E8 (the body), gains a value form (the set of acts) and changes nowhere else that this session found (the impact sheet's totals: no new field, no new act type). The eight tasks, briefly: K1 changes (its output "for a delegation" goes; it now reads a Text act); K4 changes (it is no longer asked about a filling, G10.6 (b) going); K5 stays (it gives the version a filling was earned under, which G10.6 reads again); K2, K3, K7 and K8 stay; K6 stays or changes with G11.3, as the first brief found. INFERRED, but for K4 (TRACED: the check's table, row "§5 K4 row").

## 3. The new rules

Things the ledger now holds for which draft 25 has no rule. For each: the entry, his words where they reach it, and the note's row where a note carries it. None is worded here.

**N1. The gate and the pin.** An update replaces the version it names only if that version's update condition answers valid (the gate) and its order after the last replacement is shown, by the keeper or keepers the Terms name or by the knots (the pin). Draft 25 has the gate (G4.8) and no pin for an update. Entry: "The gate and the pin; a fork, not a race" (26 Nov, 17:39–17:46), with "Valid and in force, two words, two jobs" (26 Nov, 18:00), which it refines, and "Valid means in force: one gate for an update" (26 Nov, 16:19), whose "race" it withdraws. His: "So the pin and the gates are…", "In MOR terms, in specs pls", "Ok, that”s what I was trying to remember we forced the deadlock and push them to resolve it". Changes note: rows G4.8, G4.11. The wording of G4.8 in the entry is the MOR lead's (TRACED).

**N2. The keeper, one or several.** The agreement's official relay, named in its Terms, vouching for the chaining only; copies may sit on any relay; Terms may name more than one, the order counting where they agree and "not shown" where they disagree, the disagreement kept as evidence. Entries: "The place vouches for the chaining only" (26 Nov, 17:47–17:49); "Agreements gets an introduction" (27 Nov, 07:27–07:37) for the verbs and the market; "Whose place counts; protect the unknown party, as a principle" (26 Nov) for a keeper the parties never named. His: "So “place” is the “official relay for the agreement” it tracks the chain and vouch for it, redundancy can also live elsewhere", "Yes, vouch for the chaining only", "Two disagreeing has its value though", "Yes, they should. Can we find a better name for “place”?", "Why not use keeper again?", "Yes, the idea of MOR is to split the layers so relays can specialize. A relay that specializes in agreements wants to setup in a way where it can act as a keeper." Changes note: row G7. Settled note: M12, M20 (TRACED).

**N3. The set of acts.** One value form in Agreements' grammar for naming a set of acts: the ids, sorted, repeats dropped, hashed with a label; it says nothing of completeness, meaning or time. Entry: "One way to name a set of acts, in Agreements" (26 Nov, 16:11–16:16). His: "You are going to expand what the set of byte is and what it does pls", "Should it be in envelopes though? It feels like agreements stuff", "Knots making is core core business, a" (the line reads "a" as option a). Changes note: row "New value form". Settled note: M21, F12, F13. The impact sheet: one new value form, 5 new vectors in a file of their own (TRACED).

**N4. The words as a Text act.** The words of Terms are a Text act, public or private, published first, and the Terms name it by its act id; the hash choice for loose words goes. Entry: "The words of Terms are a Text act" (26 Nov, 16:25–16:28). His: "How many acts are involved here?", "I think it”s cleaner, it keeps text to text and agreement grammar to agreement grammar, both have their own hashes to verify", "Text comes first as a rule since agreement needs to point to it". Changes note: row "Section 3, E8". Settled note: F10, Q24, Q25. The impact sheet: 2 new vectors (TRACED).

**N5. The principle.** Protect the unknown party, an Agreements principle: a participant who joins through a role after the Terms were made has no say in updates, and no update reaches her; what she signed binds her, and binds the seller to her, for as long as its words say. Entries: "A buyer under a replaced version: what version 2 says" (26 Nov, 15:49–16:03); "Whose place counts; protect the unknown party, as a principle" (26 Nov, 15:51); "Protect the unknown party is an Agreements principle" (26 Nov, 16:05); "Who signs an update by default: the known parties" (26 Nov, 17:51–17:59); "For the unknown party there is no update, only the agreement she signed" (27 Nov, 07:53–07:55). His: "Protect the unknown parties.", "It is worth turning it into a principle. Protect the unknown party", "It’s an agreements principle", "There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?" Changes note: "The principle". Settled note: F16 (TRACED).

**N6. A filling's term ends by the clock.** What a filling gave lasts as long as its version's words say, counted on the clock the Terms name from the anchoring of the purchase; the cMIP that reads the words answers, and the verifier shows the answer; no update ends it. Entry: "Ana's month ends by the clock the agreement names" (27 Nov, 07:50–07:53). His: "The clock specified in the agreement and its anchoring.", "There is no valid update to sign, only signed terms to respect. It’s a problem that really only impacts subscriptions models I think". Changes note: its row for G10.7 and the 17 November "one block". Settled note: Q26 (TRACED).

**N7. Shown after.** One reading of knots, for every verifier: act B is shown after act A where the verifier holds a chain of acts, each naming the one before by fingerprint, from B back to A, or a keeper's record or an anchoring that places them; it proves after, never before, never absence; Agreements uses it for a late update, the pin and a signer's line. Entries: "Knots are knots: one reading, "shown after"" (27 Nov, 07:38–07:49); "A missing act stays unchecked: no door around it" (26 Nov, 18:34–18:57). His: "I struggle with the first one because knots are knots… in ordering any knot that can be leveraged should be leveraged.", "Missing act is always “I don’t know”", "Knots a cross acts by nature, and possibly cross layer." Changes note: row G4.7(c). The one-line definition is the MOR lead's line, not his words (section 7, item 28) (TRACED).

**Found by this session**, from the same ground:

**N8. One fork for every competing change.** The core knows one thing, the fork: two acts competing to change the same state with no order shown (rival updates, a coming into force against a withdrawal, any other); neither takes effect, the earlier state stays, a new act resolves it. Draft 25 has forks of lines only (G12.1) and a race inside G4.10. It replaces the first brief's new item 7, "One rule for every race". Entry: "A fork is a fork" (27 Nov, 07:01–07:08). His: "So, for you a race and a fork are two things… but from a MOR point of view they are not. (Slow start…)", "Not that it can, from core pov it has to. If they have to be treated differently under different scenarios that is another question.", "A fork is a fork. When a fork exists there could be a race between a white party and a black party. Or, the fork could be resolved amicably by all emvolved". Changes note: row G4.7, G12 (TRACED).

**N9. No stated anchor, no condition in time.** A verifier refuses Terms that name a cMIP needing a clock or a keeper and name neither (the Terms invalid); where only the words speak of time, a client refuses to sign (client conformance). Draft 25 has no such invalidity. Entries: "A condition in time with no anchor is refused" (26 Nov, 18:00–18:30, both copies: their differences are section 7, item 35); ""Before the close" was the simulation's" (26 Nov, 16:33). His: "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition", "Yes, condition is missing, it should be refused", "Tools that verify that text and agreement state the same thing will be needed". Changes note: row G4.11(c), G10.5, G13.4. Settled note: Q26 (TRACED).

**N10. Relying, by the client, when it signs (client conformance).** When a party signs an agreement, its client also signs a witness act relying on the words' Text act, so that a key change of the words' signer leaves them visible as disputed (Identity draft 16, rule 34); relying is the general way any act someone depends on survives its signer's key change. Entry: "Signing an agreement relies on its words" (26 Nov, 18:30–18:37). His: "Clients can easily fix this by automatically rely on the text when an agreement is signed.", "Just to finish… rely is the solution to all acts someone has to rely on." Changes note: row "Section 3, E8". Settled note: F4, F9 (TRACED; whether it is written in Agreements, like G12.8, or elsewhere is unsaid).

**Carried from the first brief, still standing** (its "What is new", items 2 to 6 and 8 to 12; entries of 17 and 18 November, which carry over, re-sourced there and not here): knots made structural where needed (the 27 November line adds "The core ensures knots exist"); a dissolution read from the fields; two acts to leave; a new act is a new agreement; nothing about me without my signature; no release by a fork or a key; order is sequence; a key change continues the signer's line; the buyer of the baker's rights carries the risk; what Agreements still asks of Envelopes. Its item 1, "In force once pinned", now stands for updates in N1, and for a first version is G4.1's two ways; its item 7 is replaced by N8 (TRACED).

## 4. The introduction

What it must say, as the entry "Agreements gets an introduction" (27 November, 07:18–07:26) has it. Listed, not drafted. The line is the MOR lead's; his words are quoted beside each item.

1. Agreements is not to be used bare. His: "Not to be used bare." With the earlier "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it." ("A late version 3 is rejected", 26 Nov). Settled note Q22: the warning is the introduction's, not the verifier's output.
2. It offers sockets for rule books, not one way of agreeing. His: "Agreements offer the basic sockets to draft rule books, not one unified way of agreeing, more like a language used to decide how to agree." With "What I can state… when trying to build an agreement layer that could make everyone happy it became clear that it was best to treat it almost as a language and let the community implementations write the rules" (26 Nov, 15:38).
3. The keeper is introduced as the drafters' way to agree where the agreement is kept, said in passing where the keeper is introduced. His: "Keepers (old “place”) gives the drafters of agreements a way to agree on where the agreement shall be stored. (This can be simply mentioned when introducing the concept of keeper)". Then (07:27): "Yes, stored like on any other relay, no?", which led to the three verbs: "Agreed. An uploader lodges, the relay relays, and the client fetches."
4. Knots are MOR-wide; in Agreements their importance is discussed where Rely is. His: "Knots is a MOR wide concept, but in agreement Rely is a good place to discuss their importance."
5. What it must not say as such: the MOR lead's one sentence that Terms naming no keeper depend on every needed signer's knots. His: "I think agreement need an introduction that states a few things yes. I don’t think it should be stated as such."

Not in the entry, and so not listed as its content: the principle (N5), whose place the 16:05 line gives as the companion; whether the introduction sits in the hashed text (section 7, items 15 and 16).

## 5. The size

**What was measured** (COUNTED, `rules.py` and `sort.py`, section 8): draft 25's present words only, section 4, by rule. The words that the 39 changes and the 10 new rules would add are not written, so they are not counted; draft 26's true size is not known.

| | rules | bytes of draft 25's words | share |
|---|---|---|---|
| draft 25, section 4 | 124 | 99 787 | 100% |
| stay | 41 | 28 155 | 28% |
| change (present words, to be rewritten) | 39 | 35 037 | 35% |
| two ways | 15 | 12 053 | 12% |
| go | 3 | 4 020 | 4% |
| move (13 to the MICS, 13 to Envelopes) | 26 | 20 522 | 21% |
| **left, if every two-way reading keeps its rule** | **95** | **75 245** | **75%** |
| the 8 two-way rules one of whose readings takes them out | 8 | 5 590 | 6% |
| **left, if those 8 go out** | **87** | **69 655** | **70%** |

**The bytes of draft 25's present words that stay**, unchanged: 28 155 (the 41 rules that stay), and up to 28 155 + 12 053 where the 15 two-way rules are read as staying unchanged.

Against the first brief (85 to 94 rules left, 68.4 kB to 74.1 kB): two rules more are left at the low end and one at the high end, chiefly because G10.6 comes back and one fewer two-way reading takes a rule out (COUNTED, `compare.py`).

**What a change touches in code** (the impact sheet, which decides nothing, and which covers the seventeen exchanges up to "Wave two", not the entries from 17:39 on 26 November): no existing vector changes its answer on any reading; up to 9 change if questions go one way; 22 new vectors; 1 new value form; 2 removals (G10.6 (b); the in-force step for updates). The entries from the gate and the pin onwards (the pin, the keeper, the known parties, the fork, the knots, the month, the unknown party) are not in it.

## 6. The totals

| sort | rules | which |
|---|---|---|
| stays | 41 | G1.1, G1.3, G1.5, G2.1, G2.2, G3.2, G4.2, G4.4, G4.7(d), G4.7(e), G4.8(b), G4.8(c), G4.8(e), G4.11, G4.11(b), G4.11(h), G5.1, G5.1(a), G5.3, G5.6, G5.6(b), G5.6(c), G5.6(d), G5.6(e), G8.5, G10.1, G10.2, G10.3, G10.4, G11.1, G11.2, G11.6(a), G11.7, G11.8, G12.2, G12.4, G12.5, G12.6, G12.7, G12.8, G13.2 |
| changes | 39 | G1.2, G4.3, G4.5, G4.6, G4.7, G4.7(a), G4.7(b), G4.7(c), G4.8, G4.8(a), G4.8(d), G4.9, G4.10, G4.11(a), G4.11(c), G4.11(d), G4.11(e), G4.11(f), G4.11(g), G4.11(i), G5.1(b), G5.1(c), G5.2, G5.4, G5.6(a), G5.7, G5.7(a), G5.7(b), G5.7(c), G7.1, G7.2, G7.4, G10.5, G10.6, G10.7, G12.1, G12.3, G13.3, G13.4 |
| goes | 3 | G4.8(f), G5.5, G10.6(b) |
| moves | 26 | to the MICS, 13: G7.3, G8.1, G8.2, G8.3, G8.4, G9.1, G9.2, G11.4, G11.4(a), G11.4(b), G11.4(c), G11.4(d), G11.6; to Envelopes, 13: G14.1 to G14.5(d) |
| two ways | 15 | stays or changes, 7: G1.4, G3.1, G4.1, G5.6(f), G10.6(a), G11.6(b), G13.1; stays or moves, 7: G6.1, G6.2, G11.3, G11.4(e), G11.5, G11.6(c), G14.5(e); moves or changes, 1: G4.8(g) |
| all | 124 | |
| **new** | **10** | N1 to N7, as the assignment named them; N8 to N10, found by this session. Ten more carried from the first brief, standing. |

**Against the first brief** (55 stay, 24 change, 4 go, 26 move, 15 two ways): of its 55 that stay, 12 now change (G4.3, G4.7(c), G4.11(a), G4.11(c), G4.11(d), G4.11(f), G4.11(g), G5.1(c), G5.2, G5.6(a), G5.7(b), G12.3) and 3 are two ways (G1.4, G3.1, G13.1); of its 24 changes, G12.5 now stays and G4.1 is two ways (COUNTED, `compare.py`). G10.6 goes no longer (it changes); G10.6 (b) still goes; G4.8(f) and G5.5 still go. Four of its two-way rows are now settled one way by later entries (G4.6, G4.8(d), G4.11(i), G13.4 change); four rows are two ways that were not (G1.4, G3.1, G4.1, G13.1); G10.6(a) stays two ways, for a new reason (TRACED, the two tables).

## 7. What the sources leave unsaid that draft 26 would need

One line each, for the MOR lead. *Looked in* names the sources: L the ledger, CN the changes note, SN the settled note, D25 draft 25, E2 encoding 2, B1 the first brief, C the check, I the impact sheet, Id16 Identity draft 16. The weight is this session's (INFERRED): **heavy** where a verifier's answer turns on it.

**Where the ledger is silent**

1. **Heavy.** Whether a first version's coming into force still waits for the pin of 18 November ("In force once pinned"), or not (the 16:19 line and SN M19: "Unchanged"): G4.1, G4.10, G5.7(c). Looked in L, SN, B1, C (its unsaid 1), I (Q9).
2. Which Terms "when made" fix the known parties: the first version, or the version an update replaces; and whether a party a later version adds is known. Looked in L, CN, SN, B1 (its open 18), C (its unsaid 2).
3. Found: `authors` may name a role (G3.1, E2's E13), while the entry calls the author "a known party". Looked in L, D25, E2.
4. **Heavy.** Found: Identity draft 16 gives an act standing where "a named keeper recorded it" (rule 34, everyday check 2) and says "Keepers MUST (see Agreements)", reading Agreements draft 24's keeper (its rule 42); draft 26 defines the keeper "as that and nothing more", so what a keeper's record is, and which Agreements rule Identity then names, is unsaid. Looked in L, CN, SN, Id16, D25.
5. With several keepers named, whether the pin needs every keeper to show the order, or those that show it where none disagrees. Looked in L, CN, SN.
6. What the keeper still answers beyond order: G7.2's "what is whole, who holds what, whether a period has passed, or whether something was made public". Looked in L, D25.
7. How a fork that is not two updates of one line (a completing assent against a counter signature) is resolved in bytes, given that G12.3's `resolves` and `continues` name tips of a line. Looked in L, CN, SN, D25, E2.
8. Which acts are "competing to change the same state": a list or a test; and whether an agent's act against the end of its power (G5.4) is one (the first brief's open 15). Looked in L, B1, C.
9. The answer word inside a widened fork: "fork", or "not shown" as "What a race stops" (18 November) gives it; SN M5 gives "fork" for updates only. Looked in L, SN, I (Q5).
10. Whether a resolving update must itself be pinned (G12.3, G12.7). Looked in L, SN.
11. Found: how long a version binds a filling whose words state no term ("for as long as its words say" says nothing where they are silent). Looked in L, CN, SN.
12. What "the anchoring of the purchase" is: which act is anchored (the assent, the payment, the proof), on the clock the Terms name. Looked in L, CN, SN, D25.
13. What a verifier shows of an agreement the known parties dissolved "among themselves" while a filling's version still binds, against G4.9's "a verifier MUST NOT answer that Terms or an agreement have ended". Looked in L, B1 (its reading 5), D25.
14. Found: whether "renewed on the terms then current", allowed by SN M28 as bought knowingly, is a later version reaching her, against "no update of the known parties reaches her in any way" (27 November). Looked in L, SN.
15. Whether the introduction is part of the hashed text, against "a hashed text holds its rules and nothing else" ("Only rules in the hashed text", 17 November). Looked in L, CN, SN (Q22), C (M32).
16. Where the principle is written: the 16:05 line says the companion; his words are "It’s an agreements principle"; the introduction's entry does not list it; and whether it binds a verifier beyond the rules that apply it. Looked in L, CN, SN (F16), C (M31).
17. Whether N10's client reliance is written in Agreements, beside G12.8, or with the other client duties (the first brief's open 3). Looked in L, SN, B1.

**Where a note says more than the ledger**

18. SN M22 counts, as "an assent its holder signs in their own name", one made for her under a power she gave; the 26 November line says "in their own name" only (G10.6(a), two ways). Looked in L, SN.
19. SN M15 says "A filling is any filling of a role, whenever made"; his words are "she is unknown at the time of creation of the agreement" (who is unknown: by the role, or by the fact). Looked in L, SN, C (its unsaid 2), I (Q14).
20. SN M28 quotes, as his ("his:"), "a seller who wants changing deals saying so in version 2's own words… bought knowingly"; in the ledger that is the MOR lead's lean, to which he answered "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under". Looked in L, SN.
21. SN F4 has the client rely "on the words and on the other parties' assents"; the entry speaks of the words' Text act, and of "all acts someone has to rely on" in general. Looked in L, SN.
22. SN F10: where the words are private, "their key is delivered to each party first"; the ledger is silent. Looked in L, SN.
23. SN M21: the empty set "has the label and no members", and a set's value "is no knot of order by itself"; the ledger is silent on both. Looked in L, SN, I (Q20, Q21).
24. SN M5: "Rejected" is not an answer word; his word on 26 November was "Version 3 is the one the network needs to reject". Looked in L, SN, I (Q3).
25. SN M12 puts "two keepers' answers that contradict" under "unchecked", with "not shown, the keepers disagree" in brackets; the ledger's 17:49 line gives "not shown" for keepers that disagree, and draft 25's G7.2 gives "unchecked" for one place that contradicts itself. Looked in L, SN, D25.
26. SN M11: a verifier lacking a role's module "answers unchecked on fillings, not on updates"; the ledger says this of no module, by reading only. Looked in L, SN.
27. CN and SN cite as ledger entries headings the ledger does not have ("More than one place", "Place becomes keeper", "No stated anchor", "G10.6 comes back with (a) only", "One version in force; each filling carries its own", "A closed door"); each names a part of another entry. Looked in L by script (`headings.py`).

**Where an "Arrived at" line says more than his words**

28. **Heavy.** "Knots are knots": the one-line definition of "shown after" (a chain of namings, or a keeper's record or an anchoring; after, never before, never absence) is the MOR lead's; his last words are "Knots a cross acts by nature, and possibly cross layer. An agreement pointing to another agreement is a knot, the agreement pointing to the IDs is another, the agreement pointing to the envelope is another, the envelope to the IDs is others and so on…", after asking "are we defining how knots should be leveraged?", which the lead answered "both". Looked in L.
29. "For the unknown party there is no update": his words end "No?"; the line reads them as yes and spells out "her rights, her spot, her place in the agreement" and "close the offer, or dissolve it among themselves". Looked in L.
30. "Ana's month": the line adds "Terms state their anchors (a keeper, a clock to anchor to, or both)" and that 17 November "stands for the agreement's own versions"; his words are "valid update does not apply in the same way". Looked in L.
31. "The gate and the pin": the wording of G4.8 and G4.7 is the MOR lead's ("as the MOR lead's wording for draft 26"); his last words confirm the forced deadlock ("we forced the deadlock and push them to resolve it"), not the wording. Looked in L.
32. "A missing act stays unchecked": "only someone the update condition accepts can make it" and "a keeper prevents it in advance" are the lead's; his words are "I think yes. I don’t see the need to open a door around it. But feel a risk" and "No, I meant a risk of opening a door". Looked in L.
33. "Who signs an update by default" (marked "the MOR lead's reading"): his words, "It’s the protect the unknown party expressed the old way.", name no default signers; the known parties come from his earlier "only the known parties can" (15:52). Looked in L.

**Where a point of the settled note needs a new choice**

34. SN's two points sent back to him, with one thing found: (a) how Terms name their clock, which SN says the 17 November cut of G7 removed, while draft 25 still carries a `clock` field (G7.4, section 3.1; E2's E6), so the question may be whether that field stands against the cut, not whether to add one; (b) whether a cMIP's declared needs (a clock, a keeper) are written in Development or in each cMIP's text. Looked in L, SN, D25, E2.

**The entry written twice**

35. "A condition in time with no anchor is refused" (26 November, 18:00–18:30) stands twice; his words are the same in both (COUNTED, `twice.py`); the MOR lead's lines differ in six places, and none is used here: (i) the first withdraws the reader's own anchoring "for such conditions", the second says it "no longer answers for the Terms"; (ii) the first withdraws "not shown" for such conditions, the second does not say; (iii) the first says the tools "are built above the core", the second gives that as "the MOR lead's reading: tools built on top, by clients and cMIPs"; (iv) the first marks the client's refusal "(client conformance)" in its line, the second only in the proposal; (v) the second alone says the Terms are invalid "as an act missing what it needs"; (vi) the first's proposal alone has "a client warns before signing". Looked in L.

**The three heaviest** (this session's reading): item 1 (the pin for a first version: G4.1 and the counter signature turn on it); item 4 (the keeper's record Identity relies on, against a keeper that is a pointer only); item 28 ("shown after", on which every late update, the pin and a signer's line rest, is the MOR lead's line).

## 8. The record

**How the file was made.** This session read, whole: `CLAUDE.md`; the ledger's stint of 26 November (its entries of 26 and 27 November), the stint of 20 November, and the stint of 10 to 20 November from "The two gates" to "The unproven liar is for cMIPs", with every heading of the rest; the two notes of 27 November; draft 25's sections 2 to 4 (section 4 rule by rule, by script) and section 3's tables; encoding 2's E5, E8, E13 and E18; the first brief's "On one page", "What this file is", its sort, "What is new", "Decided, not yet worded", "Open", "The size" and the head of "His words against the lines"; the check's "In plain words", its list of conflicts, its sections 2 to 4; the impact sheet's table, totals and questions; `spec/README.md`'s LATEST list; Identity draft 16 where it names keepers and rule 34; Envelopes draft 12 where it says what relays do. Not read: the check's three parts, Fable 5.1's attack (pull request 264), the 12 and 13 November entries but for their headings and those the first brief used, draft 25's sections 1 and 5 to 10. Where a row rests on the first brief's sort for an entry of 17 or 18 November, it says so (as the first brief had it).

The sort was written as data (`sort.py`); the table in section 2, the counts in section 6 and the sizes in section 5 were generated from it, so they agree with each other.

**What was counted, by which script** (Python 3, run in this session's scratch space; the scripts are not in the repository, as the assignment touches one file only; the first is given here whole so the count can be run again):

- `rules.py`: splits draft 25's section 4 into rules and bytes, as the first brief did. Result: 72 numbered clauses, 52 lettered sub-clauses, 124 rules, 99 787 bytes, the first brief's figures.

```python
import re, sys, json
lines = open(sys.argv[1], encoding='utf-8').read().split('\n')
start = next(i for i,l in enumerate(lines) if l.startswith('## 4. Grammar rules'))
end = next(i for i,l in enumerate(lines) if i>start and l.startswith('## 5.'))
rules, cur_num = [], None
for l in lines[start:end]:
    b = l + '\n'
    m = re.match(r'^- (G\d+\.\d+)\b', l); ml = re.match(r'^\s+- \(([a-z])\)', l)
    if m: cur_num = m.group(1); rules.append([cur_num, b]); continue
    if ml and cur_num: rules.append([f"{cur_num}({ml.group(1)})", b]); continue
    if l.startswith('#') or l.strip().lstrip('*_').startswith(('Lie exposed','Protects')): continue
    if l.startswith(' ') and cur_num:
        next(r for r in reversed(rules) if r[0]==cur_num)[1] += b
print(len(rules), sum(len(t.encode()) for _,t in rules))
```

- `sort.py`: holds the 124 rows; checks that every rule of `rules.py` has one row and no row is extra; prints the counts by sort and the bytes of each sort, and of the two-way rules one of whose readings takes them out.
- `words.py`: counts the rules that carry a word, by their sort: "place" in 33 rules (6 that stay), "the anchoring the reader accepts" or "the anchoring it chooses" in 7, "everyone who signed" in 9, "delegat" in 6, "valid and in force" in 5, a named earlier draft in 7, "assent" in 31, and the verbs "store" or "mirror" in none.
- `twice.py`: compares the two copies of "A condition in time with no anchor is refused" word by word, and his quoted words in each (the same two sentences in both).
- `compare.py`: reads the first brief's counted table and sets each of its rows beside this sort.
- `headings.py`: lists the strings the two notes cite in quotation marks that are no heading of the ledger.
- `quotes.py`: checks that every quotation in this file of eight characters or more stands, character for character, in the ledger, draft 25, encoding 2, Identity draft 16, the two notes or the earlier records named; result: every quotation found (482 quotations, 0 not found, after four of this session's own phrases were set in italics instead).

**What the blind reader could not follow.** A subagent that had seen neither the ledger nor the assignment was given section 1 and five rows drawn at random by script (seed 20261127: G1.5, G4.11(b), G4.11(g), G10.3, G12.7) and asked, for each, *what happens to this rule, and what does that rest on?* It answered all five correctly. What it stumbled on, and what was done:
- "Filler", "resolving update" and "rival resolving updates" were not explained in the rows: glosses added to G10.3, G4.11(g) and G12.7.
- G4.11(g) looked like "moves", since a sentence goes to the companion: the row now says the rule stays and its default changes.
- G12.7 looked as if it should be two ways, the pin being unsaid for a resolving update: the row now says it stays as written and changes if the pin applies (item 10). It is left "stays", since no entry reaches it.
- Section 1 used words it did not explain ("unmerged", "the round", "the pin", "knot", "a role", "a condition in time"), mentioned only 26 and 27 November while rows rest on 17 and 18 November, and set "two ways" and *ten new rules* against a list of four sorts and six new things: section 1 was reworded for each.
- **Not fixed**: "fingerprint", "layer", "Text act", "keeper", "used bare" and "the MOR lead" are glossed only briefly or not at all, within the eight lines section 1 is allowed; the row *No entry reaches it* (said of rules no entry names) and *No entry changes it* (said of rules an entry touches without changing) differ on purpose, which the reader could not tell; and the five rows drawn were all INFERRED, so the test did not reach a TRACED row.

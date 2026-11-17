# What the review after wave 1 changes in verifier 2's answers

17 November 2026. Written by Claude, a session under the codemeister of MOR, for Nobody, allegedly, and the MOR lead. A record of work: it sets out questions. It decides nothing, and changes no text, code or vector.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." And: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite."

## What this sheet is

Verifier 2 is the program that reads signed Agreements acts (draft 25, in the bytes of encoding 2) and says who is bound by what. Its vectors are the test cases that pin each of its answers. On 17 November, Nobody, allegedly, and the MOR lead arrived at eleven decisions in the review after wave 1. Six of them (numbered 2, 3, 4, 6, 8 and 9 in the wave's common assignment) touch what a verifier answers. This sheet asks, for each of the six: which of verifier 2's answers would change, which test cases would go because their rule leaves Agreements, and which new cases the decision calls for. It then checks 27 open items that the research window marked as changing a verifier's answer by inference only.

It decides nothing. No code changes here, so what *would* change after a decision cannot be run: every such claim is **Read** (found in a file) or **Inferred** (the session's reasoning, with what would confirm it). What verifier 2 answers **today** is **Run**: `cargo test -p mor-core --locked --test agreements_new_grammar_vectors` passes `every_answer_is_the_verifiers_from_the_file_alone`, so every answer in `core/vectors/agreements-new/grammar.json` is verifier 2's today. Where a decision can be read two ways, the readings are set out as a question, with a lean labelled "the session's lean". Case numbers below are positions in `grammar.json`'s `cases` (from 0), followed by the case's name.

### What "checked twice" means today

As `verifier-2-readings-in-human.md` (branch `claude/verifier-2-readings-wurpvj`) states it:

- On the new Agreements vectors (`grammar.json`, 120 grammar cases), the independent Python check judges 115 of the 120 and agrees with verifier 2 on all 115. It cannot judge five (fillings, a filling's rights, the walk before paying, the delegation ended by its delegator, and the act made under it afterwards). The check was first written by an independent reader for verifier 1, without seeing the Rust code; verifier 2's own session then edited it for draft 25's changes, and those edits are not independent of the verifier.
- On the earlier vectors (`core/vectors/verdicts.json`), the Python check covers 113 of the 559 verdict cases.

Checked again here:
- **115 of 120: confirmed.** Run: `python3 core/vectors/agreements_new_grammar_check.py` prints "grammar.json: 115 of 120 cases judged again, and agree", and lists the same five as not judged. `grammar.json` holds 120 cases (Run, a Python count).
- **113: confirmed.** Run: in `verdicts.json`, 45 cases carry a `python` mark, plus 62 Development cases and 6 MIR-hash cases, which `check.py` judges whole (`core/vectors/check.py`, lines 847 to 867): 113.
- **559: not what the file holds today.** `core/vectors/README.md` (line 31) says 559 cases. Run: `verdicts.json` holds **618** cases today (agreements 269, development 62, envelopes 34, identity 102, MIR hashes 6, money 110, text 35). The README's count looks older than the file (Inferred: later commits, such as `fa28f02`, added vectors). So today it is 113 of 618, not 113 of 559. This sheet does not touch the README.
- Run: `python3 core/vectors/check.py` prints "all 569 vectors agree (391 verdict vectors judged here)".

### The summary

The six decisions together, under the session's leans (each lean is set out in Part 1, with its other readings):

| Decision | Vectors that would flip | Vectors that would go | New cases called for |
|---|---|---|---|
| 2. The two gates | none (plain words of 8 and 11 change, not their answer word) | none | 4 |
| 3. A way out by default | none; 34 under one reading | none | 6 |
| 4. Unclear means unchecked | 37 (not shown to unchecked); 36 under one reading | none | 4 |
| 6. Two threads, two owners | none; 38, 39, 40, 41, 43 under one reading | none; 45, 46, 47 under the same reading | 2 |
| 8. Where three rules live | none; 101, 102 under one reading | 15: the baker's 103, 105, 106, 109, 111, 112, 113; the report block's 78, 80, 81, 82, 83, 84, 85, 86 | 2 |
| 9. The place is a pointer | none | 1: 63 | 2 |
| **Together** | **1** (up to 10 more under other readings) | **16** (3 more under one reading of 6) | **20** |

The 27 items, in one line each (Part 2 has the grounds):

| Item | Changes an answer | Settled by a decision today |
|---|---|---|
| OI-009 | yes | no (4 reaches its second half) |
| OI-011 | yes | no |
| OI-015 | yes | no |
| OI-016 | yes | in part (2) |
| OI-017 | yes | no |
| OI-018 | no | no |
| OI-021 | yes | no |
| OI-022 | yes | no |
| OI-023 | cannot tell | yes (9) |
| OI-026 | no | no |
| OI-035 | yes | in part (9) |
| OI-036 | yes | no |
| OI-046 | yes | no |
| OI-050 | yes | no |
| OI-051 | yes | no |
| OI-067 | yes | no |
| OI-068 | yes | no |
| OI-069 | yes | no |
| OI-070 | yes | no |
| OI-095 | yes | no |
| OI-118 | yes | no |
| OI-123 | yes | no |
| OI-147 | yes | yes (8) |
| OI-148 | yes | no (reopened by 1) |
| OI-151 | yes | no (reopened by 1) |
| OI-152 | yes | no |
| OI-165 | yes | in part (6) |

Totals: 24 yes, 2 no, 1 cannot tell. Settled wholly by a decision: 2 (OI-023, OI-147). Settled in part: 3 (OI-016, OI-035, OI-165).

---

## Part 1. What decisions 2, 3, 4, 6, 8 and 9 change in verifier 2's answers

A few words used throughout. **Terms** are the act that says what is agreed; a **version** is one Terms act; an **update** replaces a version, called the **original**. An **assent** is a signature agreeing to Terms; a **counter signature** withdraws one before the Terms are in force. A **fork** is two rival updates of the same act. The **update condition** is the rule Terms name for how they may be updated; with none named, the default asks "everyone who signed the original". **Dana** is always a third person who holds the acts and asks a verifier.

### Decision 2. The two gates

**In plain words.** Today an update has to pass two checks to replace the old Terms: the old Terms' update condition must say yes, and the new Terms must also be "in force" by their own rule about whose signatures they need. The decision keeps only the first check for replacing. Verifier 2 still applies both. No vector today has an update that passes the first check and fails the second, so no answer in the vectors flips; the change shows only on bytes no vector holds yet.

1. **His words**, from the ledger: "Case against c? And for it?" then "A, agreed". The MOR lead's option (a) was "the update condition alone decides".
   **Arrived at (to check):** "(a). Where the update condition answers valid, the update replaces the version it names. The new version's own `in_force` governs only its own later life, not whether it replaces the old one."
   Where it says more than his words: "governs only its own later life" is the MOR lead's wording. His "A, agreed" takes option (a) and says nothing of what the new version's `in_force` still governs. That is the question in point 5.

2. **A story.** Terms O name Ana, Ben and Carla, with an update condition under which any two of the original's signers are enough. Ana and Ben sign an update U. U's own `in_force` rule asks for all three, and Carla has not signed U.
   - Today Dana is shown: U is **not shown** as a replacement ("valid, and not in force by its own `in_force`"), and O stays in force.
   - Under the decision Dana would be shown: U is **valid** and replaces O. What Dana is then shown as in force depends on point 5.

3. **Cases and vectors.**
   - Flip: none. Run: no answer in `grammar.json` carries the words "not in force by its own"; every valid update in the vectors is also in force by its own `in_force`. Inferred: a vector would flip only where an update is valid and fails its own `in_force`.
   - Plain words that would change, not the answer word: 8, "an update by the default: everyone who signed the original signs it: valid, by default", and 11, "an update by an update condition (a stub: one of the original's signers): valid, the condition named". Both say "valid ... and it is in force by its own `in_force` (G4.8)" (Run). Case 58, "a delegation ended by the delegator alone: ...", already replaces without the new version's `in_force` (G5.5), and its words say the same thing, though there they are not accurate (Read: `force.rs`, `then_in_force`, line 603, returns yes for a delegation without reading `in_force`).
   - Go: none.
   - The code: `force.rs`, `then_in_force` (lines 602 to 611), called from `update_raw` (lines 560, 576, 581); `chain.rs`, `is_update` (lines 170 to 175), `first_position` (lines 194 to 215, "valid and in force"), `late_against` (from line 232, "enough acts for F to be valid and in force"), and `update_answer` (line 737, the plain words); `baker.rs`, `bound_raw` (line 153), where an update binds the holder of the baker's rights. Read.
   - The rules in draft 25 that ask for both checks, Read: G4.8 ("Whether the replacing Terms are themselves in force is G4.1's, as draft 18 has it (G4.5; section 8.4)."); G4.5 ("Terms stop being in force when Terms that replace them (G5.2, G4.8) are in force."); G4.7 (a fork is two Terms acts where each "has the assents its own `in_force` requires (G4.1)"); G4.7(a), G5.4 and G13.3 ("valid and in force").

4. **New cases** no vector covers:
   - (2a) An update the condition answers valid that is not in force by its own `in_force`: does it replace, and what is in force after it?
   - (2b) Two such updates of one version: a fork, or none? Today neither is an update, so there is no fork (G4.7).
   - (2c) A late update (G4.7(a)) where the act that came first, F, is valid and not in force by its own `in_force`: is L late?
   - (2d) An act made under a power between the moment the replacing Terms are valid and the moment they are in force by their own rule (G5.4): bound or not?

5. **Where it can be read two ways.** The words: "The new version's own `in_force` governs only its own later life, not whether it replaces the old one." His: "A, agreed".
   - (i) The update replaces the original at once and is itself in force from then on; its own `in_force` is not read for it as an update. Its "own later life" would then be what its `in_force` says to someone reading it later, with no effect on what is in force.
   - (ii) The update replaces the original at once, and is in force only once its own `in_force` is met. Between the two, no Terms of the agreement are in force.
   - (iii) The original stays in force until the update is in force by its own rule. That is option (b), both gates, which he did not take.
   - Does a verifier's answer change? Yes. On story 2, under (i) Dana is shown U in force; under (ii), no Terms in force, which sits badly with G4.9 ("No act ends Terms, or an agreement, without replacing them, and a verifier MUST NOT answer that Terms or an agreement have ended."); G4.5 also has to be read again under either.
   - **The session's lean:** (i), because (ii) leaves an agreement with no Terms in force while nothing ended it. A question for Nobody, allegedly, and the MOR lead.

### Decision 3. A way out by default

**In plain words.** Today, once Terms are in force, a signer can never leave them on their own: a counter signature made afterwards changes nothing. The decision gives every signer a way out by default, which only Terms that say so can switch off. Draft 25 has no act for leaving, so no vector holds one and no answer flips today. What the leaving act looks like in bytes is not decided, and that decides which vectors would change.

1. **His words:** "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out"
   **Arrived at (to check):** "(c). By default, a signer can leave Terms in force. Only Terms that say so can keep someone in, and those Terms have their own way out."
   Where it differs from his words:
   - His "agreements have their own way out" is read in the line as "those Terms have their own way out", that is, the Terms that switch the exit off. His words can also be read as: an agreement already has a way out of its own (its update condition), so no field is needed to switch the default off.
   - The MOR lead's option (c), to which he said "Agreed", came "with leaving never erasing what is owed, the record showing who left, and a contest still possible", and "said plainly before anyone signs". The arrived-at line keeps none of these. It says less than the exchange here, not more.
   - The line says "a signer". The MOR lead's setting-out also named "a receiver cannot resign". Whether a receiver can leave by default is not in the line.

2. **A story.** Terms T name Ana, Ben and Carla, and are in force. Carla wants out.
   - Today Dana is shown: Carla is bound by T, and a counter signature Carla signs now "changes nothing" (G4.10).
   - Under the decision Dana would be shown: Carla left T by default, from the act that says so on; Ana and Ben stay bound; T stays in force; the record shows that Carla left. Where T say that no one may leave, Carla's act changes nothing.

3. **Cases and vectors.**
   - Flip: none under the session's lean (a new act for leaving). Under the reading where leaving is a counter signature made after the Terms are in force: 34, "a counter signature that names every assent the Terms need came after them: it changes nothing", would no longer say "changes nothing" (Inferred). Case 35, "a counter signature made after the Terms came into force: they stay in force", keeps its answer under every reading: Terms stay in force for the others (Inferred).
   - Go: none.
   - The code: `force.rs`, `counter_cancels` (lines 400 to 438: "it came after the Terms came into force ... and changes nothing"); `order.rs`, `bound` (from line 221, G5.1) and `in_force` (lines 52 to 104, G4.9). Read.

4. **New cases:**
   - (3a) A signer leaves Terms in force, by default: from then on, is the signer bound? Is it shown who left?
   - (3b) Terms that switch the default exit off: a leaving act changes nothing.
   - (3c) After Carla leaves, the default update condition: is Carla still among "everyone who signed the original" (G4.8(a))? This changes who must sign every later update.
   - (3d) A receiver who leaves: who receives (G1.4)?
   - (3e) An act made for Carla under a power after Carla left: bound or not (as G5.4 reads acts after a replacement)?
   - (3f) Every party leaves: G4.9 forbids answering that the Terms "have ended". What is answered?

5. **Where it can be read two ways.**
   - **The act, in bytes.** (i) A new Statement kind for leaving; (ii) a counter signature, now also read after the Terms are in force; (iii) an update that the leaver signs alone, made valid by a default update condition. A verifier's answer changes with each: under (ii), 34 changes; under (iii), the leaver's act is a new version of the Terms, which changes the Terms for everyone. **The session's lean:** (i), because G4.10 keeps a counter signature for "before the Terms are in force", and (iii) would let one signer change the Terms for all.
   - **How Terms switch it off.** His words: "Only an agreement can keep you into something". (i) A field in Terms; (ii) the words of the Terms, read through their body's cMIP; (iii) the update condition. The bytes change under (i), and a verifier needs a cMIP it may lack under (ii), where the answer would be unchecked. **The session's lean:** none; it depends on the act above.

### Decision 4. Unclear means unchecked

**In plain words.** Sometimes a verifier cannot tell whether someone's signature still counts: their withdrawal has no visible order (A6), or their signature is held but cannot be read (A9). Today verifier 2 then simply leaves that person out, so an update can bind them without their signature. The decision says: where it is unclear, every answer that rests on it is "unchecked". No vector today holds an update resting on such a signature, so the A6 and A9 stories themselves flip in no vector. One existing case would flip under the wider reading of the decision: Terms whose coming into force rests on such a withdrawal.

1. **His words:** "Agreed" (to the MOR lead's option (b): "unclear means unchecked, so the update is not shown as replacing the old Terms until Carla's position is clear").
   **Arrived at (to check):** "(b). Where it is unclear whether someone's assent counts, every answer that depends on it is unchecked; an update is not shown as replacing the old Terms until that person's position is clear."
   Where it says more than his words: the option he agreed to was framed around one answer, the update. The line's first sentence reaches "every answer that depends on it". The two may differ on case 37 (point 5).

2. **A story** (A6). Terms O name Ana, Ben and Carla; their `in_force` rule asks for any two of the three; there is no place and no update condition. All three assent. Carla then signs a counter signature naming only Carla's own assent; nothing shows whether it came before or after O came into force. Ana and Ben then sign an update U taking Carla's share.
   - Today Dana is shown: O in force (Ana and Ben are enough), and U **valid by default**, signed by everyone who surely signed O. Carla is bound by U without signing it.
   - Under the decision Dana would be shown: U **unchecked** (or "not shown as replacing", point 5) until Carla's position is clear.
   - A note on the story the decision was made on. In `verifier-2-readings-in-human.md`, section 2, O has no `in_force` rule, so O needs all three assents. Then verifier 2 does not show O in force at all: with Carla's assent counted, O is in force; without it, O is not; so O is "not shown" (Read: `force.rs`, `in_force_raw`, lines 302 to 330; as case 37 shows). And asked about U, verifier 2 then answers **not shown** ("the original ... is not a version that counted": Read, `order.rs`, `update`, lines 129 to 145), not valid. Carla is exposed as that sheet says only where O's own rule does not need Carla's assent, as in the story above (Inferred; a case would confirm).

   **A story** (A9). Terms T name Ana and Ben; their `in_force` rule asks for Ana's assent alone. Ana assents. Ben assents by a private act; Dana holds it without its key. Ana alone signs an update U taking Ben's share.
   - Today Dana is shown: U **valid by default** (Ben's unreadable act is not counted, so "everyone who signed" is Ana).
   - Under the decision: U **unchecked** until Ben's act can be read.

3. **Cases and vectors.**
   - Flip, under the session's lean (the line's first sentence): 37, "with the counter signature's order not shown, in force is not shown": **not shown** to **unchecked** (Read: `force.rs`, `in_force_raw`, lines 317 to 326, answers not shown where only a counter signature's order is unclear; G4.10 says "Otherwise whether those Terms are in force is **not shown**, and the verifier says why.").
   - Flip, under a wider reading still: 36, "a counter signature and a completing assent, neither naming the other: whether the Terms are in force is not shown", asked about the counter signature itself, **not shown** to **unchecked** (Inferred).
   - No vector holds an update resting on an unclear assent: the counter-signature cases (32 to 37) ask no question about an update (Run: a scan of each case's question), and no grammar case holds an act that cannot be read (Read: no such act in `grammar/cases.rs` or `grammar/scenario.rs`).
   - Go: none.
   - The code: `force.rs`, `counted` (lines 218 to 267, sorting assents into sure, maybe and doubt); `signed_by` (lines 473 to 521, which counts only the sure ones: a "maybe" is dropped, a "doubt" makes it unchecked); `update_raw` (lines 547 to 597); `in_force_raw` (lines 302 to 330). An act that cannot be read is put aside when the acts are read (`held.rs`, `from_bytes`, lines 60 to 61) and never reaches `counted`. Read.

4. **New cases:**
   - (4a) Story A6 above, with an `in_force` rule that does not need Carla.
   - (4b) Story A9 above, a private assent held without its key.
   - (4c) The same with an act under a signature scheme the verifier does not implement.
   - (4d) The holder of the baker's rights whose assent is a "maybe": `baker.rs`, `bound_raw` (line 162), answers not shown today; under the decision, unchecked. (Also counted under decision 8, and it bears on OI-151.)

5. **Where it can be read two ways.**
   - **The word.** The line says "unchecked", then "not shown as replacing". (i) **unchecked**, as G9 gives it; (ii) **not shown**. The word Dana sees changes. **The session's lean:** unchecked, since the decision's name is "unclear means unchecked".
   - **How far.** (i) Only who must sign an update (the option as framed); (ii) every answer resting on the unclear assent, so case 37 flips. **The session's lean:** (ii), as the line's first sentence says; it is to check with him, since his "Agreed" answered the option as framed.
   - **Which unreadable acts are unclear** (A9). A private act's outside names its signer but not what it is or which agreement it is in. (i) Every unreadable act by someone whose signature an answer needs; (ii) only one that another act ties to this agreement (as G6.1 does for `previous`). Under (i), one private act by Ben anywhere makes every update Ben must sign unchecked. **The session's lean:** none; it is a real question.

### Decision 6. Two threads, two owners

**In plain words.** Every act sits on lines that show what came before it. The decision says the signer's line belongs to the layer below Agreements, and Agreements only reads it; the agreement's own thread (each version naming the one it replaces) stays in Agreements; and a change of key continues the signer's line. Verifier 2 already treats a key change as continuing the line, since it never reads keys. But draft 25 and encoding 2 write three lines, not two, and which of them is "the signer's line" decides whether ten vectors are touched.

1. **His words:** "It does" (to the MOR lead's lean: keep both threads; the signer's line belongs to the layer below; the agreement's thread to Agreements; a key change continues the signer's line).
   **Arrived at (to check):** "both threads stay. The signer's line is the lower layer's (Identity and the act format); the agreement's thread is Agreements'. A key change continues the signer's line; it never starts a fresh one."
   Where it says more than his words: "(Identity and the act format)" names the layer; the exchange said "the layer below, where acts and keys live". Close, and not quite the same.

2. **A story.** Ana signs acts in two agreements, X and Y, and changes her key between two of them.
   - Today Dana is shown: Ana's line in X goes on across the key change (verifier 2 keys lines on Ana's identity, never on her key).
   - Under the decision, the same. What could change is in point 5: whether a fork in Ana's line is read from the payload's `previous` (her acts in X alone) or from the act format's `prev` (all her acts).

3. **Cases and vectors.**
   - Flip: none under the session's lean. Under reading (i) of point 5, with forks read from `prev`: 38, "a fork in a signer's line: two acts that name the same previous act" (fork to no fork), 39, "both tips of a signer's fork stop: neither assent counts, and the Terms are not in force" (not shown to shown), 40, "an assent that is a tip of a signer's fork: not shown, it does not count" (not shown to shown), 41 and 43, the two resolutions (a resolve with no fork to resolve). Inferred, because in every case each act "stands in its signer's real sequence" (`verifier-2-report.md`, section 1), so the two tips of case 38 follow one another in `prev`.
   - Go under the same reading: 45, 46 and 47 (G6.1 on `previous`), and with them encoding 2's E17 and E23 vectors (`valid.json` 22 to 24, 37 to 42; `invalid.json` 18 to 20, 85, 112 to 115). Inferred.
   - Key change: verifier 2's signer is the identity hash on the act's outside (Read: `check.rs`, line 137); its lines are grouped by signer, agreement and `previous` (Read: `line.rs`, `read_lines`, from line 67). It already matches "a key change continues the signer's line" (Inferred; no vector has two keys for one identity).

4. **New cases:**
   - (6a) One identity signs acts in one agreement with two keys, before and after a key change: one line, no fork.
   - (6b) Under reading (i): a fork in `prev` across two agreements, with each agreement's `previous` straight.

5. **Where it can be read two ways.** Encoding 2, section 2: "The payload's `previous` (E17) is another line: the signer's acts within one agreement. Both are written." The MOR lead's setting-out: "the signer's line (every act a person signs, across their life)". Draft 25, G6.1, uses "the signer's line" for the line by `previous` within one agreement.
   - (i) G6's line by `previous` is "the signer's line", and moves to the layer below; Agreements reads forks from there.
   - (ii) "The signer's line" is the act format's sequence by `prev`, which is already the layer below's; G6's line within one agreement stays in Agreements.
   - (iii) G6's line is part of "the agreement's thread".
   - Does an answer change? Under (i), yes (the cases above). Under (ii) and (iii), no.
   - **The session's lean:** (ii), since the MOR lead's own words were "across their life" and encoding 2 calls `previous` "another line". The exchange spoke of two threads where the bytes carry three: that is the question.

### Decision 8. Where three rules live

**In plain words.** Two families of rules leave Agreements: the baker's rights (who holds them, sales of them, Terms made too late after a sale) go to Envelopes, and the rules for reading reports (matched, mismatched, one side only, unanswered) go to the shared language, the MICS. Their test cases would go from Agreements' vectors with them. No answer flips if the rules move unchanged. One phrase in the exchange, "current holder", would flip two answers if it were taken as the rule.

1. **His words:** "Agreed for the first, not sure I get the second, expand on third too", then "Remind me where the report was born, what layer?", then "Agreed".
   **Arrived at (to check):** "the baker's rule moves into Envelopes; the report block's home is the MICS, and the rules for reading reports (matched, mismatched, one side only, both amounts shown, unanswered) go with it; Agreements keeps what people sign: the receiver, the call in Terms, the buyer's leg, the contest and the consent to data beyond one leg. The place: explained, not yet confirmed."
   Where it differs from his words: the MOR lead's framing said "the baker into Envelopes, Agreements asking only whether the current holder is a party". Draft 25 reads the holder **at the act the Terms cite**, not the current one: G14.2, "Draft 23 read the current holder, as the chain stands now; that reading is gone." The arrived-at line does not repeat "current". His "Agreed for the first" answered a framing that contained it.

2. **A story.** Ana bakes a work and makes Terms T with Carla, citing the bake. Ana later sells the baker's rights to Ben.
   - Today Dana is shown: T keep counting after the sale (G14.2, "After a sale").
   - Under the decision, if the rule moves unchanged: the same answer, with the holder read from Envelopes. Under "the current holder is a party": T no longer count, since Ben, the holder now, is not a party.
   - And for reports: Ana pays Ben through a service; the service reports the payout, Ben confirms. Today and under the decision Dana is shown **matched**; under the decision that word comes from the MICS's rules, not Agreements'.

3. **Cases and vectors.**
   - Flip: none if the baker's rule moves as draft 25 writes it. Under "current holder": 101, "after a sale, Terms made with the holder of the moment keep counting" (shown to invalid or not shown), and 102, "after a sale, Terms with the holder of the moment stay in force" (shown to not shown). Inferred.
   - Go, the baker's (the session's lean of where the line falls: what reads the envelope's chain goes; what asks whether the holder is a party stays): 103, "the buyer of the rights holds them from the transfer on: Terms citing it need that holder"; 105, "late Terms, shown by knots: they name a transfer that follows the act they cite: they count for nothing"; 106, "late Terms are not in force"; 109, "`envelope_at` names an act, held, that is not an act of the envelope's chain: invalid"; 111, "a double sale: the act cited lies in a fork of the envelope's chain for which that layer gives no holder: not shown"; 112, "the same work baked again: shown beside the answer, with each other envelope and the baker it states, as shown"; 113, "the same bytes baked by another: Terms that name that envelope and its baker, citing its bake, meet G14.2". Seven.
   - Stay, with the holder taken from Envelopes: 99, 100, 101, 102, 104, 107, 108, 110.
   - Go, the report block's: 78, "one leg's call, its two halves matched"; 80, "one leg's call, its two halves mismatched: both shown, neither chosen"; 81, "one leg's call, the doer's half only: one side only"; 82, "a confirmation by a party named as a signer, of which no doer's report speaks: one side only"; 83, "a call that expects one side only: each report shown as stated, no tie answered"; 84, "a call with no report, read by a side of that leg: unanswered"; 85, "a call with no report, read on behalf of no one: that leg's reports are not shown"; 86, "Terms that hold the Control task and carry no call: no report called for". Eight.
   - Stay, as what Agreements keeps: 79, 87, 88 (who holds the Control task); 89, 90, 98 (data); 91 (before paying); 92, 93, 94 (the buyer's leg); 95, 96, 97 (the contest); 115 (a call left unread).
   - Bytes, not answers: every report is written today under the spec hash of the report block's fourth proposal (`core/vectors/agreements-new/README.md`). With the block in the MICS, every report act would be written again under the MICS's spec hash: `valid.json` 34 to 36, `invalid.json` 8 and 103 to 111, and the reports in `grammar.json`. Their answers would not change (Inferred).
   - The code: `baker.rs` (`baker`, `baker_inner`, `bound_raw`, `late_terms`); `chain.rs`, `baker_gate` (lines 177 to 189); `layers.rs`, the envelope chain's stand-in (from line 124); `legs.rs`, `leg` (line 97) and `silence` (line 182) for the report block's. Read.

4. **New cases:**
   - (8a) The seam with Envelopes: Envelopes gives the holder at the act cited; Agreements asks only whether that holder is a party bound by the Terms (one case for each answer Envelopes can give: a holder, none, no answer).
   - (8b) The seam with the MICS: the buyer's leg, where Agreements gives the doer and the receiving side and the MICS gives matched, mismatched or one side only.

5. **Where it can be read two ways.**
   - **Which holder.** The framing's "the current holder", against draft 25's holder at the act cited. Cases 101 and 102 flip under the first. **The session's lean:** the holder at the act cited, since draft 25 says the other "is gone" and his "Agreed" did not speak of it.
   - **Where the line falls.** Lateness against a later sale (105, 106) is an answer about Terms, but it reads the envelope's chain. (i) It goes with the chain; (ii) it stays in Agreements, asking Envelopes only for the order. No answer changes either way if the rule moves unchanged (Inferred).
   - **The buyer's leg.** The line keeps "the buyer's leg" in Agreements, and sends "matched, mismatched, one side only" to the MICS. Cases 92 to 94 test both at once. The session counts them as staying.

### Decision 9. The place is a pointer

**In plain words.** A "place" is a public register the signers can name in their Terms, which puts acts in order. The decision makes it a field with one rule: where Terms name a place, every reader takes what is latest from it and from nothing else. The rest of the rules about places (a place that contradicts itself, the clock, how a relay orders) leave the grammar. One case goes. No answer flips in the vectors, but verifier 2 today reads the place only for acts it already holds, and the one rule may ask more of it (OI-035, Part 2).

1. **His words:** "What the « place »?", "So, it's a keeper of sorts?", "It's just a pointer to a relay then. Why the need for more grammar?", then "Yes, agreed. My point was: this is simpler than what we are discussing.agreed"
   **Arrived at (to check):** "the place is a pointer to a relay, a field in Terms, with one rule: where the Terms name a place, every reader takes what is latest from it and from nothing else. The rest of G7 leaves the grammar. The MOR lead's keeper lean is withdrawn."
   Where it says more than his words: the one rule is the MOR lead's sentence, which he agreed to as part of the lean; his own words ask for less grammar, not for that sentence. "The rest of G7" is in the MOR lead's lean ("a place contradicting itself, which answers count per place, the clock, how a relay orders").

2. **A story.** Terms T name a place P. Ana and Ben assent; P shows Ana's assent but not Ben's.
   - Today Dana is shown: T not in force, per place (case 61). Under the decision: the same.
   - If Dana holds two answers of P that contradict each other: today, **unchecked** under G7.2 (case 63). Under the decision, G7.2's sentence leaves; G9.1 ("cannot get an answer from a named place") would most likely still give unchecked (Inferred).

3. **Cases and vectors.**
   - Flip: none (Inferred).
   - Go: 63, "two answers of one place that contradict each other: no answer from that place, unchecked" (its rule, G7.2's last sentence, leaves).
   - Stay: 60, "in force per the place the Terms name", and 61 (the one rule); 62 (G9.1); 65, "a late rival shown by the place the original names: replaces nothing, per place". Case 64, "no place named: in force per the anchoring the reader accepts, with it named", tests G7.3, which leaves with the rest of G7; its answer already names G4.6, and G13.4 keeps the reader's anchoring, so the session counts it as staying under another rule.
   - The clock: no case in `grammar.json` names a clock (Run: every case's `clocks` is empty). `valid.json` 1, "terms: every optional field of section 3.1 at once ...", carries a clock (Read: `core/examples/support/agreements_new.rs`, line 385). If the `clock` field leaves Terms, that act's bytes are written again, and the key (9) would no longer be one encoding 2 gives (Inferred).
   - The code: `mod.rs`, `counts` (lines 210 to 237: positions, and a place that contradicts itself); `layers.rs`, `Place` (lines 34 to 44: one question, the position of an act held); `chain.rs`, `first_position` (lines 194 to 215), `first_time` (lines 220 to 226) and lateness per clock (from line 282). Read.

4. **New cases:**
   - (9a) Two versions that name different places: which place is read (G4.6 "Which place", G4.8(d))? No vector has two places (Run).
   - (9b) An act the place shows that the verifier is not handed (OI-035).

5. **Where it can be read two ways.**
   - **"Where the Terms name a place": which Terms?** (i) The Terms in force; (ii) for an update, the original's, as G4.8(d) says today; (iii) before any Terms are in force, the first Terms act's (G4.6). The one rule names none of these. Answers change where versions name different places. **The session's lean:** keep G4.6 and G4.8(d) as they are, since they live in G4, not G7; a question nonetheless, since the decision says the rest is not grammar.
   - **From it and from nothing else.** (i) The verifier asks the place what is latest; (ii) it reads the place's positions for the acts it is handed, as today. Under (i), verifier 2 would change (OI-035). **The session's lean:** (i), since "takes what is latest from it" reads as asking.
   - **The clock.** (i) The `clock` field leaves Terms with the rest of G7; (ii) only the clock's rules leave, and the field stays for cMIPs. The bytes change under (i). **The session's lean:** none.

### The count, for the six together

- **Vectors that would flip, under the session's leans: 1** (37, decision 4). Under other readings, up to 10 more: 36 (4), 34 (3), 38, 39, 40, 41, 43 (6), 101, 102 (8).
- **Vectors that would go: 16** (`grammar.json`): 15 under decision 8 (7 the baker's, 8 the report block's), 1 under decision 9 (63). Under reading (i) of decision 6, 45, 46 and 47 too, with encoding 2's `previous` vectors. Re-written as bytes, not gone: the report acts (8) and `valid.json` 1 (9, if the clock field leaves).
- **New cases: 20**: 4 (decision 2), 6 (3), 4 (4), 2 (6), 2 (8), 2 (9).
- **Counted under two decisions:** (4d), the holder's unclear assent, is under 4 and touches 8's `bound_raw`; (2a) also changes `bound_raw` (`baker.rs`, line 153), which decision 8 keeps in Agreements; (9b) is OI-035 in Part 2; (3c) and (4a) both ask who "everyone who signed the original" is. No vector is counted twice.

---

## Part 2. The 27 items inferred to change a verifier's answer

Counted first. Run: a script over `docs/research/open-items-2026-11.md` (branch `claude/research-open-items-3t05ih`) lists the items whose "Changes a verifier's answer" starts with "yes" and does not cite `verifier-2-report.md`. It finds exactly these 27: OI-009, OI-011, OI-015, OI-016, OI-017, OI-018, OI-021, OI-022, OI-023, OI-026, OI-035, OI-036, OI-046, OI-050, OI-051, OI-067, OI-068, OI-069, OI-070, OI-095, OI-118, OI-123, OI-147, OI-148, OI-151, OI-152, OI-165. None other.

Three helpers read batches of nine with the same files; every claim below was checked against the code by this session before it entered the sheet.

**On "section 9, item 15".** Five items (OI-015, OI-016, OI-050, OI-051, OI-152) cite draft 25, section 9, item 15, "its tests answer otherwise". Read: those are "the second C session's" tests, built from draft 19, not verifier 2's. That item shows that two readings were once built; it does not show that verifier 2 differs from draft 25. Each item below has its own ground.

**OI-009. "Whether "until every party has signed" means "until the Terms are in force" where an `in_force` rule asks for fewer signatures than everyone's."**
- **Changes an answer: yes.** It is two questions. (1) Terms name Ana, Ben and Carla, with `in_force` asking any two. Ana and Ben assent; then Ana signs a counter signature. Verifier 2: it changes nothing, the Terms stay in force (`force.rs`, `counter_cancels`, lines 429 to 432). Under "every party": it cancels. (2) Where an assent names the counter signature but the Terms could have been in force without it, verifier 2 answers not shown (line 437). No case puts a counter signature under an `in_force` cMIP.
- **Settled:** no. Decision 4 reaches its second half: case 37 would answer unchecked (Part 1). Decision 3 lowers the stakes, since one could leave later, but leaving is not cancelling.
- **Ground:** Read; the acts are Inferred (a case with an `in_force` stub asking two would confirm).

**OI-011. "Whether the default for `in_force` (every party named as a signer) is the default wanted."**
- **Changes an answer: yes.** Case 0, "in force by the default: an assent of one of two signers is not enough", answers not shown; under a default asking fewer, shown (`force.rs`, `in_force_given`, lines 281 to 296).
- **Settled:** no. Decision 2 narrows its reach: the default no longer decides whether an update replaces. Partly the same question as OI-068.
- **Ground:** Run (case 0), Read.

**OI-015. "How a `previous` that names no act is read (the text and the second C session's tests differ)."**
- **Changes an answer: yes.** The source (`history.md`, draft 20's list) is about a `previous` that names a record held that is no Terms act and no Statement. Verifier 2 makes such an act **invalid** (`check.rs`, lines 254 to 271), as G6.1 says; the other reading counts it and leaves the line unchecked. Example: Ben's assent whose `previous` names Ana's report; Terms needing Ben are not in force under the first, in force under the second. Vectors: `invalid.json` 114, "held: previous names a report", and 115, "held: previous names a held act that is rejected, no Terms act and no Statement" (both invalid, G6.1). Where `previous` names nothing held, both readings agree (case 45).
- **Settled:** no. Decision 6 may move where the rule lives (Part 1, reading (i)); it does not choose invalid or unchecked.
- **Ground:** Read.

**OI-016. "At which position, or by which citing, replacing Terms "came into force"."**
- **Changes an answer: yes.** Three readings now: verifier 2's "valid and in force" (`chain.rs`, `first_position`, lines 194 to 215; `force.rs`, `before_in_force`, lines 182 to 212); the C session's reading (the later of the act and each named signer's first assent); and "valid" alone. They differ where a replacing version's own `in_force` comes later than its validity, for an act made under a power in between (G5.4). Cases 59 and 65 use the defaults, where all agree.
- **Settled: in part**, by decision 2 ("A, agreed"): the position becomes the first at which the update is valid. Verifier 2 would change (`then_in_force`). The C session's reading is not settled.
- **Ground:** Read; the example is Inferred (a per-place case with a non-default `in_force` would confirm).

**OI-017. "A replacement that lacks a signature is answered "not shown"; the word of Nobody, allegedly, for that case was "invalid"."**
- **Changes an answer: yes**, the word on the same bytes. Case 7, "an update by the default, lacking one of those who signed the original: not shown, never not valid", answers not shown (`force.rs`, lines 590 to 596; `chain.rs`, line 740). Under his word, invalid, which section 2 makes final: a missing assent shown later could no longer make the act an update.
- **Settled:** no.
- **Ground:** Run (case 7), Read.

**OI-018. "Whether "not valid" (a cMIP's answer about an update) and "invalid" (this text's answer about an act) should be one word."**
- **Changes an answer: no.** Only the label changes; no act counts differently under either. Verifier 2 keeps them apart (`answer.rs`; `chain.rs`, line 738); case 13, "an update condition that answers not valid: not valid, whoever signed it". If they were one word, the `word` of every not-valid case would change; what the act does would not.
- **Settled:** no.
- **Ground:** Read.

**OI-021. "Which update condition is asked about a filling's rights where several versions lie between."**
- **Changes an answer: yes**, shown by an existing case. Case 74, "a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid": the filling was earned under a version that names no condition; a later version v2 names one that answers valid, and v3 changes the spot. Verifier 2 asks only the condition of the version the filling was earned under (`spots.rs`, `rights`, lines 99 to 133), and answers shown, "no later version changes them" (Run). Under a reading where each version's own condition is asked, step by step, v2's condition is asked of v3, and an answer that v3 changes them is added. The top word stays shown. The case's name says more than its answer does.
- **Settled:** no.
- **Ground:** Run (case 74's answers), Read.

**OI-022. "That the update condition is asked of a resolving update is Claude's reading."**
- **Changes an answer: yes**, where the shared Terms name a condition. Verifier 2 asks it (`chain.rs`, `resolves`, line 718). Example: Terms name Ana, Ben and Carla, condition "one of the original's signers"; Ana and Ben each make an update, a fork; Carla alone signs the resolving update. Verifier 2: resolved. Draft 18's reading (all three must sign): not resolved, the fork stands. The fork cases name no condition, so both readings agree on them.
- **Settled:** no. Decision 2 says the update condition alone decides replacement; it does not say a resolving update is asked it.
- **Ground:** Read; the example is Inferred.

**OI-023. "Where two versions of one agreement name different clocks, which one the update condition reads."**
- **Changes an answer: cannot tell** from verifier 2. It hands the update condition no clock (`sockets.rs`, `Ask::Update`), has no condition that reads time, and no case has a clock (Run). In principle, yes: a condition valid only before day 10 answers differently on two clocks. G4.8(d) already says the original's clock is read.
- **Settled: yes**, by decision 9, if the arrived-at line holds: the clock is among "the rest of G7", which "leaves the grammar". Verifier 2's lateness per clock (`chain.rs`, from line 282) would go.
- **Ground:** Read; Run for the absence of clocks.

**OI-026. ""It should be able to run": whether rights can stop, or apply again, with no update at all."**
- **Changes an answer: no**, under draft 25 as written. G10.7: "No condition triggers: these grammar rules have no answer **triggered**, and none that a filling's rights **no longer apply**, and a verifier MUST NOT give either." Every reading of the present text gives shown, with "no later version changes them" (`spots.rs`, `rights`). Only a rewrite adding such an answer would differ. It is two questions (stopping; applying again).
- **Settled:** no. Decision 3 is about a signer leaving, by an act; it does not make rights stop by themselves.
- **Ground:** Read.

**OI-035. "Whether a verifier answers from the set of acts it is given, or must also ask the place for more."**
- **Changes an answer: yes.** Verifier 2 answers from the acts it is handed: its place answers only the position of an act already held (`layers.rs`, `Place`, lines 34 to 44; `mod.rs`, `counts`). Terms v1 name place P; an update v2 is at P but not handed to the verifier: today v1 is shown in force, per place (as in case 60); asking P for more, v1 is replaced. No case has an act at the place that the verifier does not hold.
- **Settled: in part**, by decision 9, if the arrived-at line holds ("every reader takes what is latest from it and from nothing else"): for Terms that name a place, the verifier asks the place. Verifier 2 would change. Where no place is named, still open.
- **Ground:** Read; the other answer is Inferred.

**OI-036. "How far a verifier must follow (powers through powers, receivers, long chains) before it may stop and answer unchecked."**
- **Changes an answer: yes**, and the vectors show the mechanism: case 68, "a verifier that stops following receivers answers unchecked, and says how far it followed", sets the receivers' limit to 1 and answers unchecked; with the default limit of 8 (`mod.rs`, lines 88 to 91) the same acts reach a party (`receiver.rs`, lines 41 to 49). Not in the item: two limits in verifier 2 stop without saying unchecked, which G9.2 forbids ("It MUST NOT answer **not shown** or **invalid** because it stopped."): `force.rs`, line 504 (`scope.depth < 16`, in `signed_by`), and a 10,000-step bound in `chain.rs`, `as_if_alone`. Inferred: a chain of more than 16 versions would show it.
- **Settled:** no.
- **Ground:** Run (case 68's limits), Read.

**OI-046. "A fork in one signer's own line: is the signer of an assent that is a tip, or follows one, bound meanwhile."**
- **Changes an answer: yes.** Ana and Ben's Terms are in force; afterwards Ben signs a second act naming the same `previous` as his assent. Verifier 2 puts aside an assent that is a tip whenever the fork was made (`line.rs`, `stopped`, lines 206 to 210; `force.rs`, `counted`, lines 243 to 246): the Terms become not in force, and Ben is not bound. G12.2's last sentence says "Terms that were in force before a fork was made stay in force". So verifier 2 may already differ from draft 25 here, and a signer can take Terms out of force by forking their own line. Cases 39 and 40 have forks made before the Terms came into force only.
- **Settled:** no. Decision 3 gives a way out that makes forking unneeded as an exit; it does not say what a fork does.
- **Ground:** Read; the "afterwards" acts are Inferred (a case would confirm).

**OI-050. ""Built on a tip" reaches as far as the naming goes (the text and the second C session's tests differ)."**
- **Changes an answer: yes.** Ana's line forks; Ben's act relies on one tip; Carla's assent relies on Ben's act. Verifier 2 follows every naming, however deep (`line.rs`, lines 214 to 248): Carla's assent does not count. One naming deep, it counts. No case has a naming chain. Not in the item: verifier 2 follows every field that names an act (`held.rs`, the namings), where G12.2 lists "`terms`, `under`, `answers` or `relies_on`".
- **Settled:** no.
- **Ground:** Read; the example is Inferred.

**OI-051. "A payment that names a tip, or a version along a branch set aside."**
- **Changes an answer: yes**, for its second half. Two questions: (a) a payment naming a tip of a fork that stands, which G1.4 settles and verifier 2 follows (`receiver.rs`, lines 69 to 72): no; (b) a payment naming a version further along a branch set aside: verifier 2 reads that version's receiver, disputed (`receiver.rs`, lines 73 to 74); the C session answered not shown. Case 25, "a payment that names a version of a branch set aside stands: its receiver read from that version, disputed", names the set-aside tip itself, not a version after it.
- **Settled:** no. Decision 2 may change which versions count along the branch (`chain.rs`, `as_if_alone`, uses `is_update`) (Inferred).
- **Ground:** Read.

**OI-067. "How an agreement signs where its Terms give no power (one act by each signer), and that an act made for it under other Terms is not its signature: the least reading, to be confirmed."**
- **Changes an answer: yes.** Cases 51, 52 and 54 ("an act made for an agreement under Terms of another agreement is not its signature", not shown) are exactly these bytes (`force.rs`, lines 77 to 80 and 95 to 153). If an agreement cannot sign without a power, 52 turns; if an act under other Terms can be its signature, 54 turns. A third question inside: G1.2 says `under` "MUST name Terms of that agreement", which could make 54's act invalid, not "not shown".
- **Settled:** no.
- **Ground:** Run (the cases), Read.

**OI-068. "Whether the default of G4.1 should count a party named as an agreement: nothing tells a party that must sign from one that is only pointed at."**
- **Changes an answer: yes.** Case 53, "a party named as an agreement is not counted by the default: in force with the signers' assents" (shown), would answer not shown under a default that counts it (`force.rs`, lines 281 to 288). A part of OI-011.
- **Settled:** no.
- **Ground:** Run (case 53), Read.

**OI-069. "Whether someone who fills a role of an agreement is one of its signers when it signs as a party; and how its Terms "say otherwise"."**
- **Changes an answer: yes**, for the first question. Agreement x names Ana and Ben as signers and a role Carla fills; x has no power; Ana and Ben sign the same act for x. Verifier 2 counts only named signers (`force.rs`, `one_signing`, lines 120 to 121): x signed. Counting role-fillers: not, Carla's act is missing. Verifier 2 does count role-fillers elsewhere, for "everyone who signed the original" (`force.rs`, lines 476 to 492). How Terms "say otherwise": cannot tell, since nothing names a way but a power's rule. No case has a role in x's Terms.
- **Settled:** no.
- **Ground:** Read; the example is Inferred.

**OI-070. "Which acts of an agreement's several signers are one signing; how such a party takes its signature back; and that a party may itself cancel an assent its agent made: Claude's readings."**
- **Changes an answer: yes.** Several questions. Not in the item, and the clearest: an agent who holds only a power to assent cannot cancel the assent it made, in verifier 2 (`force.rs`, `first_counter_signature`, lines 361 to 368: in its own name the agent is not the party; `for` the party it needs a power of kind `counter_signature`). G4.10 says the party may cancel "as may the agent, as that assent's signer". Ana gives Ben a power to assent; Ben assents for Ana to T (Ana, Carla), then signs a counter signature naming it, and Carla's completing assent names the counter signature: by G4.10 cancelled, T not in force; in verifier 2, T in force. On "one signing", case 52 uses identical acts, so the fields that may differ are untested.
- **Settled:** no. Decision 3 raises the same question after Terms are in force: may an agent leave for the party?
- **Ground:** Read; the example is Inferred.

**OI-095. "Whether a work whose owner receives for the others, or a work with no service, holds the Control task with its socket empty."**
- **Changes an answer: yes.** Case 87, "with `control` empty, a receiver among the parties who holds for others holds the Control task" (shown, `legs.rs`, `holds_control`, lines 37 to 45). Under the reading that only a named `control` cMIP holds it: not shown, and its calls would be left unread.
- **Settled:** no. Decision 8 keeps "the call in Terms" in Agreements.
- **Ground:** Run (case 87), Read.

**OI-118. "A receiver that points onward through agreements inside one leg: no limit on how many, and "not shown" where an agreement is met a second time."**
- **Changes an answer: yes**, for the second half. Case 70, "an agreement met a second time on the way: no one receives" (not shown, `receiver.rs`, lines 42 to 44); another reading (it leans on itself) would answer unchecked. The first half (no limit) changes no word the text allows: verifiers may already stop at different depths with unchecked (OI-036).
- **Settled:** no. Decision 8 keeps the receiver in Agreements.
- **Ground:** Run (case 70), Read.

**OI-123. "The data task's one question; a report that carries the data of people bound by different Terms (every data cMIP asked must say yes: Claude's reading); and an empty `data`."**
- **Changes an answer: yes**, for the reading that every one must say yes. Verifier 2 answers yes only where every data cMIP asked says yes (`legs.rs`, `data`, lines 260 to 275). Ana's leg report under Terms W, whose data cMIP says yes to Dana, states a sum passed on to agreement B, whose data cMIP says no: verifier 2 answers no; a reading where any one yes is enough answers yes. No case has two Terms asked. An empty `data` meaning no is written plainly: no.
- **Settled:** no. Decision 8 keeps "the consent to data beyond one leg" in Agreements.
- **Ground:** Read; the example is Inferred.

**OI-147. "The holder at an act: the baker at the bake, otherwise the one the last transfer at or before that act names: Claude's reading."**
- **Changes an answer: yes.** Under the "current holder" of decision 8's framing, cases 101 and 102 flip (Part 1). A reading that differs only within G14.1 would contradict G14.2's own "Terms that cite that transfer, or a later act of the chain, need that holder". Verifier 2 asks the layer below for the holder (`baker.rs`; `layers.rs`, from line 124).
- **Settled: yes**, by decision 8 ("Agreed for the first"): the holder leaves the grammar for Envelopes. Verifier 2 already leaves it to a stand-in for that layer. Which holder Agreements then asks about is the question in Part 1, decision 8.
- **Ground:** Read.

**OI-148. "A new version after a sale: the old version stays in force, and a later update of it needs the buyer of the rights."**
- **Changes an answer: yes.** Ana, the baker, and Carla sign V1 citing the bake; Ana sells to Ben; Ana and Carla sign V2, replacing V1, citing the sale and naming Ben, who never signs. Verifier 2: V2 not shown, V1 stays in force (`chain.rs`, `is_update`, applies `baker_gate` first; `baker.rs`, `bound_raw`). If being a party is enough, V2 replaces V1. No case has an update after a sale.
- **Settled:** no; reopened by decision 1 ("Three lines cut back": "whether a holder of the baker's rights must be bound by the Terms, beyond being a party"). Decision 2 does not say whether G14.3 stays a gate on an update. Overlaps OI-151.
- **Ground:** Read; the example is Inferred.

**OI-151. ""Bound by them", for the holder of the baker's rights: bound in any way G5.1 allows, the party still named, the Terms replaced asked too, "before and apart from G14.3": Claude's readings."**
- **Changes an answer: yes.** Case 110, "Terms that name the holder, who is not shown bound by them: not shown, they count for nothing until it is", would answer shown if being a party is enough. Decision 2 changes `bound_raw` (`baker.rs`, line 153, through `update_raw` and its second check); decision 4 turns its "maybe" into unchecked (line 162). Four questions in one.
- **Settled:** no; reopened by decision 1.
- **Ground:** Run (case 110), Read.

**OI-152. "A baker, or holder, who fills a role of the Terms."**
- **Changes an answer: yes**, not from section 9's item 15. Verifier 2 never answers invalid where any role is among the parties (`baker.rs`, line 82: `if !named && !roles`). A thief's Terms citing Ana's bake, with the thief and a role whose cMIP never names Ana: verifier 2 answers not shown; reading "reach that holder through no role" as: no role's cMIP names her, answers invalid. A thief could escape "invalid for good" by adding a role. No case has a role in Terms that name an envelope.
- **Settled:** no. Decision 8 keeps in Agreements the question whether the holder is a party.
- **Ground:** Read; the example is Inferred.

**OI-165. "What the Sign layer does when a key is replaced or lost, and what a change of key does to a signer's line."**
- **Changes an answer: yes**, for lost keys. Two questions. (a) A key change: verifier 2 never reads keys; its signer is the identity hash (`check.rs`, line 137), so the line continues: no. (b) A stolen key: a thief signs X with Ana's old key, naming Ana's previous act; Ana signs Y naming the same act; the core calls X void. Verifier 2 does not read void: a fork in Ana's line, both stop (as case 38). Under a reading where a void act is no tip: no fork, Y counts.
- **Settled: in part**, by decision 6 ("It does"): (a), and verifier 2 already matches. (b) is not settled.
- **Ground:** Read; (b) is Inferred (the rule on void acts in Identity and Envelopes would confirm; this session did not read it).

---

## What this sheet does not settle

Nothing. Every reading above is a question; every lean is this session's.

**Decisions whose words and arrived-at line differ:**
- **2.** "governs only its own later life" is the MOR lead's; what it means for the Terms in force is open (Part 1, 2, point 5).
- **3.** The line drops the lean's conditions he agreed to (what is owed, the record of who left, a contest, said before signing), and reads his "agreements have their own way out" as Terms that switch the exit off.
- **4.** The line reaches every answer; the option he agreed to was framed on the update. It also uses two words, unchecked and not shown.
- **6.** The exchange speaks of two threads; encoding 2 writes three lines (`prev`, `previous`, `replaces`).
- **8.** The framing he answered said "the current holder"; draft 25 says that reading "is gone".
- **9.** The one rule is the MOR lead's sentence; his words asked for less grammar.

**What the session could not tell:**
- What verifier 2 answers on bytes no vector holds: every "today" answer about a new case above is Read or Inferred, not Run.
- Whether a fork in the act format's `prev` is a fork for Agreements (decision 6, reading (i)); the Envelopes text was not among this session's readings.
- What the core's void acts do to a line (OI-165 (b)).
- OI-023, for want of any clock in verifier 2.

**Items that turned out to be two questions, or the same as another:**
- Two or more: OI-009, OI-026, OI-051, OI-067 (a third, about the answer word), OI-069, OI-070, OI-118, OI-123, OI-151, OI-165.
- The same, or overlapping: OI-011 and OI-068; OI-148 and OI-151; OI-152 and OI-151 (the "bound" half); OI-016 and decision 2; OI-035 and decision 9 (new case 9b); OI-036 and OI-118's first half.

**Found on the way, outside the questions asked:**
- `core/vectors/README.md` counts 559 verdict cases; `verdicts.json` holds 618 (see the section on checking twice, above).
- The A6 story the decision was made on (`verifier-2-readings-in-human.md`, section 2) needs O's own rule not to need Carla, or verifier 2 shows U not shown rather than valid (Part 1, decision 4).
- Verifier 2 may differ from draft 25 on: a fork made after Terms are in force (OI-046, G12.2's last sentence); an agent cancelling its own assent (OI-070, G4.10); two limits that stop without answering unchecked (OI-036, G9.2); the fields "built on a tip" follows (OI-050, G12.2). Each is Read in the code and Inferred as a difference; a case would confirm.

Test identities only; no server address, onion address or key appears.

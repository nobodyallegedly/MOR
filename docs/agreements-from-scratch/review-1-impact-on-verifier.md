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

## Part 3. What the evening's decisions change (17 November, evening)

Written by Claude, a session under the codemeister of MOR, for Nobody, allegedly, and the MOR lead. A record of work: it sets out questions and decides nothing. No text, code or vector was changed for it.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

**What this part does.** On the evening of 17 November, after the review of wave 2, Nobody, allegedly, and the MOR lead arrived at six more things; five of them (numbered 1 to 5 in wave 3's assignment, `docs/lead/assignments/2026-11-17-wave-3-common.md`, branch `claude/lead-records-2`) can touch what a verifier answers. For each, this part asks the same five things as Part 1. To keep the two sets of numbers apart, the afternoon's decisions are named here as Part 1 names them (*Part 1's decision 4*), and tonight's as *tonight's 1* to *tonight's 5*. Case numbers are positions in `grammar.json`'s `cases`, from 0, as in Part 1.

**The grounds.** As in Parts 1 and 2, every claim carries one: **Run** (a command, and the case), **Read** (a file and its lines, or a rule), **Inferred** (this session's reasoning, with what would confirm it). What verifier 2 answers today is Run: `cargo test -p mor-core --locked` passes (570 tests, none failed), `cargo run -q -p mor-core --example gen_vectors --locked` writes the vectors again and `git diff --exit-code core/vectors` shows nothing moved, and `core/vectors/agreements_new_grammar_check.py` prints "grammar.json: 115 of 120 cases judged again, and agree" (the five it does not judge include 58 and 59, which this part names). What *would* change cannot be run, since no code changes.

**A note on the files.** The assignment points to `fork.rs`; there is no such file (Run: `ls core/src/agreements_new/grammar/`). Forks of Terms are read in `chain.rs` (`walk`, `step_from`, `not_late`, `late_against`, `resolves`); forks in one signer's line in `line.rs` (`stopped`).

### Tonight, in one table

| Tonight's | Flips, under the session's leans | Flips under other readings | Go | New cases |
|---|---|---|---|---|
| 1. The holder at the act cited | none | none | none | 1 |
| 2. Bound, not named | none | none | none | 3 |
| 3. A race changes nothing | 36, 101, 102 (37's words change, not its word) | 37 (to shown, or to unchecked); 31 (to shown) | none | 4 |
| 4. No default way out | 58 | none | none | 1 |
| 5. What the core is for | a list only (10 checks) | | | |

The counts against Part 1's, with what is counted twice, are at the end of this part.

---

### Tonight's 1. The holder at the act cited

**In plain words.** Terms about a baked work must have, among their parties, whoever held the baker's rights at the act of the envelope's chain those Terms cite (the bake, or a sale), not whoever holds them now. Verifier 2 already reads it so. Nothing flips. What changes is in Part 1: a reading under which two cases flipped is gone.

1. **His words:** "It's wording, agreed." (to the MOR lead's lean "that the rule moves as decided and reads the holder at the act the Terms cite, never the current one.")
   **Arrived at (to check):** "the baker's rule moves to Envelopes and reads the holder of the baker's rights at the envelope act the Terms cite, as "The holder at the time" has it. "Current" was the MOR lead's wording, withdrawn."
   Where it says more than his words: nothing that changes an answer. "moves to Envelopes" repeats the afternoon's "Where three rules live", which this exchange did not reopen.

2. **A story.** Ana bakes a song. Ana and Carla sign Terms T that cite the bake. Later Ana sells the baker's rights to Ben. Dana holds the acts and asks whether T count.
   - Today Dana is shown: T **count**; Ana held the rights at the bake and is a party, bound by T (case 101, Run). Terms Ben and Carla sign citing the sale need Ben (103, Run); Terms Ana signs alone citing the sale are **invalid** (104, Run).
   - Under the decision Dana would be shown the same. Under the withdrawn "current holder", T would not count, since Ben is no party.

3. **Cases and vectors.**
   - Flip: none. Read: `baker.rs`, `baker_inner`, line 59, asks the chain for the holder at `x`, the Terms' `envelope_at` (`chain.at(e, x)`); `layers.rs`, `TableChain::at`, walks back from that act to the bake. No function reads the chain as it stands now. Run: the answers of 99, 101, 103, 110, 112 and 113 all say "the holder of the baker's rights at the act the Terms cite" or "the holder at the act cited".
   - Go: none beyond Part 1's decision 8 (the seven baker cases that move with the rule).
   - **What it changes in Part 1, decision 8.** Part 1 counted 101 and 102 as flipping under "current holder" (Part 1, decision 8, points 3 and 5, and the summary table's "101, 102 under one reading"). That reading is withdrawn tonight: Part 1's lean ("the holder at the act cited") is now what was arrived at. The move to Envelopes stands; what Envelopes must give is the holder **at an act**, which is what verifier 2's stand-in already asks of that layer (`layers.rs`, `EnvelopeChain::at`, "The holder at an act of the envelope's chain (G14.1)"). Part 1's seam case (8a) stays as written. Cases 101 and 102 come back under tonight's 3, for another reason.
   - The code: `baker.rs`, `baker_inner`, `late_terms`; `layers.rs`, `EnvelopeChain::at` and `transfers_after`. Read.

4. **New cases:**
   - (1a) Two sales in a line (Ana to Ben, then Ben to Carla), and Terms citing the first sale, with Ben as a party: they count (draft 25, G14.2: "Terms that cite that transfer, or a later act of the chain, need that holder"). No vector has two transfers one after the other: the one chain with two transfers is the double sale, both following the bake (Read: `cases.rs`, `baker_cases`, `s3`).

5. **Where it can be read two ways.** None found that changes a verifier's answer. Each Terms act reads the holder at its own `envelope_at`, an update included (Read: `chain.rs`, `is_update` calls `baker_gate` on the update itself, line 171).

### Tonight's 2. Bound, not named

**In plain words.** It is not enough for the Terms to list the holder of the baker's rights. Her own signature must stand behind them: her assent to these Terms, or her assent to an earlier version whose update condition let these through. Verifier 2 mostly asks exactly that: Terms that list the holder, who never signed, count for nothing (case 110). But reading its code, one path seems to let a holder count as bound when she signed an earlier version that was never really replaced; and it counts two things the arrived-at line does not name: an agent's assent made for her, and a chain of several updates.

1. **His words:** "How does that differ truly in the implementation of it", then "Bound, absolutely bound".
   The MOR lead's answer between them: "named, the verifier looks for the holder's identity among the parties; bound, it looks for the holder's own signature behind the Terms, either her counted assent to them or her assent to an earlier version whose update condition answered valid; it matters because Terms can come into force without every named party signing".
   **Arrived at (to check):** "Terms that rely on the baker's rights count only if the holder at the act cited is bound by them: her own signature stands behind the Terms, either her assent to them or her assent to an earlier version whose update condition let them through. Being named is not enough."
   Where it differs from what it settles: draft 25's "Bound by them" (G14.2) names more ways than the line: "by an assent made for it under a power, or as an agreement's signature (G5.1(b), G1.2)", and "an update condition the party signed into the original, or was bound by there, included". The line names only her own assent, to these Terms or to an earlier version. Whether those other ways still count is point 5. The line also does not repeat draft 25's "the Terms are, or have been, a version".

2. **A story.** Ana bakes a song. Terms T name Ana and Carla and cite the bake; Carla assents, Ana does not.
   - Today Dana is shown: T **not shown**, "they count for nothing until it is" (case 110, Run).
   - Under the decision: the same.

   **A second story, where verifier 2 may accept less** (Inferred). Ana and Carla both sign Terms T0 (no update condition, no envelope). Carla alone writes T1, replacing T0, naming Ana and Carla, with an update condition under which any one of the original's signers is enough, and no envelope. T1 never replaces T0: by default T0 needs Ana's signature too. Carla then writes T2, replacing T1, naming Ana and Carla and Ana's envelope, citing the bake, with an `in_force` rule asking for Carla's assent alone. Only Carla signs T2.
   - Today Dana would be shown, asking the baker's question of T2: **shown**, Ana "one of their parties, bound by them". Read: `baker.rs`, `bound_raw`, lines 141 to 163, asks `signed_by` of T1; `force.rs`, `signed_by`, lines 502 to 519, counts Ana as having signed T1 because she signed T0 and T1 "still names" her, without asking whether T1 ever replaced T0; T1 names no envelope, so `baker_gate` on it passes (line 152); T1's condition answers valid for T2, and T2 is in force by its own rule (line 153).
   - Under the decision: **not shown**. Ana's signature stands behind T0 only, and T0's update condition never let T1 through.
   - What would confirm it: a case with these acts. Which Terms are in force would still be T0, since the walk never reaches T1 (Read: `chain.rs`, `walk`); only the baker's answer about T2 is touched.

3. **Cases and vectors.**
   - Flip: none. Case 110 already answers not shown for a holder named and unsigned (Run). In 99, 101, 103, 112 and 113, the holder signs in her own name (Run: their acts include "baker/K's assent", "baker/N's assent", "baker/L's assent").
   - Go: none.
   - No vector has an assent made for the holder under a power, or a holder bound through an update (Run: no act in cases 99 to 113 is made "for" anyone; Read: `cases.rs`, `baker_cases`).
   - **What it changes in Part 2.** OI-148 and OI-151 were marked "reopened by 1" (the afternoon's "Three lines cut back"). Tonight's 2 settles their main half: being a party is not enough. Verifier 2's answers there are already the decision's: 110 stays not shown, and OI-148's V2, which names Ben but which Ben never signs, stays not shown (Read: `baker.rs`, `bound_raw`). What stays open in OI-151: an assent made for the holder under a power, and the Terms replaced asked "before and apart from G14.3".
   - The code: `baker.rs`, `baker_inner` (lines 77 to 82, named or a role; lines 108 to 116, bound), `bound_raw` (lines 141 to 163); `force.rs`, `counted` (from line 218), `name_of` (line 53), `signed_by` (from line 473). Read.

4. **New cases:**
   - (2a) The second story above: an earlier version that never replaced the one the holder signed.
   - (2b) The holder's assent made for her by an agent, under a power she gave (G5.1(b)).
   - (2c) The holder signed V1; V2 replaced V1 by V1's update condition, without her; V3 replaced V2 by V2's condition, without her. Is she bound by V3?

5. **Where it can be read two ways.**
   - **An agent's assent.** The words: "her own signature stands behind the Terms". (i) Only an assent she signed herself; (ii) also one made for her under a power she gave, as draft 25's "Bound by them" says. Verifier 2 reads (ii): `counted` counts an assent in her name whoever signed it (`force.rs`, `name_of`). A verifier's answer changes: under (i), Terms her agent signed for her count for nothing. **The session's lean:** (ii); the power is her own signature, given earlier. A question.
   - **More than one step.** The words: "her assent to an earlier version whose update condition let them through". (i) Any earlier version she assented to, every step after it let through by the condition before it; (ii) only the version she assented to, whose own condition let these Terms through. Verifier 2 reads (i), and without checking each step (story 2). Under (ii), V3 in (2c) counts for nothing. **The session's lean:** (i), as G5.1(c) chains and draft 25 says "or was bound by there"; each step checked.

### Tonight's 3. A race changes nothing

**In plain words.** Sometimes two acts decide something together and nothing shows which came first: neither names the other, and no place or other anchoring orders them. Tonight's answer: whatever was being attempted does not take effect, and things stay as they were. Verifier 2 already does this for two rival updates of the same Terms (a fork: both stop, the old Terms stay). It does not in four places: a withdrawal racing the Terms' completion ("not shown", 36 and 37); a withdrawal of unclear order that is simply left out when counting who must sign an update (A6), so the update goes through; two withdrawals of one assent, where it picks one by its hash (A12); and Terms about a baked work racing a sale of the rights, which count (101 and 102).

1. **His words**, in order: "Let.s truly think of people here for a minute. I'm having problems understanding who is trying to save what since she removed the assent (dunno why' but I don't like this word…)"; "But, was there a moment when all three had signed, before she assented? The problem is that there is, in this scenario, no way to figure it out. Correct?"; "How can nothing put them in order, that is what I struggle with, their both interactions with the same act from the same id, only an anchor can settle it?"; "So, it is narrower. Let.s explore it now…"; "It gets worse when you imagine this happening on an update of a long relationship…"; and the answer: "Yes, these timing issues when no anchoring is involved should always force whatever was being done not to work".
   The MOR lead's three ways, before it: "(a) unchecked, (b) a fixed tie-break, (c) a fork, where both tips stop and the last version everyone shared stays in force; leaned (c)". And: "under (c) the relationship carries on under the last shared version and only the change waits; under (a) everything citing the update hangs".
   **Arrived at (to check):** "where the order of acts that decide something cannot be told (no knot, no place, no anchoring), what was being done does not work: the change does not take effect, and the last version everyone shared stays in force, as with rival tips. Those who want the change settle it by a new act. This refines "Unclear means unchecked" for races."
   Where it says more than his words:
   - His words say what fails ("whatever was being done"), not what stays. "the last version everyone shared stays in force" is the MOR lead's option (c), which his "Yes" answered.
   - "(no knot, no place, no anchoring)": his words say "no anchoring". A knot (one act naming another) is not an anchoring in draft 25 (G13.4: "Whether anything is later than an act, and what time it was, are never shown by citing."), but it does order two acts (G13.3). Reading it in is the MOR lead's, and it changes nothing in the vectors (every case ordered by knots stays: 29, 30, 32 to 35, 105, 106).
   - "Those who want the change settle it by a new act" is the MOR lead's.
   - "This refines "Unclear means unchecked" for races" places it against Part 1's decision 4; his words do not mention it. That is the first question in point 5.
   - The wave's assignment glosses "does not work" as "the change is not shown as taking effect, and the last shared version stays."

2. **A story** (A6, as Part 1 tells it). Terms O name Ana, Ben and Carla; their `in_force` rule asks for any two of the three; there is no place and no update condition. All three assent. Carla then signs a counter signature naming only her own assent; nothing shows whether it came before or after O came into force. Ana and Ben then sign an update U that takes Carla's share.
   - Today Dana is shown: O in force, and U **valid by default** (Inferred, as in Part 1: `force.rs`, `signed_by`, line 481, counts only the assents that surely count, so Carla is not among "everyone who signed the original"). Carla is bound by U without signing it.
   - Under tonight's decision, every reading gives the same result: U **does not work**. It replaces nothing, and O stays in force. Either Carla's withdrawal is what fails, so her assent counts and U lacks her signature; or U is what was being done, and it fails.
   - Under Part 1's decision 4, as Part 1 leaned: U **unchecked**. Same outcome for Carla, different word for Dana (point 5, first question).

   **Three shorter stories.**
   - *Ana and Ben* (cases 36, 37). Terms T name Ana and Ben; both must assent. Ana assents, then withdraws; Ben assents; neither act names the other. Today Dana is shown: whether T are in force, **not shown**; the withdrawal, **not shown** ("citing gives no order between the counter signature and the Terms coming into force (G4.10)", Run). Under the decision: either T never came into force, or Ana's withdrawal failed and T are in force (point 5, second question).
   - *Ana's two withdrawals* (A12). Ana assents to T (Ana, Ben). Ana withdraws in her own name; Carla, holding Ana's power to withdraw for her, also withdraws for her; neither withdrawal names the other. Today verifier 2 reads the one whose id sorts first, with or without a place (Read: `force.rs`, `first_counter_signature`, lines 347 to 376: `found.sort()`, and no place read). That is a fixed tie-break, the MOR lead's way (b), which was not taken. Under the decision: where T name a place, the place orders the two (an anchoring is involved); where nothing orders them, whatever was being done does not work.
   - *Ana's sale* (cases 101, 102). Ana bakes; Ana and Carla sign Terms T citing the bake; Ana sells the rights to Ben; nothing shows whether T came before the sale or after. Today Dana is shown: T **count**, and are in force (Run). If this is a race, under the decision T **do not work**: not shown, and nothing is in force (point 5, third question).

3. **Cases and vectors.**
   - **Would flip, by reading (point 5):**
     - 36, "a counter signature and a completing assent, neither naming the other: whether the Terms are in force is not shown": **not shown** to **shown** (it cancels), if the Terms' coming into force is what fails; unchanged in its word, with "it changes nothing" for its reason, if the withdrawal fails.
     - 37, "with the counter signature's order not shown, in force is not shown": stays **not shown** in its word if the coming into force fails, its words becoming "not in force"; **shown** if the withdrawal fails; **unchecked** under Part 1's decision 4.
     - 101, "after a sale, Terms made with the holder of the moment keep counting", and 102, "after a sale, Terms with the holder of the moment stay in force": **shown** to **not shown**, if Terms racing a sale are a race.
     - 110's words, not its word: its Terms also race the sale in its acts; under the same reading they would be not shown for the race before the question of being bound is reached (Read: `baker.rs`, `baker_inner` reads lateness, lines 95 to 105, before being bound, lines 108 to 116).
   - **Already "does not work" today** (no flip): the forks of Terms, 17 to 21, 26 and 27 (both tips stop and the shared version stays in force, G4.7, G12.2, G12.7; Read: `chain.rs`, `step_from`, `Next::Fork`, and `walk`, line 386); the forks in a signer's line, 38 to 40 (both tips stop; Read: `line.rs`, `stopped`); 59, "an act made under a power after the Terms that gave it were replaced: not bound", where the agent's act and the delegation's end have no order and the act binds no one ("citing gives no order between the act and the replacing Terms coming into force (G5.4, G13.3)", Run; Read: `force.rs`, `before_in_force`, line 211); and 111, the double sale, where that layer gives no holder (not shown, Run). Of these, the independent Python check does not judge 59 (Run).
   - **Not a race: the order is shown** (no flip): by knots, 29, 30, 32 to 35, 105, 106; by a place, 65 (Run).
   - **A missing act, not a race:** 31, "an update that names an act the verifier does not hold, which might show it late: which Terms are in force is unchecked" (point 5, fifth question).
   - Go: none.
   - The code each answer comes from: `force.rs`, `counter_cancels` (lines 400 to 438; "not shown" at line 437), `in_force_raw` (lines 302 to 330; line 325), `counted` (line 262: an assent of unclear order goes to `maybe`), `signed_by` (line 481: only the sure ones), `update_raw` (lines 547 to 597), `first_counter_signature` (lines 347 to 376), `before_in_force` (lines 182 to 212); `baker.rs`, `late_terms` (lines 168 to 236: no order shown, so "not late", line 235); `chain.rs`, `step_from` and `not_late` (forks). Read.

   **What an anchoring changes, where the text names one.** Draft 25 names three: the place the Terms name (G4.6, G7.2), the clock they name (G7.4), and, where they name neither, the anchoring the reader accepts (G13.4). Where there is one, the order is told, and tonight's decision does not apply.
   - Verifier 2 reads the place for a withdrawal against the Terms' coming into force (`force.rs`, `counter_cancels`, lines 414 to 427: G4.10, "With a place, the positions it gives settle it"), for two rival updates (`chain.rs`, `late_against`; case 65), for an act under a power (`before_in_force`, line 187; G5.4) and for Terms against a sale (`baker.rs`, `late_terms`, place and clock; G14.2(b)). Read.
   - It does not read it to choose between two withdrawals of one assent (A12, above). Under the decision, where a place is named, it would.
   - A3 (two rival updates under a place, signed in parallel): with a place, an anchoring is involved, so tonight's decision does not reach it, and A3's question in `verifier-2-readings-in-human.md` stays as it was. Without a place, two rival updates are a fork already (17).

4. **New cases** no vector covers:
   - (3a) A6 itself, with an `in_force` rule that does not need Carla. This is Part 1's (4a); counted once, under Part 1.
   - (3b) A12 with no place: two withdrawals of one assent, one made under a power, neither following the other.
   - (3c) A12 with a place that orders them: today verifier 2 picks by hash.
   - (3d) Terms citing the bake, and a sale, with a place that orders them: before the sale, they count; after it, late. No baker case has a place (Run: only cases 60, 61, 63, 64 and 65 carry places).
   - (3e) A race with no place named, under an anchoring the reader accepts (G13.4): case 64 has a reader's anchoring and no race (Run).

5. **Where it can be read two ways.**
   - **First: tonight's words against "Unclear means unchecked" (Part 1's decision 4).** Tonight's line: "the change does not take effect, and the last version everyone shared stays in force". Part 1's decision 4, as arrived at: "Where it is unclear whether someone's assent counts, every answer that depends on it is unchecked; an update is not shown as replacing the old Terms until that person's position is clear." For A6, and for 36 and 37, these give two different words for the same acts.
     - (i) For a race, the word is the one for things that do not work: the update replaces nothing (**not shown**), and the old Terms are **shown** in force. **Unchecked** stays for what is unclear for another reason: a private act that cannot be read (A9), a missing act (31), a cMIP not held.
     - (ii) **Unchecked** stays the word for a race too, and "does not work" says only what a reader may act on.
     - A verifier's answer changes: yes. On A6, U is not shown under (i) and unchecked under (ii); on 37, see the next question.
     - **The session's lean:** (i), since the line says it "refines" Part 1's decision 4 "for races", and "stays in force" is an answer, which unchecked is not. Part 1's lean for 37 (to unchecked) would then not hold for 37. A question for Nobody, allegedly, and the MOR lead.
   - **Second: in a withdrawal's race, what is "whatever was being done"?** (Cases 36, 37, and A12 without a place.)
     - (i) The Terms' coming into force. It does not happen: the Terms are not in force, and the withdrawal stands. 36 goes to shown; 37 stays not shown, as "not in force".
     - (ii) The withdrawal. It fails: the assent counts, and the Terms are in force. 37 goes to shown; 36 stays not shown, as "changes nothing".
     - **The session's lean:** (i). Before the Terms came into force, no version of them was shared, so the last shared state is no Terms in force; and draft 25 lets a withdrawal work "until those Terms are in force" (G4.10). Against it: tonight's 4 reads an agreement as something one cannot leave, which could favour (ii). A question.
   - **Third: are Terms racing a sale a race?** (Cases 101, 102, 110.) Draft 25, G14.2: "Where neither the knots nor an anchoring show it, the Terms are not late, and are read by the holder at X, however late they may in fact be." That is the opposite of what G4.7 says of two rival updates in the same position ("Where neither the knots nor an anchoring show it, L and F are a fork").
     - (i) It is a race: the question is whether the Terms were made before the sale, and nothing anchors it, so the Terms do not work. 101 and 102 go to not shown.
     - (ii) It is not: the holder is fixed by the act the Terms cite, "all fixed by fingerprint, so it is not an answer about what is latest" (G14.1), and lateness is a separate rule that counts only what is shown.
     - Under (i), what draft 25 says G14.2 "Protects" changes, for Terms no anchoring orders: "whoever agreed with the holder of the moment, and every payer under those Terms, whom a later sale does not undo".
     - **The session's lean:** (i), on his "always"; it is a large change to G14.2, and his words were said of an update, not of a sale. A question.
   - **Fourth: does a reader's own anchoring count, when he says "when no anchoring is involved"?** (i) Yes: G13.4 stands, and where the Terms name no place, each reader who accepts an anchoring gets an order, per that anchoring; (ii) only a place or clock the Terms name. A verifier's answer changes for a reader with an anchoring, on bytes no vector holds (3e). **The session's lean:** (i), since G13.4 is untouched.
   - **Fifth: is a missing act a timing issue?** Case 31: an update names an act the verifier does not hold, which might show it late. (i) No: the order may exist, in the act not held; that is "unclear", and stays **unchecked** (G4.7(c), G9). (ii) Yes: no anchoring is involved, so the change does not work, and the shared version is **shown** in force. **The session's lean:** (i).

### Tonight's 4. No default way out

**In plain words.** The afternoon gave every signer a way out by default (Part 1's decision 3). Tonight it is withdrawn: leaving an agreement is an update, a new version without the leaver, signed as the update condition says; by default, with the others' signatures. Draft 25 never had an act for leaving, and verifier 2 never wrote one, so the afternoon's decision had no vector and no flip; its six new cases go. One rule of draft 25 already gives a way out by default, though: a delegator may end a delegation alone (G5.5, case 58).

1. **His words**, in order: "Leaving an agreement should leave a clear identifiable evidence, yes"; "Leaving an agreement forces the agreement to be redrafted anyway. It's a new agreement, updated from the previous one and in its chain, but it is its own new act"; "That's the trap… and an agreement is a trap. My question is, under what conditions did she join the agreement? None for exits will be your answer. So, leaving the agreement needs the agreement of the other parties. That's what an agreement is for truly. So, no, there is no standard way out of an agreement that is the purpose of an agreement."; "I know… I too can change my mind. An agreement is there so that you cannot leave it. That's why it exists"; "No, what I mean is written agreements have always been about not being able to escape the agreement. That is why humans have started writing in the first place… so right of exit? No, not from an agreement."; "Yes, it.s still true under the right cMIPs. Agreements is not to be used bare. It's to build on top of."
   **Arrived at (to check):** ""A way out by default" is replaced. There is no default way out of an agreement. Leaving is an update, a new version in the agreement's chain without the leaver, and it passes by the update condition like any other: by default, with the others' signatures; otherwise under whatever exit conditions the Terms set when she joined." Then: "right of exit does not apply to an agreement; being unable to escape it is what writing it down is for." Then: "the right of exit still holds, through the cMIPs an agreement chooses (an exit is something Terms can carry, in the update condition's socket or another); the grammar bare has none. Agreements is not meant to be used bare; it is built on."
   Where it says more than his words:
   - "by default, with the others' signatures" reads his "needs the agreement of the other parties". Draft 25's default asks "everyone who signed the original" (G4.8(a)), which includes the leaver. Under the default, the leaver signs her own leaving too. The line and the default may differ there; no vector shows it.
   - "in the update condition's socket or another" is the MOR lead's; his words say "under the right cMIPs".

2. **A story.** Terms T name Ana, Ben and Carla, and are in force. Carla wants out.
   - Today Dana is shown: a withdrawal Carla signs now "changes nothing" (case 34, Run). A new version without Carla, signed by Ana and Ben alone, is **not shown** as replacing T, because Carla signed T (as case 7, Run). Signed by all three, it is **valid** (as case 8, Run).
   - Under the afternoon's decision, Dana would have been shown: Carla left by default.
   - Under tonight's decision, the same as today.

   **A second story** (case 58). Ana gives Gil a power to act for her: a delegation D, signed by both. Ana alone signs D2, which removes the power.
   - Today Dana is shown: D2 **valid**, and it replaces D (Run). Draft 25, G5.5: "By default the delegator can end it at any time".
   - Under tonight's decision, if a delegation is an agreement like any other: D2 **not shown** as replacing D, since Gil signed D (point 5).

3. **Cases and vectors.**
   - What the afternoon's decision would have changed (Part 1, decision 3): no flip under Part 1's lean; 34 under one reading; six new cases, (3a) to (3f).
   - **Any vector written for it: none.** Run: a search for "way out", "leave", "leaving", "exit" and "resign" over `core/src/agreements_new/`, `core/vectors/agreements-new/` and `core/examples/` finds no case or vector for a leaving act in verifier 2's files; the matches there are words such as "leaves unread". The freeze suite's scenario 9, "The way out, walked" (`core/examples/support/scenario9.rs`, last changed 7 November, commit `ee31c66`), walks exits under the earlier Agreements text, which verifier 2 does not read, and was written before the afternoon's decision.
   - Without it: no flip, no case goes, and the six new cases go. 34's other reading goes with them.
   - Would flip under tonight's decision: 58, "a delegation ended by the delegator alone: a version that removes the power, with the delegator's part alone, is valid by default": **valid** to **not shown**, if G5.5's default goes (point 5). The independent Python check does not judge 58 (Run).
   - The code: `force.rs`, `update_raw` (lines 547 to 597), `delegation_end` (from line 616), `signed_by` (lines 502 to 519: a party a version took out is not asked again). Read.
   - **What it changes in Part 2.** OI-009 ("Decision 3 lowers the stakes, since one could leave later"), OI-046 ("Decision 3 gives a way out that makes forking unneeded as an exit") and OI-070 ("Decision 3 raises the same question after Terms are in force: may an agent leave for the party?") each leaned on the afternoon's way out. Without it, OI-046 weighs more: in verifier 2, a signer who forks their own line after the Terms are in force takes those Terms out of force (Part 2, OI-046), which is then the one way to leave alone. Draft 25 forbids it: "Terms that were in force before a fork was made stay in force" (G12.2).

4. **New cases:**
   - (4a) A version without Carla, signed by all three; then a later update. Carla is no longer asked (G4.8(a): "a party that a version took out is not asked by a later update"). No vector has a party taken out and a later update (Read: `cases.rs`).

5. **Where it can be read two ways.**
   - **Does "no standard way out" reach a delegation?** His words: "there is no standard way out of an agreement". Draft 25, G5.5: "By default the delegator can end it at any time".
     - (i) Yes: a delegation is Terms like any other, and G5.5's default goes; the delegator ends it as the update condition says, by default with the agent's signature. 58 flips.
     - (ii) No: ending a delegation takes back a power one gave, not a promise to others; G5.5 stays.
     - A verifier's answer changes: yes, 58.
     - **The session's lean:** (i), since G5.5's default is a way out in the grammar bare, which tonight's line says has none. It is a real question: G5.5 may rest on an earlier exchange of his that this session did not read.

### Tonight's 5. What the core is for: a list

**In plain words.** Tonight's line: "Rules that settle how people should behave in a deal corner the protocol, however right the idea." Below are verifier 2's checks that read as settling how people behave in a deal, rather than what can be written and checked. A list only: the scribe and Fable are sorting the rules.

His words: "Those sentences are why agreement was not right… not because the ideas were wrong, but because it forces the protocol into a corner instead of doing what we meant. ID and text are universal, development is definition, the rest is to build on top of." (said of the MOR lead's lean that a receiver stays answerable after an update).
**Arrived at (to check):** "the receiver's duty after an update is not a core rule; it is for the cMIPs Terms choose. Rules that settle how people should behave in a deal corner the protocol, however right the idea. Identity and Text are universal; Development is definition; the rest is built on top of."
Where it says more than his words: "Rules that settle how people should behave in a deal" widens "Those sentences", said of one lean, to every rule of that kind.

The receiver's duty after an update, the exchange's own example, is not in verifier 2 (Read: no function keeps a receiver answerable after a newer version; `receiver.rs` reads the receiver from the version an act names, G1.4, G13.1).

| # | The check (file, function) | Draft 25's rule | Why it reads as behaviour |
|---|---|---|---|
| 1 | `legs.rs`, `holds_control` | G11.2: "so that this party holds for the others and passing on to them is its obligation under those Terms" | It puts a duty to pass money on onto a receiver the Terms never gave one. |
| 2 | `force.rs`, `delegation_end` | G5.5: "By default the delegator can end it at any time" | It decides who may walk away from a delegation without the other. |
| 3 | `force.rs`, `counter_cancels` | G4.10: "One made for Terms that are in force changes nothing" | It decides until when a person may change their mind. |
| 4 | `force.rs`, `in_force_given` and `update_raw` (the defaults) | G4.1 (every party named as a signer) and G4.8(a), G4.11 ("everyone who signed the original") | It decides, where Terms say nothing, whose yes a deal needs. |
| 5 | `force.rs`, `before_in_force`, through `power` | G5.4: an act under a power binds "if it was made before the Terms that replace those were in force, and not bound if it was made after" | It decides when an agent's authority ends. |
| 6 | `spots.rs`, `rights` | G10.6: "No later version changes the rights of a filling already earned unless:" | It protects buyers against later versions by the maker. |
| 7 | `receiver.rs`, `receiver_for_payment`; `spots.rs` (fillings in a branch set aside) | G12.5: "What others relied on stands." | It decides who bears the loss when a fork is resolved against what a payer read. |
| 8 | `legs.rs`, `data` and `data_yes` | G11.6: one leg by default; a report goes beyond its leg only where every data cMIP asked says yes | It sets a default on who may read whose payments. |
| 9 | `legs.rs`, `contest` | G11.8: a contest "reaches the signers that version names, and no one else" (case 95's name) | It decides whom a complaint is addressed to. |
| 10 | `baker.rs`, `baker_inner` and `late_terms` | G14.2: "Terms made with the holder of the moment keep counting after a later transfer: it takes nothing from them" | It decides what a sale of the rights does to deals made before it. |

Ten checks. Read, each in the file and function named. Whether any of them is "definition" rather than behaviour is the sorting this list leaves to others.

---

### What tonight changes in Parts 1 and 2

Parts 1 and 2 are not edited. Where tonight's decisions change what they say:

- **Part 1, "The summary" and "The count, for the six together".** The counts are set out again below.
- **Part 1, decision 3 (A way out by default).** Withdrawn by tonight's 4. Its six new cases (3a to 3f) go, and so does its reading of 34. What it says of the act in bytes no longer applies.
- **Part 1, decision 4 (Unclear means unchecked).** For races, tonight's 3 gives different words. Its flip of 37 (not shown to unchecked) holds only under the second reading of tonight's first question; under the session's lean, 37 keeps the word not shown, as "not in force". Its A6 story ends in U not shown and O in force, not in U unchecked. Its A9 story, (4b), (4c) and (4d) are not races, and stand as written. Its (4a) is tonight's (3a).
- **Part 1, decision 8 (Where three rules live).** Point 5's "Which holder" is answered by tonight's 1, as Part 1 leaned. The flips of 101 and 102 under "current holder" go; 101 and 102 appear again under tonight's 3, for a race.
- **Part 2.** OI-147: which holder is settled by tonight's 1. OI-148 and OI-151: their "being a party is enough" half is settled by tonight's 2 (no), and verifier 2 already answers so. OI-009, OI-046, OI-070: their notes on "Decision 3" leaned on a way out that is withdrawn (tonight's 4); OI-046 weighs more without it.

### The counts, beside Part 1's

Under the session's leans:

| | Part 1 (afternoon) | Tonight | The two together, as they stand now |
|---|---|---|---|
| Vectors that would flip | 1: 37 | 4: 36, 58, 101, 102 | 4: 36, 58, 101, 102 (37's flip does not hold under tonight's lean; 37's words change) |
| Vectors that would go | 16 | none | 16, as Part 1 |
| New cases | 20 | 9 | 23: Part 1's 20 less its decision 3's six, plus tonight's nine |

Under the other readings:
- **Flips:** from Part 1's "up to 10 more", 34 goes (tonight's 4), and 101 and 102 leave decision 8 (tonight's 1). That leaves 36 (Part 1's decision 4), and 38, 39, 40, 41 and 43 (Part 1's decision 6). That is six, not seven: Part 1's list names nine cases, though its summary says ten (Read: Part 1, "The count, for the six together"). Tonight adds 37 (to shown, or to unchecked) and 31 (to shown): eight in all. Under tonight's other readings, 36, 58, 101 and 102 keep today's answers.
- **Go:** unchanged; 45, 46 and 47 under Part 1's reading (i) of decision 6.

**Which of Part 1's counts tonight changes:** its flips (37 no longer under the leans; 34, 101 and 102 no longer under other readings) and its new cases (six fewer). Its vectors that would go are unchanged.

**Counted twice, or under two decisions:**
- 36 and 37: under Part 1's decision 4 and tonight's 3; counted once here, under tonight's 3.
- 101 and 102: under Part 1's decision 8 (a reading now withdrawn) and tonight's 3; counted once, under tonight's 3.
- 110: under Part 2 (OI-151), tonight's 2 (no flip) and tonight's 3 (its words); not counted as a flip.
- (3a) is Part 1's (4a), counted once, under Part 1.
- 58: under tonight's 4, and on tonight's 5's list (item 2); counted once.

---

## Part 4. What the decisions of 18 November change, and the build list

Written by Claude, a session under the codemeister of MOR, for Nobody, allegedly, and the MOR lead. A record of work: it sets out questions and decides nothing. No text, code or vector was changed for it.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

**What this part does.** On the morning of 18 November, after the review of wave 3, Nobody, allegedly, and the MOR lead arrived at eight things (numbered 1 to 8 in wave 4's assignment, `docs/lead/assignments/2026-11-18-wave-4-common.md`, branch `claude/lead-records-2`). For each, this part asks the same five things as Parts 1 and 3. Then it adds up the counts of all four parts (B), and gathers into one list every place where verifier 2 differs from what the decisions so far say (C): the build budget's first job. To keep the numbers apart: Part 1's decisions are named as Part 1 names them (*Part 1's decision 4*), Part 3's as *tonight's 1* to *tonight's 5*, and this morning's as *the morning's 1* to *the morning's 8*. Case numbers are positions in `grammar.json`'s `cases`, from 0, as before.

**The grounds.** Every claim carries one: **Run** (a command, and the case), **Read** (a file and its lines, or a rule), **Inferred** (this session's reasoning, with what would confirm it). What verifier 2 answers today is Run: `cargo test -p mor-core --locked` passes (570 tests, none failed); `cargo run -q -p mor-core --example gen_vectors --locked` writes the vectors again and `git diff --exit-code core/vectors` shows nothing moved; `python3 core/vectors/agreements_new_grammar_check.py` prints "grammar.json: 115 of 120 cases judged again, and agree", and the five it does not judge are 58, 59, 71, 74 and 91 (Run). What *would* change cannot be run, since no code changes. Every file and function named below was checked to exist (Run: `grep -n "fn "` over `core/src/agreements_new/grammar/`). Where an answer about bytes no vector holds is given as "today", it is Read or Inferred, never Run.

**A few words used below.** A **race** is two acts that decide something together where nothing shows which came first: neither names the other, and no place or other anchoring orders them. A **withdrawal** is a counter signature (the earlier sheets' word). A **power** is an entry of `powers` in Terms: it lets someone make acts of one kind for someone else, when its rule (a cMIP, task K3) says yes. **Dana** is always the third person who holds the acts and asks a verifier.

### The morning, in one table

| The morning's | Flips, under the session's leans | Flips under other readings | Go | New cases |
|---|---|---|---|---|
| 1. Delegation is a leftover | 59 (not shown to shown) | none (59 goes instead) | 58 | 3 |
| 2. What a race stops | 36 (already counted in Part 3; now settled) | none in the vectors | none | 1 |
| 3. Leaving is an update | none | none | none | 2 |
| 4. A power given binds its giver | none | none | none | 1 |
| 5. Earned rights leave the grammar | none | none | 74 | 2 |
| 6. No exception for a sale | 101, 102 (already counted in Part 3; now settled) | none | none | 2 |
| 7. Built on top, as a test | none (a list, set against Part 3's) | | | |
| 8. Seeing and being told | none | none | none | 1 |

---

### A. The eight decisions

#### The morning's 1. Delegation is a leftover

**In plain words.** Draft 25 has a special kind of Terms, a "delegation": Ana gives Gil a power to act for her, and by default Ana can end it alone, without Gil (G5.5). The decision takes the special kind out. Acting for someone is just Terms with a power; when the power ends is for the power's own rule to say; ending the Terms themselves is an ordinary update. In verifier 2, one case tests Ana ending it alone (58): it goes. One case is built on that ending (59): its answer would flip.

1. **His words**, in order: "One thing about delegation… it was first created to solve an « employment » situation for the old collectives, and to have agents act on your behalf. The question is: do we still need it, or are these functionalities something the agreement layer builds"; "How does the person give the power away? To assume that there is no way out is to assume a very specific shape for the cMIp"; "I think it's best. It's a leftover of the old ways".
   **Arrived at (to check):** "delegation is not a concept of its own. Acting for someone is Terms with a power; when the power ends is for the power's own rule, the cMIP it names, to answer. G5.5's default, and the word "delegation" as a grammar term, go."
   Where it says more than his words:
   - "when the power ends is for the power's own rule, the cMIP it names, to answer" is the MOR lead's answer to his second question ("by signing Terms whose powers entry names a rule, a cMIP, which can answer "yes, until the delegator says stop""); his "I think it's best" took it.
   - "the word "delegation" as a grammar term" is the MOR lead's; his words name "delegation" as a thing of the old ways, not a word in the text.
   - The line names only G5.5. Draft 25 leans on G5.5 elsewhere: G4.8(f), G4.11(e)'s last sentence ("For a delegation, G5.5 says what the default asks."), G12.1 ("for a version that ends or narrows a delegation, as G5.5 says"), G5.7(a), and K1's row (the body's reading gives, "for a delegation, that it is one, who delegates to whom, and what conditions it puts on ending (G5.5)"). The line does not say whether G5.4 (an act made under a power after the Terms that gave it were replaced) stays. That is point 5.

2. **A story.** Ana and Gil sign Terms D, which give Gil a power to assent for Ana. Later Ana alone signs D2: the same Terms without the power. Then Gil assents for Ana to Terms Y with Ben, and his act names Ana's assent to D2, so it came after it.
   - Today Dana is shown: D2 **valid**, and it replaces D (case 58, Run). Gil's later assent does **not** bind Ana: not shown (case 59, Run).
   - Under the decision Dana would be shown: D2 **not shown** as replacing D, since by default an update needs everyone who signed the original, Gil included (G4.8(c), G4.11(e)). D stays in force, so Gil's assent for Ana under D **binds** Ana: shown (Inferred: `force.rs`, `in_force_for_power`, line 162, answers yes where the Terms that give the power are the last version; a run of 59's acts on the changed code would confirm). To end Gil's power alone, Ana needs Terms whose power's rule says yes until she says stop, or an update condition that lets her.

3. **Cases and vectors.**
   - Go: 58, "a delegation ended by the delegator alone: a version that removes the power, with the delegator's part alone, is valid by default": its rule, G5.5's default, leaves the grammar. Its bytes, read by G4.11(e), would answer **not shown** (Inferred). Part 3 counted 58 as a flip (valid to not shown); it moves to "go".
   - Flip: 59, "an act made under a power after the Terms that gave it were replaced: not bound": **not shown** to **shown**, as story 2 says (Inferred). Its rule, G5.4, stays under the session's lean (point 5); to keep testing it, its acts would need Gil's assent to D2 too. Neither 58 nor 59 is judged by the independent Python check (Run).
   - Stay: 55, "bound through a power: the act's `for` names them, its `under` Terms that bind them, in force, whose power's rule says yes", 56 and 57 (Run: their answers name no delegation).
   - One more answer that goes, with no vector: where Terms carry powers and the verifier cannot read their body, an update lacking a signature is **unchecked** today ("whether a version that lacks signatures replaces them is **unchecked** (G9), not **not shown**", G5.5); without G5.5 it is **not shown**, as any update lacking a signature (G4.8(c)). Read: `force.rs`, `delegation_end`, line 623. Run: no answer in `grammar.json` carries that reason.
   - The code each answer comes from: `force.rs`, `update_raw` (lines 578 to 585, the G5.5 branch), `delegation_end` (lines 616 to 651), `then_in_force` (lines 602 to 611, its `delegation` flag); `sockets.rs`, `Delegation`, `Ending`, and `BodyReading`'s `delegation`; `stubs.rs`, the K1 stub's delegation parameters (lines 86 to 97). Read.

4. **New cases:**
   - (1a) A power that ends by its own rule: Terms give Gil a power to assent for Ana whose rule (a K3 stub) answers yes until Ana signs a Statement saying stop; Gil's assent after it does not bind Ana. Verifier 2 already hands the power's rule the acts held (`force.rs`, `power`, line 105), so this needs no new code (Inferred; the case would confirm).
   - (1b) 58's acts with no G5.5: D2, Ana's part alone, is not shown as replacing D.
   - (1c) Terms that carry powers, whose body the verifier cannot read, and an update lacking a signature: not shown (today unchecked).

5. **Where it can be read two ways.**
   - **Does G5.4 stay?** The words: "when the power ends is for the power's own rule". (i) G5.4 stays: an act made under Terms later replaced binds if it was made before the replacement was in force; the power's rule answers everything else. (ii) G5.4 goes too: only the power's rule says when a power ends. A verifier's answer changes: under (ii), an act made before the replacement, held after it, has no rule left that says it binds (G5.1(b) asks for Terms "which are in force"), and 59 goes rather than flips. **The session's lean:** (i), since G5.7 ("No act of the grantor, and no act of anyone else, sets aside, voids or undoes an act made under its grant") rests on G5.4. A question.
   - **How the power's rule hears a stop.** (i) The K3 rule reads the acts held, as today, and a stop is any act it names; nothing new in the bytes. (ii) A kind or field for stopping a power. The bytes change only under (ii). **The session's lean:** (i), as his "C is not needed" put it for leaving.

#### The morning's 2. What a race stops

**In plain words.** When two acts decide something together and nothing orders them, the change fails and things stay as they were: an update does not replace the old version; Terms do not come into force. The verifier answers "not shown" for what would have changed, and whoever wants the change makes it again, in an order that can be told. This settles two of the questions Part 3 left (tonight's 3, first and second). Verifier 2 already answers this way for forks and for case 59. It differs on three races: a withdrawal that races the Terms' completion (36), a withdrawn signer when an update is made (A6), and two withdrawals of one assent (A12).

1. **His words:** "Agreed, Carla is the monkey wrench that gets it all stuck". The MOR lead's option (a), which he agreed to: "(a) the coming into force fails and the state before both stays, so Carla's withdrawal stands and whoever wants the deal signs again, clearly after".
   **Arrived at (to check):** "in a race, the change of state fails and the earlier state stays: an update does not replace the old version; Terms do not come into force. A verifier answers "not shown" for what would have changed. Whoever wants the change makes it again, in an order that can be told."
   Where it says more than his words:
   - "A verifier answers "not shown"" is the MOR lead's; his words give no answer word.
   - His "gets it all stuck" can be read wider than the line: everything the race touches stops, not only the change that raced (point 5, reading (iii)).
   - The line drops "so Carla's withdrawal stands", which was in the option he agreed to. It follows from "the earlier state stays" only if the withdrawal is not itself the change that fails (point 5).

2. **A story** (cases 36 and 37). Terms T name Ana and Ben; both must assent. Ana assents, then withdraws; Ben assents; neither Ana's withdrawal nor Ben's assent names the other.
   - Today Dana is shown: whether T are in force, **not shown** ("not in force: whether the Terms are in force is not shown: citing gives no order between the counter signature and the Terms coming into force (G4.10)", case 37, Run); Ana's withdrawal, **not shown** (case 36, Run).
   - Under the decision Dana would be shown: T **not shown**, not yet in force, because of the race; Ana's withdrawal **shown**: it stands, and her assent is cancelled. If Ana and Ben want T, they sign again, one naming the other.

3. **Cases and vectors: every race Part 3 named, and what each now answers.**
   - **36**, "a counter signature and a completing assent, neither naming the other: whether the Terms are in force is not shown": **not shown** to **shown** (it cancels). Part 3's lean, now what was arrived at. Read: `order.rs`, `counter_signature`, gives the word from `force.rs`, `counter_cancels`, line 437.
   - **37**, "with the counter signature's order not shown, in force is not shown": stays **not shown**; its words would say that the Terms are not in force because of a race, not "whether the Terms are in force is not shown" (Read: `force.rs`, `in_force_raw`, line 325). Its other readings (shown, unchecked) close.
   - **A6** (no vector; Part 1's (4a)). Terms O name Ana, Ben and Carla, in force with any two; all three assent; Carla withdraws, with no order against O's coming into force; Ana and Ben then sign U, which names only Ana and Ben. Today Dana is shown three things that do not fit together: O **shown** in force; Carla's assent **shown**, binding her (Read: `order.rs`, `assent`: the withdrawal's order is not shown, and the guard `Tri::NotShown(w) if inf.word != Word::Shown` lets the answer fall through to "it binds", since O is in force); and U **valid** by default without Carla (Read: `force.rs`, `signed_by`, line 481, counts only the sure assents). Under the decision, by the session's lean (point 5): Carla's withdrawal stands, her assent binds no one, O stays in force by Ana and Ben, and U is **valid**. The word about U stays; the words about Carla change. Inferred; a case would confirm.
   - **A12** (no vector). Ana's assent, withdrawn twice: once by Ana, once by Carla under a power to withdraw for her; neither withdrawal names the other. Today verifier 2 reads the one whose id sorts first (Read: `force.rs`, `first_counter_signature`, lines 374 and 375), with or without a place. Under the decision, with no place: where the two would give different answers, it is a race, the Terms' coming into force fails, and the withdrawal stands: **not shown** in force. With a place: the place orders them, and this is not a race (a translation error today, list C, T5).
   - **101, 102, 110**: Terms racing a sale. Settled by the morning's 6, below.
   - **59**: an act under a power, racing the replacement of the Terms that gave the power: already **not shown** ("citing gives no order between the act and the replacing Terms coming into force (G5.4, G13.3)", Run). It flips for another reason (the morning's 1).
   - **Forks** (17 to 21, 26, 27, 38 to 40) and the double sale (111): already "does not work" (Part 3, Run). No change.
   - **31**, a missing act, not a race: stays **unchecked** under Part 3's lean (its fifth question, still open).
   - Go: none.
   - The code: `force.rs`, `counter_cancels` (lines 400 to 438), `in_force_raw` (lines 302 to 330), `counted` (line 262: an assent whose withdrawal's order is unclear goes to `maybe`), `signed_by` (line 481), `first_counter_signature` (lines 347 to 377); `order.rs`, `assent`, `counter_signature`. Read.

4. **New cases:**
   - (2c) A race on an update: U needs Ana's and Ben's assents; Ben assents to U and withdraws, and Ana's assent to U names neither. U replaces nothing, and the old version stays. Today: not shown (Read: `force.rs`, `update_raw`, lines 586 to 596: Ben's assent is a `maybe`, no `doubt`, so the answer is not shown); the case would pin it.
   - A6 is Part 1's (4a), and A12 with no place is Part 3's (3b): counted there, once.

5. **Where it can be read two ways.**
   - **First: in A6, what fails?** The words: "the change of state fails and the earlier state stays". Two changes race there: Carla's withdrawal, and O's coming into force; but O comes into force by Ana and Ben whatever Carla did.
     - (i) Only what depends on the race fails. O's coming into force does not depend on Carla, so it stands; her withdrawal stands, as option (a) says. Carla is bound by neither O nor U; U is valid.
     - (ii) U fails, since it rests on whether Carla signed the original (Part 3's reading of A6). U is not shown; O stays.
     - (iii) Everything the race touches stops ("gets it all stuck"): O itself is not shown in force, and U replaces nothing.
     - A verifier's answer changes: yes, for U (valid, not shown, not shown) and for O (shown, shown, not shown).
     - **The session's lean:** (i), since the option he agreed to said "Carla's withdrawal stands", and under (iii) one person's withdrawal could stop Terms that never needed her. A question.
   - **Second: two withdrawals, one before and one after** (A12). Ana's own withdrawal names only her assent; Carla's, for Ana, names Ana's and Ben's assents, so it came after T came into force. (i) Ana's withdrawal still races the completion: T's coming into force fails. (ii) Carla's act shows T were complete before it, so T are in force, and Ana's withdrawal, which may have come later, is the change that fails. The answer about T changes (not shown or shown). **The session's lean:** (i), one rule for every race; Carla's act orders her own withdrawal, not Ana's. A question.
   - Part 3's fourth (a reader's own anchoring) and fifth (a missing act) questions are untouched.

#### The morning's 3. Leaving is an update

**In plain words.** There is no act for leaving. Leaving is a new version of the Terms without the leaver, passed like any update. Verifier 2 already reads it so: it has no leaving act, and nothing flips. What is left is the codemeister's fifth question: under the default (no update condition named), must the leaver sign her own leaving? The MOR lead reads yes, as the text has it; that reading has not been put to him.

1. **His words:** "An editor would say « when in doubt, leave it out »", then "B is impossible. C is not needed".
   **Arrived at (to check):** "(a), nothing added. Leaving is an ordinary update, a new version in the agreement's chain without the leaver, passed by the update condition or the exit conditions the Terms chose. The grammar has no act or word of its own for leaving."
   Where it says more than his words: "or the exit conditions the Terms chose" carries over the MOR lead's words from "No default way out"; here he spoke only of which act leaving is. Who must sign under the default is not in his words. The assignment's reading ("my reading, not yet put to him, is that it stands as the text has it, since leaving is an ordinary update (decision 3) and the leaver signs her own leaving") is the MOR lead's; this sheet treats it as a reading.

2. **A story.** Terms T name Ana, Ben and Carla, are in force, and name no update condition. Carla wants out. T2 names Ana and Ben only, and replaces T.
   - Today Dana is shown: T2 signed by Ana and Ben, **not shown** as replacing T ("by default, everyone who signed the original signs an update; no assent to it is held in the name of" Carla, as case 7, Run, says for a missing signer); signed by all three, **valid** (as case 8, Run). After it, Carla is not asked by later updates (G4.8(a): "a party that a version took out is not asked by a later update").
   - Under the decision, by the MOR lead's reading: the same.
   - Under the other reading: T2 signed by Ana and Ben is **valid**.

3. **Cases and vectors.** No flip, no case goes (the afternoon's six "way out" cases went with tonight's 4). No vector has a version that drops a party: in cases 7 and 8, v2 names both A and B (Read: `cases.rs`, `update_cases`). The code: `force.rs`, `signed_by` (lines 473 to 521), `update_raw` (lines 547 to 597). Read.

4. **New cases:**
   - (3b) T2 without Carla, signed by Ana and Ben alone: not shown (by the MOR lead's reading), valid (by the other).
   - (3c) Terms whose update condition (a K4 stub) answers valid for a version without the leaver, signed by the leaver alone: valid, the condition named. That is one of the "exit conditions the Terms chose", in bytes.
   - Part 3's (4a), the same version signed by all three, then a later update: counted there.

5. **Where it can be read two ways: the fifth question.** The words: "by default, with the others' signatures" ("No default way out", arrived at), and his "So, leaving the agreement needs the agreement of the other parties." Draft 25, G4.8(a): "each party in whose name an assent to the original counts".
   - (i) The leaver is among "everyone who signed the original": by default she signs her own leaving, and the others sign too.
   - (ii) By default only the others sign.
   - A verifier's answer changes: yes, (3b).
   - **The session's lean:** (i). The bytes cannot tell a leaving from a removal: the grammar "has no act or word of its own for leaving". Under (ii), any version that drops Carla, signed by Ana and Ben, would be valid by default whether or not Carla wanted to leave: the others could put her out without her. A reason, not a ruling; a question for him.

#### The morning's 4. A power given binds its giver

**In plain words.** If Ana gives Gil a power to act for her, what Gil does under it binds Ana, as if she had signed it; and Terms Gil signs for Ana, when she holds the baker's rights, count as her being bound. Verifier 2 already does both: an act made for Ana counts in her name only where the Terms that give the power bind Ana. Nothing flips. Below are the places where, reading the code, a power binds someone other than the one who gave it, or fails to bind the one who did.

1. **His words:** "If you grant powers via a cMIP you take on the responsibilities". The MOR lead had asked "whether Terms signed for the holder of the baker's rights by someone holding a power she gave count as her being bound".
   **Arrived at (to check):** "yes. Whoever grants a power through a cMIP is bound by what is done under it, as if by her own signature; Terms signed for the holder under a power she gave count as her being bound."
   Where it says more than his words: "as if by her own signature" is the MOR lead's. "responsibilities" can be read as more than being bound (duties the giver takes on); what those are is for cMIPs (the morning's 7). Who "grants" a power that came in by an update she did not sign is not said (point 5).

2. **A story.** Ana bakes a song. Ana and Gil sign Terms P, which give Gil a power to assent for Ana. Gil assents for Ana to Terms T with Carla, citing the bake.
   - Today Dana is shown: T **count**; Ana, the holder, is bound by an assent counted in her name (Inferred: `baker.rs`, `bound_raw`, line 144, reads `counted`, which counts an assent in the name `force.rs`, `name_of`, gives it; no vector has it, Part 3's (2b)).
   - Under the decision: the same. Part 3's question (tonight's 2, point 5, "An agent's assent") is settled toward (ii), which verifier 2 reads.

   **Where verifier 2 lets a power bind someone other than its giver.**
   - *Through an update condition* (Inferred). Terms V1 name Ana, Ben and Carla, with an update condition under which any two of the original's signers are enough; all three sign. Ana and Ben sign V2, which gives Ben a power to assent for Carla; Carla never signs V2. Ben assents for Carla to Terms Y. Today Dana is shown: Carla **bound** by Y. Read: `force.rs`, `power`, lines 89 to 94, asks whether `signed_by` of V2 contains Carla, and `signed_by`, lines 502 to 519, counts her, bound through V1. Whether Carla is one who grants that power is point 5.
   - *Through an agreement's signature.* An act made for agreement x binds every party bound by x's Terms in force, the outvoted included (Read: `order.rs`, `bound`, the `Who::Agreement` branch, through `signed_by`). That is G1.2 and G11.6(b) ("Where those Terms say that a majority decides, the majority decides"); each of them signed x's Terms, or was bound through an update of them, as above.

   **Where verifier 2 fails to bind the giver.**
   - *A fork in the giver's own line* (Read; OI-046). Ana signs P; P are in force; afterwards Ana signs a second act in P's agreement naming the same `previous` as her assent. Her assent becomes a tip and stops (`line.rs`, `stopped`; `force.rs`, `counted`, line 243), so P are not in force and `power` answers no: what Gil did for her no longer binds her. Draft 25 says "Terms that were in force before a fork was made stay in force" (G12.2). A translation error (list C, T1).
   - *An unclear withdrawal of the giver's assent to P* (Read: `counted`, line 262). Ana's assent is then a `maybe`, not counted, and the power binds no one. Under the morning's 2 (session's lean), her withdrawal stands, so that answer is the decision's.
   - *After P are replaced* (G5.4): by draft 25, and kept under the morning's 1, session's lean.

3. **Cases and vectors.** No flip; none go. 55 stays shown (Run). 110 is unchanged (the holder named, unsigned). The code: `force.rs`, `power` (lines 69 to 115), `name_of` (lines 53 to 62), `signed_by` (lines 473 to 521); `baker.rs`, `bound_raw` (lines 141 to 163); `order.rs`, `bound`. Read.

4. **New cases:**
   - (4a) The first story of a power binding someone other than its giver: a power that came in by an update Carla did not sign.
   - Part 3's (2b), the holder's assent made by an agent: counted there.

5. **Where it can be read two ways.** The words: "Whoever grants a power through a cMIP is bound by what is done under it".
   - (i) Carla granted it by signing V1, whose update condition let V2 through (as "Bound, not named" counts "her assent to an earlier version whose update condition let them through").
   - (ii) A power binds only one who assented to the Terms that give it, herself or through an agent under a power she gave.
   - A verifier's answer changes: (4a), bound or not.
   - **The session's lean:** (i), for one way of being bound throughout. A question: under (i), a majority's update can make one member act for another, and that is the kind of rule the morning's 7 sends to the update condition's cMIP.

#### The morning's 5. Earned rights leave the grammar

**In plain words.** Draft 25 protected whoever fills a spot (Carla, who brought a buyer and earned 10%): a later version could change her rights only with her own assent, or by a condition named in the version she earned under (G10.6). The decision takes that out: she is bound by the Terms' update condition like any signer, and she could read it before filling. Verifier 2's separate question about a filling's rights goes, and its case (74) with it.

1. **His words:** "Agreed" (to the MOR lead's lean (b): drop G10.6, "her protection being the update condition she could read before filling").
   **Arrived at (to check):** "(b). G10.6 goes. Whoever fills a spot is bound by the Terms' update condition like any signer; a condition that needs fillers' signatures protects them, and that is a choice of the Terms, read before filling."
   Where it says more than his words: "a condition that needs fillers' signatures protects them, and that is a choice of the Terms" is the MOR lead's framing. The line does not name what leans on G10.6: G10.5 ("keeps the rights of the version it was earned under (G10.6)"), G10.7, G12.5's filling clause ("no version of the continued line is named as a later version that changes its rights (G10.6)"), G4.11(f) and (i), and K4's row ("or, where a filling is asked about, the version it was earned under and the later version (G10.6)").

2. **A story.** Ben's offer O: whoever brings a buyer earns 10%. Carla fills the spot. O names an update condition under which Ben alone is enough. Ben signs O2: 5%.
   - Today Dana is shown: O2 replaces O, for everyone; asked for Carla's rights, a second question is put to the condition, apart (`Ask::FillingRights`), and where it answers not valid Dana is shown "the filling has exactly the rights offered by the version it was earned under", 10% (as case 74, Run, "no later version changes them").
   - Under the decision: no second question. O2 replaced O, and Carla is bound by O2 like any signer: 5%.

3. **Cases and vectors.**
   - Go: 74, "a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid" (its rule, G10.6, goes). Not judged by the Python check (Run). Part 2's OI-021 (which condition is asked about a filling's rights) goes with it.
   - Stay: 71 (G10.2), 72 and 73 (G10.5) (Run).
   - The code: `spots.rs`, `rights` (lines 99 to 134); `sockets.rs`, `Ask::FillingRights`; `stubs.rs`, the K4 stub's two `FillingRights` arms (lines 156 and 157); `questions.rs`, the `rights` question. Read.

4. **New cases:**
   - (5a) No update condition: O2 without Carla's assent is not shown as replacing O, since she signed O by filling its role (Read: `force.rs`, `signed_by`, lines 486 to 489, counts a role's filler).
   - (5b) An update condition that answers valid without Carla: Carla is bound by O2 (G5.1(c)).

5. **Where it can be read two ways.** Draft 25, G10.3: "They are bound only by their own assent (G5)."
   - (i) "their own assent (G5)" takes in G5.1(c): a filler is bound by an update her version's condition let through, as any signer; G10.3 stands.
   - (ii) A filler is bound only by her own assent: then the decision needs G10.3 said again.
   - A verifier's answer changes: (5b), bound or not. **The session's lean:** (i), as the line says "like any signer". A question.

#### The morning's 6. No exception for a sale

**In plain words.** Terms about a baked work, and a sale of the baker's rights, with nothing to order them: under the decision those Terms do not come into force, and the sale stands. Draft 25 says the opposite: such Terms "are not late", and keep counting. Verifier 2 follows draft 25, so two cases flip. One thing shapes how many: the MOR lead's framing says the two are "usually ordered, both on the holder's own line", but verifier 2 has no such order for a sale, and its vectors hold none.

1. **His words:** "The less exceptions the better". The MOR lead before it: "Terms and a sale of the baker's rights are usually ordered, both on the holder's own line; they race only when a power-holder signs Terms for her while she sells".
   **Arrived at (to check):** "the race rule applies to Terms racing a sale, with no exception: those Terms do not come into force."
   Where it says more than his words: his words are a preference ("The less exceptions the better"); the line says "no exception". "the sale stands, and whoever wants the deal signs again with the new holder" is in the MOR lead's lean and not in the line.

2. **A story.** Ana bakes a song. Ana and Carla sign Terms T, citing the bake. Ana sells the baker's rights to Ben. Nothing Dana holds orders T against the sale.
   - Today Dana is shown: T **count**, and are **in force** (cases 101 and 102, Run).
   - Under the decision: T **not shown** (they count for nothing) and **not in force**. The sale stands. Ben and Carla sign again if they want the deal.
   - If Ana's own line shows her assent to T before her sale (the MOR lead's "usually"): T count, as today. A second story, the MOR lead's own: Gil, holding Ana's power, signs T for her while she sells: T do not count.

3. **Cases and vectors.**
   - Flip: 101, "after a sale, Terms made with the holder of the moment keep counting", **shown** to **not shown**; 102, "after a sale, Terms with the holder of the moment stay in force", **shown** to **not shown**. Part 3's lean, now settled. Inferred, from the acts: in the vectors the transfer is a stand-in fingerprint (`cases.rs`, `baker_cases`: `fixed("verifier/a transfer of the baker's rights to N")`), which stands in no signer's line, so nothing orders it against K's assent. Run: in 101, 102 and 110 no act's bytes contain the transfer's fingerprint, and the cases name no place and no reader's anchoring. They flip under both readings of point 5 as the vectors stand; under reading (i), they would be rebuilt with the order, and keep their answers.
   - Words only: 110 (its Terms race the sale too; Read: `baker.rs`, `baker_inner` reads lateness, lines 95 to 105, before being bound, lines 108 to 116).
   - No change: 103 (cites the transfer, so ordered after it), 104, 105 and 106 (shown late by knots), 107 and 108 (a thief: invalid before lateness is read), 109, 111; 99, 100, 112 and 113 hold no transfer (Read: `cases.rs`, `baker_cases`).
   - The code: `baker.rs`, `late_terms` (line 235: no order shown, so "not late"); `baker_inner`; `chain.rs`, `baker_gate`. Draft 25's rule, G14.2: "Where neither the knots nor an anchoring show it, the Terms are not late, and are read by the holder at X, however late they may in fact be." What it "Protects" changes with it: "whoever agreed with the holder of the moment, and every payer under those Terms, whom a later sale does not undo". Read.

4. **New cases:**
   - (6a) The holder's own line orders her assent to T before her transfer: T count (needs the seam with Envelopes, which gives that line).
   - (6b) The MOR lead's race: an agent signs T for the holder, under her power, and nothing orders it against her sale: T do not count.
   - Part 3's (3d), a place ordering T and the sale: counted there.

5. **Where it can be read two ways: what orders Terms against a sale?** The words: "usually ordered, both on the holder's own line".
   - (i) Knots, an anchoring, and the holder's own line, which "Two threads, two owners" gave to the layer below. A sale is an act Ana signs; her assent to T is an act Ana signs; her sequence orders them. Draft 25 may already allow it: G4.7(a) reads as knots "every field that holds a fingerprint, of every act the verifier holds", and the act format's `prev` holds one. Verifier 2 does not read `prev` as a knot (Read: `held.rs`, `namings`, lists only the payload's fields).
   - (ii) Knots in the payload and an anchoring only.
   - A verifier's answer changes: under (i), Terms the holder signs herself almost never race her own sale; under (ii), every sale makes earlier unanchored Terms stop counting, unless one names the other.
   - **The session's lean:** (i), since under (ii) "Terms made with the holder of the moment keep counting" would hold only for anchored Terms. A question, and a large one: reading `prev` as a knot would order every signer's acts across agreements, and this session cannot tell, without a run, which other answers that moves.

#### The morning's 7. Built on top, as a test

**In plain words.** A general test: a rule that settles how people should behave in a deal belongs to the cMIPs built on top, not to the grammar. Part 3 listed ten checks of verifier 2 that read as settling behaviour. Below, each is set against the decisions so far.

1. **His words:** "Yes, agreement is now closer to language than protocol. It.s all about what is built on top." (to the MOR lead's question whether "What the core is for" is a general test).
   **Arrived at (to check):** "yes, a general test for Agreements: a rule that settles how people should behave in a deal belongs to the cMIPs built on top, not to the grammar."
   Where it differs: "closer to language than protocol" is not carried into the line; the test's wording is the MOR lead's question, which his "Yes" took.

2. **A story.** Ana receives for herself and Ben under Terms W, with `control` empty and a share for Ben. Today Dana is shown that W hold the Control task, so passing Ben his share is Ana's obligation (case 87, Run). Under the test, whether that obligation is the grammar's is the sorting this list leaves to others.

3. **Part 3's ten checks, against the decisions so far.**

| # | The check (file, function) | Draft 25's rule | What the decisions so far do to it |
|---|---|---|---|
| 1 | `legs.rs`, `holds_control` | G11.2, the receiver who holds for others | Not taken out. The test may reach it. |
| 2 | `force.rs`, `delegation_end` | G5.5 | **Taken out** (the morning's 1). |
| 3 | `force.rs`, `counter_cancels` | G4.10 | Stays; its race answer changes (the morning's 2, case 36). |
| 4 | `force.rs`, `in_force_given`, `update_raw` (the defaults) | G4.1, G4.8(a), G4.11(e) | Stays (an empty socket's default, section 5). The morning's 3, point 5, touches G4.8(a). |
| 5 | `force.rs`, `before_in_force` | G5.4 | Stays under the session's lean of the morning's 1; taken out under its reading (ii). |
| 6 | `spots.rs`, `rights` | G10.6 | **Taken out** (the morning's 5). |
| 7 | `receiver.rs`, `receiver_for_payment`; `spots.rs` | G12.5 | Not taken out. |
| 8 | `legs.rs`, `data`, `data_yes` | G11.6 | **In part** (the morning's 8): who may see is the data cMIP's; whether the grammar's default and its "every one asked" rule stay is the morning's 8, point 5. |
| 9 | `legs.rs`, `contest` | G11.8 | Not taken out. |
| 10 | `baker.rs`, `baker_inner`, `late_terms` | G14.2 | **In part**: its exception for Terms racing a sale goes (the morning's 6); "keep counting after a later transfer" stays for Terms ordered before it; the rule moves to Envelopes (Part 1's decision 8). |

   Taken out wholly: 2 (items 2 and 6). In part: 2 (items 8 and 10). Open under one reading: 1 (item 5). Not touched: 5 (items 1, 3, 4, 7 and 9). Read, each in the file named.
   One more the session found that reads as behaviour, not on Part 3's list: G11.8, "These grammar rules read a buyer's contest only there: where what was bought was not delivered after payment." (`legs.rs`, `contest`, with cases 96 and 97). It says what a contest is for.
   - Flip, go: none by the test alone, since it names no rule (Inferred).

4. **New cases:** none.

5. **Where it can be read two ways.** "a rule that settles how people should behave in a deal": (i) any rule whose answer turns on what someone owes or may do; (ii) only a rule that adds a duty the signers did not write. Items 1, 7 and 9 go under (i) and may stay under (ii). **The session's lean:** none; the sorting is the scribe's and Fable's.

#### The morning's 8. Seeing and being told

**In plain words.** Two things are split. That someone "must be told" is behaviour, for cMIPs; "who may see" is for the cMIP in the data socket; the grammar keeps only the socket. Verifier 2 holds no duty to tell anyone (its only "must" are what a verifier or client shows). It asks the data socket who may see, and adds two rules of its own: an empty socket means no (one leg), and where a report carries the data of people under different Terms, every one asked must say yes.

1. **His words:** "Sounds good" (to the MOR lead's lean: "must be told" is behaviour; "who may see" is the data socket's, "the grammar keeping the socket and the cMIP in it deciding who sees").
   **Arrived at (to check):** "a duty to tell is built on top, in cMIPs; who may see is decided by the cMIP in the data socket. The grammar holds only the socket."
   Where it says more than his words: "only" is the line's; the lean he answered said "keeping the socket". Whether the grammar keeps a default for an empty socket, and a rule for two sockets, is point 5.

2. **A story.** Ana pays Ben's agreement through Carla's service. Carla's leg report carries data of people under Ana's Terms (their data cMIP answers yes for Dana) and under Ben's agreement (its data cMIP answers no).
   - Today Dana is shown: **no**, she may not read it beyond its leg (Read: `legs.rs`, `data`, lines 260 to 275: every Terms asked must answer yes).
   - Under the decision: whichever data cMIP decides. Two sockets were asked; which one is "the cMIP in the data socket" is point 5.

3. **Cases and vectors.** No flip; none go under the session's lean. Stay: 89, 90, "may a reader read a leg report beyond its leg: an empty data socket: one leg", and 98 (Run). Cases 84 and 85 (who may call a silence unanswered) already go with the report block (Part 1's decision 8); counted there. No vector asks two Terms (Part 2, OI-123). The code: `legs.rs`, `data` (lines 227 to 278), `data_yes` (lines 214 to 226), `silence` (from line 182), `buyer_leg` (from line 280). Read.

4. **New cases:**
   - (8a) The story: one report, two Terms asked, one yes and one no.

5. **Where it can be read two ways.**
   - **"only the socket".** (i) The socket, with the grammar's default for an empty one (no: one leg), as section 5 gives every empty socket's default. (ii) The socket alone. Cases 90 and 98 keep the word no under both (Inferred: with nothing agreed, no path is agreed). **The session's lean:** (i).
   - **Two sockets.** (i) Every one asked must say yes (verifier 2; "that last reading is Claude's", G11.6(a)); (ii) each socket speaks for the people bound by its own Terms, and a report is read for each part as its own socket says. (8a) answers no under (i), and a split answer under (ii). **The session's lean:** none.
   - **The default call on a payment** (G11.7: "These grammar rules read every payment as carrying that call"). (i) Not a duty to tell: "The call binds only its signer, the payer: these grammar rules make no one confirm"; it stays. (ii) A duty to tell, for cMIPs. Under (ii), the buyer's leg (92 to 94) would show no call by default. **The session's lean:** (i).

---

### What this morning changes in Parts 1 to 3

Parts 1 to 3 are not edited. Where this morning's decisions change what they say:

- **Part 1, "The summary" and "The count, for the six together"**, and **Part 3, "The counts, beside Part 1's"**: the counts are set out again in B below.
- **Part 1, decision 4 (Unclear means unchecked).** Its A6 story now ends, under the session's lean of the morning's 2, in Carla's withdrawal standing and U valid, not in U unchecked. (4d), the holder's assent of unclear order, keeps today's word, not shown, for a race; unchecked stays for a doubt of another kind (a cMIP not held). A9, (4b) and (4c) stand as written.
- **Part 1, decision 8 (Where three rules live).** 101 and 102 flip, for the morning's 6.
- **Part 2.** OI-021 goes with G10.6 (the morning's 5). OI-046 now also fails to bind a giver (the morning's 4). OI-151: its "assent made for the holder under a power" half is settled by the morning's 4, as verifier 2 already reads it. OI-123: the morning's 8, point 5. OI-009: its second half, a withdrawal of unclear order, now answers as 36 does.
- **Part 3, tonight's 2.** Point 5, "An agent's assent", is settled toward (ii) (the morning's 4).
- **Part 3, tonight's 3.** Point 5's first question is settled toward (i) (the word is not shown); its second toward (i) (the coming into force fails, so 36 goes to shown and 37 keeps not shown); its third toward (i) (a sale races, the morning's 6), with a new question on what orders a sale. Its A6 story is read again above (the morning's 2, point 5, first).
- **Part 3, tonight's 4.** Point 5 is settled toward (i) (the morning's 1): 58 goes, rather than flips; 59 flips.
- **Part 3, tonight's 5.** Set against the decisions in the morning's 7.

---

### B. The running totals

Checked against the vector files with a script (Run: a Python script reads `grammar.json` and prints the name and answer word of every case number below; `grammar.json` holds 120 cases; `valid.json` and `invalid.json` are named only where Part 1 names them, and nothing here adds to them).

**Under the session's leans:**

| | Part 1 (as written) | Part 3 (as written) | Part 4 | All together, as they stand now |
|---|---|---|---|---|
| Vectors that would flip | 1: 37 | 4: 36, 58, 101, 102 | 1 new: 59 (and 36, 101, 102 settled) | **4: 36, 59, 101, 102** |
| Vectors that would go | 16 | none | 2: 58, 74 | **18**: Part 1's 16, with 58 and 74 |
| New cases | 20 | 9 | 12 | **35**: Part 1's 14 (20 less its decision 3's six), Part 3's 9, Part 4's 12 |

Part 4's twelve new cases: (1a), (1b), (1c), (2c), (3b), (3c), (4a), (5a), (5b), (6a), (6b), (8a).

**Under the other readings:**
- **Flips:** 38, 39, 40, 41, 43 (Part 1's decision 6, reading (i)), and 31 (Part 3, tonight's 3, fifth question): six. Part 3's eight lose 36 (now under the leans) and 37 (its other readings close with the morning's 2). Under the morning's 1, reading (ii), 59 goes rather than flips.
- **Go:** 45, 46 and 47 (Part 1's decision 6, reading (i)), with encoding 2's `previous` vectors as Part 1 names them; and 59 (the morning's 1, reading (ii)).
- **Under the morning's 6, reading (ii):** the same flips as under (i), as the vectors stand.
- **Answers on new cases only**, which change no count: the morning's 2 (A6, three ways), 3 ((3b)), 4 ((4a)), 5 ((5b)), 8 ((8a)).

**Counted twice, or moved between columns:**
- 58: a flip in Part 3; a vector that goes here. Counted once, as going.
- 59: listed in Part 3 as already "does not work"; a flip here; goes under the morning's 1, reading (ii). Counted once, as a flip.
- 36, 101, 102: flips in Part 3 under its leans, now settled by the morning's 2 and 6. Counted once, under Part 3.
- 37: a flip in Part 1; words only since Part 3; settled by the morning's 2. Not counted.
- 74: named in Part 2 (OI-021); goes here. Counted once.
- 110: words only, under tonight's 3 and the morning's 6; OI-151 in Part 2. Not counted.
- New cases counted once, in the part that named them first: A6 (Part 1's (4a)); A12 with no place (Part 3's (3b)) and with a place (Part 3's (3c)); an agent's assent for the holder (Part 3's (2b)); a place ordering Terms and a sale (Part 3's (3d)); a version without Carla signed by all three (Part 3's (4a)).

---

### C. The build list

Every place where verifier 2 differs from what the decisions so far say, gathered from Parts 1 to 4, `verifier-2-readings-in-human.md` (branch `claude/verifier-2-readings-wurpvj`), `verifier-2-report.md` section 3 (branch `claude/agreements-verifier-2`) and `open-items-2026-11.md` (branch `claude/research-open-items-3t05ih`). One row each. "Way out" marks a row that touches succession, a portable identity, an agreement carried elsewhere, anchored history, or a trap. "Today" is what Dana is shown by verifier 2; "should" is what draft 25 or the decision says. A new case is described in its line; a case number is a position in `grammar.json`.

Left out, because verifier 2 matches draft 25 and no decision of this stint goes against it: OI-015 (G6.1: "is **invalid**"), OI-017 (G4.11(e): "never **not valid**"), OI-018 and OI-026 (no answer changes), OI-118 (G1.4: "or an agreement is met a second time on the way, no one receives, and the answer is **not shown**"), OI-147 (tonight's 1), and Part 1's decision 6 under its lean.

#### Translation errors: the code against draft 25 where draft 25 is clear (7)

| # | Name | Code | Draft 25 | Today → should | Ground | Vector | Way out |
|---|---|---|---|---|---|---|---|
| T1 | A fork after Terms are in force takes them out of force (OI-046) | `line.rs`, `stopped`, `mark`; `force.rs`, `counted` (line 243) | G12.2: "Terms that were in force before a fork was made stay in force: Terms stop only by replacement (G4.9)." | Ana's and Ben's Terms in force; Ben later forks his own line: not in force → in force | Read; the acts Inferred | New: Ben's second act names the same `previous` as his assent and names Ana's assent in `relies_on`, so it came after the Terms came into force | **Yes**: a signer leaves alone, by forking |
| T2 | An agent cannot take back the assent it made (OI-070) | `force.rs`, `first_counter_signature` (lines 361 to 364) | G4.10: "the party itself MAY make it, in its own name, as may the agent, as that assent's signer" | Gil assents for Ana, then withdraws it before Terms are in force, with no power to withdraw: T in force → cancelled, not in force | Read; Inferred | New: that story, Carla's completing assent naming Gil's withdrawal | **Yes**, as the open-items list marks it (taking an assent back) |
| T3 | Stopping without saying unchecked (OI-036) | `force.rs`, `signed_by` (line 504, `scope.depth < 16`), `in_line_before` (line 390); `chain.rs`, `as_if_alone` (10,000 steps) | G9.2: "It MUST NOT answer **not shown** or **invalid** because it stopped." | A signer bound only through a version 17 steps back drops out of "everyone who signed the original" → unchecked, saying how far | Read; Inferred | New: a chain of 18 versions, each passed by an update condition, then a default update without the first signer | No |
| T4 | "Built on a tip" follows every field (OI-050) | `line.rs`, `stopped`; `held.rs`, `namings` | G12.2: "(it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch)" | An act whose only naming of a tip is in `resolves` (resolving nothing) or `settlement`: counts for nothing → counts. The depth matches draft 25 ("however many namings lie between") | Read; Inferred | New: Carla's Statement naming a tip of Ana's line only in `resolves` | No |
| T5 | A12 with a place: the first withdrawal by id | `force.rs`, `first_counter_signature` (lines 374, 375) | G4.10: "An assent is read against the first counter signature in the same name that follows it"; G7.2: "an act within the agreement counts for any answer about what is latest" | The one with the lower id → the one the place puts first | Read | Part 3's (3c) | **Yes**: anchored history |
| T6 | Late Terms never read the reader's anchoring | `baker.rs`, `late_terms` (lines 198 to 230 read only the Terms' `place` and `clock`; `self.reader.anchoring` is never read) | G14.2(b): "or, where it names none, the anchoring the reader accepts, with it named (G13.4)" | No place; the reader's anchoring shows the Terms after the sale: count → late, count for nothing, per anchoring | Read | New: that story | **Yes**: succession, anchored history |
| T7 | "Everyone who signed" through a version that never replaced | `force.rs`, `signed_by` (lines 502 to 519); `baker.rs`, `bound_raw` (line 150) | G4.8(a): "each party bound by the original with no assent of their own, because the update condition of the version before it answered valid for it (G5.1(c))" | Part 3's second story: T2 count, Ana "bound by them" → not shown | Read | Part 3's (2a) | **Yes**: a trap (bound by what she never let through); succession |

#### Decisions: draft 25 and the code both against his words (9)

Each moves into the translation errors once draft 25 is redrafted to say what was decided.

| # | Name | Code | Draft 25 | His words | Today → should | Ground | Vector | Way out |
|---|---|---|---|---|---|---|---|---|
| D1 | A delegator ends a power alone | `force.rs`, `update_raw` (lines 578 to 585), `delegation_end`, `then_in_force`; `sockets.rs`, `Delegation`, `Ending` | G5.5: "By default the delegator can end it at any time" | "I think it's best. It's a leftover of the old ways" | D2, Ana's part alone: valid → not shown | Run (58); Inferred | 58 (goes; its bytes would answer not shown), and 59 | **Yes**: a way out alone |
| D2 | A withdrawal racing the Terms' completion | `order.rs`, `counter_signature`; `force.rs`, `counter_cancels` (line 437) | G4.10: "**not shown** means that it is not shown as cancelling (it changes nothing, it follows no assent, or the order is not shown)" | "Agreed, Carla is the monkey wrench that gets it all stuck" | Not shown → shown (it cancels); the Terms not in force | Run (36); Inferred | 36 | **Yes**: taking an assent back before the Terms bind |
| D3 | A6: the withdrawn signer | `force.rs`, `counted` (line 262), `signed_by` (line 481); `order.rs`, `assent` | G4.10: "Otherwise whether those Terms are in force is **not shown**, and the verifier says why." | the same | Carla's assent binds her to O, and U is valid without her → her withdrawal stands, she is bound by neither, U valid (session's lean) | Read; Inferred | Part 1's (4a) | **Yes**: a trap |
| D4 | A12 with no place: the first withdrawal by id | `force.rs`, `first_counter_signature` (line 374) | G4.10: "An assent is read against the first counter signature in the same name that follows it" | the same | Shown or not shown, by id → not shown, a race | Read | Part 3's (3b) | **Yes**: a trap |
| D5 | Terms racing a sale count | `baker.rs`, `late_terms` (line 235) | G14.2: "Where neither the knots nor an anchoring show it, the Terms are not late, and are read by the holder at X, however late they may in fact be." | "The less exceptions the better" | Shown, in force → not shown, not in force | Run (101, 102); Inferred | 101 | **Yes**: succession |
| D6 | The second gate on an update | `force.rs`, `then_in_force`; `chain.rs`, `is_update`, `first_position`, `late_against` | G4.8: "Whether the replacing Terms are themselves in force is G4.1's, as draft 18 has it (G4.5; section 8.4)." | "A, agreed" | An update the condition answers valid, not in force by its own rule: not shown → valid, it replaces | Read | Part 1's (2a) | No |
| D7 | Earned rights, asked apart | `spots.rs`, `rights`; `sockets.rs`, `Ask::FillingRights` | G10.6: "No later version changes the rights of a filling already earned unless:" | "Agreed" | Carla keeps 10% where the update replaced O for everyone → 5%, as any signer | Run (74); Inferred | 74 (goes) | **Yes**: a trap, read before filling |
| D8 | The rest of G7: a place that contradicts itself, and the clock | `mod.rs`, `counts` (`PlaceSays::Contradicts`); `chain.rs`, `first_time` and lateness per clock (from line 282); `baker.rs`, `late_terms` (the clock, lines 216 to 229) | G7.2: "Where the verifier holds two answers of one place that contradict each other, it has no answer from that place: **unchecked** (G9)." | "Yes, agreed. My point was: this is simpler than what we are discussing.agreed" | Unchecked under G7.2 → G7.2's sentence gone (G9.1 most likely still unchecked); no clock read | Run (63); Inferred | 63 (goes) | **Yes**: anchored history |
| D9 | The baker's and the report block's rules, still in Agreements' verifier | `baker.rs`, `late_terms` and the envelope chain's reading; `layers.rs`, `EnvelopeChain`; `legs.rs`, `leg`, `silence` | G14.2, "Late Terms", and G11.4(b) to (d), in Agreements | "Agreed" | The same answers, from Agreements → from Envelopes and the MICS | Read | 105 (one of the 15 that go) | **Yes**: succession |

#### Readings: draft 25 can be read two ways, and verifier 2 took one (29)

"Should" is the other reading. Where a decision answers the reading, it says which; such a row moves into the translation errors once draft 25 is redrafted.

| # | Name | Code | Draft 25 | Today → the other reading | Ground | Vector | Way out |
|---|---|---|---|---|---|---|---|
| R1 | A1: a late update's answer word | `chain.rs`, `late_against`, `update_answer` | G4.7(c): "About L, a verifier answers that it replaces nothing and is no tip" | Shown (G4.7) to "is it late?" → one word for both questions | Run (29) | 29 | No |
| R2 | A2: late Terms' answer word (OI-139) | `baker.rs`, `baker_inner` (lines 95 to 101) | G14.2(c): "no new answer word." | Not shown, with "late" beside it → another word | Run (105) | 105 | No |
| R3 | A3: a place orders every two updates (OI-002) | `chain.rs`, `late_against`, `first_position` | G4.7(b) | The later of two updates under a place is late → a fork | Read | New: two updates signed in parallel under one place | **Yes**: anchored history |
| R4 | A4: which knots show an update late (OI-003) | `chain.rs`, `late_against` | G4.7(a) | One act's namings alone → several added together | Read | New: two assents whose namings together reach F | No |
| R5 | A5: which lacking act might show it late (OI-004) | `chain.rs`, `not_late`; `mod.rs`, `lacking_in` | G4.7(c) | Any act-naming fingerprint not held → a narrower set | Run (31) | 31 | No |
| R6 | A8: an agreement whose own power says no (OI-066) | `force.rs`, `power` (lines 95 to 114) | G1.2 | Not signed, even if every signer signs → signed | Read | New: that agreement, all its signers signing | No |
| R7 | A9: an act held that cannot be read (OI-014) | `held.rs`, `from_bytes` (lines 60, 61) | Silent (G6.1 speaks only of `previous`) | Counts for nothing → unchecked, as Part 1's decision 4 ("Agreed") leans | Read | Part 1's (4b) | No |
| R8 | A10: two versions by one author (OI-040) | `line.rs`, `read_lines`; `chain.rs`, `resolves` | G6.2, G12.3 | Two acts to resolve → one | Read | New: one author's two versions, one resolving act | No |
| R9 | A11: "nothing they name is lacking" (OI-140) | `baker.rs`, `baker_inner` (lines 80 to 85) | G14.3(a): "and nothing they name is lacking" | Unchecked → invalid, for some lacking acts | Read | New: a thief's Terms naming an act not held | No |
| R10 | N1: a report that names the payment itself (OI-091) | `legs.rs`, `buyer_leg` | G11.7: "and never the payment itself" | No confirmation, one side only → listed, or rejected | Read | New: that report | No |
| R11 | N2: the doer where the receiver is an agreement that is a party (OI-092) | `legs.rs`, `doer`, `holds_control` | G11.2: "Where the receiver those Terms name is not one of their own parties (another agreement, or none), no doer is shown" | No doer, no Control task → a doer | Read | New: that receiver | No |
| R12 | OI-009: "until every party has signed" | `force.rs`, `counter_cancels` (lines 429 to 432) | G4.10: "A counter signature is available only until every party has signed, which these grammar rules read as: until those Terms are in force (G4.1)." | With `in_force` asking two of three, a withdrawal after two: changes nothing → cancels | Read | New: an `in_force` stub asking two | **Yes**, as the open-items list marks it |
| R13 | OI-011, OI-068: the default for `in_force` | `force.rs`, `in_force_given` (lines 281 to 296) | G4.1, G4.4 | Every signer, no agreement → another default | Run (0, 53) | 53 | No |
| R14 | OI-022: the condition asked of a resolving update | `chain.rs`, `resolves` (line 718) | G4.11(g): "that those signatures are now the condition's answer is Claude's reading" | Asked → not asked; every signer | Read | New: condition "one of the original's signers", Carla alone resolves | No |
| R15 | OI-035: ask the place for more | `layers.rs`, `Place`; `mod.rs`, `counts` | G7.2; Part 1's decision 9 ("every reader takes what is latest from it and from nothing else", the MOR lead's sentence) | Only the acts handed → ask the place | Read | Part 1's (9b) | **Yes**: anchored history |
| R16 | OI-051: a payment naming a version further along a set-aside branch | `receiver.rs`, `receiver_rec` (lines 73, 74) | G12.5 | That version's receiver, disputed → not shown | Read | New: the version after the set-aside tip | No |
| R17 | OI-067: an agreement signing with no power, or under other Terms | `force.rs`, `power` (lines 77 to 80), `one_signing` | G1.2 | 52 shown, 54 not shown → either turns | Run (52, 54) | 54 | No |
| R18 | OI-069: a role's filler in one signing | `force.rs`, `one_signing` (line 121) | G1.2: "Its signers are the parties its own Terms name as signers." | Named signers only → fillers too | Read | New: x with a role filled | No |
| R19 | OI-095: `control` empty, a receiver who holds for others | `legs.rs`, `holds_control` | G11.2 | Holds the Control task → only with a `control` cMIP | Run (87) | 87 | No |
| R20 | OI-123: two data sockets (the morning's 8) | `legs.rs`, `data` (lines 260 to 275) | G11.6(a): "that last reading is Claude's (section 8.4)" | No unless every one says yes → each for its own people | Read | (8a) | No |
| R21 | OI-148: an update after a sale, gated by G14.3 | `chain.rs`, `is_update`, `baker_gate` | G14.3: "A verifier asked anything that rests on Terms that name an envelope" | V2 not shown, V1 stays → V2 replaces V1 where Ben is bound | Read | New: V1 citing the bake, a sale, V2 citing the sale | **Yes**: succession |
| R22 | OI-151: "before and apart from G14.3" | `baker.rs`, `bound_raw` (line 152, the gate on the Terms replaced) | G14.2: "before and apart from G14.3's answer about these Terms, which waits on it" | The replaced Terms gated → not gated | Read | New: bound through Terms replaced that cite an older act | **Yes**: succession |
| R23 | OI-152: a role in a thief's Terms | `baker.rs`, `baker_inner` (line 82, `if !named && !roles`) | G14.3(a): "and they reach that holder through no role" | Not shown → invalid, for good | Read | New: a thief's Terms with a role whose cMIP never names the holder | **Yes**: succession |
| R24 | OI-165 (b): a stolen key's act | `line.rs`, `read_lines` (void acts not read) | G6.2; "Two threads, two owners" | A fork, both stop → no fork, Ana's act counts | Read; Inferred | New: a void act naming Ana's previous act | **Yes**: a portable identity |
| R25 | The act format's `prev` as a knot (the morning's 6) | `held.rs`, `namings` (payload fields only) | G4.7(a): "every field that holds a fingerprint, of every act the verifier holds"; G13.1's list names payload fields | No order between a holder's assent and her sale → ordered by her line | Read | (6a) | **Yes**: succession, a portable identity |
| R26 | The holder's binding read as shown, not per place | `baker.rs`, `bound_raw` (`Scope::default()`, line 142); `force.rs`, `power` (line 90) | G14.2: "are read from the acts as for any Terms" | An assent the place does not show still binds → it does not, until the place shows it | Read; Inferred | New: baker Terms under a place that does not show the holder's assent | **Yes**: succession, anchored history |
| R27 | Which of Part 3's checks the test reaches (the morning's 7) | `legs.rs`, `holds_control`, `contest`; `receiver.rs`, `receiver_for_payment`; `force.rs`, `before_in_force` | G11.2, G11.8, G12.5, G5.4 | In the grammar → for cMIPs, item by item | Read | 87 | No |
| R28 | The default update and the leaver (the morning's 3) | `force.rs`, `signed_by`, `update_raw` | G4.8(a): "each party in whose name an assent to the original counts" | The leaver signs her own leaving (the MOR lead's reading, as the text has it) → only the others | Read | (3b) | **Yes**: a trap |
| R29 | A power that came in by an update (the morning's 4) | `force.rs`, `power` (lines 89 to 94), `signed_by` | G5.1(b): "its `under` names Terms by which they are bound and which are in force" | Carla bound by Ben's act for her → not bound | Read; Inferred | (4a) | **Yes**: a trap |

Totals: 45 rows: 7 translation errors, 9 decisions, 29 readings. 24 touch the way out: T1, T2, T5, T6, T7; D1 to D5, D7 to D9; R3, R12, R15, R21 to R26, R28, R29.

#### The session's order

Labelled the session's: a proposal of work, not a ruling.

1. **The way out, where the code is wrong against a clear text:** T1, T7, T6, T5, T2. A person can be trapped, or escape, today against what draft 25 already says, and no redraft is needed to fix them.
2. **The way out, where a decision is clear and draft 25 lags:** D1, D5, D2, D3, D4, D7, D8, D9. Each becomes a translation error once draft 25 says what was decided; until then the code can only follow draft 25.
3. **The way out, readings:** R25 and R28 first (each changes who is bound across a sale or a leaving), then R29, R21, R22, R23, R26, R3, R15, R24, R12. Each needs his answer before it is built.
4. **The other translation errors:** T3, T4. Wrong against a clear text, without touching the way out.
5. **The other decision:** D6.
6. **The other readings**, in the order of the clusters they sit in: R1, R2, R4, R5 (lateness), R6, R17, R18 (an agreement's signing), R7, R8, R10, R11, R13, R14, R16, R19, R20, R27.

---

## What this sheet does not settle

*17 November, evening:* Part 3 sets out what tonight's five decisions change in Parts 1 and 2, and names each section it changes; Parts 1 and 2 are left as written.

*18 November, morning:* Part 4 sets out what the morning's eight decisions change in Parts 1 to 3, and names each section it changes; Parts 1 to 3 are left as written. Its build list (C) gathers every difference found so far.

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

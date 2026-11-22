# Round two: what the verifiers answer of the round's real acts

*A record of work, not a decision. Written by a session under the codemeister of MOR (Machine, allegedly, narrow hat), 22 November 2026, from two handbacks by two sessions on the Mac of Nobody, allegedly: handback 1 (session 1, 21 November) and handback 2 (session 2, 21 November). Every reading below is a question. Every lean is the handback session's, and says so.*

The wish this serves, quoted (Nobody, allegedly, 20 November 2026, 22:53, `docs/decisions.md`, branch `claude/lead-records-2`): "Current wish: extract data, knowledge and understanding from the simulation run"

## What this is, in plain words

During round two, players made real acts: Terms, assents, Statements, posts, rotations of identity keys. Two sessions took a copy of everything the round left (the "research copy") and ran those acts through the verifiers: the programs that read an act and say whether it holds, and why. This sheet writes up what they found. It decides nothing.

**The three verifiers are one.** There are three programs that answer about Agreements acts: the kit (the tool the players used), verifier 2, and agreements-check. All three are one library, built from this branch's core at commit f1a13feb. The kit's WebAssembly is the same file in all eleven kit versions of the round, and the kit's JavaScript only passes the bytes through to it when it checks or asks. No verifier written apart from that library read these acts. So where the three agree, that is one answer, given three times, not three answers that confirm each other.

**What the four findings say, shortly.**

1. **Counting across versions.** On the rerun's 26 entries, the verifiers mostly say *unchecked*: the Terms name rules (cMIPs) the library does not hold, so the count was done by hand. Seven entries are the heart of it. In each, the maker wrote a third version of her work's Terms that names the *first* version as the one it replaces, though a second had already replaced it. Draft 25 calls that a *late update*: it replaces nothing. The count instead read the third version as the last. In the same seven, the count read the deal's *second* version, though a third, properly made, was lodged before the deadline. The money paid matches draft 25's reading, but for a reason the count did not give. The makers' "resolve" Statements healed nothing, because there was no fork to heal.
2. **"Exactly these acts".** Three players published lists of a home's acts, with hashes that did not match. The lists were honest. They differ because each counted something different, in a different order and form. No verifier is involved: lists are text posts.
3. **"Unchecked".** The work Terms of the rerun name rules no verifier holds. Even holding the two rules the count applied by hand would not be enough: each work's first version also names a third rule as its update condition.
4. **The thief's rotation.** A thief rotated a player's identity key. The rotation passes every Identity check and counts. Nothing in the bytes tells a thief's rotation from an owner's. The bytes give one answer: the rotation counts.

## Precisely

### How claims are marked

The handbacks mark each claim, and this sheet keeps their marks:

- **[counted]**: a number a script gave, from the research copy.
- **[traced]**: followed through bytes and code.
- **[inferred]**: the handback session's reading, not shown by bytes.
- **exploratory**: outside the plan the session wrote before running anything.

This session had no research copy. It could not rerun any count. What it checked is listed under "What this session checked" below: every line of code and text the handbacks cite, and every build-list row they name.

The four kinds of difference, as the handbacks name them:

- **(T) the texts read two ways**;
- **(M) the code mistranslates the text**, with the build-list row where one exists (`docs/agreements-from-scratch/review-1-impact-on-verifier.md`, Part 4, section C, branch `claude/review-1-impact-atm43s`);
- **(K) the kit's own shortfall**;
- **(H) nothing differs, and the readers counted by hand**.

### One library [traced]

- `kit/core/mor_wasm_bg.wasm` hashes `ef178a13…` in every commit that touched the kit. Handback 1 checked all eleven commits that touch `tools/postman/kit` (314a57a5 to 74739bb7, 15 to 18 November). Handback 2 checked five of them (314a57a5, 4f739e0b, 07e90a17, b7397fed, 74739bb7), and found the file committed once.
- `kit/core/BUILT-WITH.txt` says it was built from core/, wasm/, cmips/ and Cargo.lock at f1a13feb.
- The lines of `mor.mjs` that run `agreements check` and `agreements ask`, and `Kit.agreementsCheck` in `lib/kit.mjs`, are the same in every version (handback 1, hashed per commit). The kit's changes during the round (field names, the line guard, encryption keys, rotation order) act when building or signing, never when checking or asking.
- Handback 2 compared the kit's binding with its own crate `count-ask` on all 634 questions of its plan: the same answers, byte for byte once JSON keys are put in one order [counted]. Handback 1's crate `ask` builds the verifier as the binding does (`Held::from_bytes`, `stubs::all()`, `Layers::default()`, then `ask_named`; `wasm/src/agreements_new_grammar_js.rs`, `ask`).
- So the census's answers are the same whichever kit version is run.

---

### Finding 1: counting across versions (handback 2)

**Scope** (handback 2's plan, written before any verifier was run): all 26 entries of the rerun count (`hosts/count-rerun.json`: 18 counted, 8 refused), each with two agreements, the work's Terms and the receiver deal: 52 agreements. Then the buyer assents behind the count's 24 lineups. Marked exploratory in advance: the first run's forks, every `resolve` found anywhere, and a stand-in for the cMIPs the library lacks.

#### 1a. The 19 entries with one line of versions

**Acts:** records 567, 569, 601 to 610, 612, 614, 616, 626, 643, 875, 993. Work Terms: a root; the author's assent; one update naming the root in `replaces`; the author's assent to it; other signers' and buyers' assents. Deals: one version (Hop's six, and records 875 and 993), or a root and one update [counted].

| Verifier | Answer | Rule applied |
|---|---|---|
| kit, verifier 2, agreements-check (one library) | work Terms: **unchecked**: "this verifier does not hold the cMIP of K2" | G4.6, or G4.8 where the root names no `in_force`; from G9 |
| the same | Hop's six deals: **shown**, as shown and per anchoring at record 1034 | G4.6 |
| the same | straight-split deals: root established, then **unchecked** from it on | G4.1's default, G4.4; then G4.8(e) |
| the same | every signer's line: **shown**, no fork | G6.1 |
| agreements-check | every act passes | E-rules |
| the count | the update as last version; the deal's last version | by hand |

Exploratory: with the library's own defaults standing in for the missing cMIPs, verifier 2 names the same last version as the count in all 38 agreements, as shown, at record 1034 and at record 1669 [counted].

**Difference:** none in the answer. Kind **(H)**: nothing differs, and the counters counted by hand. The count says so of named signers and straight split; it does not mention the update condition, which the work Terms fill with shower work draft 12.

**One answer or two:** one, once the cMIPs are held. Today the bytes give the verifier none.

#### 1b. The seven entries refused under doubt D1

**Acts:** entries at records 571, 576, 580, 584, 595, 618, 622; authors `b1ccae2b…`, `3366ea74…`, `4189746f…`, `3f2358c2…`, `7072b61a…`, `8560636a…`, `527c6192…`. The same pattern in all seven; entry 571 written out [counted]:

The work's Terms (root `db3ce515…`):

| Record | Act | What it is | Knots |
|---|---|---|---|
| 573 | `db3ce515…` | Terms, the root; receiver: the maker | previous: none |
| 574 | `6d7a0585…` | the author's assent | previous `db3ce515…` |
| 652 | `5b9e8c91…` | Terms, second version; receiver still the maker | replaces `db3ce515…`; previous `6d7a0585…` |
| 653 | `352b6a32…` | the author's assent | previous `5b9e8c91…` |
| 818 | `bba99964…` | Terms, third version; receiver: the deal `4caec95c…` | **replaces `db3ce515…`** (the first, not the second); previous `352b6a32…` |
| 819 | `51a97fd7…` | the author's assent | previous `bba99964…` |
| not lodged, 957, 1006, 1335 | four buyers' assents | one to the root, three to `bba99964…` | |
| 1027 | `06b0f886…` | Statement, kind resolve | previous `51a97fd7…`; resolves `5b9e8c91…`, `bba99964…`; continues `bba99964…` |

The deal (root `4caec95c…`):

| Record | Act | What it is | Knots |
|---|---|---|---|
| 816, 817 | `4caec95c…`, `64c43c2d…` | Terms, the root (no `in_force`, no condition); the maker's assent | |
| 925, 926 | `0ecccbf1…`, `98234cee…` | second version: cap, fee, deadline, cap per receiver; the maker's assent | replaces `4caec95c…` |
| 962, 963 | `3aea4737…`, `bcb9aea4…` | third version: the same four **and rail and place** ("postmark-place"); the maker's assent | replaces `0ecccbf1…` |

The seven third deal versions are at records 962, 966, 968, 970, 972, 974, 976, each before the head of 1034 [counted].

**Each verifier's answer, and the rule:**

| About | Kit, verifier 2, agreements-check, as built | Exploratory: the library's defaults standing in for the three cMIPs |
|---|---|---|
| work Terms in force | **unchecked**, G4.6 (K2 not held) | with the work held as "a piece that is no act": last version `5b9e8c91…`, **shown**, G4.6 |
| the updates | **unchecked**, G4.8 (K4 not held) | `bba99964…` **late**, G4.7, as shown; the root not shown, G4.9 |
| the same, with the work not held, or given as bytes | | **unchecked**, G4.8: the second version "names an act this verifier does not hold (`eeb5cef3…`)": that act is the work itself, in `relies_on` |
| the author's line | **shown**, G6.1, no fork | |
| the author's assent to the third version | | not shown, G12.2 |
| the buyers' assents to the third version | | not shown, G4.3 |
| the deal | root established, then **unchecked**, G4.8(e) | last version `3aea4737…`, **shown**, G4.6, as shown, at 1034 and 1669; `0ecccbf1…` not shown, G4.9 |
| the resolve | "it resolves nothing, and is read as an act like any other (G12.3)" (see 1c) | |
| the count | work: last version `bba99964…`, "in force by record 819"; deal: second version, refused because it "does not name the rail or the place" | |

**The differences, each named:**

1. *The count (third version is last) against the grammar (third version is late).* `chain.rs` `late_against`, lines 235 to 245; `not_late`, lines 624 to 651. Draft 25, G4.7. Kind **(H)**: code and text agree; the counters counted by hand and took the author's newest version.
2. *Verifier 2 as built (unchecked) against the same with the work held as a piece (late).* `mod.rs` `known` (line 282) and `lacking_in` (line 292); `chain.rs` lines 246 and 298 to 306; `held.rs` lines 63 to 65; the binding's input, `wasm/src/agreements_new_grammar_js.rs` lines 63 to 80, has no field for pieces. Draft 25, G4.7(c). Kind **(T)**: build-list row **R5** ("A5: which lacking act might show it late"); and kind **(K)**: `agreements ask` cannot say a fingerprint is a work.
3. *The deal: the count stopped at the second version.* The count's own method (an assent by each signer party naming that version, `previous` well formed, no fork) is met by the third version at record 963. Handback 2 finds no line of text or code that explains stopping at the second. Kind **(H)**: the hand count read a replaced version. Whether straight split draft 7's own condition answers valid for the third version is the cMIP's to say [inferred].
4. *The resolve.* See 1c.

**What the two together give** [inferred from the count's own tables, deciding nothing]:

| Reading of the work's Terms | Reading of the deal | The seven entries |
|---|---|---|
| the count's: third version is last | the count's: second version | refused, section 6 (what was paid) |
| the count's: third version is last | the bytes': third version | pass section 6: the count's "D1, other reading" table (25 entries, 18 lineups, 1800 points) |
| draft 25, G4.7: second version in force | either | refused by ruling 1: the receiver is the maker herself (the same payout as paid) |

**One answer or two:** on the knots, **one**: the third version's `previous` names the author's assent to the second, so it came after the second was in force. Between the bytes and that answer stand the three cMIPs and the reading of R5. For the deal, **one** on the bytes (one line of three versions, each naming the one before). The verifier gives neither today.

During the round, Counterparty first told the seven makers they had forked and that a resolve was the fix, then corrected itself in public about twenty minutes before entries closed (late updates, second version in force). Pointer kept "forked, unresolved" (handback 2, from their reports). No host ruling on it is in `hosts/` or `hosts/contest/`.

#### 1c. A resolve that resolves nothing

The seven makers each lodged a Statement of kind `resolve` at records 1026 to 1032, naming their second and third versions and continuing the third. None of the seven lines is forked; one of the two acts it names is late and no tip. Verifier 2, the kit: it resolves nothing [counted]. Code and text agree on that (`line.rs` lines 59 to 104: a resolve resolves only acts grouped in its signer's line under one `previous`; `order.rs` lines 351 to 357; draft 25, section 3.2 and G12.3). Handback 2 names it: "Nothing differs". The makers followed advice later withdrawn.

**But the word it is given**, as handback 2 found it: `order.rs` line 355 falls through to `update`, which at line 121 answers **unchecked**, G4.8, "not held (G9)" for anything that is not a Terms act. A resolve Statement is held and read; it is no Terms act. So the answer is "it resolves nothing, and is read as an act like any other (G12.3): not held (G9)", with the word *unchecked*. Draft 25, G12.3: such an act "is an act like any other". The natural word would be *not shown*, with the reason.

- Kind **(M)**, a **possible** translation error. Ground: **Read, not run**: this session read the code path and confirms it; no test or vector in the repository runs this case. Handback 2 reports the words the verifier gave on the round's acts.
- Not on the build list. The nearest row, **T4** ("Built on a tip" follows every field), touches `resolves` that resolve nothing, for another answer.

Exploratory, by contrast: 13 resolves of the first run (records 534 to 558, one signer, `ddafffcd…`) do heal real forks in that signer's lines, and verifier 2 says so: **shown**, G12.3 [counted].

#### 1d. The lineups, and assents to a replaced version

- The 15 counted lineups, and Turnstile's: every buyer's assent names the version the count takes as last. Verifier 2 as built: **unchecked**, G4.3. Exploratory: **shown**, G4.3 [counted].
- The three lineups refused with the seven (voters `d32871af…`, `98c069ee…`, `d1b1b2fc…`): each voter assented twice in each of the seven, once to the root (never lodged) and once to the third version. None assented to the second, the one G4.7 leaves in force. Exploratory: both **not shown**, G4.3 [counted].
- D2, the two assents never lodged (`81374b4f…`, `b6c78860…`, to `07d6d949…`): each stands before its voter's lineup in the voter's own sequence (positions 33 and 39, before 44 and 54) [counted]. That sequence is the act format's `prev`, which `held.rs` `namings` does not read as a knot (build-list row **R25**). Under the place cut at 1669, verifier 2 still answers **shown, per anchoring** for both: `order.rs` `assent` (lines 148 to 187) never asks whether the anchoring shows the assent itself; only assents counted toward in force pass through `counts` (`force.rs` line 227). Kind **(T)**; nearest rows R25, R26, R15.
- **One answer or two** for D2: handback 2 does not say. It names two questions (Q4, Q5 below) on which it turns.

#### 1e. "In force at a deadline"

None of the 52 agreements names a place or a clock [counted]. So the answer is "as shown", or "per anchoring" where the reader accepts one (G4.6, G7.3). What ordered each act against the deadline was the place's record number against two desk answers whose times are Postmark's word; for assents the place does not show, the signer's own sequence. The verifier has no question "as of position N": `Scope.upto` exists inside (`mod.rs` lines 113 to 122) and serves only first positions. Handback 2 asked "at the head" by handing the place's record, cut at that head, as the reader's anchoring. Done that way, every agreement gives the same last version at 1034, at 1669 and with everything held [counted, exploratory].

#### 1f. The kit's own shortfalls [traced; none changes an answer the kit gave]

Kind **(K)**:
- it holds none of the round's cMIPs;
- its line guard looks at Statements only (`kit/lib/kit.mjs` lines 840 to 889, called at line 896), so nothing warned a maker that her new version named a version already replaced; in no version does the kit look at what a Terms act names in `replaces`;
- its `agreements ask` passes neither a place nor an anchoring, nor a way to say "this fingerprint is a work, not an act I lack".

Which kit signed what [inferred]: every author's assent to her own update names that update in `previous`. The guard before 74739bb7 refused that unless `"fork": true` was set. So those assents were signed with 74739bb7, or with the guard off, or with another tool; the bytes do not say which.

#### 1g. Questions that would change a verifier's answer (handback 2's; none decided)

**Q1. A new version that names a version already replaced.** Draft 25, G4.7: "L is a **late update** where the knots, or an anchoring, show that L came after O was replaced. A late update replaces nothing, and is no tip of a fork".
- (A) As written: the seven third versions are late; the second versions are in force (verifier 2's code; Counterparty's correction).
- (B) Two versions that name one version are a fork until resolved (Pointer; Counterparty's first reading).
- (C) The author's newest version on her own line is the update (the count's practice).
- *Handback 2's lean: A is what the text says and what the code does; three careful readers took three readings, and no tool tells a maker who writes `replaces` wrong.*

**Q2. Which lacking act "might be what shows L came late".** Draft 25, G4.7(c): "Where L, or an assent it needs, names an act the verifier does not hold, and that act might be what shows L came late, whether L is late is **unchecked**".
- (A) The code, build-list row R5: any fingerprint named and not held as an Agreements act, a piece or a layer's record.
- (B) Only what could carry a knot: an act the verifier does not hold at all; not an act it holds and sees is of another specification (a work, a post).
- *Handback 2's lean: B. Under A, every work whose Terms rely on the work's own act, and which ever has two versions naming one version, stays unchecked for every reader using the kit.*

**Q3. What a `resolve` Statement that resolves nothing is answered.** Draft 25, G12.3: "An act that names `resolves` and does not in fact resolve the fork it sits in (…) is an act like any other".
- (A) The code today: **unchecked**, G4.8, "not held (G9)".
- (B) **Not shown**, G12.3, with the reason (no fork in that signer's line among the acts held).
- *Handback 2's lean: B; A looks like a slip in `order.rs` (the fall-through to `update` at line 355), not a reading.*

**Q4. Is the act format's `prev` a knot, for "signed before"?** Draft 25, G13.1: "An act is read against the versions and acts it names, in any field that holds a fingerprint (`terms`, `under`, `replaces`, `previous`, `answers`, `resolves`, `relies_on`, `settlement`)."
- (A) The code, build-list row R25: payload fields only. Then nothing in the bytes puts the two unlodged assents of D2 before their voters' lineups.
- (B) The signer's own sequence orders her acts. Then the count's "used" reading of D2 is one a verifier could give.
- *Handback 2's lean: B is what the count did by hand; it is row R25's own question.*

**Q5. Does an assent the anchoring does not show count as shown, per anchoring?** Draft 25, G7.3: "Where no place is named, a verifier MUST qualify every such answer **as shown**, or **per anchoring** where the reader accepts one"; G7.2: "only once the place shows it".
- (A) The code: the assent's answer takes its qualifier from the Terms' in-force answer; the assent itself need not be shown by the anchoring.
- (B) An answer given per anchoring counts only acts that anchoring shows, the assent asked about included.
- *Handback 2's lean: B, for the same reason as R26.*

**Q6. Should a verifier answer "in force at position N"?** Draft 25, G13.3: "**Per place**, the position at which Terms came into force is the first position at which, counting only the acts the place shows at or before it, they are valid and in force".
- (A) Today: the verifier answers what is latest among what it is handed; a deadline is asked by handing it less.
- (B) "In force at position N of this place" is a question of its own, with the place and the position in the answer.
- *Handback 2's lean: B. Every count in the round needed it, and each built it by hand.*

---

### Finding 2: "exactly these acts" (handback 1; Turnstile, day 5 window 1, finding 4)

**Acts:** Until's manifest `a95af5cc…`; Turnstile's list `cd2ec44a…`; Longhouse's check `d18774fe…`. Stall's third list was not found as an act.

**Each verifier's answer** [traced]: every list is a text act. agreements-check: **NOT THIS ENCODING** (E2) for all three. Verifier 2 `act`: **unchecked** (G9: it never reaches the grammar). The kit: the same library. No verifier is involved in the difference.

**What each list holds**, checked against until-home's feed as the research copy holds it (1,643 items, arrivals 1 to 1,646), with `tools/round-2/lists.mjs` [counted]:

| List | What it holds | Order and form | Hash published | Recomputed |
|---|---|---|---|---|
| Until, `a95af5cc…` | 974 rows: every item at arrivals 1 to 975, the operator's 419 acts included; 3 sealed items by the SHA-256 of their bytes | arrival order; raw 32-byte ids end to end | `7ff66845…` | `7ff66845…` |
| Turnstile, `cd2ec44a…` | 564 ids: every act at arrivals 1 to 990 not signed by until-home's operator (`eb46d8e0…`); no sealed item; 0 missing, 0 extra | sorted by id; hex, one per line | `feba00b1…` | `feba00b1…` |
| Longhouse, `d18774fe…` (a check, not a list) | 953 arrivals; sealed items as "unreadable" | not published | none of its own; it recomputed Until's | exploratory, rebuilt: `f6a5942b…`, or `d602e198…` with sealed by byte hash |
| Stall (reports only) | arrivals 1 to 975 | Until's form | `7ff66845…` | — |

**Why the hashes differ** [traced]: selection (Turnstile left out the operator's 419 acts and the 3 sealed items), cut-off (990, 975, 953: three reads at three times), order (sorted against arrival), serialisation (hex lines against raw bytes), and sealed items (each keeper named them its own way: a sealed container has no act id).

**The difference, named:** kind **(H)**: nothing differs between verifiers; the readers counted by hand, each by its own rule. Underneath: the core has no set commitment, as all four reports say. That is no Agreements rule, and is not on the build list.

**One answer or two:** the bytes give **one answer per rule**. Until's rule over 1 to 975 rebuilds `7ff66845…` from the feed; Turnstile's rule over 1 to 990 rebuilds `feba00b1…`. Three rules, three answers.

**Questions that change a verifier's answer:** handback 1 names none for this finding.

Note: `cd2ec44a…` is in Turnstile's `acts/` only, in no home feed of the research copy [counted].

---

### Finding 3: "unchecked" (handback 1, and handback 2's 1a; the rerun count, act `e42cb8e2…`)

**Acts:** the 26 entries of `hosts/count-rerun.json`; for each, its `terms_in_force` and its `deal_version`, asked `in_force` with every act of every home feed and of the place's record held (`tools/round-2/rerun-in-force.py`) [counted]. Handback 1 calls these "26 counted entries"; handback 2 counts the same 26 as 18 counted and 8 refused.

**What the count says it did** (count-rerun.md, items 3 and 5): the work Terms name named signers draft 1 (`ed7e3956…`) in `in_force`; the deals name straight split draft 7 (`e51e8653…`). The kit holds neither, so it answers unchecked, and the counter applied them by hand. Item 5 lists six cMIPs "applied by hand, kit lacking".

| | Kit, agreements-check, verifier 2 (one code) | Rule | Exploratory: named signers and straight split held as G4.1's default |
|---|---|---|---|
| 26 work Terms (versions in force) | 26 **unchecked**: K2 (`ed7e3956…`) not held, for 22; K4 (`bf4e89e4…`) not held, for 4 (entries 610, 612, 614, 643) | G4.6, G4.8; G9 | 26 **still unchecked**, all now on K4 (`bf4e89e4…`), G4.8 |
| 26 deal versions | 6 **shown**, 20 **unchecked** (K2 `e51e8653…`) | G4.6, G4.8; G9 | 18 **shown** (12 changed from unchecked), 8 **unchecked**, all on K4: straight split is their update condition too |
| agreements-check on the 96 Terms acts involved, held together | 96 **PASS**; 44 with the note G6.1 ("previous names an act this verifier does not hold") | E-rules, G6.1 | — |

**Why the work Terms stay unchecked** [counted, traced]: in all 26 entries the version in force is a later version. Its root names shower work's spec `bf4e89e4…` in field 13, `condition` (K4; encoding 2, section 4). By G4.8, a version replaces its original only "if the update condition of the original answers valid"; the verifier lacks that cMIP, so it must answer unchecked (G4.8(h); G9.1). Holding the in-force cMIP removes the first reason and reaches the second.

**The difference, named:** between the verifiers, nothing. Between the code and the text, nothing: `force.rs` `in_force_given` (lines 271 to 279) asks the K2 socket and turns "not held" into unchecked; `mod.rs` line 197 gives the words; `force.rs` line 557 asks K4; `chain.rs` line 552 carries G4.8(e); draft 25 lines 141, 148, 235, 253 and 323 say the same. Between the code and the counter: kind **(H)**, the readers counted by hand, and for K4 may have counted without stating it [inferred: item 5 lists shower work as "body named, by spec hash only"; the day-three count applied it as "K1 body, K4 condition"].

**Build list:** R13 (the default for `in_force`, OI-011, OI-068) is the nearest row, but it is about agreements named as parties. No row covers "a cMIP that restates the default".

**One answer or two:** **one**: unchecked, from the code. Handback 1's experiment shows what holding the two in-force cMIPs would change: 12 deals, no work Terms. Handback 2's exploratory run, with the library's defaults standing in for all three cMIPs, gives the count's last version in all 38 agreements of 1a.

**Questions that change a verifier's answer** (handback 1's questions 1 and 2, numbered on here after handback 2's six; none decided):

**Q7. Shower work in `condition`.** Draft 25, G4.8: "A Terms act replaces the Terms its `replaces` names (the **original**) only if the update condition of the original answers **valid** for it".
- (a) The work Terms' later versions replace their roots only once shower work draft 12 is applied as K4. The rerun count would then rest on an unstated K4 reading.
- (b) Shower work's text gives no update condition. Its spec in field 13 is then a cMIP that cannot answer K4: still unchecked (G9), and an author's error the kit could warn of at signing.
- *Handback 1's lean: (a) for the count, as the day-three count read it; (b) is a kit shortfall worth a warning either way.* It changes the work Terms from unchecked only for a verifier that holds shower work's K4.

**Q8. A cMIP that restates the default.** Draft 25's table, `in_force`: "empty means the default of G4.1". Several windows (Ampersand, Backlot, Counterparty, DubPay) asked that a verifier treat named signers draft 1 as the default.
- (a) The text is clear: a named cMIP the verifier lacks is unchecked; an author who wants the default leaves the field empty.
- (b) A verifier may hold a cMIP by reading its text as equal to the default.
- *Handback 1's lean: (a); the kit could say, when building Terms, that naming such a cMIP makes them unchecked for every reader.* Under (b), 12 of the 20 unchecked deals become shown.

---

### Finding 4: the thief's rotation (handback 1; The Back Row, day 5 window 1; Clusters, day 4 window 3, Giuliana's case)

**Acts** [counted, traced]: identity `a0345cc4…` (Giuliana's first), run through the kit's Identity `Verifier` (the same core), holding all 8,995 Identity acts of every feed and every act this identity signed, with the kits at b7397fed and 74739bb7 (either could have been live): output identical, line for line.

| Position | Act | Type | Core's answer | Identity draft 16 rules it passes |
|---|---|---|---|---|
| 0 | `a0345cc4…` | genesis | valid | checks on every act 1 to 4; genesis checks 1 to 3; rule 1 |
| chain 1 | `8b8f333f…` | rotation, to turnstile-home only | valid, **counts** | checks on every act 1 to 4; rotation checks 1 to 5 and 7; rule 27; rule 28 (one receipt, `6d171722…`, by the operator of longhouse-home-1, the home in effect at position 0); receipt checks 1 to 3; rule 30 |
| 1 | `79ee57ce…` | encryption key | valid | everyday checks 1 to 3; rule 33 |
| 2, 3 | `acb0157e…`, `69a4e522…` | posts | valid | everyday checks 1 to 3; rule 33 |
| 4 | `a49398c0…` | post, signed with the old key after the rotation | **void** | everyday check 3, then rules 34 and 35: outside the kept ancestry; the two acts naming it (`161e54c4…`, `40756718…`) are The Back Row's warning notices under its own cMIP spec (`56dd0814…`), not acts of a type the Identity, Money or Agreements MIR defines |

The rotation keeps two tips: `69a4e522…` (Giuliana's posts line) and `ea8da89a…` (the thief's own bank payment order, in no feed, kept "by its name", rotation check 7).

**Does anything in the bytes tell the thief's rotation from the owner's?** (`tools/round-2/rotations.mjs`, over all 332 rotations of 1,749 identities in the feeds) [counted]: 247 rotations keep two tips; 326 change the homes; none carries a home rule. The one sign, found for 1 of 332: an act signed with the replaced key that follows a kept tip (`a49398c0…`). It shows the old key was used after the rotation, by a client that did not know of it. It does not say who is the owner: rule 35's note (clients track every sequence, on any device) describes the same bytes made by an owner's second device [inferred].

**Each verifier's answer:** the core's Identity verifier, as above. The Agreements verifiers are not involved. **The difference, named:** handback 1: "nothing differs" (kit, core and draft 16 agree), and the reports' reading ("valid by every rule") is what the code gives. No hand count is involved. **Build list:** R24 (OI-165 (b), a stolen key's act) is about a void act within an agreement's line; `a49398c0…` is a text post in no agreement, so R24 does not reach it [traced].

**One answer or two:** **one**: the rotation is valid and counts, and the owner's later post is void. Who made the rotation is not in the bytes.

**Question that changes a verifier's answer** (handback 1's question 3; none decided):

**Q9. The owner's post after a thief's rotation.** Identity draft 16, rule 34: "another identity acknowledged it (Envelopes; by an act of a type the Identity, Money or Agreements MIR defines, such as a witness act)".
- (a) The Back Row's warning notices are no acknowledgement, so the post is void, as the core says.
- (b) A cMIP's act that names an act is reliance; the post would be valid and disputed.
- *Handback 1's lean: (a), as the text has it.*

---

### The census (handback 1)

**The plan, as handback 1 wrote it before it ran** (quoted, its words):

> **What is counted, in which unit, over what denominator.**
>
> 1. **Feed items, per home.** Unit: one item of a home's public feed, as the relay serves it (`[arrival, kind, bytes]`, kind 0 an act, 1 a sealed container), counted once per arrival number across a home's pages. Homes: every folder under `feeds/` that holds `feed-after-N.cbor` pages; dubsar's feed (`dubsar-before-closure/relay.db`) read as a SQLite file opened immutable, so nothing is written into the research copy (this reads the database file only; any rows still in its write-ahead log are not seen, and that is said beside its counts). Postmark-place's record (`records-N.cbor`) is a place's record, no home's feed: counted in its own table, by the same unit (one record entry). Denominator: all items of that home.
> 2. **Acts by type and kind.** Unit: one kind-0 item. Type: its specification (named where it is one of the round's test spec hashes or Agreements draft 25 / the report block; otherwise "other spec", counted together) and its type number, as the kit's `describeAct` reads them; kind: public or private (the act's own flag), and sealed containers counted apart (they are not opened; no type). An item `describeAct` refuses is counted as "does not decode". Denominator: all kind-0 items of that home.
> 3. **agreements-check's answers.** Unit: one kind-0 item, checked **alone** (`agreementsNewCheck`, no content key: the kit's `agreements check FILE` on one file, and the same core code as `agreements-check`). Answers: PASS, REJECTED, INVALID, UNKNOWN, CANNOT OPEN, NOT THIS ENCODING. Denominator: all kind-0 items of that home. A second count with **all of that home's acts held together** (`agreementsNewCheckHeld`, which adds G6.1 among them) is given beside it, same denominator.
> 4. **Terms in force.** Unit: one Terms act (draft 25's spec, type 0) whose check alone is PASS or INVALID. Answer: verifier 2's `in_force` (`agreementsNewAsk`, the kit's binding: stub cMIPs only, no stand-in layers, no reader), with **every act of that home's feed held**. Counted as shown, not shown, unchecked, invalid, and anything else by its word. Denominator: the Terms acts of that home so selected.
>
> Anything counted outside this plan is marked **exploratory**.

**What was run:** `census.py` with the kit at 74739bb7; dubsar's database opened immutable, so rows only in its write-ahead log (4.2 MB) are not counted: dubsar's counts are a floor.

**Items by home and kind** [counted]

| Home | Items | Acts, public | Acts, private | Sealed |
|---|---:|---:|---:|---:|
| dubsar-before-closure | 3,185 | 3,021 | 5 | 159 |
| longhouse-home-1 | 4,809 | 4,639 | 70 | 100 |
| longhouse-home-2 | 2,767 | 2,753 | 2 | 12 |
| stall-home | 5,501 | 5,438 | 48 | 15 |
| stall-relay | 344 | 344 | 0 | 0 |
| turnstile-home | 9,816 | 9,602 | 89 | 125 |
| until-home | 1,643 | 1,640 | 0 | 3 |
| until-home-2 | 114 | 114 | 0 | 0 |
| longhouse-audit | 0 | 0 | 0 | 0 |
| postmark-place (a record, not a feed) | 1,936 | 1,936 | 0 | 0 |

Together, 28,179 feed items on eight homes, and 1,936 place records.

**Acts by specification and type** [counted] (private acts are not opened)

| Home | Text 0 | Id 0 | Id 1 | Id 2 | Id 9 | Id 3 | Env 4 | Terms | Statement | Report | Other spec | Private |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| dubsar | 1,280 | 281 | 136 | 411 | 411 | 1 | 71 | 110 | 276 | 23 | 21 | 5 |
| longhouse-home-1 | 1,741 | 433 | 132 | 704 | 704 | 2 | 237 | 144 | 405 | 81 | 56 | 70 |
| longhouse-home-2 | 472 | 384 | 130 | 637 | 637 | 2 | 237 | 36 | 140 | 48 | 30 | 2 |
| stall-home | 1,152 | 703 | 268 | 1,234 | 1,234 | 3 | 408 | 63 | 256 | 51 | 66 | 48 |
| stall-relay | 251 | 1 | 0 | 0 | 0 | 0 | 1 | 21 | 69 | 0 | 1 | 0 |
| turnstile-home | 2,587 | 1,493 | 307 | 1,750 | 1,750 | 1 | 562 | 258 | 713 | 81 | 100 | 89 |
| until-home | 191 | 226 | 195 | 394 | 394 | 1 | 202 | 6 | 22 | 5 | 4 | 0 |
| until-home-2 | 88 | 3 | 6 | 4 | 4 | 1 | 2 | 1 | 5 | 0 | 0 | 0 |
| postmark-place | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1,936 | 0 |

**By answer: agreements-check, each act alone** [counted] (with all the home's acts held, every number is the same)

| Home | Acts | PASS | REJECTED | INVALID | UNKNOWN | CANNOT OPEN | NOT THIS ENCODING |
|---|---:|---:|---:|---:|---:|---:|---:|
| dubsar | 3,026 | 409 | 0 | 0 | 0 | 5 | 2,612 |
| longhouse-home-1 | 4,709 | 630 | 0 | 0 | 0 | 70 | 4,009 |
| longhouse-home-2 | 2,755 | 224 | 0 | 0 | 0 | 2 | 2,529 |
| stall-home | 5,486 | 370 | 0 | 0 | 0 | 48 | 5,068 |
| stall-relay | 344 | 90 | 0 | 0 | 0 | 0 | 254 |
| turnstile-home | 9,691 | 1,052 | 0 | 0 | 0 | 89 | 8,550 |
| until-home | 1,640 | 33 | 0 | 0 | 0 | 0 | 1,607 |
| until-home-2 | 114 | 6 | 0 | 0 | 0 | 0 | 108 |
| postmark-place | 1,936 | 0 | 0 | 0 | 0 | 0 | 1,936 |

**By answer: Terms in force** [counted] (verifier 2, `in_force`, all the home's acts held; only that home's feed, so an assent lodged at another home is not seen and these "not shown" are home-local)

| Home | Terms | shown | not shown | unchecked | invalid |
|---|---:|---:|---:|---:|---:|
| dubsar | 110 | 56 | 2 | 52 | 0 |
| longhouse-home-1 | 144 | 44 | 19 | 81 | 0 |
| longhouse-home-2 | 36 | 4 | 11 | 21 | 0 |
| stall-home | 63 | 12 | 12 | 39 | 0 |
| stall-relay | 21 | 0 | 0 | 21 | 0 |
| turnstile-home | 258 | 65 | 26 | 167 | 0 |
| until-home | 6 | 3 | 3 | 0 | 0 |
| until-home-2 | 1 | 0 | 0 | 1 | 0 |
| **all homes** (a Terms act on several homes counts once per home) | **639** | **184** | **73** | **382** | **0** |

*Exploratory, outside the plan:* holding all of a home's acts together changed no verdict anywhere [counted].

No act anywhere is INVALID, REJECTED or UNKNOWN [counted]. Handback 1 reads this as: the kit signs nothing that fails its check [inferred]. Handback 1's plain words add that the 382 unchecked Terms are so "mostly because they name cMIPs only stubs could stand in for": the census itself does not count reasons.

This session added up every row and column of the four tables: they agree with each other (items = public + private + sealed; acts by type sum to public acts; checked acts = public + private; the in-force totals sum to 639).

---

### What this session checked

**Forbidden content.** Neither handback holds a key, signing words, a server or onion address, a port, access details, or the author's personal name. The only long hex strings are the 58 crate checksums in each `Cargo.lock`, as expected. Two departures from the form asked, neither a secret:
- Handback 1 writes two *list hashes* (not act ids) as 8 characters, "…", and their last 4 characters (`7ff66845…b3f3`, `feba00b1…e303`). This sheet gives 8 characters only.
- Handback 2 quotes several sentences of 15 words or more. All are draft 25's text or the verifier's own words, which are in this repository; none is an excerpt of a player's act.

**Code** (verifier 2, `core/src/agreements_new/grammar/`, at f1a13feb). Every cited line exists and says what the handbacks say, with these nuances:
- `force.rs` line 278 (handback 2) is where "not held" becomes unchecked (`Err(w) => Tri::Unchecked(w)`); the words "this verifier does not hold the cMIP of …" are at `mod.rs` line 197. Handback 1 cites both.
- `held.rs` lines 63 to 65: an act of another specification is put in the "rejected" set, not literally dropped; `known` (`mod.rs` line 282) does not look there, so it counts as lacking. The effect is as handback 2 says.
- `mod.rs` lines 113 to 122, `Scope.upto`: handback 2 says it is used "for lateness and counter signatures only". It is used by the first-position functions: `chain.rs` `first_position` (line 209, for lateness and, through `force.rs` `before_in_force` line 195, for what came before Terms were in force) and `force.rs` `first_position_in_force` (line 457, for counter signatures). No question exposes it, as handback 2 says.
- `wasm/src/agreements_new_grammar_js.rs` lines 63 to 80 (the binding's input): it has fields for an anchoring and places, and none for pieces. So "no field for pieces" holds of the binding; "passes neither a place nor an anchoring" is about the kit's JavaScript, which this session did not read.
- `order.rs` lines 121, 148 to 187, 351 to 357; `chain.rs` lines 235 to 245, 246, 298 to 306, 552, 624 to 651; `force.rs` lines 227, 271 to 279, 557; `line.rs` lines 59 to 104; `held.rs` `namings` (payload fields only): all as cited.

**Text.** Draft 25 (branch `claude/agreements-clean-1-hahuwn`) lines 141, 148, 235, 253, 323 are as handback 1 cites. Every sentence handback 2 quotes from G4.7, G4.7(c), G12.3, section 3.2, G13.1, G7.2, G7.3 and G13.3 is in draft 25 word for word. Encoding 2, section 4: field 6 is `in_force` (K2), field 13 `condition` (K4), field 14 `control` (K6), as cited. Identity draft 16 (main): rules 1, 27, 28, 30, 33, 34, 35, the checks on every act, the everyday checks, the rotation checks (check 7 keeps a tip "by its name") and the receipt checks are as cited; rule 34's sentence and rule 35's note are as quoted.

**Build-list rows.** R5, R13, R15, R24, R25, R26 and T4 are the rows the handbacks say they are (names and code as described).

**Not checked here:** the kit's files (`kit/lib/kit.mjs` lines 840 to 889 and 896, `mor.mjs`, `BUILT-WITH.txt`, the WebAssembly's hash): the kit is not among what this session was given to read. Every count: this session has no research copy.

### What this sheet does not settle

From the handbacks:
- **Why the count read the seven deals' second versions.** Its text and JSON give the second as "in force" and do not mention the third (handback 2).
- **What the cMIPs would answer.** No session applied any of them. The exploratory runs use the grammar's own defaults in their place; for multi-owner works the default could answer differently from the cMIP (handback 2). What shower work draft 12 says as an update condition, and so whether holding it would make the work Terms shown (handback 1).
- **Which "five" cMIPs** the brief of finding 3 meant: the count names six applied by hand and two in `in_force` (handback 1).
- **When each act was signed, and so which kit signed it**; when 74739bb7 reached the players. For every act run, it makes no difference to the answer (both handbacks).
- **Whether each "in force by record N"** the count gives is the first position at which the verifier finds the version in force: last versions were compared, not first positions (handback 2).
- **The count's doubts D3 to D7** (about what the cMIP texts ask) were not tested; the first run's count was not rerun (handback 2).
- **Whether the place's record is whole and unforked.** One record repeats at a page boundary (position 500); one was kept (handback 2).
- **What Counterparty saw** as a fork in entry 571's author's line: the acts show none (handback 2).
- **Dubsar's last rows**: its write-ahead log was not read; its counts are a floor (handback 1).
- **Longhouse's own list, and Stall's three lists**, as bytes: not found as acts; their forms are from the reports. Turnstile's `cd2ec44a…` is in no feed (handback 1).
- **Acts sent only to the bank** (the thief's orders): only their ids, in the postman's log; the payment as an act is not checked (handback 1).
- The census's "in force" holds one home at a time (handback 1).
- **Something wrote to the research copy.** As handback 1 records it: `feeds/dubsar-before-closure/relay.db-shm` was modified on 21 November at 09:27, thirteen minutes after the census ended and when nothing of that session had it open. `relay.db` and `relay.db-wal` were unchanged since 20 November, 22:40. Handback 1 infers that another process has that database open, and did not look further. A shared-memory index being rewritten does not change the rows, but the copy is no longer strictly read-only.

From this session's checks:
- The kit citations and every count are carried as the handbacks give them, unchecked here (see above).
- The two handbacks describe the 26 entries differently: handback 1 as "26 counted entries", handback 2 as 18 counted and 8 refused. It reads as a difference of wording; this session cannot check it.
- In the census, the Id 2 and Id 9 columns are equal on every home. Neither handback says why.
- `Scope.upto` is used a little more widely than handback 2 says (above); its conclusion (no question exposes it) holds.
- Both crates' tests read the vectors from the Mac's `v2/` checkout by path; that line was not changed (see the tools' README). As committed, they fail on a fresh checkout unless the vectors are reachable there.
- Two scripts (`text.mjs`, `find-acts.mjs`) print words of public texts to the terminal, for reading. They write nothing, but they print more than counts and answers.

### The tools

The scripts and programs both handbacks used are in `tools/round-2/`, as handed back, with a README. Only one line was changed in each Rust crate: the path to mor-core.

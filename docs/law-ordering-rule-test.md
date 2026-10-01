# Testing one ordering rule for collectives

*1 October 2026. Roadmap: the Law redraft row, "test a single root rule suggested by the project lead". Branch `claude/law-ordering-test-buw632`, made from `claude/law-draft-7`; Law draft 7, core v18 and freeze suite v18 are unchanged. Read against Law draft 7 (with flaws I to L and Q29 to Q32 at its end), Identity draft 10 (sequences, rotations, kept tips), Envelope draft 6, freeze suite v18 and F103 to F107 with every answer under F103. The simulation is `harness/ordering/` (crate `mor-ordering-sim`). Nothing here is decided: every choice is listed in section 5, with options and a lean, for Nobody, allegedly.*

## In plain words

The hypothesis: flaws E to L, Q23, Q28 and Q30 share one cause. Each asks whether something a member did came before or after something the collective went through (a resignation, a stepping down, a freeze, a declaration of absence, a record), and answers it by looking at the member's own sequences: their phone, their laptop, their tablet. Members keep as many sequences as they like, forget some, and nobody else can see them all. So every patch so far asked "which of the member's lines did this act name?", and each patch opened the next gap.

The proposed rule looks somewhere else: at the collective's own sequence, which every member signed up to and every verifier can follow. Something done in the collective's name is before or after an event depending on where it sits in the collective's own line, never in a member's line.

The result, in short:

- **The rule holds.** Replayed under it, the harm of every flaw from E to L, and of Q23, Q28 and Q30, does not happen, and the good outcomes hold: a completed clone stays complete, a paid publication stays paid, a buyer the collective acknowledged or paid is protected, a treasurer's year of receipts survives a declaration of absence. Over 20,000 random worlds (862,000 acts), the simulation found no wrong answer.
- **It replaces** most of draft 7's "Made before, made after" section: the personal kept tips in resignations, the keeper and record exceptions written for members' signatures, flaw G's acknowledgement rule, flaw H's "last act known to precede the freeze", and the fixes leaned for flaws I to L and Q30.
- **It must add** a few things (section 4): the collective draws a line for a departure in its own sequence; a record names the signatures that complete its clone; two lines that do not name each other are concurrent, and records on them are a fork of the agreement; deals are settled by what the collective itself acknowledged, paid or imported.
- **It breaks in one place**: a member's own key rotation still judges that member's signatures through Identity, by the member's personal sequences, so a treasurer who forgets their tablet at their own rotation un-signs the receipts they signed from it. The rule as stated does not reach this; extending it is a choice (C5).
- **Building it found two problems in draft 7 as written** (section 3.6): a record can be completed late by a signature that arrives after it, and then knock a later record out of force; and because a record "counts as acknowledging" every signature on its clone, it lets a member who already left sign a clone and have it counted.

## 1. The rule, exactly

**Before and after, for a collective.** For anything done in a collective's name, whether it counts as made before or after an event that changes who may act for the collective (a member's resignation or stepping down, a declaration of absence, the freeze of an area, a record, a rotation) is judged only on the collective's own sequences, never on a member's personal sequences. Such an event takes effect for the collective at a **line**: an act of the collective, in its own sequence, that names the event and names the latest act of every other sequence the collective keeps (a record, a rotation, or a record registering departures, addition A1). An act of the collective counts as made before a line when it lies in the line's own sequence before it, or in the ancestry of a tip the line names, proved by position and running summary as for a rotation's kept ancestry; every other act of the collective counts as made after it. An act of another identity done in the collective's name (a member's signature, a grantee's deal) is placed on the collective's sequence by the acts of the collective that name it (in `acks`, `objects` or `refs`, a record naming it among the signatures that complete its clone, a receipt naming a deal) and, for a member's signature, by the act of the collective it signs; it counts as made before a line when one of those acts does, and as made after it otherwise. A member's voice remains for an act of the collective made before the line registering that member's departure, and for any signature of theirs placed before it; for everything after it, it is gone.

*It applies, inside collectives, Envelope's own principle: "Every 'before' in the core is judged inside one named chain, by reference to a specific act" (Envelope, Chains, rule 3). Draft 7 judged a collective's events inside each member's chains; the rule judges them inside the collective's.*

### What it would replace in Law draft 7

| Draft 7 text | Under the rule |
| --- | --- |
| Resignation field 2: the latest act of every other sequence the member keeps (Flaw E) | Dropped. The member's sequences are never consulted. |
| "Made before, made after": an act of the signer counts as made before when it precedes the resignation in its own sequence or in the ancestry of a tip it names | Replaced by the rule: the collective's line, not the member's. |
| The same section: a keeper named by an agreement the act's `objects` names places a member's act before the resignation (Flaws F, G, J) | Not needed for members' signatures. The collective's keepers remain only for the collective's own acts a line left out (A3, a choice). |
| The record or rotation that puts a clone in force "counts as acknowledging every signature act naming that clone by a party its mark names" (Flaw F) | Replaced by A2: the record names the signature acts it puts in force. |
| An acknowledgement by any other identity keeps the act visible and has no effect (Flaw G) | Becomes automatic: only the collective's own acts place anything. The sentence can stay as commentary. |
| "A declaration removing a voice draws its line the same way" (Q28) and its two exceptions | Replaced: a declaration takes effect at the collective's line (A1), like a resignation. |
| Rule 44d's two bolded exceptions (a departed party counting through an early signature; a declared party counting through a keeper's or record's placement) | One sentence: a departed party counts, for a clone or act, through a signature placed before the line registering its departure. |
| Rule 37b: "the grantee's acts on the branch after the last one known to precede the freeze are undetermined"; Q30's keeper placement | Replaced by A6: the collective's own acknowledgement, payment or import binds a deal wherever it sits; every other deal of an ended grant awaits the refit. |
| Rule 37b: "acts under it while it stood ended still count for nothing" (marked Flaw I) | Dropped: a reinstatement takes on the deals not already placed (Flaw I, option 1). |
| Rule 40 and rule 42's "recorded it before the seal act" (marked Flaw K) | Rule 42 reads "recorded it" (Flaw K, option 2); the seal's place on the branch is no longer needed (C6). |
| Flaw L's lean (the rotation's kept tips) | Kept in spirit, by A1's quicker line. |
| Rule 37c's ordering of the collective's acts against records | Unchanged: it was already judged on the collective's sequence. |

## 2. Each flaw replayed under the rule alone

*Each story is replayed with the rule of section 1 and without draft 7's patches. "Harm" is what the flaw found; "good outcome" is what draft 7's patches were written to protect. Each is also a test in `harness/ordering/tests/stories.rs`.*

| Flaw | Story | Harm under the rule? | Good outcome holds? |
| --- | --- | --- | --- |
| **E** | A member with a phone, a laptop and a tablet resigns from the laptop; "after" is undefined across their lines | **No.** After means after the collective's line; the member's lines are not read. A signature on an act the collective made after its line counts for nothing, whatever device it came from | Yes. *One residue: under option α a member who left can still complete an act the collective signed before its line (C1).* |
| **F** | The resignation forgets the tablet: a clone signed from it falls back to a draft; a paid publication is un-signed | **No.** The clone was recorded, and the publication made, before the collective's line: both stay. The tablet is never consulted | Yes: a completed clone stays complete, a paid publication stays paid. *Only if the collective's own line leaves out the fork holding the record or the publication can it be lost (section 3.1).* |
| **G** | A friend acknowledges a signature made from a phone left out on purpose, after leaving | **No.** Acknowledgements by others place nothing; only the collective's own acts place. Checked: removing every friend's acknowledgement changes no verdict | Yes |
| **H** | A freeze names no act of a grant's branch: which deals came before it? | **No.** The branch is never ordered. A deal the collective acknowledged, paid on or imported binds; every other deal of an ended grant awaits the refit (A6) | Yes: a buyer the collective acknowledged or paid is protected. *A buyer who only had a keeper record the deal (freeze suite 3.7m, deal A) waits for the refit instead of standing at once; the end result is the same as draft 7's (after a seal it needs an import).* |
| **I** | A reinstatement draws no line on the branch | **No.** Nothing needs the line: a reinstatement takes on every deal not already placed (option 1, without a new rule); a deal the collective placed during the freeze binds anyway | Yes |
| **J** | A keeper can only place acts naming an agreement, so no signature on a receipt or publication can be protected | **No.** A signature on an act of the collective is placed by that act's own place in the collective's sequence: no keeper needed | Yes |
| **K** | A revocation names none of the collective's other sequences | **No.** What the collective acknowledged or paid on binds wherever it sits (option 2); the seal need not be placed | Yes |
| **L** | A treasurer declared absent takes back a year of receipts | **No.** Every receipt made before the collective's line keeps the treasurer's signature. Simulated: draft 7 as written loses the whole year; the rule keeps it, and refuses a receipt made after the line | Yes |
| **Q23** | A member signs, then resigns; does the signature still count? | **No harm.** It counts when placed before the line: the record putting the clone in force came first, or the collective acknowledged the signature first | Yes, with a reading: "made before leaving" becomes "placed before the collective's line". *Where the collective never acknowledged it in time, the leaver no longer counts; under two of three, A's early signature and B's then do not suffice, B and C are needed (C2).* Never lowered, as decided |
| **Q28** | A declaration must never undo a clone recorded before it | **No.** The record is before the line | Yes. An unrecorded, unacknowledged signature of the absent member no longer counts (as freeze step 3.7k says) |
| **Q30** | What places a grantee's act before a freeze? | **The question disappears.** Nothing needs to: the collective's own acknowledgement, payment or import binds; the rest awaits the refit | Yes |

## 3. Attacks

### 3.1 Forks of the collective's own sequence

*Two members, or two groups of a threshold key, sign for the collective at once from two devices: two acts name the same previous act, or the collective keeps two lines.*

A line names the latest act of every sequence the collective keeps, every fork branch included, exactly as a rotation's kept tips do. An act on a branch the line names (or before its tip) is before; anything else is after.

- **Honest drafting** (every branch named): the structure gives exactly the real-time answer. Simulated over 10,939 worlds with complete tips: no difference on any act, record, deal or signature.
- **A branch left out, by mistake or on purpose**: its acts count as made after the line. Two consequences:
  - An act that needed the departed member's signature is lost (simulated: 206 acts and records over the runs with incomplete tips). The cost falls on the collective, whose line it was, and on whoever relied on the act. *This is the same power the collective's key holders already have at a rotation, which can leave out a branch and void what is on it (Identity rules 15 to 17); the rule gives them nothing new in kind.*
  - An act that the departed member's voice made harder to pass now counts with the voices that remain (flaw C). Simulated: 325 acts. Each counts as if made after the line, which its signers could have done anyway; no signature was ever counted that real time placed after its signer's line.
- **Backdating** (the key holders, after the line, fork from an act before it, to slip in a receipt the departed treasurer signs): impossible. A fork made after the line is in no tip it names. Simulated: 65,585 backdated forks, none counted with a departed voice.
- **Must add:** A4 (concurrent lines, records on them are a fork of the agreement). **Optional:** A3, the collective's keepers, against honest omissions (C4).

### 3.2 Offline signing

*A device of the collective signs while offline; another draws a line without having heard of it.* This is a branch left out (3.1): the offline acts count as made after the line. Simulated with devices lagging up to eight steps (5,474 worlds): the losses above, no wrong answer. A member signing offline is invisible to the rule: their signature is placed by the collective's act it signs, whenever it reaches anyone. **Must add:** client conformance, as for rotations: the collective's devices share their tips before a line, and a client warns before drawing one with a device not heard from.

### 3.3 A collective keeping several sequences

The same as 3.1: lines name every sequence. **Must add:** nothing beyond A1's tips. Stated cost: a line drawn without knowing a sequence pushes its acts after.

### 3.4 Rotations

- **The collective's rotation** is already a line: it names kept tips (Identity). It registers what its declared clone does (members, areas), and voids old-key acts outside its kept ancestry, as for every identity. Consistent with the rule; nothing to add. *Not simulated: the generator treats a refit as a line, without Identity's voiding.*
- **A member's own rotation: where the rule breaks.** A member's signature is still an act of that member, judged by Identity. If the treasurer rotates their own key and forgets the tablet, every signature from the tablet is void, or disputed if acknowledged, and disputed confers nothing (Law rule 5). The receipts it completed stop counting: flaw L's harm, through the treasurer's own rotation, decided by a personal sequence. Simulated: 21 worlds where something that counted stopped counting this way, under the rule. The rule as stated does not reach it, because the member's rotation is not an event the collective draws a line for. **Choice C5.**

### 3.5 Keepers for deals with outsiders

- A deal the collective itself signs (its signature act, completed by its holders') is an act of the collective: placed by its own position. No keeper needed against a member's departure.
- A deal a grantee signs under a grant: placed only by the collective's acknowledgement, payment or import (A6). A keeper's record of it does not place it. Draft 7 let a keeper place it (3.7m, deal A); under the rule, deal A waits for the refit, then binds if reinstated, and needs an import if sealed, which is where draft 7 ends too. Counterparties are already told to require an import before performing (rule 43).
- A keeper is useful for one thing: an act of the collective that the collective's own line left out (3.1). Then the collective's keepers (named by its agreement, which every member signed) can place it before the line they recorded later. Simulated: they rescue 111 of the 206 losses. But a keeper places by the order it recorded things, so a line that reaches it late lets acts made in the gap count as before: allowing keepers to place members' signatures too, 1,164 signatures counted that real time placed after their signer's line. Restricted to the collective's own acts: 107 rescues, 5 misplaced acts. **Choice C4.**

### 3.6 Found while building

1. **A record can be completed late, and unseat a later record** (draft 7, rule 37c and Flaw F). A record counts "only if the clone it names is complete, judged with the signature acts it acknowledges", and it acknowledges every signature naming its clone, whenever it was made. So a record of a clone still short of signatures counts for nothing at first; a later record of another clone is put in force; then the missing signature arrives, the first record starts counting, the second record's parent is no longer the agreement in force for it, and the second clone falls back to nothing. A completed clone stops being complete: flaw F's harm, by a new route. Found by the simulation (11 worlds out of 20,000 with draft 7's implicit acknowledgement; none with A2). **A2 closes it.**
2. **A departed member's late signature is laundered by any record** (draft 7, same sentence). Since the record acknowledges every signature on its clone, and that acknowledgement makes the signature count as made before, a member who resigned can sign a clone afterwards and, once recorded, count as a voice for it. The record's place is never compared with the resignation. Under the rule, a record after the collective's line cannot place a signature before it. **A2 closes it too.**
3. **Late completion of everyday acts** (option α). Placing a signature at the act it signs means a member who left can still sign an act the collective made before its line, and it counts. Simulated: 5,808 such signatures. It completes only acts the collective itself signed while the member held the area. **Choice C1.**
4. **The line now lags the departure.** A resignation takes effect for the collective's acts when the collective draws its line, not when the member signs it. Until then the member's signature still counts on acts the collective makes. The line is drawn by whoever produces the collective's signature, who could already withhold it from any act. Where the departing member is the only one who can produce it (a single holder), the line is the recovery rotation. **Choice C3, C7.**

## 4. What the rule must add

- **A1. The collective's line for a departure.** A record act (type 17) may register resignations, steppings down and declarations of absence (a new field: the acts it registers), with field 1's tips; so may a rotation. A departure takes effect for the collective's acts from that line. *Client conformance:* the collective's client registers a departure in its next act, as it records a complete clone at once (rule 37c). The freeze of an area is the line registering its last holder's departure.
- **A2. A record names its signatures.** A record (and the rotation declaring a clone) names the signature acts that complete its clone, and counts only with those. It places them at its own position. It replaces "counts as acknowledging every signature act naming that clone".
- **A3 (a choice, C4). The collective's keepers, for its own acts only.** An act of the collective that a line left out counts as made before it when a keeper named by the collective's agreement in force recorded it before recording the line. Lines are ordered among themselves only by the collective's tips. Stated: a keeper that records a line late opens a window, the trust in keepers rule 11a already states.
- **A4. Concurrent lines.** An act counts as made before a departure only when it is before every line registering that departure. Two records, neither in the other's ancestry, of clones of the same parent are a fork of the agreement chain: an act after both is judged under their parent until a clone naming both resolves it (rule 47's status quo). Simulated: 82 such situations, every one under the parent.
- **A5. Placement, written once.** The section "Made before, made after" becomes section 1's paragraph; rule 44d's exceptions become one sentence.
- **A6. Deals under a grant.** A deal the collective acknowledged, paid on or imported binds it, wherever that act sits in its sequence (rules 40 and 42 generalised). A deal of an ended grant that the collective did not place is undetermined until the refit; a reinstatement takes it on; a seal leaves it binding nothing. Simulated: no placed deal ever failed to bind, and nothing stayed undetermined after a seal or a reinstatement.

## 5. Choices for Nobody, allegedly

*None of these is decided. Each lists the options in plain words and a lean.*

**C1. Where is a member's signature on an everyday act placed?**
(α) at the act of the collective it signs: a receipt made before the line keeps its treasurer's signature, however it was made; a member who left can still sign an older receipt or publication the collective signed before its line, and it counts. (β) only where the collective acknowledged it: no late signature counts, but every signature the collective did not acknowledge before its line is lost there, flaw L again unless the collective acknowledges every signature as it arrives (simulated: 1,393 worlds where something stopped counting under β, none under α).
*Lean: α.* It needs no new habit, protects what was relied on, and the late completion only finishes what the collective itself signed while the member held the area. Stated cost: a pending act stays completable by its holder at the time.

**C2. Q23's reading.**
(1) A signature counts for a clone after its signer leaves when the collective placed it before its line: the record came first, or the collective acknowledged it. (2) Only the record: a member who signed and left before the record never counts.
*Lean: (1).* It keeps Q23's decided outcome wherever the collective acknowledges members' signatures as they arrive, which scenario 3.2 already has the label do.

**C3. Which act draws the line for a departure?**
(1) A record act with a new field naming the departures it registers (A1), drawn at once with the everyday key. (2) Only the rotation that follows (rule 37), no new field, but the departed member keeps counting until the safety-key ceremony. (3) A new act type.
*Lean: (1).* The record is already the collective's everyday line (rule 37c), and departures change who may act as soon as they happen.

**C4. The collective's keepers (A3).**
(1) None: an act of the collective that its own line left out counts as made after, a cost on the collective and those who relied on it. (2) The collective's keepers may place the collective's own acts a line left out. (3) They may also place members' signatures and deals.
*Lean: (2).* It saves almost every honest omission (107 of 111 in the simulation) with almost no window (5 misplaced acts, against 1,164 signatures under (3)), and the keepers are ones every member signed.

**C5. A member's own rotation (where the rule breaks).**
(1) As now, stated: a member who forgets a device at their own rotation loses their signatures on it for the collective too, as for every act of theirs. (2) Extend the rule: the collective registers a member's rotation on its line (as A1), and a signature by that member on an act of the collective placed before that line stays valid for the collective; a thief's signatures before the line count too, but only on acts the collective's key holders also signed. (3) An exception in Law rule 5: a signature disputed by its signer's rotation still counts on an act of the collective placed before a keeper recorded that rotation.
*Lean: (2), mildly.* It is the same mechanism, and in a collective a stolen member key can only finish acts the collective itself signed. But it weakens Identity's theft protection a little, and that is a decision, not a reading.

**C6. The seal's place on a grant's branch.**
(1) Drop it: a revocation seals the branch; deals the collective placed bind, an import can take on any other, and nothing is ordered on the grantee's branch. (2) Keep naming the last counted act of the branch, ordered by the grantee's own chain.
*Lean: (1).* The branch is the grantee's sequence, the very thing the rule stops reading, and rule 40 already protects every deal the collective touched.

**C7. A declaration the collective never registers.**
(1) It takes effect at the collective's line, or at the recovery rotation where the declared member is the one who would draw it. (2) The authority's declaration also names the collective tips it knows, as a fallback line.
*Lean: (1).* The authority may know nothing of the collective's sequences, and a partial line drawn by an outsider would push the collective's own acts after it.

**C8. Between the freeze and the refit, an unplaced deal is…**
(1) undetermined, as draft 7 says; (2) not backed until reinstated.
*Lean: (1).* Same mechanics; "undetermined" says honestly that the refit decides.

## 6. The simulation

`harness/ordering/` (`cargo run --release -p mor-ordering-sim -- 20000`; `cargo test --release -p mor-ordering-sim`).

**What it models.** Three members, each with one to three devices; a newcomer brought in by a refit; a collective signing from one to three devices, now and then forking its own sequence and backdating a fork; one area, held by one to three members with a threshold; clones with their own numbers, sometimes siblings; records, registrations, acknowledgements, grants, deals, payments, imports, revocations, reinstatements, refits; resignations, steppings down and declarations of absence; friends' acknowledgements; a keeper with delays of 0 to 3 steps, sometimes never recording; now and then a member's own rotation forgetting a device. Lines are drawn complete, lagging behind slow or offline devices (up to eight steps), or leaving a fork out on purpose. Each world runs 40 to 90 steps.

**How it checks.** Every rule is computed from structure alone: sequences, tips, ancestry, the keeper's own order. A second computation of the same rule uses the real clock the simulation keeps and MOR does not; that is the oracle.

**What it covered** (20,000 worlds): 861,972 acts; 318,190 everyday acts of the collective; 29,220 records; 50,520 deals; 234,459 members' signatures; 37,374 departures and 33,173 registrations; 74,487 forks of the collective's own sequence and 65,585 backdated forks; 706 pairs of concurrent registrations; 82 forks of the agreement chain; 2,323 signatures from a device a resignation forgot; 12,768 signatures made after their signer's line; 7,936 declarations against members who had signed things; 60,520 friends' acknowledgements; 851 reinstatements and 840 seals.

**What it found, for the rule (option α, records naming their signatures, no keepers):**

| Check | Result |
| --- | --- |
| With complete tips, the structure gives the real-time answer on every act, record, deal and signature | 0 differences (10,939 worlds) |
| Nothing that counted stops counting as later acts arrive (completed clones, paid publications, receipts, placed deals) | 0 failures |
| No signature counts that real time placed after its signer's line, whatever the tips (no backdating) | 0 failures, in every world |
| Friends' acknowledgements change nothing | 0 failures |
| Re-threading every member's acts over their devices at random, and drawing their resignations' tips at random, changes nothing | 0 failures |
| A deal the collective placed always binds; nothing stays undetermined after a seal or a reinstatement | 0 failures |
| An act after two sibling records stands under their parent | 0 failures |
| Losses from lines drawn without every branch | 206; 107 saved by the collective's keepers restricted to its own acts |
| Late completions (option α) | 5,808 |
| Losses through a member's own rotation (the break) | 21 worlds |

**For contrast, the same worlds under Law draft 7 as written** (simplified: personal kept tips, keepers placing only signatures on clones, records acknowledging every signature on their clone, declarations placing nothing): wrong answers against draft 7's own intent in 8,490 worlds (17,131 signatures wrongly lost, through devices a resignation forgot and declarations that place nothing; 2,877 wrongly counted, through late signatures laundered by a record or placed by a keeper that recorded the resignation late); something that counted stopped counting in 1,230 worlds with complete tips; and re-threading members' devices changed the verdict in 4,909 worlds. Under option β, 1,393 worlds lost something that had counted. With records acknowledging signatures implicitly, 11 worlds lost a completed clone (section 3.6).

**What it does not cover.** Cryptography and formats; the collective's own rotation voiding its old-key acts (lines behave the same way, by tips); several areas, lanes and tiers (one area, one clone rule); the key grammar (whoever holds the collective's key signs what the generator asks); contests. Several checks hold by construction (friends' acknowledgements and members' devices are never read by the rule; placed deals bind by definition): the simulation confirms the code does what the rule says. The substantive checks are the agreement with the real clock, stability, and backdating under forks, lags and omissions.

## 7. Report for the project lead

**Does the rule hold?** Yes, for every story from E to L, Q23, Q28 and Q30: the harm does not happen, and the good outcomes hold (a completed clone stays complete, a paid publication stays paid, a buyer the collective acknowledged or paid is protected, a year of receipts survives a declaration). 20,000 simulated worlds, 862,000 acts, with forks, offline devices, omitted tips, backdated forks and late signatures: no wrong answer. Draft 7 as written gave a wrong answer in 8,490 of the same worlds.

**What it replaces.** Most of "Made before, made after": the personal tips in resignations (E), the keeper and record exceptions for members' signatures (F, G, J), the declaration's separate line (Q28, L), flaw H's "last act known to precede the freeze" and Q30's keeper placement, rule 37b's sentence marked Flaw I, rule 42's "before the seal act" (K), and rule 44d's two exceptions, which become one sentence.

**What it must add.** A1, the collective draws a line for each departure in its own sequence (a record field, at once). A2, a record names the signatures it puts in force. A4, concurrent lines, and records on them as a fork of the agreement. A6, deals settled by what the collective acknowledged, paid or imported. Optionally A3, the collective's keepers placing its own acts a line left out.

**Where it breaks.** A member's own key rotation still judges their signatures by their personal sequences, through Identity: a treasurer who forgets a device at their own rotation un-signs the receipts they signed from it (C5). And two costs it states rather than breaks: a departure takes effect when the collective draws its line, and an act on a branch the collective's line left out counts as made after it.

**Found in passing.** Draft 7's record, by acknowledging every signature on its clone whenever made, can be completed late and knock a later clone out of force, and lets a member who already left be counted on a clone. A2 closes both.

**Eight choices** are listed in section 5 (C1 to C8), each with a lean.

## 8. Against the rules as Law draft 7 now writes them

*Added 1 October 2026, after F109 was adopted and written into Law draft 7 (seventh pass), on branch `claude/law-draft-7`.* The simulation gained a configuration for the text as written: option α (C1, C2), records naming their signatures (A2), the collective's keepers placing only its own acts (C4), and a member's own rotation registered on the collective's line, old-key signatures placed before it staying valid for the collective (C5); deals, declarations, concurrent lines and the freeze as in section 4 (A4, A6, C6 to C8). The worlds are the same 20,000, except that a member's rotation is now registered on the collective's next registration line (`gen::world_opts(seed, true)`); the tallies of sections 6 and 7 are unchanged and still reproduce exactly.

| Check (the rules as written) | Result |
| --- | --- |
| With complete tips and no keeper, the structure gives the real-time answer | 0 differences (10,914 worlds) |
| Nothing that counted stops counting, member rotations included | 0 failures (the 21 losses of section 3.4 are gone) |
| No signature counts that real time places after its signer's line, without keepers | 0 failures |
| Friends' acknowledgements change nothing | 0 failures |
| Re-threading members' devices changes nothing, in worlds without a member's rotation | 0 failures |
| A placed deal binds; nothing undetermined after a seal or reinstatement; concurrent sibling records leave their parent in force | 0 failures |
| **Stated costs, reported:** the keeper window (C4): honest worlds whose verdict differs from real time because a keeper recorded a line late; worlds where it made something stop counting; signatures counted through it | 16; 1; 5 |
| Losses from lines drawn without every branch; rescued by the collective's keepers | 206; 106 |
| Late completions (C1) | 5,908 |
| Worlds with a member's rotation (2,211, of which 1,479 registered) where re-threading devices changes a verdict | 12, each a signature on a clone that no act of the collective placed before the line registering its signer's rotation, judged by Identity alone as the text says (Law draft 7, Q33) |

`cargo run --release -p mor-ordering-sim -- 20000` prints both tallies and exits with an error if either has a wrong answer; `cargo test --release -p mor-ordering-sim` adds the C5 story (`c5_member_rotation_registered_on_the_line`) and a sweep of the written rules. *Not modelled, as before:* the rotation that declares a constitutional clone placing signatures (Law draft 7, Flaw M), a reinstatement as a signature on the old grant (Flaw N: the simulation models a reinstatement as an act of the collective, Flaw N's lean), a record that both writes a clone and registers departures, a declaration taking effect at a recovery rotation (C7), and thieves as distinct from forgotten devices (C5 treats them alike).


# What draft 26 and encoding 3 do to verifier 2: part 1, rules 5.1 to 5.6

*Session 1 of 4, under the codemeister of MOR, 27 November 2026. A record of work, not a decision: every reading here is a question, and every lean is labelled as the session's. No text, code or vector is changed. Session 2 takes 5.7 to 5.13 and section 6; session 3 takes encoding 3; session 4 assembles the sheet.*

**The wish** (Nobody, allegedly, 26 November, 16:46, at the top of `docs/decisions.md` on main): "We need to change the current wish to updating the core after the findings". On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (27 November, 16:54): "Yes pls"

**Sources.** *D26* is `docs/agreements-from-scratch/draft-26.md` on branch `claude/draft-26-outline-vbtvu7` (pull request 292, not merged), with its trace, report and companion beside it. *D25* is `draft-25.md` on `claude/agreements-clean-1-hahuwn`. *Verifier 2* is `core/src/agreements_new/` at commit `f1a13feb` (branch `claude/agreements-verifier-2`), and its vectors are `core/vectors/agreements-new/`. *The ledger* is `docs/decisions.md` on main. *SN* and *CN* are the MOR lead's notes of 27 November (`docs/lead/notes/2026-11-27-settled-by-the-lead.md`, `2026-11-27-what-changed-in-agreements.md`); every reading in them is the lead's. *The build list* is `docs/agreements-from-scratch/review-1-impact-on-verifier.md` on main, Part 4, section C. *The sheet of 26 November* is `docs/code/impact-26-november.md` on `claude/impact-26-november-4vze7a`. *The round* is `docs/code/round-2-verifier-answers.md` on `claude/round-2-verifier-answers-5ng7wz`, used for example acts only. **Code citations** are `file:line` at `f1a13feb`: a bare file name is under `core/src/agreements_new/grammar/` (so `mod.rs` is `grammar/mod.rs`), but for `terms.rs`, which is under `core/src/agreements_new/`.

**Marks.** **[traced]**: to a rule, a line of the ledger, a line of code or an act, cited. **[counted]**: by a script, named at the end. **[inferred]**: this session's reading, with what would confirm it. Every "Arrived at (to check)" line of the ledger is the MOR lead's reading, not his words; where it says more than his words, his words win.

**Grammar cases** are named by their number in `grammar.json` (from 0) and their name. A case *changes answer* where its expected word or qualifier would differ; the rule each case names is renumbered in every case (G4.1 becomes 5.4.1 and so on), and that alone is not counted as a change.

---

## In plain words

Draft 26 keeps most of what rules 5.1 to 5.6 say, under new numbers. Four things move a verifier's answers, and one of them moves most of the grammar vectors.

1. **The pin for a first version** (5.4.1). Today a first version is in force as soon as the assents it needs are present. Draft 26 adds a second check: their order must be shown. Where the Terms name no keeper, that means each party whose assent put them in force has made one more act in the agreement that names, directly or through other acts, every one of those assents. Ana and Ben sign; nothing more is made; under draft 26 their Terms are "not shown" as in force, with the reason "no order is shown". Nineteen of today's grammar cases hold exactly that picture, and their answer about anything that rests on Terms in force changes. This is the largest change in this part, by far.
2. **The gate and the pin for an update** (5.5.1, 5.5.5, 5.5.7). Today an update replaces when its condition (or the default) answers valid and it is in force by its own `in_force`. Draft 26 removes the second half (its own `in_force` is left unread) and asks instead that its order be shown. The default signers become the known parties: the signers and agreements the original names, never someone who fills a role, and an agreement named counts even if it never signed.
3. **Who signs for whom** (5.1.2, 5.6.1(b), 5.6.6). A power to act for a person counts only where that person signed the version that gives it. Delegation (G5.5) is gone: the giver of a power no longer ends it alone by default.
4. **New answer words and readings**: a late update is answered **late** (5.5.4(c)); a counter signature that races the completing assents is a **fork** (5.4.5); an author named by role makes Terms **invalid** (5.3.1); the words of Terms are a Text act, and Terms whose `body` names an act held that is not one are **invalid** (5.2.2); a reader's own anchoring never gives the Terms' own answer (5.1.4, 5.5.3).

---

## What was run today [counted]

- `cargo test -p mor-core --locked` at `f1a13feb`: passes, 570 tests, none failing, one ignored (summed from its `test result` lines).
- `python3 core/vectors/agreements_new_grammar_check.py`: "grammar.json: 115 of 120 cases judged again, and agree"; the five not judged are under G10.2, G10.6, G11.4, G4.11 and G5.1(b) (cases 71, 74, 91, 58, 59). It needs the `unicodedata2` package, which this container lacked; it was installed in the session's scratch folder, not in the repository.
- What draft 26 would change cannot be run: no code is written. Every "after" below is read from the text and the code, and marked so.

---

## The rules covered, and the table

Draft 26 sets out, in sections 5.1 to 5.6, **28 numbered rules and 33 lettered parts: 61 in all** [counted, `count_rules.py`]: 5.1, 5 numbered; 5.2, 3; 5.3, 2; 5.4, 5; 5.5, 7 numbered with 21 lettered (5.5.1 (a, b); 5.5.4 (a to e); 5.5.5 (a to e); 5.5.7 (a to i)); 5.6, 6 numbered with 12 lettered (5.6.1 (a to c); 5.6.5 (a to f); 5.6.6 (a to c)).

*Size*: a **word** (an answer word or a reason's wording), a **rule** (a check added or changed), a **field** (a field of an act), a **value form** (how a value is written), a **removal** (code that goes). *Change* counts grammar cases (G) and checker cases (`valid.json`, V; `invalid.json`, I) whose answer changes; *if* marks a count that rests on a question. New vectors are described in the rule's section; *(26 Nov)* marks one of the 22 of the sheet of 26 November, *(27 Nov)* one the ledger's entries of 27 November add.

| Rule | Short name | Size | Change answer | Retired | New |
|---|---|---|---|---|---|
| 5.1.1 | An agreement as a party | none | 0 | 0 | 0 |
| 5.1.2 | Named, and signing; an agreement's signature | a rule | G 49, 50, 52 (by 5.4.1) | 0 | 3 (1 of 27 Nov) |
| 5.1.3 | The receiver's two forms | a word | 0 | 0 | 0 |
| 5.1.4 | Receiver for an act | a removal | G 67, 68 (by 5.4.1); if: G 66, 76, 77 | 0 | 2 |
| 5.1.5 | A rule may take a receiver | none | 0 | 0 | 0 |
| 5.2.1 | Named by fingerprint | none | 0 | 0 | 1 (27 Nov) |
| 5.2.2 | The words are a Text act | a rule | 0 | 0 | 3 (1 of 26 Nov, 1 of 27 Nov) |
| 5.2.3 | What is left unread | a word | 0 | 0 | 1 (26 Nov) |
| 5.3.1 | Authors are signers | a rule | V 7; if Q5: V 12, 43 and G 17 to 25, 27 to 30, 55 to 59, 65 | 0 | 2 (1 of 27 Nov) |
| 5.3.2 | Authors bear the words | none | 0 | 0 | 0 |
| 5.4.1 | Coming into force; the pin; which keepers | a rule | G 1, 2, 5, 10, 12, 14, 26, 35, 46, 49, 50, 52, 53, 55, 56, 67, 68, 91, 102 (19); if: G 8, 11, 30, 31, 66, 71, 72, 73, 75, 76, 77, 95 | 0 | 6 (1 of 27 Nov) |
| 5.4.2 | A role asks for `in_force` | none | 0 | 0 | 0 |
| 5.4.3 | What an assent binds | a rule | G 2 (by 5.4.1) | G 74 (with 5.10) | 3 (2 of 26 Nov) |
| 5.4.4 | An agreement is not counted by default | none | 0 | 0 | 0 |
| 5.4.5 | Counter signature | a word, a rule | G 36; G 35 (by 5.4.1) | 0 | 4 |
| 5.5.1 | The gate and the pin | a rule, a removal | if: G 8, 11, 30 | 0 | 3 (1 of 26 Nov) |
| 5.5.2 | When Terms stop | a word | 0 | 0 | 0 |
| 5.5.3 | Which Terms are in force | a removal | 0 (G 60, 61 relabelled) | G 64 | 1 |
| 5.5.4 | Two updates of one version; a late update | a word, a rule | G 29, 65; if: G 31 | 0 | 6 (4 of 26 Nov, 1 of 27 Nov) |
| 5.5.5 | Replacing; the default signers | a rule, a removal | 0 | G 58 | 7 (2 of 26 Nov, 4 of 27 Nov) |
| 5.5.6 | No act ends an agreement but an update | none | 0 | 0 | 0 |
| 5.5.7 | The update condition | a rule, a word | if: G 8, 11 | G 74 (counted at 5.4.3) | 1 |
| 5.6.1 | Who is bound | a rule | G 12, 55, 56 (by 5.4.1) | 0 | 3 (1 of 26 Nov, 1 of 27 Nov) |
| 5.6.2 | A replacing Terms act | none | 0 | 0 | 0 |
| 5.6.3 | One's own name only | none | 0 | 0 | 0 |
| 5.6.4 | An act under a power whose Terms were replaced | a rule | 0 | 0 | 2 |
| 5.6.5 | Constitution, executive, judicial | none | 0 | 0 | 0 |
| 5.6.6 | Nothing an agent made is set aside | a removal | 0 | G 58 (counted at 5.5.5) | 1 |

Lettered parts are counted with their numbered rule; each has its own entry inside that rule's section below. A case moved by two rules is counted once, under the rule that moves it first (most under 5.4.1); the other rule names it "by 5.4.1".

---

## What these rules rest on in sections 3 and 4

Only what changed from draft 25 and reaches a verifier's answer in 5.1 to 5.6; each is used in the sections below.

- **Author** (§3.2): "An author is named as a signer, never by role and never as an agreement, and is a known party (§5.3)." Draft 25 let an author be a role (G3.1). Reaches 5.3.1 and 5.5.5(a). [traced]
- **Known party**, **unknown party** (§3.2): new. "The known parties are those who have a say in the agreement's updates, and, by default, those who sign them (§5.5)." "Any filling of a role is an unknown party's, whenever it was made." Reaches 5.4.3, 5.5.5(a), 5.5.7(e), 5.6.1(c). [traced]
- **Gate**, **pin**, **valid**, **in force** (§3.3): new as definitions. "In force" now needs the pin for a first version as for an update. Reaches 5.4.1, 5.5.1, and every rule that asks "in force". [traced]
- **Late update** (§3.3) and the answer **late** (§3.6): new; draft 25 had no answer word for it (build list R1). Reaches 5.5.4(c). [traced]
- **Fork** (§3.3): widened to "Terms coming into force against a counter signature that cancels one of the assents they need". Reaches 5.4.5. [traced]
- **Knot**, **shown after** (§3.4): "Knots cross acts and layers: any fingerprint of an act, carried in a field of any act the verifier holds, is a knot, whatever layer either act belongs to, the field `body` included." Today `held.rs:140` to `held.rs:190`, `namings`, reads payload fields of Agreements acts only, and not `body` (`held.rs:150` to `held.rs:159`). The rule is session 2's (5.13); it reaches 5.4.1's pin and 5.5.4(a) here. [traced]
- **Keeper** (§3.4): *place* renamed; "Terms may name one keeper or several (§5.8)". Today one place (`terms.rs:286`, key 8; `mod.rs:243` to `mod.rs:259`). The field's form is session 3's; the agreement among several keepers reaches 5.4.1, 5.5.5(d), 5.6.4. [traced]
- **Anchoring** (§3.4): "An anchoring of a reader's own choosing gives an answer only as that reader's, named so; it never gives the Terms' own answer (§5.13)." Today `Reader.anchoring` (`mod.rs:67` to `mod.rs:73`) gives it where the Terms name no place and no clock (`mod.rs:251` to `mod.rs:257`). Reaches 5.1.4, 5.5.3, 5.5.4(b). [traced]
- **§4.2** `authors`: "each named as a signer, never by role and never as an agreement"; `body`: "the act id of the Text act that carries the words (§5.2)"; `in_force`: "Its answer on coming into force is left unread in a Terms act that carries `replaces` (§5.2)"; `keeper`: "one keeper or several". Fields and their bytes are session 3's. [traced]
- **§4.4, the order of faults**: §5.2, then each role, then 5.4 (a role and no `in_force`), then 5.3 (authors). Verifier 2 checks in the same order (`terms.rs:544` to `terms.rs:609`: G2.1, G10.1, G4.2, G3.1) [traced]. Draft 26 adds to item 2 "then the act `body` names, held and not a Text act", which needs the acts held, as G6.1 does today, not one act's bytes [inferred].

---

## 5.1 An agreement as a party

### 5.1.1 Terms may name an agreement as a party

1. **The rule.**

   > **5.1.1** Terms MAY name a party as an agreement, by its root fingerprint.

2. **Replaces** D25 G1.1, unchanged [traced, D26 trace §5.1]. **Code:** `terms.rs` decodes a party named as an agreement as `Party::Agreement` (used at `terms.rs:532`); nothing in the grammar turns on it alone [traced].
3. **What a verifier answers differently.** Nothing. Ana and Ben name their co-op's agreement as a party; Dana asks whether the Terms are well formed: shown, before and after [traced].
4. **Size:** none.
5. **Vectors:** none change; none retired; none new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.1.2 Named, and signing; an agreement's signature; one level

1. **The rule.**

   > **5.1.2** **Named, and signing.** Naming an agreement as a party asks nothing of it: it need not sign to be named, it is not counted by the default of §5.4, and where it has not signed it is not bound by any act of these Terms, and neither are its parties. A party named as an agreement MAY sign: an assent to these Terms, where their `in_force` rule asks for it (§5.4). Its signing covers what those Terms carry, a call among them (§5.11). It signs as its own Terms require: every one of its signers, or what its own rule accepts (a vote, or a signer its Terms give a power to sign for it). **An agreement's signature.** An act is signed by an agreement x when its `for` names x, by its root; its `under` names Terms of x that are in force (§5.5) and give a power for acts of that kind; and that power's rule, applied to the acts held, says yes (where they give two or more powers for that kind, any one of their rules). Whoever signs such an act (a signer x's power names, or whoever the rule of a vote accepts) signs on behalf of x's parties, under the power x gave. That act is x's signature. It binds every party bound by x's Terms, as x's Terms say (§5.6), and no one else; and it binds a party of x only where that party's own signature is on the version of x's Terms that gives the power: no update condition can give it for a party who did not sign that version (§5.6). It is an act within the agreement it is made in, and stands there in its signer's own line (§5.7). Where x's Terms give no such power, x signs by every one of its signers: one act by each of them, its `for` naming x and its `under` naming x's Terms in force. Each act has one signer, as the core has it. **Which acts are one signing.** Those acts are one signing of x where they are the same act but for their signer and their place in that signer's own line: they name the same `agreement`, `terms`, `kind`, `content`, `for`, `under`, `settlement`, `resolves` and `continues`; their `previous`, `answers` and `relies_on` may differ. x has signed once an act so matched is held from every one of its signers; for an assent, that is an assent by each of them, `for` x, to the same Terms. Each of those acts stands in its own signer's line (§5.7). Where an act's `for` names an agreement, its `under` MUST name Terms of that agreement: an act made for an agreement under any other Terms is not that agreement's signature. **One level.** Its signers are the parties its own Terms name as signers. A party it names as an agreement is not one of them, and neither are that agreement's people: these grammar rules MUST NOT be read as making an agreement's signing need the signature of anyone inside an agreement it names, unless its own Terms say so. A verifier reads what they require from that agreement's Terms in force (§5.5); where it lacks them, the answer is **unchecked** (§3.6).

2. **Replaces** D25 G1.2, changed in two places [traced, D26 trace §5.1]: "a named delegate" becomes "a signer its Terms give a power to sign for it" ("Delegation is a leftover", 18 November: "I think it's best. It's a leftover of the old ways"); and the new sentence "it binds a party of x only where that party's own signature is on the version of x's Terms that gives the power: no update condition can give it for a party who did not sign that version" ("Nothing about me without my signature", 18 November). "in force (§5.5)" now means the gate and the pin. **Code:** `force.rs:69` to `force.rs:115`, `power`: for `Who::Agreement`, it checks that `under` is Terms of x (`force.rs:76` to `force.rs:81`), that they are in force (`force.rs:84` to `force.rs:87`) and the power's rule; it checks no party of x's signature on that version (the signed check at `force.rs:89` to `force.rs:94` is for a person only). `force.rs:119` to `force.rs:152`, `one_signing`: x's signers are its parties named as signers (`force.rs:121`). `order.rs:262` to `order.rs:268`: a person is bound by x's signature where "they are bound by its Terms in force", read through `signed_by`, whose inherited arm (`force.rs:502` to `force.rs:519`) counts someone bound through an update [traced].
3. **What a verifier answers differently.** *Plain words.* The co-op x has three members, Ana, Ben and Carla. Its version 1, signed by Ana and Ben, gives Ben a power to sign for the co-op. Carla joined by version 2, which Ana and Ben signed without her, under an update condition that let them (she is bound by it as a known party, 5.6.1(c)). Ben signs an assent for the co-op to an outside deal. Dana asks whether Carla is bound by it. *Before:* shown, G5.1(b), "the act is the agreement's signature, and they are bound by its Terms in force (G1.2)", where the power stands in the version in force. *After:* not shown for Carla: the power is in a version she never signed; shown for Ana and Ben [inferred from the rule's new sentence; confirm by building `power` with that check]. And the first-version pin reaches every case here: x's Terms must be pinned before x can sign (5.4.1).
4. **Size:** a rule: the party-of-x check, for the power path only (the path with no power, every signer signing, already has each signer's own act).
5. **Vectors.** *Change answer:* grammar 49 "an agreement as a party signs through a power its own Terms give: its signature" (shown → not shown), 52 "an agreement with no power signs by every one of its signers: the same act from each: one signing" (shown → not shown), and 50 "Terms whose `in_force` asks for the agreement's signing: in force once it signed" (shown → not shown), all three by 5.4.1: x's Terms (`party/X`, `party/X2`) are not pinned by knots [counted, `pin_count2.py`; the answer after inferred]. 51 and 54 stay not shown. *Retired:* none. *New:*
   - x's version 1 (Ana, Ben) gives Ben a power of kind `assent`; version 2 adds Carla, signed by Ana and Ben under a condition stub that answers valid; both pinned; Ben's assent for x to an outside Terms, its `under` naming version 2. Asked `bound`, Carla: **not shown**, 5.1.2; Ana: **shown**.
   - The same, Carla's own assent to version 2 held: **shown** for Carla (on Q14's lean, the version `under` names).
   - (27 Nov, "The giver bears it, not the agent") Ben's assent for x, asked `bound` of Ben: **not shown**, 5.6.1 (made in another's name); asked of x's signers, as above.
6. **Build list, sheet:** R6 (an agreement whose own power says no: draft 26 keeps "any one of their rules" and the power path, so the code's reading stands, read only); R17 (an act for an agreement under another's Terms: draft 26 adds "an act made for an agreement under any other Terms is not that agreement's signature", the code's reading, `force.rs:76` to `force.rs:81`); R18 (a role's filler in one signing: "Its signers are the parties its own Terms name as signers", the code's reading, `force.rs:121`); R29 (a power that came in by an update) is settled by the new sentence [traced].
7. **Choices left to the code:**
   - Q14 (below): which version "gives the power": the one `under` names, or the one that first wrote it?

### 5.1.3 The receiver's two forms

1. **The rule.**

   > **5.1.3** Terms MAY name a `receiver`: one of their own parties named as a signer or as a role, by its position among the parties; or an agreement, by its root fingerprint, whether or not it is one of their parties. The two are told apart in the bytes, not by guessing (§4.2). A receiver that names, by position, a party named as an agreement makes the act not an Agreements act: an agreement is named as receiver by its root.

2. **Replaces** D25 G1.3: "rejected" becomes "not an Agreements act" [traced, D26 trace §5.1]. **Code:** `terms.rs:531` to `terms.rs:534`, rejected under E12 [traced].
3. **What a verifier answers differently.** Nothing in kind: Ana's Terms name as receiver, by position, the co-op named as a party; the checker refuses the bytes, before and after. The verdict's word is the encoding's (session 3) [traced].
4. **Size:** a word (the text's name for the verdict).
5. **Vectors:** `invalid.json` "terms: a receiver whose position names a party named as an agreement (name it by its root)" keeps its answer; its rule's text cites draft 26. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.1.4 Receiver for an act

1. **The rule.**

   > **5.1.4** **Receiver for an act.** Whatever a payer, an act or a rule of one agreement gives or owes to an agreement, it gives or owes to that agreement's **receiver for the act**: the `receiver` named by the version of that agreement which the act that gives or owes names (§5.13). Where that act names no version, a verifier MUST take the receiver from that agreement's Terms in force, per the keepers that agreement's Terms name, qualified **per keeper** with those keepers named, or, where they name none, **as shown** (§5.5, §5.8, §5.13). Which Terms of that agreement are in force is answered by §5.5: while a fork of its Terms stands, the receiver is the one named by the Terms both branches replace, and the verifier MUST show the fork with that answer and MUST NOT choose a branch (§5.5). Where the receiver so named is one of that agreement's own parties, the answer is that party. Where it is another agreement (5.1.3), the two are agreements of a sequence (§5.11), and a verifier reads that agreement's receiver in the same way, and so on, until one of an agreement's own parties is reached. That party is who receives: the receiving side of one leg (§5.11). These grammar rules follow a receiver no further. What that party then passes on is another leg, carried out under its own agreement's Terms and the cMIPs they name, and is read only as §5.11 says. If a version read names no receiver, or names as receiver a signer or a role that is not among its own parties, or the spot named is not filled, or is filled more than once (which of them receives is not said), or an agreement is met a second time on the way, no one receives, and the answer is **not shown**. Where the act that gives or owes names, as the version it read, Terms that are not shown as a version of that agreement, the answer is **not shown**. Where it names Terms that name an envelope, the answer of Envelopes' rules for such Terms comes first (§2): where those Terms are invalid, no one receives by them, and the verifier shows the payment with them, and the answer invalid, that rule named; where that rule answers not shown or unchecked, so is the receiver. Where it names a tip of a fork that stands, the receiver is the one named by the Terms both branches replace, the fork is shown with it, and the act is shown as built on a tip (§5.5, §5.12); once that tip is set aside, §5.12 says how it is read. If the verifier lacks that agreement's acts, it is **unchecked** (§3.6). A verifier that stops following receivers from agreement to agreement before a party is reached answers **unchecked**, and says how far it followed (§3.6, §7).

2. **Replaces** D25 G1.4, changed [traced, D26 trace §5.1]: "per the anchoring the reader accepts" goes; "per place" becomes "per keeper", with the keepers the Terms name; G14.3 is read as Envelopes' rules. D25 had: "per that agreement's own place, qualified **per place** with that place named, or, where it names none, per the anchoring the reader accepts, or **as shown**". **Code:** `receiver.rs:41` to `receiver.rs:120`, `receiver_rec`; with no version named, the Terms in force come from `chain` (`receiver.rs:80` to `receiver.rs:91`), whose qualifier comes from `scope_of`, which reads the reader's anchoring (`mod.rs:251` to `mod.rs:257`); with a version named, the version must be in the chain's line, stopped in a fork, or set aside (`receiver.rs:66` to `receiver.rs:78`) [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's work names Ben as receiver and names no keeper. Carla pays without naming a version. Dana, who accepts a relay of her own choosing as anchoring, asks who receives. *Before:* Ben, **per anchoring**, her relay named. *After:* Ben, **as shown**; her relay's order may be given beside it only as Dana's own answer, named so [traced to the rule]. And where the work's first version is not pinned (5.4.1), no Terms are in force, and the answer is **not shown** [inferred].
4. **Size:** a removal (the reader's anchoring in `scope_of`, for this answer), with the qualifier renamed (per keeper).
5. **Vectors.** *Change answer:* grammar 67 "a receiver that is another agreement: followed until one of an agreement's own parties is reached" (shown → not shown) and 68 "a verifier that stops following receivers answers unchecked, and says how far it followed" (unchecked → not shown: W's Terms are not in force before the limit is reached), both by 5.4.1 [counted, `pin_count2.py`; inferred after]. *If Q6:* 66 "the receiver for an act: the receiver named by the version it read", 76 "a receiver named as a role, filled once: the one who fills it receives", 77 "a receiver named as a role whose cMIP the verifier lacks: unchecked": each names a version that is not pinned; under the code's reading (the version must be in the line) they become not shown [inferred]. 69, 70 stay not shown; 20, 21 stay (their root is pinned); 108 stays invalid; 25 is session 2's (5.12). *Retired:* none. *New:*
   - A payment naming no version, Terms naming no keeper, the reader holding an anchoring of its own: **shown, as shown**; the reader's order, if given, labelled as the reader's (5.5.3).
   - A payment naming no version, Terms naming two keepers that disagree on the last version: **not shown**, the keepers disagree (5.5.5(d)).
6. **Build list, sheet:** R16 (a payment naming a version further along a set-aside branch) is 5.12's, session 2's. T6 (late Terms never read the reader's anchoring) goes: draft 26 never lets the reader's anchoring give the Terms' answer, so the code's not reading it is now right [traced, D26 5.5.3]. Sheet: none.
7. **Choices left to the code:**
   - Q6 (below): must a version named by a payment have been in force, or only be shown as a version of that agreement?

### 5.1.5 A rule may take a receiver as input

1. **The rule.**

   > **5.1.5** A rule (§6), in any socket, MAY take as an input a receiver for an act, so answered, or what a leg report states (§5.11).

2. **Replaces** D25 G1.5, unchanged [traced, D26 trace §5.1]. **Code:** none in the grammar; a cMIP's own input (`sockets.rs`, `Ask`) [traced].
3. **What a verifier answers differently.** Nothing.
4. **Size:** none.
5. **Vectors:** none.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

---

## 5.2 The words, and what the Terms use

### 5.2.1 Named by fingerprint

1. **The rule.**

   > **5.2.1** The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.

2. **Replaces** D25 G2.1, unchanged [traced, D26 trace §5.2]. **Code:** `terms.rs:544` to `terms.rs:553` (the body's words and every socket); `legs.rs:24` [traced].
3. **What a verifier answers differently.** Nothing. Ana's Terms name the body's words by a web address: invalid, before and after.
4. **Size:** none.
5. **Vectors.** *Change:* none; `invalid.json` "terms: the body's words named by an address, not a fingerprint", "terms: the body's cMIP not named by fingerprint (one fault: G2.1, not G2.2)", "terms: in_force's cMIP not named by fingerprint", "terms: a power's rule not named by fingerprint", "terms: a role's spot cMIP not named by fingerprint", and grammar 117 "a body not named by fingerprint makes the Terms invalid" keep their answers, renumbered. *New:*
   - (27 Nov, "A specification is a Text act, named by its id") Terms whose `condition` names a cMIP by a stand-in fingerprint (the SHA-256 of a label no text hashes to), the verifier holding no cMIP of that name: under draft 26, **unchecked**, 5.5.7(h), as today; the Terms are not invalid, since a stand-in is a fingerprint. The ledger's line queues the change to the Development MIR behind draft 26 [traced]; the vector records today's answer, so that the Development change shows when it lands.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.2.2 The words are a Text act

1. **The rule.**

   > **5.2.2** **The words are a Text act.** The words of Terms MUST be a Text act (Text, rule 14), public or private, and the Terms MUST name it in `body` by its act id, beside the socket of the cMIP that reads it (task K1). The Text act comes first: Terms can name only an act that already exists, and naming it by its act id is all that this asks of them. Where the act `body` names is held and is not a Text act, the Terms are **invalid**: they lack what they need. These grammar rules read that act id as they read any fingerprint (5.2.1); they do not read the words.

2. **Replaces:** new (N4 of the brief) [traced, D26 trace §5.2], from "The words of Terms are a Text act" (26 November): "Text comes first as a rule since agreement needs to point to it". The invalid case is the lead's reading of 09:27 (D26 report, "Found items"). **Code:** none checks it. `terms.rs:163` to `terms.rs:171`: the body's words are a `Named` fingerprint; `held.rs:62` to `held.rs:64`: an act handed that is of another specification (a Text act) is put among the rejected, so the grammar cannot tell that the act `body` names is a Text act, or that it is not one [traced].
3. **What a verifier answers differently.** *Plain words.* Ana writes her words as a Text post, then Terms naming its act id in `body`. Ben, by mistake, writes Terms whose `body` names Ana's assent, a Statement. Dana holds both acts. *Before:* both Terms pass; neither's body is read. *After:* Ana's Terms pass; Ben's are **invalid**, 5.2.2, "they lack what they need" [traced to the rule]. Where Dana does not hold the act named, nothing changes: the grammar does not read the words (SN Q24: "The verifier need not hold the words to answer the grammar's questions").
4. **Size:** a rule, among the acts held (as G6.1 is today, `check_held`), and it needs the verifier to recognise a Text act held (its spec hash: encoding 3's `TEXT` list, session 3).
5. **Vectors.** *Change:* none: every body in the vectors is a stand-in, not held (the README: every word is "the SHA-256 of a label beginning `agreements-new/`") [traced]. *New:*
   - (26 Nov, line 19, 1) Terms whose `body` names a Text act handed beside them: the Terms **pass**, the Text act known (not lacking).
   - Terms whose `body` names a Statement held: **invalid**, 5.2.2 (item 2 of §4.4, after the fingerprints).
   - (27 Nov, "Signing an agreement relies on its words", 26 November, with his "rely is the solution to all acts someone has to rely on") Terms whose `body` names a Text act that its signer's key change has left out (Identity, rule 34), and a party's witness act relying on it: the Terms **pass** 5.2.2; the Text act stays held and readable, **disputed** in Identity's sense (§3.6, Disputed). What Agreements answers does not change; the vector shows that a voided words act does not make the Terms invalid.
   - Line 19's second vector (the Text act named also in `relies_on` of a late update: **late**) is written once, at 5.5.4.
6. **Build list, sheet:** the sheet's line 19 and line 20; its Q23 (is the body's naming a knot): settled by §3.4, "the field `body` included"; `held.rs:150` to `held.rs:159` leaves it out (session 2's, 5.13). Q24 and Q25: settled by SN ("Text comes first" asks nothing beyond the naming). Q2 (is an act held of another specification known): settled by "Knots are knots" (27 November), the lead's line: "Any fingerprint in a field of any act the verifier holds is a knot, whatever layer either act belongs to" [traced].
7. **Choices left to the code:**
   - Q11 (below): the act `body` names, held and unreadable (private, without its key): invalid, unchecked, or not read?
   - Is a Text act "held" for this rule when it is handed only as a piece (`held.rs:72`, `hold_piece`), with no bytes?

### 5.2.3 What is left unread

1. **The rule.**

   > **5.2.3** Anything a Terms act refers to in another way is not part of those Terms. A verifier MUST NOT read it as part of them. An entry of `relies_on` that is not a fingerprint is not read, and does not make the Terms invalid; a verifier says that it left it unread. A field §4 does not give is not left unread: the act is not an Agreements act (§4). A `body`, or a cMIP in a socket, that is not named by fingerprint makes the Terms **invalid**, under 5.2.1 (§3.6). **What is left unread**, in these grammar rules, is that entry of `relies_on` and four things more, each where it is said: an entry of `powers` of kind `replaces` (§5.6); a call in Terms that do not hold the task it is attached to (§5.11); a `what` on a role of kind future (§5.10); and the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (5.4.2, §5.5). A verifier says of each that it left it unread.

2. **Replaces** D25 G2.2, with one entry added: the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (SN Q7: "An update's own `in_force` field is left unread, listed in G2.2 with the rest"); "three things more" becomes "four" [traced, D26 trace §5.2]. **Code:** `order.rs:30` to `order.rs:48`, `whole`, lists the checker's notes under G2.2, G5.2 and G10.4, and the calls; no note exists for an update's `in_force` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 2 carries its own `in_force`. Dana asks what the Terms leave unread. *Before:* "nothing in these Terms is left unread". *After:* "left unread: the answer of `in_force` on coming into force" [traced to the rule].
4. **Size:** a word (one more entry in an answer's list).
5. **Vectors.** *Change:* none: grammar 16, 114, 115 keep their answers. *New:* (26 Nov, line 18, 3) an update carrying its own `in_force`: asked `whole`, **shown**, with that entry left unread; asked `update`, its answer is the gate's and the pin's alone (5.5.1).
6. **Build list, sheet:** the sheet's Q7, settled (A) by SN Q7 [traced].
7. **Choices left to the code:** none.

---

## 5.3 Authors

### 5.3.1 Authors are parties named as signers

1. **The rule.**

   > **5.3.1** `authors` MUST name one or more of the parties these Terms name, each named as a signer: an author is never a party named by role, and never one named as an agreement (§3.2). Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, are **invalid**.

2. **Replaces** D25 G3.1: "`authors` MUST name one or more of the parties named as signers or roles." The role goes, on the lead's reading ("There is no unsigned act: the author is a known party", 27 November: "There is no such thing as an unsigned act on Mor") [traced, D26 trace §5.3]. **Code:** `terms.rs:600` to `terms.rs:609`: invalid for an author beyond the parties, or named as an agreement; a role passes [traced].
3. **What a verifier answers differently.** *Plain words.* Ana drafts an offer whose only author is the buyer's role. *Before:* the Terms pass (`valid.json` 7). *After:* **invalid**, 5.3.1 [traced]. And, if the ledger's line of 27 November, 16:48 is written into this rule: Ben signs a second version naming Ana alone as author; *before:* it passes; *after:* **invalid** ("a Terms act whose `authors` leaves its signer out is invalid", the lead's line; his words: "Absolutely. The person publishing the act is by default an author, the rest adds signature later") [traced to the ledger; not in draft 26: its report lists it as "Carried to the end of the stage", 1].
4. **Size:** a rule (the role arm becomes invalid); with the 16:48 line, a second rule, readable from one act's bytes (the outside's signer against the signers `authors` names) [inferred].
5. **Vectors.** *Change answer:* `valid.json` 7 "terms: no party named as a signer, an author named by role" (pass → invalid, 5.3.1) [traced]. `invalid.json` 71 "terms: an author that is a party named as an agreement" keeps its answer; its plain words ("authors name parties named as signers or roles") change. *If the 16:48 line is written (Q5):* `valid.json` 12 "terms: a second version of the same Terms, by another signer (with the first, a fork of Terms)" and 43 "held: a fork of Terms, and the resolving update" (pass → invalid), and in `grammar.json` 19 Terms acts signed by someone not among their authors, in cases 17 to 25, 27 to 30, 55 to 59 and 65 (a twentieth, in case 116, is invalid already) (each `fork/v2b`, `power to resolve/v2b`, `late/v2b` or `bound/Y`), which would become invalid and take their forks and powers with them [counted, `signer_author.py`; what each case then answers is not read]. *New:*
   - Terms whose only author is a role: **invalid**, 5.3.1.
   - (27 Nov, 16:48, if written) Terms signed by Ben whose `authors` names Ana only: **invalid**.
6. **Build list, sheet:** the sheet's Q8 and Q15 ("Terms nobody signed"): settled by "There is no unsigned act" (27 November). D26 report items 1 and 3 [traced].
7. **Choices left to the code:**
   - Q5 (below): is the 16:48 line part of 5.3.1, checked by the checker from one act?

### 5.3.2 The authors bear the words

1. **The rule.**

   > **5.3.2** The authors are the parties who bear the failure of the words to mean one thing. A cMIP that reads a judge's decision, in whichever socket it sits (§6), MUST accept `authors` as an input.

2. **Replaces** D25 G3.2, unchanged but for "(#4 Align)" [traced]. **Code:** none: what a cMIP accepts is the cMIP's (`sockets.rs`).
3. **What a verifier answers differently.** Nothing.
4. **Size:** none.
5. **Vectors:** none.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.
---

## 5.4 The first version, and what an assent binds

### 5.4.1 Coming into force; the pin; which keepers

1. **The rule.**

   > **5.4.1** **Coming into force.** A Terms act without `replaces` is a first version. A first version comes into force when the assents its `in_force` rule requires are present (task K2). Where it carries no `in_force`, it comes into force when there is an assent to it in the name of every party it names as a signer. **The pin.** It is in force once the order of the signatures that put it in force is shown. Where it names keepers, they show it, at the positions they give those assents (§5.8). Where it names none, knots show it: each party in whose name one of those assents is counted has made an act in that same name within the agreement that is shown after every one of those assents (§5.13). Any such act pins, a counter signature included: a counter signature so shown is late, and cancels nothing (5.4.5); one that nothing orders against those assents is a fork (5.4.5, §5.12). Until then it is not yet in force: a verifier answers **not shown** for it as in force, with that reason, no order being shown. Where it names keepers, only they pin, and an act they do not yet show is not yet in force. **Which keepers.** Before any Terms of an agreement are in force, the only keepers it has are those its first version names: whether that version is in force is judged per those keepers, and per the clock it names, and so is every assent that counts toward it (§5.8).

2. **Replaces** D25 G4.1, with the pin added and one clause dropped [traced, D26 trace §5.4]: D25's "Terms that name no party as a signer, and carry no `in_force`, are in force at once." goes (every Terms act now names its author as a signer). The pin is the lead's reading on the brief's item 1 ("a first version still waits for the pin"), from "In force once pinned" (18 November); "a counter signature included" is the lead's reading of 09:47 (D26 report, "Found items"). **Code:** `chain.rs:345` to `chain.rs:356`, `walk`: the root is in force where `in_force_raw` says yes, and no order is asked; `force.rs:271` to `force.rs:297`, `in_force_given`: the `in_force` cMIP's yes or no (`force.rs:272` to `force.rs:279`), else every party named as a signer, and with none named, yes at once (`force.rs:289`); `force.rs:302` to `force.rs:331`, `in_force_raw`; per place, an assent counts where the place shows it (`mod.rs:210` to `mod.rs:236`, `counts`), which is a keeper's pin already [traced].
3. **What a verifier answers differently.** *Plain words.* Ana writes Terms naming Ana and Ben, and no keeper. Ana assents; Ben assents. Nothing more is made. Dana asks whether the Terms are in force. *Before:* **shown**, G4.6, as shown. *After:* **not shown**, 5.4.1, "no order being shown": neither Ana nor Ben has made an act, after both assents, that names them. When Ana's next act in the agreement names both assents, Ana's side is pinned; when Ben's does too, the Terms are in force [traced to the rule]. *In the round:* entry 571's work `db3ce515…` has one signer, the author; her assent `6d7a0585…` and her second version `5b9e8c91…`, whose `previous` names that assent, pin the first version by knots [traced to the round's table, 1b].
4. **Size:** a rule: the pin by knots, a new check on every first version that names no keeper; per keeper it is already met by `counts`. One removal: `force.rs:289`'s "none named: in force at once" has no case left.
5. **Vectors.** *Change answer,* by the pin, where the root names no keeper and some party whose assent puts it in force has no later act naming every such assent [counted, `pin_count2.py`; the after answer inferred along the code path named]:
   - `in_force`: 1 "in force by the default: an assent in the name of every party named as a signer", 5 "in force by `in_force`: the cMIP (a stub asking one name) says the assents it requires are present", 14 "the agreement goes on in its last version: the original stays in force", 35 "a counter signature made after the Terms came into force: they stay in force", 46 "the act after an act not held still counts toward in force", 50 "Terms whose `in_force` asks for the agreement's signing: in force once it signed", 53 "a party named as an agreement is not counted by the default: in force with the signers' assents", 102 "after a sale, Terms with the holder of the moment stay in force": shown → not shown.
   - `last_version`: 10 "the last version, in force" (shown → not shown); 26 "an act shaped as a resolving update where there is no fork is an update like any other: with the other, a fork" (fork → not shown: no version in force, so no updates are read).
   - `assent`: 2 "an assent counted, to Terms in force, binds: shown" (shown → not shown, 5.4.3's "not yet in force, no order being shown").
   - `bound`: 12 "bound by an update without an assent of one's own, where the update condition answers valid", 55 "bound through a power: the act's `for` names them, its `under` Terms that bind them, in force, whose power's rule says yes", 56 "bound by one's own assent": shown → not shown.
   - `signature_of`: 49 "an agreement as a party signs through a power its own Terms give: its signature", 52 "an agreement with no power signs by every one of its signers: the same act from each: one signing": shown → not shown.
   - `receiver`: 67 (shown → not shown), 68 (unchecked → not shown); `before_paying`: 91 "before paying: which agreements of a sequence carry a call, from whom, and their data cMIP, one at a time" (shown → not shown, `legs.rs:341` to `legs.rs:342` reading the last version).
   - *Unchanged* though their root is not pinned, their answer already not shown, unchecked or invalid, or resting on no Terms in force: 0, 3, 4, 6, 7, 9, 13, 15, 33, 34, 37, 47, 48, 51, 54, 57, 59, 69, 106, 116, 117, 118, 119, and the order, line and act questions [counted for the knots; inferred for the paths]. *Pinned already:* the fork, late and line cases 17 to 30 (but 26) and 41, 42, 44, whose update's assents name every assent to the root; the keeper cases 60 to 63 and 65 [counted].
   - *If a question goes one way:* 8, 11 (Q4), 30 (Q3), 31 (Q2), 66, 76, 77 (Q6), 71, 72, 73, 75 (Q1); 95 "a contest made against an offer: it reaches the signers that version names, and no one else" on session 2's reading of 5.11 (`legs.rs:383`).
   *Retired:* none. *New:*
   - Ana and Ben assent, nothing after: **not shown**, 5.4.1, no order shown.
   - The same, Ana's later Statement naming both assents, Ben's none: **not shown**, the same reason (one side pinned).
   - The same, each with a later act naming both: **shown**, in force, as shown.
   - The same Terms naming one keeper that shows both assents: **shown**, per keeper, with no later act.
   - (27 Nov, "Two keepers named, both needed") the same Terms naming two keepers, one showing both assents, the other silent: **not shown**, per keeper, the second keeper not yet showing them ("If the terms stipulate two keepers, both keepers are needed. Sorry can’t do"). Not yet in draft 26's 5.8.3 (D26 report, item 5); 5.8 is session 2's.
   - A counter signature by Ben shown after both assents, naming them: **not shown** as cancelling (late, it cancels nothing), and it pins Ben's side (5.4.5); with Ana's later act, **shown**, in force.
6. **Build list, sheet:** R13 (the default for `in_force`: every signer, no agreement) stays, as SN M19 and M26 have it [traced]. The sheet's Q9 ("Does an update need pinning?") and Q4: settled by 5.5.1(b) and this rule's pin [traced]. Not on the build list: the pin for a first version is new since it.
7. **Choices left to the code:**
   - Q1 (below): with an `in_force` cMIP, which assents are "those assents"?
   - Q2 (below): does an act named and not held leave the pin unchecked?
   - Q16 (below): which acts are "an act in that same name within the agreement": a report, a witness act, an act in another agreement?
   - Q8 (below): with several keepers, does every one have to show the assents?

### 5.4.2 Terms that name a role carry `in_force`

1. **The rule.**

   > **5.4.2** Terms that name a party by role MUST carry `in_force`, in every version: an update that names a party by role carries it too. In an update it is read for who fills a role (§5.10); its answer on coming into force is left unread there (5.2.3, 5.5.1).

2. **Replaces** D25 G4.2, as D25 has it, with its reading for updates [traced, D26 trace §5.4; SN M11: "The role's module (`in_force`, G4.2) is read for who fills a spot and for the first version's coming into force; it is not read for an update"]. **Code:** `terms.rs:597` to `terms.rs:599`: invalid for any Terms act, update or not, naming a role and carrying no `in_force` [traced].
3. **What a verifier answers differently.** Nothing for the check. Ana's version 2 of her offer names the buyer's role and carries no `in_force`: invalid, before and after. Its `in_force`'s answer on coming into force is no longer read (5.2.3, 5.5.1).
4. **Size:** none here (the unread answer is 5.5.1's removal).
5. **Vectors:** `invalid.json` "terms: a party by role and no in_force" and "terms: two faults: a role with no kind, and no in_force (the first in section 2's order: G10.1, then G4.2)" keep their answers. None new.
6. **Build list, sheet:** the sheet's Q17 ("Does a filling still count for in force?"): settled (A) by SN M11 [traced].
7. **Choices left to the code:** none.

### 5.4.3 What an assent binds

1. **The rule.**

   > **5.4.3** **What an assent binds.** An assent binds its signer only while the Terms it names are in force, with one exception: an assent by which its signer earned a filling binds that signer, and binds the known parties to them, as the version it names says, for as long as that version's words say, on the clock that version names, whether or not a later version is in force; no update reaches it (§5.10). About an assent, a verifier answers **shown** where it is counted in a party's name and those Terms are in force, or where it earned a filling under a version since replaced, with that version named (§5.10); otherwise **not shown**, with the reason (those Terms are not yet in force, no order being shown; they have been replaced; they are a tip of a fork, or a late update; the assent is cancelled, 5.4.5). An assent made within a branch set aside is shown as **disputed**, and binds no one (§5.12).

2. **Replaces** D25 G4.3, changed [traced, D26 trace §5.4]: the exception for an assent that earned a filling ("For the unknown party there is no update, only the agreement she signed", 27 November: "There is no valid update for her anymore. Only a valid agreement"); **shown** for an assent to a replaced version with that version named (SN M15); two reasons added. **Code:** `order.rs:148` to `order.rs:188`, `assent`: shown only where counted and the Terms are in force (`order.rs:183`); otherwise not shown with the in-force reason (`order.rs:185`) [traced]. `spots.rs:14` to `spots.rs:15`: fillings are read from the last version only [traced].
3. **What a verifier answers differently.** *Plain words.* Ana sells seats by an offer; Carla buys under version 2 by an assent that earns her a filling. Ana and Ben then put version 3 in force. Dana asks about Carla's assent. *Before:* **not shown**, G4.3, "and it binds no one", the Terms it names having been replaced. *After:* **shown**, 5.4.3, with version 2 named: it earned a filling, and binds her and binds Ana and Ben to her for as long as version 2's words say [traced to the rule; SN M15]. *In the round:* the lineups' buyers' assents name the version the count takes as last (round, 1d): the after answer is the same word with the version named [traced to the round].
4. **Size:** a rule: an assent that earned a filling is read against the version it names, not the version in force.
5. **Vectors.** *Change answer:* 2 (by 5.4.1). 40 "an assent that is a tip of a signer's fork: not shown, it does not count" and 118 "an assent made under Terms the verifier lacks: unchecked" keep theirs [traced]. *Retired:* 74 "a filling's rights: a later version changes them where the version it was earned under names an update condition that answers valid": no update reaches a filling (this rule; 5.5.7(f); 5.10, session 2's), so the sentence it tests is gone; counted here once [traced]. *New:*
   - (26 Nov, line 7, 1) Carla's assent that earned a filling under version 2, version 3 in force, her role's K5 cMIP held: **shown**, 5.4.3, version 2 named.
   - (26 Nov, line 7, 2) The same without the K5 cMIP: **unchecked** (whether it earned a filling).
   - Ben's assent as a known party to version 2, version 3 in force: **not shown**, "they have been replaced" (the exception is for a filling only, SN M15's "a known party has a say in updates and is bound by them").
6. **Build list, sheet:** the sheet's line 7, its Q12 and Q13: settled by SN M15 (shown, version named; a filling only) [traced].
7. **Choices left to the code:**
   - Q10 (below): "binds the known parties to them": which question asks it, and what does it answer?

### 5.4.4 An agreement named is not counted by default

1. **The rule.**

   > **5.4.4** A party named as an agreement is not counted by the default of 5.4.1. An `in_force` rule MAY ask for its signing; it has then signed when what its own Terms require is present (5.1.2).

2. **Replaces** D25 G4.4, as D25 has it [traced]. **Code:** `force.rs:282` to `force.rs:296`: the default counts parties named as signers only [traced].
3. **What a verifier answers differently.** Nothing by this rule; case 53 moves by the pin (5.4.1).
4. **Size:** none.
5. **Vectors:** 53 (counted at 5.4.1). None new.
6. **Build list, sheet:** R13 (as at 5.4.1).
7. **Choices left to the code:** none.

### 5.4.5 Counter signature

1. **The rule.**

   > **5.4.5** **Counter signature.** No assent binds anyone, and nothing in Terms counts, until those Terms are in force (5.4.1, 5.4.3). A counter signature is a Statement of kind `counter_signature` whose `terms` names the Terms an assent names, and which cancels that assent. Made by the signer of the assent in their own name, it follows that assent in the signer's own line (§5.7): directly, or after other acts of that signer. Made for a party under a power of kind `counter_signature` (§5.6), or as an agreement's signature (5.1.2), it cancels the assent counted in that party's name that it names, directly or through acts that name it. It cancels that assent, and no one else's: an assent so cancelled is not counted by 5.4.1. It sets nothing aside: the assent stays an act, readable, shown as cancelled, and so does what it was made within. An assent made for a party by an agent, under a power (§5.6), is cancelled in the same way as one the party made itself, and in no other: by a counter signature in that party's name, which names that assent, directly or through acts that name it, while a counter signature is available (below); the party itself MAY make it, in its own name, as may the agent, as that assent's signer, or another under a power of kind `counter_signature` (§5.6). **Which assent.** A signer may assent, cancel, and assent again. An assent is read against the first counter signature in the same name that follows it; a later counter signature is read only against the assents in that name made after the one before it. **Until the completion.** A counter signature is available only until the assents that put the Terms in force (5.4.1, its first sentence) are shown before it, by the keepers the Terms name, at the positions they give, or, where they name none, by knots: one shown after them is late, cancels nothing, and pins as any act of its signer within the agreement does (5.4.1). One made for Terms that are in force changes nothing: Terms in force change only as §5.5 says. Where a party is an agreement, "signed", for that party, is whatever that agreement's own Terms require: every one of its signers, or what its own rule accepts: one level (5.1.2). A verifier reads that from that agreement's Terms in force (5.5.3); where it lacks them, the answer is **unchecked** (§3.6). A party named as an agreement is not counted by the default of 5.4.1 (5.4.4), so this has effect only where the Terms' own `in_force` rule asks for that party's signing. Such a party makes a counter signature by the same act as its assent: under a power of kind `counter_signature`, or by all its signers (5.1.2). **The order.** Whether the Terms were in force before the counter signature is an answer about what is latest: per keeper, or as shown (5.5.3). In both, the assent the counter signature cancels is counted as not yet cancelled. With keepers, the positions they give settle it: the counter signature changes nothing where its position is after the position at which they show the completion (the assents that put the Terms in force, 5.4.1, its first sentence), and cancels where it is before (§5.8). With none, only knots give an order (§5.13): where the counter signature is shown after acts enough for the Terms to come into force (5.4.1, its first sentence), it is late, and changes nothing; where, counting every act held but those shown after the counter signature, the Terms would not come into force, it came before, and the assent it cancels is not counted. Where the Terms would not come into force even with every act held counted, nothing had completed them, and the counter signature cancels. Otherwise the counter signature and the acts that would put the Terms in force are a fork (§5.12): two acts competing to change the same state, with no order shown. While it stands, neither takes effect: the Terms are not in force. A verifier answers **fork**, shows both, and MUST NOT choose between them; the fork is resolved as §5.12 says. **Its answer.** About a counter signature, **shown** means that it cancels the assent it is read against; **not shown** means that it is not shown as cancelling (it is late and changes nothing, or it follows no assent), with the reason; **fork** means that it and the Terms' coming into force are a fork. Where counter signatures lean on one another so that the reading does not settle, the MICS says what a verifier answers (§2). A later assent by the same signer to the same Terms is counted as any assent is.

2. **Replaces** D25 G4.10, changed [traced, D26 trace §5.4]: where neither order is shown, a **fork**, not "not shown" (D25: "Otherwise whether those Terms are in force is **not shown**, and the verifier says why."; "A fork is a fork", 27 November); the window closes when the completing assents are shown before it; a late counter signature pins; per keeper. **Code:** `force.rs:400` to `force.rs:438`, `counter_cancels`: "nothing had completed them" (`force.rs:408` to `force.rs:413`), per place (`force.rs:414` to `force.rs:426`), by citing (`force.rs:428` to `force.rs:436`), and otherwise `Tri::NotShown` (`force.rs:437`); `force.rs:347` to `force.rs:379`, `first_counter_signature`, which picks the first by id where none orders them (`force.rs:374` to `force.rs:376`); `order.rs:191` to `order.rs:218` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana, Ben and Carla must all assent. Ana and Ben do. Carla assents, and Ana, at about the same time, cancels her own assent; neither act names the other. Dana asks about Ana's counter signature. *Before:* **not shown**, G4.10, "citing gives no order between the counter signature and the Terms coming into force". *After:* **fork**, 5.4.5: the counter signature and the coming into force are two acts competing to change the same state; neither takes effect; the Terms are not in force; the verifier shows both and does not choose ("Agreed, Carla is the monkey wrench that gets it all stuck", 18 November, as the build list's D2 quotes it) [traced to the rule].
4. **Size:** a word (the answer **fork** for a counter signature), and a rule (the late counter signature pins, 5.4.1).
5. **Vectors.** *Change answer:* 36 "a counter signature and a completing assent, neither naming the other: whether the Terms are in force is not shown" (not shown → **fork**) [traced to the code path, `force.rs:437`]; 35 (by 5.4.1). 37 "with the counter signature's order not shown, in force is not shown" keeps **not shown**, with the fork beside it [inferred]. 32, 33, 34 keep theirs. *New:*
   - (Build list T2) Gil assents for Ana under a power; Gil then cancels it, with no power of kind `counter_signature`, before Carla's completing assent, which names Gil's counter signature: **shown**, it cancels ("as may the agent, as that assent's signer").
   - Two counter signatures in Ana's name, one by Ana and one by Gil under a power, nothing ordering them: the answer of Q9 (below).
   - Ana's counter signature shown after every completing assent, by knots: **not shown**, late, it changes nothing; and it pins Ana's side (5.4.1).
   - With an `in_force` stub asking two of three, a counter signature after the two: **not shown**, late (the completion is "the assents that put the Terms in force (5.4.1, its first sentence)"; build list R12, the code's reading).
6. **Build list, sheet:** D2 (settled otherwise than the row's "should": a fork, not "it cancels"); D3 (the withdrawn signer: the fork leaves the Terms not in force, so nothing binds her while it stands); D4 and T5 (the first counter signature by id: draft 26 keeps "the first counter signature in the same name that follows it", and an order only from knots or keepers; Q9); T2 (the agent's own counter signature: draft 26 keeps it); R12 (settled: the completion is the `in_force` rule's) [traced].
7. **Choices left to the code:**
   - Q9 (below): two counter signatures in one name that nothing orders.
   - How a fork of a counter signature against a coming into force is resolved in bytes is not said (D26 report, item 7; 5.12, session 2's).
---

## 5.5 Updates: the gate and the pin

### 5.5.1 The gate and the pin

1. **The rule.**

   > **5.5.1** **The gate and the pin.** An update replaces the version it names only where it passes two checks:

   >
   > (a) **The gate.** The update condition of the version it names, or that condition's default where the version names none, answers **valid** for it (5.5.7). No other assent is asked.
   >
   > (b) **The pin.** Its order after the last replacement of that version is shown, by the keepers that version names (5.5.5(d)), or, where it names none, by knots (§5.13); where it names keepers, only they pin, and an act they do not yet show is not yet in force. It is shown after the acts that put that version in force (5.4.1 for a first version; this rule for one that is itself an update); and every other update of that version that passes the gate is shown after it, and so is late. The order between two updates of one version is read from the acts that put each through the gate, as 5.5.4 says: it does not wait on either update's own pin.

   >
   > **Valid, and in force.** Valid is the gate's answer, and says only that the update is allowed. In force needs both checks. An update can be valid and not in force: allowed, with its order not shown. A verifier then answers **valid** for it, and **not shown** for it as in force, with the reason: no order is shown, or it is a tip of a fork. Two updates of one version that both pass the gate, neither shown after the other, are a fork (§5.12): both stop, and the version both name stays in force (5.5.4(e)). An update's own `in_force` is left unread (5.2.3): whether it replaces is answered by this rule alone.
2. **Replaces:** new (N1) [traced, D26 trace §5.5], from "The gate and the pin; a fork, not a race" (26 November): "Ok, that”s what I was trying to remember we forced the deadlock and push them to resolve it"; and "Valid and in force, two words, two jobs" (26 November, 18:00): "Agreed." It takes the place of D25 G4.8's last sentence: "Whether the replacing Terms are themselves in force is G4.1's, as draft 18 has it (G4.5; section 8.4)." **Code:** `force.rs:602` to `force.rs:611`, `then_in_force`: after the condition answers valid, an update not in force by its own `in_force` is answered "valid, and not in force by its own `in_force`"; `chain.rs:170` to `chain.rs:177`, `is_update`; `chain.rs:470` to `chain.rs:622`, `step_from`: one update that is valid and in force replaces at once (`chain.rs:554` to `chain.rs:559`), two are a fork; no order after the original is asked of a single update; `chain.rs:194` to `chain.rs:218`, `first_position`, "valid and in force"; `chain.rs:737`'s words ("it is in force by its own `in_force` (G4.8)") [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 1 is in force and names no keeper. Version 2 carries its own `in_force`, asking an assent from Carla, who never gives one; Ana and Ben assent to version 2, and their assents name nothing of version 1's. Dana asks about version 2. *Before:* **not shown**, "valid, and not in force by its own `in_force`". *After:* **valid**, by default (the gate), and **not shown** as in force, "no order is shown", until version 2, or (on Q3's lean) an assent that puts it through the gate, is shown after the assents that put version 1 in force; then it replaces [traced to the rule]. *In the round:* entry 571's second version `5b9e8c91…` names, in `previous`, the author's assent `6d7a0585…` to the root: it is shown after the act that put the root in force, so its pin holds by knots [traced to the round's table, 1b].
4. **Size:** a rule (the pin for an update), and a removal (an update's own `in_force`, `then_in_force`).
5. **Vectors.** *Change answer:* none by this rule alone that 5.4.1 does not already move. *If Q3 reads (i), the update itself:* 30 "after a late rival, the line goes on from the update that came first" (shown → not shown: `late/v2a` does not itself name the root's assents) [counted, `update_pin.py`: reading (i) no, reading (ii) yes]; and every pinned fork case with it. *If Q4:* 8 and 11, at 5.5.7. Plain words only: 8 "an update by the default: everyone who signed the original signs it: valid, by default" and 11 "an update by an update condition (a stub: one of the original's signers): valid, the condition named" say "in force by its own `in_force` (G4.8)", which goes [traced, the sheet of 26 November, line 18]. *New:*
   - (26 Nov, line 18, 1) version 2 valid by a condition, not in force by its own `in_force`, shown after version 1's acts: **valid**, and it replaces.
   - The same, its assents naming nothing of version 1's: **valid**, and **not shown** as in force, "no order is shown".
   - (26 Nov, line 18, 2) at 5.5.4.
   - Two updates of version 1, both valid, one shown after version 1's acts and the other not: **fork** (their order "does not wait on either update's own pin").
6. **Build list, sheet:** D6 (the second gate on an update: removed, as the row's "should"); the sheet's line 18, its Q5 (settled: **fork**, "A fork is a fork"), Q6 (settled: a fork of Terms is still resolved, 5.12), Q7 (settled at 5.2.3), Q9 (settled: the update needs the pin) [traced].
7. **Choices left to the code:**
   - Q3 (below): "It is shown after the acts that put that version in force": the update itself, or the update with the acts that put it through the gate?
   - Is "valid, not in force" given as two answers to one question, or as one answer with the second beside it (today's `with`)?

### 5.5.2 When Terms stop

1. **The rule.**

   > **5.5.2** **When Terms stop.** Terms stop being in force when an update that replaces them is in force (5.5.1). While a fork of them stands (5.5.4), no Terms that replace them are in force. Terms so replaced may still govern a filling earned under them (5.4.3, §5.10).

2. **Replaces** D25 G4.5, changed: "in force" of the replacing Terms is now both checks [traced, D26 trace §5.5]. **Code:** `order.rs:76` to `order.rs:78`: Terms with a next version in the chain answer not shown, replaced [traced].
3. **What a verifier answers differently.** As 5.5.1: version 1 stops only when version 2 is pinned. Before, it stopped when version 2 was valid and in force by its own rule.
4. **Size:** a word (what "in force" means, already counted at 5.5.1).
5. **Vectors:** 9 "Terms replaced: not shown, naming the Terms that replace them" keeps **not shown**, but its reason changes: by 5.4.1 its root is not in force at all [inferred]. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.5.3 Which Terms are in force

1. **The rule.**

   > **5.5.3** **Which Terms are in force.** Which Terms of an agreement are in force is an answer about what is latest. A verifier MUST take it per the keepers the Terms name, qualified **per keeper**, with those keepers named (§5.8); or, where they name none, from the knots, **as shown** (§5.13). It MUST NOT give it as latest without saying what the answer stands on. A keeper or an anchoring of the reader's own choosing gives an answer only as that reader's, named so: it never gives the Terms' own answer, never puts Terms in force, and never makes an update late (§5.13). **Which keepers.** Before any Terms of an agreement are in force, the only keepers it has are those its first version names (5.4.1). Whether a later version has replaced the one before is judged per the keepers the one before names (5.5.5(d)). Where versions name different keepers, the answer that given Terms are in force carries the keepers those Terms name, or **as shown** where they name none; each replacement's own answer carries the keepers it was judged by.

2. **Replaces** D25 G4.6, changed [traced, D26 trace §5.5]: per the keepers the Terms name, or as shown; a reader's own anchoring "never gives the Terms' own answer" (SN M20: "A reader's chosen keeper or anchoring gives an answer only labelled as the reader's; it never puts Terms in force and never makes an update late for the Terms' own answer"). **Code:** `mod.rs:243` to `mod.rs:259`, `scope_of`: per the place the Terms name; else, where they name no clock, per the anchoring the reader accepts (`mod.rs:251` to `mod.rs:257`); else as shown; `answer.rs:95`, `Qualifier::PerAnchoring`; `chain.rs:401` to `chain.rs:407`, the last version's qualifier [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's Terms name no keeper. Dana accepts a relay of her own as anchoring and asks which Terms are in force. *Before:* **shown**, per anchoring, her relay named. *After:* **shown** (once pinned), **as shown**; what her relay says may stand beside it, labelled as hers [traced to the rule].
4. **Size:** a removal (the reader's anchoring in `scope_of`, for the Terms' own answers), and a word (the qualifier "per place" becomes "per keeper").
5. **Vectors.** *Change answer:* none beyond 64. *Retired:* 64 "no place named: in force per the anchoring the reader accepts, with it named": the sentence it tests (D25 G13.4's reader's anchoring giving the Terms' answer) is gone [traced]. *Relabelled:* 60 "in force per the place the Terms name" and 61 "an assent the place does not show does not count: not in force, per place": "per place" becomes "per keeper", answer kept. 62 and 63 keep **unchecked** (63's G7.2 sentence is 5.8's, session 2's; build list D8). *New:*
   - The case 64 replaces: no keeper named, the reader's anchoring held: **shown, as shown** for the Terms' answer, the reader's answer beside it named as the reader's.
6. **Build list, sheet:** T6 (as at 5.1.4); D8 (G7.2's contradicting place, 5.8's) [traced].
7. **Choices left to the code:**
   - Does the verifier still compute the reader's own answer and show it beside the Terms' answer, or drop the reader's anchoring entirely? The rule allows it ("gives an answer only as that reader's, named so"), and does not ask for it.

### 5.5.4 Two updates of one version, and a late update

1. **The rule.**

   > **5.5.4** **Two updates of one version, and a late update.** Where two Terms acts each name the same version in `replaces`, each passes that version's gate (5.5.1(a)), and neither is shown after the other, they are a fork (§5.12): two updates, each allowed by the version they name. A late update (below) is no update, and no tip. **A late update.** Call **O** a version already replaced; **F** the update that replaced it (the Terms act that passed O's gate and pin, 5.5.1; or, where O's replacement was a fork, the resolving update that resolved it, §5.12); and **L** a Terms act whose `replaces` names O, and which passes O's gate. L is a **late update** where L is shown after the acts that put F, the version L should have named, through O's gate and pin (5.5.1), as (a) and (b) say. A late update replaces nothing, and is no tip of a fork: O stays replaced by F, and the line goes on from F as if L were not there. Where nothing shows it, L and F are a fork whose shared act is O, as for any two updates of one version, however late L may in fact be: every version after O is in the branch of F, and stops with it (§5.12).

   >
   > (a) **Which knots count.** Every fingerprint in a field of every act the verifier holds is a knot, Terms or Statement, of this agreement or another, of any layer (§3.4, §5.13). Where O names no keeper, L is shown after O was replaced, by knots, where L, or an act without which L does not pass O's gate, is shown after acts enough for F to pass O's gate and to be shown after the acts that put O in force (5.5.1), or, for a resolving update, to resolve (§5.12). A verifier gives that **as shown**, from the acts alone (§5.13). Where O names keepers, knots show L late only as a named keeper's contradiction ((c)).
   >
   > (b) **Which keepers, and which clock.** Per keeper: the keepers O names (5.5.5(d)). L came after O was replaced, per those keepers, where the first position at which, counting only the acts they show at or before it, L passes O's gate comes after the first position at which, so counted, F passes O's gate and is shown after the acts that put O in force (§5.8); a verifier gives that **per keeper**. Per clock: where the clock O names (§5.8) gives a time for each of those two events and the two times are ordered, **per clock** (§7). No other anchoring gives the Terms' own answer: a verifier MUST NOT read L as late by a time written in an act, by a keeper or a clock the Terms do not name, by what is likely, or in any other way. An anchoring of the reader's own choosing gives only that reader's answer, named so (5.5.3).
   >
   > (c) **The answer.** About L, a verifier answers **late**, names this rule and what shows that L came late (the act of L, or the act it needs, shown after F's acts; or the positions the keepers give, or the times the clock gives), and qualifies the answer **as shown** where knots show it, or **per keeper** or **per clock** where only they do. Which Terms are in force is then answered as if L were not there. An assent to L binds no one (5.4.3), and nothing built on L counts: a late update is no tip and gives no previous. A missing act is never a yes and never a no: where a chain of acts that could show L late needs an act that is named in a field of an act held, and the verifier does not hold it, whether L is late is **unchecked** (§3.6, §5.13), and so is which Terms are in force from O on (5.5.5(e)). Where knots, the keepers or the clock show L late, nothing else (a later resolving update) makes L an update again. **Knots against a keeper.** Where O names keepers, knots show L late against them only as that keeper's contradiction: a keeper's record that contradicts a knot the verifier holds (it places L before an act that L, or an act L needs, is shown after) gives **not shown**, with the reason that the keeper contradicts the acts, and the record is kept as evidence (5.8.4).
   >
   > (d) Whether an update made after another, and not shown to be late, may still be valid is the update condition's to say (5.5.7; §6).
   >
   > (e) **While a fork stands.** An assent to a tip counts for whether that tip was signed, so that the fork is seen, and for nothing else while the fork stands (§5.12). A resolving update is not a tip (§5.12). A verifier MUST answer **fork** for which Terms replace the version both tips name, show both tips, and MUST NOT choose between them, by position or in any other way. Both tips stop (§5.12): until the fork is resolved (§5.12), neither is in force, nothing built on either counts, and the Terms both replace, the last shared version, stay in force. A verifier MUST answer from them every answer that rests on the Terms in force: the powers (§5.6); the update condition (5.5.7); the roles, and who fills them (§5.10); the receiver for an act (5.1.4); whether they hold the Control task, and their calls (§5.11); their data cMIP (§5.11); the keepers and the clock (§5.8); and what any cMIP they name produces (tasks K1 to K8, §6). It MUST show the fork with each such answer, per keeper or as shown.
2. **Replaces** D25 G4.7 and its (a) to (e), changed [traced, D26 trace §5.5]: L's test is "passes O's gate" (D25: "valid and in force"); (a) any fingerprint of any act of any layer is a knot ("Knots are knots", 27 November: "Knots a cross acts by nature, and possibly cross layer."); (b) per the keepers O names and its clock, never a reader's anchoring; (c) the answer **late**, and the missing act unchecked ("Missing act is always “I don’t know”"); knots against a keeper only as the keeper's contradiction; (d) and (e) as D25 has them. **Code:** `chain.rs:232` to `chain.rs:309`, `late_against`: (a) by knots, L's own namings or one assent's (`chain.rs:235` to `chain.rs:260`), answered `Word::Shown` under G4.7; (b) per place or per the reader's anchoring (`chain.rs:261` to `chain.rs:281`), per clock (`chain.rs:282` to `chain.rs:297`); (c) unchecked where a named act is lacking (`chain.rs:298` to `chain.rs:306`); `chain.rs:624` to `chain.rs:656`, `not_late`; `mod.rs:282` to `mod.rs:295`, `known` and `lacking_in`; `held.rs:140` to `held.rs:190`, `namings` (payload fields of Agreements acts only; no `body`; the act format's `prev` not read) [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 1 is replaced by version 2, which Ana signed, then Ben; Ben's assent to version 2 is his act in his own line. Later Ana writes version 3 naming version 1, not version 2, in `replaces`; her version 3's `previous` names her assent to version 2. Dana asks about version 3. *Before:* **shown**, G4.7, "replaces nothing, and is no tip". *After:* **late**, 5.5.4(c), as shown, naming the act that shows it [traced to the rule]. *In the round:* entry 571's third version `bba99964…` names the root `db3ce515…` in `replaces` and, in `previous`, the author's assent `352b6a32…` to the second version `5b9e8c91…`: late by knots; with the work `eeb5cef3…` named in its `relies_on` held as a Text act, it is no longer lacking, since (the lead's line in "Knots are knots") "Any fingerprint in a field of any act the verifier holds is a knot" [traced to the round, 1b; the answer after inferred].
4. **Size:** a word (the answer **late**), and rules: L's test (the gate, not "valid and in force"); knots of every layer (`namings`, and `known` for acts of other layers, session 2's 5.13 with it); the keeper's contradiction; the reader's anchoring removed from (b).
5. **Vectors.** *Change answer:* 29 "a late rival, shown by knots: it names enough acts for the other update to be valid and in force" (shown → **late**, as shown) and 65 "a late rival shown by the place the original names: replaces nothing, per place" (shown → **late**, per keeper) [traced: both are asked `update` and answer `Word::Shown` today, `chain.rs:238`, `chain.rs:272`]. *If Q2:* 31 "an update that names an act the verifier does not hold, which might show it late: which Terms are in force is unchecked" (unchecked → not shown, since its root is not pinned, unless the act not held could be the pin's act). *New:*
   - (26 Nov, line 1, 1; and line 19, 2) version 3 naming version 1, its `relies_on` naming a Text act held beside it: **late**, as shown, where today it is **unchecked**.
   - (26 Nov, line 1, 2) the same with the work declared as a piece: **late**, as shown (needs a `pieces` field in the grammar vectors' format: the library has one, `scenario.rs:60`; the file has none).
   - (26 Nov, line 1, 3) the same with a private act held without its key in `relies_on`: **unchecked**, since it could carry a knot.
   - (26 Nov, line 18, 2) a late update shown by knots where the update that came first is valid and not in force by its own `in_force`: **late**, where today it is not shown late.
   - (27 Nov, "Knots are knots") a late update shown by knots across layers: version 3's `relies_on` names a payment (Money) that names version 2 as the version it read, the payment held through the Money layer: **late**, as shown, the knot being in another layer's act.
   - Knots against a keeper: version 1 names a keeper whose record puts version 3 before Ana's assent to version 2, while version 3's `previous` names that assent: **not shown**, the keeper contradicts the acts, the record kept as evidence.
6. **Build list, sheet:** R1 (settled: the word **late**); R3 (a place orders every two updates: settled, per keeper the later is late, (b)); R4 (one act's namings or several: draft 26 writes "L, or an act without which L does not pass O's gate", singular, the code's reading; Q12); R5 (which lacking act might show it late: settled by "Knots are knots", any fingerprint named); R25 (the act format's `prev` as a knot: draft 26's "any fingerprint of an act, carried in a field of any act the verifier holds, is a knot" reaches it; 5.13, session 2's). The sheet's line 1 and its Q1, Q2 (settled (A), "Knots are knots"), Q3 (settled: **late**, SN M5), Q4 (settled by 5.5.1(b)) [traced].
7. **Choices left to the code:**
   - Q12 (below): L "or an act without which L does not pass O's gate": one act, or several together?
   - "acts enough for F to pass O's gate and to be shown after the acts that put O in force": is F's own second half of the pin (every other update shown after it) left out of L's test, as the trace reads it ("to avoid reading F's own pin (which asks that L be shown after F) into the test for L")? The text says so; the code must not reuse 5.5.1(b) whole here.

### 5.5.5 Replacing; the default signers

1. **The rule.**

   > **5.5.5** **Replacing.** A Terms act replaces the Terms its `replaces` names (the **original**) only as 5.5.1 says: by the gate, and the pin. The gate is the update condition's one answer, valid or not valid (5.5.7), and nothing else: who must sign an update is part of it. No power makes a Terms act replace (§5.6).

   >
   > (a) **The default signers.** Where the original names no update condition, the signers its default asks for are the known parties (§3.2), the author among them: parties named as signers or as agreements; never a party named by role, and never a signer who fills a role. A party named as an agreement is a known party, and among the default signers, whether or not it has ever signed: how it signs is §5.1's (5.1.2), and an update it does not sign is not valid by default. A stranger's assent makes no one a party. They are the ones the default asks (5.5.7(e)). Two assents of one signer that name the same `previous` fork that signer's line (5.7.2), and neither counts for any update's gate until that line is resolved (§5.12). A second assent that names the first, directly or through acts that name it, is in order: it is a knot, and the update it assents to is shown after the update the first assents to wherever the first assent is among the acts that put that update through its gate (5.5.4); where it is not, and nothing else orders the two updates, they are rivals, a fork of the versions (§5.12).
   >
   > (b) **Valid.** Where the original names an update condition, the gate's answer is that cMIP's, who must sign included (5.5.7). Where it names none, the default answers: an update is valid when every known party signs it (5.5.7(e)).
   >
   > (c) Under the default, a Terms act that lacks one of those signatures does not pass the gate, and replaces nothing: the Terms it names stay in force, and it is not a tip of a fork. A verifier answers **not shown** for it as a replacement, per keeper or as shown: an assent it does not hold may exist (§3.6). A Terms act that a named update condition answers not valid replaces nothing either, whoever signed it, and is not a tip of a fork (5.5.7(c)); nor does a late update (5.5.4).
   >
   > (d) **Which keepers.** Whether a Terms act has replaced the original is judged per the keepers, and the clock, that the original names (§5.8), whatever keepers the new version names: the Terms act, and each act its gate and its pin count, count once those keepers show them. Where the original names several keepers, an order counts where they agree; where they disagree, it is **not shown**, with that reason, and the disagreement is kept as evidence (§5.8).
   >
   > (e) **One update that cannot be checked.** Where two Terms acts name the same original, and for one of them the verifier cannot tell whether it is an update (it lacks a cMIP or an act, §3.6), which Terms are in force is **unchecked** from there on, even where the other is answered valid: the first might be an update too, and the two a fork. The verifier names the last version it has established.
2. **Replaces** D25 G4.8 and its (a) to (e); (f) and (g) go [traced, D26 trace §5.5]. (a) is new in substance: D25's "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; a party named as an agreement, where it signed, G1.2); and each party bound by the original with no assent of their own" (and more) becomes the known parties ("Who signs an update by default: the known parties", 26 November: "It’s the protect the unknown party expressed the old way."); D25's "Where no one signed the original (its `in_force` rule asked for no one's assent), the default asks for no one's signature" goes ("There is no unsigned act"). The agreement named and never signed is a default signer on the lead's reading of 09:47 (D26 report, "Found items"). The double assent's last two sentences are new. (d): several keepers, from "The place vouches for the chaining only" (its addition, 17:49): "Two disagreeing has its value though". **Code:** `force.rs:473` to `force.rs:523`, `signed_by`: the fillers' arm (`force.rs:486` to `force.rs:492`, through `role_fillers`, `force.rs:525` to `force.rs:540`), agreements only where an assent in their name counts (`force.rs:493` to `force.rs:496`), the inherited arm (`force.rs:502` to `force.rs:519`); `force.rs:547` to `force.rs:598`, `update_raw`: with no one in "everyone who signed", `missing` is empty and the update is valid by default with no assent (`force.rs:574` to `force.rs:577`); G5.5's delegation path (`force.rs:578` to `force.rs:585`); `chain.rs:548` to `chain.rs:553`, (e) [traced]. Lines (`line.rs:67` onward, `read_lines`) already fork two acts of one signer naming the same `previous` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana's offer names Ana as author and signer, Ben as a signer, the co-op x as a party, and a buyer's role; no condition. Carla buys a seat (a filling). Ana and Ben sign version 2. Dana asks about version 2. *Before:* not shown, "by default, everyone who signed the original signs an update; no assent to it is held in the name of" Carla (and x only if x had signed). *After:* not shown, lacking x's signing (x is a known party whether or not it signed); Carla is not asked. When x signs as its own Terms require, version 2 is **valid**, by default [traced to the rule]. *The double assent:* Ben assents to version 2a, and then to version 2b, his second assent naming his first in `previous`: the two updates are ordered, 2b after 2a, wherever Ben's first assent is among those that put 2a through the gate; if both his assents name the same `previous`, his line forks and neither counts until it is resolved [traced to the rule]. *In the round:* the three voters `d32871af…`, `98c069ee…`, `d1b1b2fc…` each assented twice, to the root and to the third version (round, 1d): two assents of one signer, to different versions, which this rule reads by their `previous` [traced to the round; the after answer not read].
4. **Size:** a rule (who the default asks), and removals (the filler arm, the inherited arm, G5.5's path, the empty-default path).
5. **Vectors.** *Change answer:* none of today's by this rule's default [traced, the sheet of 26 November, line 8: no case puts a filler among "everyone who signed"; no original being updated names an agreement, `update_pin.py`]. 7 "an update by the default, lacking one of those who signed the original: not shown, never not valid" and 15 "a power of kind `replaces` gives no power: the default still asks everyone who signed the original" keep **not shown**, their words "everyone who signed the original" becoming "every known party". *Retired:* 58 "a delegation ended by the delegator alone: a version that removes the power, with the delegator's part alone, is valid by default": G5.5 is gone (build list D1); its bytes would answer **not shown** [traced]. *New:*
   - (26 Nov, line 8, 1) an offer with a filled role and no condition, updated by its maker alone, the maker its only known party: **valid**, by default.
   - (26 Nov, line 8, 3) an offer whose K5 cMIP is lacking, an outsider's assent to the original held: **valid** where today **unchecked** (`force.rs:491`): who fills the role no longer matters to the default.
   - (26 Nov, line 8, 2) at 5.6.1.
   - Terms naming the co-op x as a party, x never having signed, updated by every signer: **not shown**, lacking x's signing (5.5.7(e)).
   - (27 Nov, "the double assent", in order) Ben's two assents, the second naming the first in `previous`, to two updates of one version: **shown** after (the second update is late, 5.5.4, where Ben's first assent put the first update through the gate).
   - (27 Nov, "the double assent", forked) Ben's two assents naming the same `previous`: **fork** of Ben's line; neither counts for either update's gate; both updates **not shown** as replacements until it is resolved.
   - (27 Nov, "Two keepers named, both needed") the original names two keepers; one shows the update and its assents, the other is silent: **not shown**, per keeper, the second keeper not yet showing them; and where the two give contrary orders: **not shown**, the keepers disagree, both records kept.
   - (27 Nov, "The known parties of a version are the signers it names") version 2, signed by Ana and Ben, adds Hana as a signer; she assents to it; version 3 signed by Ana and Ben alone: **not shown**, lacking Hana's assent (she is a known party of version 2).
6. **Build list, sheet:** T7 and R28 (the inherited arm and the leaver: gone with "everyone who signed"; the default asks the original's known parties, so a party that a version took out is not asked); D1 (G5.5 gone); T3 (the 16-step limit in `signed_by`, `force.rs:503`, goes with the inherited arm). The sheet's line 8 and its Q14 (settled: every filling, §3.2 Unknown party: "Any filling of a role is an unknown party's, whenever it was made"), Q15 and Q8 (settled: "There is no unsigned act"), Q16 (open: Q13 below) [traced].
7. **Choices left to the code:**
   - Q7 (below): are the known parties "parties named as signers or as agreements" (this rule) or "the signers it names" (the ledger, 16:44)?
   - Q8 (below): with several keepers, every one, or those that show it?
   - "Two assents of one signer that name the same `previous`": is that the signer's line fork of 5.7.2 only (the same act read twice), or a test the gate makes itself?

### 5.5.6 No act ends an agreement but an update

1. **The rule.**

   > **5.5.6** **No act ends an agreement but an update.** Terms stop being in force only as 5.5.2 says: when an update that replaces them is in force. No act ends Terms, or an agreement, without replacing them, and a verifier MUST NOT answer that Terms or an agreement have ended. Asked whether Terms that have been replaced are in force, a verifier answers **not shown**, names the Terms that replace them (5.5.2), and shows the agreement as going on in its last version. An agreement only gets new versions: a verifier reads every replacing version alike (5.5.5, §5.6), whatever its conditions say becomes of the work and its shares; what they say is theirs (§5.2, task K1). A version that dissolves an agreement is such an update: it replaces only as 5.5.1 says, by the update condition of the version it names, as that condition's cMIP dictates, and it is read from its fields, as every version is. A version that cannot be updated is one whose update condition answers not valid to every update (5.5.7(i)). Every version replaced stays an act of the agreement, readable as it was (§5.2).

2. **Replaces** D25 G4.9, reworded on the lead's reading ("What a dissolution is", 18 November: "The update condition decides, as dictated by the cMIP that governs it. My line was a loose example") [traced, D26 trace §5.5]. **Code:** `order.rs:76` to `order.rs:78`; the module never answers "ended" or "locked" (`mod.rs`, its doc lines) [traced].
3. **What a verifier answers differently.** Nothing. Ana and Ben's version 3 dissolves their work: read as any update, by the gate and the pin.
4. **Size:** none.
5. **Vectors:** 9 and 14 move by 5.4.1 only (14 counted there). None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.5.7 The update condition: valid or not valid

1. **The rule.**

   > **5.5.7** **The update condition: valid or not valid.** Terms MAY name in `condition` (task K4) a cMIP, by fingerprint (5.2.1), with its parameters: their **update condition**, called the condition for short. It is one simple field, and these grammar rules read one thing of it: whether the agreement can be updated or not. Asked of a proposed update, that is **valid** or **not valid**, as that cMIP answers: the gate (5.5.1). Everything else is that cMIP's to specify: who must sign an update (two owners of three, one named party, everyone), which parts of an agreement an update may change (a share, a party, the rights a version offers, the offer itself, a power, the judge, the condition itself), when, and on what. It is never asked about a filling: no update reaches one (§5.10).

   >
   > (a) **What it is given.** The version the proposed update would replace (the original: the version in force, 5.5.3, or, for an update of a version already replaced, the version its `replaces` names, 5.5.4: the condition is asked of it, and whether the update is late is 5.5.4's) and the proposed update: a Terms act whose `replaces` names that version. With them, as for any rule, the acts held, among them the assents to the proposed update that count: an assent in a tip that has stopped (5.7.2, 5.12.2) is not among them, and the verifier says which it left out and why; and the answers of the keepers and the clock the Terms name (§5.8). A condition that needs a clock or a keeper is given one only where the Terms name it: Terms that do not supply what the condition's cMIP declares it needs (a clock, a keeper) are **invalid** (5.8.6).
   >
   > (b) **It runs from the bytes.** Whoever holds those bytes can apply the cMIP, to an update already signed or to one only proposed, and gets the same answer as anyone else (task K4). Its answer waits for no one to publish anything.
   >
   > (c) **Not valid.** Where the cMIP answers not valid, the proposed update does not pass the gate, and replaces nothing, whoever signed it (5.5.5): the Terms it names stay in force, and it is not a tip of a fork. A verifier MUST answer **not valid** for it, and MUST name the condition beside that answer, with the ground the cMIP gives: an act, with who signed it, or a time, per the clock the Terms name (§5.8). A time has no other ground: no reader's anchoring answers for the Terms, and Terms that do not supply what the condition's cMIP declares it needs (a clock, a keeper) are invalid (5.5.7(a), 5.8.6). Where the cMIP counts signatures, its answer rests on the assents held: it is given per keeper or as shown, and it may differ once an assent the verifier did not hold is shown.
   >
   > (d) **Valid.** Where the cMIP answers valid, the verifier answers **valid**, named and qualified in the same way. Valid is the gate's answer only: the update replaces the version it names once its order is also shown (5.5.1); until then it is valid, and not in force. Who must sign is part of the cMIP's answer. Nothing more is asked of the update's signatures, and no power is read for it (§5.6).
   >
   > (e) **Which condition.** The condition asked is the one named by the original, the version the update would replace (5.5.5); while a fork of Terms stands, the one named by the Terms both branches replace (5.5.4). **The default update condition.** Where Terms name no update condition, an update is valid when every known party signs it (5.5.5(a)): the author among them, and never a signer who fills a role. A verifier answers **valid**, with the words "by default", where an assent to the update in the name of each of them is held; where one is lacking it answers **not shown** for the update as a replacement (5.5.5(c)), and never **not valid**: the missing assent may exist. There is no power for replacement (§5.6): Terms that name no update condition are updated only by their known parties, whatever their `powers` say.
   >
   > (f) **Nothing changes by itself.** These grammar rules have no condition that triggers. What a version offers changes only through an update. What a filling gave lasts as long as the words of the version it was earned under say, counted on the clock that version names, as the cMIP that reads those words answers: no update ends it, and none is needed (§5.10).
   >
   > (g) **A resolving update.** A resolving update of Terms is an update of the shared Terms (§5.12), and the condition those Terms name is asked of it as of any update: its answer says who must sign it. With none named, the default asks for the known parties (5.5.5(a)). A resolving update carries no words of its own, so there is nothing else in it to answer about; each tip it names was itself answered valid, or is no tip (5.5.5). One signed under a power to resolve that the shared Terms give resolves as §5.12 says, and the condition is not asked of it.
   >
   > (h) Where the verifier lacks the cMIP, whether the update passes the gate is **unchecked** (§3.6), and so is every answer that rests on it (5.5.5(e)).
   >
   > (i) **Output, and nothing more.** These grammar rules name the update condition's cMIP, take the output of that task, valid or not valid, and use it where it is needed: here, in 5.5.1 and in 5.5.5. They have no notion of a cMIP overruling the default, and no value "locked". A named cMIP is not read as set against the default: the socket is filled, and its output is the answer. An update condition whose cMIP answers not valid to every update is read as any other: the version that names it cannot be updated, and that is all that "cannot be updated" means in this text. So is one that answers valid to an update fewer than all have signed, which then passes the gate (5.5.1). A verifier MUST NOT answer, of itself, that an agreement is locked, or that it can never be updated: it gives the condition's answer about each proposed update.
2. **Replaces** D25 G4.11 and its (a) to (i) [traced, D26 trace §5.5]: (a) the reader's anchoring goes, and Terms not supplying what the condition's cMIP declares it needs are invalid ("A condition in time with no anchor is refused", 26 November: "Yes, condition is missing, it should be refused"; the invalid case is 5.8.6, session 2's); (d) valid no longer means "replaces"; (e) the default is every known party; (f) what a filling gave lasts by its version's words, on its clock ("Ana's month ends by the clock the agreement names", 27 November); (g) the default for a resolving update asks the known parties; (i) "cannot be updated" is the condition's answer, never the verifier's. **Code:** `force.rs:547` to `force.rs:598`, `update_raw`, asking `Ask::Update` with `signed_original` (`sockets.rs:64`); `sockets.rs:67`, `Ask::FillingRights` (G10.6(b), going; 5.10, session 2's); `chain.rs:723` to `chain.rs:760`, `update_answer`; `chain.rs:697` to `chain.rs:721`, `resolves` [traced].
3. **What a verifier answers differently.** *Plain words.* Ana's work names a condition stub "two of three owners". Ana and Ben sign version 2. *Before:* **valid**, the condition named, and it replaces at once. *After:* **valid**, the condition named; it replaces once its order is shown (5.5.1) [traced to the rule]. Where Ana's version 1 is not yet pinned, today's code turns valid into **not shown** (`order.rs:132` to `order.rs:140`); draft 26 says valid "is the gate's answer only" (Q4).
4. **Size:** a rule ((a)'s invalid case, with 5.8.6), a word ((d): valid is not "replaces"), and the default of (e) as at 5.5.5.
5. **Vectors.** *Change answer, if Q4 reads "not shown":* 8 and 11 (valid → not shown: their original `update/root`, `condition/root` is not pinned) [counted, `pin_count2.py`; inferred]. 13 "an update condition that answers not valid: not valid, whoever signed it" keeps **not valid**. *Retired:* 74 (counted at 5.4.3). *New:*
   - A condition stub answering valid for version 2, version 1 in force, version 2 not yet shown after version 1's acts: **valid**, the condition named, and **not shown** as in force.
   - (a)'s invalid case (a cMIP declaring a clock, Terms naming none) is 5.8.6's: left to session 2.
6. **Build list, sheet:** R14 (the condition asked of a resolving update: settled, (g): "the condition those Terms name is asked of it as of any update", the code's reading); D7 (earned rights asked apart: (f), with 5.10, session 2's). The sheet's Q26 (settled by SN Q26: the verifier "refuses Terms whose named cMIP declares a need (a clock, a keeper) the Terms do not supply"); Q16 (open: Q13 below) [traced].
7. **Choices left to the code:**
   - Q4 (below): is valid answered of an update whose original is not (yet) in force?
   - Q13 (below): what is a named condition handed, now that "everyone who signed the original" is gone?

---

## 5.6 Who is bound

### 5.6.1 Who is bound by an act

1. **The rule.**

   > **5.6.1** A person is bound by an act if, and only if:

   >
   > (a) they signed it in their own name, or
   >
   > (b) the act's `for` names them, or names an agreement by whose Terms they are bound (5.1.2); its `under` names Terms by which they are bound and which are in force (§5.5); their own signature is on the version of those Terms that gives the power, as an assent counted in their name (5.6.5(f)): no update condition can give a power for a person who did not sign the version that gives it; those Terms give a power for acts of this kind; and that power's rule, applied to the acts held, says yes (where those Terms give two or more powers for that kind, the act binds where any one of their rules says yes), or
   >
   > (c) the act is a Terms act that replaces Terms by which they are bound as a known party (§3.2), and it passes the gate and the pin of those Terms (5.5.1) (5.6.2). No update binds anyone through a filling: a filling is bound by the version its proof names, and by no update (5.4.3, §5.10).
2. **Replaces** D25 G5.1, (a) unchanged; (b) the person must have signed the version that gives the power ("Nothing about me without my signature", 18 November: "Absolutely, no need to even debate this. Nothing about me is accepted without my signature."); (c) only as a known party, by the gate and the pin, never through a filling [traced, D26 trace §5.6]. **Code:** `order.rs:221` to `order.rs:279`, `bound`: for a Terms act, (c) through `signed_by` of the Terms replaced (`order.rs:233` to `order.rs:239`), which still counts fillers and the inherited; for a Statement made `for` someone, `name_of` (`force.rs:53` to `force.rs:61`) and `power` (`force.rs:69` to `force.rs:115`), whose check "Those Terms bind the one the act is made for" reads `signed_by(under)` (`force.rs:89` to `force.rs:94`), the inherited arm included [traced].
3. **What a verifier answers differently.** *Plain words.* Ana and Ben's version 1 names no power. Version 2, passed by a condition Ana and Ben could pass without Carla, gives Ben a power to assent for Carla. Ben assents for Carla to an outside deal. Dana asks whether Carla is bound. *Before:* **shown**, G5.1(b), where Carla is bound by version 2 through the update (the inherited arm). *After:* **not shown**: Carla's own signature is not on version 2 [traced to the rule; build list R29]. And Gil, who signs for Ana under her power, is not bound by that act: it is made in Ana's name (5.6.1(a), the ledger's "The giver bears it, not the agent") [traced, `order.rs:271`].
4. **Size:** a rule ((b)'s own signature on the version; (c)'s known party and pin).
5. **Vectors.** *Change answer:* 12, 55, 56 (by 5.4.1). 57 "an act with no `for` is made in its signer's own name only" and 59 "an act made under a power after the Terms that gave it were replaced: not bound" keep **not shown** (59's reason changes: G5.5 is gone, and its power's Terms are not pinned) [inferred]. *New:*
   - (Build list R29) the story above: **not shown** for Carla.
   - (26 Nov, line 8, 2) Carla, who filled a role under version 1, and version 2 passed by a condition that answers valid: Carla **not shown** bound by version 2 (no update binds through a filling).
   - (27 Nov, "The giver bears it, not the agent") Gil assents for Ana under a power she gave and signed: asked `bound` of Ana, **shown**, 5.6.1(b); of Gil, **not shown**, 5.6.1 (made in another's name).
6. **Build list, sheet:** R29 (settled by (b)); T7 (the inherited arm, gone); R26 (the holder's binding as shown, not per place: Envelopes' rules, outside this part). The sheet's line 8 [traced].
7. **Choices left to the code:**
   - Q14 (below): "the version of those Terms that gives the power": the version `under` names, or the first version that wrote the power?

### 5.6.2 A replacing Terms act

1. **The rule.**

   > **5.6.2** **A replacing Terms act.** A replacing Terms act (one with `replaces`) binds a party by that party's own assent to it (5.6.1(a)); or, with no assent of theirs, under 5.6.1(c): the party is bound, as a known party, by the Terms it replaces, and it passes their gate and their pin (5.5.1, 5.5.7). Under the default every known party has signed the update (5.5.7(e)). It binds no one through a filling: whoever holds a filling is bound by the version that filling's proof names, for as long as its words say, and by no update (5.4.3, §5.10). **No power for replacement.** No power makes a Terms act replace, and no power binds a party to one: `powers` has no kind `replaces`. An entry of `powers` of that kind gives no power; a verifier says that it left it unread (5.2.3). Which signatures are enough for an update is the update condition's, with the rest of the answer about an update, in one place (5.5.7). An assent to a replacing Terms act MAY be made for a party under a power of kind `assent`, as any assent may (5.6.1(b)): that is acting for someone, and it is counted as that party's signing.

2. **Replaces** D25 G5.2, changed: no binding through a filling; the draft 18 sentences go to the companion [traced, D26 trace §5.6]. **Code:** `terms.rs:561` to `terms.rs:564` (the note for a power of kind `replaces`); `force.rs:670` to `force.rs:677`, `kind_matches` [traced].
3. **What a verifier answers differently.** Nothing beyond 5.6.1(c). Ana's Terms carry a power of kind `replaces`: left unread, before and after.
4. **Size:** none.
5. **Vectors:** 15 and 16 keep theirs. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.6.3 One's own name only

1. **The rule.**

   > **5.6.3** An act with no `for` and no `under` is made in its signer's own name only. It MUST NOT later be counted as made for anyone else.

2. **Replaces** D25 G5.3, unchanged [traced]. **Code:** `order.rs:252` to `order.rs:258` [traced].
3. **What a verifier answers differently.** Nothing.
4. **Size:** none.
5. **Vectors:** 57 keeps **not shown**. None new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.6.4 An act under a power whose Terms were replaced

1. **The rule.**

   > **5.6.4** **An act under a power whose Terms were replaced.** Where whoever is bound through `for` is bound only through Terms that have been replaced, they are bound by the act if it was made before the Terms that replace those were in force, and not bound if it was made after. A verifier MUST answer from §5.8: per the keepers the Terms that gave the power name, by the act's position against the position at which the replacing Terms passed the gate and the pin: the first position at which, counting only the acts those keepers show at or before it, the replacing Terms pass that gate and that pin (5.5.1), qualified **per keeper**; where those keepers disagree, **not shown**, with that reason (§5.8). Where those Terms name no keeper, by knots (§5.13), **as shown**: the person is bound where the act is shown before the replacing Terms passed the gate and the pin, that is, where acts enough for them to pass it are shown after the act; not bound where the act is shown after such acts. Where nothing shows their order, the act is not shown as binding through those Terms; whether the act and the replacing Terms are then a fork (§5.12) is not said by this rule. Whether Terms have been replaced is answered by §5.5; Terms are not ended otherwise (5.5.6).

2. **Replaces** D25 G5.4, changed [traced, D26 trace §5.6]: "valid (G4.11) and in force (G4.1)" becomes "pass the gate and the pin (5.5.1)"; per the keepers the power's Terms name, not shown where they disagree; by knots, as shown; where nothing shows the order, "not shown as binding", and whether it is a fork is not said (D26 report, item 8). **Code:** `force.rs:156` to `force.rs:177`, `in_force_for_power`; `force.rs:182` to `force.rs:212`, `before_in_force`: per place by positions (`force.rs:187` to `force.rs:201`), by citing (`force.rs:202` to `force.rs:210`), and `Tri::NotShown` where citing gives no order (`force.rs:211`) [traced].
3. **What a verifier answers differently.** *Plain words.* Ana's version 1 gives Gil a power to assent for her; version 2 removes it, signed by Ana and Ben, and is pinned. Gil's assent for Ana names nothing of version 2's. Dana asks whether Ana is bound. *Before* and *after:* **not shown** as binding through version 1 where nothing orders them. What changes is what "replaced" means: version 2 must be pinned, not only valid and in force by its own rule; and with two keepers named by version 1, they must agree [traced to the rule].
4. **Size:** a rule (the pin in the replacement's position; several keepers).
5. **Vectors:** 59 (as at 5.6.1). *New:*
   - Version 1 names one keeper, which shows Gil's act before the position at which version 2 passes the gate and the pin: **shown**, Ana bound, per keeper.
   - The same with two keepers that disagree on the order: **not shown**, the keepers disagree.
6. **Build list, sheet:** R27 (which of Part 3's checks the test reaches, `before_in_force`: read only) [traced].
7. **Choices left to the code:**
   - Q15 (below): where nothing shows the order, is the act and the replacing Terms a fork?

### 5.6.5 Constitution, executive and judicial

1. **The rule.**

   > **5.6.5** **Constitution, executive and judicial.** Three things are kept apart, and this rule is the one place that says so.

   >
   > (a) **The constitution is the update condition: how the Terms may change.** A version is replaced only by an update that passes its gate and its pin (5.5.1): the gate is its update condition's answer, valid, who must sign it included; with none named, an update every known party has signed (5.5.5(a), 5.5.7(e)).
   >
   > (b) **The executive is the powers: who may act under the Terms, and in which kinds of act.** An act made for a person or for an agreement, a Statement of a kind (5.1.2, 5.6.1(b)). A power acts under the Terms as they are. No act made under a power is a version, and none changes what a version says.
   >
   > (c) **The judicial is set in the Terms.** It is three things. The contest: these grammar rules give it, and whom one reaches is read from the version it is made against (§5.11). A judge, where Terms name one: in a socket of theirs, by the cMIP that socket names or by its parameters, fixed by fingerprint (§5.2, §6). And a power to resolve a fork: an entry of `powers` of kind `resolves` (§5.12). Each is read from the version in force (5.5.3); while a fork of Terms stands, from the last shared version (5.5.4(e)).
   >
   > (d) **It changes only by an update.** Who the judge is, whether Terms give a power to resolve and what its rule accepts, and whom a contest reaches, change only when a new version says otherwise, made by an update that passes the gate and the pin ((a)). No power can change it. A verifier MUST NOT read an act made under a power as naming or replacing a judge; as giving, widening, narrowing or removing a power to resolve; or as changing whom a contest reaches. A cMIP that leans on a judge takes who the judge is from the Terms that name that cMIP, and from no act made under a power.
   >
   > (e) **Using it is not changing it.** A judge's decision binds only through a power (5.6.1(b), §6). A resolving update signed under a power to resolve is that power used (§5.12). A contest made for someone under a power of kind `contest` is that person's contest. Each of these acts under what the Terms set, and changes none of it.
   >
   > (f) **An agent within its limits.** An assent made for a party under a power of kind `assent` (5.6.1(b)) to an update, one that changes the judicial included, is that party's signing where the power's rule says yes; the update still has to pass the gate and the pin ((a); 5.5.1). Which updates a power to assent reaches is that power's rule's to say (K3), and a verifier reads its output and nothing more. That is not a power changing the judicial: the judicial changes by the update, and only by it ((d)).
2. **Replaces** D25 G5.6 and its (a) to (f): (a) the default is every known party and the pin is added; (f) stays on the lead's reading (SN M22: "a power given binds its giver") [traced, D26 trace §5.6]. **Code:** none reads "constitution", "executive" or "judicial" by name; (a) is `update_raw` (`force.rs:547`); (b) is `power` (`force.rs:69`); (c) is read where a cMIP leans on a judge (`sockets.rs`); (f) is `name_of` (`force.rs:53` to `force.rs:61`), which counts an assent made under a power of kind `assent` as the party's [traced].
3. **What a verifier answers differently.** Nothing beyond 5.5.1 and 5.5.5: Ana's agent Gil assents for her to an update that names a new judge; it counts as Ana's signing, and the update still needs the gate and the pin [traced].
4. **Size:** none of its own.
5. **Vectors:** none change; none new.
6. **Build list, sheet:** none.
7. **Choices left to the code:** none.

### 5.6.6 Nothing an agent made is set aside

1. **The rule.**

   > **5.6.6** **Nothing an agent made is set aside.** An act made for a person or an agreement under a power (5.6.1(b)), or as an agreement's signature (5.1.2), is an act like any other once made. Call the **grantor** the one in whose name it was made (the one who gave the power, or the agreement whose power it was). No act of the grantor, and no act of anyone else, sets aside, voids or undoes an act made under its grant. The grantor acts on what was made under its grant only by an update, under the update rules these grammar rules already have, and as anyone may act on any act:

   >
   > (a) **On the grant.** By a version of the Terms that give the power, which ends or narrows it, made as any update of those Terms is: their update condition decides, as its cMIP dictates (5.5.7), or, where they name none, the default (5.5.5(a)); or as the power's own rule says, which answers when the power ends (task K3). A version that ends or narrows it reaches only acts made after that version is in force; an act made before it binds as 5.6.4 says.
   >
   > (b) **On what was made.** By an update of the agreement the act was made in, which passes that agreement's gate and pin (5.5.1): its update condition's answer, or, where it names none, the default: every known party (5.5.5(a)). The grantor is among the known parties where it is one; an assent counted in its name, its agent's included, is its signing (5.6.5(f)).
   >
   > (c) **Before the Terms are in force.** By a counter signature in the grantor's name (5.4.5), as for any assent, while it is available (5.4.5: until the assents that put the Terms in force are shown before it). It cancels the assent counted in that name, and sets nothing aside: the agent's assent stays an act, shown as cancelled. A counter signature that comes later, or one made once the Terms are in force, changes nothing (5.4.5), and only (a) and (b) remain.

   >
   > **Who is covered.** Whoever agreed to what the agent signed keeps what that version gave them, the same way as under any update: a version is replaced only by an update that passes its gate and its pin (5.5.1); a known party who signed it is bound by an update they did not sign only where 5.6.1(c) says so; and a filling is governed by the version its proof names, which no update reaches (5.4.3, §5.10). A verifier MUST NOT read any act as setting aside, voiding or undoing an act made under a power, because it was made by an agent, or because the grantor later acted against it. It reads the grantor's later acts as what they are: a version of the grant, an update of the agreement, or, while one is available, a counter signature. A fork is another thing: an act made under a power that is a tip of a fork stops as any tip does, and may be set aside by a resolving update (§5.12); that is the reading of a fork, not the grantor acting on its grant.
2. **Replaces** D25 G5.7 and its (a) to (c) [traced, D26 trace §5.6]: (a) when a power ends is the power's own rule's (K3) or a version's, its update condition deciding, and G5.5's "By default the delegator can end it at any time" goes ("Delegation is a leftover", 18 November); (b) the default is every known party; (c) the counter signature is available until the completing assents are shown before it. **Code:** `force.rs:578` to `force.rs:585` and `force.rs:616` to `force.rs:652`, `delegation_end`, with `sockets.rs:126` to `sockets.rs:136` (`Delegation`, `Ending`), which let a delegator's version end a power alone [traced].
3. **What a verifier answers differently.** *Plain words.* Ana gave Gil a power by Terms naming no condition. Ana alone signs version 2, which removes it. Dana asks about version 2. *Before:* **valid**, by default, G4.11 (G5.5: the delegator ends it alone). *After:* **not shown** as a replacement: by default every known party signs, Gil among them (5.5.5(a)) [traced to the rule; the build list's D1].
4. **Size:** a removal (G5.5's path and its socket types).
5. **Vectors.** *Retired:* 58 (counted at 5.5.5). *New:*
   - The story above: **not shown**, 5.5.5(c), lacking Gil's assent; with Gil's assent held and the order shown: **valid**, and in force.
6. **Build list, sheet:** D1 [traced].
7. **Choices left to the code:** none.

---

## Totals

From the sections above; counts of existing vectors are of `core/vectors/agreements-new/`.

| What | Count | Which |
|---|---|---|
| Vectors that change answer, on the text's plain reading | **23** | grammar 1, 2, 5, 10, 12, 14, 26, 35, 46, 49, 50, 52, 53, 55, 56, 67, 68, 91, 102 (5.4.1, the first-version pin); 36 (5.4.5, fork); 29, 65 (5.5.4(c), late); `valid.json` 7 (5.3.1) [counted for the pin by `pin_count2.py`; the answers after are inferred from the code paths named] |
| Vectors that change answer if a question goes one way | **up to 12**, and with Q5 up to 15 more | grammar 8, 11 (Q4); 30 (Q3); 31 (Q2); 66, 76, 77 (Q6); 71, 72, 73, 75 (Q1); 95 (session 2's reading of 5.11); with Q5, `valid.json` 12 and 43 and the 19 grammar cases whose second Terms act is signed by someone its `authors` leave out (17 to 25, 27 to 30, 55 to 59, 65; of them 29, 55, 56 and 65 are counted above, 30 is among the ifs, 58 is retired) [counted for the acts by `signer_author.py`; the answers inferred] |
| Vectors retired, their rule gone | **3** | grammar 58 (G5.5, delegation), 64 (a reader's anchoring as the Terms' answer), 74 (a later version changing a filling's rights; shared with session 2's 5.10) [traced] |
| Vectors relabelled only | **2**, and every rule name | grammar 60, 61 ("per place" becomes "per keeper"); every case's rule renumbered [traced] |
| New vectors | **49** | 5.1.2: 3; 5.1.4: 2; 5.2.1: 1; 5.2.2: 3; 5.2.3: 1; 5.3.1: 2; 5.4.1: 6; 5.4.3: 3; 5.4.5: 4; 5.5.1: 3; 5.5.3: 1; 5.5.4: 6; 5.5.5: 7; 5.5.7: 1; 5.6.1: 3; 5.6.4: 2; 5.6.6: 1 [counted from the lists below by `assemble.py`; their answers inferred]. Of them, 12 carry 13 of the sheet of 26 November's 22, and 11 come from the 27 November entries (below) |
| New fields | **0** | in this part; the keeper field's form and the body's are session 3's |
| New value forms | **0** | in this part; the set of acts is session 3's |
| New answer words | **2** | **late** (5.5.4(c)), **fork** for a counter signature (5.4.5); and the qualifier "per keeper" for "per place" |
| Removals | **5** | the reader's anchoring as the Terms' answer (`mod.rs:251` to `mod.rs:257`, `chain.rs:261` to `chain.rs:281`'s per-anchoring word, `answer.rs:95`); an update's own `in_force` (`force.rs:602` to `force.rs:611`); delegation (`force.rs:578` to `force.rs:585`, `force.rs:616` to `force.rs:652`, `sockets.rs:126` to `sockets.rs:136`); the inherited and the filler arms of "everyone who signed" (`force.rs:486` to `force.rs:492`, `force.rs:502` to `force.rs:519`); the default's yes at once where no signer is named (`force.rs:289`, reached when no signer is named) [traced to the code; that they go is inferred from the rules named] |

**The 22 of 26 November**, by where they fall: 13 to this part, written as 12 vectors (line 1's three at 5.5.4; line 7's two at 5.4.3; line 8's three at 5.5.5 and 5.6.1; line 18's three at 5.5.1 and 5.2.3; line 19's two at 5.2.2); 9 left: line 6's two (a resolve with nothing to resolve, 5.12) and lines 9 and 10's one each (G10.6, 5.10) to session 2; line 16's five (the set of acts) to session 3. Line 18's third, the update carrying its own `in_force`, is written at 5.2.3, and line 1's and line 19's shared one (a Text act in `relies_on` of a late update) once, at 5.5.4.

**Those the 27 November entries add**, by where they fall: the double assent in order and forked (5.5.5(a)); two keepers, one silent (5.4.1, and 5.5.5(d); 5.8.3 is session 2's); a specification named by a stand-in (5.2.1); a late update shown by knots across layers (5.5.4(a)); the words act voided and relied on (5.2.2). Left to session 2: **a filling under a dropped role** (5.10). Added here from the 27 November entries that came after draft 26 was written: the signer of a Terms act left out of `authors` (5.3.1); the agent who signs for another (5.1.2, 5.6.1); the known parties of a version (5.5.5). Eleven new vectors in all come from the 27 November entries: 5.1.2, 1; 5.2.1, 1; 5.2.2, 1; 5.3.1, 1; 5.4.1, 1; 5.5.4, 1; 5.5.5, 4 (the double assent twice, two keepers, the known parties of a version); 5.6.1, 1 [counted from the lists below].

---

## The questions

All of this part's, those that would change a verifier's answer first. Each quotes its sentence, gives the readings, and the session's lean, labelled as the session's. None is settled here.

**Those that would change the answer of today's vectors.**

1. **Q5. Is the signer of a Terms act one of its authors, as a grammar rule?** The ledger, "The signer of a Terms act is an author" (27 November, 16:48–16:50), the lead's line: "a Terms act whose `authors` leaves its signer out is invalid"; his words: "Absolutely. The person publishing the act is by default an author, the rest adds signature later". Draft 26's 5.3.1 does not say it (its report: "Carried to the end of the stage", 1). (A) yes, invalid under 5.3.1, checked from one act's bytes; (B) not until the scribe writes it. *The session's lean:* (A) once written, and a code change that waits for the text. Moves `valid.json` 12 and 43, and 19 Terms acts in grammar cases 17 to 25, 27 to 30, 55 to 59 and 65, which become invalid [counted, `signer_author.py`]: the largest "if" in this part, since every fork vector's second tip is signed by someone its `authors` leave out.
2. **Q1. With an `in_force` cMIP, which assents must the pin reach?** 5.4.1: "each party in whose name one of those assents is counted has made an act in that same name within the agreement that is shown after every one of those assents". (A) only the assents the cMIP requires, which K2 must then name (today it answers yes or no, `force.rs:274` to `force.rs:279`); (B) every assent counted toward the Terms. *The session's lean:* (A): "those assents" are "the assents its `in_force` rule requires"; it asks K2 for a set, a change to the task's output (§6, session 2's). Moves 71, 72, 73, 75 [counted, `pin_count.py` against `pin_count2.py`].
3. **Q3. An update's pin: is the update itself shown after, or the acts that put it through the gate?** 5.5.1(b): "It is shown after the acts that put that version in force (5.4.1 for a first version; this rule for one that is itself an update)". (i) the update's own knots; (ii) the update's or those of the assents that put it through the gate. *The session's lean:* (ii), since the same rule reads "The order between two updates of one version is read from the acts that put each through the gate", and an update's author can rarely name every other signer's assent; a question for the scribe (the trace marks the reading M4's, "rows to check, 5"). Under (i), 30 moves, and every fork vector's tips stop being pinned [counted, `update_pin.py`].
4. **Q4. Is "valid" answered of an update whose original is not in force?** 5.5.7(a): the condition is given "The version the proposed update would replace (the original: the version in force, 5.5.3, or, for an update of a version already replaced, the version its `replaces` names, 5.5.4"; 5.5.1: "Valid is the gate's answer, and says only that the update is allowed." Today `order.rs:132` to `order.rs:140` turns valid into not shown where the original "is not a version that counted". (A) valid: the gate runs from the bytes ("It runs from the bytes", 5.5.7(b)), and the update is not in force; (B) not shown, as today. *The session's lean:* (A). Moves 8 and 11 under (B), since their originals are not pinned.
5. **Q2. Does an act named and not held leave the pin unchecked?** §3.4, Shown after: "Where an act such a chain needs is named and not held, the answer is unchecked (§5.13)"; 5.4.1: "Until then it is not yet in force: a verifier answers **not shown** for it as in force". (A) unchecked, wherever the act not held could be a party's later act; (B) not shown, unless the act not held is named in that party's own line. *The session's lean:* (A), "Missing act is always “I don’t know”" (27 November). Under (B), 31 moves (unchecked → not shown).
6. **Q6. Must the version a payment names have been in force?** 5.1.4: "the `receiver` named by the version of that agreement which the act that gives or owes names"; "Where the act that gives or owes names, as the version it read, Terms that are not shown as a version of that agreement, the answer is **not shown**." Today `receiver.rs:66` to `receiver.rs:78` asks that the version be in the chain's line. (A) any Terms act shown as a version of that agreement (its `agreement` field), in force or not; (B) only a version that was in force, as today. *The session's lean:* (A): the rule protects the payer who "acts on a version they read and named" (D25's "Protects" line, now the companion's); with (B) every payment to Terms not yet pinned has no receiver. Moves 66, 76, 77 under (B).

**Those that would change a verifier's answer in a new vector only.**

7. **Q7. Are agreements named as parties known parties?** 5.5.5(a): "the known parties (§3.2), the author among them: parties named as signers or as agreements"; the ledger, "The known parties of a version are the signers it names" (27 November, 16:44–16:46), his word "Yes". (A) signers and agreements, as draft 26; (B) signers only, as the later line. *The session's lean:* none; his "Yes" answers a question about Dana, a signer, and draft 26's clause is the lead's reading of 09:47; a question for him. No vector of today moves; the new vector at 5.5.5 (the co-op never signing) turns on it.
8. **Q8. With several keepers, must every one show the act?** 5.5.5(d): "an order counts where they agree; where they disagree, it is **not shown**"; the ledger, "Two keepers named, both needed" (27 November, 16:40–16:44): "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do". (A) every keeper, as his words; (B) those that show it, where none disagrees. *The session's lean:* (A), his words; not yet in 5.8.3 (session 2's). Turns the new vectors at 5.4.1 and 5.5.5.
9. **Q9. Two counter signatures in one name that nothing orders.** 5.4.5: "An assent is read against the first counter signature in the same name that follows it". Today the first is the one with the lower id where none orders them (`force.rs:374` to `force.rs:376`; build list D4, T5). (A) by knots or keepers only; where nothing orders them, which is first is not shown, and the MICS rule on counter signatures that lean on one another applies; (B) by id, as today. *The session's lean:* (A): an id is no order (§3.4). Turns the new vector at 5.4.5.
10. **Q11. The act `body` names, held and unreadable.** 5.2.2: "Where the act `body` names is held and is not a Text act, the Terms are **invalid**". (A) unchecked: whether it is a Text act cannot be told; (B) not read, as for an act not held. *The session's lean:* (A): "If an act the verifier does not hold could change the answer, the answer is never invalid" (§3.6), and the act is held. D26 report, M8's 4: unsaid.
11. **Q12. One act's namings, or several together?** 5.5.4(a): "L, or an act without which L does not pass O's gate, is shown after acts enough for F to pass O's gate". (A) one act, as written and as `chain.rs:246` to `chain.rs:260` reads it; (B) several, their namings added together (build list R4). *The session's lean:* (A), the text's singular.
12. **Q14. Which version "gives the power"?** 5.6.1(b): "their own signature is on the version of those Terms that gives the power"; 5.1.2 the same for an agreement. (A) the version `under` names; (B) the version that first wrote the power, any later version carrying it giving it too. *The session's lean:* (A), the text's "those Terms", with `under` naming them.
13. **Q15. An act under a power, and the replacing Terms, with no order.** 5.6.4: "Where nothing shows their order, the act is not shown as binding through those Terms; whether the act and the replacing Terms are then a fork (§5.12) is not said by this rule." (A) not shown, as written and as `force.rs:211`; (B) a fork. *The session's lean:* (A); D26 report, item 8, for him.
14. **Q16. Which acts pin a party's side?** 5.4.1: "has made an act in that same name within the agreement". (A) a Terms act or a Statement of that agreement, made by the party or in its name; (B) also a report, or a witness act relying on the assents. *The session's lean:* (A): reports stand in no line (§4.3), and a witness act is Identity's, in no agreement; a party's client can pin by its next Statement.

**Those that would change no answer of the grammar's own.**

15. **Q10. "Binds the known parties to them": which question asks it?** 5.4.3: "an assent by which its signer earned a filling binds that signer, and binds the known parties to them, as the version it names says". (A) a new question, whether a known party is bound to a filling, answered from the version the filling names; (B) no question of its own: the assent's answer (shown, its version named) says it. *The session's lean:* (B), since what binds the known parties is that version's words, which the grammar does not read. No vector moves.
16. **Q13. What is a named update condition handed?** `sockets.rs:64`, `Ask::Update { …, signed_original }`; 5.5.7(a): "With them, as for any rule, the acts held, among them the assents to the proposed update that count". (A) drop `signed_original`; (B) hand the known parties instead. *The session's lean:* (B), a list the cMIP can ignore and the grammar already computes; it changes no answer that does not rest on a stub reading it. The sheet's Q16.

---

## What this session could not tell

- **What the pin does to cases outside this part's rules.** The first-version pin moves any answer that rests on Terms in force. The 19 cases counted are those whose question this session could follow to `chain.rs:345` through the code; the legs, data, contest and baker cases (78 to 113, but 91 and 102) were not followed, and some may move too (`legs.rs:341` reads the last version; `spots.rs:15` does) [inferred]. Session 2 holds those rules.
- **Which assents an `in_force` cMIP "requires"** when more are held than it needs: the script read the narrowest set, the named signers' (Q1). With every counted assent read instead, the offer cases 71 to 75 and 92 to 98 are not pinned either [counted, `pin_count.py` against `pin_count2.py`].
- **The after answers are read, not run.** Nothing is built. The scripts count the knots in today's vectors; what a rebuilt verifier answers is inferred from the code paths named in each section.
- **The five answers of 27 November, 16:40 to 16:53**, came after draft 26 was written: the signer as author, the known parties of a version, two keepers both needed, renewal, the giver bears it. Draft 26's report lists them as "needs a choice" (its items 1, 2, 5, 14 and "Carried", 2). Where they reach 5.1 to 5.6 this sheet writes the vector from the ledger and marks the rule as not yet in draft 26.
- **Encoding 3** was not read: the byte forms of the keeper field, the body and the set are session 3's; where a rule here needs one (5.4.1's several keepers, 5.2.2's Text act), the dependency is named, not filled.
- **The round's acts were not run again.** Its ids are used as examples only; the round's answers are pull requests 229's and 232's.

---

## The scripts

All in the session's scratch folder, not in the repository; each reads only `core/vectors/` and the draft.

- `count_rules.py`: counts the numbered rules and lettered parts of draft 26's 5.1 to 5.6 (28 and 33).
- `pin_count.py`, `pin_count2.py`: for each grammar case, for each first Terms act held, whether each party whose assent puts it in force has made another act in the same name within the agreement whose knots reach every one of those assents (the pin of 5.4.1, by knots, where the Terms name no keeper). They reuse the independent check's decoding (`core/vectors/agreements_new_grammar_check.py`, its `World` and `closure`). The first reads every counted assent; the second only the named signers' (the narrowest reading of "those assents").
- `update_pin.py`: for each Terms act with `replaces`, whether it is shown after every assent counted to its original, read two ways: (i) by its own knots; (ii) by its own and its assents' knots (Q3).
- `check_quotes.py`: every quotation of draft 26, draft 25, the ledger and the notes in this file, checked against the files.
- `check_lines.py`: every `file:line` of code cited here, checked to exist at `f1a13feb`.

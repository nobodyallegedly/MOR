# Agreements, from scratch: draft 3

12 November 2026. Written by Claude. A draft for Nobody, allegedly, to read; not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR".

**Read for this draft, and nothing else:** `docs/agreements-from-scratch/draft-2.md` and `companion-2.md` (branch `claude/agreements-draft-2`, pull request 152). Draft 3 is draft 2 with one change: grammar rule 11 rewritten from three statements of Nobody, allegedly (S12, S13, S14 below), and what in draft 2 depends on rule 11 brought in line with it. Nothing else changes. Draft 2 was written from `docs/strangers-2026-11/` (README, `agreement-tasks.md`, `agreement-grammar.md`, `late-roles.md`), `draft-1.md`, and the test results `situations-1.md` and `shower-cmips-1.md`; those were not reopened for draft 3. `companion-2.md` still records how the research is used: what it says about rule 11 (counted attention) holds for draft 3 unchanged.

Task numbers with a hash, such as (#23 Hold), refer to the research's 49 tasks in `agreement-tasks.md`. Task numbers with a K, such as K4, are this text's tasks (section 5). How the research's 49 tasks were used is now in `companion-2.md`.

---

## Changes, and the words each comes from

Only the statements of Nobody, allegedly, below change the drafts. Each is quoted as the brief for its draft gives it. S1 to S11 changed draft 1 into draft 2; everything else in draft 1 was kept. S12 to S14 change draft 2 into draft 3: they are about draft 2's rule 11, and only rule 11 and what depends on it changed. Where a test result (`situations-1.md`, `shower-cmips-1.md`) found a gap these words do not cover, it is not closed: section 9 lists it.

| | His words | What changed (Claude's reading) |
|---|---|---|
| S1 | "found it strange that “task” is not defined." | **Task** and **cMIP** are defined (section 2). The research's 49 tasks and this text's tasks are told apart. |
| S2 | "Isn’t “how the 49 tasks land” more of a companion section, it says: this is how the research was used." | The landing table left section 5 and is now `companion-2.md`, with how `late-roles.md` was used. |
| S3 | "It’s not ruling… it!s setting up grammar for people to decide how to agree on rules." | Sections 0 and 1 say Agreements is a grammar. The eight rules of draft 1 are named **grammar rules**: they say how acts are read, never what people must agree. People's own rules are cMIPs. |
| S4 | "Just be mindful to not attempt to solve something the cMIPs will." | Draft 1's "design direction for cMIP authors" left this text (now in `companion-2.md`). Every new rule below says only what a verifier reads; how a thing is proven is left to a cMIP. |
| S5 | On a party being a work (another agreement), the money going to whoever that agreement names as its receiver now: "I think it is essential… it ensures a series of split is possible." And: "The new agreement pints to the other agreement as one party, no collective involved". | A party may be an **agreement** (grammar rule 10). Terms may name a **receiver**. What is owed to an agreement goes to its receiver now. |
| S6 | "some participants are not tied to a specific ID when the agreement is drafted, they are tied to a role that will be linked to an ID in the future." | A role is a **spot**, linked to a signer later (grammar rule 9). |
| S7 | "Prove that you have done X and earn spot 1. Prove you have received Y and earn spit 2. Prove that you are holding Z and earn spot 3 (relays for example) Prove that your ID fits the conditions in W and earn spot 4" | A spot has one of four kinds: **done**, **received**, **holding**, **fits** (grammar rule 9). New task K12 (Spot). |
| S8 | "Maybe a customizable “future participants” with the the cMIP specifying how that participant is defined and confirmed", and "To be used only for" (the brief: those no agreement could anticipate), with "Mor won’t force the shower, it will sustain it". | A fifth kind, **future**, wholly defined and confirmed by its cMIP, for those the four kinds cannot anticipate (grammar rule 9.4). Nothing in the grammar makes anyone pay a lineage (section 0). |
| S9 | On roles rewarded for being seen: "seen by the agreed witness and with the possibility to reject all that is not tied to a settlement." | Draft 2: grammar rule 11, with an act kind **reject**, a Terms field `may_reject` and a Statement field `settlement`. Rule 11 is rewritten in draft 3 by S12 to S14; the witness is kept. |
| S10 | "Sadly some rails will need pools… this headache won’t be easy." | Pools are open parameter P6, said plainly. |
| S11 | "reputation tracking no platform owns or computes is important." | New task K13 (Standing): computed from signed acts by anyone, owned by no one. |
| S12 | On draft 2's rule 11: "Well, more than rejected is never setup to be counted. “Show me referees that lead to settlement only”" | Draft 3: nothing is rejected. What is counted is only what the agreement's own rule (task K4) sets up to be counted; anything else simply is not counted (rule 11.3). A rule may count only the counts that led to a settlement; the field `settlement` stays so that a rule can ask that (rule 11.4). |
| S13 | "Advertisement industry can still build a model that still rewards pure attention, if they wish." | Draft 3: the grammar does not require a count to be tied to a settlement. A rule may count pure attention, every count the witness states (rule 11.4). |
| S14 | "Yes, I never ment for a rejection to be something. It was in a cMIP driven scenario." | Draft 3: the act kind **reject** and the Terms field `may_reject` are removed. Whether counts are tied to settlements, and how, is left to cMIPs. |

Draft 1 had eight grammar rules and eleven tasks. Draft 2 has eleven grammar rules (three new: 9, 10, 11) and thirteen tasks (two new: K12, K13). Draft 3 has the same eleven grammar rules and thirteen tasks, with one act kind fewer (reject) and one Terms field fewer (`may_reject`).

---

## 0. In plain words

People agree in order to defend themselves against the other party's future self, and their own. Honest drift and lying look the same from outside, so every written agreement is written for a third person who may turn up later: a newcomer, an heir, a judge, a buyer. The least two people need to write down is exactly the least that third person needs to see.

**Agreements does not rule.** It is a grammar: the words people use to write down their own rules, and the few ways those words must be read so that a stranger reads them the same way. What people agree (a price, a vote, a split, a deadline) is theirs, written in cMIPs they choose. The grammar only makes sure that what they wrote can be checked by anyone, later.

Most of what an agreement needs is already provided by the layers around Agreements: words that cannot shift (State), a mark that binds someone (Sign), getting the words to someone (Deliver), placing them before or after something else (Order), and power over a thing (Control). Agreements does not redefine those. It adds only what those five cannot give on their own, and every addition here must answer two questions:

- **Which lie does it expose that signed, ordered text cannot already expose?**
- **Whom does it protect who did not choose it?**

That test leaves eleven grammar rules for a verifier. Everything else an agreement needs is handed to cMIPs as thirteen tasks, each asking one question. What fits neither is written down as a cost, openly, instead of being patched with another rule.

In one sentence: **Agreements fixes what was agreed and who is bound by it, and says honestly what it does not know; everything about the world, about time and about value is somebody's signed word, reported as such.**

The eleven grammar rules, in plain words:

1. **Whole.** Whatever the agreement relies on is named by its fingerprint. Anything named otherwise is not part of it.
2. **Author.** The agreement says who wrote its words. Whoever wrote them carries their unclearness.
3. **In force.** Signing first does not bind you alone. Your signature counts once the signatures the agreement asks for are all there.
4. **Own signature.** Nobody is bound by an act they did not sign, except through an agreement they did sign that gives that power, and the act must say so at the time.
5. **Own chain.** Each person's acts in one agreement point at their previous one. Two acts pointing at the same previous one prove that person told two stories.
6. **Place to look.** An agreement may name one ordered place. Then "nothing later" and "nothing else" have answers, and only what is found there counts. Without one, every such answer is "as shown", never "latest".
7. **Say who said it.** Whatever concerns the world, time or value is reported with the name of whoever stated it. An agreement never makes it true.
8. **Unchecked is not passed.** What a verifier could not check, it reports as unchecked.
9. **Spots.** An agreement may keep a place for someone not yet known: whoever proves they did X, received Y, hold Z, or fit W. A fifth, open kind is for those nobody could anticipate. Who fills a spot is always reported with who confirmed it.
10. **A work as a party.** An agreement may name another agreement as one of its parties. Nobody signs for it. What is owed to it goes to whoever that agreement names as its receiver now. This is how one split pays into the next.
11. **Seen, by the agreed witness.** Where someone is rewarded for being seen (a play, a view, a repost), only the witness the agreement names can count it. Of what the witness counts, only what the agreement's own rule sets up to be counted is counted: for example only the counts that led to a settled payment, or every view, as those who agree choose. Nothing has to be rejected.

The way out is the reason for rule 4: nothing ties a person except their own signature, and nothing changes or ends an agreement except what its own signers agreed in advance. The cost is equally plain, and is written in section 7: an agreement that names no way to change it can change only when everyone signs again.

And the same reason keeps the shower free. In the words of Nobody, allegedly: "Mor won’t force the shower, it will sustain it". No grammar rule makes a work pay the works it stands on. Rule 10 makes it possible, rule 7 makes it visible, and the choice stays with those who sign.

---

## 1. Purpose

Agreements defines a grammar:

- the acts in which agreeing is written (Terms and Statement);
- the grammar rules by which a verifier decides, from acts alone, **who is bound by which Terms, and what is shown, unknown or contradicted**;
- the tasks that cMIPs fill so that people can agree on anything, by rules they choose: votes, sales, shares, splits, agents, deadlines, witnesses, judges, payments.

Agreements does not decide what anyone must agree. It gives the words and the reading; the rules people agree on are theirs, written as cMIPs filling its tasks.

Agreements does not define how words are fixed, how signatures work, how acts travel, how a shared order is kept, or how value is held. It names those operations (State, Sign, Deliver, Order, Control) where it needs them.

Agreements does not decide whether anything happened in the world. It records who said so.

### Two properties, not rules

Two of the research's 49 tasks are not tasks but qualities every operation must have (`agreement-grammar.md`, finding 1):

- **Durable** (#9 Keep): what an act fixes is still there and unaltered when needed.
- **Verifiable** (#10 Check): an outsider holding copies can test it.

Agreements relies on both and adds no rule for them. One consequence is a design constraint on everything below: **every grammar rule here is checked from copies of acts alone**, plus the answers of a named place where rule 6 applies. No rule needs a particular server, keeper, platform or software author to remain. Reputation follows the same constraint (task K13).

---

## 2. Definitions

Each word here means one thing throughout this text.

- **Act**: a signed statement in the core's sense. Published or signed again, never updated. The fields the core gives every act (who signed, the signature, the act's own fingerprint) are not repeated here.
- **Fingerprint**: the identifier the core gives to fixed bytes. "Named by fingerprint" means referred to by that identifier and nothing else.
- **Grammar rule**: one of the eleven rules of section 4. It says how acts are read. It never says what people must agree. Written "rule 1" to "rule 11".
- **Task**: one question the grammar asks and does not answer itself. A task says what an answer to it accepts, what it produces, and whom it makes you trust. The thirteen tasks are K1 to K13 (section 5). The grammar rules may require that some task be answered; they never answer it.
- **cMIP**: a document, named by fingerprint, that answers one task, for some kind of thing or situation. Anyone may write one. Many cMIPs may answer the same task in different ways (one for land, another for shares). Choosing a cMIP is how people choose their own rules.
- **The research's 49 tasks** (#1 to #49): the questions an agreement may have to answer, from `agreement-tasks.md`. They are a checklist of what can go wrong, not this text's tasks. Where each one lands in this text is recorded in `companion-2.md`.
- **Terms**: an act that states what is agreed. Always capitalised and singular ("a Terms act", "these Terms"). Stating Terms is not agreeing to them.
- **Statement**: any other act made within an agreement. Its **kind** says what it is (see task K11). One kind is defined here: **assent**.
- **Assent**: a Statement by which its signer agrees to one Terms act.
- **Agreement**: the first Terms act together with every Terms act that replaces it, directly or through others, and every Statement made within them. Its identifier is the fingerprint of the first Terms act (the **root**).
- **Party**: one named in Terms. Named in one of three ways:
  - as a **signer**: a person, by the key the Sign layer gives them;
  - as a **role**: a spot for someone not yet known, linked to a signer later (rule 9);
  - as an **agreement**: another agreement, by its root (rule 10).

  Signers, and signers who fill a role, are the parties who may be bound. An agreement named as a party is never bound.
- **Spot**: a role's place among the parties, before and after it is filled. It has a **kind**: **done**, **received**, **holding**, **fits** or **future** (rule 9).
- **Fill**: a spot is filled when the cMIP its role names (task K12) says which signer is linked to it.
- **Receiver**: the one party that Terms name, in the field `receiver`, as receiving on the agreement's behalf when another agreement names it as a party (rule 10).
- **Author**: a party whose words the Terms are.
- **Power**: an entry in Terms saying that a Statement of a given kind (or a replacing Terms act) binds the parties when a given rule says yes.
- **Rule**: a cMIP answering task K4, named by fingerprint, with its parameters. It is the people's own rule, not a grammar rule. It computes; it trusts nobody.
- **Seen**: being rewarded for being seen means being owed something per play, view, repost, delivery to an audience or other count of attention (rule 11).
- **Settlement**: the signed evidence, from the layer that holds value (Control), that a payment was made. Agreements names it and does not define it.
- **Bound**: a person is bound by an act when rule 4 says so.
- **In force**: Terms are in force when rule 3 says so.
- **Place**: an ordered place to look, provided by the Order layer, which can say of an act whether it is there and at what position, and whether anything is later.
- **Verifier**: whoever applies these grammar rules to a set of acts. A verifier answers questions; it does not decide disputes.
- **Answers**: a verifier's answer is one of:
  - **shown**: the acts held establish it under these grammar rules;
  - **not shown**: the acts held do not establish it;
  - **fork**: two acts by one signer contradict under rule 5;
  - **unchecked**: the verifier could not apply a rule it needed (rule 8).

  Answers about what is latest, or what else exists, carry one of two qualifiers: **per place** (with the place named) or **as shown** (meaning: among the acts this verifier happens to hold).

---

## 3. The data each act carries

Each field is listed with the grammar rule that reads it. A field no rule reads is not here. An act missing a field marked required is not an Agreements act.

### 3.1 Terms

| Field | Required | What it holds | Read by |
|---|---|---|---|
| `replaces` | in every Terms act except the first | fingerprint of the Terms act this one replaces | rule 4 |
| `agreement` | exactly when `replaces` is present | fingerprint of the root | rules 4, 5 |
| `parties` | yes | each party: a signer; or a role (its kind, its `what`, the cMIP answering K12, and for a role rewarded for being seen, its `witness`); or an agreement (its root) | rules 3, 4, 9, 10, 11 |
| `authors` | yes | one or more of the parties named as signers or roles | rules 2, 9 |
| `body` | yes | fingerprint of the words, and fingerprint of the cMIP (task K1) that says how to read them | rule 1 |
| `relies_on` | if anything else is used | fingerprints of every other piece the Terms use | rule 1 |
| `in_force` | no | a rule saying which assents put the Terms in force; absent means the default of rule 3 | rule 3 |
| `powers` | no | list of (kind, rule) | rule 4 |
| `place` | no | the place to look, by the identifier the Order layer gives it | rule 6 |
| `receiver` | no | one of the parties, named as a signer or a role | rule 10 |
| `previous` | yes | the signer's previous act in this agreement, or none | rule 5 |

### 3.2 Statement

| Field | Required | What it holds | Read by |
|---|---|---|---|
| `agreement` | yes | fingerprint of the root | rule 5 |
| `terms` | yes | fingerprint of the Terms act it is made within | rules 3, 4 |
| `kind` | yes | `assent`, or the fingerprint of a cMIP answering task K11 | rule 4, task K11 |
| `content` | as the kind requires | what is stated, by fingerprint or inline as the kind says | task K11 |
| `for` | together with `under` | the person in whose name the act is made | rule 4 |
| `under` | together with `for` | fingerprint of the Terms that give the power to act for that person | rule 4 |
| `previous` | yes | the signer's previous act in this agreement, or none | rule 5 |
| `answers` | no | fingerprints of acts this one replies to | tasks K9, K10 |
| `settlement` | no | fingerprint of a settlement this act is tied to | rule 11, task K4 |

An assent's `content` is empty: its `terms` field is what it agrees to.

---

## 4. Grammar rules

Each grammar rule is given in plain words, then precisely, then with its two answers and the reasoning. MUST, SHOULD and MAY are used as in RFC 2119. No SHOULD appears: every rule that survived the two questions turned out to be either required or a free choice.

These rules say how acts are read. None of them says what people must agree.

### Rule 1. Whole

**Plain words.** Everything the agreement uses is pinned by fingerprint. A link to something that could change is not part of the agreement.

**Precisely.**
- 1.1 The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.
- 1.2 Anything a Terms act refers to in another way is not part of those Terms. A verifier MUST NOT read it as part of them.

**Lie exposed.** "The document we referred to said something else", and "there was a side piece". A signature over words that point at something changeable proves only that the pointer was signed. (#34 Whole, #1 Fix.)

**Protects.** Every reader who arrives later: newcomer, heir, buyer of a part, judge. Also the party who signed without fetching what was referred to. None of them chose how the reference was written.

**Reasoning.** A cMIP can be revised; a document can be edited; a name can come to mean something new. Naming cMIPs by fingerprint is what lets an agreement be read correctly after its cMIP's author is gone, which is the good-ancestor requirement applied to meaning. Rule 1 does not prove that nothing else exists outside the Terms; that is rule 6. An agreement named as a party is named by its root, which is a fingerprint; what it says *now* is not pinned by rule 1, and is read by rule 10.

### Rule 2. Author

**Plain words.** The agreement says whose words these are. If the words turn out to be unclear, the unclearness falls on them.

**Precisely.**
- 2.1 `authors` MUST name one or more of the parties named as signers or roles.
- 2.2 The authors are the parties who bear the failure of the words to mean one thing (#4 Align). A cMIP answering task K10 (Judge) MUST accept `authors` as an input.

**Lie exposed.** "We wrote this together" or "I meant something else by that word", said by the one who did write it. Signatures alone cannot show who wrote the words: every party signs the same Terms.

**Protects.** The party who accepted words they did not write, above all whoever takes up an open offer or fills a spot (rule 9), who never had a chance to change the words.

**Reasoning.** Whether two people meant the same thing is an inner state at a past moment; no operation reaches it (`agreement-grammar.md`: Mind). The research's answer is "do not try to prove; assign in advance who bears the failure", and the open offer shows the assignment: whoever writes the words carries their ambiguity. Rule 2 makes the assignment readable; what a judge does with it is the judge's task. It assigns Align only. Able (#3) and Free (#5) are not assigned by any rule; see section 7.

### Rule 3. In force

**Plain words.** Signing first does not bind you alone. Your assent counts only once all the assents the agreement asks for are present.

**Precisely.**
- 3.1 Terms are in force when the assents their `in_force` rule requires are present. If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer.
- 3.2 Terms that name a party by role MUST carry `in_force`.
- 3.3 An assent binds its signer only while the Terms it names are in force.
- 3.4 A party named as an agreement never assents and is never counted by 3.1 (rule 10).

**Lie exposed.** "You signed, so you are bound", said by the party who never signed. Signed text shows that one side signed; it cannot by itself show that the signature was conditional on the other's.

**Protects.** The first to sign, who did not choose to be bound alone.

**Reasoning.** "Each party must hold the other's commitment, not their own" (#7 Exchange). Exchange may run one way until the other side acts, which is why 3.2 requires Terms with a spot to say how acceptance is recognised instead of falling back to a default that cannot apply to a role. Withdrawing an assent before the Terms are in force is a race; see section 7 and P10.

### Rule 4. Own signature

**Plain words.** Nobody is bound by anything they did not sign. The only exception is an agreement they did sign that gives someone a power over them, and then the act must name that agreement at the time it is made, not afterwards.

**Precisely.**
- 4.1 A person is bound by an act if, and only if:
  - (a) they signed it in their own name, or
  - (b) the act's `for` names them, its `under` names Terms by which they are bound and which are in force, those Terms give a power for acts of this kind, and that power's rule, applied to the acts held, says yes.
- 4.2 A replacing Terms act (one with `replaces`) binds a party only through 4.1: by that party's own assent to it, or by a power for replacement in the Terms it replaces. Its `replaces` is read as its `under`.
- 4.3 An act with no `for` and no `under` is made in its signer's own name only. It MUST NOT later be counted as made for anyone else.
- 4.4 Where the person named in `for` is bound only through Terms that have been replaced or ended, a verifier MUST answer from rule 6: per place if the Terms name one, otherwise as shown.

**Lie exposed.** "She bound you", "the group decided", "I was acting for him" (said after the fact), "I was still authorised". A signature shows who signed; it cannot show that the signer could bind someone else. The pointer in `under` lets anyone check the power against the principal's own signature. (#27 Authorise, #28 Scope, #29 Name, #30 Decide, #14 Admit, #15 Bind, #47 Amend, #48 End.)

**Protects.** The person bound through someone else: the principal, the outvoted member, the absent party. Also the counterparty of an agent, who can check the power before relying on it.

**Reasoning.** "A group deciding and a person acting for another are the same: a few bind others, within limits. Amending an agreement is one more decision of that kind" (`agreement-tasks.md`, what collapsed). So one rule covers agency, groups, judges, admission and amendment. A grant of authority is itself Terms: the principal is author and party, the agent is party, and the power names the kinds of act and the rule that limits them. Revoking it is ending those Terms.

A newcomer is bound (#15 Bind) by their own assent to the Terms in force when they join; their assent names exactly that Terms act, so they are not bound by a version they never saw, except through powers in it they accepted. Filling a spot (rule 9) does not bind anyone either: the signer who fills it is bound only by their own assent, under 4.1.

There is no default power. An agreement that names no power to replace or end itself can be replaced or ended only by every party's own assent. This is the conservative way out, and its cost is in section 7.

### Rule 5. Own chain

**Plain words.** Each person's acts in one agreement are a single line: each one points at that person's previous one. If two acts point at the same previous one, that person has told two stories, and that is proven without a judge.

**Precisely.**
- 5.1 Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first.
- 5.2 Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork. A verifier holding both MUST answer **fork** for that signer, and MUST NOT choose between the branches.

**Lie exposed.** Showing one history to one person and another history to another (equivocation), and hiding an act in the middle of one's own line. Without a single shared sequence, two signed acts can each look like the latest; the pointer turns the contradiction into proof (`agreement-grammar.md`, second test: "a fork convicts itself").

**Protects.** The stranger who is shown only one branch, and any party who has no place to look.

**Reasoning.** Rule 5 is checkable by anyone holding the two acts, with no outsider. It does not stop the lie, it makes it provable afterwards, which deters only where the liar is known and has something to lose (section 7). What a proven fork costs its signer is their standing with whoever sees it, which anyone may compute (task K13). It cannot reveal that a signer's line has a later act that was not shown; only rule 6 answers "nothing later". What a fork removes from later answers is open (P9).

### Rule 6. Place to look

**Plain words.** An agreement may name one place where its acts are lodged in order. Then the questions "is this the latest?", "is this all of it?" and "who holds this now?" have answers, and anything not lodged there does not count. Without a place, nobody can prove that nothing else exists, and a verifier must say so.

**Precisely.**
- 6.1 Terms MAY name a `place`.
- 6.2 Where the Terms in force name a place, an act within the agreement counts for any answer about what is latest, what is whole, who holds what, whether a period has passed, or whether something was made public, only once the place shows it, and at the position the place gives it. A verifier MUST take those answers from the place, qualified **per place**.
- 6.3 Where no place is named, a verifier MUST qualify every such answer **as shown**, and MUST NOT give it as latest or whole.

**Lie exposed.** "There is nothing later", "there is no side piece", "nobody else holds it", "you were told" (by publication), "the deadline has passed". A document cannot prove an absence; only a single place to look can (`agreement-tasks.md`, what collapsed: Current, Whole, Alive). (#33 Current, #34 Whole, #11 Title, #12 Sum, #13 Transfer, #32 Notify, #36 Wait.)

**Protects.** Everyone who arrives later and must rely on "nothing else exists": the newcomer, the buyer of a part, the heir, the judge, the counterparty of an agent whose grant may have been ended.

**Reasoning.** This is the closed-world rule ("what is not in the register does not count"), which the research calls a design decision, not a discovery. It is made local: each agreement names its own place, so "a thing's ownership is exactly as global as its witness set". Rule 6 is a MAY because a bilateral agreement about deeds barely needs a shared sequence; the research finds that one is needed for exactly two things, scarcity and freshness. Rule 6.3 is the price of not naming one, stated to the reader instead of hidden. Changing the place is a replacement of Terms and goes through rule 4. Rule 10 asks another agreement's place who its receiver is now; that answer is per *that* agreement's place.

### Rule 7. Say who said it

**Plain words.** Whether a thing was delivered, whether it was what was promised, how much there was, whether someone is alive, what time it was, whether money moved, who filled a spot, how often something was seen: an agreement can record who said so, never make it so. A verifier always reports who said it.

**Precisely.**
- 7.1 For any answer about the world (a deed done, a thing's quality or quantity, an event, a person's presence or absence), about time, or about value under Control, a verifier MUST report who stated it: the one who performed, the one who received, a named witness, the controller, or the place.
- 7.2 A time written inside an act is reported as its signer's claim. Only a place gives a position.
- 7.3 A verifier MUST NOT report value as moved on the strength of an Agreements act alone. An act can instruct Control; whether Control obeyed is the controller's or the receiver's signed word.
- 7.4 Who fills a spot (rule 9), and how often something was seen (rule 11), are answers about the world. A verifier MUST report them with whoever confirmed them.

**Lie exposed.** A claim laundered into a fact: "it was delivered" when only the deliverer said so; a backdated act; "you were paid" when only the payer says so; "I am the one who did it" when only the claimant says so. Signed text proves that the signer said it, and nothing more; this rule stops a verifier's answer from saying more than that.

**Protects.** The receiver, who did not choose to be declared paid or served, and every reader who would otherwise take a verifier's summary as fact.

**Reasoning.** The research's largest residue is truth: whenever an agreement touches the world, "someone must say what happened, and their signature proves only that they said it". And "the record cannot hold value": every entry about value is a claim or an instruction, neither is the value. Rule 7 does not rank sources; whether a receiver's acknowledgment (#20) or three witnesses suffice is a rule (task K4) chosen in the Terms.

### Rule 8. Unchecked is not passed

**Plain words.** If a verifier lacks something it needs to check (a cMIP it does not have, a place it cannot reach, the acts of an agreement named as a party), it says "unchecked". It never says "fine" or "broken" instead.

**Precisely.**
- 8.1 Where a verifier cannot apply a rule it needs, because it lacks a cMIP named by fingerprint, lacks an act named by fingerprint, lacks the acts of an agreement named as a party, or cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it.

**Lie exposed.** "My software says it checks out", from software that could not check. Signed text cannot expose what a verifier silently skipped.

**Protects.** Anyone relying on someone else's verification, and the parties of an agreement whose cMIP has become rare.

**Reasoning.** Because every agreement can name any cMIP, verifiers will always meet ones they do not have. Without rule 8, the convenient path is to treat the unknown as passing. With it, an agreement written today stays honestly readable when its cMIPs are old.

### Rule 9. Spots

*From S6, S7 and S8.*

**Plain words.** Some participants are not known when the agreement is written. The agreement keeps a spot for each of them, and says what earns it: having done something, having received something from the one before, holding something (a relay holding data, for example), or being someone who fits a description. Whoever proves it fills the spot. For those nobody could foresee in any of these four ways, a fifth, open kind of spot lets a cMIP say both who the participant is and how they are confirmed. The grammar does not say how anything is proven: the cMIP the spot names does. It only says that the spot, and its cMIP, are fixed in advance, and that whoever filled it is reported with whoever confirmed it.

**Precisely.**
- 9.1 A role in `parties` MUST name:
  - its **kind**, one of: **done** (whoever proves they have done X), **received** (whoever proves they have received Y), **holding** (whoever proves they are holding Z), **fits** (whoever proves their identity fits the conditions in W), or **future**;
  - its `what`: the X, Y, Z or W, by fingerprint (rule 1), except for kind future (9.4);
  - the cMIP answering task K12 that says who fills it, by fingerprint.
- 9.2 A spot is filled, by a signer, when its K12 cMIP, applied to the acts held and the place's answers, names that signer. A verifier MUST answer who fills a spot with the acts the K12 answer rests on, each reported by who signed it (rule 7.4), qualified per place or as shown (rule 6).
- 9.3 A signer who fills a spot is a party in it from then on. They are bound only by their own assent (rule 4). Filling a spot does not bind any other party.
- 9.4 A role of kind **future** names no `what`: its K12 cMIP defines who the participant is as well as how they are confirmed. It is for participants none of the four kinds can describe in advance. No verifier can check that a future spot was used only for them; whether it was is the authors' word, carried by them (rule 2).

**Lie exposed.** "I am the one who did it", "it was passed to me", "I hold it", "I am one of them", said after the fact, with a confirmer chosen after the fact. Without a spot fixed in advance, the one who pays decides afterwards who earned it, and the claimant cannot check that the test was the one promised (`late-roles.md`: "The payer as sole confirmer appears in the affiliate and bounty cases"). With it, the test is pinned by fingerprint before anyone claims, and the answer always says on whose word the spot was filled.

**Protects.** Whoever earns a spot and was not there to sign: the referrer, the heir, the relay, the later contributor, the beneficiary. Also every other party, who agreed in advance to the test a stranger must pass.

**Reasoning.** `late-roles.md` finds that about eighteen recorded roles link to a person in only four ways: "by **doing** something, by **receiving** from the previous holder, by **holding** an object, or by **being** someone who fits a description". Nobody, allegedly's four spots name the same four. The kinds are in the grammar because they say what sort of answer a verifier is reporting (a deed, a chain, a holding, an identity) and so whom it rests on; *how* each is proven is the K12 cMIP's question, since that is something cMIPs will solve. The fifth kind exists because the research's section 4 shows roles no agreement anticipated (the unknowing source, the rescuer, the owed but unfindable, the contributor recognised afterwards, the early user), where "someone with judgment decides afterwards". A future spot lets an agreement name that judgment in advance, by its cMIP. Rule 3.2 already requires Terms with a spot to say how they come into force. Whether a spot holds one signer or many is open (P7).

### Rule 10. A work as a party

*From S5.*

**Plain words.** An agreement can name another agreement (a song, a library, a drawing, anything with its own agreement) as one of its parties. Nobody signs on its behalf, and no group has to be formed. Whatever is owed to it goes to whoever that agreement names as its receiver at the time. The receiver then takes it into their own agreement, which may name further agreements in turn. That is how a series of splits is possible: each one pays into the next, by its own signed words.

**Precisely.**
- 10.1 Terms MAY name a party as an agreement, by its root fingerprint.
- 10.2 A party named as an agreement never assents, is never counted by rule 3.1, and is never bound by any act of these Terms. No signer acts for it here, and none is needed.
- 10.3 Terms MAY name a `receiver`: one of their own parties, named as a signer or as a role.
- 10.4 Whatever an act or a rule of one agreement gives or owes to a party named as an agreement, it gives or owes to that agreement's **receiver now**: the `receiver` named by its Terms in force. A verifier MUST take the Terms in force from that agreement's own place, qualified **per place** with that place named, or **as shown** if it names none (rule 6). If those Terms name no receiver, or the spot named is not filled, the answer is **not shown**. If the verifier lacks that agreement's acts, it is **unchecked** (rule 8).
- 10.5 A rule (task K4) MAY take a receiver now, so answered, as an input.

**Lie exposed.** "I receive for that work", said by someone who once did and no longer does, or never did; and "that work was paid", when it was paid to a past receiver. Signed text in the paying agreement cannot say who receives for another agreement today; only that agreement's own Terms in force can, and rule 10.4 sends the verifier there and labels the answer with where it came from.

**Protects.** The people of the work pointed at, who did not sign the pointing agreement and need not: they are not bound by it (10.2), and what it owes their work reaches whoever their own agreement says. Also the one who pays, who can show they paid the receiver named at the time, per that place.

**Reasoning.** Nobody, allegedly: "The new agreement pints to the other agreement as one party, no collective involved". So the agreement party is not a group that must sign, and is not bound; it is a pointer to whoever its own signers chose to receive. Its words are pinned (its root is a fingerprint), and what it says now is read from its own place, which is why rule 1 and rule 6 together suffice. The test `shower-cmips-1.md` (item M2) found that draft 1 could only say "owed to the agreement TP1", which is not a person, and that "the step from 'owed to TP1' to 'paid to Bo' was done outside any rule"; rule 10.4 is that step, inside the grammar. Whether a receiver may itself be an agreement, and when "now" is read, are open (P8a, P8b).

### Rule 11. Seen, by the agreed witness

*From S9; rewritten in draft 3 from S12, S13 and S14.*

**Plain words.** Where someone is rewarded for being seen (each play, each view, each repost, each delivery to an audience), only the witness the agreement names can count it. A count by anyone else does not count. And of what the witness counts, only what the agreement's own rule sets up to be counted is counted. A rule can count only the views or referrals that led to a settled payment ("Show me referees that lead to settlement only"), or it can reward pure attention, every view the witness states. That choice belongs to those who agree, in the cMIP they pick. Nothing is ever rejected: what the rule does not set up to be counted was simply never counted.

**Precisely.**
- 11.1 A role rewarded for being seen MUST name its `witness`, a signer or a role, in `parties`.
- 11.2 A count of being seen is counted, by any rule, only if it is stated in a Statement signed by that witness.
- 11.3 Which of the witness's counts are counted, and how, is said only by the rule (task K4) the Terms name for it. A count that rule does not set up to be counted is not counted. No act is needed to keep a count out, and the grammar defines none.
- 11.4 A Statement MAY name a `settlement` it is tied to. A rule MAY count only counts tied to a settlement, or every count the witness states; the grammar requires neither. Which counts are tied to which settlement, and how, is a cMIP's. A settlement named is reported on the word of whoever gave it (rule 7.3).
- 11.5 A verifier MUST report counts as stated by the witness, and which of them the rule counted.

**Lie exposed.** Inflated attention: plays by machines, views loaded by machines, payments in the wrong direction disguised as audience. `late-roles.md`: "Roles counted by attention suffered fabrication of the event itself", and the streaming case, where fake plays drew "about $8.09 million" from a shared pool, "so the money came from real rights holders". Signed counts prove only that the counter said them; without an agreed witness, whoever counts most is paid most.

**Protects.** Everyone paid from the same source as the counts: the real performers and rights holders whose share a fake count takes. Also the payer, who agreed in advance whose count binds them and which counts are counted.

**Reasoning.** Being seen is a deed that only an observer can report, so it belongs to the residue the research calls truth. The grammar cannot make a count true; it can only fix in advance who may count (11.1, 11.2). Draft 2 then gave a way to reject counts no settlement stood behind. Nobody, allegedly: "Well, more than rejected is never setup to be counted", and "I never ment for a rejection to be something. It was in a cMIP driven scenario." So draft 3 has no reject: what counts is what the rule in the Terms sets up to count (11.3), and nothing outside it needs refusing. The field `settlement` stays so that a rule can be asked the question in his words, "Show me referees that lead to settlement only" (11.4). It is not required, because "Advertisement industry can still build a model that still rewards pure attention, if they wish." Where payments must gather in a pool before they are divided, a single count may not be tied to its own settlement; that is part of P6.

---

## 5. Tasks handed to cMIPs

A task is one question the grammar asks and does not answer (section 2). A cMIP answering a task accepts what the task says and produces what the task says; anyone may write one, and a cMIP may answer a task for one kind of thing only (one cMIP for land, another for shares). Where a task belongs to another layer's operation, it is named and not defined.

| # | Task | Question | Accepts | Produces | Trust |
|---|---|---|---|---|---|
| K1 | Body | What do these words say? | the `body` bytes | a reading for people, and any parts for machines that rules read | none: format only |
| K2 | Identity | Who is behind this signer? | a signer, an agreement | signed statements by those who vouch for the signer | witness (Sign layer) |
| K3 | Assurance | What was done to make it likely that a party was able, free and understood? | Terms, a party | signed statements of what was done (cooling-off, separate advice, witnessing) | witness; never a pass |
| K4 | Rule | What does this rule produce from these acts? | a rule's parameters, the acts held, the place's answers, and receivers now (rule 10.5) | yes, no, a list of who, or amounts; the same output for the same inputs, every time, for anyone | none: anyone can recompute |
| K5 | Witness | What happened in the world? | the question as the Terms state it, the named witnesses | each witness's signed statement | witness |
| K6 | Place | Is this act in the place, at what position, and is anything later? | the place's identifier, an act or an agreement | a signed answer by the place | place (Order layer) |
| K7 | Tally | What did a vote decide, without showing who voted how? | the ballots, the list of who may vote | the result, with whatever proof the method allows | teller |
| K8 | Control | Has the controller carried out this instruction? | an instruction, with the acts and rule result behind it | the controller's signed evidence | hand (Control layer) |
| K9 | Delivery | Did this act reach this person? | an act, a recipient | the recipient's signed acknowledgment, or the Deliver layer's evidence | recipient or Deliver layer |
| K10 | Judge | What did the named judge decide? | the Terms (including `authors`), the acts of the dispute | the judge's signed decision, which binds only through a power under rule 4 | judge |
| K11 | Kind | What does a Statement of this kind state, and which rules read it? | a `kind` fingerprint | the meaning of `content`, and how K4 rules may read it | none: definition only |
| K12 | Spot | Who fills this spot, and on whose word? | the role (its kind and `what`), the acts held, the place's answers | the signer who fills it, or none, with the acts the answer rests on; for kind future, also what defines the participant | whoever the cMIP names as confirming: for done, a witness or the counterparty; for received, the previous holder; for holding, the place or the holder; for fits, those who vouch (K2); for future, as its cMIP says |
| K13 | Standing | What do one signer's acts show about them, to anyone who looks? | a signer, any acts and place answers the one asking holds | whatever measures the cMIP defines (proven forks, acknowledgments given and received, spots filled), computed from signed acts only, qualified per place or as shown | none: anyone can recompute; nobody keeps it |

**Why these, and why so few.** The research found that the same few operations answer the 49 questions, and that a "silent sixth operation", applying a stated rule to known inputs, needs no trust because anyone can redo it. So the tasks sort by whom they make you trust: nobody (K1, K4, K11, K13), a witness of the world (K2, K3, K5, and K12 for most kinds), a place (K6), a teller (K7), a hand (K8), a recipient (K9), a judge (K10). Each task is one question; many cMIPs may answer each one, pointed at different objects, and "more tasks means less defining for each one" holds inside each row: a cMIP for share registers and a cMIP for votes both answer K4 without either defining the other.

**Why K13 is a task of its own.** Nobody, allegedly: "reputation tracking no platform owns or computes is important." K4 is one agreement's rule; reputation reads a signer's acts across many agreements. K13 says what such a reading may rest on (signed acts and place answers, nothing a platform alone holds), and that its answer is the same for anyone who holds the same acts. Which measures matter, and how they are weighed, is the cMIP's.

---

## 6. Open parameters

These are values the grammar rules depend on and this draft does not fix. P1 to P5 are draft 1's; P6 is from S10; P7 and P8 come from the new rules; P9 to P12 are gaps the tests found, written here as open instead of closed (section 9).

- **P1. Default for `in_force`.** Rule 3.1 sets it to "every party named as a signer". Whether a different default is wanted is open.
- **P2. Depth of powers through powers.** Rule 4 lets Terms named in `under` themselves be bound through other Terms (an agent of an agent; a group within a group). Whether a verifier must follow any depth, or a limit applies, is open.
- **P3. Ending a grant.** Under rule 4, a grant of authority ends as its own powers say; with no power named, only by every party's assent, which lets an agent block their own dismissal. Whether a principal must always be able to end a grant alone is a decision for Nobody, allegedly; it is not taken here.
- **P4. One place or several.** Rule 6 names one place. Whether Terms may name several places with a K4 rule over their answers (plural witnesses of order) is open.
- **P5. What a verifier holds.** Rules 5 and 8 depend on which acts the verifier holds. Whether a verifier answers from a set it is given, or must also ask the place for more, is open. K13's answers depend on it most.
- **P6. Pools.** In plain words: some ways of paying (rails) cannot pay each share at the moment it is earned. Money must first gather in one pot, and be divided later. Nobody, allegedly: "Sadly some rails will need pools… this headache won’t be easy." This draft does not solve it. What is open, all of it:
  - who holds a pool, and on whose word it is said to hold what it holds (rule 7.3: only the holder's or controller's word);
  - when a pool is divided, and by which rule;
  - how a claim on a pool is counted when each false claim takes from the real claimants (`late-roles.md`: "each fake claim takes from real claimants, and the payer has little reason to resist");
  - what "tied to a settlement" (rule 11.4) means for a count paid out of a pool, where one settlement covers many counts;
  - what happens to a pool's share that no one has yet claimed (the owed but unfindable).
- **P7. One holder per spot, or many.** Rule 9 links a spot to a signer. Whether one spot can be filled by many signers (every referrer), whether a filled spot can pass to another, and whether a later claimant can displace an earlier one, are open.
- **P8. Receivers.** (a) Whether a `receiver` may itself be an agreement, so that one receiver points onward, and if so to what depth, and what a loop answers. (b) When "now" in rule 10.4 is read: when the question is asked, or at the position of the act that owes.
- **P9. What a fork removes.** Rule 5.2 says a verifier "MUST answer **fork** for that signer". Whether that is for the two acts only or for every later answer involving the signer, and whether a signer can make their own assent uncountable by forking on purpose, is open (`situations-1.md`, F2, F2a).
- **P10. Ending and withdrawing.** Rule 3 says when Terms come into force and nothing says when they stop. Whether replacing Terms ends the ones replaced, which of two replacements of the same Terms counts, how a withdrawal of an assent or of an open offer is read, and whether an open offer whose spot no one can sign for can be ended at all, are open (`situations-1.md`, F1, F3, F4, F9).
- **P11. Dates.** A place gives positions, not dates. Whether a K4 rule may read a calendar date, and from whom, is open (`situations-1.md`, F6).
- **P12. One act for many.** `for` names one person. Whether one decision or judgment binding many is one act or one per person is open (`situations-1.md`, F7).

---

## 7. Stated costs

Cases that do not fit the grammar. None is closed by a rule.

- **Minds.** Whether a party was able (#3) or free (#5) cannot be shown by any act. K3 can make it more likely and record what was done; nothing assigns its failure. Only Align is assigned (rule 2).
- **Conceal (#39).** Terms can be kept private and their fingerprint lodged in a place; nothing can show the words were not told to someone, and telling cannot be undone.
- **Enforce beyond what was posted (#45).** Words can order a release; something must obey. Against value not under Control, force lies outside the protocol. A proven liar (rule 5) loses only what they posted and their standing with those who see the proof (K13). Against a stranger who vanishes, the proof is worth nothing.
- **Deeds lean on witnesses.** The more an agreement is about services and acts in the world instead of value under Control, the more it rests on K5, whose statements prove only that the witness said them.
- **Spots lean on their confirmers.** Each kind of spot has its own recorded fraud (`late-roles.md`): doing is faked "by simulating the act or stealing credit"; receiving "by forging the chain"; holding "by forging the object or issuing more than exists"; being "by false or multiplied identities". Rule 9 fixes the test in advance and rule 7.4 reports who confirmed; neither makes the confirmer honest.
- **Future spots are the authors' word.** Whether a future spot was used only for participants no one could anticipate cannot be checked (rule 9.4). Authors who use one for an ordinary participant, to escape the four kinds' clearer tests, are not stopped by the grammar.
- **Seen counts lean on one witness.** Rule 11 makes the agreed witness the only counter, so a witness who lies, or who is also the payer, counts as they like. Which counts are counted is the Terms' choice (rule 11.3): a rule that counts only what led to a settlement leaves out someone truly seen whom no payment yet stands behind, and a rule that rewards pure attention rests every count on the witness alone.
- **"Now" is as wide as the other agreement's place.** Under rule 10.4, an agreement with no place can name its receiver now only as shown. A payer can pay a receiver who has since been replaced without either side being able to know. The climb up a series of splits gets less certain at each level that names no place.
- **A work that names no receiver cannot be paid.** Under rule 10.4, what is owed to it has no one to go to, and is not shown.
- **Reputation is as wide as the acts one holds.** K13 answers only from what the one asking holds, per place or as shown. Two people holding different acts compute different standing for the same signer, and honest forks (below) count against honest people.
- **Without a place, no scarcity and no freshness.** The same thing can be given twice in two branches, the latest act can be withheld, silence cannot be counted. Rule 6.3 makes this visible; it does not cure it.
- **Ownership is as wide as its place.** Two parties who accept different places cannot settle who holds a thing between them. The same thing sold in two separate agreements is seen by neither agreement's rules (`situations-1.md`, F5).
- **Closed world hurts the one who did not lodge.** Under rule 6.2, a party's own act that never reached the place does not count, even if it is genuine.
- **Honest forks.** A signer who loses track of their last act (a lost device, a restored backup) and signs again produces a fork that looks exactly like a lie. Honest drift and lying look the same from outside.
- **Withdrawing before in force.** Between a first assent and the last, the first signer holds an open option against themselves. Withdrawal is a race that only a place, or an `in_force` rule with a deadline read from a place, settles (and see P10).
- **Revoking an open offer.** The same race, between the offeror's withdrawal and a stranger's filling a spot.
- **Secret votes need a teller.** K7 requires trusting whoever counts.
- **Identity ends in acquaintance.** Who vouches for the voucher (K2) ends in someone knowing someone; the grammar cannot express that. Spots of kind fits rest on it.
- **The record holds no value.** Every act about value is a claim or an instruction. The gap between "the record says 100" and "there are 60" must be checked continuously (K5, K8), not once.
- **Those who cannot sign.** A contributor who has no key (the long dead, the unknowing) can be named in words but is no party, and nothing can arrive for them (`shower-cmips-1.md`, 7.3).
- **No default way out.** By rule 4, an agreement that names no power to change or end itself changes only by everyone's assent again. If a party is gone and no successor was named in advance (#37, #38), it is stuck. The way out is designed in advance or not at all; this draft chooses that over any default that would let someone be bound without their signature.
- **Ordering and chaining show patterns.** Rules 5 and 6 make the shape of an agreement (who acted, how often, in what order) visible to whoever sees the acts or the place, even when the words are concealed. K13 reads exactly those patterns.

---

## 8. What I needed and did not have

- The core's act format: whether it already gives fingerprints, a per-signer chain (which would make rule 5 redundant), acts signed by several people at once, and field names.
- What the Order layer's place can answer: in particular whether it can sign "nothing later than this", and how a place is identified without a server address.
- What the Sign layer does when a key is replaced or lost, since that decides whether rule 5 sees a fork.
- How cMIPs are identified in practice, so that "named by fingerprint" in rule 1 can be met.
- What a settlement is, as the layer that holds value gives it, so that rule 11.4's `settlement` names the right thing.
- How a holding (a relay holding data, for example) can be shown by anyone other than the holder, for spots of kind holding.
- Nobody, allegedly's decision on P3 (whether a principal can always end a grant alone).
- The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an evidence-only record to be enough. Rule 5 depends on the answer for its force; K13 is where that loss would be read.
- Whether the verifier's answers (shown, not shown, fork, unchecked) are already named in another layer, so that the words match.

---

## 9. For Nobody, allegedly: what the tests found that these words do not cover

Each item is a gap found by `situations-1.md` (F1 to F20) or `shower-cmips-1.md` (M1 to M5, E8), that none of the statements S1 to S14 covers. None is closed here. Each says what draft 2 does with it: **kept** (draft 1's text unchanged), **open** (written as an open parameter), or **cost** (written as a stated cost). Draft 3 keeps every one as draft 2 had it; only the wording of M3's row changes, because it named rule 11.

### 9.1 Covered by his words

- **M2. One agreement reading another**, and an amount owed to an agreement rather than a person. Covered by S5: rule 10.

### 9.2 Touched by his words, not closed

- **F8. A newcomer not named in `parties`.** A newcomer foreseen in advance can now be a spot (rule 9; for a buyer of a part, kind received). A newcomer no one foresaw, admitted under a power, is as in draft 1: kept.
- **F13. One agreement for all acceptors of an offer, or one each.** "earn spot 1" reads as one spot per person, but nothing says whether a second claimant fills the same spot. Open: P7.
- **F14. How a successor becomes a party.** An heir can now be a spot of kind received (rule 9.3: a party in it from then on). Whether a successor named by a power acts `for` the one gone or in their own name is as in draft 1: kept.

### 9.3 Not covered

| Item | Gap | Draft 2 |
|---|---|---|
| F1 | Nothing makes Terms stop being in force: replacing, ending and revoking have no computed effect. | open: P10 |
| F4 | Two replacements of the same Terms can both be in force. | open: P10 |
| F9 | An open offer with no power to end it can never be withdrawn, since "every party's own assent" includes a spot. | open: P10 |
| F3 | Withdrawal of an assent has no act any rule reads. | open: P10 |
| F2, F2a | What "fork for that signer" removes; forking on purpose. | open: P9 |
| F5 | A double sale in two agreements is invisible to rules 5 and 6. | cost: "Ownership is as wide as its place" |
| F6 | A place gives positions, not dates. | open: P11 |
| F7 | One act binding many people has `for`, which holds one person. | open: P12 |
| F10 | Rule 4.1(a) "they signed it in their own name" against "Stating Terms is not agreeing to them". | kept |
| F11 | Whether the acts putting Terms in force must be at the place. | kept |
| F12 | Rule 4.4's "the Terms" when the grant and the deal name different places. | kept |
| F15 | A receipt for a thing is mapped to K9, which is about acts. | kept (the mapping is now in `companion-2.md`) |
| F16 | Rule 2 assigns unclearness, but no verifier answer depends on it. | kept |
| F17 | A pending assent or open offer survives its signer's death or loss of capacity. | kept |
| F18 | What is lodged at the place (act or fingerprint), and so how private "private" is. | kept |
| F19 | The body can be revealed whole or not at all. | kept |
| F20, M1 | Anyone may make a Statement within any agreement; whether an act by a non-party is within it. The shower model depends on it (a thank-you, a parent's receiver acknowledging). | kept |
| M3 | Money arrives outside the agreement: only the holder's own Statement brings income into the record. Rule 11 lets a rule count only counts tied to settlements; it does not bring settlements in. | kept |
| M4 | The Money text points at an Agreements text that draft 1 replaces (publication, split, line, collective). Rule 10 needs no collective; the rest is outside this text. | kept; listed for whoever writes the link |
| M4 (part) | A work's income received by a group together: `receiver` names one party. | kept |
| M5 | Money's answers (valid, invalid, pending, unknown) and these (shown, not shown, fork, unchecked) do not meet. | kept (section 8) |
| E8 | Two different receipts for one payment are told apart only by the Money layer, which K4 does not receive. | kept |
| 7.3 | Those who cannot sign; an omitted parent; a holder who does not pay. | cost (as in draft 1, and "Those who cannot sign") |

### 9.4 Readings of his words that he should confirm

These are Claude's readings, written into draft 2 (and, for item 2, rewritten in draft 3) so that it can be read whole. Each could be wrong.

1. **S8, "To be used only for".** Read as: the future kind is for participants the four kinds of S7 cannot describe in advance (rule 9.4), with the gloss from the brief. Since no verifier can check that, rule 9.4 lays it on the authors.
2. **S12 to S14, what is counted.** Draft 2's reading of S9 (the Terms name who may reject, in `may_reject`) is withdrawn: his words say a rejection was never meant "to be something". Draft 3 reads them so:
   - (a) "never setup to be counted" is read as: the rule the Terms name decides which counts are counted, and nothing outside it is (rule 11.3). No act keeps a count out.
   - (b) "Show me referees that lead to settlement only" is read as a question a rule must be able to ask. So the Statement field `settlement` is kept, read by rule 11 and by K4 rules, rather than removed and left wholly to cMIPs. If he meant the tie to settlement to live only inside cMIPs, the field goes too.
   - (c) "referees" is read as whatever the witness counts under rule 11 (views, plays, reposts, referrals). Whether these words also say something about spots of kind done, such as referrers (rule 9), is not taken up.
   - (d) The witness of S9 ("seen by the agreed witness") is kept (rules 11.1, 11.2), since S12 to S14 do not withdraw it.
3. **S5, the receiver.** His words say the money goes to "whoever that agreement names as its receiver now". Draft 2 reads that as a field `receiver` in Terms, read by the grammar, rather than a part of the body read by a cMIP. Whether a receiver may itself be an agreement is left open (P8a).
4. **S11, reputation.** Read as a task (K13) with no trust and no keeper, rather than a grammar rule: the grammar keeps what reputation reads (signed acts, proven forks, acknowledgments) checkable by anyone, and leaves the measure to cMIPs (S4).

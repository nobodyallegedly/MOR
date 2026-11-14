# Agreements, from scratch: draft 1

11 November 2026. Written from `docs/strangers-2026-11/` only (its README, `agreement-tasks.md`, `agreement-grammar.md`). Nothing of the earlier Agreements text was opened or translated. Decision of Nobody, allegedly: "a total rewrite of agreements from scratch".

Task numbers in brackets, such as (#23 Hold), refer to the 49 tasks in `agreement-tasks.md`.

---

## 0. In plain words

People agree in order to defend themselves against the other party's future self, and their own. Honest drift and lying look the same from outside, so every written agreement is written for a third person who may turn up later: a newcomer, an heir, a judge, a buyer. The least two people need to write down is exactly the least that third person needs to see.

Most of what an agreement needs is already provided by the layers around Agreements: words that cannot shift (State), a mark that binds someone (Sign), getting the words to someone (Deliver), placing them before or after something else (Order), and power over a thing (Control). Agreements does not redefine those. It adds only what those five cannot give on their own, and every addition here must answer two questions:

- **Which lie does it expose that signed, ordered text cannot already expose?**
- **Whom does it protect who did not choose it?**

That test leaves eight rules for a verifier. Everything else an agreement needs is handed to cMIPs as eleven tasks, each asking one question. What fits neither is written down as a cost, openly, instead of being patched with another rule.

In one sentence: **Agreements fixes what was agreed and who is bound by it, and says honestly what it does not know; everything about the world, about time and about value is somebody's signed word, reported as such.**

The eight rules, in plain words:

1. **Whole.** Whatever the agreement relies on is named by its fingerprint. Anything named otherwise is not part of it.
2. **Author.** The agreement says who wrote its words. Whoever wrote them carries their unclearness.
3. **In force.** Signing first does not bind you alone. Your signature counts once the signatures the agreement asks for are all there.
4. **Own signature.** Nobody is bound by an act they did not sign, except through an agreement they did sign that gives that power, and the act must say so at the time.
5. **Own chain.** Each person's acts in one agreement point at their previous one. Two acts pointing at the same previous one prove that person told two stories.
6. **Place to look.** An agreement may name one ordered place. Then "nothing later" and "nothing else" have answers, and only what is found there counts. Without one, every such answer is "as shown", never "latest".
7. **Say who said it.** Whatever concerns the world, time or value is reported with the name of whoever stated it. An agreement never makes it true.
8. **Unchecked is not passed.** What a verifier could not check, it reports as unchecked.

The way out is the reason for rule 4: nothing ties a person except their own signature, and nothing changes or ends an agreement except what its own signers agreed in advance. The cost is equally plain, and is written in section 7: an agreement that names no way to change it can change only when everyone signs again.

---

## 1. Purpose

Agreements defines:

- the two acts in which agreeing is written (Terms and Statement);
- the rules by which a verifier decides, from acts alone, **who is bound by which Terms, and what is shown, unknown or contradicted**;
- the tasks that cMIPs fill so that agreements can be about anything: votes, sales, shares, agents, deadlines, witnesses, judges, payments.

Agreements does not define how words are fixed, how signatures work, how acts travel, how a shared order is kept, or how value is held. It names those operations (State, Sign, Deliver, Order, Control) where it needs them.

Agreements does not decide whether anything happened in the world. It records who said so.

### Two properties, not rules

Two of the 49 tasks are not tasks but qualities every operation must have (`agreement-grammar.md`, finding 1):

- **Durable** (#9 Keep): what an act fixes is still there and unaltered when needed.
- **Verifiable** (#10 Check): an outsider holding copies can test it.

Agreements relies on both and adds no rule for them. One consequence is a design constraint on everything below: **every rule here is checked from copies of acts alone**, plus the answers of a named place where rule 6 applies. No rule needs a particular server, keeper or software author to remain.

---

## 2. Definitions

Each word here means one thing throughout this text.

- **Act**: a signed statement in the core's sense. Published or signed again, never updated. The fields the core gives every act (who signed, the signature, the act's own fingerprint) are not repeated here.
- **Fingerprint**: the identifier the core gives to fixed bytes. "Named by fingerprint" means referred to by that identifier and nothing else.
- **Terms**: an act that states what is agreed. Always capitalised and singular ("a Terms act", "these Terms"). Stating Terms is not agreeing to them.
- **Statement**: any other act made within an agreement. Its **kind** says what it is (see task K11). One kind is defined here: **assent**.
- **Assent**: a Statement by which its signer agrees to one Terms act.
- **Agreement**: the first Terms act together with every Terms act that replaces it, directly or through others, and every Statement made within them. Its identifier is the fingerprint of the first Terms act (the **root**).
- **Party**: a person named in Terms as one who may be bound. Named either as a signer, or as a **role**: a description ("whoever does X") together with the rule that recognises who fills it.
- **Author**: a party whose words the Terms are.
- **Power**: an entry in Terms saying that a Statement of a given kind (or a replacing Terms act) binds the parties when a given rule says yes.
- **Rule**: a cMIP filling task K4, named by fingerprint, with its parameters. It computes; it trusts nobody.
- **Bound**: a person is bound by an act when rule 4 says so.
- **In force**: Terms are in force when rule 3 says so.
- **Place**: an ordered place to look, provided by the Order layer, which can say of an act whether it is there and at what position, and whether anything is later.
- **Verifier**: whoever applies these rules to a set of acts. A verifier answers questions; it does not decide disputes.
- **Answers**: a verifier's answer is one of:
  - **shown**: the acts held establish it under these rules;
  - **not shown**: the acts held do not establish it;
  - **fork**: two acts by one signer contradict under rule 5;
  - **unchecked**: the verifier could not apply a rule it needed (rule 8).

  Answers about what is latest, or what else exists, carry one of two qualifiers: **per place** (with the place named) or **as shown** (meaning: among the acts this verifier happens to hold).

---

## 3. The data each act carries

Each field is listed with the rule that reads it. A field no rule reads is not here. An act missing a field marked required is not an Agreements act.

### 3.1 Terms

| Field | Required | What it holds | Read by |
|---|---|---|---|
| `replaces` | in every Terms act except the first | fingerprint of the Terms act this one replaces | rule 4 |
| `agreement` | exactly when `replaces` is present | fingerprint of the root | rules 4, 5 |
| `parties` | yes | each party: a signer, or a role (description plus rule) | rules 3, 4 |
| `authors` | yes | one or more of the parties | rule 2 |
| `body` | yes | fingerprint of the words, and fingerprint of the cMIP (task K1) that says how to read them | rule 1 |
| `relies_on` | if anything else is used | fingerprints of every other piece the Terms use | rule 1 |
| `in_force` | no | a rule saying which assents put the Terms in force; absent means the default of rule 3 | rule 3 |
| `powers` | no | list of (kind, rule) | rule 4 |
| `place` | no | the place to look, by the identifier the Order layer gives it | rule 6 |
| `previous` | yes | the signer's previous act in this agreement, or none | rule 5 |

### 3.2 Statement

| Field | Required | What it holds | Read by |
|---|---|---|---|
| `agreement` | yes | fingerprint of the root | rule 5 |
| `terms` | yes | fingerprint of the Terms act it is made within | rules 3, 4 |
| `kind` | yes | `assent`, or the fingerprint of a cMIP filling task K11 | rule 4, task K11 |
| `content` | as the kind requires | what is stated, by fingerprint or inline as the kind says | task K11 |
| `for` | together with `under` | the person in whose name the act is made | rule 4 |
| `under` | together with `for` | fingerprint of the Terms that give the power to act for that person | rule 4 |
| `previous` | yes | the signer's previous act in this agreement, or none | rule 5 |
| `answers` | no | fingerprints of acts this one replies to | tasks K9, K10 |

An assent's `content` is empty: its `terms` field is what it agrees to.

---

## 4. Validity rules

Each rule is given in plain words, then precisely, then with its two answers and the reasoning. MUST, SHOULD and MAY are used as in RFC 2119. No SHOULD appears: every rule that survived the two questions turned out to be either required or a free choice.

### Rule 1. Whole

**Plain words.** Everything the agreement uses is pinned by fingerprint. A link to something that could change is not part of the agreement.

**Precisely.**
- 1.1 The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.
- 1.2 Anything a Terms act refers to in another way is not part of those Terms. A verifier MUST NOT read it as part of them.

**Lie exposed.** "The document we referred to said something else", and "there was a side piece". A signature over words that point at something changeable proves only that the pointer was signed. (#34 Whole, #1 Fix.)

**Protects.** Every reader who arrives later: newcomer, heir, buyer of a part, judge. Also the party who signed without fetching what was referred to. None of them chose how the reference was written.

**Reasoning.** A cMIP can be revised; a document can be edited; a name can come to mean something new. Naming cMIPs by fingerprint is what lets an agreement be read correctly after its cMIP's author is gone, which is the good-ancestor requirement applied to meaning. Rule 1 does not prove that nothing else exists outside the Terms; that is rule 6.

### Rule 2. Author

**Plain words.** The agreement says whose words these are. If the words turn out to be unclear, the unclearness falls on them.

**Precisely.**
- 2.1 `authors` MUST name one or more of the parties.
- 2.2 The authors are the parties who bear the failure of the words to mean one thing (#4 Align). A cMIP filling task K10 (Judge) MUST accept `authors` as an input.

**Lie exposed.** "We wrote this together" or "I meant something else by that word", said by the one who did write it. Signatures alone cannot show who wrote the words: every party signs the same Terms.

**Protects.** The party who accepted words they did not write, above all whoever takes up an open offer (#9 situation: agreeing with anyone), who never had a chance to change the words.

**Reasoning.** Whether two people meant the same thing is an inner state at a past moment; no operation reaches it (`agreement-grammar.md`: Mind). The research's answer is "do not try to prove; assign in advance who bears the failure", and the open offer shows the assignment: whoever writes the words carries their ambiguity. Rule 2 makes the assignment readable; what a judge does with it is the judge's task. It assigns Align only. Able (#3) and Free (#5) are not assigned by any rule; see section 7.

### Rule 3. In force

**Plain words.** Signing first does not bind you alone. Your assent counts only once all the assents the agreement asks for are present.

**Precisely.**
- 3.1 Terms are in force when the assents their `in_force` rule requires are present. If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer.
- 3.2 Terms that name a party by role MUST carry `in_force`.
- 3.3 An assent binds its signer only while the Terms it names are in force.

**Lie exposed.** "You signed, so you are bound", said by the party who never signed. Signed text shows that one side signed; it cannot by itself show that the signature was conditional on the other's.

**Protects.** The first to sign, who did not choose to be bound alone.

**Reasoning.** "Each party must hold the other's commitment, not their own" (#7 Exchange). Exchange may run one way until the other side acts, which is why 3.2 requires an open offer to say how acceptance is recognised instead of falling back to a default that cannot apply to a role. Withdrawing an assent before the Terms are in force is a race; see section 7.

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

A newcomer is bound (#15 Bind) by their own assent to the Terms in force when they join; their assent names exactly that Terms act, so they are not bound by a version they never saw, except through powers in it they accepted.

There is no default power. An agreement that names no power to replace or end itself can be replaced or ended only by every party's own assent. This is the conservative way out, and its cost is in section 7.

### Rule 5. Own chain

**Plain words.** Each person's acts in one agreement are a single line: each one points at that person's previous one. If two acts point at the same previous one, that person has told two stories, and that is proven without a judge.

**Precisely.**
- 5.1 Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first.
- 5.2 Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork. A verifier holding both MUST answer **fork** for that signer, and MUST NOT choose between the branches.

**Lie exposed.** Showing one history to one person and another history to another (equivocation), and hiding an act in the middle of one's own line. Without a single shared sequence, two signed acts can each look like the latest; the pointer turns the contradiction into proof (`agreement-grammar.md`, second test: "a fork convicts itself").

**Protects.** The stranger who is shown only one branch, and any party who has no place to look.

**Reasoning.** Rule 5 is checkable by anyone holding the two acts, with no outsider. It does not stop the lie, it makes it provable afterwards, which deters only where the liar is known and has something to lose (section 7). It cannot reveal that a signer's line has a later act that was not shown; only rule 6 answers "nothing later".

### Rule 6. Place to look

**Plain words.** An agreement may name one place where its acts are lodged in order. Then the questions "is this the latest?", "is this all of it?" and "who holds this now?" have answers, and anything not lodged there does not count. Without a place, nobody can prove that nothing else exists, and a verifier must say so.

**Precisely.**
- 6.1 Terms MAY name a `place`.
- 6.2 Where the Terms in force name a place, an act within the agreement counts for any answer about what is latest, what is whole, who holds what, whether a period has passed, or whether something was made public, only once the place shows it, and at the position the place gives it. A verifier MUST take those answers from the place, qualified **per place**.
- 6.3 Where no place is named, a verifier MUST qualify every such answer **as shown**, and MUST NOT give it as latest or whole.

**Lie exposed.** "There is nothing later", "there is no side piece", "nobody else holds it", "you were told" (by publication), "the deadline has passed". A document cannot prove an absence; only a single place to look can (`agreement-tasks.md`, what collapsed: Current, Whole, Alive). (#33 Current, #34 Whole, #11 Title, #12 Sum, #13 Transfer, #32 Notify, #36 Wait.)

**Protects.** Everyone who arrives later and must rely on "nothing else exists": the newcomer, the buyer of a part, the heir, the judge, the counterparty of an agent whose grant may have been ended.

**Reasoning.** This is the closed-world rule ("what is not in the register does not count"), which the research calls a design decision, not a discovery. It is made local: each agreement names its own place, so "a thing's ownership is exactly as global as its witness set". Rule 6 is a MAY because a bilateral agreement about deeds barely needs a shared sequence; the research finds that one is needed for exactly two things, scarcity and freshness. Rule 6.3 is the price of not naming one, stated to the reader instead of hidden. Changing the place is a replacement of Terms and goes through rule 4.

### Rule 7. Say who said it

**Plain words.** Whether a thing was delivered, whether it was what was promised, how much there was, whether someone is alive, what time it was, whether money moved: an agreement can record who said so, never make it so. A verifier always reports who said it.

**Precisely.**
- 7.1 For any answer about the world (a deed done, a thing's quality or quantity, an event, a person's presence or absence), about time, or about value under Control, a verifier MUST report who stated it: the one who performed, the one who received, a named witness, the controller, or the place.
- 7.2 A time written inside an act is reported as its signer's claim. Only a place gives a position.
- 7.3 A verifier MUST NOT report value as moved on the strength of an Agreements act alone. An act can instruct Control; whether Control obeyed is the controller's or the receiver's signed word.

**Lie exposed.** A claim laundered into a fact: "it was delivered" when only the deliverer said so; a backdated act; "you were paid" when only the payer says so. Signed text proves that the signer said it, and nothing more; this rule stops a verifier's answer from saying more than that.

**Protects.** The receiver, who did not choose to be declared paid or served, and every reader who would otherwise take a verifier's summary as fact.

**Reasoning.** The research's largest residue is truth: whenever an agreement touches the world, "someone must say what happened, and their signature proves only that they said it". And "the record cannot hold value": every entry about value is a claim or an instruction, neither is the value. Rule 7 does not rank sources; whether a receiver's acknowledgment (#20) or three witnesses suffice is a rule (task K4) chosen in the Terms.

### Rule 8. Unchecked is not passed

**Plain words.** If a verifier lacks something it needs to check (a cMIP it does not have, a place it cannot reach), it says "unchecked". It never says "fine" or "broken" instead.

**Precisely.**
- 8.1 Where a verifier cannot apply a rule it needs, because it lacks a cMIP named by fingerprint, lacks an act named by fingerprint, or cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it.

**Lie exposed.** "My software says it checks out", from software that could not check. Signed text cannot expose what a verifier silently skipped.

**Protects.** Anyone relying on someone else's verification, and the parties of an agreement whose cMIP has become rare.

**Reasoning.** Because every agreement can name any cMIP, verifiers will always meet ones they do not have. Without rule 8, the convenient path is to treat the unknown as passing. With it, an agreement written today stays honestly readable when its cMIPs are old.

---

## 5. Tasks handed to cMIPs

Each task asks one question. A cMIP filling a task accepts what the task says and produces what the task says; anyone may write one, and a cMIP may fill a task for one kind of object only (one cMIP for land, another for shares). Where a task belongs to another layer's operation, it is named and not defined.

| # | Task | Question | Accepts | Produces | Trust |
|---|---|---|---|---|---|
| K1 | Body | What do these words say? | the `body` bytes | a reading for people, and any parts for machines that rules read | none: format only |
| K2 | Identity | Who is behind this signer? | a signer, an agreement | signed statements by those who vouch for the signer | witness (Sign layer) |
| K3 | Assurance | What was done to make it likely that a party was able, free and understood? | Terms, a party | signed statements of what was done (cooling-off, separate advice, witnessing) | witness; never a pass |
| K4 | Rule | What does this rule produce from these acts? | a rule's parameters, the acts held, the place's answers | yes, no, a list of who, or amounts; the same output for the same inputs, every time, for anyone | none: anyone can recompute |
| K5 | Witness | What happened in the world? | the question as the Terms state it, the named witnesses | each witness's signed statement | witness |
| K6 | Place | Is this act in the place, at what position, and is anything later? | the place's identifier, an act or an agreement | a signed answer by the place | place (Order layer) |
| K7 | Tally | What did a vote decide, without showing who voted how? | the ballots, the list of who may vote | the result, with whatever proof the method allows | teller |
| K8 | Control | Has the controller carried out this instruction? | an instruction, with the acts and rule result behind it | the controller's signed evidence | hand (Control layer) |
| K9 | Delivery | Did this act reach this person? | an act, a recipient | the recipient's signed acknowledgment, or the Deliver layer's evidence | recipient or Deliver layer |
| K10 | Judge | What did the named judge decide? | the Terms (including `authors`), the acts of the dispute | the judge's signed decision, which binds only through a power under rule 4 | judge |
| K11 | Kind | What does a Statement of this kind state, and which rules read it? | a `kind` fingerprint | the meaning of `content`, and how K4 rules may read it | none: definition only |

**Why these, and why so few.** The research found that the same few operations answer the 49 questions, and that a "silent sixth operation", applying a stated rule to known inputs, needs no trust because anyone can redo it. So the tasks sort by whom they make you trust: nobody (K1, K4, K11), a witness of the world (K2, K3, K5), a place (K6), a teller (K7), a hand (K8), a recipient (K9), a judge (K10). Each task is one question; many cMIPs may fill each one, pointed at different objects, and "more tasks means less defining for each one" holds inside each row: a cMIP for share registers and a cMIP for votes both fill K4 without either defining the other.

**Design direction for cMIP authors, from the research.** Turn witness questions into K4 wherever the term can be computed from the record instead of observed in the world. Turn a hand into Control by posting value in advance (#45 Enforce becomes #26 Divide). Name several witnesses so that none can lie alone, and combine them with a K4 rule. This is direction, not a rule: no verifier can check it.

### How the 49 tasks land

| # | Task | Where it lands |
|---|---|---|
| 1 | Fix | Terms `body`; rule 1 |
| 2 | Identify | K2 |
| 3 | Able | K3; cost |
| 4 | Align | rule 2; K1; K10 decides late |
| 5 | Free | K3; cost |
| 6 | Commit | assent; by act: K4 rule in `in_force` with K5 or K9 |
| 7 | Exchange | Deliver (K9); rule 3 |
| 8 | Order | Order layer; rule 6 |
| 9 | Keep | property (durable) |
| 10 | Check | property (verifiable) |
| 11 | Title | K4 over acts per place; rule 6 |
| 12 | Sum | K4; rule 6 |
| 13 | Transfer | Statement of a K11 kind under a power; rule 6; K8 if value moves |
| 14 | Admit | power; rule 4 |
| 15 | Bind | newcomer's assent; rule 4 |
| 16 | Due | date: K4 over positions; event: K5 |
| 17 | Perform | K9 (receiver), K8 (controller) or K5; rule 7 |
| 18 | Inspect | K5; rule 7 |
| 19 | Measure | K5; rule 7 |
| 20 | Acknowledge | Statement with `answers`; K9 |
| 21 | Record | Statements; rule 5 |
| 22 | Show | Deliver (K9) |
| 23 | Hold | K8 |
| 24 | Secure | guarantor: assent; pledge: K8 |
| 25 | Separate | K8; rule 7; cost |
| 26 | Divide | K4 computes, K8 pays |
| 27 | Authorise | grant as Terms; rule 4 |
| 28 | Scope | the power's K4 rule |
| 29 | Name | `for` and `under`; rule 4 |
| 30 | Decide | the power's K4 rule |
| 31 | Count | open: K4; secret: K7 |
| 32 | Notify | K9; by publication: rule 6 |
| 33 | Current | rule 6 |
| 34 | Whole | rules 1 and 6 |
| 35 | Alive | presence: a fresh act, by K9 challenge; absence: K5 or K4 waiting rule |
| 36 | Wait | K4 over place positions |
| 37 | Succeed | power named in advance; rule 4 |
| 38 | Recover | K8, designed in advance; cost |
| 39 | Conceal | cost |
| 40 | Reveal | Deliver the Terms; check against fingerprint (rule 1) |
| 41 | Raise | Statement of a K11 kind, delivered (K9) |
| 42 | Hear | K9 plus K4 waiting rule |
| 43 | Judge | K10; power; rule 4 |
| 44 | Final | the power's K4 rule |
| 45 | Enforce | from posted value: K8; otherwise cost |
| 46 | Complete | Statement of a K11 kind |
| 47 | Amend | replacing Terms; rule 4 |
| 48 | End | Statement of a K11 kind under a power; rule 4; then K4 and K8 |
| 49 | Leave | Transfer of a part, or End then Divide |

---

## 6. Open parameters

These are values the rules depend on and this draft does not fix.

- **P1. Default for `in_force`.** Rule 3.1 sets it to "every party named as a signer". Whether a different default is wanted is open.
- **P2. Depth of powers through powers.** Rule 4 lets Terms named in `under` themselves be bound through other Terms (an agent of an agent; a group within a group). Whether a verifier must follow any depth, or a limit applies, is open.
- **P3. Ending a grant.** Under rule 4, a grant of authority ends as its own powers say; with no power named, only by every party's assent, which lets an agent block their own dismissal. Whether a principal must always be able to end a grant alone is a decision for Nobody, allegedly; it is not taken here.
- **P4. One place or several.** Rule 6 names one place. Whether Terms may name several places with a K4 rule over their answers (plural witnesses of order) is open.
- **P5. What a verifier holds.** Rules 5 and 8 depend on which acts the verifier holds. Whether a verifier answers from a set it is given, or must also ask the place for more, is open.

---

## 7. Stated costs

Cases that do not fit the grammar. None is closed by a rule.

- **Minds.** Whether a party was able (#3) or free (#5) cannot be shown by any act. K3 can make it more likely and record what was done; nothing assigns its failure. Only Align is assigned (rule 2).
- **Conceal (#39).** Terms can be kept private and their fingerprint lodged in a place; nothing can show the words were not told to someone, and telling cannot be undone.
- **Enforce beyond what was posted (#45).** Words can order a release; something must obey. Against value not under Control, force lies outside the protocol. A proven liar (rule 5) loses only what they posted and their standing with those who see the proof. Against a stranger who vanishes, the proof is worth nothing.
- **Deeds lean on witnesses.** The more an agreement is about services and acts in the world instead of value under Control, the more it rests on K5, whose statements prove only that the witness said them.
- **Without a place, no scarcity and no freshness.** The same thing can be given twice in two branches, the latest act can be withheld, silence cannot be counted. Rule 6.3 makes this visible; it does not cure it.
- **Ownership is as wide as its place.** Two parties who accept different places cannot settle who holds a thing between them.
- **Closed world hurts the one who did not lodge.** Under rule 6.2, a party's own act that never reached the place does not count, even if it is genuine.
- **Honest forks.** A signer who loses track of their last act (a lost device, a restored backup) and signs again produces a fork that looks exactly like a lie. Honest drift and lying look the same from outside.
- **Withdrawing before in force.** Between a first assent and the last, the first signer holds an open option against themselves. Withdrawal is a race that only a place, or an `in_force` rule with a deadline read from a place, settles.
- **Revoking an open offer.** The same race, between the offeror's withdrawal and a stranger's acceptance.
- **Secret votes need a teller.** K7 requires trusting whoever counts.
- **Identity ends in acquaintance.** Who vouches for the voucher (K2) ends in someone knowing someone; the grammar cannot express that.
- **The record holds no value.** Every act about value is a claim or an instruction. The gap between "the record says 100" and "there are 60" must be checked continuously (K5, K8), not once.
- **No default way out.** By rule 4, an agreement that names no power to change or end itself changes only by everyone's assent again. If a party is gone and no successor was named in advance (#37, #38), it is stuck. The way out is designed in advance or not at all; this draft chooses that over any default that would let someone be bound without their signature.
- **Ordering and chaining show patterns.** Rules 5 and 6 make the shape of an agreement (who acted, how often, in what order) visible to whoever sees the acts or the place, even when the words are concealed.

---

## 8. What I needed and did not have

- The core's act format: whether it already gives fingerprints, a per-signer chain (which would make rule 5 redundant), acts signed by several people at once, and field names.
- What the Order layer's place can answer: in particular whether it can sign "nothing later than this", and how a place is identified without a server address.
- What the Sign layer does when a key is replaced or lost, since that decides whether rule 5 sees a fork.
- How cMIPs are identified in practice, so that "named by fingerprint" in rule 1 can be met.
- Nobody, allegedly's decision on P3 (whether a principal can always end a grant alone).
- The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an evidence-only record to be enough. Rule 5 depends on the answer for its force.
- Whether the verifier's answers (shown, not shown, fork, unchecked) are already named in another layer, so that the words match.

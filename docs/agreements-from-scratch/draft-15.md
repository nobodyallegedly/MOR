# Agreements, from scratch: draft 15

13 November 2026. Written by Claude. A draft for Nobody, allegedly, to read; not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

**What this file is.** The rules alone: what a verifier applies and what a cMIP author needs. Its purpose in a paragraph, its definitions, the data each act carries, the grammar rules (each precisely, with the lie it exposes and whom it protects in one line), the tasks, the open parameters, the stated costs, and what is open. Three files stand beside it:

- `reasons-15.md`: each grammar rule in plain words, and why it is there, keyed by the rule's number. Read it first if you are new to this.
- `history.md`: how the text came to be, draft by draft; Part H is draft 15, with every word that was renamed.
- `companion-3.md`: how the research is used.

**How to read it.** G1 to G14 are the grammar rules of section 4; G4.8 is clause 8 of G4. They are always called "grammar rules". The word **rule** alone means something else: a rule people choose for their own agreement (a cMIP answering task K4). K1 to K13 are the tasks (section 5). P1 to P21 are the open parameters (section 6); some numbers are missing because earlier drafts answered them. A number with a hash, such as (#23 Hold), is one of the 49 tasks of the research (`docs/strangers-2026-11/agreement-tasks.md`). MUST and MAY are used as in RFC 2119; no SHOULD appears.

**The test of this text**, in the words of Nobody, allegedly: "What the previous version of agreement focused on solving issues… this one supports and specifies the language for creating solutions". So this text gives the language. Where something people need can be said in it, saying it is a cMIP's, and this text says so and stops (section 5.2). Only where something needed cannot be said in the language is the gap this text's.

**One block used here is not this text's.** The report belongs to the language all of MOR shares. It is proposed by the MOR lead in `docs/lead/proposals/report-block-2.md` (branch `claude/lead-records-2`): a proposal, not a decision, and not yet written into any spec. This text uses it (G11, task K8), does not define it, and lists in section 8.1 what it needs from it, including two things the block would have to say for G11.7 to be read as written.

---

## 1. Purpose

Agreements is a grammar: the acts in which agreeing is written (Terms and Statement); the grammar rules by which a verifier decides, from acts alone, **who is bound by which Terms, and what is shown, unknown or contradicted**; and the tasks that cMIPs fill so that people can agree on anything, by rules they choose. Its central idea is that an agreement can be a party to another agreement (G1): works, services, deals, delegations and collectives are built with it, and none is a separate thing in the grammar. Agreements does not decide what anyone must agree, and it does not decide whether anything happened in the world: it records who said so. It does not define how words are fixed, how signatures work, how acts travel, how a shared order is kept, or how value is held; it names those operations (State, Sign, Deliver, Order, Control) where it needs them. Every grammar rule here answers two questions: which lie does it expose that signed, ordered text cannot already expose, and whom does it protect who did not choose it.

**One constraint on everything below.** Every grammar rule is checked from copies of acts alone, plus the answers of a named place where G7 applies. No grammar rule needs a particular server, keeper, platform or software author to remain. What an act fixes must still be there and unaltered when needed (#9 Keep), and an outsider holding copies must be able to test it (#10 Check): Agreements relies on both and adds no grammar rule for them.

---

## 2. Definitions

Each word here means one thing throughout this text.

- **Act**: a signed statement in the core's sense. Published or signed again, never updated. The fields the core gives every act (who signed, the signature, the act's own fingerprint) are not repeated here.
- **Fingerprint**: the identifier the core gives to fixed bytes. "Named by fingerprint" means referred to by that identifier and nothing else.
- **Grammar rule**: one of the fourteen of section 4, written G1 to G14, with clauses written G4.8. It says how acts are read. It never says what people must agree. Always called a grammar rule; the word "rule" alone is never used for one.
- **Task**: one question the grammar asks and does not answer itself. A task says what an answer to it accepts, what it produces, and whom it makes you trust. The thirteen tasks are K1 to K13 (section 5). The grammar rules may require that some task be answered; they never answer it.
- **cMIP**: a document, named by fingerprint, that answers one task, for some kind of thing or situation. Anyone may write one. Many cMIPs may answer the same task in different ways (one for land, another for shares). Choosing a cMIP is how people choose their own rules.
- **The research's 49 tasks** (#1 to #49): the questions an agreement may have to answer, from `agreement-tasks.md`. They are a checklist of what can go wrong, not this text's tasks. Where each one lands in this text is recorded in `companion-3.md`.
- **Terms**: an act that states what is agreed. Always capitalised and singular ("a Terms act", "these Terms"). Stating Terms is not agreeing to them.
- **Statement**: any other act made within an agreement. Its **kind** says what it is (see task K11). Two kinds are defined here: **assent** and **counter signature**.
- **Assent**: a Statement by which its signer agrees to one Terms act.
- **Counter signature**: a Statement by which its signer cancels its own earlier assent to one Terms act. It is available only until every party has signed (G4.10).
- **Agreement**: the first Terms act together with every Terms act that replaces it, directly or through others, and every Statement made within them. Its identifier is the fingerprint of the first Terms act (the **root**).
- **Signature of an agreement**: an act made in an agreement's name, under a power its own Terms give (G1.2). An act signed so is signed by that agreement.
- **Version**: one Terms act of an agreement. The first is the root; each later one replaces the one before (G4.8). The **last version** is the one in force (G4.6; while a fork of Terms stands, the one both branches replace, G4.7).
- **Chain**: the versions of one agreement, each replacing the one before: one agreement's own history. The word is used here for nothing else: not for one signer's acts (a line), and not for anything that links one agreement to another.
- **Sequence**: agreements linked to one another, so that what one gives or owes reaches the next: a payment passing from a work to the works it stands on (G11.1). Never called a chain. The word is used for nothing else.
- **Succession**: the agreements for one baked work by which the baker's rights pass from holder to holder, starting with the baker, each naming the one before it (G14.2). It runs forward in time, and is not a sequence.
- **Leg**: one obligation carried out, between two sides: whoever carries it out, and whoever receives it (G11.1). A payment to a work is a leg between the payer and the work's receiver. A payout divided among five is five legs, each between whoever pays out and one of the five. A leg is never an agreement: an agreement of a sequence is called that.
- **Doer**, **receiving side**: the two sides of a leg. The doer carries out the obligation. The receiving side receives it; where what is owed is owed to an agreement, the receiving side is that agreement's receiver for the act (G1.4). These grammar rules define the two sides and nothing more: which lines of a report each side receives is the task's cMIP's (G11.3).
- **Report**, **call**: words of MOR's shared language, used here and not defined (section 8.1). In short: a task may carry a **call** for a report, or not; the call says whether a report is wanted and from whom; only the signers of the act that holds the task can make it. A call names no place and no reader: the where is implied by the leg. A **report** is a signed act that answers a call: it carries the call it answers, the acts it relied on, and its signer. Anything more is the task's to say. A report goes to the other side of its own leg, where that side receives, and no further, in every layer (G11.6). A report is data: any other path for it is one people agreed to, with their signature (G11.6(a)).
- **Leg report**: a report that answers a call carried by Terms that hold the Control task (K8), about the legs carried out under those Terms (G11.3). What it carries beyond what every report carries is in K8's row (section 5).
- **Buyer**: whoever pays an agreement for what it offers. Elsewhere in this text, where only the paying matters, the same person is called the payer. Paying is a leg, with the buyer as its doer (G11.7).
- **Contest**: a Statement by which a buyer says that what they bought was not delivered after payment. Its kind is a cMIP's (task K11); these grammar rules say only whom it reaches (G11.8).
- **Payment**: an act of the layer that holds value, signed by the payer, which names the version it read (G13.2). It holds the task of paying, and by default carries the payer's call for the receiving side's confirmation (G11.7). This text gives it no fields.
- **Never ended**: an agreement never ends. It only gets a new version, under the Terms' own rule (G4.8, G4.9), and goes on as its last version. This text has no defined term for ending.
- **Party**: one named in Terms. Named in one of three ways:
  - as a **signer**: a person, by the key the Sign layer gives them;
  - as a **role**: a spot for someone not yet known, linked to a signer later (G10);
  - as an **agreement**: another agreement, by its root (G1).

  Signers, and signers who fill a role, are the parties who may be bound. An agreement named as a party need not sign to be named, and where it has not signed it is not bound. Where it signs, it signs by its own signature, as its own Terms require: one level (G1.2). That signature binds its parties as its own Terms say.
- **Work**: an agreement whose Terms say who owns something and in what shares. A plain word for a use of the grammar, not a separate thing in it: every grammar rule reads a work as it reads any agreement.
- **Shares**: what an agreement's Terms say each party's part is. The grammar gives them no form: they are read by the rule (task K4) the Terms name for dividing. An agreement with shares defines as much or as little of how it governs itself as it chooses (powers, G5); the grammar has no separate notion of a collective.
- **Service**, **deal**: a service is a signer who does a job for an agreement (dividing what it is paid, holding a payment); a hand, in the research's sense (task K8). Its deal is an agreement between the service and the agreement it serves, named as a party. A deal is signed on both sides: by the service, and by the agreement it serves, as that agreement's own Terms require (G1.2). Plain words for a use of the grammar, as "work" is: what makes an agreement a deal, and what is read from it, are the service's cMIP's (section 5).
- **Spot**: a role's place among the parties, before and after it is filled. It has a **kind**: **done**, **received**, **holding**, **fits** or **future** (G10). Whether it still takes new identities is said by its cMIP, from the version in force (G10.5).
- **Fill**: a spot is filled when the cMIP its role names (task K12) says that a signer is linked to it by a proof: the acts that earn it. Each filling is tied to the proof that earned it. A spot may be filled many times; whether it holds one filling or many is its cMIP's (G10.2).
- **Rights**: what a version offers whoever earns a filling under it, with every condition that version puts on it. The grammar does not say what they are, or read them (G10.6).
- **Receiver**: whoever Terms name, in the field `receiver`, as receiving on the agreement's behalf: an identity (one of the agreement's own parties) or another agreement, by its root (G1.3). The word means that field's value and nothing else; the side of a leg that receives is the receiving side.
- **Receiver for an act**: the receiver named by the version of an agreement which that act names, followed through any agreement it names until one of an agreement's own parties is reached (G1.4). Earlier drafts called it the "receiver now".
- **Author**: a party whose words the Terms are.
- **Power**: an entry in Terms saying that a Statement of a given kind (or a replacing Terms act, or a join) binds the parties when a given rule says yes.
- **Delegation**: Terms in which one party, the **delegator**, gives another, the **agent**, a power to make acts for it. The delegator may be an identity or an agreement (G5.5).
- **Rule**: a cMIP answering task K4, named by fingerprint, with its parameters. It is the people's own rule. The word alone always means this, and never a grammar rule. It computes; it trusts nobody.
- **Settlement**: the signed evidence, from the layer that holds value (Control; the Money layer), that a payment was made. Agreements names it and does not define it. The Statement field `settlement` is the socket where it plugs in (G8.5).
- **Line**: acts of which each names the one before it: one signer's acts within an agreement, by `previous` (G6); an agreement's Terms, by `replaces` (G4), which is its chain; and any other acts the grammar reads that way (G12.1).
- **Fork**: two acts that each count as the next act after the same act of one line (G12.1). The act both follow is the **shared act**; each of the two, with what follows it in the line, is a **branch**.
- **Join**: an act that ends a fork by naming every branch and saying which continues, or by merging them (G12.3).
- **Dropped**: a branch is dropped when a join ends its fork and it is not the branch that continues (G12.3).
- **Bound**: a person is bound by an act when G5 says so.
- **In force**: Terms are in force when G4 says so. The words are said of Terms only.
- **Apply**, **no longer applies**: a filling, and the rights it holds, apply from when the filling is earned, and **no longer apply** when the condition its own version names says so (G10.7). Earlier drafts said "in force" of a filling too.
- **Condition**: what a version states, in signed words and in advance, as changing what applies under it. These grammar rules read one directly: the rule (task K4) a version names, by fingerprint, in `condition`. That rule itself says what it stops: the rights the version offers, the offer to new identities, or both (G10.7). Every other condition is read where its version's cMIP puts it (G5.5, G10.6).
- **Place**: an ordered place to look, provided by the Order layer, which can say of an act whether it is there and at what position, and whether anything is later.
- **Name** (or **cite**): an act names another act, or a version, when it carries its fingerprint in one of its fields. What an act names is what it is read against (G13).
- **Anchoring**: whatever a reader accepts as saying that nothing is later than an act, or what time it was. A place is an anchoring, and so is a clock. The place and the clock an agreement's Terms name are the ones every reader uses for that agreement (G7.4); a reader accepts an anchoring of its own choosing only where the agreement names none (G13.4).
- **Clock**: what an agreement's Terms name, in the field `clock`, as saying what time it was for that agreement. Named here, not defined (section 8.1).
- **Bake**, **envelope**, **baker**: a finished work is baked when its bytes are sealed in an envelope, which says who baked it: the baker. The core's words, named here and not defined (section 8.1). An envelope is named by its fingerprint (G14).
- **Verifier**: whoever applies these grammar rules to a set of acts. A verifier answers questions; it does not decide disputes.
- **Answers**: a verifier's answer is one of:
  - **shown**: the acts held establish it under these grammar rules;
  - **not shown**: the acts held do not establish it; an act not held might;
  - **fork**: two acts are a fork (G12): two acts by one signer name the same previous act (G6.2), or two Terms acts each replace the same Terms (G4.7, G4.8);
  - **no longer applies**: a filling counted, and still is one, but the rights it holds no longer apply, by its own condition: the one its own version names (G10.7). Always given with that condition named beside it. It is not the answer for an act that never counted: that is **invalid** or **not shown**.
  - **invalid**: an act cannot count as what it claims to be, and the act itself shows it: no act the verifier does not hold could make it count (Terms for a baked work that name neither the baker among their parties nor a succession, G14.3). The word is meant to mean here what it means in the other layers (P19).

  **The line between invalid and not shown.** If an act the verifier does not hold could change the answer, the answer is **not shown**, never **invalid**. So a replacement that lacks a signature is **not shown** as a replacement (G4.8): the missing assent may exist.
  - **unchecked**: the verifier could not apply a rule it needed (G9).

  Answers about what is latest, what else exists, or what time it was, carry a qualifier: **per anchoring**, with the anchoring named (G13.4), written **per place** where the anchoring is the place the Terms name and **per clock** where it is the clock they name; or **as shown** (meaning: among the acts this verifier happens to hold). An answer that rests on what someone relied on in a dropped branch also carries the qualifier **disputed** (G12.5).

  Of reports, a verifier also shows what the shared language's block asks it to show, in that block's words, which are not answers of this text: for an act that two reports name, **matched**, **mismatched** or **one side only**; for a call with no report, **unanswered**; for a task with no call, **no report called for** (G11.4).

---

## 3. The data each act carries

Each field is listed with the grammar rule that reads it. A field no grammar rule reads is not here. An act missing a field marked required is not an Agreements act.

### 3.1 Terms

| Field | Required | What it holds | Read by |
|---|---|---|---|
| `replaces` | in every Terms act except the first | fingerprint of the Terms act this one replaces | G4, G5, G12 |
| `agreement` | exactly when `replaces` is present | fingerprint of the root | G5, G6 |
| `parties` | yes, except in a join that names `continues` | each party: a signer; or a role (its kind, its `what`, and the cMIP answering K12); or an agreement (its root) | G1, G4, G5, G10 |
| `authors` | yes, except in a join that names `continues` | one or more of the parties named as signers or roles | G3, G10 |
| `body` | yes, except in a join that names `continues` | fingerprint of the words, and fingerprint of the cMIP (task K1) that says how to read them | G2 |
| `relies_on` | if anything else is used | fingerprints of every other piece the Terms use, and of every version or act they relied on | G2, G13, G14 |
| `in_force` | no | a rule (task K4) saying which assents put the Terms in force; absent means the default of G4 | G4 |
| `powers` | no | list of (kind, rule) | G5, G12 |
| `place` | no | the place to look, by the identifier the Order layer gives it | G7 |
| `clock` | no | what says what time it was for this agreement, by the identifier its layer gives it | G7, G13 |
| `receiver` | no | one of the parties, named as a signer or a role; or the root of another agreement | G1 |
| `envelope` | no | fingerprint of the envelope of the baked work these Terms are for | G14 |
| `condition` | no | a rule (task K4), by fingerprint, with its parameters: the condition, signed in advance, under which what applied under this version no longer applies | G10 |
| `calls` | no | calls for reports, as the report block of the shared language gives them (section 8.1): each says the task it is attached to and from whom a report is expected. A call names no place and no reader (G11.6). These grammar rules read only a call attached to the Control task (K8) | G11 |
| `joins` | only in a join | fingerprints of the first act of every branch of a fork | G12 |
| `continues` | no; only in a join | one of the fingerprints in `joins`: the branch that continues; absent, the join itself merges the branches | G12 |
| `previous` | yes | the signer's previous act in this agreement, or none | G6, G12 |

### 3.2 Statement

| Field | Required | What it holds | Read by |
|---|---|---|---|
| `agreement` | yes | fingerprint of the root | G6 |
| `terms` | yes | fingerprint of the Terms act it is made within | G4, G5 |
| `kind` | yes | `assent`, `counter_signature`, or the fingerprint of a cMIP answering task K11 | G4, G5, task K11 |
| `content` | as the kind requires | what is stated, by fingerprint or inline as the kind says | task K11 |
| `for` | together with `under` | the person, or the agreement (by its root), in whose name the act is made | G1, G5 |
| `under` | together with `for` | fingerprint of the Terms that give the power to act for that person or agreement; for an agreement, Terms of its own | G1, G5 |
| `previous` | yes | the signer's previous act in this agreement, or none | G6 |
| `answers` | no | fingerprints of acts this one replies to | tasks K9, K10 |
| `relies_on` | if anything else was relied on | fingerprints of every version or act, of this agreement or another, that this act relied on and names in no other field | G13 |
| `settlement` | no | fingerprint of a settlement this act is tied to | G8, G11, task K4 |
| `joins` | only in a join | fingerprints of the first act of every branch of a fork | G12 |
| `continues` | no; only in a join | one of the fingerprints in `joins`: the branch that continues; absent, the join itself merges the branches | G12 |

An assent's `content` is empty: its `terms` field is what it agrees to. A counter signature's `content` is empty too: its `terms` field names the Terms whose assent it cancels (G4.10).

A join (G12.3) of a fork of Terms is a Terms act; a join of a fork in one signer's line is an act of that signer, Terms or Statement. `joins` is what makes an act a join.

A report (G11) is an act of the shared language, and this text gives it no fields of its own. What a leg report carries is in K8's row (section 5). How a report is written as an act, and whether it is a Statement of this text, is the block's to say (section 8.1). A payment (G11.7) is an act of the layer that holds value, and this text gives it no fields either.

---

## 4. Grammar rules

Each grammar rule is given precisely, with the lie it exposes and whom it protects in one line. Its plain words and its reasoning are in `reasons-15.md`, under the same number. MUST and MAY are used as in RFC 2119.

These grammar rules say how acts are read. None of them says what people must agree.

### G1. An agreement as a party

- G1.1 Terms MAY name a party as an agreement, by its root fingerprint.
- G1.2 **Named, and signing.** Naming an agreement as a party asks nothing of it: it need not sign to be named, it is not counted by the default of G4.1 (G4.4), and where it has not signed it is not bound by any act of these Terms, and neither are its parties. A party named as an agreement MAY sign: an assent to these Terms, where their `in_force` rule asks for it (G4.4). Its signing covers what those Terms carry, a call among them (G11.2). It signs as its own Terms require: every one of its signers, or what its own rule accepts (a vote, a named delegate). **An agreement's signature.** An act is signed by an agreement x when its `for` names x, by its root; its `under` names Terms of x that are in force (G4.6) and give a power for acts of that kind; and that power's rule, applied to the acts held, says yes. Whoever signs such an act (a named delegate, or whoever the rule of a vote accepts) signs on behalf of x's parties, under the power x gave. That act is x's signature. It binds every party bound by x's Terms, as x's Terms say (G5.1(b)), and no one else. It is an act within the agreement it is made in, and stands there in its signer's own line (G6.1). Where x's Terms give no such power, x signs by every one of its signers; by which acts is not said (P17). **One level.** Its signers are the parties its own Terms name as signers. A party it names as an agreement is not one of them, and neither are that agreement's people: these grammar rules MUST NOT be read as making an agreement's signing need the signature of anyone inside an agreement it names, unless its own Terms say so. A verifier reads what they require from that agreement's Terms in force (G4.6); where it lacks them, the answer is **unchecked** (G9).
- G1.3 Terms MAY name a `receiver`: one of their own parties, named as a signer or as a role; or another agreement, by its root fingerprint.
- G1.4 **Receiver for an act.** Whatever a payer, an act or a rule of one agreement gives or owes to an agreement, it gives or owes to that agreement's **receiver for the act**: the `receiver` named by the version of that agreement which the act that gives or owes names (G13.1). Where that act names no version, a verifier MUST take the receiver from that agreement's Terms in force, per that agreement's own place, qualified **per place** with that place named, or, where it names none, per the anchoring the reader accepts, or **as shown** (G4.6, G7, G13.4). Which Terms of that agreement are in force is answered by G4.5 to G4.8: while a fork of its Terms stands, the receiver is the one named by the Terms both branches replace, and the verifier MUST show the fork with that answer and MUST NOT choose a branch (G4.7). Where the receiver so named is one of that agreement's own parties, the answer is that party. Where it is another agreement (G1.3), the two are agreements of a sequence (G11.1), and a verifier reads that agreement's receiver in the same way, and so on, until one of an agreement's own parties is reached. That party is who receives: the receiving side of one leg (G11.1). These grammar rules follow a receiver no further. What that party then passes on is another leg, carried out under its own agreement's Terms and the cMIPs they name, and is read only as G11 says. If a version read names no receiver, or the spot named is not filled, or an agreement is met a second time on the way, no one receives, and the answer is **not shown**. If the verifier lacks that agreement's acts, it is **unchecked** (G9).
- G1.5 A rule (task K4) MAY take as an input a receiver for an act, so answered, or what a leg report states (G11.3).

**Lie exposed.** "I receive for that work", said by someone who does not, by that work's own Terms; and "the work agreed", said of a signing its own Terms gave no one the power to make.

**Protects.** The parties of an agreement that is pointed at, who are not bound by what they did not sign; the parties of one that signs, who are bound only as their own Terms say; and the payer, who needs to know only the work.

### G2. Whole

- G2.1 The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.
- G2.2 Anything a Terms act refers to in another way is not part of those Terms. A verifier MUST NOT read it as part of them.

**Lie exposed.** "The document we referred to said something else", and "there was a side piece".

**Protects.** Every reader who arrives later, and the party who signed without fetching what was referred to.

### G3. Author

- G3.1 `authors` MUST name one or more of the parties named as signers or roles.
- G3.2 The authors are the parties who bear the failure of the words to mean one thing (#4 Align). A cMIP answering task K10 (Judge) MUST accept `authors` as an input.

**Lie exposed.** "We wrote this together", or "I meant something else by that word", said by the one who wrote it.

**Protects.** The party who accepted words they did not write.

### G4. In force

- G4.1 Terms are in force when the assents their `in_force` rule requires are present. If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer.
- G4.2 Terms that name a party by role MUST carry `in_force`.
- G4.3 An assent binds its signer only while the Terms it names are in force.
- G4.4 A party named as an agreement is not counted by the default of G4.1. An `in_force` rule MAY ask for its signing; it has then signed when what its own Terms require is present (G1.2).
- G4.5 Terms stop being in force when Terms that replace them (G5.2, G4.8) are in force. While a fork of them stands (G4.7), no Terms that replace them are in force.
- G4.6 Which Terms of an agreement are in force is an answer about what is latest. A verifier MUST take it per the agreement's place, qualified **per place** (G7.2); or, where no place is named, per the anchoring the reader accepts, with it named, or else **as shown** (G7.3, G13.4). It MUST NOT give it as latest without saying what the answer stands on.
- G4.7 Where two Terms acts each replace the same Terms (G4.8), and each has the assents its own `in_force` requires (G4.1), they are a fork (G12); a join is not one of them (G12.3). A verifier MUST answer **fork** for which Terms replace them, show both branches, and MUST NOT choose between them, by position or in any other way. Until the fork ends (G12.3), the Terms both branches replace stay in force, and a verifier MUST answer from them every answer that rests on the Terms in force: among others, a receiver for an act (G1.4), who fills a spot (G10.2), and what a rule the Terms name produces (G5, task K4). It MUST show the fork with each such answer, per place or as shown.
- G4.8 A Terms act replaces the Terms its `replaces` names only if it carries the signatures those Terms require for their replacement (G5.2): an assent to it in the name of every party bound by them, or what a power for replacement in them requires. A Terms act that does not carry them replaces nothing: the Terms it names stay in force, and it is not a branch of a fork. A verifier answers **not shown** for it as a replacement, per place or as shown: an assent it does not hold may exist (section 2, "The line between invalid and not shown"). For a delegation, whose signatures end it is said by G5.5.
- G4.9 Terms stop being in force only as G4.5 says: when a version replacing them is in force. No act ends Terms, or an agreement, without replacing them, and a verifier MUST NOT answer that Terms or an agreement have ended. An agreement only gets a new version: a verifier reads every replacing version alike (G4.8, G5.2), whatever its conditions say becomes of the work and its shares; what they say is theirs (G2, task K1). Every version replaced stays an act of the agreement, readable as it was (G2).
- G4.10 **Counter signature.** No assent binds anyone, and nothing in Terms counts, until those Terms are in force (G4.1, G4.3). A counter signature is a Statement of kind `counter_signature`, by the signer of an assent, whose `terms` names the Terms that assent names, and which follows that assent in the signer's own line (G6.1). It cancels that assent, and no one else's: an assent so cancelled is not counted by G4.1. A counter signature is available only until every party has signed, which these grammar rules read as: until those Terms are in force (G4.1). One made for Terms that are in force changes nothing: Terms in force change only as G4.5 and G4.9 say. Where a party is an agreement, "signed", for that party, is whatever that agreement's own Terms require: every one of its signers, or what its own rule accepts: one level (G1.2). A verifier reads that from that agreement's Terms in force (G4.6); where it lacks them, the answer is **unchecked** (G9). This is the reading of G1.2. A party named as an agreement is not counted by the default of G4.1 (G4.4), so the reading has effect here only where the Terms' own `in_force` rule asks for that party's signing. Whether such a party can itself make a counter signature, and by which act, is not said (P17). Whether the Terms were in force before the counter signature is an answer about what is latest: per place, or as shown (G4.6). A later assent by the same signer to the same Terms is counted as any assent is.

**Lie exposed.** "You signed, so you are bound", said by a party who never signed; "these are the Terms now", said of Terms replaced, of one branch of two, or of a replacement that lacks a signature; and "this agreement is over".

**Protects.** The first to sign; the party left out of a replacement; and everyone in the last version, which keeps binding until those it requires agree a new one.

### G5. Own signature

- G5.1 A person is bound by an act if, and only if:
  - (a) they signed it in their own name, or
  - (b) the act's `for` names them, or names an agreement by whose Terms they are bound (G1.2); its `under` names Terms by which they are bound and which are in force; those Terms give a power for acts of this kind; and that power's rule, applied to the acts held, says yes.
- G5.2 A replacing Terms act (one with `replaces`) binds a party only through G5.1: by that party's own assent to it, or by a power for replacement in the Terms it replaces. Its `replaces` is read as its `under`. The rule of a power for replacement is given the version in force and the proposed version, and answers allowed or not. Which parts of an agreement it lets through is that rule's cMIP's to say (task K4); these grammar rules read only its answer.
- G5.3 An act with no `for` and no `under` is made in its signer's own name only. It MUST NOT later be counted as made for anyone else.
- G5.4 Where whoever is bound through `for` is bound only through Terms that have been replaced, a verifier MUST answer from G7: per place if the Terms name one, otherwise as shown. (Whether Terms have been replaced is answered by G4.5 to G4.8; Terms are not ended otherwise, G4.9.)
- G5.5 **Delegation.** Terms in which one party, the **delegator**, gives another, the **agent**, a power to make acts for it are a delegation. The delegator may be named as a signer or as an agreement (G1.1): these grammar rules read the two as the same delegation. By default the delegator can end it at any time: a version of those Terms that removes or narrows the power replaces them (G4.8) when it carries the delegator's part alone, without the agent's. For a delegator named as a signer, that is its own assent. For a delegator named as an agreement, it is that agreement's signature (G1.2). The Terms of a delegation MAY state conditions on that ability (a notice, a term, a cause); such a version then replaces them only as those conditions say. A verifier reads them from those Terms, in the form their cMIP gives (G2, task K1); where it cannot, the answer is **unchecked** (G9). These grammar rules put no limit on what such a condition may say, and a verifier reads every one alike. Under a condition that leaves ending to the agent alone, a version carrying the delegator's part alone replaces nothing (G4.8). A verifier MUST NOT answer that such a delegation can never be ended: whether the agent will end it is **not shown**, and the verifier shows the condition as the Terms the delegator signed state it. These grammar rules give an agent no protection of their own: pay, notice, severance and the like are cMIPs the parties choose. Once a delegation has been so ended, G5.4 says how an act made under it is read.

**Lie exposed.** "She bound you", "the group decided", "I was still authorised", said without a power the person bound had signed for.

**Protects.** Whoever is bound through someone else (the delegator, the outvoted member, the absent party), and whoever relies on an agent.

### G6. Own line

- G6.1 Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first.
- G6.2 Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork. A verifier holding both MUST answer **fork** for that signer, and MUST NOT choose between the branches. The fork ends only as G12 says.

**Lie exposed.** One history shown to one person and another to another.

**Protects.** The stranger who is shown only one branch.

### G7. Place to look

- G7.1 Terms MAY name a `place`.
- G7.2 Where the Terms in force name a place, an act within the agreement counts for any answer about what is latest (including which Terms are in force, G4.6), what is whole, who holds what, whether a period has passed, or whether something was made public, only once the place shows it, and at the position the place gives it. A verifier MUST take those answers from the place, qualified **per place**.
- G7.3 Where no place is named, a verifier MUST qualify every such answer **as shown**, or **per anchoring** where the reader accepts one, with it named (G13.4). It MUST NOT give such an answer as latest or whole without saying what it stands on.
- G7.4 The place the Terms in force name is the one every reader uses for that agreement, whether a party to it or not: a verifier MUST NOT give an answer of G7.2 for that agreement per another anchoring. Terms MAY also name a `clock`. Where the Terms in force name one, what time it was, for that agreement, is answered per that clock by every reader, qualified **per clock** (G8.2, G13.4). What a clock is, and how it is identified, is for the layer that gives it (section 8.1).

**Lie exposed.** "There is nothing later", "there is no side piece", "nobody else holds it".

**Protects.** Everyone who arrives later and must rely on "nothing else exists".

### G8. Say who said it

- G8.1 For any answer about the world (a deed done, a thing's quality or quantity, an event, a person's presence or absence), about time, or about value under Control, a verifier MUST report who stated it: the one who performed, the one who received, a named witness, the controller, or the place.
- G8.2 A time written inside an act is reported as its signer's claim. Only a place gives a position. What time it was is answered per the clock the agreement names (G7.4); where it names none, only per an anchoring the reader accepts, with it named (G13.4).
- G8.3 A verifier MUST NOT report value as moved on the strength of an Agreements act alone. An act can instruct Control; whether Control obeyed is the controller's or the receiver's signed word.
- G8.4 Who fills a spot (G10) and what a leg received and passed on (G11) are answers about the world. A verifier MUST report them with whoever confirmed them.
- G8.5 **Settlement.** A Statement MAY name a `settlement` it is tied to: the evidence, from the layer that holds value, that a payment was made. This field is the socket where that layer's proof plugs into Agreements; what a settlement is, is that layer's to say. A settlement named is reported on the word of whoever gave it (G8.3). What is done with it (counting only what led to a settlement, dividing what one shows) is a rule's (task K4).

**Lie exposed.** A claim passed off as a fact: "it was delivered", "you were paid", on the word of the one who gains by it.

**Protects.** The receiving side, who did not choose to be declared paid or served, and every reader of a verifier's answer.

### G9. Unchecked is not passed

- G9.1 Where a verifier cannot apply a rule it needs, because it lacks a cMIP named by fingerprint, lacks an act named by fingerprint, lacks the acts of an agreement named as a party, or cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it.

**Lie exposed.** "My software says it checks out", from software that could not check.

**Protects.** Anyone relying on someone else's verification.

### G10. Spots

- G10.1 A role in `parties` MUST name:
  - its **kind**, one of: **done** (whoever proves they have done X), **received** (whoever proves they have received Y), **holding** (whoever proves they are holding Z), **fits** (whoever proves their identity fits the conditions in W), or **future**;
  - its `what`: the X, Y, Z or W, by fingerprint (G2), except for kind future (G10.4);
  - the cMIP answering task K12 that says who fills it, by fingerprint.
- G10.2 A spot is filled, by a signer, when its K12 cMIP, applied to the acts held and the place's answers, names that signer on the strength of a **proof**: the acts that earn the spot. A spot MAY be filled many times; each filling is tied to the proof that earned it. Whether a spot holds one filling or many is said by its K12 cMIP. A verifier MUST answer each filling with its proof, each act reported by who signed it (G8.4), qualified per place or as shown (G7). The role and its cMIP are read from the Terms in force; while a fork of Terms stands, from the Terms both branches replace (G4.7).
- G10.3 Each signer who fills a spot is a party in it from then on. They are bound only by their own assent (G5). Filling a spot does not bind any other party.
- G10.4 A role of kind **future** names no `what`: its K12 cMIP defines who the participant is as well as how they are confirmed. It is for participants none of the four kinds can describe in advance. No verifier can check that a future spot was used only for them; whether it was is the authors' word, carried by them (G3).
- G10.5 **New identities.** Whether a spot still takes new identities is said by its K12 cMIP, applied to the version in force (the role as that version states it, and what the rule in its `condition` says, G10.7), the acts held, and the answers of the place and the clock the agreement names (G7). These grammar rules define no act and no field for closing a spot or for opening it again: an offer stops taking new identities, or takes them again, by a new version (G4.8) or by a condition signed in advance, as that cMIP reads them. A verifier MUST give that answer with its cause, as the cMIP gives it, per place, per clock, per the anchoring named or as shown (G7, G13.4). Whatever that answer is, a filling already earned stays a filling, shown with its proof (G10.2), and keeps the rights of the version it was earned under (G10.6). Where the verifier lacks the cMIP, the answer is **unchecked** (G9).
- G10.6 **Rights.** A filling has exactly the rights offered by the version it was earned under, with every condition that version puts on them. The version a filling was earned under is the version its proof names (G13.1). What the rights and their conditions are is that version's (G2, task K1); these grammar rules do not read them. No later version changes the rights of a filling already earned unless it carries an assent to it signed by that filling's holder in their own name (G5.1(a)). A verifier MUST name, with each filling, the version whose offer it holds: the version it was earned under, or a later one only where it holds the holder's own assent to that later version.
- G10.7 **No longer applies, by its own condition.** A filling, and the rights it holds (G10.6), apply from when the filling is earned. Terms MAY name in `condition` a rule (task K4), by fingerprint (G2), with its parameters: one condition, signed in advance, under which what applied under that version no longer applies. The rule itself says what it stops: the rights that version offers, the offer to new identities, or both; these grammar rules do not say which, and a condition that stops one does not by that stop the other. Where the rule named by the version a filling was earned under (G10.6), applied to that filling, the acts held and the answers of the anchoring, says that its rights have stopped, a verifier MUST answer **no longer applies** for that filling, and MUST name the condition beside it, with what met it, as the rule gives it: an act, reported by who signed it (G8), or a time, per the clock the agreement names (G7.4), or, where it names none, per the anchoring named or as shown (G13.4). Such a filling stays a filling, shown with its proof (G10.2): what applied before no longer applies, and nothing is undone. Where the rule says that the offer has stopped, that is read by the spot's K12 cMIP (G10.5). These grammar rules define nothing more for it. Whether the holder of such a filling is still a party in the spot (G10.3), and whatever else follows, are as the version it was earned under states; a verifier reads them from that version (the rule it names in `condition`, and its Terms in the form their cMIP gives, G2) and MUST NOT answer beyond what it states. Nothing stops a later version: one made as G4.8 says MAY offer again, and MAY rest what it offers on values already in the chain, named by fingerprint (G2, G13.2), or on none. Who fills a spot under it is said by its own K12 cMIP (G10.2), and a filling under it has the rights that version offers (G10.6); the earlier filling is still answered **no longer applies**, under the version it was earned under. A verifier MUST NOT answer **no longer applies** under a rule the filling's own version does not name (G10.6). It MUST NOT give that answer for an act that never counted (Terms never in force, a replacement that replaces nothing, a claim that fills no spot): that is answered **invalid** where the act itself shows it cannot count, and otherwise **not shown** (section 2). Where the verifier lacks the rule, the answer is **unchecked** (G9).

**Lie exposed.** "I am the one who did it", confirmed by someone chosen afterwards; and "the terms have changed, so what you earned is gone".

**Protects.** Whoever earns a spot and was not there to sign, who keeps exactly what was offered when they earned it.

### G11. Legs of a sequence

- G11.1 **Sequence, and leg.** Where what one agreement gives or owes reaches another agreement (a party named as an agreement, G1.1; a receiver that is an agreement, G1.3), and so on from one to the next, those agreements are a **sequence**. A **leg** is one obligation carried out, between its two sides: the **doer**, who carries it out, and the **receiving side**, who receives it. A payment to an agreement is a leg between the payer and that agreement's receiver for the payment (G1.4). A payout divided among several is one leg for each of them: between whoever pays out (a service, or a party who receives for the others) and each one paid; where one paid is an agreement, that agreement's receiver for the act (G1.4). These grammar rules define the two sides of a leg, and nothing more of it. Each leg is carried out under the Terms that hold its task (G11.2), or, for a payment, under the payment itself (G11.7), and the cMIPs that read it are the ones those Terms name (G2). Nothing in one agreement's choice of cMIPs binds another agreement, and nothing is chosen for a sequence as a whole. The agreements of a sequence MAY name the same cMIPs; none is required to.
- G11.2 **The call.** Terms hold the Control task (K8) where they name a cMIP that answers it (G2); or where they name as `receiver` one of their own parties (G1.3) and give a part to any other party, so that this party holds for the others and passing on to them is its obligation under those Terms. Terms that hold the task MAY carry a call for it, in `calls`, as the report block of the shared language gives it (section 8.1): from whom a report is expected (the doer, the receiving side, or both). A call names no place and no reader (G11.6). For K8, the doer is whoever carried out the passing on (the controller: a service, or a party that receives for the others), and the receiving side of each leg is whoever something was passed on to; where that is an agreement, it is that agreement's receiver for the act (G1.4), and no other of its parties. The call is made by the signers of those Terms, and binds no one else. In a deal, those signers are the service and the agreement it serves, which signs by its own signature (G1.2): the call is that agreement's parties' as much as the service's, and each party that signature binds has signed the deal through its agreement. Whoever receives is the receiving side of its leg whether or not it signed the Terms that carry the call. Where it did not, itself or through an agreement's signature, these grammar rules do not make the path to it a signed one: closing that gap is a cMIP's (section 5.2). A call is attached to a task, in the Terms under which that task is carried out; none is attached to a receiving side. These grammar rules make no Terms carry a call, and make no one answer one. A call is part of signed Terms and is read as they are (G2, G4.6), by anyone, before any payment is made.
- G11.3 **Leg report.** A leg report is a report that answers such a call. As every report does, it carries the call it answers and the acts it relied on, each by fingerprint, and its signer. Among the acts it relied on are the version of the Terms it passed on by (G13.2) and each settlement it speaks of (G8.5). Beyond that, it carries what K8's row says (section 5). It is its signer's word (G8.4), and each signer reports its own half only. What K8's row asks of a leg report MUST be readable without any cMIP those Terms name: a verifier that lacks them still reads the leg reports, and reports what they state as stated by their signers. Whether what was passed on is what those Terms and cMIPs require is answered by those cMIPs, and is **unchecked** where the verifier lacks them (G9); that does not make the leg report itself unchecked. Where one doer carries out several legs under one call (a payout to several), which lines of its report each receiving side receives (all of them, or those of its own leg) is said by the cMIP that answers the task (K8). These grammar rules do not say it.
- G11.4 **Reading across legs.** A verifier asked about a result that depends on a sequence MUST read it leg by leg, from the reports it holds (G11.6), and give each leg's part with who signed it (G8.4).
  - (a) **Where to look.** The verifier reads, from the Terms that hold a Control task, whether they carry a call, and from whom it expects reports. No call says where: a leg's reports are with the two sides of that leg (G11.6), and a verifier reads those it holds. Where a leg report states something as passed on to an agreement, the receiving side is that agreement's receiver for the act (G1.4). Where that party is a service under a deal, or holds for others, it is the doer of the legs that follow, under the Terms that name it as `receiver` and hold its task (G11.2, G11.5). The reports of those legs are the ones that answer the call of those Terms, between their own sides; they are not looked for within the agreement the first report names.
  - (b) **The tie.** Two reports that name the same act are tied by it: for a payment, the settlement by which one side passed on and the other received (G8.5). Neither report names the other. At each leg these are the doer's report and the receiving side's confirmation, which answer the same call (G11.5). As the block asks, the verifier shows, for each such act, **matched**, **mismatched** (both shown, neither chosen), or **one side only**.
  - (c) **Amounts.** Two leg reports that name the same settlement match where they state the same amount for it (K8's row). Where they do not, the verifier MUST show both, with the amount each states, and MUST NOT choose between them.
  - (d) **Silence.** As the block asks, the verifier shows a call with no report as **unanswered**, and Terms that hold the Control task and carry no call as **no report called for**. Neither is read as anything else: not as kept, not as failed. From such a leg, nothing ties what lies beyond it to what reached it: as part of this result, the legs beyond are **not shown**, though their own reports are read as any are. **Unanswered** is said only by a verifier that reads as a side of that leg, or along a path the people of that leg signed for (G11.6(a)). A verifier that does not, because that leg's reports travel no further than the leg (G11.6), MUST NOT show the call as unanswered: for it, that leg's reports are **not shown**. Where the verifier lacks an act a report names, or the Terms that hold a leg's task, that part is **unchecked** (G9).
  - (e) **Before paying.** Asked which agreements of a sequence carry a call for reports, a verifier answers from their Terms alone (G11.2), one agreement at a time, per place or as shown (G4.6), and **unchecked** where it lacks them. It answers in the same way, from the same Terms, from whom each call expects reports, and whether those Terms name a data cMIP by which their signers agreed to a path beyond the leg (G11.6(a)).
- G11.5 **The same exchange at every leg.** At every leg the exchange of reports is the same. The doer's leg report states that it carried out the passing on. The receiving side's leg report confirms what it received. How the receiving side's report comes to be made is its own business and its way of paying's: on some ways of paying it can be automatic (P20). A receiving side that holds for others (G11.2), or that is a service under a deal, then has the next obligation: it passes on under the Terms that hold that task, and reports there as the doer, under their call where they carry one. Where the doer is itself one to whom those Terms give a part, its report states that part as its own, and a verifier MUST NOT read it as kept (K8's row). These grammar rules attach no call to a receiving side, and read no report as reporting on another report: each report speaks for its own signer, of its own leg.
- G11.6 **One leg.** A report answers the call of its own leg (G11.2, G11.7) and is addressed to the other side of that leg, where that side receives, and to no one else. That is the report block's, for every layer of MOR (section 8.1); these grammar rules add nothing to it. A call MUST NOT be read as naming a place, or a reader. A call MUST NOT be read as expecting a report on a task held by other Terms than the ones that carry it. No one who did not sign the act that holds a leg's task can call for that leg's reports (G11.2), however far upstream of the payment they stand. No report is read as carrying another leg's reports onward. **These grammar rules never follow a receiver beyond one leg.** G1.4 finds who receives, which is the receiving side of one leg, and stops there. What that side then passes on, to whom, through how many further legs, and whether it comes round to an agreement already passed (a loop), are not read by these grammar rules: they are for whoever follows further, along a path of (a), and are that data cMIP's to answer (P8).
  - (a) **Reports are data: a path beyond one leg.** A report is data. A path by which a report, or what it states, reaches anyone who is not a side of its leg (a partner seeing further, a request from upstream) is a path the people whose data it carries agreed to, with their signature. It is built as a cMIP about data, focused on agreements, which Terms they signed name by fingerprint (G2). These grammar rules give no such path themselves: no call, no field and no answer of this text carries a report beyond its leg, and a verifier MUST NOT read any as doing so. What such a cMIP says is its own: who may read what, how a reader puts together the legs it may read, how far it follows, and what a loop answers (P8). What such a cMIP is, which task it answers, and how Terms name it, are not said here (section 8.3).
  - (b) **Who has agreed.** A verifier MUST NOT read the people of a leg as having agreed to be read from beyond their leg unless Terms they signed say so (G5.1): by naming such a data cMIP, or by a rule in them under which others decide it. Which consent a data cMIP asks of the people it reads is that cMIP's to say. Which cMIP, and which rule, apply is what the signers chose when they made the agreement, and is read from the Terms they signed (G2). Where those Terms say that a majority decides, the majority decides (G5.1(b)): a verifier reads a member who was outvoted as that rule says, and MUST NOT answer, beyond it, whether that member agreed.
  - (c) One leg is the block's, in every layer. What is said here, and in Agreements only, is how people agree to a further path: in an agreement they signed ((a), (b)). No other layer of MOR is to carry a report further than its leg, or to give such a path (section 8.1).
- G11.7 **The buyer's leg.** Paying an agreement is a leg (G11.1). Its doer is the buyer, who signed the payment (G13.2). Its receiving side is the receiver, for that payment, of the agreement paid (G1.4). A payment is the act that holds the task of paying: the Control task (K8), with the payer as its doer. The payer, its signer, may call for the receiving side's confirmation, as the signer of any act that holds a task may (the block's R1). These grammar rules read every payment as carrying that call: the buyer's confirmation by default is that call, made by default, and no Terms need write it. The confirmation is a report that answers it. It names the payment, by the settlement both sides name (G11.4(b)), and that is how it names the call it answers; what the block must say for that to be so is in section 8.1. It is the receiving side's report as G11.5 has it: its signer's word (G8.4), and on some ways of paying it can be automatic (P20). As for any two halves, a verifier shows a payment so confirmed as **matched**, one whose confirmation states another amount as **mismatched**, and one the receiving side has not confirmed as **one side only**; it MUST NOT show a payment as received on the buyer's word alone (G8.3). After the confirmation comes access to what was bought. What that is, and who gives it, is said by the version the payment names and its cMIPs (G10.6, G13.2; task K9); these grammar rules do not read it. By default the buyer is shown nothing further. What the receiving side then does with the payment is further legs (G11.5), and their reports go to the two sides of each (G11.6). The buyer reads a further leg only as a data cMIP its people agreed to gives (G11.6(a)). The call binds only its signer, the payer: these grammar rules make no one confirm (G11.2).
- G11.8 **The contest, one agreement at a time.** A buyer's contest is a Statement, of a kind a cMIP gives (task K11), by which a buyer says that what they bought was not delivered after payment. It is made within the agreement the buyer bought under, names the version the payment read (G13.2), and names the payment in `settlement` (G8.5). That it was not delivered is the buyer's word, reported as such (G8.1). These grammar rules read a buyer's contest only there: where what was bought was not delivered after payment. It reaches that agreement and its signers (one level, G1.2). A verifier MUST NOT read it as contesting a service those signers picked, a deal of theirs, or any other agreement of the sequence; and MUST NOT read it as giving the buyer sight of any leg (G11.6, G11.7). Where those signers believe the fault is their service's, they contest the service: a contest of their own, made within the deal they signed with it (G1.2), which reaches the service and is read no further. Each contest is its signer's word (G8). What a contest does beyond standing on the record (task K13), who answers it and how, and how money comes back, are not these grammar rules' (sections 5.1, 7).

**Lie exposed.** "It all went through", said by one side of a leg alone; "you never asked", said by those whose own signers did; "your payment never arrived", said to a buyer who holds its confirmation; and "you agreed to be watched", said to people whose signed Terms name no such thing.

**Protects.** Both sides of every leg, who each hold the other's signed word; the buyer, who holds the confirmation of their own payment; and the people of every leg, whose reports move nowhere they did not sign for.

### G12. Forks

- G12.1 A **line** is a set of acts of which each names the one before it, so that only one act may follow each: one signer's acts within an agreement, by `previous` (G6.1); an agreement's Terms, by `replaces` (G4.8); and any other acts these grammar rules read as following one another. A **fork** is two acts that each count, under these grammar rules, as the next act after the same act of one line (G4.7, G6.2). That act is the **shared act**; each of the two, with every act that follows it in the line, is a **branch**.
- G12.2 While a fork stands, a verifier MUST show every branch it holds and answer **fork** where G4.7 and G6.2 say, and MUST NOT choose between the branches, by position or in any other way. A fork stands until G12.3 ends it.
- G12.3 **Join.** A join is an act of the same line that follows the shared act (its `previous`, or for Terms its `replaces`, names the shared act), and names in `joins` the first act of every branch. If it names one of them in `continues`, that branch continues and the line goes on from that branch. If it names none, the join merges the branches and the line goes on from the join. A join ends the fork only when it carries the signatures an act following the shared act in that line requires: for one signer's line, that signer's (G6); for Terms, those the shared Terms require for their replacement (G4.8). A join is not a branch. Every branch the join does not continue is **dropped**.
- G12.4 **A power to sign the join.** Terms MAY give, in advance, a power (G5) to sign the join of a fork: an entry in `powers` whose rule (task K4) says who may sign it, and which join it accepts. A join signed under such a power carries the signatures G12.3 asks for, and ends the fork as G12.3 says. For a fork of Terms, the power is read from the Terms both branches replace, which stay in force (G4.7); it is a power for replacement (G4.8, G5.2), which its rule may limit to joins. For a fork in one signer's line, it is a power to make that act for the signer (G5.1(b)). How the join is decided is the power's rule's: it may accept only the join it computes from the acts and the place, whoever signs it, or accept the join a named person signs (a judge, task K10), or anything else; these grammar rules force no single way. A verifier MUST report such a join with the power it was signed under and whoever it rests on (G5.1, G8).
- G12.5 **What others relied on stands.** An act signed by someone who signed none of a dropped branch's acts, and that rests on an act of that branch (it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch), keeps the effect these grammar rules gave it. A payment that names a version of that branch as the one it read (G13.2) is such an act. A verifier MUST show that act, and every answer resting on it, as **disputed**.
- G12.6 A fork that no join has ended stands: of Terms, as G4.7 says; in one signer's line, as G6.2 says.

**Lie exposed.** "This branch is the real one", said to whoever is shown only that branch.

**Protects.** Whoever relied on a branch without causing the fork, and the reader, who is shown every branch.

### G13. Now is what an act cites

- G13.1 An act is read against the versions and acts it names, in any field that holds a fingerprint (`terms`, `under`, `replaces`, `previous`, `answers`, `joins`, `relies_on`, `settlement`). A report is read in the same way, against the call and the acts it names (G11.3). A version that replaces one an act names does not change what these grammar rules read that act as having done. Whether the act's signer is bound from then on is G4.3 and G5, unchanged.
- G13.2 An act that relied on a version or an act, of its own agreement or of another, names it: a Statement in `relies_on` where no other field names it, a Terms act in `relies_on` (G2). A verifier MUST NOT read an act as having relied on a version or act it does not name. A payment to a work names the version of the work agreement it read; how a settlement carries that name is for the layer that gives the settlement (section 8.1).
- G13.3 **Order from citing.** An act that names another, directly or through acts that name it, came after it. A verifier MAY give that order as **shown**, from the acts alone, with no place and no qualifier. Between two acts of which neither so names the other, no order is shown from the acts alone.
- G13.4 **Anchoring.** Whether anything is later than an act, and what time it was, are never shown by citing. For an agreement whose Terms in force name a place, every reader takes "nothing later" from that place; for one whose Terms in force name a clock, every reader takes the time from that clock (G7.4). A verifier MUST NOT give, per a reader's own anchoring, an answer that the place or the clock the agreement names gives. Only where the agreement names none does each reader accept the anchoring it chooses. A verifier MUST give each such answer **per anchoring**, with the anchoring named (**per place** or **per clock** where it is the one the Terms name), or **as shown**.

**Lie exposed.** "You paid the wrong one", said to a payer after the agreement changed behind them; and "nothing came after", said on an anchoring the agreement does not name.

**Protects.** Whoever acts on a version they read and named: the payer above all.

### G14. The baker

- G14.1 Terms MAY name an `envelope`: the fingerprint of the envelope of a baked work those Terms are for (G2). What an envelope is, and who it says baked it, are read as the core gives them (section 8.1). The baker is reported as the envelope states it (G8).
- G14.2 Terms that name an envelope count as an agreement for that work only if:
  - (a) the baker is one of their parties, bound by them (G5.1); or
  - (b) one of their parties, bound by them, holds the baker's rights through a **succession**: agreements for the same envelope, of which the first meets (a); each passes the baker's rights to a party of the next, as its own Terms and cMIPs say (tasks K4, K11, K12); and the last is these Terms. Each agreement of the succession names the one before it (G13.2).
- G14.3 A verifier asked whether Terms count as an agreement for a baked work MUST read the envelope, the baker it states, and, under (b), every agreement of the succession. Where the Terms name neither the baker among their parties nor a succession, the answer is **invalid**: they cannot count as an agreement for that work. Where they name the baker or a succession and the acts held do not establish (a) or (b), the answer is **not shown**. Where the verifier lacks the envelope or an agreement of the succession, it is **unchecked** (G9). A verifier MUST give that answer with every answer about that work that rests on those Terms (a receiver, a filling, a leg report).
- G14.4 A work edited and baked again has another envelope and another baker. These grammar rules read it as any baked work, and do not read it as the first.

**Lie exposed.** "This work is mine to sell", said by someone who copied its bytes.

**Protects.** The baker, and whoever holds from her; and the buyer, who can check before paying.

---

## 5. Tasks handed to cMIPs

A task is one question the grammar asks and does not answer (section 2). A cMIP answering a task accepts what the task says and produces what the task says; anyone may write one, and a cMIP may answer a task for one kind of thing only (one cMIP for land, another for shares). Where a task belongs to another layer's operation, it is named and not defined.

| # | Task | Question | Accepts | Produces | Trust |
|---|---|---|---|---|---|
| K1 | Body | What do these words say? | the `body` bytes | a reading for people, and any parts for machines that rules read | none: format only |
| K2 | Identity | Who is behind this signer? | a signer, an agreement | signed statements by those who vouch for the signer | witness (Sign layer) |
| K3 | Assurance | What was done to make it likely that a party was able, free and understood? | Terms, a party | signed statements of what was done (cooling-off, separate advice, witnessing) | witness; never a pass |
| K4 | Rule | What does this rule produce from these acts? | a rule's parameters, the acts held, the answers of the place and the clock the agreement names, or of the anchoring named where it names none, and receivers for acts and what leg reports state (G1.5); for the rule of a power to replace Terms, the version in force and the proposed version (G5.2) | yes, no, a list of who, or amounts; for the rule of a power, allowed or not; the same output for the same inputs, every time, for anyone | none: anyone can recompute |
| K5 | Witness | What happened in the world? | the question as the Terms state it, the named witnesses | each witness's signed statement | witness |
| K6 | Place | Is this act in the place, at what position, and is anything later? | the place's identifier, an act or an agreement | a signed answer by the place | place (Order layer) |
| K7 | Tally | What did a vote decide, without showing who voted how? | the ballots, the list of who may vote | the result, with whatever proof the method allows | teller |
| K8 | Control | Has the controller carried out this instruction? | an instruction, with the acts and rule result behind it | the controller's signed evidence. Where the Terms that hold this task carry a call (G11.2), a report answering it is a **leg report**. Beyond what every report carries, a leg report from the doer (the controller) states, with amounts: **what was received**, each amount with the act it came by (a settlement); **what was passed on**, each amount with to whom (a signer, or an agreement by its root) and the act it went by (a settlement); **the doer's own part**, where the doer is itself one to whom the leg's Terms give a part (a party who receives for the others): its amount, which is not a fee; **what was kept** (a fee); and, apart from both, **what is still owed**, each amount with to whom. A leg report from a receiving side (one to whom something was passed on; for an agreement, its receiver for the act, G11.2) confirms what it received, each amount with the act it came by. The confirmation of a buyer's payment, by the receiving side of that leg, is such a report: it answers the call the payment carries by default (G11.7). Which of a doer's lines each receiving side receives is said by the cMIP answering this task (G11.3). Each act so named is one of the acts the report relied on. Two reports that name the same settlement match where they state the same amount for it (G11.4) | hand (Control layer) |
| K9 | Delivery | Did this act reach this person? | an act, a recipient | the recipient's signed acknowledgment, or the Deliver layer's evidence | recipient or Deliver layer |
| K10 | Judge | What did the named judge decide? | the Terms (including `authors`), the acts of the dispute | the judge's signed decision, which binds only through a power under G5 | judge |
| K11 | Kind | What does a Statement of this kind state, and which rules read it? | a `kind` fingerprint | the meaning of `content`, and how K4 rules may read it | none: definition only |
| K12 | Spot | Who fills this spot, by which proof, and on whose word; and does it still take new identities? | the role (its kind and `what`) as the version in force states it, what the rule in that version's `condition` says, the acts held, the answers of the place and the clock | each filling: the signer who fills it and the proof that earned it (the acts it rests on); or none; whether the spot holds one filling or many (G10.2); whether it still takes new identities, and why (G10.5); for kind future, also what defines the participant | whoever the cMIP names as confirming: for done, a witness or the counterparty; for received, the previous holder; for holding, as its cMIP says; for fits, those who vouch (K2); for future, as its cMIP says |
| K13 | Standing | What do one signer's acts show about them, to anyone who looks? | a signer, any acts and place answers the one asking holds | whatever measures the cMIP defines (proven forks, acknowledgments given and received, spots filled), computed from signed acts only, qualified per place or as shown | none: anyone can recompute; nobody keeps it |

### 5.1 Five things built on the blocks, and the task each plugs into

Nobody, allegedly: "Just be mindful to not attempt to solve something the cMIPs will." The five things below are solutions people will build. The grammar keeps only the block under each; the rest is a cMIP's, answering the task named. None of this is a grammar rule: it says where each thing plugs in.

| What is built | The block the grammar keeps | Its cMIP plugs into | What that cMIP says |
|---|---|---|---|
| **Paying through a sequence**: a service that takes a work's payments and divides them | a receiver that may be an agreement (G1.3, G1.4); an act that names the version it read (G13.2); the two sides of a leg (G11.1); a call for reports on the passing on, and the leg report that answers it, at every leg in the same way and for one leg only (G11; the block is the shared language's); the buyer's leg, with the receiving side's confirmation of the payment (G11.7); who said it (G8) | **K8** (Control), the service being a hand; with K1 to read its deal and K4 to compute the division | what makes an agreement the work's deal with the service (and not the service itself, nor an offer it makes to everyone); what is read from the deal (where the work is paid on each way of paying, the fee and who bears it, what becomes of a late payment); what must agree for a work to count as paid; how a pay-out is matched against the shares and the version the payment named; where each owner is paid; which lines of a report each side of a leg receives (G11.3) |
| **The agreed witness**: rewarding someone for being seen (a play, a view, a repost) | a spot (G10); the `settlement` field, as the Money layer's socket (G8.5); who said it (G8.4) | **K12** (Spot): the spot's cMIP names the witness (K5) and the rule (K4) that counts | who may count; which of the witness's counts are counted (only those that led to a settlement, or every one, as those who agree choose); that a count by anyone else is not counted |
| **Closing, reopening, closing by itself**: an offer that stops taking new people, or takes them again | a spot read from the version in force (G10.2, G10.5); earned rights kept (G10.6) | **K12** (Spot) | what in the version in force means the spot takes no new identities (a mark in a new version, a date, a count of buyers), and what opens it again |
| **A condition**: rights that no longer apply, an offer that stops | one field, `condition`, naming a rule signed in advance (G10.7) | **K4** (Rule) | what meets the condition, and what it stops: the rights, the offer, or both |
| **Settling a fork in advance** (what earlier drafts called an arbiter or resolver) | the join (G12.3); a power given in advance (G5, G12.4) | **K4** (Rule), as the rule of the power to sign the join; with K10 where that rule names a judge | who may sign the join, and which join is accepted |

Escrow is built in the same way as the first row: a service's cMIP (K8), under its deal; which agreement its deal is with is that cMIP's. A buyer's contest reaches the signers of the agreement the buyer bought under first, and not a service they picked (G11.8); how a contest then reaches an escrow service is that cMIP's, under the deal the service signed. What protects an agent in a delegation (G5.5) is likewise a cMIP the parties choose.

Seeing beyond one leg is built too, and not with the report block: a call names no reader, and a report goes no further than the other side of its own leg (G11.6). It is built as a data cMIP focused on agreements: a path for data that the people whose data it carries agreed to, with their signature, in an agreement they signed. Which consent it asks for is its own to say, and which cMIP and rule apply is the signers' choice when they make the agreement. The blocks under it are ones the grammar already has: a cMIP named by fingerprint in signed Terms (G2), and nobody bound by what they did not sign (G5). What such a cMIP is, and which task it answers, is not said, and no task is added for it (section 8.3).

Four things a cMIP could perhaps also build are kept in the grammar, for the reason given under each grammar rule in `reasons-15.md`: the four named kinds of spot beside the open fifth (G10), the baker (G14), the delegator's default (G5.5), and the counter signature (G4.10). Two more are kept, and are questions for Nobody, allegedly (section 8.2): the buyer's contest (G11.8) and the condition (G10.7).

### 5.2 What can be said in this language, and so is a cMIP's

The test, in the words of Nobody, allegedly: "What the previous version of agreement focused on solving issues… this one supports and specifies the language for creating solutions". And, of small problems the builds find: "The answer is often: you did not use the right cMIP then." Each thing below was found by a review or a test. Each can be said in the language as it stands, so the grammar adds nothing for it. None of this is a grammar rule; the right-hand column is one way to say it, not the only one. The list follows section 9 of Fable's review (`docs/reviews/fable-agreements-draft-14.md`), with three rows from the exchanges "The two sides of a leg" and "The wrong cMIP".

| What was found | How it can be said |
|---|---|
| An owner's share is rewritten under a power that lets fewer than all replace the Terms | a rule for that power which says which parts it lets through; it is given the version in force and the proposed one (G5.2, K4) |
| A party wants to leave, and the Terms name no way | a power whose rule allows only a version that takes its own signer out (G5.2, K4) |
| A delegation only the agent may end | what the delegation's Terms say (G5.5); a body cMIP (K1) that shows it to whoever reads |
| A group that co-owns a work is not counted when the work's Terms change | Terms whose `in_force` rule, or whose rule for replacement, counts it (G4.4, G5.2) |
| An outvoted member is seen from beyond their leg | the consent the data cMIP asks for (G11.6(b)) |
| A contest reaches one agreement, and the money has already been passed on | escrow, as a service's cMIP (K8) |
| Nothing is shown to anyone before they sign | a body cMIP (K1), and the client |
| When and how a pool is divided | a rule (K4) and a service's cMIP (K8); what a leg report names from a pool is still open (P6) |
| A doer's report shows each receiving side what every other was paid, or shows what is owed under a minimum to nobody | the task's cMIP (K8) says which lines each side of a leg receives (G11.3) |
| A member paid by a service also tells the agreement she is under that she was paid | that agreement's own Terms: a task and a call of their own, or a data cMIP (section 8.3) |
| Someone receives under a call in Terms they did not sign, themselves or through an agreement's signature | a cMIP closes it; in the words of Nobody, allegedly: "I’d use a data cMIP to bridge the gaps." (G11.2) |

---

## 6. Open parameters

These are values the grammar rules depend on and this draft does not fix. The numbers are kept from earlier drafts so that the records still point at them; P3, P10, P13 and P14 were answered there and are not listed (`history.md`).

- **P1. Default for `in_force`.** G4.1 sets it to "every party named as a signer". Whether a different default is wanted is open.
- **P2. Depth of powers through powers.** G5 lets Terms named in `under` themselves be bound through other Terms (an agent of an agent; a group within a group). Whether a verifier must follow any depth, or a limit applies, is open.
- **P4. One place or several.** G7 names one place. Whether Terms may name several places with a K4 rule over their answers (plural witnesses of order) is open.
- **P5. What a verifier holds.** G6 and G9 depend on which acts the verifier holds. Whether a verifier answers from a set it is given, or must also ask the place for more, is open. K13's answers depend on it most.
- **P6. Pools.** In plain words: some ways of paying cannot pay each share at the moment it is earned. Money must first gather in one pot, and be divided later. Nobody, allegedly: "Sadly some rails will need pools… this headache won’t be easy." This draft does not solve it. What is open, all of it:
  - who holds a pool, and on whose word it is said to hold what it holds (G8.3: only the holder's or controller's word);
  - when a pool is divided, and by which rule;
  - how a claim on a pool is counted when each false claim takes from the real claimants (`late-roles.md`: "each fake claim takes from real claimants, and the payer has little reason to resist");
  - what "tied to a settlement" (G8.5) means for a count paid out of a pool, where one settlement covers many counts;
  - what a leg report (G11.3) names as received where what it passes on comes out of a pool;
  - what happens to a pool's share that no one has yet claimed (the owed but unfindable).

  **What the click test showed** (`docs/click-sketch-report.md`, branch `claude/click-sketch`, its 3e; a test built on draft 10): one report for a batch of payments works, since it names them all as received. But "how much of *my* click reached the band" is then arithmetic the reader does pro rata, which nobody states; the sketch marks it "not stated". Left open. Whether one report may answer several calls at once is open in the block as well (section 8.1).
- **P7. What happens to a filling.** A spot may be filled many times, each filling tied to its proof (G10.2). Still open: whether a filled spot can pass to another, and whether a later claimant can displace an earlier one.
- **P8. A receiver that is an agreement.** *Answered in draft 15, as far as the grammar goes:* these grammar rules never follow a receiver beyond one leg (G11.6). G1.4 reads a receiver, through any agreement it names, only until one of an agreement's own parties is reached: that finds the receiving side of one leg. What that party then passes on, through how many further legs, and whether it comes round again, is for whoever follows further: a data cMIP (G11.6(a)). **What the click tests showed:** when a song names as a party the film that stands on it, money goes round until fees and rounding eat it (`docs/click-sketch-report.md`, its 3f); and since nobody walks past one leg, such a loop matters only to a reader who puts several legs together (`docs/click-sketch-12-report.md`, its 3f). *Still open, inside one leg:* G1.4 sets no limit on how many agreements a receiver may point through before a party is reached, and answers **not shown** where an agreement is met a second time, since then no one receives. Both are Claude's least reading, for the MOR lead to confirm (section 8.3).
- **P9. What a fork removes.** G6.2 says a verifier "MUST answer **fork** for that signer". Whether that is for the two acts only or for every later answer involving the signer, and whether a signer can make their own assent uncountable by forking on purpose, is open. It is answered for Terms only (G4.7): while a fork of Terms stands, the Terms both branches replace stay in force. Two joins of one fork, each carrying the signatures a join needs, are not named by any grammar rule either. A least reading of both is proposed, not decided, in section 8.2.
- **P11. Dates.** A place gives positions, not dates. Terms may name a `clock`, and every reader uses it for that agreement (G7.4, G13.4). Still open: what a clock is and who gives it (P16).
- **P12. One act for many.** `for` names one person, or one agreement. An act made for an agreement binds that agreement's parties by one act (G1.2). Whether one decision or judgment binding many who are not the parties of one agreement is one act or one per person is open.
- **P15. Rights outside fillings.** G10.6 is about fillings. *Answered in draft 15, from the exchange "What the grammar is for":* the grammar gives a party named as a signer, or an agreement named as a party, no default of its own against a later version made under a power. What such a power reaches is its rule's to say: the rule is given the version in force and the proposed version, and answers allowed or not (G5.2; section 5.2).
- **P16. The clock.** Not said: what a clock is and which layer gives it; whether the place may also be the clock; and, where two versions of one agreement name different clocks, which one a `condition` rule (G10.7) reads. This text says "the Terms in force", as G7.2 does for the place.
- **P17. An agreement that acts, or signs.** *Settled in draft 12:* an agreement named as a party signs, where it signs, as its own Terms require; a deal between a work and a service is signed by both, and a call in it is made by both (G1.2, G4.4, G11.2). *Settled in draft 13,* by the MOR lead as technical wording: signing is one level (G1.2). *Settled in draft 15,* from the exchange "The two sides of a leg": `for` may name an agreement; an act made in an agreement's name, under a power its own Terms give, is that agreement's signature, and binds its parties as its Terms say (G1.2, G5.1(b)). *Still not said:*
  - by which acts an agreement signs where its Terms give no power for it. This text says every one of its signers, one level (G1.2), from his "signed by all". The least reading would be an act by each of them, its `for` naming the agreement and its `under` its Terms in force; that is not written as a grammar rule;
  - whether an agreement's signature may be made under Terms other than its own (a separate delegation it signed), which is a power through a power (P2);
  - whether the default of G4.1 should count a party named as an agreement. It does not, as before: a work that only points at the works it stands on needs none of them to sign ("no collective involved"). So Terms that need an agreement's signing must say so in their own `in_force` rule, and nothing else in the grammar tells a party that must sign from one that is only pointed at. That is one deal people may make and not the only one: a group that wants a say signs Terms whose rule counts it (section 5.2);
  - whether someone who fills a role of an agreement is one of its signers when it signs as a party; G1.2 counts only the parties its Terms name as signers. And how Terms "say otherwise";
  - whether such a party can itself make a counter signature (G4.10).
- **P18. The baker's succession.** G14 says the succession starts with the baker and that each agreement passes the baker's rights as its own Terms say. Not said: what in an agreement counts as passing them (a version, a Statement of some kind, a filling of kind received); whether the agreements of that succession call for reports (G11); what is read for a work with several bakers; and how Terms that sell a baked work's bytes without naming its envelope are read (G14 reads only Terms that name one).
- **P19. Where "invalid" stops and "not shown" starts.** "Invalid" is meant as one word across the layers. This text draws one line (section 2): **invalid**, where the act itself shows that it cannot count, whatever other acts exist; **not shown**, wherever an act the verifier does not hold could change the answer. Whether that is the line the other layers draw is not known to this text (section 8.1). A replacement that lacks a signature is, by that line, not shown (G4.8); his word for such a case was "invalid" (section 8.2).
- **P20. What a leg report carries.** K8's row says what a leg report carries beyond what every report carries: what was received, what was passed on and to whom, the doer's own part, what was kept, and, apart from those, what is still owed, each with its amount (G11.3). Not said: how an amount is written so that every reader reads it alike (an amount on a way of paying is the Money layer's to give; a right is something else); whether money shown as still owed is later shown as paid, and by what; and whether one report may cover many payments (P6). **A person who receives for others**, what the click test showed (its 3g): a work whose receiver is one of its owners passes no report, and none is asked. That owner then holds the others' money, unseen: in the sketch a library's first owner received for both owners, and the second was shown in no run. *Answered in draft 12* (G11.2, G11.5): every leg is the same exchange. Whoever paid that owner reports that they did; the owner confirms by a report of their own; then the owner has the next obligation, within the work's own agreement, and reports there as the doer, each other owner confirming. No call is attached to a receiving side. *Answered in draft 13* (K8's row; G11.5): such an owner's own share has a line of its own, the doer's own part, and is not read as a fee kept (the second click test's 2c). *Still not said:* by which act a doer's own part is named, since nothing moves when a holder keeps their share; how a receiving side's report is "automatic" on some ways of paying (who signs it, and whether a settlement can itself stand as the confirmation: the Money layer's, section 8.1); and whether a work whose owner receives for the others holds the Control task with no cMIP named for it, as G11.2 reads it (section 8.3).
- **P21. One condition.** A version names one rule in `condition` (G10.7). Not said: whether a version may name several (one for each spot, or one for rights and one for the offer), or whether the one rule's parameters must carry all of it.

---

## 7. Stated costs

Cases that do not fit the grammar. None is closed by a grammar rule.

- **Minds.** Whether a party was able (#3) or free (#5) cannot be shown by any act. K3 can make it more likely and record what was done; nothing assigns its failure. Only Align is assigned (G3).
- **Conceal (#39).** Terms can be kept private and their fingerprint lodged in a place; nothing can show the words were not told to someone, and telling cannot be undone.
- **Enforce beyond what was posted (#45).** Words can order a release; something must obey. Against value not under Control, force lies outside the protocol. A proven liar (G6) loses only what they posted and their standing with those who see the proof (K13). Against a stranger who vanishes, the proof is worth nothing.
- **Deeds lean on witnesses.** The more an agreement is about services and acts in the world instead of value under Control, the more it rests on K5, whose statements prove only that the witness said them.
- **Spots lean on their confirmers.** Each kind of spot has its own recorded fraud (`late-roles.md`): doing is faked "by simulating the act or stealing credit"; receiving "by forging the chain"; holding "by forging the object or issuing more than exists"; being "by false or multiplied identities". G10 fixes the test in advance and G8.4 reports who confirmed; neither makes the confirmer honest.
- **Future spots are the authors' word.** Whether a future spot was used only for participants no one could anticipate cannot be checked (G10.4). Authors who use one for an ordinary participant, to escape the four kinds' clearer tests, are not stopped by the grammar.
- **Counted attention leans on whoever counts, and the grammar names no one.** Being seen is counted by whoever a spot's cMIP names (section 5.1). The grammar itself no longer requires an agreed witness: an agreement whose cMIP names none, or names the payer, has counts that rest on whoever states them, and inflated attention (`late-roles.md`: "Roles counted by attention suffered fabrication of the event itself") is then exposed only as far as that cMIP goes. A rule that counts only what led to a settlement leaves out someone truly seen whom no payment yet stands behind; a rule that rewards pure attention rests every count on the one who counts.
- **"Now" is what was read, and no more.** Under G13, a payer who names the version they read has paid as that version says, even if the agreement had already changed without their being able to know. That protects the payer; it also means the owners under a later version can see money go by an earlier one. Whether the version named was still the last is answered only per an anchoring, or as shown (G4.6, G13.4), and the climb up a sequence gets less certain at each agreement that names no place.
- **A work that points nowhere cannot be paid.** Under G1, what is owed to an agreement whose version names no receiver has nowhere to go, and is not shown.
- **A deal is as complete as its words.** Who bears a service's fee, and what becomes of a payment that arrives after the work has named another receiver, are whatever the deal states, read by its cMIP. A deal that says nothing on them leaves them unsaid; the grammar supplies no answer.
- **A service is a hand.** Nothing in the grammar makes a service divide as the shares say, or pay at all. The grammar reads only its signed word of what it received, passed on, kept and still owes (G11), and only where its deal called for that word. Two reports that state different amounts for the same settlement are shown side by side, neither chosen, and anyone may count it (K13); getting the money is another matter ("Enforce beyond what was posted"). An owner who receives for the others is a hand in the same way (G11.2): nothing makes them pass it on.
- **A sequence is readable only as far as its agreements call for reports, and are answered.** G11 makes no Terms carry a call for reports, and makes nobody answer a call. From a leg whose call is unanswered, or which has none, nothing ties what lies beyond it to the click: the people beyond are not shown, though they never chose that leg (in the click test, one silent service hid a producer and a whole band). And a call binds only the signers of the Terms that carry it: a work cannot make the works it stands on, or their services, report. What a buyer has is this: before paying, which agreements carry a call for reports, and from whom, read from their signed Terms; afterwards, the receiving side's confirmation of their own payment, and then access to what they bought (G11.7). Which further calls were answered is seen by the two sides of each leg. And a report is its signer's word: it makes the whole readable, not true.
- **One leg, and no further.** By the grammar each report goes to the other side of its own leg, and nowhere else (G11.6). The buyer is shown that their payment was received, and by default no more (G11.7): not whether the money reached every member. And nothing makes the receiving side confirm: a payment nobody confirmed is shown as one side only. A buyer, or a partner, who wants to know whether a split among people at the far end was carried out reads it only where the people of every leg on the way agreed, with their signature, to a data cMIP that gives it. No call gives it, and this text does not say what such a cMIP is (section 8.3): until one is written and signed for, nobody reads further than their own leg. Where one leg did not agree, the far end is not shown to that reader, whatever was reported there; and the one who received is the only one who says it was passed on. That is the price of not making surveillance cheap. The other side of it: where the people of a leg did sign for such a cMIP, they are read as far as they signed; and where they signed a rule by which the majority decides, a member who was outvoted is read as the majority decided. The grammar reads their signature, not whether they were free to refuse it ("Minds").
- **A contest reaches one agreement.** A buyer who paid and was not delivered to contests the signers of the agreement they bought under, and nobody else (G11.8). If the fault lies with a service those signers picked, the buyer depends on them to contest the service in turn; nothing makes them, and the buyer is not shown whether they did. A contest is a word on the record, the buyer's; it moves no money.
- **Paid, and the author gone.** An open offer whose only author goes absent, with nothing that delivers by itself: whoever paid and got nothing can contest. The contest reaches the signers of the agreement they bought under (G11.8), and here that is the author, who is gone. It stays on the record for anyone to read (K13). The record cannot give the money back, since nobody is left to sign. A buyer who wants that pays through an escrow service: a hand, under its deal, for a fee. Without one, the loss is the buyer's. Nothing in the grammar prevents an author from vanishing with what was paid; that is dealt with, if at all, in how services are built. In the words of Nobody, allegedly: "MOR only offers ways to ring the alarm", and "MOR just tracks receipts".
- **Order without an anchoring is partial.** Citing shows only "after" (G13.3). Two acts that never cite each other have no order from the acts alone, and nothing shows "nothing later". Where an agreement names no place and no clock, readers who accept different anchorings can get different answers; each answer says which anchoring it stands on. Where it names them, every reader uses them (G7.4), and the answers are as good as that place and that clock.
- **No longer applies is as sure as its condition.** A condition met by someone's statement rests on whoever made the statement (G8); one met at a time rests on the clock the agreement names (G7.4), or, where it names none, on the anchoring the reader accepts (G13.4): then two readers with different anchorings can differ on whether a filling's rights still apply. Beyond that the grammar defines nothing (G10.7): a version that says nothing more leaves it unsaid. And going on afterwards takes a new version, signed as the Terms require (G4.8), which those who must sign it may refuse.
- **Reputation is as wide as the acts one holds.** K13 answers only from what the one asking holds, per place or as shown. Two people holding different acts compute different standing for the same signer, and honest forks (below) count against honest people.
- **Without a place, no scarcity and no freshness.** The same thing can be given twice in two branches, the latest act can be withheld, silence cannot be counted. G7.3 makes this visible; it does not cure it.
- **Ownership is as wide as its place.** Two parties who accept different places cannot settle who holds a thing between them. The same thing sold in two separate agreements is seen by neither agreement's rules. A stranger's sale of a baked work is seen: Terms for an envelope count only with the baker, or a succession from the baker (G14). The baker, or a holder, who sells the same work twice in two successions is still seen by neither.
- **The baker is as the envelope says.** G14 rests on the envelope and on whoever it names as baker, as the core gives them. It does not stop anyone from editing a work and baking it again under their own name: that is another envelope, and whether it owes anything to the first is not read by this grammar. It reads only Terms that name an envelope (P18).
- **Closed world hurts the one who did not lodge.** Under G7.2, a party's own act that never reached the place does not count, even if it is genuine.
- **Honest forks.** A signer who loses track of their last act (a lost device, a restored backup) and signs again produces a fork that looks exactly like a lie. Honest drift and lying look the same from outside. The signer can end it with a join (G12.3), if they still hold their key; what others relied on in the branch the join drops stands, shown as disputed (G12.5).
- **A fork of Terms holds the agreement where it was.** Under G4.7, while two replacements of the same Terms both stand, the Terms before them stay in force: neither branch's change takes effect, including a new receiver (G1.4). If the agreement gave no power to sign the join (G12.4), and those whose signatures a join needs will not sign one, it stays there; the grammar shows it and picks no branch.
- **A join does not undo.** What others relied on in a dropped branch stands, shown as disputed (G12.5). A join settles which branch goes on; it cannot take back what a stranger did relying on the other.
- **Withdrawing before in force.** Between a first assent and the last, the first signer holds an open option against themselves. They can close it: an assent may be cancelled, by a counter signature, until the Terms are in force (G4.10). It is still a race, between the counter signature and the last assent, that only a place, or an `in_force` rule with a deadline read from a place or a clock, settles.
- **An offer that stops taking new people.** The same race, between whatever stops the offer (a new version coming into force, a date, the hundredth buyer) and a stranger's filling the spot. Who came in time is per the place and the clock the agreement names, and without them only as shown (G10.5).
- **Secret votes need a teller.** K7 requires trusting whoever counts.
- **Identity ends in acquaintance.** Who vouches for the voucher (K2) ends in someone knowing someone; the grammar cannot express that. Spots of kind fits rest on it.
- **The record holds no value.** Every act about value is a claim or an instruction. The gap between "the record says 100" and "there are 60" must be checked continuously (K5, K8), not once.
- **Those who cannot sign.** A contributor who has no key (the long dead, the unknowing) can be named in words but is no party, and nothing can arrive for them.
- **No default way out.** By G5, an agreement that names no power to change itself changes only by everyone's assent again. And since no agreement ends (G4.9), none can be left by ending it: the last version keeps binding until those its Terms require sign a new one. If a party is gone and no successor was named in advance (#37, #38), it is stuck. (One exception: a delegation ends by its delegator alone, by default, G5.5; not where its signed conditions say otherwise.) The way out is designed in advance or not at all: for a party who wants to leave, a power whose rule allows only a version that takes its own signer out (section 5.2); this draft chooses that over any default that would let someone be bound without their signature.
- **Ordering and lines show patterns.** G6 and G7 make the shape of an agreement (who acted, how often, in what order) visible to whoever sees the acts or the place, even when the words are concealed. K13 reads exactly those patterns.
- **An agent has what was signed, and no more.** By default a delegator ends a delegation at any time, and the grammar gives the agent no notice and no pay (G5.5). An agent who wants either has it written, as signed conditions or as a cMIP beside the delegation. In the words of Nobody, allegedly: "we’re not Law." The same holds for the delegator: the grammar limits no signed condition, so a delegator who signs that only the agent may end the delegation has given up ending it alone, for as long as the agent chooses, and if the agent is gone, for good. The grammar shows the condition; it stops no one from signing it.

---

## 8. What is still open

Nothing in this section is decided. Sections 6 and 7 are part of what is open too: the parameters this text does not fix, and the costs it does not close.

### 8.1 What this text needs from the other layers, and does not have

- The core's act format: whether it already gives fingerprints, a per-signer line of acts (which would make G6 redundant), acts signed by several people at once, and field names.
- What the Order layer's place can answer: in particular whether it can sign "nothing later than this", and how a place is identified without a server address.
- What the Sign layer does when a key is replaced or lost, since that decides whether G6 sees a fork.
- How cMIPs are identified in practice, so that "named by fingerprint" in G2 can be met.
- **The report, a block of the shared language** (proposed in `docs/lead/proposals/report-block-2.md`, branch `claude/lead-records-2`: the MOR lead's proposal, not a decision, not yet written into any spec, its wording his to change). This text uses it (G11, task K8) and does not define it. What it needs from it: that a task may carry a call for a report, or not; that the call says from whom, and names no place and no reader (its R1 and R3); that only the signers of the act holding the task can make it; that a report carries the call it answers, the acts it relied on and its signer; that a report is addressed to the other side of its own leg, and to no one else, in every layer (its R3); that two halves are tied by an act both name; and that "unanswered" and "no report called for" are shown as such. What the block has not yet said: how a call is written, where it sits in the act that holds the task, and how a report names it by fingerprint; how "where that side receives" is found without a server address (the Deliver layer's, and the security rules'); how a report is written as an act, and whether it is a Statement of this text; whether a call is per task, or per act holding several tasks; whether one report can answer several calls at once (P6); whether "unanswered" ever ends; and its words, which are the MOR lead's, as technical wording, but for "leg".
- **The seam between this text and the block, and what the block would need.** `report-block-2.md` is not changed by this draft. Three things in it and in this text do not yet read alike.
  - *A confirmation with no call written (G11.7, against the block's R2: "A report that names no call is no report").* This text now closes its own side: a payment is the act that holds the task of paying, the payer is its signer, and the payer may call for the receiving side's confirmation, which is R1 as written. The buyer's confirmation by default is that call, made by default. For that to be read without contradiction the block would need to say two things it does not say. First, that a task may define a call as made by default by the act that holds it: R1 says a call MAY be attached, and R5 reads a task with no call as "no report called for". Second, that a report may name the call it answers by naming the act that holds it (here the payment, by its settlement), since a call made by default has no bytes of its own to fingerprint. Until the block says both, R2 read strictly makes the buyer's confirmation "no report".
  - *"two sides who both signed" (the block's plain words).* In this text the two sides of a leg are whoever carries out the obligation and whoever receives it (G11.1), whether or not they signed anything together. A buyer and the receiving side of a payment signed nothing together: the buyer signed the payment, and the receiving side is named by Terms it signed or was named in. A member paid under a deal signed it through her agreement's signature (G1.2). Someone paid under Terms they did not sign at all is still the receiving side, and a cMIP closes that gap (G11.2). The block would need either to drop "who both signed" from its plain words, or to say what counts as each side having signed.
  - *Which lines each side receives.* R3 addresses a report to the other side of its own leg. Where one report speaks of several legs (a payout to several), this text leaves to the task's cMIP which lines each receiving side receives (G11.3). The block would need to allow a task to say so.
- **Seeing beyond one leg: an agreed path** (G11.6). In plain words: no layer of MOR carries a report further than its leg. That is now the block's own rule (its R3), and no longer something only this text says. What this text needs from the shared language and from every other layer: that none of them carries a report further than its leg; that none lets a call name a place or a reader; that none lets anyone who did not sign an act call for reports on it; and that none gives, for its own tasks, a path for a report that the people it concerns did not sign for. In the words of Nobody, allegedly: "Data needs to move along paths that people agree, with signature." And, earlier: "Never extended to the other layers. Or surveillance become cheap and omnipresent." Draft 13 asked the block whether a call's "where" may name a place outside the leg, in every layer or in Agreements only. That is answered: in none. And what this text does not have: what a data cMIP focused on agreements is, which task it answers, how Terms name one so that their signers have agreed to it, and whether such a cMIP belongs to Agreements alone (section 8.3).
- What a settlement is, as the layer that holds value gives it, so that the `settlement` field (G8.5) names the right thing; and what a payment is there: how it names the version of the work agreement it read (G13.2; that is Money's to say, and this text only reads the name).
- How that layer writes an amount, so that the amounts in a leg report (task K8) can be read by everyone alike (P20).
- The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an evidence-only record to be enough. G6 depends on the answer for its force; K13 is where that loss would be read.
- Whether the verifier's answers (shown, not shown, fork, no longer applies, invalid, unchecked) are already named in another layer, so that the words match; in particular where "invalid" stops there (P19).
- What the core calls an envelope, baking and a baker (G14): whether an envelope has a fingerprint of its own, how it states who baked it, and whether a work may have several bakers.
- What a clock is, which layer gives it, and how it is identified without a server address (G7.4).
- Whether the core has an act signed by several people at once, for an agreement that signs by every one of its signers (G1.2; P17); and whether the core's `for`, if it has one, can hold an agreement's root.
- What a receiving side's "automatic" report is on a way of paying, as the layer that holds value gives it: who signs it, and whether a settlement can itself be the confirmation (G11.5, G11.7; P20).
- What a payment is as an act, in the layer that holds value: where the payer's call sits in it, and whether a payer can state that no confirmation is called for (G11.7).
- What access to what was bought is, who gives it, and what shows that it was given or was not (G11.7, G11.8): the Deliver layer's evidence, or a recipient's acknowledgment (task K9).

### 8.2 For Nobody, allegedly

Draft 15 is draft 14 with eight changes (`history.md`, Part H). Three exchanges are brought in, each read as a whole: "The two sides of a leg", "The wrong cMIP" and "What the grammar is for". The rest is the MOR lead's, as technical wording, following the column "the grammar's (MOR)" of section 9 of Fable's review.

**Two questions.** Fable's review calls two things in this text solutions, which a cMIP could state. Both are kept exactly as draft 14 has them. Whether they stay is his.

1. **The buyer's contest (G11.8).** In plain words: G11.8 says that a buyer who was not delivered to contests the people they bought from first, and not the service those people picked. Fable's point: a contest is a Statement made within the agreement the buyer bought under, and by that alone it reaches that agreement and no other. The rest is a policy about who is blamed first, a verifier computes nothing from it, and a cMIP of kind (K11) could say all of it. *The question:* does G11.8 stay in the grammar, or become a cMIP's? If it goes, the grammar keeps only what it already has: a Statement is made within one agreement.
2. **The condition (G10.7).** In plain words: G10.7 lets a version name one rule under which the rights it offered no longer apply, and gives a verifier an answer of its own for it. Fable's point: G10.6 says these grammar rules do not read rights, and G10.7 then gives a verdict on them; the spot's cMIP (K12) already answers whether a spot takes new people, and could answer whether a filling's rights have stopped. *The question:* does G10.7 stay, with its field `condition` and its answer **no longer applies**, or does that answer become the spot's cMIP's?

**A proposal, not a decision: what a fork removes, and two joins (P9).** Nothing below is in the grammar rules. It is the least reading Claude can find that follows from two things already in the text: what others relied on stands (G12.5), and nothing counts until all have signed (G4.10). It is for the MOR lead and for Nobody, allegedly, to take, change or refuse.

3. **What a fork removes.** In plain words: someone signs two acts that each claim to be their next one. The text answers "fork" and does not say what that takes away. So it does not say whether a person could fork on purpose to make their own signature stop counting. *Proposed:* a fork takes nothing away from what its signer signed. Both acts are theirs. It takes away only the answers that would need a choice between the two branches.
   - (a) A fork is answered for the two acts and for what follows each of them: the branches (G12.1). That signer's acts before the shared act are in no branch, and are read as they were.
   - (b) While the fork stands, every act in either branch still binds its own signer (G5.1(a)), and is counted wherever these grammar rules count it, shown with the fork. An assent in a branch is still counted by G4.1. So nobody makes their own assent uncountable by forking.
   - (c) What is answered **fork**, and nothing else, is whatever needs the one act that follows the shared act: which act is that signer's latest, and which of two statements that contradict each other is theirs.
   - (d) Where a join drops a branch that holds an assent, Terms that came into force counting that assent stay in force: Terms stop only by replacement (G4.9). What others relied on in that branch stands, shown as disputed (G12.5).

   *The reasoning.* Until Terms are in force, a signer already has a way to take an assent back: the counter signature (G4.10). A fork must not be a second, hidden way, and need not be one. Once Terms are in force, the others have relied on that assent, and what others relied on stands. And a person is bound by what they signed in their own name (G5.1(a)): signing a second story does not unsign the first. *What it costs:* a signer who forks honestly (a lost device) is bound by both branches until a join; they did sign both.
4. **Two joins.** In plain words: a fork of Terms is ended by a join, signed by those who could have replaced the Terms. Where the Terms let fewer than all replace them, two different groups can each sign a join. The text says "A join is not a branch" and has no word for two joins. *Proposed:* two joins of the same fork, each carrying the signatures G12.3 asks for, are two acts that each count as the next act after the same shared act. By G12.1's own words that is a fork. "A join is not a branch" is then read as: not a branch of the fork it names. Neither join ends the first fork while the other stands. The Terms before the fork stay in force (G4.7). The fork of joins ends as any fork does: by a join that names both, signed in the same way, or under a power given in advance (G12.4). What others relied on, in a branch either join continued, stands, shown as disputed (G12.5).

   *The reasoning.* It adds no word and no grammar rule: G12.1 already defines a fork as two acts that each count as the next. A join that could be undone by a rival join, with a verifier picking one, would break "shown, never chosen". *What it costs, and it is larger than one sentence:* under a power that lets fewer than all replace Terms, any group able to use that power can hold the agreement where it was, by signing a rival replacement and then a rival join. A fork is then a veto. The way out can be said in the language: a power to sign the join whose rule accepts only the one join it computes from the acts and the place (G12.4). That is a cMIP's.

**Where the ledger's arrived-at lines, and the brief, say more than the exchanges.** The arrived-at lines are the MOR lead's readings, marked "to check". Draft 15 follows the exchange where the two differ. The full list is in `history.md` (section H.3); the ones that change what a rule says:

5. **"a collective signature, under the power x gave".** His words: "The delegate signs for the agreement, isn’t that a collective signature of sorts? I sign this agreement y under agreement x, parties are at agreement x, I sign on their behalf." It is a question, and "of sorts". Asked whether the gap is closed: "I think it is. And if it isn’t a cMIP closes it." Draft 15 writes the signature as a grammar rule (G1.2) because the brief asks for it. If "I think it is" is a leaning, G1.2 rests on a leaning.
6. **"it binds x's parties as x's Terms say".** Not in his words; it is the brief's, as the MOR lead's wording. His words say "I sign on their behalf". Draft 15 writes the binding through G5.1(b), which was already there: nobody is bound except through Terms they signed that give the power.
7. **"each member may also inform the agreement she is under".** His words: "each member also has to inform the agreement it is under that it got paid, no?" He said "has to", as a question. The line says "may". Draft 15 writes no grammar rule for it: it is that agreement's own Terms' to call for (section 5.2).
8. **"the grammar gives no default for a party's own part or its own leaving, and is not meant to".** His words in "What the grammar is for" do not mention leaving, or defaults. They say the cMIP builds what is needed, and "the core just want to get the answer, allowed to edit this task or not." The line is the answer to Fable's question, which he confirmed as a whole ("Yes, that’s me."). Draft 15 changes no grammar rule for it. It answers P15, and adds two rows to section 5.2.
9. **"allowed to edit this task or not".** His word is "task": a part of an agreement that a power may or may not reach. G5.2 says "the version in force and the proposed version", which is Fable's and the brief's wording for what the rule must be given so that it can tell which part changed.
10. **"Which lines of a report each side receives is the task's cMIP's".** The exchange "The wrong cMIP" is about a band that is not counted when a song's Terms change. It does not mention reports. The brief applies its principle ("you did not use the right cMIP then") to report lines. Draft 15 follows the brief (G11.3) and marks it here.
11. **"Invalid".** Of two replacements each signed by two of three parties he said (quoted under rule 4 in draft 14, and under G4 in `reasons-15.md`): "Both term 2a and 2b are invalid as they do not carry the required signatures that were in term 1." Draft 14 kept "invalid" for it, and Fable's review found that the text's own definition then made it "not shown". Draft 15 draws one line (section 2) and answers **not shown** (G4.8). The effect is the same: such a replacement replaces nothing. If his "invalid" was meant as the answer's name, the line moves.

### 8.3 Left as draft 14 has it

Each item is where one of draft 15's changes touches something the exchanges do not cover. Each is left as draft 14 has it, or says the least that lets the text be read, and says so.

**How an agreement signs (G1.2).**

1. **An agreement whose Terms give no power.** The exchange is about a delegate. For an agreement with no delegate and no vote, draft 14 says it signs by "every one of its signers", from his "signed by all". By which acts each of them signs is still not said (P17).
2. **A signature under other Terms.** G1.2 asks that `under` name Terms of the agreement itself. Whether an agent named in a separate delegation, which the agreement signed, also makes the agreement's signature is a power through a power (P2), and is not said.
3. **What the parties are bound to.** "As x's Terms say": how wide a power must be for an assent to another agreement to bind every party is that power's rule's. A party of x that is itself an agreement, and did not sign x, is not bound: one level.
4. **Taking it back.** Whether an agreement can make a counter signature (G4.10) is as draft 14 has it: not said.

**The two sides of a leg (G11.1).**

5. **A member who tells her own agreement.** Left to that agreement's Terms (section 8.2, item 7).
6. **A receiving side that signed nothing.** The exchange: the gap "is real", and "a cMIP closes it". What such a cMIP is, is not said, as for every data cMIP.
7. **What a doer's report carries.** K8's row is unchanged. It still asks one report for everything passed on. Which of its lines reach which side is now the task's cMIP's (G11.3); how one signed report is shown in part is not said, and may be the block's (section 8.1).
8. **"the choice of cMIP stands on the leg".** His earlier words, from when a leg was read as one agreement of a sequence. A leg is now one obligation between two sides, carried out under one agreement's Terms, so the choice still stands on the leg (G11.1). That is Claude's reading of the two together.
9. **The contest.** The ledger's line says a contest "goes leg by leg". With "leg" meaning one thing, G11.8 says "one agreement at a time". The clause is otherwise unchanged.

**The seam with the block (G11.7).**

10. **"By default".** Whether a payer can state that no confirmation is called for is not said; it would be the payment's to carry, in the layer that holds value (section 8.1).
11. **The block is not changed.** What it would need is in section 8.1. Until it says so, G11.7 and R2 still disagree on paper.

**Receivers that point onward (G1.4, G11.6; P8).**

12. **Inside one leg.** A work names its deal as receiver, and the deal names the service: G1.4 must read through one agreement to find who receives. Draft 14 read one step and did not say what follows. Draft 15 reads on until a party is reached, sets no limit, and answers **not shown** where an agreement is met twice. That is Claude's least reading, for the MOR lead to confirm.
13. **Which version of the agreements pointed through.** A payment names the version of the work it read. For an agreement that version's receiver points to, G1.4 reads the version the act names, if it names one, and otherwise its Terms in force.

**Words (section 2).**

14. **"Rule".** The ledger, the block and the exchanges use "rule" in both senses. The brief itself writes "rule 11.8" and "a power's rule". This text writes G11.8, and keeps "rule" for the people's own.
15. **"Succession"**, **"receiver for an act"**, **"receiving side"**, **"applies"** and **"own line"** are Claude's choices, as technical wording, for the MOR lead to change.

**From Fable's review, and not in its section 9 table.** Left untouched, and listed so that they are not lost:

16. G4.10 reads "until every party has signed" as "until those Terms are in force"; where Terms come into force on fewer signatures, the two differ (its section 3, item 9).
17. G4.1 counts "every party named as a signer"; G4.8 asks for "every party bound by them". Someone who filled a spot and assented is bound and is not named as a signer (item 10).
18. Whether Terms hold the Control task is decided, in G11.2, by whether they "give a part to any other party". Shares have no form in the grammar, and the text does not say that the answer is unchecked without the body's cMIP (item 11).
19. No grammar rule makes anything be shown to anyone. G11.4(e) is an answer a verifier gives when asked; what a person is shown before paying or signing is a client's (item 12; section 5.2).
20. An act an agent makes after their delegation was replaced is read "as shown" where the Terms name no place (G5.4). That is not among the stated costs (its section 4).
21. "The payer pays the work and needs to know nothing else" overstates: a payer who fills a spot is recognised only through that spot's cMIP (its section 1). The sentence is in `reasons-15.md`, unchanged.

**The rest.**

22. **What a data cMIP is**, which task it answers, and how Terms name one: not said, as before.
23. **Nothing was tested.** No test was run against draft 15.

### 8.4 Still open from earlier drafts

The lists of open questions of drafts 3 to 14 are kept, unchanged, in `history.md` (its sections 9.3 to 9.13 for drafts 3 to 9, D.4 for draft 10, E.4 for draft 11, F.5 for draft 12, G.4 for draft 13, and H.5 for draft 14), with what each later draft answered. The ones a reader of this text meets directly:

From draft 14's list:

- "only", after "by default": whether "Leg by leg only." means that no further path should exist at all (G11.6(a); item 8);
- "where that side receives", and where a buyer receives (G11.6; item 10);
- whether a call that a leg's people signed could name a reader (G11.6; items 11 and 12);
- reading across legs: whether it should leave the grammar altogether, for data cMIPs (G11.4; item 14);
- whose signature a path for data needs (G11.6(a); item 16);
- data that is not a report: Terms and their calls, what a payer learns of a work, standing (item 20);
- what is still "Agreements only" (G11.6(c); items 1 and 21).

From draft 13's list:

- the buyer's leg: whose leg it is, may or must, who confirms, and what access is (G11.7; items 1 to 3 and 5); a confirmation with no call written is now read as the payer's call, made by default (G11.7; section 8.1);
- whether seeing one's own leg is enough for the wish (item 7);
- the contest: a leaning ("maybe"); what a contest is and does; who is contested "at first"; whether a service contests further; what "only" rules out (G11.8; items 8 to 14);
- an outvoted member: "at inception", what the cMIP decides, and how wide a majority rule must be (G11.6(b); items 16 to 18);
- one level, and someone who fills a role (P17; item 19);
- by which act a holder's own part is named (P20; item 20);
- what a data cMIP is (G11.6(a); item 22).

From draft 12's list:

- which deal is meant where a service pays people who signed nothing with it (item 1); by which acts a work's signing is shown is answered for a signature under a power (G1.2), and open for a work that signs by all its owners (P17; item 5);
- pointed at, or signing: nothing in the grammar tells a party that must sign from one that is only pointed at (P17; item 4);
- "the report about the payment only comes from the receiver", read as: of the work's people (G11.2; item 6);
- may, or must: whether a leg in which someone holds for others must report (G11.5; item 8);
- a work with no service that holds the Control task (G11.2; item 9);
- a receiving side's "automatic" report (P20; item 10);
- what "one leg" covers, and "not shown" for a reader beyond the leg (G11.6, G11.4(d); items 12 and 13);
- what a data cMIP focused on agreements is, and which task it answers (G11.6(a); item 14);
- "the grammar to support it should be there, in agreements only", and requests from further upstream (items 16 to 18);
- the link by a shared act, amounts, and kept-or-owed are the MOR lead's proposals, still to check (item 19).

From draft 11's list:

- the report block is a proposal of the MOR lead, in no spec; G11 and K8's row follow it if it changes (item 1);
- the field `calls`, and where a call sits (item 3);
- who the doer and the receiving side are for K8 (item 5);
- what "match" means for K8, and whether two honest reports can state different amounts for one settlement (P20; item 7);
- what lies beyond a silent leg (G11.4(d); item 8);
- a leg report readable without the leg's cMIP (G11.3; item 9);
- whether money shown as still owed is later shown as paid (item 10);
- whether reports that do not agree are a fork (item 11);
- pools (P6; item 12);
- whether a baker's succession calls for reports (P18; item 13);
- whether a report is a Statement of this text, and stands in its signer's line (item 14).

From draft 10's list:

- whether "a payment is divided by the version it was made under" should itself stand in the grammar, for every leg whatever its cMIP (G10.6, G13.1, G13.2; item 1);
- a work that names a service's public offer, and not its own deal, as its receiver is not stopped by the grammar (G1; item 2);
- the agreed witness is no longer required by the grammar (section 5.1; cost "Counted attention leans on whoever counts"; item 8);
- how a new version says that a spot takes no new identities, and whether a role's cMIP takes parameters (G10.5; item 9);
- one condition, and whether it sits on the version or on the role (P21; item 10);
- how a join signed under a power sits in another signer's line (G6.1, G12.4; item 11);
- G11 is a newer grammar rule under an older number (item 13).

From drafts 3 to 9:

- an agreement as a party that signs: settled in part in draft 12 (G1.2), in draft 13 for the level at which it signs, and in draft 15 for its signature under a power; what is still not said is P17 (`history.md`, section 9.13, item 1);
- whether "once all parties have signed" means "once the Terms are in force" where Terms come into force on fewer signatures than everyone's (G4.10; section 9.13, item 2);
- whether "no limit" on signed conditions holds beyond ending a delegation (G5.5; section 9.13, item 5);
- whether rights that stopped can apply again within the same signed condition, with no new version (G10.7; section 9.13, item 6);
- who must sign a renewed offer (G10.7; section 9.13, item 8);
- "I lean a.": the delegator's default rests on a leaning (G5.5; section 9.11, item 5).
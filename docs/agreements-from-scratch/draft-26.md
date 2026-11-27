# Agreements, draft 26

Agreements draft 26, written from draft 25 and the ledger; not merged; the text to be hashed is the whole file once §4 to §7 are written.

---

## 0. Introduction

**Agreements is not to be used bare.**

It is not one unified way of agreeing. It offers the basic sockets from which rule books are drafted: more a language, used to decide how to agree, than a set of rules for agreeing. The rules people agree by are written in the cMIPs built on it.

Among what it offers is the keeper: the way the drafters of an agreement agree on where the agreement is kept.

Knots are a concept of all of MOR, not of Agreements alone. Their importance in agreements is taken up where this text treats relying on acts.

---

## 1. Purpose

Agreements is a grammar: the acts in which agreeing is written (Terms and Statement); the grammar rules by which a verifier decides, from acts alone, **who is bound by which Terms, and what is shown, unknown or contradicted**; and the tasks that cMIPs fill so that people can agree on anything, by rules they choose. Its central idea is that an agreement can be a party to another agreement (§5.1): works, services, deals and collectives are built with it, and none is a separate thing in the grammar. Agreements does not decide what anyone must agree, and it does not decide whether anything happened in the world: it records who said so. It does not define how words are fixed, how signatures work, how acts travel, how a shared order is kept, or how value is held; it names those operations (State, Sign, Deliver, Order, Control) where it needs them.

**One constraint on everything below.** Every grammar rule is checked from copies of acts alone, plus the answers of the keepers the Terms name, where §5.8 applies. No grammar rule needs a particular server, platform or software author to remain. What an act fixes must still be there and unaltered when needed, and an outsider holding copies must be able to test it: Agreements relies on both and adds no grammar rule for them.

---

## 2. Dependencies

This text reads six others, each in its current draft.

- **Identity, draft 16.** The signer: an identity, not one key; its keys and their rotation; a key change continues the signer's line and never starts a fresh one. The witness act (rule 10), by which one identity relies on another's act; acts left out or disowned by a key change, and those kept because another relied on them (rule 34).
- **Text, draft 11.** The text act (rule 14), which carries the words of Terms.
- **Envelopes, draft 12.** The act: its outside, its inside, its signature, its act id; `prev`, the signer's line across all their acts; sequences, chains and forks of chains; relays. The bake, the envelope and the envelope's chain, which Terms may name, and where the rules for the baker's rights are written.
- **Money, draft 14.** The payment, and the settlement that proves it (its settlement receipt).
- **Development, draft 12.** How a cMIP or a Module is named, by its spec hash; tasks, and one cMIP per task.
- **The MICS.** MOR's shared language: the report block, and the rules on how any reader answers (say who said it; unchecked is not passed; how an answer is qualified), which this text applies and does not state. The MICS's current version, 37, was written for an earlier text of Agreements; the rules this text leaves to the MICS are listed in §8, as the earlier text had them, for the version written after this one.

---

## 3. Definitions

Each word here means one thing throughout this text. Where a word is defined in another text and only used here, that is said.

### 3.1 The acts and their parts

- **Act**: a signed statement in the core's sense. Published or signed again, never updated. The fields the core gives every act (who signed, the signature, the act's own fingerprint) are not repeated here.
- **Fingerprint**: the identifier the core gives to fixed bytes. "Named by fingerprint" means referred to by that identifier and nothing else. An act's own fingerprint is its **act id**.
- **Grammar rule**: one of the validity rules of §5. It says how acts are read. It never says what people must agree. Always called a grammar rule; the word "rule" alone is never used for one.
- **Task**, or **socket**: a field of an act where a cMIP plugs in and answers one question. One cMIP per socket, with as many modules as it needs; one cMIP may fill several sockets. Every field of an act that names a cMIP is a task, and nothing else is. A task says its one question, what the cMIP in it accepts, what it produces, and whom it makes you trust. The eight tasks are K1 to K8 (§6). The same question asked in two fields is two tasks: the rule in `in_force` and the rule of a power are not one task. These grammar rules take a task's output and use it where they need it; they never compute it themselves. A socket holds at most one cMIP, with its parameters. A socket left empty has the default these grammar rules give it, where they give one, and otherwise asks nothing.
- **Module**: a part a cMIP uses to give its answer: a rule that computes, a witness, a judge, a teller and the like (§6). A cMIP may use several. A module is not a task: no field of an act names it; the cMIP in a socket does.
- **cMIP**: a document, named by fingerprint, that fills a socket: it answers that task's question, for some kind of thing or situation. Anyone may write one. Many cMIPs may fit the same socket in different ways (one for land, another for shares). One cMIP may fill several sockets, of one act or of many; it is then asked each socket's question apart. Choosing a cMIP is how people choose their own rules.
- **Rule**: a cMIP, or a module of one, that computes: named by fingerprint, with its parameters; the same output for the same inputs, for anyone. It is the people's own rule. The word alone always means this, and never a grammar rule. It computes; it trusts nobody. A rule is not a task: it sits in a socket (`in_force`, a power, `condition`), or is a module of the cMIP that does (§6).
- **Terms**: an act that states what is agreed, signed by its author. Always capitalised and singular ("a Terms act", "these Terms"). Terms are the record of an agreement; stating Terms is not agreeing to them.
- **Agreement**: the first Terms act together with every Terms act that replaces it, directly or through others, and every Statement made within them. Its identifier is the fingerprint of the first Terms act (the **root**). Its Terms acts are its record; what binds is the agreement, as §5.4 to §5.6 and §5.10 say.
- **Statement**: any other act made within an agreement. Its **kind** says what it is (task K7). Four kinds are defined here: **assent**, **counter signature**, **contest** and **resolve**, the last a resolving update in its signer's own line and nothing more (§4.3, §5.12).
- **Assent**: a Statement by which its signer agrees to one Terms act.
- **Counter signature**: a Statement by which an earlier assent to one Terms act is cancelled: its signer's own, or one made in the same party's name. It is available only for as long as §5.4 allows. It sets nothing aside: the assent it cancels stays an act, readable, shown as cancelled (§5.6).
- **Signature of an agreement**: an act made in an agreement's name, under a power its own Terms give (§5.1). An act signed so is signed by that agreement.
- **The words** (of Terms): the text act, public or private, that carries what Terms say in words, and that the Terms name, in `body`, by its act id. The words are an act of the Text layer, made before the Terms that name them (§5.2). The grammar does not read them; the body's cMIP does (task K1).
- **The set of acts**: one value that names a set of acts: computed from their act ids, sorted, with repeats dropped, hashed with a label for a set of acts (§4.1). The same acts give the same value, whoever writes it. It says nothing of whether the set is complete, what it means, or when it was read. The empty set has the label and no members. The value names no act a verifier can read without the list it was computed from, so it is no knot by itself.
- **Report**, **call**: words of MOR's shared language, whose block is the MICS's (§2); used here, not defined. In short: a task may carry a **call** for a report, or not; the call says whether a report is wanted and from whom; only the signers of the act that holds the task can make it. A call names no place and no reader: the where is implied by the leg. A **report** is a signed act that answers a call: it carries the call it answers, the acts it relied on, and its signer. Anything more is the task's to say. A report goes to the other side of its own leg, where that side receives, and no further, in every layer (the MICS). A report is data: any other path for it is one people agreed to, with their signature, by naming a data cMIP in Terms they signed (§5.11; task K8).
- **Leg report**: a report that answers a call carried by Terms that hold the Control task (K6), about the legs carried out under those Terms (§5.11). What it carries beyond what every report carries is in K6's row (§6).
- **Payment**: an act of the layer that holds value (Money), signed by the payer, which names the version it read (§5.13). It carries out what the offer's Terms the buyer signed require of the buyer (§5.11). It holds the task of paying, and by default carries the payer's call for the receiving side's confirmation (§5.11). This text gives it no fields.
- **Settlement**: the signed evidence, from the layer that holds value (Control; the Money layer), that a payment was made. Agreements names it and does not define it. The Statement field `settlement` is where it plugs in (§5.9). That field names an act and no cMIP, so it is not a task.
- **Vow**: the same thing as an offer, without bytes attached. This text gives the word no more meaning than that. These grammar rules read a contest made against a vow exactly as one made against an offer, so no answer of a verifier turns on which of the two an agreement is.
- **Contest**: an act of the grammar: a Statement of kind `contest`, made against an offer or a vow (§5.11). It reaches the signers of what it is made against. A **buyer's contest** is a contest by which a buyer says that what they bought was not delivered after payment.
- **Data cMIP**: the cMIP that Terms name in the field `data` (task K8): a path, beyond one leg, for the reports of the people bound by those Terms, which they agreed to with their signature (§5.11).

### 3.2 Parties

- **Party**: one named in Terms. Named in one of three ways:
  - as a **signer**: a person, by the identifier the Sign layer gives them (an identity, not one key: Identity);
  - as a **role**: a spot for someone not yet known, linked to a signer later (§5.10);
  - as an **agreement**: another agreement, by its root (§5.1).

  Signers, and signers who fill a role, are the parties who may be bound. An agreement named as a party need not sign to be named, and where it has not signed it is not bound. Where it signs, it signs by its own signature, as its own Terms require: one level (§5.1). That signature binds its parties as its own Terms say.
- **Author**: a party whose words the Terms are, and who signs them. An author is named as a signer or as an agreement, never by role, and is a known party (§5.3).
- **Known party**: a party the Terms name, when they are made, as a signer or as an agreement: never one who takes part through a role. The author is one. The known parties are those who have a say in the agreement's updates, and, by default, those who sign them (§5.5).
- **Unknown party**: said of the holder of a filling: a signer who takes part through a role, and so was not known when the Terms that name that role were made. Any filling of a role is an unknown party's, whenever it was made. An unknown party has no say in the agreement's updates, and no update reaches their filling, which the version its proof names governs (§5.10).
- **Spot**: a role's place among the parties, before and after it is filled. It has a **kind**: **done**, **received**, **holding**, **fits** or **future** (§5.10). Whether it still takes new identities is said by its cMIP, from the version in force (§5.10).
- **Fill**, **filling**: a spot is filled when the cMIP its role names (task K5) says that a signer is linked to it by a proof: the acts that earn it. A **filling** is one such link, tied to the proof that earned it and to the version that proof names. A spot may be filled many times; whether it holds one filling or many is its cMIP's (§5.10).
- **Rights**: what a version offers whoever earns a filling under it, with every condition that version puts on it. The grammar does not say what they are, or read them (§5.10).
- **Receiver**: whoever Terms name, in the field `receiver`, as receiving on the agreement's behalf: an identity (one of the agreement's own parties) or another agreement, by its root (§5.1). The word means that field's value and nothing else; the side of a leg that receives is the receiving side.
- **Receiver for an act**: the receiver named by the version of an agreement which that act names, followed through any agreement it names until one of an agreement's own parties is reached (§5.1).
- **Work**: an agreement whose Terms say who owns something and in what shares. A plain word for a use of the grammar, not a separate thing in it: every grammar rule reads a work as it reads any agreement.
- **Shares**: what an agreement's Terms say each party's part is. The grammar gives them no form: they are read from the Terms' words, as the body's cMIP gives them (task K1), and divided by whichever cMIP needs them (a power's, K3; the one that passes on, K6). No socket is kept for a dividing rule alone. An agreement with shares defines as much or as little of how it governs itself as it chooses (powers, §5.6); the grammar has no separate notion of a collective.
- **Service**, **deal**: a service is a signer who does a job for an agreement (dividing what it is paid, holding a payment); a hand (task K6). Its deal is an agreement between the service and the agreement it serves, named as a party. A deal is signed on both sides: by the service, and by the agreement it serves, as that agreement's own Terms require (§5.1). Plain words for a use of the grammar, as "work" is: what makes an agreement a deal, and what is read from it, are the service's cMIP's (§6).
- **Bound**: a person is bound by an act when §5.6 says so.
- **Power**: an entry in Terms saying that a Statement of a given kind, or a resolving update, binds the parties when a given rule says yes. A power is for acting under the Terms as they are. No power makes a Terms act replace Terms (§5.6).
- **Constitution**, **executive**, **judicial**: three words for three things these grammar rules keep apart: how the Terms may change (the update condition), who may act under them (the powers), and what the Terms set for a dispute (the contest, a judge they name, a power to resolve a fork). They are said once, in §5.6, and nowhere else.
- **Buyer**: a signer of an offer's Terms, whose identity was not known when the offer's maker drafted and signed them, and whom those Terms require to pay. A buyer signs by an assent to the version they buy under, as anyone fills a spot and is bound by their own assent (§5.10, §5.6). Elsewhere in this text, where only the paying matters, the same person is called the payer. Paying is a leg, with the buyer as its doer (§5.11).
- **Offer**: an agreement with a participant unknown at the time of signing: one whose Terms name a party by role (a spot, §5.10), so that who takes part was not known when the Terms were signed.

### 3.3 Versions, updates and forks

- **Version**: one Terms act of an agreement. The first is the root; each later one replaces the one before (§5.5). **The original**, said of an update, is the version that update would replace. The **last version** is the one in force (§5.5; while a fork of Terms stands, the one both branches replace, §5.12). One version of an agreement is in force at a time. A version that is no longer in force may still govern a filling earned under it (§5.10).
- **Chain**: the versions of one agreement, each replacing the one before: one agreement's own history. The word is used here for nothing else: not for one signer's acts (a line), and not for anything that links one agreement to another. One use of the word is not this text's: **the envelope's chain** is the layer below's (Envelopes), named here, not defined.
- **Sequence**: agreements linked to one another, so that what one gives or owes reaches the next: a payment passing from a work to the works it stands on (§5.11). Never called a chain. The word is used for nothing else.
- **Succession**: not a term of this text. The rights of a baker (Envelopes' word) pass by transfers in the envelope's chain (Envelopes), and no agreement passes them.
- **Leg**: one obligation carried out, between two sides: whoever carries it out, and whoever receives it (§5.11). A payment to a work is a leg between the payer and the work's receiver. A payout divided among five is five legs, each between whoever pays out and one of the five. A leg is never an agreement: an agreement of a sequence is called that.
- **Doer**, **receiving side**: the two sides of a leg. The doer carries out the obligation. The receiving side receives it; where what is owed is owed to an agreement, the receiving side is that agreement's receiver for the act (§5.1). These grammar rules define the two sides and nothing more: which lines of a report each side receives is the task's cMIP's (§5.11).
- **Line**: acts of which each names the one before it: one signer's acts within an agreement, by `previous` (§5.7); an agreement's Terms, by `replaces` (§5.5), which is its chain; and any other acts the grammar reads that way (§5.12). A signer's acts across their whole life, by `prev`, are the layer below's (Envelopes, Identity); this text reads them and does not define them.
- **Update**: an act that names another act of a line as the one before it, and that carries the signatures that line asks of it: for an agreement's chain, those the update condition of the version it names accepts (the gate, §5.5); for one signer's line, that signer's (§5.7). An update of Terms replaces the version it names only as §5.5 says. A late update (below) is no update of the version it names. No act is ever changed: an update is a new act that follows an earlier one (see **Act**). A **proposed update** of Terms is a Terms act that names a version in `replaces`, taken as its bytes, whether or not it yet has the signatures it needs (§5.5).
- **Gate**: the first of the two checks an update of Terms passes: the update condition of the version it names, or its default where that version names none, answers **valid** (§5.5). No other assent is asked.
- **Pin**: the second check: an order is shown. For an update, its order after the last replacement of the version it names; for a first version, the order of the signatures that put it in force. The order is shown by the keepers the Terms name, or by knots (**shown after**) (§5.4, §5.5).
- **Valid**, **not valid**: said of a proposed update, and of nothing else in this text: the output of the task `condition` (K4), or of its default where the socket is empty (§5.5). **Valid** is the gate's answer only: the update is allowed. It does not say the update is in force. Always given with that condition named beside it, or with the words "by default", and with the ground the cMIP gives. It is the whole answer about whether the update is allowed, who must sign it included: no power is read beside it (§5.5, §5.6). The core's "valid" has the same spelling and another meaning: there it is said of an act, where a rule the verifier can apply is seen to pass. This text never says "valid" of an act; of an act it says that it counts, or that it is shown. **Not valid** is a cMIP's answer about an update; it may rest on a time or on the acts held, and it is qualified as they are. **Invalid** is this text's answer for an act that itself shows it cannot count (3.6). The two are kept apart.
- **In force**: said of Terms only. An update is in force where it passes both checks: valid (the gate), and its order shown (the pin) (§5.5). A first version is in force where it has come into force as §5.4 says, and the order of the signatures that put it in force is shown (the pin, §5.4). An update can be valid and not in force: allowed, with its order not shown.
- **Fork**: two acts competing to change the same state, with no order shown between them: two updates of the same act of one line (two Terms acts each replacing the same version; two acts of one signer naming the same act as the one before), Terms coming into force against a counter signature that cancels one of the assents they need, or any other such pair (§5.12). Three or more such acts are one fork, with that many tips. It is seen from the acts, not from what any person meant. Neither takes effect, and the earlier state stays, until the fork is resolved (§5.12). Where the fork is of a line, the act both follow is the **shared act**; each of the competing updates is a **tip**; a tip, with what follows it in the line, is a **branch**. "Fork" is also a verifier's answer.
- **Late update**, **late**: a Terms act whose `replaces` names a version that had already been replaced, and that is shown after the version that replaced it (§5.5). It replaces nothing and is no tip of a fork. Where nothing shows the order of the two, it is no late update: they are a fork. "Late" is also a verifier's answer.
- **Never ended**: an agreement never ends. It only gets new versions, each by an update that replaces the one before (§5.5), and goes on as its last version. This text has no defined term for ending.
- **Apply**, **no longer applies**: plain words, and not an answer of a verifier. A filling, and the rights it holds, apply from when the filling is earned. They last as long as the words of the version the filling was earned under say, counted on the clock the Terms name, as the cMIP that reads those words answers; and they change only as §5.10 says. No update ends them. These grammar rules do not read what the rights are: a verifier shows the cMIP's answer, and gives none of its own (§5.10).
- **Resolve**, **resolving update**: a fork is resolved by a new act, made in an order that can be told, that the agreement's own update condition answers valid or that a power to resolve, given in advance, allows (§5.12). For a fork of a line, that act is a **resolving update**: an update of the shared act, signed as an update of that act must be, that names every tip and says which one continues. "Resolve" is said of forks only.
- **Set aside**: a tip is set aside when a resolving update continues another tip. It never counted as the next act of its line: for Terms, it never counted as the next version (§5.12).
- **Built on a tip**: an act is built on a tip when it follows the tip in its line, or rests on the tip or on an act built on it: it names it, in `terms`, `under`, `answers` or `relies_on`, or was made within or under Terms of that branch. The words reach as far as the naming goes: an act that names an act built on a tip is itself built on that tip, however many namings lie between (§5.12). One thing is kept apart: an assent to a tip counts for whether that tip was signed, and for nothing else (§5.12).
- **Condition**: short for **update condition**. It is the cMIP that a version names, by fingerprint, in the one field `condition`: the task K4. It answers whether the agreement can be updated or not: given the version in force and a proposed update, **valid** or **not valid** (§5.5). Which updates are valid, who must sign them included, and why, is that cMIP's to specify; where the field is empty, the default asks for the signatures of the known parties (§5.5). Nothing else decides whether an update is allowed. It is never asked about a filling: no update reaches one (§5.10). Nothing triggers. The plain word "conditions", said of what a version's words put on rights (§5.10), on a role (§5.10) or on what becomes of a work (§5.5), means those words, read where their version's cMIP puts them, and not this.

### 3.4 Order and time

- **Name** (or **cite**): an act names another act, or a version, when it carries its fingerprint in one of its fields. What an act names is what it is read against (§5.13).
- **Knot**: each such naming: the order acts give by naming one another. Knots cross acts and layers: any fingerprint of an act, carried in a field of any act the verifier holds, is a knot, whatever layer either act belongs to, the field `body` included. A verifier reads knots in fields, never in an act's content (§5.13).
- **Shown after**: act B is shown after act A when the verifier holds a chain of acts, each naming the one before by fingerprint, from B back to A, or a keeper's record or an anchoring that places them so. It proves that B came after A, and nothing more: never that an act came before one that does not name it, and never that an act does not exist. Where an act such a chain needs is named and not held, the answer is unchecked (§5.13).
- **Keeper**: a relay that Terms name, in their keeper field, as the agreement's official relay: the way the drafters of an agreement agree on where it is kept. A keeper relays the agreement's acts as any relay does, and vouches for the chaining only: which of them came after which. It never vouches for an act's validity, which every verifier checks for itself. Copies of the acts may be lodged at any relay; only the order given by the keepers the Terms name counts for the agreement. Terms may name one keeper or several (§5.8). A keeper is named by an identifier and is not a cMIP, so the keeper field is not a task.
- **Clock**: what an agreement's Terms name as saying what time it was for that agreement (§5.8). What a clock is, is not this text's.
- **Anchoring**: whatever a reader accepts as saying that nothing is later than an act, or what time it was. A keeper the Terms name is an anchoring, for the order of the agreement's acts; the clock they name is one, for what time it was. The keepers and the clock an agreement's Terms name are the ones every reader uses for that agreement's own answers (§5.8). An anchoring of a reader's own choosing gives an answer only as that reader's, named so; it never gives the Terms' own answer (§5.13). A condition in time needs an anchoring the Terms state (§5.8).

### 3.5 What relays do

These three verbs are MOR's, for every layer, one for each actor; this text uses them as defined here. Bytes that sit at a relay while nobody acts are **stored** there.

- **Lodge**: whoever puts an act at a relay (an uploader) lodges it there.
- **Relay**: a relay relays an act: it takes it in and passes it on, reading nothing and vouching for nothing. A keeper is a relay that, besides relaying, vouches for the order of one agreement's acts, because the Terms name it (3.4).
- **Fetch**: a client fetches an act from a relay.

### 3.6 The verifier and its answers

- **Client**: the software through which a person reads acts and signs them. A client is not a verifier, and what a client shows a person is not an act. One duty is written for clients, in one place (§5.12).
- **Verifier**: whoever applies these grammar rules to a set of acts. A verifier answers questions; it does not decide disputes.
- **Answers**: a verifier's answer is one of: **shown**, **not shown**, **unchecked**, **invalid** (below); and **valid** or **not valid** (of a proposed update), **in force** (of Terms), **fork** (of competing acts) and **late** (of a Terms act) (3.3). A verifier names the grammar rule with the answer, and states its reason.

  Answers about what is latest, what else exists, or what time it was, carry a qualifier: **per anchoring**, with the anchoring named (§5.13), written **per keeper** where the anchoring is a keeper the Terms name and **per clock** where it is the clock they name; or **as shown** (meaning: among the acts this verifier happens to hold). An answer that rests on what someone relied on in the branch of a tip set aside also carries the qualifier **disputed** (below).

  Of reports, a verifier also shows what the MICS's report block asks it to show, in that block's words, which are not answers of this text.

  *Not an Agreements act.* An act that lacks a required field, or carries a field that §4 allows only beside another (as `continues` beside `resolves`) without it, or carries a field §4 does not give, or one §4 says it does not carry (a resolving update's `parties`, `authors` or `body`; `resolves` on a Statement of another kind than `resolve`), or holds in a field something other than that field's kind (a fingerprint where §4 says fingerprint), or bytes that cannot be read as an act, never reach these grammar rules: §4 says which. This text gives them no answer.

  *A task's output.* Where a task answers yes or no (K2, K3, K6, K8, and whether a spot still takes new identities, K5), a verifier passes that output on as the task's, with the cMIP named and the ground or cause it gives, and not as an answer of this text; where it lacks the cMIP, the answer is **unchecked**.
- **Shown**: the acts held establish it under these grammar rules.
- **Not shown**: the acts held do not establish it. Always given with its reason: among them, that an act not held, and named by none held, might establish it; that there is nothing to resolve; that the keepers the Terms name disagree; that no order is shown.
- **Unchecked**: the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, or an act named in a field that it does not hold. A missing act never becomes a yes, and never a no.
- **Invalid**: an act cannot count as what it claims to be, and the act itself shows it: no act the verifier does not hold could make it count. The cases are those the grammar rules of §5 name invalid, in the order §4 gives, which is the order in which a verifier that names one case names the first it finds. An invalid act counts for nothing, for anything: no answer of these grammar rules rests on it, and no act counts through it. It stays readable as an act, and a verifier shows it, with the answer invalid. If an act the verifier does not hold could change the answer, the answer is never invalid. **Not valid** is not invalid (3.3).
- **Disputed**: the qualifier of an answer that rests on what someone relied on in the branch of a tip set aside (§5.12). It has that one meaning in this text. The core's "disputed" has the same spelling and another condition: there it is shown of an act that its signer's change of key would have made void, and that someone else relied on (Identity, rule 34). Both say that what others relied on stands and is shown so; a verifier that gives both says which one it means.

---

## 4. The data each act carries

Written by a later session.

### 4.1 The kinds of value

Written by a later session.

### 4.2 Terms

Written by a later session.

### 4.3 Statement

Written by a later session.

## 5. Validity rules (the grammar rules)

Written by a later session.

### 5.1 An agreement as a party

Written by a later session.

### 5.2 The words, and what the Terms use

Written by a later session.

### 5.3 Authors

Written by a later session.

### 5.4 The first version, and what an assent binds

Written by a later session.

### 5.5 Updates: the gate and the pin

Written by a later session.

### 5.6 Who is bound

Written by a later session.

### 5.7 A signer's own line

Written by a later session.

### 5.8 The keeper, and the clock

Written by a later session.

### 5.9 The settlement

Written by a later session.

### 5.10 Spots, and the unknown party (the buyer who joins later)

Written by a later session.

### 5.11 Legs of a sequence

Written by a later session.

### 5.12 Forks

Written by a later session.

### 5.13 Knots: what an act names, and "shown after"

Written by a later session.

## 6. Tasks handed to cMIPs

Written by a later session.

## 7. Open technical parameters

Written by a later session.

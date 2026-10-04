# Law draft 10, and the seven rules of the core pass

*3 October 2026. Branch `claude/core-pass-v21` (continued; main merged in first, for F118, F119 and V3, and again for F120 and F121), not merged. Section 5 writes in F120 and F121; section 6 writes in F121's answers, F122 and F123, with main merged in again first; section 7 writes in F124, main merged in a third time; section 8 writes in F125; section 9 writes in F126, main merged in again, and stops at item 2 (flaw W1); section 10 writes in F127, main merged in again first. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved; Law draft 9 stays beside draft 10 until approval. Core v21, freeze suite v21 and one page v6 are revised in place, with no new version numbers.*

## 1. What Law draft 10 changes

`spec/MIP-law-draft-10.md`. Draft 9, made to say what the core pass decided. No rule outside these changes.

**Negotiation messages are Law acts (F118).** *Plain words:* when two people negotiate, each message now is a Law act carrying text, not a text act. Each message names the one before it and says "I received your latest". So the record shows it is complete up to the last message the other side confirmed receiving. A text act slipped into the thread does not count, and cannot carry that "I received" anyway (F110).
*Precisely:* a new act type, 18, the negotiation message: `{ 0 => tstr (canonical text), ? 1 => hash (a text format) }`. The first message names no chain; every later one names `[[thread, previous]]`; its `acks` name only the latest message received from the other side. Rule 56 rewritten: the record is proven complete up to the last message the other side acknowledged; only negotiation messages make it; a message following a text act is not part of it; two messages naming the same previous are a visible fork. *Cost, stated:* a client without Law shows these messages as unknown, so negotiating needs a Law client, as signing the deal already does.

**A split service's receipt can prove a rail Module was used (F119).** *Plain words:* a role share can pay the rail Module a payment went through. The proof is the receipt naming that Module, even when the split service signed the receipt itself. That is allowed because the service cannot pick any Module it likes: the Module has to be one the owners themselves published in their payee pointer or vault.
*Precisely:* rules 19 and 22, the role share's definition and the split's evidence field. Every other role still needs evidence signed by someone other than the service and the payee. A receipt naming a Module the owners never published proves nothing. *Cost, stated:* where the owners' pointer names two Modules for one rail, whoever issues the invoice (here the split service) chooses which one earns; the pointer shows it publicly, and the owners' agreement with the service can limit it.

**The anonymous refund (rule 32, F113).** A refund owed to a payer who stayed anonymous goes to whoever signs with the key that payer put into the payment, never to whoever shows the rail's proof (on Lightning, the payee and every node on the route also hold it). A payment that committed no key can be refunded to nobody.

**Evidence of use comes from a party (F116).** Rules 19, 22 and 28: a "module's signed use record" becomes a record signed by the identity that runs the service. A Module is a text and signs nothing.

**Receipts are Finance acts (F112, F115).** The comments and scenario lines that treated receipts as acts of the payment cMIP now say what the core pass decided: receipts and claims are Finance acts on the rail Modules the payee's pointer or vault names. Adding a rail needs only a new pointer, with no clone of the agreement.

**Plainer wording, meaning unchanged.** Rules 36a and 37a and one reason are reworded (see section 2); one question, J1, is left open. The examples naming particular uses (co-producers of a film, a band, a label, a treasurer) are gone, and roles are named by their lane instead.

**Readings taken while writing, listed at the end of the draft, to confirm.** No flaw in a MIP came up. Five readings were needed:
1. A thread is identified by its first message, as an agreement is by its founding terms.
2. A thread has two sides: whoever signs the first message, and the first other identity to answer. A third signer's message is not part of the record.
3. A message acknowledges only the latest message of the other side.
4. "Complete up to N" means every message on N's chain is held and is a negotiation message of the thread.
5. In rule 22's exception, "the payee" means the identity the payment was made to (the owners), never the split service. F119's own reason ("the service cannot invent one") needs that.

## 2. The seven rules

**The short answer.** Six of the seven could be written plainly, because Law draft 9 already fixes their meaning exactly. The earlier report flagged them because the core's one-line summaries left out what Law says. The seventh, on the judicial tasks, can mostly be written plainly too, but one case turned out to be decided two different ways by two of Law's own rules. That case is written up below as question J1, and I have not chosen between the two.

**How I checked that the meaning is unchanged.** For each rule I wrote the plain version from the Law draft 9 sentences that fix its meaning, listed below. Then an independent reviewer read only Law draft 9 and my new text, and looked for any case where the two would decide differently. The first round found such cases in six of the seven, plus several other sentences of "Areas and lanes". Each one was a detail I had left out: a rotation as well as a record, an exception, what happens where a layer has no lane, and so on. I fixed them all. A second round found four smaller gaps, also fixed now. It also confirmed J1. The examples below are the cases the reviewer used.

1. **Which version of the agreement an act is judged under.** *Pinned by* rule 36a, rule 37c (B1, B2) and "Collectives in the identity chain".
   *Plain:* an act is judged under the version of the agreement in force for it. That is the version the collective's identity chain declared for the key that signed the act, carried forward by any rotation that declared nothing new. But if a record has since put a newer version in force, and the act does not come before that record in the collective's own sequence, the newer version applies (the one furthest along). A record itself is judged only by the records before it.
   *Example:* one device records version C1 while another device, unaware of it, signs an act X. X is not before the record, so it is judged under C1.
   *Where:* core v21, "How an act in an area counts"; Law draft 10, rule 36a.
2. **The judicial tasks "as each member signed them".** *Pinned by* rules 36a, 44a, 44c.2 and 46a, and "Layer".
   *Plain:* which specification fills the condition, time-reference and anchoring tasks is never a lane's choice, not even the Law lane's. Their acts, being Law acts, still fall in the Law lane. The clone rule changes them. For a member who did not sign a change, the last version that member signed stays in force for them.
   *Where:* core v21. Law draft 10 keeps draft 9's wording here, because of J1. *Replaced by F120 and F121 (section 5): the judicial tasks now change only with every member, one version for everyone.*
3. **A specification for two layers "answers to both lanes".** *Pinned by* "Areas", rule 36a, rule 44b (R4, B4) and rule 44c.
   *Plain:* it belongs to both layers. Naming it for the second layer needs whoever decides each of the two tasks: both lanes' holders where both lanes exist. Where a layer has no lane, that layer's part goes to an area naming the task, or else to the clone rule. Each of its acts needs the holders of every lane that covers it.
   *Where:* core v21; Law draft 10's reason "Nothing passes around the lanes".
4. **Extensions: who approves, and in what order.** *Pinned by* rules 36a, 44b (field 15), 44c (Q7) and Q18.
   *Plain:* adopting or dropping an extension is one new version of the agreement. It needs the power over Production and over each layer the extension declares: that layer's lane, or the clone rule where no area covers it. Signatures can come in any order, and the version comes into force when every one of those powers is met, all at once. A version that also changes the constitution needs only the constitutional change rule. The extension binds only the layers whose power was met: never a lane whose holders were not asked, even if they signed.
   *Where:* core v21. Law already says this plainly.
5. **A departed member's earlier signature.** *Pinned by* rule 44d (Q23, B3) and "Made before, made after" 2 and 3.
   *Plain:* for that act or version alone, the member still counts among the voices that remain, so their leaving never lowers the number the rule asks for. If the record or rotation that puts the version in force does not name that signature, the member still counts as a voice, one who did not sign.
   *Example:* under three of three, a member signs and then leaves; the version still needs both of the others.
   *Where:* core v21; Law draft 10, rule 37a.
6. **Forks of records.** *Pinned by* rule 37c (A4, Q38, B11) and rule 47.
   *Plain:* two of the collective's devices can each draw a record without knowing of the other. If the two records put different new versions of the same agreement in force, the agreement has forked. The agreement's own fork rule decides which counts. Where it has none, the version both started from stays in force until a record that comes after both writes a new version made from the latest version of one branch. That new version comes into force, and the other branch does not. A branch that forked again cannot be resolved through.
   *Also stated:* records drawn one after the other are not a fork; the second puts nothing in force.
   *Where:* core v21.
7. **A member's own rotation, and a thief.** *Pinned by* "Made before, made after" 4, rule 5 (C5, Q33).
   *Plain:* a signature made with the member's old key, placed before the collective's line, stays valid for the collective whatever the member's rotation kept or disowned. That holds wherever it signs something the collective's key holders also signed: one of the collective's acts, or a version a record or rotation of the collective put in force naming it. Otherwise, or if it was placed after the line, Identity alone judges it. Every client shows its Identity status.
   *Where:* core v21. The word "thief" now appears only in the commentary.

**"Areas and lanes: who decides what"** is rewritten in core v21 for a careful non-specialist. It opens with one plain paragraph, then four parts: what an area is; how an act in an area counts; choosing specifications (the two-layer case, the judicial tasks, specifications not adopted, extensions); and when a holder goes. J1 is marked open there.

### The question: J1

**J1. Which rule changes a judicial task when the same new version also changes the constitution?**

*Plain words:* three tasks act as judges: deciding conditions, keeping time, and anchoring. Law says in one place (rule 36a) that only the clone rule changes them. In another (rule 44c.1) it says that any new version touching the constitution needs the constitutional change rule, alone, "which may change every tier". When one new version does both, the two rules disagree. Under either reading, a member who did not sign keeps the judge they signed for (rule 46a).

- **Reading (a): the constitutional change rule alone, as rule 44c.1 says.** Rule 36a's "only under the clone rule" then means "never by the Law lane, nor by any other area".
  *Example:* the constitutional change rule is "every party", the clone rule is two of three. A version adds a fourth member and replaces the anchoring cMIP. All three sign, and the new member too. Under (a), it comes into force. Every member signed, so the new anchoring applies to all.
  *Another example:* the constitutional change rule is two of three. Two members sign a version that changes the key grammar and the anchoring cMIP. It comes into force; for the third member the old anchoring cMIP stays.
- **Reading (b): both rules, the constitutional change rule and the clone rule, each met, as for a version touching two areas.**
  *The same examples:* the first decides the same way, since everyone signed. In the second, the clone rule of two of three is also met by the two signers, so the result is the same. The two readings differ only where the clone rule is stricter than the constitutional rule. For instance, a clone rule of every party with a constitutional rule of two of three: under (a), two members' signatures suffice; under (b), the version stays a draft until the third signs.
- **Reading (c): a version may not change both at once.** It would be invalid, and the two changes made in two versions.
  *Example:* the first example is refused; the members make two versions, one per rotation and record.

**Lean: (a).** Rule 44c.1 is the rule the tiers rest on: the constitution "may change every tier", and the clone rule itself is part of the constitution, so a stricter clone rule could be removed by the constitutional rule anyway. Rule 46a already protects every member who does not sign, whichever reading is chosen. Reading (b) adds a check that the constitutional rule could remove in the very same version. Reading (c) only adds a step.

## 3. Examples removed from the core

The rule: the core names no particular use of MOR, and no case-study example.

| Where | Before | After |
| --- | --- | --- |
| Core v21, collectives | "A collective is a band, a label, a cooperative: one identity…" | "A collective is one identity…" |
| Core v21, Identity (and Identity draft 11, the witness act) | "a statement a journalist relies on" | "a statement someone relies on" |
| Core v21, Finance (and Finance draft 6, reasoning) | "If you wish to pay in bitcoin in a shop that does not accept it…" | "A payer cannot pay on a rail the payee does not accept…" |
| Core v21, "Outside the core" | "Domains: music, news, science, games, and others" | "Domains of use" |
| Law draft 10 | co-producers forming one company for a film; "the band reorganizes around it"; "the treasurer", "the label" in comments and scenario lines | removed; "the Finance lane's holder", "the collective" |

**Kept, for you to judge:** names of technologies, which are not uses: Lightning, stablecoins, card and bank rails as kinds of rail in Finance and the core; "like a stolen bitcoin key" as a comparison; FROST, a block height. Also kept: "a reposter" and "a relay", which are roles the core itself defines. The freeze suite and one page v6 are not the core: their scenarios are test stories and examples by design, so they are left as they are.

## 4. The code, and the tests

- **Core library.** The negotiation message (type 18), its form, and `LawView::negotiation`, which builds a thread's record: its two sides, its messages, how far it is proven complete, and whether it forked. Text acts and third parties' messages are left out. `LawView::role_evidence` checks evidence for a role share: for a rail Module, a receipt or claim naming it, even the service's own, on a Module the owners' pointer or vault names (F119); for any other role, an act signed by someone other than the service and the payee. `finance::refund_owed_to` and `claims_refund` decide who can claim an anonymous refund: only a claim signed with the committed key (rule 32).
- **New tests** (`core/tests/law_draft_10.rs`): step 5.3, a negotiation proven complete by Law messages, where a text reply carrying `acks` is invalid and one without them is not part of the record, a stranger's message is ignored, and a fork shows; the message's form; step 2.4e, the service's own receipt as evidence for a Module named in the owners' pointer or vault, and as evidence of nothing for a Module they never named; rule 32's refunds.
- **Results:** Rust workspace **264 passed, 0 failed** (260 before, plus 4). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 18, connector 12, desk 8: **110 passed**, every one typechecking. The regtest Lightning run was not repeated: nothing it uses changed.

## Waiting on Nobody, allegedly (sections 1 to 4)

Answered on 3 October 2026: J1 (as F120), the five readings of section 1, and the technology names (kept as examples inside definitions). The point found outside the task, two members holding different judges, became F121. What is still waiting is listed at the end of section 5.

## 5. F120 and F121 written in

*Main merged in first (the findings log, F120 and F121). Law draft 10, core v21, freeze suite v21 and one page v6 revised in place.*

### What changed, in plain words

**One rule for changing a judge together with the constitution (F120).** When one new version of a collective's agreement changes both the constitution (who decides) and a judge (who settles disputes), the rule for the constitution alone decides. Rules 36a and 44c.1 now say the same thing.

**Judges change only when everyone signs (F121, a).** In a collective, everything that judges (the clause on absence, the succession plans, the keepers, the arbitrators, the time reference, the condition and anchoring specifications, the split service, the fork rule) changes only when every member whose voice remains signs. There is one version for everyone. Before, a member who did not sign kept the version they had signed, so two members could end up with two different judges and nobody to decide between them.
*Precisely:* a new power in the mark, `[4]`, "the judicial tier's rule", counted among every party of the parent whose voice remains, as rule 44d counts every rule. The clone rule (field 5) now covers only operational matters outside every area. Rule 46a rewritten; rules 6, 36a, 36b, 37, 37a, 44c, 44d, 44e, 45, 45a, 48a and 51 read alike. Coverage of the abandonment clause (rule 36b) is judged under the one clause in force. The abandonment declaration keeps its format: the version the member signed last carries the clause in force for every member whose voice remains (reading 7).

**A chain of judgment (F121, b).** For each judge, the agreement may name who takes over, in order, when it answers "unknown" or cannot act. Everyone signs the chain with the agreement, so when a judge fails, the next one steps in with no new signature.
*Precisely:* terms field 21, `[+ [ judge, [+ hash] ]]`; a judge is a judicial task's specification `[0, task]`, an identity the terms name as keeper, arbitrator or abandonment authority `[1, id]`, or the split service `[2]` (followed by grants). Rule 34a: the first answer that is not "unknown" is the chain's. A specification that takes over is itself a judge, so it is named nowhere else in the terms (Q20). A client that does not know a judge's specification never passes the question on.

**Departed members (F121, c).** Someone who leaves a collective keeping a stake is recorded, with their stake, in a departed members entry, and nothing else. They have no say and no veto; the collective's current rules and judges apply to them. Their stake never shrinks unless they sign, and it is a share of everything the collective earns. Every term treats their stake as it treats a member's. What cannot be paid stays an open debt.
*Precisely:* terms field 22, `[+ [ holder, share ]]`, shares in millionths of all the collective's income; constitutional; a clone that drops or lowers an entry is a draft until its holder signs (rule 46b, rule 45).

**The payee pointer must lead to the split service (F121, d).** Where an agreement names a split service, the owners' payee pointer counts, for Law, only if it names that service. Law clients check it before paying and show a pointer that goes around the service as such. A wallet that reads only Finance cannot check it: that cost is stated.
*Written in rule 18, but not built:* see flaw P1.

**The fork of a collective (F121, e).** When a collective's members split into sides that will not agree, a final act closes the collective, and every side founds a new one naming it as parent; the side that wants no change gets a copy of the old agreement, minus those leaving. Anything made before the fork belongs to every owner its claim lists, whichever side they joined; either side may sell it, and each sale pays all those owners. The fork act names both new collectives as descending from the old agreement, so neither side's sales look like sales outside the agreement.
*Written in rules 15b and 47a as decided in principle; no format, since the questions below decide its shape.*

The core names no specific use: the new text speaks of members, sides, judges and services only.

### Two flaws (not worked around)

**Flaw K1. F120 and F121 disagree in one case.** F120 says a version changing the constitution may change a judge under the constitutional rule alone. Its reason was that rule 46a kept the old judge for anyone who did not sign. F121 removed that protection and asks every member to sign a change of judge. Where a collective's constitutional rule is less than everyone, the two rules give different answers.
*Example:* a collective of three whose constitutional rule is two of three. Two members want a friendlier arbitrator; the third refuses. Under F121 alone they cannot. But if they add a one-word change to the constitution in the same version, F120 lets the two of them change the arbitrator, and the third is judged by it.
- (a) The constitutional rule alone, as F120 says. *In the example:* the arbitrator changes, the third never signed it.
- (b) The constitutional rule, and every member for the judge. The mark names both `[0]` and `[4]`. *In the example:* the version stays a draft until the third signs; the two may still change the constitution in a version that leaves the judge alone.
- (c) No version may change both at once. *In the example:* refused; two versions needed, and the judge's still needs the third.
*The code compares the rule as written with every party: where removed voices already make it every remaining member, the readings agree, and such a version is still refused until K1 is decided.* **Lean: (b).** F120 set (b) aside because the constitutional rule could remove the extra check in the same version. F121's "every member" is now fixed by Law itself, not by the agreement, so that reason no longer holds, and (a) would reopen the very gap F121 closes.
*Meanwhile:* the core library refuses such a version as unsettled, where the constitutional rule is below every party. Where it is every party, all three readings agree, and it counts.

**Flaw P1. A payee pointer names rails, never a person.** Rule 18 now says the owners' pointer counts only if it "names" the split service. A pointer lists rails: a rail Module and some address bytes only that Module can read (a node key, an address). Nothing a verifier can read says whose address it is, so the check cannot be made.
*Example:* the owners' pointer lists a Lightning node key. Is it the split service's node, or the Finance lane holder's own? Nothing in the pointer says.
- (a) The owners' pointer names the service when every rail it lists (Module and address bytes) is also in the service's own payee pointer, which the service signs. No format change. *In the example:* the node key must also appear in the split service's pointer.
- (b) A new field in the pointer naming who receives on its rails. *In the example:* the pointer says "the split service", but anyone can write that next to their own node key, so it proves nothing alone.
- (c) A forwarding rail: a pointer may say "pay to this identity's pointer" instead of listing rails, and every wallet follows it. *In the example:* the owners' pointer says "the split service's pointer". Clean, but it changes Finance and every wallet.
**Lean: (a).** It needs nothing new in Finance, and it rests on the service's own signature, which the owners' Finance lane cannot fake.
*Meanwhile:* no check is built; rule 18 says a Law client shows the pointer's relation to the service as undetermined until this is settled.

### Questions, one at a time

**1. The collective's debts and obligations at a fork.** The old collective is closed, and only a debtor's own signature binds, so the new collectives owe nothing they did not sign.
*Example:* the old collective owes a supplier 900. The two members who want change found collective A; the one who does not founds B.
- (a) Every new collective owes everything the old one owed, jointly. *The supplier may collect the 900 from A or from B.*
- (b) Shared by the sides in proportion to their members' stakes. *If A's members held two thirds: A owes 600, B 300.*
- (c) The fork act assigns each debt to a side, which signs for it; any debt it does not name is owed jointly, as in (a). *The act gives the 900 to A; A signs for it; an unlisted debt is owed by both.*
**Lean: (c).** No debt can vanish, the creditor keeps a signed debtor, and the sides choose openly who pays what.

**2. Grants the old collective issued, and the grantees' pending deals.**
*Example:* the old collective let a grantee sign deals for it. Deal X was paid on by the collective; deal Y was signed by the grantee but never acknowledged.
- (a) Every grant ends at closing, as in a frozen area (rule 37b); each side may reinstate, one by one, the grants it takes on; deals the old collective acknowledged, paid on or imported are its debts, handled as in question 1. *X is a debt of the old collective; Y waits until a side reinstates the grant, or is lost.*
- (b) The fork act gives each grant to one side, which carries it on. *The act gives the grant to A; Y binds A as if nothing happened.*
- (c) Every grant ends and is sealed; nothing is reinstated. *Y binds nobody; X is a debt as in question 1.*
**Lean: (a).** It reuses the freeze and refit Law already has, and lets each side choose its hires visibly.

**3. Keys: the old collective's key holders and shares at closing, and the new collectives' genesis.** Identity has no way to close an identity (only a home), so the old collective's keys could keep signing.
*Example:* after the fork, someone holding enough shares of the old key signs a receipt in the old collective's name.
- (a) The closing is a rotation of the old collective, at its safety key's ceremony, declaring the fork and no agreement in force: everything the old key signs afterwards that needs members' signatures counts for nothing, as when members change (F100). *The receipt counts for nothing in Law.*
- (b) The closing is an everyday Law act; Law alone voids what the old collective signs after it. *Same result in Law, but the act is signed with the everyday key, which a thief may hold.*
- (c) Identity gains a way to close an identity. *The old key is dead everywhere; Identity changes.*
For the new collectives, in every reading: each has its own genesis and new keys, dealt among its side.
**Lean: (a),** with rule 36's cost stated: for a moment one device holds the whole key, and nothing proves it forgot it.

**4. The exact fork act: who signs it, what it names, how its sides are listed.**
*Example:* members P and Q want change; R refuses.
- Who signs: (a) every member, each naming the side they join (*R can block the fork, so the standoff stays*); (b) the constitutional change rule (*under "every party", R blocks it too*); (c) the members of each departing side; whoever signs nothing stays on the status-quo side (*P and Q sign; R is the status-quo side without signing*).
- What it names: the agreement in force and its latest act; each side as a list of members, with the status-quo side marked (at most one).
- How the new collectives name the old one: founding terms with a parent (field 11) would be a clone of the old agreement, which the departing members could never complete; so a new field naming the old agreement and the fork act.
**Lean: (c), sides as member lists, and a new field.** (c) is what makes the fork a way out of the standoff F121's unanimity creates; nobody loses a stake by it, only the old identity.

**5. A name.** Rule 47's "fork rule" (terms field 10) settles forks of records, two versions written concurrently; the fork of a collective is something else.
- (a) Keep "fork of a collective" and rename field 10 the "concurrency rule", since it settles changes made concurrently ("branch" is already taken by grants). *Rule 47 would read "where the agreement has no concurrency rule...".*
- (b) Call the collective's event a "parting", and keep "fork rule". *"The parting of a collective."*
- (c) Keep both names, always qualified ("fork of records", "fork of a collective").
**Lean: (a).** "Fork" is your word for a collective splitting, and the core already says "specialized fork" for a whole branch; field 10's format is still open, so renaming it costs nothing.

**6. Money after a fork.** Where a work's claim names the old collective itself as an owner (rather than its members), the closed collective cannot receive; and payments still arrive at the old collective's payee pointer.
*Example:* a song claimed by the old collective sells after the fork.
- (a) The old collective's share is divided by the old agreement's stakes and split plan as last in force, whichever side sells; the old pointer keeps leading to its split service. *Both sides' members, and any departed holder, are paid as before the fork.*
- (b) The fork act says how the old collective's share is divided. *The sides decide it in the act.*
**Lean: (a).** It follows "anything made before the fork belongs to both groups" without a new choice.

**7. The chain of judgment: when an identity "cannot act".** A specification always answers, so "unknown" covers it. A person or service (a keeper, an arbitrator, the absence authority, the split service) may simply stay silent, and nothing says when the next one may step in.
*Example:* the arbitrator is asked to rule and says nothing for three months.
- (a) Only an "unknown" answer passes. *The silent arbitrator is never replaced, and the chain does nothing for a dead judge.*
- (b) Each link names a period on the time reference; once the judge has been asked and has not acted within it, the next may act. *After 30 days, the second arbitrator rules.*
- (c) The next may act at any time; where both act, the earlier judge's act prevails. *The second rules at once, and is overruled if the first ever answers.*
**Lean: (b),** a period added to each link.

**8. Members' own stakes in the collective.** A departed member's stake is "a share of all the collective's income", but members' own stakes in the collective as a whole have no format yet (terms field 7, still open, names stakes per work or publication). So equal treatment cannot yet be checked by a verifier.
*Example:* a departed member holds 25% of all income; a member holds 25%; the split plan charges the departed member's 25% a higher fee. To see it, the core needs both stakes in the same terms.
- (a) Stakes in field 7 whose object is the collective's own identity are shares of all its income, in the same unit as the departed entry.
- (b) A members' entry beside the departed one.
**Lean: (a).**

**9. "A fee paid to a service the members own is public."** The core cannot know who owns a service.
- (a) Every split that pays a stake is delivered to that stake's holder, departed or not, and names every fee and who received it (rules 20, 27). *The departed member sees the members' own service's fee in every split that pays them.*
- (b) The splits of a collective with departed holders are public to everyone.
**Lean: (a).**

### Readings taken, to confirm

1. The judicial tier's rule is fixed by Law, not by the agreement: every party whose voice remains, counted as every rule is (fewer voices remaining are all needed, flaw C); a mark names it `[4]`.
2. "Each judge may name, at founding, the one that takes over" is read as: the agreement names, for each judge, who takes over (field 21), in the founding terms or a later version signed by everyone. It works in deals too.
3. A specification that takes over is a judge too, named nowhere else. A time reference's "undetermined" passes like "unknown"; "pending" does not; a client's own ignorance never passes.
4. The split service's chain lists grants; rule 18's check accepts a pointer naming a service its chain names, so the chain passes without new signatures.
5. Field 21 is judicial. Field 22 is constitutional; dropping or lowering an entry also needs its holder; raising one does not.
6. A departed share is in millionths of all the collective's income; together at most 1,000,000.
7. The abandonment declaration's field 1 and its check are unchanged: for a member whose voice remains, the version they signed last carries the one clause in force. For a party whose voice was removed before a judicial change, it may carry an older clause; I read that the older one still applies, as the check says.
8. Rule 36b's coverage (every member with constitutional power covered by the absence clause) is judged under the clause in force.

### Code and tests

- **Core library.** The new power `[4]` and the tiers: a judicial change needs every member; the clone rule only operational matters outside every area; a version changing the constitution and a judge under a constitutional rule below every party is refused as unsettled (K1). Terms fields 21 and 22, their checks, `Terms::chain_of` and `judged` (the chain's answer). A clone that drops or lowers a departed stake is a draft until its holder signs. Rule 36b judged under the clause in force. Not built: rule 18's pointer check (P1), equal treatment's check (question 8, formats open), the fork (questions 1 to 6).
- **Clients.** The repo client and the collective client mark a change of who judges absence with `[4]`, signed by every member, and say so in plain words.
- **Tests changed** to F121: every story and format check that changed a judge or a succession plan with two of three now needs all three (3.7d, 3.7f, 3.7k, 3.7l, 3.7n, 3.8, 3.8b, Q23 and C2, Q34, B14, B17); in 3.8b's third collective, the stranger's plan now never comes into force.
- **New tests:** a chain of judgment answering "unknown", then deciding (3.7p); what a chain may name; the departed members entry's checks; F120 and K1 (3.7s); a departed stake that never shrinks without its holder (3.7q).
- **Results:** Rust workspace **269 passed, 0 failed** (264 before, plus 5). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 18, connector 12, desk 8: **110 passed**, every one typechecking.

### Waiting on Nobody, allegedly, in order

1. Flaw K1.
2. Flaw P1.
3. The fork's questions, 1 to 6.
4. Questions 7 to 9.
5. The eight readings above.
6. Approval of Law draft 10 with the core pass drafts; then the fork's grammar, the pointer check and the human regtest test on the Mac.

## 6. F121's answers, F122 and F123 written in

*Main merged in first (the findings log: F122, F123 and every answer under F121). Law draft 10, core v21, freeze suite v21 and one page v6 revised in place; the core library and the collective client built and tested. Nothing is approved.*

### What changed, in plain words

**A judge and the constitution in one version need both rules (F122).** When one new version changes the constitution (who decides) and a judge (who settles disputes), it needs the constitution's own rule, and every member for the judge. It stays a draft until both are met.
*Precisely:* rule 44c.1: a constitutional change needs `[0]`; where some change is also judicial, `[4]` too, the mark naming both; rules 36a, 44e and 46a read alike. The core library's "unsettled" refusal (K1) is gone; such a version is judged by the rule.

**The split service vouches for the owners' pointer (F123).** Where an agreement names a split service, the owners' payee pointer counts, for Law, only if every address in it also appears in the service's own signed pointer. To go around the service, the service would have to sign, publicly, for an address that is not its own.
*Precisely:* rule 18: every rail of the owners' pointer in force (a rail Module and its address bytes) is a rail of one service's own pointer in force: the service the agreement names, or one its chain of judgment names to take over (reading 4). A Law client shows anything else as bypassing the split service; a Finance-only wallet cannot check it (cost stated).

**A silent judge is replaced after a period (F121, Q7).** Each step of a chain of judgment names how long the judge has to act once asked. After that, measured on the agreement's time reference, the next one may act. Wherever a judge can stay silent (a person or a service), the agreement must name a time reference.
*Precisely:* terms field 21 becomes `[ judge, [+ [ next, period ]] ]`, every period above zero; terms whose chain follows an identity or the split service without a time reference (field 6 or task 10) are invalid; rule 34a.

**Members' stakes in the collective itself (F121, Q8), and equal treatment checked against them.** A stake whose object is the collective is a share of everything it earns, for members and departed holders alike. A split that pays a departed holder's share less than a member's of the same size is shown as breaking equal treatment.
*Precisely:* terms field 7 is now exact (`[+ [ object, [+ [ holder, share ]] ]]`, millionths summing to 1,000,000, each object once); rule 46b.

**Every split is shown to everyone it pays, with every fee (F121, Q9).** The split service delivers each split to every holder it pays, and names each fee and who received it. The core cannot tell who owns a service, so it never hides a fee.
*Precisely:* the split (type 8) is now exact: its payouts are maps naming, each, the receiver, the amount, the stake it pays or the fee's module, and the split names the agreement whose stakes it pays (field 3); rules 20 and 27. *The draft 9 sketch, an array with optional parts that could not be told apart, is replaced.*

**How a collective ends: four shapes (F121).**
- **A, a group splits off** with the powers to do so: an ordinary change of members; those who leave become departed holders, recorded with their stake.
- **B, the fork proper:** every member signs a **fork act** with their own identity, each on a side. Once complete, the original collective is **closed in Law**: anything its keys sign afterwards counts for nothing; rotating it is optional cleanup. Its ownership of each work passes to the collectives the sides found, in the shares the act names, **by default by the members' stakes**; **departed holders keep their percentage in every successor**; a debt the act assigns goes to that side, **any other is owed by both**; **every grant ends**, each side reinstating what it wants; **open offers are withdrawn**; the old split service pays the successors. Each successor names the original in a new **"forked from"** field, never as a parent.
- **C, actively abandoned:** a plain collective; nothing new.
- **D, dissolution:** works sold or **released to the public domain**: the **release act** ends the claim, names the work's history (its claims and the stakes it ends) and publishes its content key. It needs **every stake holder's signature** unless the founding terms set another release rule; a later claim is shown as made after the release.
*Precisely:* the fork act (type 19): the original agreement, the collective, its chain act and kept tips (its line), the sides, optional shares and debts; terms field 23, forked from; the release act (type 5, now exact) and terms field 24, the release rule, set in founding terms and changed by no clone; rules 15b, 17, 47a.

**Reading 7 corrected.** For a party whose voice was removed before a judicial change, the abandonment clause in force applies, not an older one.
*Precisely:* the declaration's check (type 13, rule 51) judges its authority and outcomes by the clause of the agreement it names, the one in force; field 1 still names the last version the party signed. Built and tested.

**The concurrency rule.** Rule 47's "fork rule" (terms field 10) is renamed the concurrency rule everywhere in Law draft 10, core v21 and the suite.

The core names no specific use: the new text speaks of members, sides, holders, works and services only.

### Three flaws (not worked around)

**Flaw S1. Founding terms cannot name the collective itself.** *Plain words:* a collective's name is its birth certificate (its genesis), and the birth certificate names the founding agreement. So the founding agreement cannot name the collective: it does not exist yet. Q8's "stakes whose object is the collective itself" can therefore never be in founding terms; nor can the collective's own grants (the split service).
*Example:* three people found a collective and want to own a third of its income each from day one. They cannot write it at founding; they must sign a first clone straight after. In a fork, each side founds a new collective: its founding terms cannot say how its members share its income either, only who the departed holders are.
- (a) A "self" form: a stake's object or holder written as null means "this collective", as Identity already lets a genesis name itself as its own home's operator with null. *In the example:* the founding terms say "null: one third each".
- (b) Stakes in the collective always come in a first clone, as built now. *In the example:* two steps, every member signing both.
- (c) A members' entry beside the departed one (Q8's option set aside).
**Lean: (a).** It follows Identity's own precedent, changes no other field, and lets a fork's successors be complete at birth.
*Meanwhile:* the core library accepts a stake in the collective only by its identity hash, so only in a clone; the collective client sets stakes by a clone.

**Flaw M1. F122 lets a member with a succession plan block their own removal.** *Plain words:* some collectives let a majority remove a member. If that member has a succession plan in the terms, the plan has to go too (a plan for someone who is no longer a member is invalid), and a plan is a judicial clause. Under F122 that needs every member, the one being removed included.
*Example:* a collective of three, removal by two of three. Ana and Ben remove Cy, whose plan names an heir. The new version drops Cy's plan, so it needs Cy's signature: Cy can refuse, and stays.
- (a) A clause that names only the member being removed (their own plan) goes with the removal, as their seats in areas already do (Q21): no judicial power needed for it. *In the example:* Ana and Ben's signatures suffice.
- (b) The member a version removes is not counted for that version's judicial part. *Same result, but wider: it would also let the removal change other judges without them.*
- (c) Accept it: such a member leaves only by their own signature or by the abandonment clause.
**Lean: (a).** It is the narrowest, and keeps F122's protection for every judge that concerns anyone else.
*Meanwhile:* the core library applies F122 as written: such a removal stays a draft without the removed member (a test says so).

**Flaw P2. The pointer check does not reach the owners' vault.** *Plain words:* payments above a limit go to the owners' vault, not their everyday pointer. F123 checks the pointer only. Owners could keep a vault of their own and receive every large payment around the split service.
*Example:* the collective's pointer leads to the split service, but its vault takes everything above 1,000 to an address a member controls.
- (a) The same check for the vault: every entry of the owners' vault also appears in the service's own vault.
- (b) A collective that names a split service has no vault of its own; large payments go to the service's vault.
- (c) Accept it, stated: a wallet shows the vault as unchecked.
**Lean: (a).** It is F123's own idea applied to the other half of the pointer.
*Meanwhile:* only the pointer is checked, as F123 says.

### Questions the writing needed, one at a time

**N1. Who must sign a fork, and a member who signs no side.** F121 says "both sides sign".
*Example:* Ana and Ben want to fork; Cy says nothing at all.
- (a) Every member whose voice remains signs, on a side; without Cy, no fork. Cy's silence is the abandonment clause's business. *Built so.*
- (b) The fork completes without Cy, who becomes a departed holder of both successors.
- (c) Cy keeps the original.
**Lean: (a).** Nobody loses their say without signing (F103), and (c) brings back the lone holdout keeping the name.

**N2. What "afterwards" means for the closed original.** MOR has no clock.
*Example:* after the fork, the collective's key signs a receipt dated earlier.
- (a) The fork act names the original's chain act and the latest act of its sequence (kept tips), a line drawn by the members: an act of the original after it counts for nothing. *Built so.*
- (b) Only a rotation of the original draws the line (the members could be blocked by a key holder).
**Lean: (a).** It reuses how a record or rotation draws a line, without the collective's key.

**N3. The default shares where the collective carries no members' stakes in itself.**
*Example:* three members, no stakes written; sides of two and one.
- (a) Each member counts alike: two thirds and one third. *Built so.*
- (b) No default: the fork act must name the shares for every stake.
**Lean: (a).** F121 says terms not agreed fall to defaults.

**N4. Which collective is a side's successor.**
*Example:* side B founds two collectives, each naming the fork and side B.
- (a) A successor's founding terms name the fork and the side, their parties are exactly that side's members, and they keep every departed holder at their share; two that fit are both shown, and the side's share waits as an open obligation until one remains. *Built: the core lists every one that fits.*
- (b) The first founded (needs an order between two identities' acts, which MOR does not have).
**Lean: (a).**

**N5. How the departed entry (field 22) relates to the stakes (field 7).**
*Example:* Cy leaves with 25%.
- (a) Cy's 25% stays in the stake in the collective (field 7), as every member's does, and field 22 records the same 25% and that Cy has no voice. *Built so, in the client.*
- (b) Departed shares live only in field 22.
**Lean: (a).** The split pays stakes, and equal treatment compares them.

**N6. The chain's period: from when, and an answer given late.**
*Example:* the arbitrator, asked on day 1, has 30 days; it answers on day 40, after the second arbitrator ruled on day 35.
- (a) The period runs from an act asking the judge, by someone with standing, addressed to it; an answer after the period counts for nothing in that question. *Built: the core takes "asked, period passed" from the caller.*
- (b) The earlier judge's answer prevails whenever it comes.
**Lean: (a).** (b) is Q7's set-aside option (c).

**N7. A release where a holder is a collective.**
*Example:* the collective owns the whole work.
- (a) Every holder of the collective's stake in itself signs, members and departed. *Built so.*
- (b) The collective signs, by its own rules (a majority could then release).
**Lean: (a).** "Majority stake is not enough."

**N8. The release rule's form and life.**
- (a) A rule among the stake's holders (every one, any k, or named ones), in the founding terms, which no clone changes. *Built so.*
- (b) A clone may change it with every holder's signature.
**Lean: (a).** "A later buyer of a stake buys it under those terms."

**N9. How a dissolved collective closes (shape D).**
- (a) No act: once every work is sold or released it holds nothing and pays nothing, an abandoned collective with nothing left.
- (b) A closing act, signed by every member, as the fork's with one side.
**Lean: (a).** *Not built.*

**N10. Equal treatment's direction and rounding.**
- (a) Only a departed stake paid less than a member's, beyond one smallest part per payout, is shown; members paying themselves less is their choice. *Built so.*
- (b) Any difference either way.
**Lean: (a).**

**N11. A release at a future point.** Rule 17 allowed a timed release; the release act publishes the content key at once.
- (a) A field naming a point on the time reference: the claim ends then, and the content key is delivered then (Envelope's "going public later").
- (b) No timed release: the holders sign the release when the time comes.
**Lean: (a).** *Not built; rule 17 now says so.*

**N12. A release naming every stake and claim.** Nothing a verifier holds proves a release named every agreement holding a stake in the work, or every claim.
*Example:* Ana and Ben hold the work under one deal; Cy holds 10% of it under another. Ana and Ben release it.
- (a) It ends only the stakes it names; where a held agreement carries another stake in the work, the release is shown as partial, and that stake stands; a claim it leaves out is shown as made after it.
- (b) A release must name every stake a verifier holds, or it is incomplete.
**Lean: (a).** *Built: a release ends what it names; "partial" is not shown yet.*

**N13. Who signs a debt the fork assigns.** Q1 says the side "signs for it".
- (a) The side's members, by their signatures on the fork act. *Built so.*
- (b) The side's new collective, by its own act once founded.
**Lean: (a).** The new collective does not exist when the fork is signed.

**N14. The old split service after every grant ends.** Q2 ends every grant; Q6 has the old split service pay the successors, and it is named by a grant.
- (a) The split service's grant is the one that continues, until the successors switch services. *Not built: the core does not judge splits by the grant's backing.*
- (b) It ends too, and money reaching the old pointer waits as an open obligation.
**Lean: (a).** Q6 needs it.

**Formats made exact while writing, to confirm:** the split (payouts as maps; the agreement it pays), terms field 7 (each object once), the fork act and the release act (as above).

### Code and tests

- **Core library.** F122 in the tiers (`[0]` and `[4]`). Terms fields 7, 23 and 24 and the chain's periods, with their checks; `chain_answer` (a silent judge passes the question once its period has passed). `LawView::pointer_check` (F123). `LawView::split` (sums, fees and receivers, delivery, equal treatment). `LawView::fork`, `closed_by`, `after_closing`, `fork_transfer`, `debtors`, `offer_withdrawn`; an act of a closed collective after its fork counts for nothing (`Consent::Closed`), its grants ended (`Backing`). `LawView::release`, `released`, `claim_after_release`. Field 10 renamed. WebAssembly: `lawFork`, `lawPointerCheck`, `lawSplit`, `lawRelease`, `lawClaimAfterRelease`; `readTerms` shows the new fields.
- **Collective client.** A section "Money and endings": stakes; a departed holder's stake kept when a member leaves; a split service; payee pointers and the pointer check; a simulated payment and its split, with its fee and equal treatment; a release to the public domain; the fork, after which the collective's actions are refused. A change of members that also changes who judges absence names both powers (F122). Founding the successors from the page is not built.
- **New tests:** core: the chain's periods and time reference (3.7u); stakes and fields 23, 24; F122; shape A (3.9a); M1 as written; equal treatment and visible fees (3.7t); the pointer check (3.7r); the fork (3.9), and what is not a fork; the release (3.9c). Client: one end-to-end test of the whole section against real relays.
- **Results:** Rust workspace **279 passed, 0 failed** (269 before, plus 10, reading 7 among them). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 19, connector 12, desk 8: **111 passed** (110 before, plus 1), every one typechecking.

### The Mac regtest test

Nothing it uses changed: this pass touched Law only (the core library's Law module, its WebAssembly bindings and the collective and repo clients), never Finance, the payment cMIP or the Lightning Module. The steps are those of `docs/core-pass-v21.md`, section 5, unchanged, run on this branch (`git fetch && git checkout claude/core-pass-v21`). It was not repeated here.

### Waiting on Nobody, allegedly, in order

1. Flaw S1.
2. Flaw M1.
3. Flaw P2.
4. Questions N1 to N14, and the formats made exact.
5. Approval of Law draft 10 with the core pass drafts; then the human regtest test on the Mac.

## 7. F124 written in

*Main merged in first (the findings log, F124). Law draft 10, core v21, freeze suite v21 and one page v6 revised in place; the core library, its WebAssembly bindings, the repo client's payloads and the collective client built and tested. Nothing is approved.*

### What changed, in plain words

**A collective can name itself from birth (S1).** In a collective's own terms, "null" means "this collective". So the founding terms can already say how the members share its income, which works it owns, and which split service it hires, before the collective exists.
*Precisely:* terms field 7 is `[+ [ who, [+ [ who, share ]] ] ]` with `who = hash / null`, null only in terms carrying a key grammar, never a collective holding a stake in itself; grant field 8, `null`, makes the grantor "the collective whose founding terms name this grant". *Reading:* the collective is always written null in its own terms; a clone writing its own hash instead is invalid.

**Removing a member takes only their seat (M1).** When a member is removed, the seat part of their succession plan goes with them, with no extra power needed; the part that says who inherits their stake stays, since the stake stays.
*Precisely:* rule 44b: a change of field 16 that only drops keys 2 and 3 of each removed party's plan (the plan staying for its stake part, or going where it has none) is no change of its own. A departed holder's plan carries stake successors only.
*Example:* under two of three, Ana and Ben remove Cy, whose plan names an heir and a seat successor. Their two signatures suffice; the heir stays named for Cy's stake.

**Two ways to split money (P2).** Either a split service receives and divides (two flows), or the payer's wallet pays each holder directly by the stakes (one flow). For a split service, its own signed vault must now carry every entry of the owners' vault, as its pointer carries every address.
*Precisely:* rule 18; `LawView::pointer_check` compares vaults too (`vault_missing`); `LawView::payer_split` gives what a wallet pays each holder, following a holder that is a collective splitting payer-side to its own holders.

**The fork (N1 to N4, N13, N14).** Each side first founds its own new collective. The fork act then names them. It is signed as the group's constitution requires (everyone, by default). Where the founders chose a lower rule, someone who signs no side gets no seat in any new collective but keeps their share in each, as a departed holder. Every debt must be handed to a successor (or several jointly), and each successor signs for its debts. Every hire ends, the old split service's too; money follows the work's new owners, and anything the old service still receives it owes them.
*Precisely:* type 19: sides are `[ successor, [+ member] ]`; debts are `[ obligation, [+ side] ]`; completeness checks the constitutional rule (rule 44d counting), each successor's founding terms (parties exactly the side; every departed holder and every member on no side kept at their share in field 7 and listed in field 22), every binding obligation before the line assigned, and each owing successor's signature act; field 23 is now just the original collective, a back-link. Two complete forks (or closings) of one collective are concurrent: neither ends it. `LawView::stray` gives a stray payment's debt to the successors.

**The stakes decide the money (N5, N10).** The departed entry now lists only who left; the stakes say what everyone is paid. A split must pay each holder exactly their share of what it pays their stake, within one smallest unit per payout, so a fee always falls on everyone alike. Any difference, either way, is shown; the old one-direction "equal treatment" check is gone.
*Precisely:* field 22 is `[+ hash]`, each a holder of the stake in the collective itself; rule 46 now protects every holder in field 7, member or not; `SplitEval::mismatched` replaces `unequal`.

**The chain's period (N6).** It runs from a signed request to the judge by someone with standing; a late answer counts for nothing. Written as rule, no longer a reading.

**Releases (N7, N8, N11, N12).** A release needs every direct owner of the work. If an owner is a collective, the collective decides by its own rules, and needs the holders of its Envelope, Finance and Law lanes. A clone every owner signs may change the release rule. A release may name a future date, and who hands out the key then. A competing claim stays shown beside the release.
*Precisely:* type 5 field 4 `[ point, keeper ]`, field 3 then optional; rule 17; a release or a collective's signature on one is reached by the lanes of layers 1, 2 and 3; field 24 is compared, in no area (the clone rule), and a clone changing it is a draft until every holder of every stake signs.

**Closing (N9).** A group that holds nothing ends by a closing act, signed under its constitutional rule; after its line, its keys count for nothing in Law.
*Precisely:* type 20, `{ agreement, collective, chain act, kept tips }`; refused while the collective still holds a stake (unless released with its consent before the line) or, a reading, owes a binding debt not fulfilled by receipts.

**Debts (N13).** A collective's private acts are sealed to every member (the collective client does so for its debts). A collective's debt binds it only once its outside is public. Where a verifier found it is a fact the verifier states (`LawView::published`), as it states a keeper's log.

The core names no specific use: the new text speaks of collectives, members, holders, works, services and debts only.

### One flaw (not worked around)

**Flaw D1. A debt that surfaces after a fork falls under two rules.** *Plain words:* N13 says a fork that leaves a debt unassigned does not take effect; it also says a debt someone hid is owed by every successor once it surfaces. A hidden debt binds nobody while hidden; but when its creditor publishes it after the fork, a verifier now holds a binding debt of the old collective, made before the fork, that the fork never assigned. MOR has no clock, so nobody can tell whether it was public before the fork. The first rule says the fork never happened; the second says the fork stands and both new collectives owe it.
*Example:* Ana, Ben and Cy fork. Before it, Cy, holding the collective's everyday key, signed in its name a debt of 50 to a friend, sealed to nobody else, never published. The fork completes. A month later the friend publishes the debt. Under the first rule, the old collective was never closed: every act of the new collectives about the old works rests on nothing, and Cy and the friend could do this on purpose to undo any fork. Under the second, the fork stands and the new collectives owe 50 jointly.
- (a) Law never undoes a complete fork for a debt: assigning every debt is the members' clients' duty (each refuses to sign a fork leaving a debt it holds unassigned), and any debt a fork leaves unassigned is owed by every successor jointly. *In the example:* the fork stands; both new collectives owe 50; the fork act shows who signed it.
- (b) A debt sealed to every member (its outside lists them all) blocks the fork until assigned; any other debt is a hidden one, owed by every successor. *In the example:* Cy's debt was sealed to nobody else: hidden, owed by both. But a debt addressed to all and never delivered could still be revealed late to undo a fork.
- (c) As written: an unassigned debt, whenever it surfaces, undoes the fork. *In the example:* the fork never took effect.
**Lean: (a).** It keeps both decisions' purpose (no debt vanishes; members must face every debt), uses what every verifier can check, and closes the door on undoing a fork by publishing late.
*Meanwhile:* the core shows a fork leaving a binding debt unassigned as unsettled (`ForkEval::unassigned`, "flaw D1"), closing nothing; freeze step 3.9g shows the case.

### Questions the writing needed, one at a time

**D2. How does a verifier know a debt's outside is public?** "Published on relays" is not written in the act.
*Example:* a verifier receives a collective's debt in a private message from the creditor, never seeing it on a relay.
- (a) A fact the verifier states: it found the act at a relay (`published`), as it states which keepers recorded what. *The debt counts for that verifier only once it finds it on a relay.*
- (b) A relay's signed statement that it holds the act (Envelope's relay commitment, type 2). *Provable to others; heavier, and any relay, the creditor's own included, will do.*
**Lean: (a)**, built so; (b) can come later without changing the rule.

**D3. How does a collective choose its split model?**
- (a) By naming a split service (field 14) or not: no service means payer-side splitting. *Built so.*
- (b) A field saying which.
**Lean: (a).** Rule 18 already turns on whether a service is named.

**D4. Which power does a clone changing the release rule need, besides every owner?**
- (a) The clone rule, the release rule lying in no area. *Built so.*
- (b) The constitutional change rule.
**Lean: (a).** Every owner signs anyway; the release rule decides nothing about who decides.

**D5. Does a closing need the collective's debts paid?** N9 says "holds nothing".
*Example:* the collective released its last work but still owes a supplier 100.
- (a) Yes: a closing does not take effect while a binding debt is not fulfilled by receipts. *Built so.*
- (b) No: the debt stays open, owed by a closed collective.
**Lean: (a).** Otherwise closing would be a way out of a debt.

**D6. Who signs a "this collective" grant before the collective exists?**
- (a) Any founder; the core does not check which, the grant counting through the founding terms everyone signs. *Built so.*
- (b) The grantee, accepting the mandate.
**Lean: (a).**

### Readings taken, to confirm

1. S1: the collective is written null in its own terms, never by its hash (one meaning, one encoding).
2. M1: a departed holder's stake plan changes only with that holder's signature as well; a removed member keeps a plan only as a departed holder, so with a share of field 7.
3. N1: with no stakes written, a member on no side keeps each member's equal share.
4. N4: a successor fits its side when its founding terms (as its genesis declares them) have exactly that side's members as parties and keep each departed holder at exactly their share; field 23 names the original collective, not its agreement, since the agreement may still change before the fork; any two complete forks or closings of one collective are concurrent.
5. N7: a release always touches Envelope, Finance and Law; a lane that does not exist is skipped.
6. N9: "holds nothing" is judged on the latest versions of agreements a verifier holds; a stake sold by a transfer (type 4, still open) is not seen; a closing also withdraws offers.
7. N10: nobody is paid a whole unit or more below their exact share; nobody as many units above it as the stake has holders.
8. N11: the identity delivering a timed release's keys is not a keeper in rule 7's sense.
9. N14: a stray payment is owed to the successors in the fork's default shares.

### Code and tests

- **Core library.** `Who` (null, this collective) in stakes; grant field 8; field 22 as a list; field 23 as the original; M1 in the tiers; rule 46 for every holder (`must_sign`); field 24 changeable; `pointer_check` with vaults; `payer_split`; the fork rewritten (successors, constitutional rule, members on no side, debts); `closing` (type 20) and `endings`, `closed_by` now any ending, concurrent ones ending nothing; `obligation_binds` and `published`; `debtors` naming successors; `stray`; the split's `mismatched`; the release by direct owners, a collective through its lanes, timed releases (`ReleaseEval::ended`). WebAssembly: `lawFork`, `lawSplit`, `lawRelease`, `lawPointerCheck` and `readTerms` changed; `lawClosing`, `lawPayerSplit`, `lawObligationBinds`, `lawDebtors`, `lawCollectiveOf` added.
- **Collective client.** Founding with each member's share (S1); stakes written with null; the pointer check naming vault entries; splits checked for every payout matching its stake; a debt of the collective, sealed to the creditor and every member; a release signed by the collective itself; **the fork, founding each side's successor first and naming them in the fork act, every published debt assigned (jointly by default) and each owing successor signing**, a member on no side kept as a departed holder; a closing. The page gains a "no side" choice, a debt form and a closing button.
- **New tests:** core: founding terms with stakes and a null grant (3.7v); a removal completing under two of three (M1); every payout matching its stake (3.7t, rewritten); the pointer check with a vault (3.7r, P2); payer-side splitting; the fork with successors, debts, a stray payment and the hidden debt shown as unsettled (3.9, 3.9g); a member on no side (3.9d); what is not a fork, with concurrent forks; a release with a non-party owner and a clone changing the rule (3.9c); a timed release (3.9e); a collective releasing its work and closing (3.9f). Client: the end-to-end test of "Money and endings" rewritten to all of the above against real relays.
- **Results:** Rust workspace **284 passed, 0 failed** (279 before, plus 5). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 19, connector 12, desk 8: **111 passed**, every one typechecking.

### The Mac regtest test

Nothing it uses changed: this pass touched Law only (the core library's Law module, its WebAssembly bindings, the repo client's Law payloads and the collective client), never Finance, the payment cMIP, the Lightning Module or the harness. It does not need re-running for this pass; the steps of `docs/core-pass-v21.md`, section 5, stand for the approval run.

### Waiting on Nobody, allegedly, in order

1. Flaw D1.
2. Questions D2 to D6.
3. The nine readings above.
4. Approval of Law draft 10 with the core pass drafts; then the human regtest test on the Mac.

*All answered the same day by Nobody, allegedly, recorded as F125, and written in: section 8.*

## 8. F125 written in

*Main merged in first (the findings log, F125). Law draft 10, core v21, freeze suite v21 and one page v6 revised in place; the core library, its WebAssembly bindings, the repo client's Law payloads and the collective client built and tested. Nothing is approved.*

### What changed, in plain words

**A fork is never undone over a debt (D1).** Before, a debt left out of the fork act stopped the fork, and a debt someone hid was owed by both new groups when it surfaced; a creditor publishing a hidden debt late could have undone any fork. Now no debt decides whether the fork happened; it decides only who owes. Each member's client must hand out every debt it knows of; whatever the fork act did not hand out, hidden or not, every new group owes together.
*Precisely:* the fork's completeness no longer checks field 6 against the debts held; `ForkEval::unassigned` lists the debts left out, owed by every successor (`LawView::debtors`), and no longer makes the fork "unsettled". The "unsettled" state of freeze step 3.9g is gone.
*Example:* Ana, Ben and Cy fork. Cy had signed a debt of 50 in the collective's name, sealed to nobody else. A month after the fork, the creditor publishes it. The fork stands; both new collectives owe the 50 together.

**A verifier says where it found a debt (D2).** A collective's debt binds once its outside is on a relay; the verifier reports that it found it there, as it reports what keepers recorded. Written as rule; the code already worked so (`published`).

**The split model, the release rule, and the founding grant (D3, D4, D6).** Naming a split service means a service splits the money; naming none means the payer's wallet pays each holder directly; there is no field for it. Changing the release rule needs every owner's signature and the ordinary clone rule. A grant made in the collective's name before the collective exists is carried by the founding terms every founder signs; afterwards the collective's own key grants and revokes. Written as rules; the code already worked so.

**A group that owes cannot close (D5).** A closing now checks everything the collective owes: its own debts, and any debt it owes as a successor of a fork. One that cannot pay stays open, abandoned, with its debts visible.
*Precisely:* type 20 completeness adds "owes nothing": every binding obligation of the collective before its line, and every obligation `debtors` says it owes as a successor, fulfilled in full by receipts held or ended by a creditor's release. `LawView::owes` shows what a collective owes now.
*Example:* after the fork above, Ana's new group holds nothing but owes the 50 together with the other: it cannot close until the 50 is paid or the creditor lets it go.

**The creditor's release (new).** A creditor can end a debt without full payment, for example in exchange for a share of a work or for part of the money. Only the creditor signs it; nobody else can cancel a debt, and MOR has no court to force one.
*Precisely:* Law type 21, `{ 0 => obligation, ? 1 => [+ hash] }`; field 1 names what the creditor took instead, for the record, never checked. It counts when valid, its signer is the creditor the obligation names, and, for a collective creditor, its consent counts by its own rules (rule 47b). `LawView::debt_release`, `debt_released`, `paid_toward`; WebAssembly `lawDebtRelease`, `lawOwes`.
*Example (bankruptcy):* a collective owes a lender 1,000 and can pay only 300. By a clone of its agreement it gives the lender 40% of its one work. The lender signs a release of the rest, naming the payment and the clone. The collective owes nothing; its members never owed anything personally; still holding 60% of the work, it stays open.

**A stray payment (reading 9, corrected).** Money paid by mistake to the old split service after a fork is owed to the new groups in the shares the fork act gave them for that work, the default shares only where the act named none.
*Precisely:* `LawView::stray(receipt, stake)` takes the stake the offer sold, since the standing offer's format is still open; where the fork named shares for some stakes and the caller cannot say which, the shares are shown as undetermined.

**Readings 1 to 8 confirmed.** Each "reading (to confirm)" they stood for is now plain rule text in Law draft 10.

### One tension (not worked around)

**Tension T1. A successor owes a debt it never signed for.** *Plain words:* MOR's rule 1 says nobody is bound except by their own signature. Under D1 (and already under N13 for a hidden debt), every new group owes a debt the fork act did not hand out. But a new group signs the fork act only when it is handed a debt, so a group that was handed nothing never signed anything, yet owes. Its members signed the fork act, each with their own identity, and they founded the group as a successor; the group itself did not sign.
*Example:* Ana's side is handed no debt, so Ana's new group never signs the fork. Cy's hidden 50 surfaces. Ana's group owes it, though it signed nothing.
- (a) It owes by being named as a successor in a complete fork its members signed: a stated exception to rule 1. *Built so.* *In the example:* Ana's group owes the 50.
- (b) Every new group signs the fork act, not only those handed a debt, so that its own signature binds it. Rule 1 is kept as written, at the cost of one more signature per side, which each side, having founded its group for the purpose, can give. *In the example:* Ana's group signed the fork, so it owes the 50 by its own signature.
- (c) Only a new group that signed the fork act owes a debt left out. *In the example:* Ana's group owes nothing; the other group owes the whole 50; this lets a side escape a hidden debt by being handed nothing.
**Lean: (b).** It keeps D1 whole and rule 1 literal; (c) reopens the door D1 closed.

### Questions the writing needed, one at a time

**E1. Must a creditor's release be public?** A release to the public domain must be; for a debt's release, F125 says nothing.
*Example:* the printer releases the collective privately, sealing the release only to its members. A stranger who saw the debt on a relay still sees it as open, and the closing as not taking effect.
- (a) No: it counts wherever a verifier holds it, as every act does; the collective, wanting its closing to count everywhere, publishes it. *Built so; the collective client publishes it.*
- (b) Yes: like the debt's outside, it must be public to count.
**Lean: (a).** Nobody is harmed by a release kept private; the debtor is the one with a reason to spread it.

**E2. Which lanes does a collective's release of a debt owed to it need?**
*Example:* a collective lent 500 to another and wants to forgive 200. Its Finance lane is held by its treasurer, its Law lane by two others.
- (a) As any Law act, by its own rules: the lane reaching type 21. *Built so.*
- (b) Finance and Law, as giving up money owed is a money decision as much as a legal one, as N7 did for a release to the public domain.
**Lean: (b).** Forgiving money is a Finance decision; the treasurer should not be bypassed.

**E3. How does the core know which work a stray payment paid for?** Reading 9 needs the stake the offer sold, but the standing offer's format is open.
- (a) Once the offer's format is made exact, it names the stake (agreement and index). *Meanwhile the caller says which; where the fork named shares for some stakes and the caller cannot, the shares are undetermined.*
- (b) The fork act always names shares for every stake, so the question never arises.
**Lean: (a).**

**E4. Should Finance list "released" among an obligation's states?** Finance rule 7 lists unsigned, open, discharged and past its terms; a Finance-only reader would still show a released debt as open.
- (a) Yes: "released (Law: the creditor's release)", as "unsigned" already rests on Law. One line in Finance draft 6, which this pass was not asked to touch.
- (b) No: Finance shows money only; Law shows the release.
**Lean: (a).**

### Readings taken, to confirm

1. A creditor's release ends the whole debt, whatever was paid toward it; to forgive only part, the debtor signs a new obligation for the rest, and the creditor releases the old one.
2. A release counts wherever held, need not be published, and ends a debt whether or not that debt binds yet.
3. Field 1 (what the debt was released against) is a record only, never checked.
4. A new group that is itself forked later passes on what it owes the same way: the later fork may hand out the original's debt by naming it; what it does not hand out, every new group of the later fork owes.
5. A closing checks every debt the collective owes as a successor, whenever it arose: the original's line, not the new group's, places it.

### Code and tests

- **Core library.** The fork no longer refuses an unassigned debt; `debtors` follows a chain of forks; `closing` checks `open_debts` with inherited debts and creditor's releases; new `DebtRelease` (type 21), `debt_release`, `debt_released`, `paid_toward`, `owes`; `stray` takes the stake and reports undetermined shares. WebAssembly: `lawDebtRelease`, `lawOwes` added. Repo client: `debtReleasePayload`, `LAW_TYPES.debtRelease`.
- **Collective client.** A creditor's release, signed by the creditor alone (the page lists each collective's debts and those of the collective it was forked from); the closing checks what the collective owes before signing and names each debt and its creditor; the fork's review says that the client assigns every debt it holds and that a debt left out is owed by every successor; the verifier also loads the debts of the collectives a successor came from.
- **New and rewritten tests:** core: 3.9 (no fork refused over a debt; the stray payment by the stake), 3.9g (a hidden debt surfacing after the fork owed by every successor, the fork standing; a successor that owes cannot close, then closes once one debt is paid and the other released; a fork leaving a published debt unassigned stands), 3.9f (a closing refused while two debts are open, one paid, the other released after a partial payment; a member's "release" ending nothing), 3.9h (a bankrupt collective settling by stakes and a release), the release's format. Client: the "Money and endings" test now has the successor's closing refused while it owes the original's debt, the creditor's release, then the closing.
- **Results:** Rust workspace **287 passed, 0 failed** (284 before, plus 3). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 19, connector 12, desk 8: **111 passed**, every one typechecking.

### The Mac regtest test

Nothing it uses changed: this pass touched Law only (the core library's Law module, its WebAssembly bindings, the repo client's Law payloads and the collective client), never Finance, the payment cMIP, the Lightning Module or the harness. It does not need re-running for this pass; the steps of `docs/core-pass-v21.md`, section 5, stand for the approval run. If E4 is answered (a), it changes one line of Finance text, no code.

### Waiting on Nobody, allegedly, in order

1. Tension T1.
2. Questions E1 to E4.
3. The five readings above.
4. Approval of the whole set (below); then the human regtest test on the Mac.

*Answered on 4 October 2026 by Nobody, allegedly, recorded as F126: section 9.*

## 9. F126 written in, and where it stopped

*4 October 2026. Main merged in first (the findings log, F126; one conflict in the log, two additions kept side by side). Law draft 10, Finance draft 6, Envelope draft 7, Production draft 6, the payment cMIP draft 2, core v21, freeze suite v21 and one page v6 revised in place; the core library, its WebAssembly bindings, the repo client and the collective client built and tested. The Lightning Module draft 2 is unchanged (below). Nothing is approved.*

**The short answer.** Three of F126's four rules are written in and built: when a group's act counts (item 1), the creditor's release as a money act (item 3), and a purchase naming its claim (item 4). The fourth, a fork having to hand out every act done before its line (item 2), is **not written**. The check you asked for first failed: the fork's line says where an act was *signed*, never when it was *published*, and F126 makes publishing part of being done. That is flaw W1 below. So D1 (every successor owes what the fork missed) still stands, and tension T1 with it. Writing item 4 found a second flaw of the same kind, W2: a payment can't be placed against the act that superseded the claim it names. Readings 1, 2, 3 (adjusted) and 5 are written as rule text; reading 4 waits with W1.

### What changed, in plain words

**A group's act counts only once everyone can read it (item 1).** Whatever a collective does, signed with its key or by someone working under its grant, binds it only once two things are true: it is sealed to every member, and it can be found on one of the relays the group's terms name. Before that, even signed, it is a plan and binds no one, its signer included. A group's terms now list its relays, and they change like any other term. One relay is enough.
*Example:* Cy holds the group's everyday key and signs a debt of 50 in its name, sealed only to the printer. It binds no one. Sealed to every member but never put on the group's relay, it still binds no one. Once it is on the relay, it binds the group.

**Forgiving a debt is a money act (item 3).** The creditor's release moves from Law to Finance. A group that is owed money forgives it through its Finance lane alone. If the forgiveness is traded for something in the future (a share of income, a stake), that trade is also a deal: a Law agreement of its own, signed by the group's Law lane. The release names that agreement as what it was given against. Finance now lists "released" among a debt's states.
*Example:* a group lent 500 and forgives it. Its release counts once the treasurer (the Finance lane) signs; another member's signature changes nothing.

**Buying names what you buy (item 4).** A payment for a work that a Law agreement claims is a purchase only if it names that claim: the agreement, and the point at which the buyer's client read it as current. So buying needs a client that reads Law. A payment that names no claim is not a purchase: the money is owed back to the payer, by the refund rule Finance already has. A split service whose grant has ended stops asking for payments. Reading 9 (a stray payment passed on to the new groups) and question E3 are withdrawn.
*Example:* after a fork, a wallet that only reads Finance pays the old split service for the old offer. The payment names no claim, so the money goes back to the payer. A full client naming the claim at the fork buys the work.

**A consequence, written in.** Freeze step 2.4 had a Finance-only wallet buying a claimed song. Under item 4 that payment is no purchase and is owed back; only the full client's payment, naming the claim, buys the song. Step 2.4, and Finance's matching scenario line, now say so.

### Precisely

- **Item 1.** Law rule 35a (new); terms field 25 `[+ relay]`, `relay = [ operator: hash / null, hint: tstr ]`, required in a collective's terms, invalid in a deal's, operational (field reference `[0, 25]`). "Sealed to every member": every party of the agreement in force for the act among its recipients (Envelope `to`), or the act public. "On a relay": the verifier states on which relays it found each act (`LawView::published`, now act → relays, generalising D2); an entry naming an operator matches any relay of that operator, an entry with no operator matches its address. Checked in `consent` (new answer `NotDone`) for every act the collective's key signs except records, in `backing` for grantees' acts, and in `obligation_binds`, which replaces "found on a relay". Rule 47a's N13 client-conformance sentence ("sealed to every member") is now this validity rule. Envelope draft 7: one note on `to`.
- **Item 3.** Finance type 4, `release-payload = { 0 => hash, ? 1 => [+ hash] }` (the same shape as Law type 21 under F125); Finance rules 7 (states: "released") and 7a; Law type 21 retired, never reused; Law rule 47b rewritten (the Finance lane alone; a release traded for future terms is also a Law agreement, signed by the Law lane, named in field 1, binding on its own); the closing names Finance type 4.
- **Item 4.** Finance receipt and claim field 9, `purchase = [ agreement: hash, line: hash ]`; Finance rule 10c; Law rule 32a; the payment cMIP's commitment gains an optional eighth element, the purchase, encoded only where there is one; Production's task table, row 6, names it among the payment task's inputs. Rule 47a "Money after it" replaces reading 9. `LawView::purchase` replaces `LawView::stray`: "purchase", "no purchase" (with whom a refund is owed to), or "superseded" (undetermined, W2).
- **Readings, confirmed and written:** 1 (a release ends the whole debt; to forgive part, a new obligation and the old one released) and 2 (a release counts wherever held, even before the debt binds) in Finance rule 7a and Law rule 47b; 3, adjusted (what a release was given against is a record, never checked; terms it was traded for are their own Law agreement, binding on their own) in rule 47b; 5 (a closing checks every debt it owes as a successor, placed by the original's line) in the closing's text. 4 waits with W1.
- **Answered and recorded:** E1 (a release need not be public; the collective client still publishes it), E2 (the Finance lane alone), E4 ("released" in Finance). T1 was answered by item 2, which is not written, so T1 stays open until W1 is decided.

### The check you asked for: does N2's line cover every act in a collective's name?

**No.** The fork's line (N2) names the original's chain act and the latest act of each of its sequences. It places every act the original's key signed by where it sits in those sequences: in the ancestry of a named tip means before; anywhere else means after. It says nothing about publishing, and under item 1 publishing is half of being done. Three kinds of act are in the collective's name:
1. **Acts its key signs.** The line places where they were signed. Their publication has no place in any sequence: a verifier only states that it found an act on a relay, never when. That gap is flaw W1.
2. **Grantees' acts** (signed by someone under the collective's grant). The line never places them; history rule 2 says only the collective's own acknowledgement, payment or import places them. Rule 47a's grant clause already gives them a fate at a fork: acknowledged before the fork, a debt of the original; otherwise they wait for a successor to take them up or seal them. I read that as covering them, with no new rule needed.
3. **Members' signature acts on the collective's acts.** They are placed by the act they sign (C1). They are the members' own acts, not acts in the collective's name.

So the line covers the second and third kinds and fails the first, which is where debts live. As you asked, I stopped there and did not write item 2.

### Two flaws and a question (not worked around)

**Flaw W1. The fork's line places where an act was signed, never when it was done.**
*Plain words:* F126 says an act is done when it is sealed and published, and that the fork must hand out every act done before its line. The line can tell signed-before from signed-after. It cannot tell published-before from published-after. That leaves two holes.
- *Case 1, publishing late undoes the fork.* Before the fork, Cy signs a debt of 50 in the group's name, sealed to every member but never published. The members fork; the debt is not handed out. A month later the printer publishes it. The line puts it before the fork (it sits in the group's sequence), and it is now done. By item 2 the fork never took effect, which is exactly what F126 meant to rule out.
- *Case 2, leaving a device out escapes a debt.* The group's tablet signed a public debt of 300 to a printer, sealed to every member, on the group's relay. At the fork, the members name only the laptop's latest act in the line. The line puts the tablet's debt after the fork, so it "can never be done" and need not be handed out. The members escape a public debt by leaving out the device that signed it. A closing's line has the same hole today, so a group could close while owing.
- **(a)** The line decides "before"; publishing decides only whether an act binds. The fork must hand out every obligation of the original that is sealed to every member and placed before its line, published or not. Client conformance: a member's client signs a fork only once it holds every act of the original before the line, and names every sequence it knows. *Case 1:* the members' clients saw the debt (it was sealed to them) and must hand it out, so publishing it later changes nothing. *Case 2:* left to the clients; a group whose members all agree can still leave a device out.
- **(b)** The relays the terms name place publication. Each relay may sign a commitment listing the acts it holds (Envelope type 2, already defined). An act is done before the fork when a named relay committed to holding it before that relay committed to holding the fork act. An act no named relay held before the fork can never be done; one that was, on whatever sequence, must be handed out. *Case 1:* no named relay held the debt before the fork, so it can never be done, and the fork stands. *Case 2:* the relay held the tablet's debt before the fork, so it must be handed out. Cost: it rests on the relays' honesty about order, as keepers' records already do, and a collective's relays must publish commitments.
- **(c)** Keep D1: a fork never waits on a debt, and every successor owes whatever it missed. T1 stays open.
**Lean: (b).** It closes both holes and uses what F126 itself added, the relays the group names. (a) closes the first hole by client conformance only, and the second not at all.

**Flaw W2. A payment can't be placed against the act that superseded its claim.**
*Plain words:* F126 says a payment naming a superseded claim is no purchase. Ana buys a song naming the claim as it stood on Monday. On Tuesday the group forks, which supersedes Monday's claim. On Wednesday Ben's stale wallet pays naming Monday's claim too. Both payments name the same thing. Ana's receipt, Ben's receipt and the group's fork sit in three different sequences, and nothing orders them. A verifier cannot refund Ben without refunding Ana.
- **(a)** Delivery decides, as rule 32 already does for offers. A payment naming a claim is a purchase once the seller delivers under it. The original's delivery after its fork counts for nothing, so Ben's payment gets no delivery that counts and is owed back, while Ana's was delivered before the fork. This is checkable where the seller delivers with its own key, and undetermined where a split service delivers under the original's grant.
- **(b)** The claim as the verifier holds it now decides: every payment naming an old line is refunded, Ana's included.
- **(c)** Undetermined, stated: the payee's side settles each one, visibly, by delivering or refunding.
**Lean: (a).** *Meanwhile:* the core shows such a payment as undetermined. A payment naming no claim is no purchase, as decided, and that part is built.

**Question W3. Do a group's own lines have to be done too?** A record (Law type 17) is an act in the group's name, and it draws the line the history rules count from.
*Example:* a key holder draws a record registering a member's resignation, sealed to nobody, never published.
- (a) Yes: a record that is not done is no line, and puts nothing in force.
- (b) No: a record is history, judged by its place in the sequence, and the clone it names already carries the members' own signatures.
**Lean: (a)**, since information should run free. It changes how lines are found, so it is not built: records and the group's identity-chain acts are judged as before, and the condition is checked on everything else.

### Readings taken writing it, to confirm

1. "Sealed to every member" means every party of the agreement in force for the act is among its recipients, or the act is public. A departed holder is not a member.
2. "In a collective's name" means signed with the collective's key, or by a grantee under its grant. A member's own signature act on such an act is the member's.
3. Relays are named as homes are: an operator, or none, and an address. They are required in a group's terms and forbidden in a deal's; changing them is operational.
4. "The line at which a claim is current" is a version of the claiming agreement, or the fork, closing or release that last changed who is paid for the work. A purchase is a payment for a standing offer, or for a publication of a work that some agreement held claims. A tip, or a payment toward a debt, names nothing.
5. The payment commitment carries the purchase only where there is one, so every other payment commits to exactly what it did before. An anonymous claim's key signs the same fields as before, since the commitment already binds the purchase to the rail.
6. Collectives founded before F126 name no relays, so their terms are now invalid. Test collectives must be founded again; they are test acts, to be wiped before the first real acts.

### Code and tests

- **Core library.** Terms field 25 and `Relay`, checked; field 25 operational and reachable by an area; `LawView::published` now records act → relays; `LawView::done`, and `Consent::NotDone` in `consent`; `backing` and `obligation_binds` require done. Finance type 4 `Release`, and receipt and claim field 9 `Purchase`; Law's `DebtRelease` and type 21 removed; `debt_release` and `debt_released` read the Finance act, its consent counting by the Finance lane. `LawView::purchase` replaces `stray`. Payment cMIP: `Commitment.purchase`, the eighth element only where present. WebAssembly: `published` now takes `{ act, hint, operator? }`; `readTerms` shows the relays; `lawConsent` reports `not-done`; new `lawDone` and `lawPurchase`; `lawDebtRelease` reads the Finance act.
- **Repo client.** Terms carry the collective's relays (from its settings, kept on with every change); `debtReleasePayload` is a Finance type 4 payload (`FINANCE_TYPES.release`); `receiptPayload` can name a purchase; the release verifier states on which relays it found the release.
- **Collective client.** Founding names the relays; every change keeps them; the verifier states where it found each act; the creditor's release is published as a Finance act, its reading saying so and naming the Law agreement when forgiveness is traded for terms; the fork's debt check reads the members' agreement, which "sealed to every member" needs; the reading of an agreement names its relays in plain words.
- **New tests.** Core: an act done only once sealed and on the relays, for a debt, a publication and a grantee's act (3.9i); relays changed by a clone, matched by operator, refused in a deal and required in a collective; a collective forgiving by its Finance lane (3.9j); purchases after a fork (no claim: no purchase, refund to the fan; the old claim: superseded, W2; the fork: a purchase; a wrong line: none), replacing the stray-payment checks in 3.9; the release's Finance format, and the retired type 21; Finance round trips for the release and the purchase field. Repo client: terms without relays refused.
- **Results.** Rust workspace **290 passed, 0 failed** (287 before, plus 3). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 19, connector 12, desk 8: **111 passed, 0 failed**, every one typechecking. Changed to F126 rather than added: the fork test's stray-payment checks (now purchases), the release's format test, the release in 3.9f and 3.9h (now Finance acts), and every collective's test terms (now naming a relay).

### The Mac regtest steps

**No change.** None of the run's five payments is a purchase: each pays a payee pointer, as a tip would. A payment that is no purchase commits to exactly the same seven elements as before, so every invoice's description hash, receipt and claim is byte for byte what it was. The harness and the Lightning Module tests changed only to say "no purchase" where they build a commitment. The steps of `docs/core-pass-v21.md`, section 5, stand as written, on this branch. The Lightning Module draft 2 carries only the commitment's hash, so its text is unchanged. A regtest purchase would need a work under a claim and an offer, which the run does not have; the core tests cover purchases offline.

### Waiting on Nobody, allegedly, in order

1. Flaw W1 (the fork's line places signing, not publishing), and with it item 2, tension T1 and reading 4.
2. Flaw W2 (a payment against the act that superseded its claim).
3. Question W3 (whether records must be done).
4. The six readings above.
5. Approval of the whole set: Law 10, Finance 6, Envelope 7, Identity 11, Production 6, core v21, suite v21, one page v6, the payment cMIP and Lightning Module draft 2; then the Mac regtest run once.

## 10. F127 written in

*4 October 2026. Main merged in first (the findings log, F127; one conflict, in the roadmap, both sides kept). Law draft 10, Finance draft 6, Envelope draft 7, core v21, freeze suite v21 and one page v6 revised in place; the core library, its WebAssembly bindings, the repo client and the collective client built and tested. Identity draft 11, Production draft 6, the payment cMIP draft 2 and the Lightning Module draft 2 are unchanged (below). Nothing is approved.*

**The short answer.** All of F127 is written in and built: the two chains, an act counting once done and citing the head, the fork handing out its whole history (D1 withdrawn, T1 gone), the tie rule, sales recorded on the actions chain (W2), records held to "done" (W3), and the six readings, the relays now constitutional. Writing it found two questions about a grantee's act at an ending (G1, G2), one flaw where no actions chain settles a superseded claim (W4), and two smaller questions (W5, W6). None is worked around; each is below with an example and options.

### What changed, in plain words

**A group keeps two chains.** One holds its decisions: founding, changes to its terms, who joins and leaves, a split or a closing. The other holds its actions: debts, payments, publications, releases, sales, and what someone working under its grant does. Every action now says, inside it, which decision it acts under and which earlier actions it follows. When two devices act at the same moment, the next act names both, joining them. A decision says which actions it saw, as it already did.
*Example:* the group's laptop signs a payment while its tablet signs a publication. The laptop's next act names the tablet's publication too: from then on both are in the chain, one behind the other.

**An act counts as soon as it is done.** If you act within your powers, you act for the group: once your act is sealed to every member and on the group's relay, and names the group's latest decision as you knew it, it counts. It is judged under the decisions it names, not under one it never saw.
*Example:* the treasurer adopts a new payment rule; the group records it on the laptop. The tablet, which had not heard yet, signs a receipt under the new rule, naming the old decision. Under the old decision that rule was never adopted, so the receipt counts for nothing. Before F127 the receipt was judged under the new rule because the record "came before it" by a quirk of which device drew it.

**A split hands out everything in its history, or does not happen.** The split act names the group's latest actions. Every debt in that history, published or not, must go to one of the new groups; otherwise the split does not take effect. What lies outside that history counts for nothing. So nobody can undo a split by publishing a debt late (it was either in the history, and handed out, or outside it, and void), and no new group ever owes a debt it did not sign for. D1 ("every new group owes what the split missed") is gone, and with it tension T1.
*Example:* Cy signed a debt of 50, sealed to every member, not yet published. The split must hand it out. A month later the printer publishes it: it binds the new group that took it, and the split stands.

**The ending wins.** If a split, a closing or a member's removal, and an act using the powers it ends, never named each other, the act is void.
*Example:* the group closes, citing the laptop's latest act; meanwhile the tablet signed a public debt that the laptop never cited. The closing takes effect and the debt is void. The printer protects itself by waiting until the group's chain visibly moves past its debt before delivering.

**A payment becomes a sale once the group records it (W2).** The payment is the buyer's act; the sale is the group's, on its actions chain: its receipt, or its split service's under its grant. A sale recorded before a split stays a sale. A payment the old group's chain never recorded before the split is no purchase, and the money goes back to the payer.
*Example:* Ana pays for the song on Monday; the group's receipt records it. On Tuesday the group splits. On Wednesday Ben's old wallet pays naming Monday's claim; the old group's key, closed by the split, records it, and that counts for nothing. Ana bought the song; Ben is refunded.

**A group's records must be done too (W3).** A record that is not sealed to every member and on the relay draws no line and changes nothing.
*Example:* a key holder draws a record registering Ben's resignation, sealed to Ben alone. It is no line, and Ben's voice remains until a record everyone can read registers it.

**Changing a group's relays is constitutional.** "Because so much stands on it": the relays are the group's notice board. It now needs the constitutional rule (every member by default) and a rotation; no area and no ordinary majority can do it.

### Precisely

- **Two chains** (Law rule 35b, "Made before, made after", new point 7; Definitions: decisions chain, actions chain, history, tie rule). An action names, in its inside's `objects`, entries `[collective, act]` (the collective's identity as chain): the decision it acts under (a record of the collective, or its genesis or a rotation, under the action's own key or an earlier one) and each head of another device it joins; its own sequence's `prev` counts as cited. These entries come after those the act's type defines, all on that one chain; Law's formats that fix `objects` (signature, release, resignation, declaration, terms) accept them there (`chain_citations`). An action citing no decision, or naming there an act not on the collective's chain, is on no chain and counts for nothing (`Consent::Uncited`). Grantees' acts cite the collective's chain the same way. Identity's own everyday acts carry no objects (Identity) and are on neither chain.
- **History and before.** A line's history is its own sequence, the tips it names, what each act reached cites on the chain, and the tips of each record reached; an act is before a line when that history holds it (`before_struct`, `before_line`, with `history`). A rotation keeps Identity's rule, its kept tips alone, for the collective's own acts.
- **The agreement in force for an action** is what its decisions leave: the chain's declarations, records under earlier keys carried forward (B1), and, under its own key, the records its history holds and those before them (`in_force_action`, rules 37c and "Collectives in the identity chain"). B2's "every record an act is not before counts, a concurrent one included" now holds for records alone.
- **The tie rule** ("Made before, made after", 7). A fork's or closing's history decides what of the original counts; a line removing a voice removes it for every act its history does not hold, an act judged under a version earlier than the one the departure names included (`voices`, the "later" case).
- **The fork** (type 19, rule 47a "Debts" and "Grants"). Complete only when field 6 hands out every obligation in the history it cites, published or not, paid or not, save one sealed neither to every member nor publicly (never the collective's), and every obligation an earlier fork handed to the original where the original's signature on that fork lies in the history (F125 reading 4, as adjusted in F126); and only when the verifier holds every act that history names. An obligation of an ended collective outside that history binds no one (`obligation_binds`), and `debtors` returns none for it. A grantee's deal the fork's history cites binds; any other is void. `ForkEval.unassigned` now lists what the fork fails to hand out.
- **W2** (rule 32a; Finance rule 10c). Sellers are the collectives holding the work's stake in the agreement named, or the successors where the claim names a fork. A recording act: the payment's receipt itself, an act acknowledging it, or a receipt for the same rail proof, signed by the seller (counting) or by a grantee whose backing reaches the seller, where the claim named was current as that act's agreement in force reads the work's stake, and, where the current claim is the seller's release, before it. `PurchaseVerdict::Unrecorded` is new: the claim is current and no recording act exists yet. A collective seller's superseded claim with no recording act is `NoPurchase` where a fork or closing superseded it, else `Superseded` (W4).
- **W3** (Record, rule 35a). A record not done is no line (`RecordEval.line` false), puts nothing in force, registers nothing and places no signature.
- **Relays** (field 25; tier table row 25). Constitutional; a field reference `[0, 25]` is invalid.
- **The claim line** (reading 4, confirmed): a version is where the claim stands when the work's stake in it differs from its parent's (`claim_version`).
- **Wording withdrawn:** D1's joint liability (type 19, rule 47a, reasoning); "the superseded case is undetermined until flaw W2"; the F126 reading that records are judged as before; field 25 "operational, changeable like any term".

### How the sequences map onto the two chains (the check you asked for)

**Plainly:** the decisions chain is the "lines" the group already drew; the actions chain is the devices' sequences, one strand per device. What was missing was the stitching between strands, and actions saying which decision they act under. F127 adds both, inside each action; no decision's format changes.

**Precisely:**
- **Decisions.** Genesis and rotations are the identity chain: each rotation names the latest act of every sequence (kept tips), the actions it saw, by Identity's rule. Records name their own sequence's previous act and the other sequences' tips (field 1): the action head they saw, the previous decision lying in that history. Forks and closings name a chain act and tips. So "each decision cites the previous decision and the action head it saw" was already true of F109's lines; it is now read as a history, transitively, through records reached.
- **Actions.** Each device's sequence (F24: one line per device, `prev`, position, running summary) is one strand of the actions chain; each act cites its previous one by `prev`. Before F127, strands met only at a line. Now an action also names, in `objects`, the other strands' heads it knows, so the next act joins them, and the decision it acts under. A grantee's act, on its own sequence, joins the collective's chain by those citations alone.
- **What changed in judging.** "Before a line" now follows joins as well as sequences. The agreement in force for an action comes from the decisions its history holds, no longer from every record it is not before. For endings, F109's "every act a line does not hold counts as after it" is exactly the tie rule, so departures, forks and closings judge as before, with joins.
- **What did not change.** Positions, running summaries and kept tips (Envelope, Identity); rotations' kept ancestry; keepers placing the collective's own acts (C4); members' signatures placed by the collective's acts (C1, C2, A2). The ordering simulation (`harness/ordering`) models F109 without joins or citations; it runs unchanged (21 stories pass) and was not extended to F127.

### Flaws and questions (not worked around)

**Question G1. A grantee's act and a revocation that cite neither each other.**
*Plain words:* the tie rule speaks of a decision ending powers. A revocation ends a grant's powers, but F127 lists it nowhere, and it is an act of the group like a payment, so an action.
*Example:* the group revokes its agent's grant on the laptop while the agent, citing the group's latest act, signs a deal; neither names the other.
- (a) The tie rule reaches every act that ends powers, a revocation included: the deal is void.
- (b) A revocation is an action like any other: both count, the deal binds.
- (c) Rules 40 to 43 as they stand: the seal ends the deal unless the group acknowledged, paid on or imported it.
**Lean: (a)**, for the tie rule's own reason: an ending cannot be raced. *Meanwhile:* revocations' format is still open, and the core refuses them; the text says only that a grantee's act the revocation's history holds binds.

**Question G2. A grantee's act at the same moment as the line that froze its area.**
*Plain words:* when an area's last holder leaves, its grants end, and C8 leaves the grantee's unplaced acts undetermined until the refit, which can take them on. The tie rule would void the ones made at the same moment as that line.
*Example:* the agent publishes under the releases area's grant while, on another device, the group registers Ana stepping down, the area's last holder; neither names the other.
- (a) The tie rule: void, the refit unable to take it on; C8 only for acts made after the line, which name it.
- (b) C8 for both: undetermined until the refit decides; the tie rule reaches forks, closings and voices only.
- (c) Void for both; a reinstatement takes nothing on.
**Lean: (b):** the tie rule keeps an ending from being held up, and a freeze is not held up by an undetermined deal; the refit decides each one, visibly. *Meanwhile:* C8 stands for it; an act the freezing line's history holds is backed (F127 item 2), which is built.

**Flaw W4. A superseded claim no actions chain settles.**
*Plain words:* W2 works because a group's sales are on its chain. Where the seller is no group, or the claim is superseded by a release or a clone that neither cites the sale nor is cited by it, there is still no telling whether a payment came before or after.
*Example:* two musicians, no group, change their deal to new shares in their song. A fan's old wallet pays naming the old version. Nothing orders the payment against the change.
- (a) Delivery decides: the seller's delivery, on the seller's own sequence, against the seller's own signature on the change.
- (b) Undetermined, stated: a seller who wants every sale settled sells through a group, whose chain settles it.
- (c) The claim as the verifier sees it now decides: every payment naming an old version is refunded, honest buyers before the change too.
**Lean: (b)**, F127's own tool, at no cost to sellers who need none. *Meanwhile:* shown as undetermined.

**Question W5. Must a split or a closing be done?**
*Plain words:* W3 holds the group's records to "done". A split and a closing are decisions too, but members sign them with their own identities, so they are not "in the group's name" (reading 2).
*Example:* the members sign a split sealed only to themselves and never put on the group's relay; someone reading the relay cannot see the group ended.
- (a) Yes: a split or closing counts only once readable by every member and on one of the group's relays.
- (b) No: it counts wherever held, as now.
**Lean: (a)**, the relays being the group's notice board. *Meanwhile:* judged as before; the collective client publishes both on the relays anyway.

**Question W6. A group's negotiation messages.**
*Plain words:* a negotiation message's format has no room for the chain's citations (a first message names nothing; a later one names exactly its thread, so a citation would read as a thread).
- (a) Citations after the thread, a first message carrying none.
- (b) Negotiation messages are talk, binding nothing, on neither chain; the deal they lead to is signed, and that signature is an action.
- (c) A group negotiates only through someone under its grant.
**Lean: (b).** *Meanwhile:* nothing in the core judges a negotiation message's consent, so nothing changes.

### Readings taken writing it, to confirm

1. The mapping above: decisions keep their formats and cite by what they already name; actions cite in `objects`, after their type's entries, on the chain named by the group's own identity.
2. Which acts are actions: every act signed with the group's key except records and Identity's own acts; and grantees' acts. Identity's own everyday acts (a witness act, routes, an encryption key) carry no objects and are on neither chain.
3. An action is judged under the records its history holds and those before them; B2's "a concurrent record counts" now holds for records alone (freeze step 3.7g changed accordingly).
4. "Ending powers": a split, a closing, and a line removing a voice (a resignation, a stepping down or a declaration registered by a record; a rotation taking a member out or a holder off an area).
5. "Everything in that history": every debt the group signed there, published or not and paid or not, so that whether a split happened never changes with what happens after it; save a debt sealed neither to every member nor publicly, which was never the group's; plus what an earlier split handed it. While an act that history names is not held, the split is not complete for that verifier.
6. W2's "records it": the payment's receipt by the group or its split service under its grant, an act acknowledging it, or a receipt for the same rail proof, where the claim named was current there. A payment naming the current claim not yet recorded is shown as "unrecorded".
7. The claim line: a version changes "who is paid for the work" only where the work's stake in it differs from its parent's.
8. Genesis and rotations meet W3 by Identity's own rules (public, at the group's homes), not the relays.
9. A verifier states where it found every act in a group's name, records included (the repo client now does).

### Code and tests

- **Core library** (`core/src/law/view.rs`, `formats.rs`, `tiers.rs`). New: `Consent::Uncited`; `PurchaseVerdict::Unrecorded`; histories following joins and records' tips (`history`, cached), `uncited`, `known_records`, `in_force_action`; `before_struct` and `before_line` read histories, grantees' acts included; `line_missing`; the fork's `to_hand_out` and the public `hand_out`; `debtors` without joint liability; `obligation_binds` void outside an ending's history; `backing` requiring the chain and applying the tie rule at a fork, a freezing line's citation backing an act; records not done are no line; W2's `sellers`, `recorded` and `claim_version`; `chain_citations` in the formats; field 25 constitutional, `[0, 25]` refused.
- **WebAssembly.** `lawConsent` reports `uncited`; `lawPurchase` reports `unrecorded`; new `lawHandOut(specs, collective, agreement, chainAct, tips)`; `lawFork`'s `unassigned` is what the fork fails to hand out.
- **Clients.** The identity file (genesis client) carries `cites` for a collective: every everyday act it signs cites that decision, except Identity's own acts and records; a record or a rotation becomes the new decision. The repo client founds collectives citing their genesis; its release verifier states where it found every act of the collective. The collective client's fork hands out what the core finds in the history its line cites (`lawHandOut`), and its reading says the ending wins.
- **Tests.** Core, new: 3.9k (a sale recorded on the actions chain), 3.9l (a record not done is no line), 3.9m (two chains), 3.9n (the ending wins); rewritten: 3.9 (`a_collective_forks`), 3.9g (`a_fork_hands_out_its_whole_history`, replacing `a_fork_leaving_a_debt_unassigned_stands`), the relays (`a_collectives_relays_change_by_the_constitutional_rule`), 3.7g's third-sequence act, the area freeze (a grantee's act cited by the line stays backed; one citing nothing is not backed), the done test's grantee act; every test collective's devices cite its chain (`Person.cite` in the test helpers). Repo client: a release cites the collective's latest decision; one citing nothing is refused. Collective client: the fork's reading.
- **Results.** Rust workspace **294 passed, 0 failed** (290 before, plus 4). Clients genesis 14, repo 11, longform 15, barebone 9, reader 16, manage 7, collective 19, connector 12, desk 8: **111 passed, 0 failed**, every one typechecking.
- **Changed to F127 rather than added:** 3.7g's act in a third sequence (now judged under the decision it cites, and counting for nothing); the stale payment in 3.9 (now refunded, W2) and the payment naming the fork (now unrecorded); the unpublished debt in 3.9 (now handed out); the grantee's uncited deal at the fork (now void); the relays test (constitutional).

### The Mac regtest steps

**No change.** No collective takes part in the run, so nothing in it needs to cite a chain, and none of its five payments is a purchase. The payment commitment, the Lightning Module and the harness are untouched. The steps of `docs/core-pass-v21.md`, section 5, stand as written.

### Waiting on Nobody, allegedly, in order

1. Question G1 (a grantee's act and a revocation that cite neither each other).
2. Question G2 (a grantee's act at the same moment as the line freezing its area).
3. Flaw W4 (a superseded claim no actions chain settles).
4. Question W5 (must a split or closing be done).
5. Question W6 (a group's negotiation messages).
6. The nine readings above.
7. Approval of the whole set: Law 10, Finance 6, Envelope 7, Identity 11, Production 6, core v21, suite v21, one page v6, the payment cMIP and Lightning Module draft 2; then the Mac regtest run once.

## 11. F128 written in

*4 October 2026. Main merged in first (the findings log, F128; one conflict, in the roadmap, both sides kept). Law draft 10, Identity draft 11, Envelope draft 7, Finance draft 6, Production draft 6, the payment cMIP draft 2, the Lightning Module draft 2, core v21, freeze suite v21 and one page v6 revised in place; the core library, its WebAssembly bindings and the genesis, repo, collective, reader and connector clients changed and tested. Nothing is approved.*

**The short answer.** All of F128 is written in and built: grant keys (G1 by the tie rule), an emptied area ending its grants with nothing left undetermined (G2), named relays withdrawn from validity, W4, W5, W6, N13's public outside and D2 withdrawn, and the nine readings as confirmed. Writing it found three questions (H1 to H3): what a client without Law sees of a grant key, a grant by someone who is not a collective, and the handover. None is worked around; each is below with an example and options.

### What changed, in plain words

**Someone a group hires gets a key of the group, limited to the job.** Before, the group's agent signed with their own key and pointed to the grant; their deals lived outside the group's record, which is why G1 and G2 had no answer. Now the grant names a key the agent made, the agent signs once to accept it, and what the agent signs with that key is the group's own act, on the group's record like any of its devices. Taking the grant back removes the key; if the agent signed something at the same moment and neither act names the other, the taking-back wins.
*Example:* the label hires Marco to sign gig deals. Two of his deals are named by the label's later acts; a third, signed on his laptop while the label revokes him on its tablet, is named by nothing. The two count; the third is void. If the label later pays on the third, it has adopted it, and it counts.

**When the last person running an area leaves, the area's hires end at once.** No waiting, no "undetermined": what the group's record held before that moment counts, the rest is void. Members see an empty area as an emergency, and the new holders can bring a hire back by copying the old grant, which takes on nothing from before.
*Example:* Ana, the only one running releases, steps down. The publisher's post that the label's record already named counts; one posted at the same moment, and everything after, is void. After the refit, Cy copies the publisher's grant; the publisher posts again under the copy.

**Where an act is stored no longer matters.** An act of a group counts once every member can read it (sealed to them all, or public) and it names the group's latest decision as its signer knew it. Groups no longer name relays in their terms; relays are just where clients publish and look first.
*Example:* a debt sealed to every member of the label counts even if no relay ever held it; one sealed to the printer alone still counts for nothing.

**Which version a buyer pays for is settled where the payment really happens.** With an invoice (Lightning), the seller's own invoice names the version: the buyer gets what the seller asked for. Where the buyer just sends money to an address, each owner's own record decides: money an owner recorded before signing the new version is a sale under the old one; after it, not; and unless every owner's receipt is a sale, everyone gives the money back.
*Example:* two musicians move from 50/50 to 60/40. A fan pays the old version on an address-only rail; both had already signed the change before recording the receipt: both refund, and the fan buys again.

**A split or a closing counts only once every member can read it**, like everything else. **Negotiating is talk**: it binds nothing and can stay private; the deal it leads to is an act like any other.

### Precisely

- **Grant keys** (Law rules 38 to 44, grant field 9, definitions "Grant", "Grant key"; Identity "Scoped keys"). The grant names, in field 9, a signing key in Identity's form, made and kept by the grantee; it counts only once the grantee signed a signature act naming it, a grant by founding terms included. An act signed with the grant key has the collective as signer and the grant as `binding`; Identity shows it as **scoped** (new status) and leaves it to Law. Law backs it (`Backing`, `Consent::Granted`, `Consent::Ungranted`) when the grant counts and was accepted, the act cites its grant on the collective's chain, is done, lies within the grant's reach, signs no decision, and no decision ending the grant fails to hold it. It is judged at the latest link among its grant and the decisions it cites; its strand is followed by `prev`. Grants and revocations are decisions, citing as actions do.
- **Revocation** (type 10, now exact: `{ 0 => grant }`). Signed with the grantor's own key, judged by the grant's area alone (Q29). An act of the grant key its history holds binds; any other is void (G1, the tie rule), unless the collective adopts it by an act of its own key that counts (A6, kept).
- **G2** (rule 37b). A departure leaving an area held leaves its grants in force; one emptying it ends them at that line: acts its history holds bind, the rest are void. `Backing::Undetermined` and C8 are gone. A reinstatement clones the ended grant (fields 0 to 6), with its own key, accepted again, and takes nothing on.
- **Every grant key ends at a fork's line** (rule 47a, as before for grants).
- **Done** (rule 35a): sealed to every member of the agreement in force, or public, and on the chain citing its head. `LawView.published` and the relay check are removed; terms field 25 is withdrawn, refused on decoding and never reused; the tier table's row 25 and the area reference to it go. A verifier states where it found acts as information only (the repo client's `foundAt`).
- **W4** (rule 32a; Finance rule 10c; payment cMIP; Lightning Module; Production row 6). A rail Module states whether it is a request rail or a push rail; `LawView.push_rails` (bindings: `specs.pushRails`) lists those the verifier read as push. Request rail: a purchase under the claim the request committed to; a collective seller's once its chain records it (W2). Push rail: each holder of the work's stake in the claim named signs its receipt for the one rail payment (same rail proof); a person's receipt is no sale where its own sequence holds that person's signature on a superseding act before it; a collective's, where the version in force for it is past the claim; every receipt a sale: a purchase; any not: no purchase, every holder refunds; a holder missing: unrecorded. `PurchaseVerdict::Superseded` is gone.
- **W5** (rule 47a): a fork or closing not sealed to every member, nor public, takes no effect.
- **W6** (rule 35a): a negotiation message of a collective is `Consent::Talk`: binding nothing, on no chain, never held to "done".
- **N13 and D2** (rule 47a "Debts"): an obligation of a collective binds once done; where it is held decides nothing.
- **Readings 1 to 9** written as rule text: decisions keep their formats (1); actions are every act signed with the collective's key or a grant key, save decisions and Identity's own acts (2, adjusted, and below); judged under the decisions their history holds (3); decisions ending powers: fork, closing, departure, revocation, a departure emptying an area (4, adjusted); everything in a fork's history (5); a sale recorded by the collective's receipt or its split service's, signed with its grant key (6, adjusted); a version changes who is paid only where the work's shares differ (7); founding and rotations done by Identity's own rules, no relays (8, adjusted); where a verifier found an act is information only (9, adjusted).
- **Withdrawn wording**: C8 and Flaw H's "sealed or reinstated at the refit", the branch model of rules 39 to 44 for collectives, field 25 and its paragraph, "one is enough", the relays' constitutional tier, N13's public outside, D2, W4's undetermined state, "found on a relay" throughout.

### Questions found writing it (not worked around)

**Question H1. What a client without Law sees of a grant key.**
*Plain words:* the grant that hands out the key, and the revocation that removes it, are Law acts. Identity, the ground layer, cannot read Law. So something has to say, below Law, that the key belongs to the group.
*Example:* the label's split service signs a receipt with its grant key. A fan's wallet that reads only Finance cannot tell whether that key is the label's.
- (a) As built: Identity learns that an act may be signed by a "scoped" key installed by a higher rulebook's act; it checks the signature and shows the act as "scoped"; Law decides the rest; a client without Law shows it as unknown.
- (b) Identity installs the key itself, by a new Identity act signed with the group's everyday key, naming the key, who holds it, and a scope Law defines; the grant names that act. Every client can then tell the key is the group's. Costs: two acts per grant, a removal act in Identity too, and a grant written in founding terms (signed by a founder before the group exists) cannot install one.
**Lean: (a)**, F128's own mechanism (the grant installs the key, the revocation removes it); before F128 a Finance-only wallet could not tell a split service's receipt was the group's either. *Meanwhile:* (a) is built.

**Question H2. A grant by someone who is not a group.**
*Plain words:* F128 decided keys for a group's grants. Law still lets a single person grant, and a person has no record of decisions on which a revocation could place its agent's acts.
*Example:* a singer, no group, lets an agent sign gig deals; the singer revokes on the phone while the agent signs a deal on the laptop; neither names the other.
- (a) Grant keys for everyone, a person's revocation placing the agent's acts by the person's own lines (the device problem F109 solved for groups comes back).
- (b) As before: the old branch model (seal, import, the `for` field), which no verifier implements.
- (c) Only groups grant: a person who wants an agent forms a group with them, as parties who must judge absence together form one (B19).
**Lean: (b) meanwhile, (c) to decide:** nothing in V1 needs a person's grant. *Meanwhile:* refused, as before.

**Question H3. The handover.**
*Plain words:* rule 41 let a group hand an agent's deals over to another agent's branch. With grant keys there is no branch: the deals are the group's own acts, and a void one counts only if the group adopts it.
*Example:* Marco is revoked; the label wants Sofia to manage deal 4, which the revocation voided.
- (a) Withdraw the handover; the group adopts what it wants (import, its format still open) and Sofia manages it under her own grant.
- (b) Keep it, as an act moving responsibility for an ended grant's acts to another grant, which then answers for them.
**Lean: (a).** *Meanwhile:* neither format is exact, and a verifier refuses both; freeze step 3.5's handover is reasoned only.

### Readings taken writing it, to confirm

1. The grantee makes the grant key and keeps its secret; the grant names its public part. The grant counts only once the grantee signed it, a grant in founding terms included (replacing D6's "the service shows its acceptance by receiving").
2. An act signed with a grant key cites its grant on the collective's chain, follows its strand by `prev`, and is judged at the latest link among its grant and the decisions it cites.
3. A grant survives the collective's rotations; only a revocation, a departure emptying its area, a fork or a closing ends it.
4. A grant key signs no decision (record, grant, revocation), and none of its acts places a member's signature or adopts another act.
5. Grants and revocations are decisions, citing in `objects` as actions do; so actions are every act signed with the collective's key or a grant key, except decisions, negotiation messages and Identity's own acts.
6. A6 kept: a void act of a grant key binds where an act of the collective's own key that counts acknowledges, pays on or imports it, adopting it; at a fork, only before its line.
7. A reinstatement repeats fields 0 to 6, has a key of its own, is accepted again, and takes nothing on.
8. Request or push is stated in the rail Module's specification; every rail Module under payment cMIP draft 2 is a request rail; a verifier states which rails it read as push.
9. One push payment to several holders is one rail payment: their receipts carry its rail proof.
10. "After the holder's signature": the receipt's own history holds it (before it in the same line, for a person; the version in force for it, for a group). A receipt on another device of the holder, knowing nothing of the signature, is a sale. *Cost, stated:* each holder answers for its own devices.
11. A split (type 8) stays signed with the split service's own identity; its receipts in the group's name use the grant key, so their signer and payee are both the group.
12. Terms carrying field 25 are refused; test collectives founded under F126 or F127 naming relays are founded again (reversing F127 reading 6).

### Code and tests

- **Core library.** `core/src/chain.rs`: `Status::Scoped`. `core/src/law/formats.rs`: grant field 9 (`Grant.key`), `same_grant` ignoring it; `Revocation` (type 10); `Terms.relays` and `Relay` removed, key 25 refused (F128). `core/src/law/tiers.rs`: row 25 gone. `core/src/law/view.rs`: `key_grant`, `founding_grant`, `valid` (Identity's status, a grant key's included), `own_key`, `strand`, `link`; decisions include grants, revocations and founding grants; histories follow grant-key strands; `consent` routes grant-key acts to `backing` (`Consent::Granted`, `Ungranted`), negotiation messages to `Consent::Talk`, revocations to the grant's area; `backing` rewritten (acceptance, citation, reach, done, fork, revocations, emptied areas, adoption; `Backing::Undetermined` removed); `done` and `not_done` without relays (`published` removed); forks and closings must be sealed to every member or public (W5); `purchase` split into request and push rails (`push_rails`, `claim_holders`, `holder_receipts`, `superseding`, `after_own_signature`; `PurchaseVerdict::Superseded` removed); a release counted against a receipt only where the receipt's history holds it.
- **WebAssembly.** `status` reports `scoped`; `lawConsent` reports `granted`, `ungranted`, `talk`; `lawBacking` no longer reports `undetermined`; `lawPurchase` no longer reports `superseded` (`supersededBy` removed); `specs.published` replaced by `specs.pushRails`; terms no longer carry `relays`.
- **Clients.** Genesis: an identity file keeps the grant keys it holds (`makeGrantKey`, `keepGrantKey`). Repo: `grantPayload(grantee, key)` with field 9; terms without field 25; the release verifier states where it found each act as information only (`foundAt`). Collective: a split service makes its grant key, the grant names it, the service signs to accept; the founding terms name no relays; its Law verifier no longer passes where acts were found; the terms' reading says what "done" means now. Reader: plain words for `scoped`. Connector: the standing list names `scoped`.
- **Tests.** Core, new: `a_revocation_ends_the_grant_key` (3.9r, G1), `a_collectives_negotiation_is_talk` (3.9q, W6), `a_superseded_claim_settles_on_each_holders_chain` (3.9o, W4), `a_closing_must_be_done` (3.9p, W5), `terms_field_25_is_withdrawn`; rewritten: `an_emptied_area_ends_its_grants` (3.7m, G2, replacing `an_area_freezes_and_its_grants_wait_for_the_refit`), `an_act_in_the_collectives_name_is_done_once_sealed_wherever_held` (3.9i), `a_record_not_done_is_no_line` (3.9l), `a_collective_forks` (3.9: the grantee's deals on two devices, signed with the grant key; the unpublished debt binds), `a_sale_is_recorded_on_the_actions_chain` (3.9k: the split service's receipt signed with its grant key), `open_formats_are_refused_not_guessed` (a revocation's format is exact; an import's is open); removed: `a_collectives_relays_change_by_the_constitutional_rule`. Every test collective's terms lose field 25. Repo client: field 25 refused. Collective and connector clients: fixtures without relays in the terms.
- **Results.** Rust workspace **298 passed, 0 failed** (294 before, plus 4). Clients: see the table below, every one typechecking.

| Client | Passed | Failed |
| --- | --- | --- |
| genesis | 14 | 0 |
| repo | 11 | 0 |
| longform | 15 | 0 |
| barebone | 9 | 0 |
| reader | 16 | 0 |
| manage | 7 | 0 |
| collective | 19 | 0 |
| connector | 12 | 0 |
| desk | 8 | 0 |
| **All** | **111** | **0** |

### The Mac regtest steps

**No change.** No collective takes part in the run, so no grant key, revocation or "done" check is exercised; its payments are on Lightning, a request rail, and none of them is a purchase, so W4 changes nothing there. The payment commitment's bytes, the Lightning Module's rule and the harness are untouched. The steps of `docs/core-pass-v21.md`, section 5, stand as written.

### Waiting on Nobody, allegedly, in order

1. Question H1 (what a client without Law sees of a grant key).
2. Question H2 (a grant by someone who is not a group).
3. Question H3 (the handover).
4. The twelve readings above.
5. Approval of the whole set: Law 10, Finance 6, Envelope 7, Identity 11, Production 6, core v21, suite v21, one page v6, the payment cMIP and Lightning Module draft 2; then the Mac regtest run once.

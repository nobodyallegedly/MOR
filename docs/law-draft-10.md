# Law draft 10, and the seven rules of the core pass

*3 October 2026. Branch `claude/core-pass-v21` (continued; main merged in first, for F118, F119 and V3, and again for F120 and F121), not merged. Section 5 writes in F120 and F121; section 6 writes in F121's answers, F122 and F123, with main merged in again first; section 7 writes in F124, main merged in a third time. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved; Law draft 9 stays beside draft 10 until approval. Core v21, freeze suite v21 and one page v6 are revised in place, with no new version numbers.*

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

# Law draft 10, and the seven rules of the core pass

*3 October 2026. Branch `claude/core-pass-v21` (continued; main merged in first, for F118, F119 and V3, and again for F120 and F121), not merged. Section 5 writes in F120 and F121. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved; Law draft 9 stays beside draft 10 until approval. Core v21, freeze suite v21 and one page v6 are revised in place, with no new version numbers.*

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

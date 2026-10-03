# Law draft 10, and the seven rules of the core pass

*3 October 2026. Branch `claude/core-pass-v21` (continued; main merged in first, for F118, F119 and V3), not merged. Written for Nobody, allegedly: plain words first, then the precise version. Nothing here is approved; Law draft 9 stays beside draft 10 until approval. Core v21, freeze suite v21 and one page v6 are revised in place, with no new version numbers.*

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
   *Where:* core v21. Law draft 10 keeps draft 9's wording here, because of J1.
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

## Waiting on Nobody, allegedly

In order:
1. J1 (above).
2. The five readings of section 1.
3. Whether the examples kept in section 3 (technology names) may stay.
4. Approval of Law draft 10, with the core pass drafts (Finance 6, Envelope 7, Identity 11, Production 6, core v21, suite v21, one page v6).
5. Then the human regtest test on the Mac (`docs/core-pass-v21.md`, section 5).

*Found on the way, outside this task:* rule 46a keeps, for each member, the judicial clauses that member signed. When two members signed different versions of one judge (say, two time references), nothing says which judge decides a dispute between those two members. Noted here; not touched.

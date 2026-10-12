# MIP: Development

*Draft 7, 12 October 2026: a transition draft, for Nobody, allegedly, to review and approve (F251). It is draft 6 (approved 5 October 2026, revised in place since, last for F250 at the split Module build) written for plain reading, in Agreements draft 11's and Money draft 7's style. **It changes no rule**: how cMIPs and Modules are made, used and paid most of the time comes first and the mechanics of rare cases after, and the rules are numbered afresh in reading order, each with its old number beside it. The tasks table is brought up to date with what Agreements draft 11 already decided, each such item marked "carried from Agreements draft 11": the split task choosing the receiver for a payment (F250, a table line, already written into draft 6 in place at the split Module build, to approve again, and now marked), and the proof checker of a proven offer (F261, a paragraph under the table). Written against core v21, Identity MIP draft 11, Envelopes MIP draft 7, Text MIP draft 6, Money MIP draft 7, Agreements MIP draft 11 and the findings F1 to F266. The record of how each rule came about (the revision notes of drafts 4 to 6, "Decided in this draft", and the dates and words of each decision) stays in draft 6 and in the findings log; this draft does not repeat it. The freeze-ready draft that follows drops the old numbers.*

## How to read this draft

Normal text is the protocol. Italic text is commentary: reasons, examples and plain summaries. A summary that starts *In short* repeats what the rule says; where the two seem to differ, the rule's own text decides.

Each rule shows its number in draft 6 beside its new number: "Rule 25 (was 3a)". The table at the end maps every old number to its new one. Code comments, tests, records and the other drafts (Agreements draft 11 and Money draft 7 among them) keep citing the old numbers until the freeze-ready draft; the table is how to find them here. Agreements rules are cited here by draft 11's numbers, and Money rules by draft 7's; each of those drafts maps its own old numbers.

Some marks recur, and each matters to the next review:

- *Client conformance:* a duty of clients. The protocol cannot check it from acts alone, so it is stated for builders.
- **[for technical review at freeze]:** a parameter the freeze's technical review settles.
- **Carried from Agreements draft 11 (Fxxx):** an item of the tasks table that states what Agreements draft 11 already decided. It is not new in this draft.

The MIP has four parts. Part one is cMIPs and Modules as they run most of the time: naming a specification, freezing it, the tasks, adopting and leaving, signing what a rule computes, earning, and discovery. Part two is the rare cases and the mechanics: extensions, the machine verification rules run on, predecessors, and the trust root and successors. Part three is the specification format, for reference. Part four is the reasoning, the open parameters and the freeze scenarios.

## Purpose

Development defines how the protocol treats everything built above the core: cMIPs and Modules. It answers:

- what a cMIP is, and what a Module is;
- how each is written, identified and published;
- how it plugs into the core, through the tasks the MIPs define;
- how people adopt it, and leave it;
- how its creator is paid when it is used.

The core is frozen; everything above it competes. Development is the grammar of that competition: zero democracy on the MIPs, a free market on cMIPs and Modules, where adoption decides.

## Dependencies

Identity, Envelopes, Text, Money and Agreements. Fees and usage rewards are defined in Money and Agreements, so a Money-only client never depends on this MIP.

## Words used in this MIP

### Specifications

- **Specification.** A document that defines acts, rules or behaviour, identified by its spec hash. The MIPs are specifications; so are cMIPs, Modules, unit specifications, media types and signature schemes.
- **Spec hash.** `tagged_hash("MOR/spec", content)`, over a specification's canonical content. It is what acts name in their `spec` field and what agreements name per task. It is the same wherever the specification is published.
- **cMIP.** A community specification for one task: what it accepts and produces in core terms, the act types it defines, and the rules a verifier runs. Many cMIPs may compete for the same task.
- **Module.** An implementation or extension under a MIP or cMIP: code, a verification rule, the code that plays a media type, a split plan template, a rail. *A unit, a media type and a signature scheme are specifications of their own (kinds 2, 3 and 5; Money, "Unit"), not Modules; the code that plays a media type is a Module (QG5, F191).* Identified by its spec hash. *A Module is a specification: it signs nothing, holds nothing and is paid nothing by itself; the identities acting under it do (F112, F116).*
- **Verification rule.** An executable program, part of a cMIP or Module, that anyone can run to check its outputs, such as a rail Module's check of a rail proof. The rule decides validity; the text explains it.
- **Signature-scheme specification.** A specification of kind 5 that defines a signature scheme's key encoding, signature encoding and verification, so that Identity can name it as a scheme by its hash (F54).

### Tasks and extensions

- **Task.** A point where a MIP hands work to a cMIP. Tasks exist only where the MIPs define them.
- **Extension.** A cMIP an agreement names outside the listed tasks, for work nobody foresaw. An extension may add rules, never relax the core's.

### Creators and users

- **Creator.** The identity that publishes a cMIP or Module and signs it as its own. MIPs have no creator: they are the protocol itself.
- **Adoption.** A client's or user's opt-in to a specification, after which acts under it are no longer unknown to them.

## Part one: cMIPs and Modules as they run most of the time

*How it runs most of the time:* a creator publishes a cMIP or a Module, signed as its own; it is named by the hash of its content and never changes. An agreement names at most one cMIP per task, by the task's number; several Modules may work under it, such as one rail Module per rail. A client adopts a specification by the user's choice, and shows acts under any other as unknown. Before its user signs anything a rule computes, it shows the numbers on an example. A creator who charges states a fee; only an agreement's own fee entry makes it owed, and a Module's use is shown by a party's signature, never the Module's.

### 1. Naming a specification

#### Rule 1 (was 1). By hash

A specification is identified by its spec hash, and labelled under its creator's identity, so names cannot collide. There is no registry.

#### Rule 2 (was 2). Types by spec

Every act names its type within the specification that defines it (Envelopes, F23). Two specifications can never define the same type.

#### Rule 3 (was 3). Creator signature

A cMIP or Module counts as its creator's only when published in an act signed by the creator named inside it. A MIP names no creator.

A specification naming a creator that never published it is shown as unclaimed by that creator; fee terms and reputation displays MUST NOT assume the named creator consented (F82, M28).

### 2. Frozen at publication

#### Rule 4 (was 4). Never updated

A changed specification is a new specification, with a new hash. A specification may name a predecessor, so users can migrate, but the predecessor stays exactly as it was. *Who may name a predecessor: rule 25.*

#### Rule 5 (was 5). Data formats outlive modules

Modules format their data as the MIPs define, so users can move their activity off a fading branch.

### 3. Tasks: the contract between the core and the community

#### Rule 6 (was 5a). Task numbers

Every task has one global number, given in the table below. Agreements name their cMIPs by these numbers (Agreements, terms field 2), so every client counts tasks the same way. A successor protocol may add tasks with new numbers; the numbers here never change.

#### Rule 7 (was 6). Task grammar

For each task, the MIP that defines it states what a cMIP must accept and produce, in core terms. A cMIP that fills a task MUST accept everything the task requires and produce only what it allows.

#### Rule 8 (was 7). One per task, per agreement

An agreement names at most one cMIP per task (Agreements). A client chooses its cMIPs; choosing them is like choosing a sub-network.

#### Rule 9 (was 8). Modules within cMIPs

Several Modules may operate at once under the one cMIP an agreement names for a task (for example several rail Modules under the payment cMIP, one per rail), each naming that cMIP in its field 5. A Module is a specification: it signs nothing; the identities acting under it sign (F112).

#### The tasks the core defines

| Number | MIP | Task | A cMIP accepts | and produces |
| --- | --- | --- | --- | --- |
| 1 | Identity | Identity proofs and credentials | an identity hash and a claim | valid, invalid, pending or unknown |
| 2 | Identity | Naming | a name, or an identity hash | an identity hash, or its names |
| 3 | Identity | Outside link proofs | a link claim and its proof | valid, invalid or unknown |
| 4 | Text | Text format | a canonical text | a rendering that hides only non-letters and adds no text |
| 5 | Envelopes | Media interpretation | a media object or manifest | its interpretation for display or play |
| 6 | Money | Payment | an obligation, offer or payee pointer, an amount, the flow rail or vault entry paid to, and, for a purchase, the claim it pays under (F126) | how rail Modules plug in; how a payment carries what its receipt and claim say; how the receiver's receipt and the payer's claim carry a rail's proof, and the rule that checks it; how a fresh receiving address is obtained under a vault entry; whether each rail Module is a request rail or a push rail (F128, W4) |
| 7 | Money | Conversion | a conversion service's offer, and a hop received on one rail | how the service's receipt with a forward, and its onward hop, are evidenced |
| 8 | Agreements | Split | an amount received and a split plan; and, for a payment, the agreement and the attempts made (carried from Agreements draft 11, F250) | payouts summing exactly, with third-party evidence; and the receiver for this payment, one of the services the signed terms name, in their order, the next only where the attempt before it failed as the cMIP defines failure (carried from Agreements draft 11, F250; Agreements rule 17) |
| 9 | Agreements | Condition evaluation | a condition and the acts it refers to | true, false, pending or unknown |
| 10 | Agreements | Time reference | a point on the reference and an act | before, after or undetermined |
| 11 | Envelopes | Anchoring (F173) | an act id | a proof it existed at a point on a named time reference |
| 12 | Agreements | Grant limits | a grant and an act under it | within limits, or not |
| 13 | Agreements | Work claims | a work hash and a claim | a claim, optionally with a pre-publication commitment |
| 14 | Agreements | Absence proof (F172, F178) | an abandonment declaration, the clause's parameters, and the acts the record's history holds | accepted, refused or unknown |

**Besides the numbered tasks: the proof checker of a proven offer** (carried from Agreements draft 11, F261; Agreements rule 11 and "A service sold under a cMIP's terms"). A proven offer sells a delivery that leaves a proof any verifier can check from data alone, no one's word trusted. It uses the access form, `[ 2, [ cMIP, params ] ]`, under that cMIP's terms. A cMIP may produce the proof; the verifier checks the proof itself, never the cMIP's say-so. A delivery the verifier cannot check from data it holds is not proven, whatever the cMIP signs. *The build's reading (`docs/agreements-draft-11-build.md`): a verifier asks the checker of the cMIP the offer names, among those it holds, for the proof's verdict; with none held, the delivery is not proven for it. Agreements draft 11 gives this checker no task number.*

### 4. Adopting and leaving

#### Rule 10 (was 9). Unknown until adopted

A client that has not adopted a specification shows its acts as unknown and never signs, pays or accepts under it (Envelopes). An act signed under a signature scheme the client has not adopted is unknown in the same way (Identity).

#### Rule 11 (was 10). Adoption by opt-in

A client may fetch a specification by its hash, show it to the user, and adopt it on the user's choice.

#### Rule 12 (was 11). Exit

Agreements are always in core format, so activity on a fading cMIP moves by cloning agreements onto another (Agreements).

### 5. Signing what a rule computes

#### Rule 13 (was 15). Signing what it computes

*Client conformance.* Before signing anything that runs through a rule (a split plan, fee terms, a condition), a client MUST show what the rule actually computes on a concrete example, such as: "on a sale of 10, this split pays Lea 4, the co-writer 4, the publisher 1, the service 0.20."

*The signer approves the numbers the code produces, not the description. This extends the Text MIP's rule, what you sign is what you saw. No verifier can check that a client did this; it is conformance, not validity.*

### 6. Earning

#### Rule 14 (was 16). A creator who charges states its fee in its specification

*In short: a creator who charges states its fee in its specification, for information only; only the agreement's own fee entry makes a fee owed, and nothing is forced.*

A creator who charges states its fee in its specification (field 7; F211). *"Specs should carry as much as possible" (Nobody, allegedly).*

The rate is informative: a client shows a plan paying less than the specification asks. **Only an agreement's fee entry, signed by the power that places fees (Agreements rule 28, terms field 28), makes a fee owed**, and nothing is forced (F42).

Agreements' Module fee terms act (type 15) is retired.

#### Rule 15 (was 17). Usage is evidenced, not tracked, and always by a party

*In short: a Module's use is shown by a party's signature, never by the Module: for a rail Module, the receipt or the payer's claim naming it; for a service, a use record signed by whoever runs it. That record alone pays nothing: a service is paid by a named share the owners chose in advance, or by a role share only where the payer the payment commits to acknowledges its record in its claim.*

Usage is evidenced, not tracked, and always by a party (F116). Receipts and splits name the specifications they ran under (Money, Agreements).

The evidence that a Module was used is signed by a party, never by the Module, which is a specification and signs nothing:

- for a rail Module, the receipt or the payer's claim naming it in field 0 (Money rule 20);
- for a service someone runs on a Module, a use record signed by the identity running the service.

**That record alone pays nothing** (F194):

- a service the owners chose in advance is paid by a named share, with no evidence;
- a service the payer chose at payment time is paid by a role share only when the payer the payment commits to acknowledges its use record in its claim (Agreements rule 22, the relay's rule; F193);
- a service evidenced only by its own record is not paid.

*The record is the role-filler's own signature, the self-evidence F184 closed for relays ("paying for usage invites faking usage"). Whether a client carries a user's choice of service into the payment is good practice for client developers, legible to those who look.*

A plain tip carries no module fees (Money rule 22).

*The use record is defined by the cMIP the service runs under (OF12 b), as the relay transport cMIP defines the delivery record; it binds to the object served, and is spent for its payer's other claims naming the same object (F210); F194's rule applies whatever cMIP defines it (QG3).*

#### Rule 16 (was 18). Bounties

A client or collective may offer a share of future splits to whoever builds a specification it needs. A bounty is an agreement like any other.

### 7. Discovery

#### Rule 17 (was 19). No core registry

Discovery happens through use. Indexes, catalogues and repositories of specifications are clients and services, competing like everything else above the core.

## Part two: rare cases and mechanics

### 8. Extensions

#### Rule 18 (was 8a). New kinds of things need no task

A cMIP may define new act types for anything the MIPs did not foresee, built from core pieces (agreements, obligations, receipts, grants, text, media). Clients that have not adopted it show those acts as unknown.

#### Rule 19 (was 8b). Extensions in agreements

Besides one cMIP per task, an agreement may name any number of extensions by spec hash. A client that does not implement every extension an agreement names MUST NOT sign it.

*Which layers an extension acts on, and so whose approval a collective needs to adopt or drop it: field 10 (Part three).*

#### Rule 20 (was 8c). Add, never subtract

An extension may add rules, never relax the core's. Conservation, the stake rule, required signatures, keeper and rotation rules, and fail-closed always hold, whatever an extension says. A client MUST reject an act that is valid under an extension but invalid under the core.

*This is not mechanically checkable across all clients: determinism is scoped to conforming clients, and an extension's new act types are unknown to non-adopters (F82, M29).*

#### Rule 21 (was 8d). The path to MOR 2

*Extensions in wide use are the natural candidates for tasks in a successor protocol.*

### 9. Verification rules

#### Rule 22 (was 12). One frozen machine

*In short: where a cMIP or Module says anyone can run its rule, the rule is a program for one frozen machine, RV32IM, with fixed memory, an exact step budget, a fixed input and output encoding, and no clock, network or randomness. Its input is the act and the data it names, which may include a chain's headers the client supplies; without them, the rule answers as it says, "unknown" where it says so. Over budget, an environment call or a misaligned access answers "unknown", everywhere.*

Where a cMIP or Module says "anyone can run the same rule", its verification rule MUST be published as a program for RV32IM, the RISC-V 32-bit base integer instruction set with the multiplication extension, with:

- a fixed memory size, stated in the profile;
- an exact step budget, stated in the rule's reference in the specification, every instruction counting as one step;
- no access to clocks, networks or randomness;
- the input (the act and the data it names) and the output (valid, invalid, pending or unknown) passed in the encoding the profile fixes; the data a rule names may include a chain's headers, which the client supplies (F204: a Bitcoin proof is checked against the real chain's headers, handed to the frozen rule as input, never fetched by it); a client holding no such data gets the answer the rule gives without it, "unknown" where the rule says so;
- environment calls and misaligned accesses answering "unknown".

A rule that exceeds its budget answers "unknown", everywhere. The profile (memory layout, input and output encoding, entry point) is published with test vectors before freeze (F78). **[for technical review at freeze]**

#### Rule 23 (was 13). The rule decides validity; the text explains it

Verifiers run the rule, and every verifier must reach the same answer, so the executable rule decides. The text should match it.

#### Rule 24 (was 14). A mismatch is a bug

Since nothing is updated, the fix is a new specification with its own hash, naming the old one as predecessor; users migrate by choice. The faulty specification stays on record, attributed to its creator.

### 10. Predecessors

#### Rule 25 (was 3a). Predecessors are claims

Anyone can publish a specification naming another as predecessor; nothing ties a predecessor to the same creator. A client that suggests successors to its users MUST show when the successor's creator differs from the predecessor's (F82, M27).

### 11. The trust root and successors

#### Rule 26 (was 20). The six hashes

Below the MIPs there is one root: the six spec hashes of the frozen MIPs, published together alongside their texts in the genesis repository. A client learns them from that repository and its own build, and every act it accepts names one of them or a specification that depends on them.

A fork presenting six other hashes is a different protocol, and its acts cannot replay here because every tag begins with `MOR/` and a successor MUST use a different prefix (Envelopes, F82).

#### Rule 27 (was 21). A successor changes the prefix

A protocol that succeeds MOR and reuses its formats MUST use a different tag prefix in every tagged hash, so that no act of one protocol is valid in the other. Migration of identities, agreements and history to a successor is by succession and cloning (Identity, Agreements), never by reinterpretation.

## Part three: the specification format

A specification is a public act (Envelopes type 0, a publication) whose media is the specification's content, published and signed by its creator. The content is:

```cddl
spec = {
  0 => uint,                  ; kind: 0 cMIP, 1 Module, 2 unit, 3 media type, 4 MIP, 5 signature scheme
  ? 1 => hash,                ; creator: identity hash (required for every kind except MIP)
  ? 2 => [+ task-ref],        ; tasks it fills
  ? 3 => [+ type-def],        ; act types it defines
  ? 4 => [+ hash],            ; dependencies: MIPs and specifications it relies on
  ? 5 => hash,                ; implements: the cMIP a Module implements
  ? 6 => [+ rule-ref],        ; verification rules: executable rules, as locked objects
  ? 7 => fee,                 ; the Module's own fee, if the creator charges (F211): machine-readable, informative
  ? 8 => hash,                ; predecessor: an earlier specification this one replaces for its users
  9 => tstr,                  ; the specification itself, as canonical text
  ? 10 => [+ uint],           ; layers: for an extension, the layers it acts on beyond Development (Q18)
  ? 11 => uint                ; a rail Module's kind (OF26 a): 0 a request rail, binding payee and purpose; 1 a push rail binding
                              ;   the commitment where the Module says; 2 a push rail binding nothing (Money rules 11, 18)
}

fee = [ rate, ? paid: hash ]   ; who is paid: absent, the creator (F211)
rate = [ 0, part: uint ]        ; millionths of each payment the Module runs on
     / [ 1, amount ]            ; a fixed amount per payment

task-ref = [ mip: hash, task: uint ]
type-def = [ type: uint, name: tstr, payload-schema: tstr ]   ; schema written in CDDL
rule-ref = [ bytes-hash: hash, size: uint, budget: uint ]     ; the rule's binary, by the hash of its bytes, carried as a separate locked object named by this specification; its step budget
```

### Layers an extension acts on (field 10)

*In short: an extension lists the other layers it adds rules to, so a collective's client knows whose approval adopting or dropping it needs. It is read only where an agreement names the specification as an extension; any other value, or a list out of order, makes the specification invalid. The list is not trusted for enforcement.*

An extension's own acts belong to Development (F106, Q18). Field 10 lists, ascending and without repeats, each other layer whose acts it adds rules to, numbered as the core's layers: 0 Identity, 1 Envelopes and Text, 2 Money, 3 Agreements. A specification whose field 10 carries any other value, or is not ascending, is invalid.

The field is read only where an agreement names the specification as an extension (Agreements, terms field 15); a specification without it declares nothing beyond Development.

*The declaration tells a collective's client whose approval adopting or dropping the extension needs (Agreements, rule 63). It is not trusted for enforcement: in a collective, an extension's rules bind only the layers whose holders approved it, so an extension that under-declares binds nothing beyond them (Agreements, rule 60).*

### The spec hash covers the content

The spec hash covers this content, not the act that publishes it, so the same specification can be published by anyone, anywhere, and remain the same specification (F41).

A rule's binary is not canonical text, so it is carried as a locked media object of its own, and the specification names it by the hash of its bytes; the content field stays canonical text and the spec hash stays stable (F82, M26).

### MIPs have no creator

*Every identity's acts name the Identity MIP by its spec hash, so a MIP cannot name the hash of a creator whose own genesis needs the MIP's hash.*

A MIP's hash is computed over its content alone; the act that publishes it is signed by its publisher, which shows who published it without making them part of its identity. cMIPs and Modules keep the creator field, so their spec hash covers the creator's identity: a cMIP is always "this specification, by this identity".

## Part four: reasoning and freeze scenarios

### Reasoning

- **A hash is a name nobody can take.** *Naming by content hash means no registry, no gatekeeper and no collision, and a specification means the same thing wherever it is copied.*
- **Frozen, so trusted.** *An agreement that names a cMIP must mean the same thing forever. If specifications could change, every signed deal could change under its signers.*
- **Tasks keep the core small and the market open.** *The core decides only where it hands work over and what must come back. How the work is done is where people compete.*
- **Extensions keep the frozen core open-ended.** *Nobody can foresee every task. An extension lets agreements use work nobody defined, while the core's promises stay out of any extension's reach.*
- **Leaving is always possible.** *Because data formats and agreements stay in core terms, no module can hold its users hostage.*
- **Paid for use, never for attention.** *A creator earns when their work takes part in a settlement someone chose to make, through terms the payer or owner signed. Nothing is collected silently.*
- **Rules anyone can run, on one machine that never changes.** *A verification answer is only as good as everyone's ability to check it. One instruction set, not two: "RV32IM or RV64IM" would have been two machines giving two answers. RV32IM is ratified and frozen, integer-only execution is deterministic by nature, metering is exact, and most zero-knowledge machines execute RISC-V, so a verifier could later check a proof that a rule ran instead of re-running it. Authors never write it by hand: common languages compile to it. Anything the profile does not define answers unknown, so a rule can never be right on one client and wrong on another.*
- **The code decides, the signer sees the result.** *A misleading description can fool someone who only reads, but not someone signing through a client that shows what the rule computes. Anyone can compare a rule with its text on test cases, and indexers, reviewers and rival authors all have reason to.*
- **Even cryptography is a specification.** *Naming a signature scheme by its specification's hash means the core never has to be reopened to add one. When a post-quantum signing-key scheme is ready, someone publishes it, clients adopt it, owners rotate to it.*
- **MIPs belong to no one, and the six hashes belong to everyone.** *A MIP is the protocol itself. Leaving the creator out also breaks the circle of a MIP needing an identity that needs the MIP. What holds the whole thing together is six hashes anyone can check, and a prefix no successor may reuse.*

### Open technical parameters

- The RV32IM execution profile: memory size, input and output encoding, entry point, and the treatment of every instruction outside the base set; test vectors (F78, for technical review).
- The CDDL conventions for type definitions in specifications.
- The signature-scheme specification format: how key and signature encodings and the verification procedure are stated (F54).
- How the MIPs themselves are published, so their spec hashes (`IDENTITY`, `TEXT`, `ENVELOPES`, `MONEY`, `AGREEMENTS`, `DEVELOPMENT`) are fixed at freeze. A MIP's frozen text contains only these placeholders, never its own or another MIP's hash, and MIPs do not list each other by hash as dependencies: their dependencies are circular, so they are stated by name. The six hashes are published together, alongside the texts.

### Freeze scenarios

*Each bullet names the freeze suite's scenarios that cover it.*

#### Part one

- Module identity by hash; frozen at publication: 2, 8.
- Consent by whoever bears the cost, including creator-side fees: 2.
- Exit by cloning onto another cMIP: 1.
- Unknown act carried, shown, then adopted by opt-in: 2.
- A split plan shown with its computed payouts before signing: 2.
- A role share paid to the modules a payment ran through, evidenced by a party: the receipt or claim naming a rail Module, or a use record signed by the identity running a service and acknowledged by the payer the payment commits to; the use record alone pays nothing (F116, F194): 2.

#### Part two

- An extension declaring the layers it acts on (field 10); a collective adopting and dropping it with the approval of each layer declared: 3, 8.
- A rail Module's verification rule run by two different clients on the RV32IM profile, giving the same answer; a rule exceeding its budget, or making an environment call, answering unknown on both: 2, 8.
- A signature-scheme specification published; an identity rotates to it; a client without it shows the identity's later acts as unknown and the rotation as valid: 8.
- A successor specification by a different creator shown with the creator mismatch: 8.
- The six MIP hashes stable wherever published; a read-only client checks them against its build: 8.

## Old numbers to new

Draft 6's rules, in their old order, with their numbers in this draft. Every old rule has exactly one new number; none was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| 1 | 1 | By hash |
| 2 | 2 | Types by spec |
| 3 | 3 | Creator signature |
| 3a | 25 | Predecessors are claims |
| 4 | 4 | Never updated |
| 5 | 5 | Data formats outlive modules |
| 5a | 6 | Task numbers |
| 6 | 7 | Task grammar |
| 7 | 8 | One per task, per agreement |
| 8 | 9 | Modules within cMIPs |
| 8a | 18 | New kinds of things need no task |
| 8b | 19 | Extensions in agreements |
| 8c | 20 | Add, never subtract |
| 8d | 21 | The path to MOR 2 |
| 9 | 10 | Unknown until adopted |
| 10 | 11 | Adoption by opt-in |
| 11 | 12 | Exit |
| 12 | 22 | One frozen machine |
| 13 | 23 | The rule decides validity; the text explains it |
| 14 | 24 | A mismatch is a bug |
| 15 | 13 | Signing what it computes |
| 16 | 14 | A creator who charges states its fee in its specification |
| 17 | 15 | Usage is evidenced, not tracked, and always by a party |
| 18 | 16 | Bounties |
| 19 | 17 | No core registry |
| 20 | 26 | The six hashes |
| 21 | 27 | A successor changes the prefix |

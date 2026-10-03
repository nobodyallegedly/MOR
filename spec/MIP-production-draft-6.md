# MIP: Production

*Draft 6, 3 October 2026 (the core pass, core v21). **Not yet approved.** Written against core v21, Finance MIP draft 6, Law MIP draft 10 and findings F1 to F119. Draft 6 is draft 5 with two findings written in, wording only: a rail is a Module under the one payment cMIP an agreement names, and a Module is a specification, which signs nothing (F112: rule 8, task table rows 6 and 7, the definition of a verification rule); and the evidence that a Module was used comes from a party, never from the Module: for a rail Module, the receipt or claim naming it; for a service, a record signed by the identity running it (F116: rule 17). Draft 5, 1 October 2026, was written against core v18, Law MIP draft 7 and findings F1 to F107. Draft 5 was draft 4 with one field added and nothing else changed: an extension declares, in its specification, the layers it acts on (field 10), so that a collective's client knows whose approval adopting or dropping it needs (F106; Law redraft, Q18, recorded under F103). Draft 4, 27 September 2026, was written against core v12, the other MIP drafts and findings F1 to F82. Draft 4 applies review round 2: RV32IM only, with the step budget and the input and output convention fixed; signature schemes as a kind of specification; binary rules carried as locked objects; a successor changes the tag prefix; the six hashes as the trust root; predecessor and creator claims shown for what they are.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

Production defines how the protocol treats everything built above the core: cMIPs and Modules. It answers:

- what a cMIP is, and what a Module is;
- how each is written, identified and published;
- how it plugs into the core, through the tasks the MIPs define;
- how people adopt it, and leave it;
- how its creator is paid when it is used.

The core is frozen; everything above it competes. Production is the grammar of that competition: zero democracy on the MIPs, a free market on cMIPs and Modules, where adoption decides.

## Dependencies

Identity, Envelope, Text, Finance and Law. Fees and usage rewards are defined in Finance and Law, so a Finance-only client never depends on this MIP.

## Definitions

- **Specification.** A document that defines acts, rules or behaviour, identified by its spec hash. The MIPs are specifications; so are cMIPs, Modules, unit specifications, media types and signature schemes.
- **Spec hash.** `tagged_hash("MOR/spec", content)`, over a specification's canonical content. It is what acts name in their `spec` field and what agreements name per task. It is the same wherever the specification is published.
- **Task.** A point where a MIP hands work to a cMIP. Tasks exist only where the MIPs define them.
- **Extension.** A cMIP an agreement names outside the listed tasks, for work nobody foresaw. An extension may add rules, never relax the core's.
- **cMIP.** A community specification for one task: what it accepts and produces in core terms, the act types it defines, and the rules a verifier runs. Many cMIPs may compete for the same task.
- **Module.** An implementation or extension under a MIP or cMIP: code, a verification rule, a media type, a unit, a signature scheme, a split plan template, a rail. Identified by its spec hash. *A Module is a specification: it signs nothing, holds nothing and is paid nothing by itself; the identities acting under it do (F112, F116).*
- **Verification rule.** An executable program, part of a cMIP or Module, that anyone can run to check its outputs, such as a rail Module's check of a rail proof. The rule decides validity; the text explains it.
- **Creator.** The identity that publishes a cMIP or Module and signs it as its own. MIPs have no creator: they are the protocol itself.
- **Adoption.** A client's or user's opt-in to a specification, after which acts under it are no longer unknown to them.
- **Signature-scheme specification.** A specification of kind 5 that defines a signature scheme's key encoding, signature encoding and verification, so that Identity can name it as a scheme by its hash (F54).

## The specification format

A specification is a public act (Envelope type 0, a publication) whose media is the specification's content, published and signed by its creator. The content is:

```cddl
spec = {
  0 => uint,                  ; kind: 0 cMIP, 1 Module, 2 unit, 3 media type, 4 MIP, 5 signature scheme
  ? 1 => hash,                ; creator: identity hash (required for every kind except MIP)
  ? 2 => [+ task-ref],        ; tasks it fills
  ? 3 => [+ type-def],        ; act types it defines
  ? 4 => [+ hash],            ; dependencies: MIPs and specifications it relies on
  ? 5 => hash,                ; implements: the cMIP a Module implements
  ? 6 => [+ rule-ref],        ; verification rules: executable rules, as locked objects
  ? 7 => hash,                ; fee terms: a standing offer (Law), if the creator charges
  ? 8 => hash,                ; predecessor: an earlier specification this one replaces for its users
  9 => tstr,                  ; the specification itself, as canonical text
  ? 10 => [+ uint]            ; layers: for an extension, the layers it acts on beyond Production (Q18)
}

task-ref = [ mip: hash, task: uint ]
type-def = [ type: uint, name: tstr, payload-schema: tstr ]   ; schema written in CDDL
rule-ref = [ bytes-hash: hash, size: uint, budget: uint ]     ; the rule's binary, by the hash of its bytes, carried as a separate locked object named by this specification; its step budget
```

**Layers an extension acts on** (field 10, F106, Q18). An extension's own acts belong to Production; field 10 lists, ascending and without repeats, each other layer whose acts it adds rules to, numbered as the core's layers: 0 Identity, 1 Envelope and Text, 2 Finance, 3 Law. A specification whose field 10 carries any other value, or is not ascending, is invalid. The field is read only where an agreement names the specification as an extension (Law, terms field 15); a specification without it declares nothing beyond Production. *The declaration tells a collective's client whose approval adopting or dropping the extension needs (Law, rule 44b). It is not trusted for enforcement: in a collective, an extension's rules bind only the layers whose holders approved it, so an extension that under-declares binds nothing beyond them (Law, rule 36a).*

The spec hash covers this content, not the act that publishes it, so the same specification can be published by anyone, anywhere, and remain the same specification (F41). A rule's binary is not canonical text, so it is carried as a locked media object of its own, and the specification names it by the hash of its bytes; the content field stays canonical text and the spec hash stays stable (F82, M26).

**MIPs have no creator.** *Every identity's acts name the Identity MIP by its spec hash, so a MIP cannot name the hash of a creator whose own genesis needs the MIP's hash.* A MIP's hash is computed over its content alone; the act that publishes it is signed by its publisher, which shows who published it without making them part of its identity. cMIPs and Modules keep the creator field, so their spec hash covers the creator's identity: a cMIP is always "this specification, by this identity".

## Rules

### Naming and identity

1. **By hash.** A specification is identified by its spec hash, and labelled under its creator's identity, so names cannot collide. There is no registry.
2. **Types by spec.** Every act names its type within the specification that defines it (Envelope, F23). Two specifications can never define the same type.
3. **Creator signature.** A cMIP or Module counts as its creator's only when published in an act signed by the creator named inside it. A MIP names no creator. A specification naming a creator that never published it is shown as unclaimed by that creator; fee terms and reputation displays MUST NOT assume the named creator consented (F82, M28).
3a. **Predecessors are claims.** Anyone can publish a specification naming another as predecessor; nothing ties a predecessor to the same creator. A client that suggests successors to its users MUST show when the successor's creator differs from the predecessor's (F82, M27).

### Frozen at publication

4. **Never updated.** A changed specification is a new specification, with a new hash. A specification may name a predecessor, so users can migrate, but the predecessor stays exactly as it was.
5. **Data formats outlive modules.** Modules format their data as the MIPs define, so users can move their activity off a fading branch.

### Tasks: the contract between the core and the community

5a. **Task numbers.** Every task has one global number, given in the table below. Agreements name their cMIPs by these numbers (Law, terms field 2), so every client counts tasks the same way. A successor protocol may add tasks with new numbers; the numbers here never change.
6. **Task grammar.** For each task, the MIP that defines it states what a cMIP must accept and produce, in core terms. A cMIP that fills a task MUST accept everything the task requires and produce only what it allows.
7. **One per task, per agreement.** An agreement names at most one cMIP per task (Law). A client chooses its cMIPs; choosing them is like choosing a sub-network.
8. **Modules within cMIPs.** Several Modules may operate at once under the one cMIP an agreement names for a task (for example several rail Modules under the payment cMIP, one per rail), each naming that cMIP in its field 5. A Module is a specification: it signs nothing; the identities acting under it sign (F112).

The tasks the core defines:

| Number | MIP | Task | A cMIP accepts | and produces |
| --- | --- | --- | --- | --- |
| 1 | Identity | Identity proofs and credentials | an identity hash and a claim | valid, invalid, pending or unknown |
| 2 | Identity | Naming | a name, or an identity hash | an identity hash, or its names |
| 3 | Identity | Outside link proofs | a link claim and its proof | valid, invalid or unknown |
| 4 | Text | Text format | a canonical text | a rendering that hides only non-letters and adds no text |
| 5 | Envelope | Media interpretation | a media object or manifest | its interpretation for display or play |
| 6 | Finance | Payment | an obligation, offer or payee pointer, an amount, and the flow rail or vault entry paid to | how rail Modules plug in; how a payment carries what its receipt and claim say; how the receiver's receipt and the payer's claim carry a rail's proof, and the rule that checks it; how a fresh receiving address is obtained under a vault entry |
| 7 | Finance | Conversion | a conversion service's offer, and a hop received on one rail | how the service's receipt with a forward, and its onward hop, are evidenced |
| 8 | Law | Split | an amount received and a split plan | payouts summing exactly, with third-party evidence |
| 9 | Law | Condition evaluation | a condition and the acts it refers to | true, false, pending or unknown |
| 10 | Law | Time reference | a point on the reference and an act | before, after or undetermined |
| 11 | Law | Anchoring | an act id | a proof it existed at a point on a time reference |
| 12 | Law | Grant limits | a grant and an act under it | within limits, or not |
| 13 | Law | Work claims | a work hash and a claim | a claim, optionally with a pre-publication commitment |

### Extensions

8a. **New kinds of things need no task.** A cMIP may define new act types for anything the MIPs did not foresee, built from core pieces (agreements, obligations, receipts, grants, text, media). Clients that have not adopted it show those acts as unknown.
8b. **Extensions in agreements.** Besides one cMIP per task, an agreement may name any number of extensions by spec hash. A client that does not implement every extension an agreement names MUST NOT sign it.
8c. **Add, never subtract.** An extension may add rules, never relax the core's. Conservation, the stake rule, required signatures, keeper and rotation rules, and fail-closed always hold, whatever an extension says. A client MUST reject an act that is valid under an extension but invalid under the core. *This is not mechanically checkable across all clients: determinism is scoped to conforming clients, and an extension's new act types are unknown to non-adopters (F82, M29).*
8d. **The path to MOR 2.** *Extensions in wide use are the natural candidates for tasks in a successor protocol.*

### Adoption and fail-closed

9. **Unknown until adopted.** A client that has not adopted a specification shows its acts as unknown and never signs, pays or accepts under it (Envelope). An act signed under a signature scheme the client has not adopted is unknown in the same way (Identity).
10. **Adoption by opt-in.** A client may fetch a specification by its hash, show it to the user, and adopt it on the user's choice.
11. **Exit.** Agreements are always in core format, so activity on a fading cMIP moves by cloning agreements onto another (Law).

### Verification rules

12. **One frozen machine.** Where a cMIP or Module says "anyone can run the same rule", its verification rule MUST be published as a program for RV32IM, the RISC-V 32-bit base integer instruction set with the multiplication extension, with:
    - a fixed memory size, stated in the profile;
    - an exact step budget, stated in the rule's reference in the specification, every instruction counting as one step;
    - no access to clocks, networks or randomness;
    - the input (the act and the data it names) and the output (valid, invalid, pending or unknown) passed in the encoding the profile fixes;
    - environment calls and misaligned accesses answering "unknown".
    A rule that exceeds its budget answers "unknown", everywhere. The profile (memory layout, input and output encoding, entry point) is published with test vectors before freeze (F78). **[for technical review at freeze]**
13. **The rule decides validity; the text explains it.** Verifiers run the rule, and every verifier must reach the same answer, so the executable rule decides. The text should match it.
14. **A mismatch is a bug.** Since nothing is updated, the fix is a new specification with its own hash, naming the old one as predecessor; users migrate by choice. The faulty specification stays on record, attributed to its creator.
15. **Signing what it computes.** *Client conformance.* Before signing anything that runs through a rule (a split plan, fee terms, a condition), a client MUST show what the rule actually computes on a concrete example, such as: "on a sale of 10, this split pays Lea 4, the co-writer 4, the publisher 1, the service 0.20." *The signer approves the numbers the code produces, not the description. This extends the Text MIP's rule, what you sign is what you saw. No verifier can check that a client did this; it is conformance, not validity.*

### Earning

16. **Fees are standing offers.** A creator who charges publishes fee terms as a standing offer (Law). A fee can only be charged where whoever bears it signed for it, and a split that omits a declared fee is visible (Law).
17. **Usage is evidenced, not tracked, and always by a party** (F116). Receipts and splits name the specifications they ran under (Finance, Law). The evidence that a Module was used is signed by a party, never by the Module, which is a specification and signs nothing: for a rail Module, the receipt or the payer's claim naming it in field 0 (Finance); for a service someone runs on a Module, a use record signed by the identity running the service. *That record is the only evidence of use the core provides, and it is enough for role shares that pay "the modules the payment ran through" (Law).* A plain tip carries no module fees (Finance).
18. **Bounties.** A client or collective may offer a share of future splits to whoever builds a specification it needs. A bounty is an agreement like any other.

### Discovery and the trust root

19. **No core registry.** Discovery happens through use. Indexes, catalogues and repositories of specifications are clients and services, competing like everything else above the core.
20. **The six hashes.** Below the MIPs there is one root: the six spec hashes of the frozen MIPs, published together alongside their texts in the genesis repository. A client learns them from that repository and its own build, and every act it accepts names one of them or a specification that depends on them. A fork presenting six other hashes is a different protocol, and its acts cannot replay here because every tag begins with `MOR/` and a successor MUST use a different prefix (Envelope, F82).

### Successors

21. **A successor changes the prefix.** A protocol that succeeds MOR and reuses its formats MUST use a different tag prefix in every tagged hash, so that no act of one protocol is valid in the other. Migration of identities, agreements and history to a successor is by succession and cloning (Identity, Law), never by reinterpretation.

## Reasoning

- **A hash is a name nobody can take.** *Naming by content hash means no registry, no gatekeeper and no collision, and a specification means the same thing wherever it is copied.*
- **Frozen, so trusted.** *An agreement that names a cMIP must mean the same thing forever. If specifications could change, every signed deal could change under its signers.*
- **Tasks keep the core small and the market open.** *The core decides only where it hands work over and what must come back. How the work is done is where people compete.*
- **Extensions keep the frozen core open-ended.** *Nobody can foresee every task. An extension lets agreements use work nobody defined, while the core's promises stay out of any extension's reach.*
- **Leaving is always possible.** *Because data formats and agreements stay in core terms, no module can hold its users hostage.*
- **Paid for use, never for attention.** *A creator earns when their work takes part in a settlement someone chose to make, through terms the payer or owner signed. Nothing is collected silently.*
- **Rules anyone can run, on one machine that never changes.** *A verification answer is only as good as everyone's ability to check it. One instruction set, not two: "RV32IM or RV64IM" would have been two machines giving two answers. RV32IM is ratified and frozen, integer-only execution is deterministic by nature, metering is exact, and most zero-knowledge machines execute RISC-V, so a verifier could later check a proof that a rule ran instead of re-running it. Authors never write it by hand: common languages compile to it. Anything the profile does not define answers unknown, so a rule can never be right on one client and wrong on another.*
- **The code decides, the signer sees the result.** *A misleading description can fool someone who only reads, but not someone signing through a client that shows what the rule computes. Anyone can compare a rule with its text on test cases, and indexers, reviewers and rival authors all have reason to.*
- **Even cryptography is a specification.** *Naming a signature scheme by its specification's hash means the core never has to be reopened to add one. When a post-quantum everyday scheme is ready, someone publishes it, clients adopt it, owners rotate to it.*
- **MIPs belong to no one, and the six hashes belong to everyone.** *A MIP is the protocol itself. Leaving the creator out also breaks the circle of a MIP needing an identity that needs the MIP. What holds the whole thing together is six hashes anyone can check, and a prefix no successor may reuse.*

## Open technical parameters

- The RV32IM execution profile: memory size, input and output encoding, entry point, and the treatment of every instruction outside the base set; test vectors (F78, for technical review).
- The CDDL conventions for type definitions in specifications.
- The signature-scheme specification format: how key and signature encodings and the verification procedure are stated (F54).
- How the MIPs themselves are published, so their spec hashes (`IDENTITY`, `TEXT`, `ENVELOPE`, `FINANCE`, `LAW`, `PRODUCTION`) are fixed at freeze. A MIP's frozen text contains only these placeholders, never its own or another MIP's hash, and MIPs do not list each other by hash as dependencies: their dependencies are circular, so they are stated by name. The six hashes are published together, alongside the texts.

## Decided in this draft

- **F40 / F44 / F78.** Verification rules run on RV32IM, one machine, with a fixed profile.
- **F41.** The spec hash covers the content, not the publishing act.
- **F42.** Module creators earn through signed terms, not automatically.
- **F43.** Extensions: add rules, never relax the core's.
- **F44.** MIPs have no creator; the rule decides validity; clients show what a rule computes before signing.
- **F54.** Signature schemes are specifications.
- **F82.** Binary rules as locked objects; predecessor and creator claims shown; the six hashes; the successor's prefix.
- **F106, Q18 (draft 5).** An extension declares, in its specification's field 10, the layers it acts on beyond Production.
- **F112 (draft 6).** A rail is a Module under the one payment cMIP an agreement names; a Module signs nothing.
- **F116 (draft 6).** Evidence of a Module's use is signed by a party: a receipt or claim for a rail Module, a record signed by the operating identity for a service.

## Freeze scenarios

- Module identity by hash; frozen at publication: 2, 8.
- Consent by whoever bears the cost, including creator-side fees: 2.
- Exit by cloning onto another cMIP: 1.
- Unknown act carried, shown, then adopted by opt-in: 2.
- An extension declaring the layers it acts on (field 10); a collective adopting and dropping it with the approval of each layer declared: 3, 8.
- A rail Module's verification rule run by two different clients on the RV32IM profile, giving the same answer; a rule exceeding its budget, or making an environment call, answering unknown on both: 2, 8.
- A split plan shown with its computed payouts before signing: 2.
- A role share paid to the modules a payment ran through, evidenced by a party: the receipt or claim naming a rail Module, or a use record signed by the identity running a service (F116): 2.
- A signature-scheme specification published; an identity rotates to it; a client without it shows the identity's later acts as unknown and the rotation as valid: 8.
- A successor specification by a different creator shown with the creator mismatch: 8.
- The six MIP hashes stable wherever published; a read-only client checks them against its build: 8.

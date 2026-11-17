# Old Agreements pointers, part 2 of 3: the freeze test suite, cMIPs and Modules

*Written by Claude, 17 November 2026, for the scribe's session P2. A list, and a record of work: not a decision, and no text in the repository is changed by it. Every reading below is Claude's, labelled so where it matters.*

**The wish** (Nobody, allegedly, quoted from the ledger, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." And what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". On now: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite."

**Why this list** (the MOR lead's wording): to show him how big the rewrite really is, before he decides it.

**What was read.** Draft 25 (`docs/agreements-from-scratch/draft-25.md`, branch `claude/agreements-clean-1-hahuwn`), sections 1 to 5 and 8.1; `encoding-2.md`, sections 2 to 6; `docs/lead/proposals/report-block-4.md`; the old Agreements, `spec/MIR-agreements-draft-24.md` on main, as a lookup ("Words used in this MIR" whole, other rules only by number). The part covered: `spec/03-MOR-freeze-test-suite-v37.md`, read whole (called "the suite" below), and the latest draft of each specification in `cmips/` and `modules/`, named only.

## In plain words

1. The freeze test suite (`spec/03-MOR-freeze-test-suite-v37.md`) was written for the old Agreements (the MIR, draft 24). It relies on it ("leans on" it) almost everywhere: 313 places in that one file. Most are about things the new text, draft 25, simply does not have: collectives (several people acting as one identity: 94 places), selling through a "publication" whose "split service" divides each payment, "keepers" that record acts, "claims" of authorship, "stakes" written in millionths, and agreements that end.
2. Only 18 of the 313 are a word to change: the thing is still there, under another name. 81 are a rule to rewrite: the new text answers the same question, but differently. 214 are a concept gone.
3. In several places the new text gives a verifier a different answer, not just different words. Example: a co-owner who sells a work alone was, in the old text, "valid, visibly contradicting" the other owners; in the new one that sale may be "invalid" (U-01). Another: where an agreement has split into two rival versions (a fork), whatever is built on one of them "counts" in the old text and "counts for nothing" in the new (S-110).
4. In 12 cases (some cover several places) Claude could not tell what the new text has instead. Those rows say "unclear (U-01)" and so on; the cases are listed at the end, the 8 that would change a verifier's answer (what checking software says of an act) first.
5. In `cmips/` and `modules/` (the specifications built on top of the core, which people choose), 22 of the 41 latest specifications lean on the old Agreements. Most of them lean on the collective, the publication or the split service.

## How to read this list

- **"Leans on"** means what this session's prompt (from the scribe's list, parts 1 to 3) defined: the place names the old Agreements, cites one of its rules by number, uses one of its fields or field numbers, uses one of its act types, or uses a concept draft 25 dropped or renamed.
- **One row per place.** A place is one checklist line of the suite, or one step of a scenario, or a "Passes if" paragraph. Where one step leans on things of clearly different kinds, it has more than one row. The sentence is quoted exactly; "…" marks words left out of it.
- **Columns.** "file" is always "suite" in the suite's tables. "section or step" is the suite's own label: a checklist line by its layer and its first words, or a step by scenario and number ("3.7an" is scenario 3, step 7an; "3b, 7aj" is step 7aj of section 3b). Numbers in brackets at the end of a quoted checklist line, such as "(all, 3, 8)", are the suite's list of the scenarios that exercise it.
- **"unclear (U-NN)"** in the column "what draft 25 has instead" means Claude could not tell; the case is explained at the end. The row still has a kind, set by the main thing the place tests.
- **Kind** is exactly one of three. *A word to change*: draft 25 has the same thing, under another word, number or field. *A rule to rewrite*: draft 25 has a grammar rule on the same question, which reads differently. *A concept gone*: draft 25 has nothing in its grammar for it. Where draft 25 hands it to a cMIP's socket, the row says so, and the kind stays "concept gone". Where a place leans on several things, its kind is that of the main thing the place tests. This is Claude's way of sorting, and decides nothing.
- **What draft 25 has instead** points to the working list (W1 to W49, A1 to A8) and to draft 25's rules, so that a row does not repeat the list. "Nothing: dropped" means draft 25's grammar has no counterpart.
- G1 to G14 are draft 25's grammar rules, K1 to K8 its tasks (sockets), and E1 to E22 the rules of `encoding-2.md`.

## The working list: what draft 25 dropped or renamed

*Claude's working list, not a decision. It is built from draft 24's "Words used in this MIR", word by word, against draft 25's section 2. "Kept, another meaning" means the word stays and its meaning changes.*

### From draft 24's "Words used in this MIR"

| W | Draft 24's word | What draft 25's section 2 has | Status |
|---|---|---|---|
| W1 | **Terms** (type 0): parties, text, cMIPs, keepers, rules | **Terms**: "an act that states what is agreed"; type 0 in `encoding-2.md` (E2), with its own fields, keys 0 to 19 (section 4 of the encoding). No keepers. | kept, fields renumbered |
| W2 | **Signature** (type 1): "An act by one party naming terms (or a clone, a publication, a transfer, a release) as agreed" | **Assent**: a Statement (type 1) of kind `assent`, "by which its signer agrees to one Terms act" | renamed |
| W3 | **Agreement**: "Terms together with the signatures its rules require. Its id is the id of its terms act." | **Agreement**: "the first Terms act together with every Terms act that replaces it, directly or through others, and every Statement made within them"; its identifier is the **root** | kept, another meaning |
| W4 | **Agreement chain**: the acts on one agreement, "each naming in `objects` the chain and the act it follows" | **Chain**: the versions of one agreement only; one signer's acts are a **line**, by `previous` (G6, G12.1). No `objects` (E3) | kept, another meaning |
| W5 | **Deal**: "An agreement that founds no collective" | **Deal**: an agreement between a service and the agreement it serves | kept, another meaning |
| W6 | **Position**: "An agreement that confers income without ownership" | nothing | dropped |
| W7 | **Proven delivery, promised delivery** | nothing; **Delivery** is a module (section 5.3) | dropped |
| W8 | **Negotiation message** (type 18) | nothing | dropped |
| W9 | **Claim** (type 3): "I claim to have made this." | nothing. The nearest thing is the **baker** an envelope states (G14), and G14.5(b) says a verifier "MUST NOT answer which baker made the work" | dropped |
| W10 | **Ownership agreement** (target, terms field 33; kind 0 a claim, kind 1 a collective) | **Work**: "an agreement whose Terms say who owns something and in what shares. A plain word for a use of the grammar, not a separate thing in it". No target, and nothing for kind 1 | renamed (kind 0); dropped (kind 1) |
| W11 | **Stake** (terms field 7, in millionths) | **Shares**: "The grammar gives them no form: they are read from the Terms' words, as the body's cMIP gives them (task K1)" | renamed, form dropped |
| W12 | **Owners' consent** (with the owners' matters the suite names beside it: a holders' rule, an issuance, a proxy) | nothing | dropped |
| W13 | **Publication** (type 6): "the offer" | **Offer**: "an agreement whose Terms name a party by role (a spot, G10)"; draft 25 says "That reading is Claude's (section 8.4)" | renamed, another form |
| W14 | **Split agreement** | nothing | dropped |
| W15 | **Partner**: a share "off the top" | nothing | dropped |
| W16 | **Price tag** (Money type 5), as Agreements reads it | nothing in draft 25; a payment "names the version it read (G13.2)" | dropped from Agreements |
| W17 | **Purchase**: "A payment naming a price tag a publication counts" | the **buyer's leg**: a buyer signs the offer's Terms by an assent, and "Paying is a leg, with the buyer as its doer (G11.7)" | renamed, another rule |
| W18 | **Vow**: its own chain; "each sale of it is pending, confirmed or contested (rule 13)" | **Vow**: "the same thing but without bytes attached", the same thing as an offer. No sale states; the confirmation of a payment is a report (G11.7) | kept, another meaning |
| W19 | **Request rail, push rail** | nothing (a payment's form is the layer that holds value's, section 5) | dropped from Agreements |
| W20 | **Split plan** (publication field 4) | nothing in the grammar; dividing is a K6 cMIP's (section 5.1, first row) | dropped |
| W21 | **Owners' line** | nothing | dropped |
| W22 | **Split service** | **Service**: "a signer who does a job for an agreement (dividing what it is paid, holding a payment); a hand", under a **deal**; task K6 | renamed |
| W23 | **Split** (type 8) | **Leg report** (G11.3, K6's row): a report of the shared language's block (`report-block-4.md`; encoding-2, section 6) | renamed, another form |
| W24 | **Payout** | **Leg**: "A payout divided among five is five legs" | renamed |
| W25 | **Role share**: "A share assigned to a role rather than to a named party, filled when the payment happens" | nothing of that name; **role** now means a spot (G10). "The agreed witness" is a spot's cMIP (K5) with a witness module (section 5.1) | dropped; word kept, another meaning |
| W26 | **Keeper** (and its records, type 2) | **Place**: "an ordered place to look, read as the layer that orders acts gives it" (G7), named by an identifier. It records nothing that draft 25 defines | replaced by another thing |
| W27 | **Belongs to** | nothing (no `objects`, E3) | dropped |
| W28 | **Arbitrator or verifier**: a third party who judges content | **Judge**, a module (section 5.3). **Verifier** in draft 25 means "whoever applies these grammar rules to a set of acts" | renamed; "verifier" another meaning |
| W29 | **Judge**: a specification for a judicial task (9, 10, 11, 14) or an identity | **Judge**, a module; "the judicial" is the contest, a judge named in Terms, and a power to resolve a fork (G5.6(c)) | kept, another meaning |
| W30 | **Chain of judgment** (terms field 21) | nothing | dropped |
| W31 | **Time reference** | **Clock** (G7.4) | renamed |
| W32 | **Concurrency rule** (already retired) | nothing | dropped |
| W33 | **Contest**: "A signed objection to another act, by someone with standing (rule 54)" | **Contest**: a Statement of kind `contest`, "made against an offer or a vow" (G11.8). "Who else may make a contest, and when, is not said (section 8.4)" | kept, another meaning |
| W34 | **Standing**: "Who may contest an act" | **Standing**: "what one signer's acts show about them, to anyone who looks", not a task (section 5.3) | kept, another meaning |
| W35 | **Collective**, **This collective**, **Key grammar**, **Control model**, **Layer rule**, **Area**, **Voice**, **Departed holder** | nothing: "the grammar has no separate notion of a collective" (section 2, "Shares"); an agreement can be a party (G1), with powers (G5) | dropped |
| W36 | **A collective's acts, in order**: the collective's chain, **Record** (type 17), **Line** (a collective's), **Decisions chain**, **Actions chain**, **History**, **Tie rule**, **Done** | nothing. "Line" in draft 25 means a signer's acts or an agreement's chain (G12.1); order comes from citing (A7) | dropped; "line" another meaning |
| W37 | **Change rules**: the constitutional change rule (field 18), the rule of each layer (field 19), the control model's powers | **Update condition** (K4): "Update equals constitution" (G5.6(a)); by default "everyone who signed the original" (G4.11(e)) | renamed (constitutional rule); dropped (the rest) |
| W38 | **Power**: "The right to bring a change into force" | **Power**: "an entry in Terms saying that a Statement of a given kind, or a resolving update, binds the parties when a given rule says yes"; "No power makes a Terms act replace Terms" (G5.2) | kept, another meaning |
| W39 | **Mark** (a clone's terms field 4) | nothing | dropped |
| W40 | **Layer** (numbered 0 to 5; which layer an act belongs to) | draft 25 names the operations it needs (State, Sign, Deliver, Order, Control: section 1) and gives no layer rule | dropped from Agreements |
| W41 | **Extension** (field 15) | nothing; every field that names a cMIP is a socket (section 5) | dropped |
| W42 | **Grant** (type 9), **Grant key** | **Delegation** (G5.5); "Nothing an agent made is set aside" (G5.7). No grant key | renamed (grant); dropped (grant key) |
| W43 | **Clone** ("Clone, never modify", rule 45), a clone that is **complete** or a **draft** | **Update**, a version by `replaces` (G4.8; section 2, "Update"); an update that lacks a signature under the default "replaces nothing" and is **not shown** as a replacement (G4.8(c)) | renamed |
| W44 | **Release to the public domain** (type 5) | nothing | dropped |
| W45 | **Fork of a collective** (type 19), **Closing** (type 20) | nothing. **Fork** in draft 25: "two updates of the same act of one line" (G12) | dropped; "fork" another meaning |
| W46 | **Termination**, **Active, terminated**, **Termination terms** (task 15), **A deal's end** | nothing: "an agreement never ends" (section 2, "Never ended"; G4.9) | dropped |
| W47 | **Creditor's release** (Money type 4) | nothing | dropped from Agreements |
| W48 | Succession (rule 83), abandonment (rule 89), named under **Voice** and **Departed holder** | "Succession: no longer a term of this text"; nothing for abandonment | dropped |
| W49 | Transfer (rule 10, a stake transfer), named under **Stake** and **Signature** | a **transfer** is only of the baker's rights, "an act of the envelope's chain", the layer below's (G14.1) | kept, another meaning |

### Used here beside the word list

*Claude's additions, so the rows can point at them. Each is something the suite uses and the word list does not name.*

| A | What the suite uses | What draft 25 has |
|---|---|---|
| A1 | "Agreements draft 24" and its spec hash | draft 25, whose acts are written under its own spec hash (head of draft 25; encoding-2, E2) |
| A2 | "Agreements rule N" | grammar rules G1 to G14; "The word **rule** alone means something else: a rule people choose for their own agreement" (draft 25, "How to read it") |
| A3 | the answers valid, void, unknown, pending, disputed, said of Agreements acts | shown, not shown, fork, valid and not valid (of a proposed update only), invalid, unchecked; "The core's 'unknown', 'void' and 'pending' have no word here" (section 8.1). **Disputed** has one meaning (G12.5) |
| A4 | tasks by number named in terms field 2 (task 6 payment, 8 split, 10 time reference, 11 anchoring, 13 claims, 15 termination) | eight tasks, K1 to K8, each a field of an act (section 5); "A payment … holds a task of paying there … Which socket that is in a payment … is that layer's to say" |
| A5 | `objects` and `acks` on Agreements acts | "An act of this encoding MUST NOT carry `objects` or `acks`" (E3) |
| A6 | a deal's fork, its "reference", a "settlement" (field 26) and a "judge of forks" (field 27) | a fork (G12.1); "the Terms both replace, the last shared version, stay in force" (G4.7(e)); the **resolving update**, with `resolves` and `continues` (G12.3); a **power to resolve** (G12.4) |
| A7 | "Made before, made after" | order from citing, the **knots** (G13.3), and **anchoring** (G13.4); a **late update** (G4.7) |
| A8 | terms and publication field numbers (fields 1 to 37) | `encoding-2.md`'s own keys; some old numbers now name other fields (Terms key 8 is `place`, key 14 `control`, key 1 `agreement`; Statement key 1 is `terms`) |

## The suite: one row per place

*File: `spec/03-MOR-freeze-test-suite-v37.md`, "suite" below. Places are in the suite's order.*

### Head and core components

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-001 | suite | head | "This suite tests the six freeze-ready MIRs: … Agreements draft 24 …" | names the old Agreements | draft 25, under its own spec hash (A1) | a word to change |
| S-002 | suite | head | "A rule is cited by its MIR's name and number ("Agreements rule 76")" | rule numbering | grammar rules G1 to G14 (A2) | a word to change |
| S-003 | suite | Purpose, "Conformance versus validity" | "… keepers never holding content keys)." | keeper (W26) | nothing: dropped; a place records nothing draft 25 defines (G7.1) | a concept gone |
| S-004 | suite | Purpose, "What an answer is" | "… a list among them (a vow's sales) is one answer …" | a vow's sale states (W18) | nothing: dropped (W18) | a concept gone |
| S-005 | suite | Identity, "A collective's genesis" | "A collective's genesis: no signing key, its founding agreement declared in its declarations slot (Agreements kind 0) in place of one …" | collective, ownership agreement's kind (W10, W35) | nothing: dropped (W35) | a concept gone |
| S-006 | suite | Identity, "Escape with both keys" | "… a chain signature's placing standing once the act it placed is complete, the escape shown as a dispute on it (Identity rule 29; Agreements rules 10, 42 and 91) (3)" | stake transfer, keeper record, fork of a collective (W49, W26, W45) | nothing: dropped | a concept gone |
| S-007 | suite | Identity, "Succession declared in a rotation" | "… a collective by its chain signature …" | collective (W35) | nothing: dropped (W35) | a concept gone |
| S-008 | suite | Identity, "Witness act" | "… a client signing a witness act, or any acknowledgement an Identity, Money or Agreements act carries, keeping a copy of every act it names …" | acknowledgements on Agreements acts (A5) | an Agreements act carries no `acks` (E3) | a rule to rewrite |
| S-009 | suite | Identity, "Collective as an identity" | "Collective as an identity with a key grammar for its chain key alone … a single chain-key holder with no successor or no escrowed share rejected (Agreements rule 59) …" | collective, key grammar (W35) | nothing: dropped (W35) | a concept gone |
| S-010 | suite | Text, "Text rule 14's two cases" | "… whether the grant backs it judged by Agreements; a text a member or a grantee signs for a collective … counted under Agreements rule 58 …" | grant, collective (W42, W35) | delegation (G5.5) for the first case; nothing for the second (W35) | a concept gone |
| S-011 | suite | Envelopes, "Encryption key made public" | "… a collective has none: an act for it sealed to each of its members, or public (Agreements rule 57) (3)" | collective, "done" (W35, W36) | nothing: dropped | a concept gone |
| S-012 | suite | Envelopes, "Hash-linked ordering" | "Hash-linked ordering; provable forks; `objects` entries naming their chain; a two-chain act (stake transfer) read correctly; no clock (1, 3)" | stake transfer, `objects` (W49, A5) | nothing: dropped (W49) | a concept gone |
| S-013 | suite | Envelopes, "Only Identity, Money and Agreements act types carry acknowledgements" | "Only Identity, Money and Agreements act types carry acknowledgements …" | acknowledgements on Agreements acts (A5) | an Agreements act carries no `acks` (E3) | a rule to rewrite |
| S-014 | suite | Envelopes, "The bake" | "… money sent to a bare bake its uploader's, unsplit …" | split (W20, W23) | unclear (U-11) | a word to change |
| S-015 | suite | Envelopes, "Work hash" | "… a live stream sold by a publication, never by a bake (1, 2, 6)" | publication (W13) | an offer (W13) | a word to change |
| S-016 | suite | Envelopes, "Vows" | "… each sale pending, confirmed (the buyer's own claim acknowledging an act about it) or contested (the buyer's contest, naming the sale and, optionally, the promise not kept: Agreements rule 13) …" | vow's sale states, contest (W18, W33) | no sale states; a confirmation is the receiving side's report (G11.7); a buyer's contest names the version and the settlement (G11.8) | a concept gone |
| S-017 | suite | Envelopes, "Vows" | "… a publication selling a vow an ownership agreement claims, not signed under it, valid and shown outside it, as for a work (Agreements rule 14) …" | publication, ownership agreement, rule 14 (W13, W10) | nothing for a vow; for an envelope, G14.3 (see U-01) | a concept gone |
| S-018 | suite | Money, "A payer's claim signed with a grant key" | "… judged as scoped and counted by a verifier reading Agreements … save as Agreements rule 76 shows it disputed (Money rule 7) (2)" | grant to oneself, grant key, rule 76 (W42) | nothing for a grant key (W42) | a concept gone |
| S-019 | suite | Money, "A collective's Money acts" | "… judged by Agreements under its rule for Money, or a finer area within Money that reaches the act … (Money rule 7; Agreements rules 58, 60) (3)" | collective, layer rule, area (W35) | nothing: dropped (W35) | a concept gone |
| S-020 | suite | Money, "What a payment fulfils" | "… a receipt or claim whose field 5 or field 4 names an act Money or Agreements reads (an obligation, a price tag, a publication, a payee pointer, a stake transfer) judged on it, as is one naming a payment it repays or refunds, a take-up or a split …" | publication, stake transfer, split (W13, W49, W23) | a payment names the version it read (G13.2) | a rule to rewrite |
| S-021 | suite | Money, "Settlement receipt" | "… rail Modules under the one payment cMIP an agreement or publication names, signing nothing (1, 2, 5)" | a payment task named by an agreement or publication (A4, W13) | no payment socket in Agreements: "Which socket that is in a payment … is that layer's to say" (section 5) | a rule to rewrite |
| S-022 | suite | Money, "A receipt or claim counts only on a rail Module" | "… and, under an agreement or publication, one implementing its payment cMIP …" | the same (A4, W13) | the same as S-021 | a rule to rewrite |
| S-023 | suite | Money, "Route across rails" | "Route across rails through a conversion service, paid under its own publication …" | publication (W13) | an offer (W13) | a word to change |
| S-024 | suite | Money, "The price tag" | "… under a publication only the split service's tag, or that of the party the publication designates (field 10), counting …(Money rule 18; Agreements rule 12) …" | publication fields, split service, rule 12 (W13, W16, W22) | the buyer's assent and payment, and the receiver for the act (G11.7, G1.4) | a rule to rewrite |
| S-025 | suite | Money, "A Money-only purchase" | "A Money-only purchase: a wallet that reads only Money pays a counted tag of a publication, and its purchase is valid …" | purchase without signing Terms (W17) | unclear (U-02) | a rule to rewrite |
| S-026 | suite | Money, "A Money-only purchase" | "… the same wallet unable to tell whether the publication still counts, a payment racing its ending owed back to it …" | a publication's ending (W46) | nothing: "an agreement never ends" (G4.9) | a concept gone |
| S-027 | suite | Money, "Only identities have payee pointers" | "… a collective's by a member for it …" | collective (W35) | nothing: dropped (W35) | a concept gone |

### Core components: Agreements

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-028 | suite | Agreements, "A grant to oneself" | "A grant to oneself: a grant whose grantee is its own grantor … (Agreements rule 73) (2)" | grant, grant key (W42) | nothing: a delegation is between a delegator and an agent (G5.5) | a concept gone |
| S-029 | suite | Agreements, "No member key and no grant key" | "No member key and no grant key of a collective: a signature act carrying field 1 invalid … (Agreements rule 73, "Grant (type 9)", "Signature (type 1)") (3)" | signature act's field 1, grant type 9, collective (W2, W42, A8) | an assent is a Statement, whose key 1 is `terms`, required (encoding-2, section 5) | a rule to rewrite |
| S-030 | suite | Agreements, "Agreements as terms plus signatures" | "Agreements as terms plus signatures; a party bound only by its own signature; one cMIP per task; extensions (all, 3, 8)" | signature, agreement, task, extension (W2, W3, A4, W41) | Terms and Statements, a signature being an assent (W2, W3); bound by G5.1 (a), (b) or (c); "One cMIP per socket" (section 5); no extension | a rule to rewrite |
| S-031 | suite | Agreements, "An agreement as a party of another" | "… a loop refused, failing closed; nesting bounded at eight levels; an ownership agreement as owner of another … (Agreements rule 15) *(component)*" | nesting bound, loop, ownership agreement (W10) | G1: one level (G1.2); a loop: "an agreement is met a second time … the answer is **not shown**" (G1.4); how far a verifier follows "is not fixed (P2, P8)" (G9.2) | a rule to rewrite |
| S-032 | suite | Agreements, "Sealed keepers" | "Sealed keepers named by the agreement; keepers check homes; recorded acts survive rotation as disputes …" | keeper (W26) | nothing: dropped; a place (G7) | a concept gone |
| S-033 | suite | Agreements, "Keeper records" | "Keeper records: one keeper record (Agreements type 2, `{ 0 => [act, signer] }`) per act …" | keeper record, type 2 (W26) | nothing: dropped | a concept gone |
| S-034 | suite | Agreements, "Several keepers" | "Several keepers with a threshold, each record judged against its own keeper's record of the rotation …" | keeper (W26) | nothing: dropped | a concept gone |
| S-035 | suite | Agreements, "Belongs to" | "Belongs to: a receipt belonging to a work's ownership agreement through the shares it pays …" | belongs to, keeper (W27, W26) | nothing: dropped | a concept gone |
| S-036 | suite | Agreements, "A keeper keeps one sequence" | "A keeper keeps one sequence: records in a second sequence ordering nothing against the first …" | keeper (W26) | nothing: dropped | a concept gone |
| S-037 | suite | Agreements, "Arbitrator" | "Arbitrator given keys by key delivery to judge content (1)" | arbitrator (W28) | a judge, a module (section 5.3) | a word to change |
| S-038 | suite | Agreements, "The claim" | "The claim (Agreements type 3): a work hash bound to its creators …" | claim (W9) | nothing: dropped (W9) | a concept gone |
| S-039 | suite | Agreements, "The ownership agreement's target" | "The ownership agreement's target (terms field 33): `[0, claim]`, a work's, a deal …" | ownership agreement, target, field numbers (W10, A8) | nothing: dropped | a concept gone |
| S-040 | suite | Agreements, "One stake" | "One stake, on the target (field 7): … summing to 1,000,000 …" | stake (W11) | shares, no form (W11) | a concept gone |
| S-041 | suite | Agreements, "Stakes in millionths" | "Stakes in millionths, stake rule, transfer naming the agreement's chain; leftovers by largest remainder …" | stake, transfer (W11, W49) | nothing: dropped | a concept gone |
| S-042 | suite | Agreements, "The publication" | "The publication (Agreements type 6), the offer: what it sells (bakes, a proven delivery, a vow) …" | publication and its fields (W13, W15, W22, W20, W46) | an offer (W13): Terms with a role (G10), which MUST carry `in_force` (G4.2) | a rule to rewrite |
| S-043 | suite | Agreements, "A publication's versions" | "A publication's versions: each signed by every party of it, naming `[first, previous]` …" | versions by `[first, previous]`, ending (W43, W46) | versions by `replaces` and `agreement` (section 3.1); forks (G4.7); never ended (G4.9) | a rule to rewrite |
| S-044 | suite | Agreements, "Two stops" | "Two stops, two different people's: a tag withdrawn by its signer alone stopping sales at that price; a publication ended only by its owners' side, by default …" | price tag, ending (W16, W46) | a spot stops taking new identities by a new version, or as the version states in advance (G10.5) | a rule to rewrite |
| S-045 | suite | Agreements, "Termination" | "Termination, the agreed way out, defined once: an agreement, and each party's place in it, active until a terminating act counts …" | termination (W46) | nothing: "an agreement never ends" (G4.9) | a concept gone |
| S-046 | suite | Agreements, "A payment racing a publication's ending" | "A payment racing a publication's ending … owed back by the split service … (Agreements rules 11, 30) (2, 9)" | ending, split service (W46, W22) | nothing: dropped (G4.9) | a concept gone |
| S-047 | suite | Agreements, "A publication whose ownership agreement names a closed collective" | "A publication whose ownership agreement names a closed collective as owner … selling nothing from the closing's line …" | closing, collective (W45, W35) | nothing: dropped | a concept gone |
| S-048 | suite | Agreements, "Shares by reference" | "Shares by reference: the split service's receipt naming in field 9 the ownership agreement, by its founding version, and a version on its line …" | receipt field 9, ownership agreement, version in force for a receipt (W10, W22) | "A payment to a work names the version of the work agreement it read" (G13.2); the receiver for the act (G1.4) | a rule to rewrite |
| S-049 | suite | Agreements, "Which version of a publication a payment buys" | "Which version of a publication a payment buys: on a request rail, the tag and version the seller's request committed to …" | request and push rails, price tag (W19, W16) | the version the payment names (G13.1, G13.2) | a rule to rewrite |
| S-050 | suite | Agreements, "Which version of a publication a payment buys" | "… a buyer's client checking that the publication and tag are the latest in their chains (a strong SHOULD) (Agreements rule 12) (2)" | a SHOULD | "no SHOULD appears" (draft 25, "How to read it") | a concept gone |
| S-051 | suite | Agreements, "A purchase names a counted tag" | "… a co-owner's or a stranger's publication, or a bare bake's tag, not signed under the claim's ownership agreement, valid, visibly contradicting it … never prevented (Agreements rules 12, 14) (2)" | rule 14 (W10, W9) | G14.3 (see U-01) | a rule to rewrite |
| S-052 | suite | Agreements, "One ownership, many publications" | "One ownership, many publications: one work's ownership agreement under several publications … the owners' shares read by reference in all …(Agreements rules 14, 15) (1, 2)" | ownership agreement, publication, partner (W10, W13, W15) | a receiver that may be an agreement, and a sequence (G1.3, G1.4, G11.1) | a rule to rewrite |
| S-053 | suite | Agreements, "Public domain, timed" | "Public domain, timed: the claim ending at a point on the time reference …" | release (W44) | nothing: dropped | a concept gone |
| S-054 | suite | Agreements, "The split service" | "The split service, named by the publication (field 3): receiving every payment under it, in its own name … (Agreements rules 16, 17) (1, 2, 7)" | split service, partners, backups (W22, W15) | a service under a deal, task K6, leg reports (G11.2, G11.3; section 5.1) | a rule to rewrite |
| S-055 | suite | Agreements, "A bypassed split service" | "A bypassed split service: a tag whose payee is not the split service, the payment still a purchase, the pointer shown as bypassing … (Agreements rule 16) (2, 3)" | price tag's payee (W16, W22) | nothing: dropped | a concept gone |
| S-056 | suite | Agreements, "Role shares with third-party evidence" | "Role shares with third-party evidence, counting only when the payer the payment's commitment names acknowledges it in its claim …" | role share (W25) | a spot (G10) filled by its K5 cMIP's proof, with a witness module and `settlement` (section 5.1, "The agreed witness") | a rule to rewrite |
| S-057 | suite | Agreements, "Module fees consented" | "Module fees consented; an omitted fee visible in the split (2); a split plan stating no maximum fee per payout, no cap, flagged …" | split, split plan (W23, W20) | the leg report's "what was kept (a fee)" (K6's row) | a rule to rewrite |
| S-058 | suite | Agreements, "The split plan in the publication" | "The split plan in the publication: share rules only `[1, role, part]` and `[3, metric, part]` … a split (type 8) naming the publication in field 3 …" | split plan, split type 8 (W20, W23) | leg report lines (K6's row; encoding-2, E22) | a rule to rewrite |
| S-059 | suite | Agreements, "The collective's split agreement" | "The collective's split agreement: a publication whose versions carry no field 0 …" | split agreement, collective (W14, W35) | nothing: dropped | a concept gone |
| S-060 | suite | Agreements, "A chain of judgment" | "A chain of judgment: a judge answering "unknown", or silent past its period on the compulsory time reference, followed by the next in its chain …" | chain of judgment (W30) | nothing: dropped | a concept gone |
| S-061 | suite | Agreements, "Departed holders" | "Departed holders: the collective's stake (field 7 of its ownership agreement) deciding every holder's money …" | departed holder (W35) | nothing: dropped | a concept gone |
| S-062 | suite | Agreements, "How a collective ends" | "How a collective ends: a group splitting off by a membership change …" | fork of a collective, closing (W45) | nothing: dropped | a concept gone |
| S-063 | suite | Agreements, "Split by an attention metric" | "Split by an attention metric, evidenced by a record the identity running the module signs, never by the module (7)" | split (W23) | a rule as a module of the K6 cMIP; a witness module (section 5.3) | a rule to rewrite |
| S-064 | suite | Agreements, "Split service failing to split" | "Split service failing to split, or under-reporting against a payer's claim, shown as an open obligation; the parties switching services by a new version of the publication (2, 7)" | split service, publication (W22, W13) | **one side only**, **unanswered**, **mismatched** (G11.4(b) to (d)); a new version by its update condition (G4.11) | a rule to rewrite |
| S-065 | suite | Agreements, "Key delivery" | "Key delivery or, for a bake whose key is public, the split service's receipt naming the tag as the binding moment; refund owed otherwise …" | split service, price tag, refund (W22, W16) | "After the confirmation comes access to what was bought" (G11.7); "how money comes back, are not these grammar rules'" (G11.8) | a rule to rewrite |
| S-066 | suite | Agreements, "A buyer's contest of their purchase" | "A buyer's contest of their purchase, naming it … the same contest signed by anyone else shows nothing (Agreements rule 54, "Contest (type 14)") (2)" | contest type 14, standing (W33, W34) | a Statement of kind `contest` naming the version and the payment's settlement (G11.8); a contest by anyone else: unclear (U-06) | a rule to rewrite |
| S-067 | suite | Agreements, "Two classes of delivery" | "Two classes of delivery: a proven delivery under the access form … a promised delivery naming a vow …" | proven and promised delivery (W7) | nothing: dropped | a concept gone |
| S-068 | suite | Agreements, "Named time reference" | "Named time reference; recurring obligation; lapse shown as past its terms; a deadline met shown by an anchor … a missed deadline shown only by a named keeper's sequence anchored past the point … (Agreements rule 33) (1, 7)" | time reference, keeper (W31, W26) | a clock (G7.4); "A time written inside an act is reported as its signer's claim" (G8.2); answers per clock (G13.4) | a rule to rewrite |
| S-069 | suite | Agreements, "A collective is an identity its members act for" | "A collective is an identity its members act for: a member acting with their own key, the act naming the collective as chain in `objects` …" | collective (W35, A5) | nothing: dropped | a concept gone |
| S-070 | suite | Agreements, "The decisions chain" | "The decisions chain: genesis, rotations, records, grants and revocations, fork or closing …" | decisions chain (W36) | nothing: dropped | a concept gone |
| S-071 | suite | Agreements, "Layer rules" | "Layer rules (terms field 19): a map keyed 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development …" | layer rule (W35, W40) | nothing: dropped | a concept gone |
| S-072 | suite | Agreements, "Collective founded" | "Collective founded only when every founder has signed, a member added only by signing …" | collective (W35) | nothing: dropped | a concept gone |
| S-073 | suite | Agreements, "Every member with constitutional power" | "Every member with constitutional power covered by an abandonment clause able to remove their voice …" | abandonment, voice (W48, W35) | nothing: dropped | a concept gone |
| S-074 | suite | Agreements, "A collective's grants" | "A collective's grants: a grant drawn by a member for the collective …" | collective's grant (W42, W35) | nothing: dropped | a concept gone |
| S-075 | suite | Agreements, "A revoked grant's acts" | "A revoked grant's acts: an act under the grant the revocation's history does not hold … valid and shown as disputed … one nobody else acknowledged and no keeper recorded void … (Agreements rule 76) (3)" | revocation, "void", keeper (W42, W26, A3) | "Nothing an agent made is set aside" (G5.7); a version ending the power reaches only acts after it (G5.5, G5.4) | a rule to rewrite |
| S-076 | suite | Agreements, "Acknowledgement recorded by the collective" | "Acknowledgement recorded by the collective (3)" | collective (W35) | nothing: dropped | a concept gone |
| S-077 | suite | Agreements, "Clone drafts" | "Clone drafts; a deal exists and changes only with every party's signature; the concurrency rule's field 10 withdrawn, never reused; status quo default; protected clauses …" | clone, deal, protected clauses (W43, W5, W32) | an update and its condition (G4.8, G4.11); by default everyone who signed the original (G4.11(e)); the judge changes only by an update (G5.6(d)) | a rule to rewrite |
| S-078 | suite | Agreements, "Adoption by layer rules" | "Adoption by layer rules: a layer's rule deciding which cMIP fills each of that layer's tasks, save the judicial tasks …" | layer rule, extension (W35, W41) | nothing: dropped | a concept gone |
| S-079 | suite | Agreements, "Abandonment declaration" | "Abandonment declaration by the named authority, an identity, under the clause the party signed; liveness act; contest by a contest act (1) …" | abandonment (W48) | nothing: dropped | a concept gone |
| S-080 | suite | Agreements, "Succession plan" | "Succession plan: stake and seat successors, triggered by the party or the abandonment authority, executed by clone …" | succession (W48) | nothing: dropped | a concept gone |
| S-081 | suite | Agreements, "What the plan alone may pass" | "What the plan alone may pass: a seat to one identity or several … (Agreements rule 83) (3, 9)" | succession (W48) | nothing: dropped | a concept gone |
| S-082 | suite | Agreements, "A declaration moving a share" | "A declaration moving a share only by succession, to the stake successors the holder's plan names …" | abandonment, succession (W48) | nothing: dropped | a concept gone |
| S-083 | suite | Agreements, "A split plan paying a role" | "A split plan paying a role, a metric or a fee off the top, and partners off the top; what is left, the owners' line, going to the ownership agreement's stake alone …" | split plan, owners' line (W20, W21) | nothing in the grammar: a K6 cMIP's (section 5.1) | a concept gone |
| S-084 | suite | Agreements, "A vow owned by its signer" | "A vow owned by its signer: an ownership agreement on a claim of a vow's name giving the vow's signer the whole stake at its founding …" | vow, claim, ownership agreement (W18, W9, W10) | nothing: dropped | a concept gone |
| S-085 | suite | Agreements, "Negotiation record" | "Negotiation record of negotiation messages (Agreements acts) with acknowledgements …" | negotiation message, `acks` (W8, A5) | nothing: dropped | a concept gone |
| S-086 | suite | Agreements, "The judicial tier" | "The judicial tier (Agreements rule 67): the abandonment clause, the succession plans, the keepers, the split agreement, the time reference … changed only with every member whose voice remains …" | judicial tier, collective (W29, W35) | the judicial is the contest, a judge and a power to resolve, changed only by an update the condition answers valid (G5.6) | a rule to rewrite |
| S-087 | suite | Agreements, "The last resort" | "The last resort (Agreements rule 98): a collective naming no control model judged by it alone …" | collective, control model (W35) | nothing: dropped | a concept gone |
| S-088 | suite | Agreements, "Control models" | "Control models (Agreements rule 99, terms field 35): a collective naming at most one, a deal none …" | control model (W35) | nothing: dropped | a concept gone |

### Core components: Development, and `cmip-collective-control`

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-089 | suite | Development, "Extension named by an agreement" | "Extension named by an agreement; a client lacking it cannot sign; an extension cannot relax a core rule …" | extension (W41) | nothing: dropped | a concept gone |
| S-090 | suite | Development, "A proof checker no task" | "A proof checker no task: a proven delivery naming its cMIP, no agreement naming a checker by a task number …" | proven delivery, tasks by number (W7, A4) | nothing: dropped (W7) | a concept gone |
| S-091 | suite | Development, "Task numbers" | "Task numbers used identically by every client (8)" | tasks by number (A4) | unclear (U-10) | a word to change |
| S-092 | suite | Development, "Creator paid" | "Creator paid through fee terms and role shares evidenced by records a party signs …" | role share (W25) | a spot and its witness (section 5.1) | a rule to rewrite |
| S-093 | suite | Development, "A work cloned to MOR 2" | "A work cloned to MOR 2: its bake (bytes and work hash), its claim and its ownership agreement carried across; its publications, being distribution, remade there (9)" | claim, ownership agreement, publication (W9, W10, W13) | nothing: dropped (claim and ownership agreement) | a concept gone |
| S-094 | suite | `cmip-collective-control`, head | "*Run against `cmips/cmip-collective-control-draft-6.md`, which a collective names in terms field 35 …*" | collective, control model (W35) | nothing: dropped | a concept gone |
| S-095 | suite | `cmip-collective-control`, "The owners' matters" | "The owners' matters (`cmip-collective-control`'s rules 94 to 97): a holders' rule on the collective's stake …" | owners' consent, stake (W12, W11) | nothing: dropped | a concept gone |
| S-096 | suite | `cmip-collective-control`, "Areas" | "Areas (`cmip-collective-control`'s parameter 34): finer than a layer … (Agreements rules 60 and 65 …) (3)" | area (W35) | nothing: dropped | a concept gone |
| S-097 | suite | `cmip-collective-control`, "Tiers, for collectives" | "Tiers, for collectives: the powers a clone needs read from the fields it changes …" | clone, mark, record (W43, W39, W36) | nothing: dropped | a concept gone |
| S-098 | suite | `cmip-collective-control`, "Areas, held" | "Areas, held: an act an area reaches counts with its holders' signatures …" | area, grant (W35, W42) | nothing: dropped | a concept gone |

### Scenario 1, a feature film

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-099 | suite | 1.1 | "They then sign the film's ownership agreement, terms whose target is the film's claim (field 33, `[0, claim]`), carrying its one stake (field 7), summing to 1,000,000: a deal, so it exists once every contributor has signed, and every clone of it needs every contributor." | claim, ownership agreement, stake, deal (W9, W10, W11, W5) | a work, its shares read by K1 (W10, W11); by default an update needs everyone who signed the original (G4.11(e)) | a concept gone |
| S-100 | suite | 1.1 | "The terms name a time reference (a block height), three sealed keepers with a two-of-three rule, an arbitrator for milestone disputes, and an abandonment clause naming the keepers' operators as the authority on absence, judged against the block height." | time reference, keepers, arbitrator, abandonment (W31, W26, W28, W48) | a clock (G7.4); a place (G7); a judge (section 5.3); nothing for keepers' rules or abandonment | a concept gone |
| S-101 | suite | 1.1 | "Terms carrying the film's target and a split plan (field 8), a split service's grant (field 14), fees (field 28) or backups (field 29) are invalid in every client …" | field numbers, split plan (A8, W20) | nothing: dropped; Terms key 8 is now `place` and key 14 `control` (A8) | a concept gone |
| S-102 | suite | 1.3 | "The film is sold by a publication naming the film's ownership agreement (field 1, by its founding version), a distributor as a partner with its share and the label "distributor" (field 2), a split service (field 3) and a split plan (field 4) running a waterfall split cMIP (field 9's task 8, the same as the plan's key 1)." | publication, partner, split service, split plan, task 8 (W13, W15, W22, W20, A4) | an offer whose receiver is the work (G1.3), a service under a deal, K6 (section 5.1) | a rule to rewrite |
| S-103 | suite | 1.3 | "… it signs a split per incoming receipt, every split summing exactly, the distributor's share and the plan's off-the-top shares first, then the owners' line divided by the stake …" | split, owners' line (W23, W21) | a leg report per leg (G11.3); dividing is the K6 cMIP's | a rule to rewrite |
| S-104 | suite | 1.4 | "An investor sells their share of the stake; only seller and buyer sign; the transfer names the agreement's chain." | stake transfer (W49) | nothing: dropped | a concept gone |
| S-105 | suite | 1.5 | "… on the ownership agreement's chain they confer nothing (Agreements rule 6). A keeper record naming an act nobody holds confers no status." | agreement chain, keeper, a rotation that disowns acts (W4, W26) | unclear (U-04) | a rule to rewrite |
| S-106 | suite | 1.5b | "The keeper had recorded the sale before recording the rotation, so it stands as a visible dispute rather than disappearing." | keeper (W26) | nothing: dropped | a concept gone |
| S-107 | suite | 1.6 | "One party signs a proposed clone alone; it stays a draft and nothing changes." | clone, draft (W43) | a proposed update, **not shown** as a replacement (G4.8(c)) | a word to change |
| S-108 | suite | 1.7 | "A proposed version naming the block-height cMIP of its time reference (field 6) also as its payment cMIP (field 9's task 6) is invalid in every client … a judge never handles what it judges, in a deal too." | time reference, tasks by number, judge (W31, A4, W29) | nothing: "One cMIP may fill several sockets, of one act or of several" (section 5) | a concept gone |
| S-109 | suite | 1.7a | "**While it has two, the version before the split is the reference**: a verifier reports it in force, and every client shows both branches." | the reference (A6) | "the Terms both replace, the last shared version, stay in force" (G4.7(e)) | a word to change |
| S-110 | suite | 1.7a | "**A new act may follow either branch, and counts**: a release naming a version of one branch is judged under that branch's latest version, under its rule." | what is built on a branch | "nothing built on either tip counts" (G12.2) | a rule to rewrite |
| S-111 | suite | 1.7a | "**The shares a payment pays are the reference's until the fork is settled**: a purchase on a push rail whose split service's receipt names, in field 9, a version of the other branch is a purchase under the publication (the buyer is protected) …" | receipt field 9, the reference (A6, W22) | a payment naming a tip: its receiver is the one the Terms both branches replace name, the fork shown with it (G1.4, G12.2) | a rule to rewrite |
| S-112 | suite | 1.7a | "**Settled:** every party of both branches signs a version whose parent is the first branch's latest version and which names, in field 26, and cites in its objects, the second branch's latest version …" | settlement by field 26 and `objects` (A6, A5) | a resolving update, an update of the shared act naming every tip in `resolves` and one in `continues` (G12.3) | a rule to rewrite |
| S-113 | suite | 1.7a | "**Final:** a settling version made on the second branch that names the settlement is made after it, and changes nothing … and **a third version of the reference the settlement never saw** …" | finality of a settlement | "A resolving update MUST name every tip"; one that does not is "an act like any other" (G12.3); late updates, by knots or anchoring (G4.7) | a rule to rewrite |
| S-114 | suite | 1.7a | "**The judge of forks**: the reference names one arbitrator, and names it judge of forks (terms field 27) …" | judge of forks, field 27 (A6, W28) | a power to resolve, an entry of `powers` of kind `resolves` (G12.4) | a rule to rewrite |
| S-115 | suite | 1.7a | "**The chain of judgment**: the reference names a judge of forks and a next link with a period …" | chain of judgment (W30) | nothing: dropped | a concept gone |
| S-116 | suite | 1.7a | "**One numbering across the splits**: the split service's splits under the publication are numbered 1, 2 and 4 where a holder holds them …" | splits' numbering (W23) | nothing: dropped | a concept gone |
| S-117 | suite | 1.7a | "**The seller's alarm** (client conformance): a seller holding the first branch receives a payment naming the second: its client, and the split service, raise the alarm …" | client duties on forks | one duty of clients, "written here and nowhere else" (G12.8) | a rule to rewrite |
| S-118 | suite | 1.7a | "**The buyer's check** (a strong SHOULD): before paying under a publication or a price tag that has since been replaced by a later version, the buyer's client warns …" | a SHOULD, price tag (W16) | nothing: "no SHOULD appears" | a concept gone |
| S-119 | suite | 1.7a | "**Two judges of the chain, one stage per question:** Ben asks, starting the judge of forks' stage on the fork …" | chain of judgment, judge of forks (W30, A6) | rival resolving updates are a fork (G12.7) | a rule to rewrite |
| S-120 | suite | 1.7a | "**No silent second successor** (client conformance): a party's client, about to sign a second clone of a version its owner already signed a clone of on another device, shows the first …" | client duties on forks, clone (W43) | G12.8 only | a rule to rewrite |
| S-121 | suite | 1.7a | "A settlement is final." | finality of a settlement (A6) | G12.3 and G12.7: a later rival resolving update that the knots or an anchoring show late "resolves nothing" | a rule to rewrite |
| S-122 | suite | 1.8 | "One party misses a deadline, judged against the block height: the keeper's sequence, anchored on the block height at a point past the deadline and holding no record of the party's delivery, shows the deadline missed …(Agreements rule 33) …" | keeper, time reference (W26, W31) | a clock (G7.4); what time it was per clock (G13.4); a time inside an act is its signer's claim (G8.2) | a rule to rewrite |
| S-123 | suite | 1.9 | "… the keeper's operator the clause names as the authority signs an abandonment declaration redistributing their share by outcome 1 …" | abandonment (W48) | nothing: dropped | a concept gone |
| S-124 | suite | 1.9b | "Two of three contributors sign a clone of the abandonment clause naming a friendly keeper as the authority; the third does not sign it." | abandonment, clone (W48, W43) | nothing: dropped | a concept gone |
| S-125 | suite | 1.9c | "… a threshold of parties is never a deal's authority, so the terms are invalid in every client …" | abandonment, collective (W48, W35) | nothing: dropped | a concept gone |
| S-126 | suite | 1.9d | "**A holder who is no party.** An investor holds 300,000 of the film's stake without being a party of the ownership agreement." | a holder who is no party (W11, W35) | nothing: "A stranger's assent makes no one a party" (G4.8(a)) | a concept gone |
| S-127 | suite | 1.9e | "Terms of the ownership agreement carrying a holders' rule (field 30) are invalid: a deal has none, so no advance permission reaches its holders' shares." | holders' rule (W12) | nothing; an update condition MAY answer valid "to an update fewer than all have signed" (G4.11(i)) | a concept gone |
| S-128 | suite | 1.9f | "She claims her vow: an ownership agreement whose target is a claim on her vow's name gives her the whole stake in its founding version …" | vow, claim (W18, W9) | nothing: dropped | a concept gone |
| S-129 | suite | 1.9g | "One party then rotates and disowns its signature on it: the version stays complete for everyone, the signature shown as a dispute …" | a rotation that disowns a signature (A3) | unclear (U-04) | a rule to rewrite |
| S-130 | suite | 1.9h | "A clone of the ownership agreement lowering that share that names the transfer in field 31 asks the buyer's signature …" | stake transfer, field 31 (W49, A8) | nothing: dropped | a concept gone |
| S-131 | suite | 1.9i | "A second film's ownership agreement names termination terms (field 36) …" | termination (W46) | nothing: "an agreement never ends" | a concept gone |
| S-132 | suite | 1, "Passes if" | "**Passes if:** every split balances and every payout has a receipt within the plan's maximum fee … an ownership agreement carrying no split, no fees and no split service …" | split, payout, ownership agreement, keepers, abandonment, termination | each as in the rows above | a rule to rewrite |

### Scenario 2, a song, two publications

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-133 | suite | 2.1 | "A musician uploads a song as a bake and claims it: her claim names her and a co-writer as creators, and the co-writer completes it by a signature act." | claim, signature act (W9, W2) | nothing for a claim; the baker the envelope states (G14.1) | a concept gone |
| S-134 | suite | 2.1 | "They sell it by a publication through partner A, a publisher: the publication names their ownership agreement, A as a partner with its share and the label "publisher", A's split service, and a split plan …" | publication, partner, split service, split plan (W13, W15, W22, W20) | an offer, a service under a deal, K6 | a rule to rewrite |
| S-135 | suite | 2.1 | "The co-writer, holding half the stake, sells the song alone by a publication of her own naming no ownership agreement, her owners' line the whole: every rule holds; a payment naming its tag is a purchase under it … (Agreements rule 14)." | rule 14 | unclear (U-01) | a rule to rewrite |
| S-136 | suite | 2.1c | "A client reading Agreements shows the fan's sale as outside the claim's ownership agreement (Agreements rule 14), nothing owed back to the buyer …" | rule 14, claim (W9, W10) | another envelope with its own baker, shown beside each bake, never picked (G14.5) | a rule to rewrite |
| S-137 | suite | 2.1c | "… a tag naming publication A signed by anyone but its split service or the party it designates, is nobody's offer …" | price tag, split service (W16, W22) | nothing: dropped | a concept gone |
| S-138 | suite | 2.2 | "The song is sold again through partner B, by a second publication naming the same ownership agreement … both read the owners' shares from the one ownership agreement." | publication, ownership agreement (W13, W10) | a receiver that may be an agreement, read for the act (G1.3, G1.4) | a rule to rewrite |
| S-139 | suite | 2.3 | "Each partner's publication names its own split cMIP and charges a creator-side fee (the plan's fees, key 9) …" | split plan's key 9 (W20) | the K6 cMIP; the leg report's "what was kept (a fee)" | a rule to rewrite |
| S-140 | suite | 2.4 | "… it is a purchase under publication A (Agreements rule 12, Money rule 18), and the key is delivered; the wallet cannot itself tell whether the publication still counts (stated cost)." | purchase by a Money-only wallet (W17) | unclear (U-02) | a rule to rewrite |
| S-141 | suite | 2.4 | "A's split service, the tag's payee, is paid in a stablecoin, through a conversion service, and its receipt names in field 9 the ownership agreement and the version whose stake it pays." | receipt field 9 (W22, W10) | a payment names the version it read (G13.2) | a rule to rewrite |
| S-142 | suite | 2.4 | "The split service resolves the referral as a role share with the buyer's signed evidence and pays the referrer's pointer …" | role share (W25) | a spot and its K5 cMIP (section 5.1) | a rule to rewrite |
| S-143 | suite | 2.4b | "… the receipts name that hop and its publication." | publication (W13) | an offer | a word to change |
| S-144 | suite | 2.4d | "A referral share is below the rail's minimum: the split service holds it as an open obligation …" | split service, role share (W22, W25) | the leg report's "what is still owed" (K6's row) | a rule to rewrite |
| S-145 | suite | 2.4e | "Publication A's plan gives a role share to the rail Modules a payment runs through." | role share, split plan (W25, W20) | a spot and its K5 cMIP | a rule to rewrite |
| S-146 | suite | 2.4f | "Publication A's plan gives a role share to the relay that served the song." | role share (W25) | a spot, a witness module, `settlement` (section 5.1) | a rule to rewrite |
| S-147 | suite | 2.4f | "… a service the parties named in advance is a partner, paid its share with no evidence." | partner (W15) | nothing: dropped | a concept gone |
| S-148 | suite | 2.4g | "On a third purchase the conversion service pays on as ordered, and A's split service signs no receipt." | split service (W22) | a service | a word to change |
| S-149 | suite | 2.4k | "A fan pays naming publication B itself, with no tag: a tip through the publication, no purchase, divided by B's split plan as a sale is …(Agreements rules 12 and 16)" | tip through a publication, bypassing tag (W16, W20) | nothing: dropped | a concept gone |
| S-150 | suite | 2.4l | "… the buyer is the route's first payer, and their contest naming that claim is shown beside the purchase; the conversion service's contest naming its own claim of the last hop shows nothing, the service a carrier." | contest naming a claim, through a route (W33) | a buyer's contest names the settlement the payment names (G11.8); unclear (U-05, U-06) | a rule to rewrite |
| S-151 | suite | 2.4l | "A buyer's claim citing another tag makes the purchase the service's own … a buyer who signed no claim has no standing (stated cost)." | standing (W34) | "Who else may make a contest, and when, is not said" (section 8.4) | a rule to rewrite |
| S-152 | suite | 2.4l | "Where A's publication sells a vow, the buyer's claim of the first hop is the sale, and a later claim of theirs of that hop acknowledging an act about the vow … confirms it … (Agreements rule 13; Money rule 20)." | vow's sale states (W18) | the receiving side's confirmation (G11.7) | a concept gone |
| S-153 | suite | 2.5b | "A split omits a module's declared fee; the omission is visible in the split." | split (W23) | the leg report (K6's row) | a rule to rewrite |
| S-154 | suite | 2.5c | "The musician also sells a demo of her own as a bare bake, by her own price tag, with no publication and no keeper, and regrets a sale …" | publication, keeper (W13, W26) | an offer; a place | a word to change |
| S-155 | suite | 2.6 | "Every party of publication A (the ownership agreement, partner A, the split service) then signs a later version selling nothing: publication A has ended; past sales stand; B's continues." | a publication's ending (W46) | never ended (G4.9); a spot stops taking new identities by a new version (G10.5) | a rule to rewrite |
| S-156 | suite | 2.6 | "A second buyer's payment … is receipted by A's split service after its own signature on the ending: a payment racing the ending, owed back by the split service …" | racing an ending (W46) | nothing: dropped; "now is what an act cites" (G13) | a concept gone |
| S-157 | suite | 2.7 | "The owners release the work to the public domain from a future point on the time reference … From that point the ownership agreement is closed …" | release (W44) | nothing: dropped | a concept gone |
| S-158 | suite | 2, "Passes if" | "**Passes if:** the publication counts once every party signed it, with no intermediary holding others' money, conflicting claims are visible and ordered where possible …" | publication, claim, split service, ending | each as in the rows above | a rule to rewrite |

### Scenario 3, a label (a collective)

*Every step of scenario 3 is about a collective (W35): "the label" is the collective the scenario follows. Draft 25 has none: "the grammar has no separate notion of a collective". Where a step also touches something draft 25 does have, the row says so.*

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-159 | suite | 3.1 | "A label is a collective: an identity with its own homes and a chain key, and no signing key." | collective (W35) | nothing: dropped | a concept gone |
| S-160 | suite | 3.1 | "It gives one finer area (`cmip-collective-control`'s parameter 34), "Releases", id 0: the label's publications (Agreements type 6) and the cMIP it names for claims (task 13, `[1, 13]`) …" | area, publication, claim task (W35, W13, W9, A4) | nothing: dropped | a concept gone |
| S-161 | suite | 3.1a | "A stranger signs a debt with their own key, naming the label as chain in `objects` and its latest decision: it counts for nothing …" | collective's chain (W36, A5) | nothing: dropped | a concept gone |
| S-162 | suite | 3.1b | "Founding terms whose field 19 lacks the entry for Envelopes … are outside the format …" | layer rule (W35) | nothing: dropped | a concept gone |
| S-163 | suite | 3.1c | "Before a founder signs the label's founding, their client shows, layer by layer, what each rule lets one member do alone, starting with Money …" | layer rule (W35) | nothing: dropped | a concept gone |
| S-164 | suite | 3.1d | "The third member … draws a record writing a complete operational clone and registering nothing else: it is a line …" | record type 17 (W36) | nothing: dropped | a concept gone |
| S-165 | suite | 3.1e | "A record naming the clone it writes but no decision of the label on its chain is no decision and no line …" | decisions chain (W36) | nothing: dropped | a concept gone |
| S-166 | suite | 3.1f | "The label has no encryption key: an act for it is sealed to each of its members, or public." | an act for a collective counting only once sealed to every member, which draft 24 calls "done" (W36) | nothing: dropped | a concept gone |
| S-167 | suite | 3.2 | "Marco accepts each grant by a signature act naming it; neither hands him a key, and a grant of the label carrying a grant key (field 9) is invalid." | grant, signature act (W42, W2) | a delegation, whose Terms the agent assents to (G5.5) | a rule to rewrite |
| S-168 | suite | 3.2 | "Terms naming a debt of a party who has not signed them stay a draft while that party has not signed (a deal needs every party), and every client shows the debt unsigned." | draft, deal (W43, W5) | Terms not in force until every signer's assent, by default (G4.1) | a word to change |
| S-169 | suite | 3.3 | "Two members with independent authority sign conflicting clones; each draws a record of one of them at once …(Agreements rule 90 …)" | records, clones (W36, W43) | nothing for records; a fork of Terms (G4.7, G12) | a concept gone |
| S-170 | suite | 3.4 | "Deal 2, racing it, which no other identity acknowledged and no keeper recorded, is void: the ending wins." | revocation, "void", tie rule (W42, A3, W36) | G5.4 (bound if made before the version ending the power is in force; **not shown** where citing gives no order); G5.7 | a rule to rewrite |
| S-171 | suite | 3.5 | "The label adopts it by an act for the label that counts, acknowledging it (Agreements rule 76): it binds." | adoption (W42) | nothing an agent made is set aside; the grantor acts on it only by an update (G5.7) | a rule to rewrite |
| S-172 | suite | 3.6 | "… with the consent of every holder of the label's stake in itself (the owners' consent, Agreements rule 98), and the buyer signs it." | owners' consent, stake transfer (W12, W49) | nothing: dropped | a concept gone |
| S-173 | suite | 3.7 | "A member, neither the release manager nor the treasurer, leaves alone, by a resignation act no one else signs, and keeps their share of the stake." | resignation, departed holder (W35) | nothing: dropped | a concept gone |
| S-174 | suite | 3.7a | "A founding agreement is proposed whose grammar gives the chain key to one holder and names no successor and no escrowed share: every client rejects it as invalid." | key grammar (W35) | nothing: dropped | a concept gone |
| S-175 | suite | 3.7b | "Marked as brought in by the clone rule and signed by both, it is invalid in every client: its change is constitutional." | mark (W39) | nothing: dropped | a concept gone |
| S-176 | suite | 3.7g | "The label's receipts are Money acts, which its rule for Money reaches: the treasurer alone." | layer rule (W35) | nothing: dropped | a concept gone |
| S-177 | suite | 3.7h | "A founding agreement is proposed whose abandonment clause allows no outcome 0 …" | abandonment (W48) | nothing: dropped | a concept gone |
| S-178 | suite | 3.7i | "The removed member's voice is gone; their stake stays, and they are a departed holder …" | voice, departed holder (W35) | nothing: dropped | a concept gone |
| S-179 | suite | 3.7j | "The release manager alone signs a clone adding a second extension that declares only Development …" | extension (W41) | nothing: dropped | a concept gone |
| S-180 | suite | 3.7k | "… the abandonment authority declares them absent, with outcome 0, by a declaration (Agreements type 13) …" | abandonment declaration (W48) | nothing: dropped | a concept gone |
| S-181 | suite | 3.7m | "The treasurer wants to leave the label's rule for Money and nominates a member …" | layer rule, area, grant (W35, W42) | nothing: dropped | a concept gone |
| S-182 | suite | 3.7n | "The same holds in a deal: a deal naming one specification for anchoring and for payments is invalid in every client." | tasks by number, deal (A4, W5) | nothing: "One cMIP may fill several sockets" (section 5) | a concept gone |
| S-183 | suite | 3.7o | "**The ordering stories.** A further label of three members …" | collective's line, keeper (W36, W26) | nothing: dropped | a concept gone |
| S-184 | suite | 3.7p | "The first condition cMIP answers "unknown" on the milestone; the second answers "true", and the chain's answer is "true", with no new signature from anyone …" | chain of judgment, a condition answering true (W30) | the condition answers valid or not valid, of a proposed update only (G4.11) | a concept gone |
| S-185 | suite | 3.7q | "**A departed holder.** A collective of three founded with a constitutional change rule of two of three removes a member …" | departed holder (W35) | nothing: dropped | a concept gone |
| S-186 | suite | 3.7r | "**The pointer check.** The label's split agreement, a publication of the label selling nothing (field 0 absent) …" | split agreement (W14) | nothing: dropped | a concept gone |
| S-187 | suite | 3.7s | "A version changing the constitution and the anchoring cMIP at once needs the constitutional change rule and every member for the judge …" | judicial tier, constitutional rule (W29, W37) | one answer, the update condition's (G4.11; G5.6(a), (d)) | a concept gone |
| S-188 | suite | 3.7t | "**Every payout matches its share, and fees are visible.** A collective of three whose founding terms give its members 400,000, 300,000 and 300,000 of its stake in itself …" | split, payout, stake, collective (W23, W24, W11, W35) | nothing: dropped | a concept gone |
| S-189 | suite | 3.7u | "**The chain's period.** The arbitrator's chain names a second arbitrator after a period of 30 on the time reference." | chain of judgment (W30) | nothing: dropped | a concept gone |
| S-190 | suite | 3.7v | "**Founding terms carry the stake in the collective itself.**" | ownership agreement kind 1 (W10) | nothing: dropped | a concept gone |
| S-191 | suite | 3.7w | "The mark is false (Agreements rule 46): the collective is broken from that rotation, the broken act." | mark, broken collective (W39) | nothing: dropped | a concept gone |
| S-192 | suite | 3.7x | "The two members sign versions of the split agreement, one change each of those Agreements rule 48 lists, as in 1.9d …" | split agreement, departed holder (W14, W35) | nothing: dropped | a concept gone |
| S-193 | suite | 3.7y | "**A departed holder's stake moves by succession, its pay never cut.**" | succession (W48) | nothing: dropped | a concept gone |
| S-194 | suite | 3.7z | "A member resigns; the collective registers it and lives a year under that line; the member then rotates and disowns the resignation: the line stands …" | collective's line (W36) | nothing: dropped | a concept gone |
| S-195 | suite | 3.7aa | "A verifier missing one act a line's history names: whether an act is before that line is unknown to it …" | history, "unknown" (W36, A3) | nothing for a collective's history; **unchecked** where a verifier lacks an act (G9.1) | a concept gone |
| S-196 | suite | 3.7ae | "**Owners choose the operators.** A collective's constitutional change rule is counted among its stake's holders by share." | collective, stake (W35, W11) | nothing: dropped | a concept gone |
| S-197 | suite | 3.7af | "**Owners see the money.** A collective with departed holders pays a member from its reserve …" | collective, "done" (W35, W36) | nothing: dropped | a concept gone |
| S-198 | suite | 3.7ag | "Declared absent under the abandonment clause of the version it last signed as a party, though no party now, its stake passes to its plan's successor …" | abandonment, succession (W48) | nothing: dropped | a concept gone |
| S-199 | suite | 3.7ah | "A rule by share used for keepers, as a layer's rule, or as a deal's clone rule, is invalid." | keepers, layer rule (W26, W35) | nothing: dropped | a concept gone |
| S-200 | suite | 3.7ai | "A collective's split agreement naming the collective itself as a partner, at 50,000, pays that part to the collective's vault …" | split agreement, partner (W14, W15) | nothing: dropped | a concept gone |
| S-201 | suite | 3.7al | "The label's grant to Marco names, in its limits cMIP, an expiry on a time reference …" | grant, time reference (W42, W31) | a delegation's stated conditions, read from its words (G5.5) | a rule to rewrite |
| S-202 | suite | 3.7am | "A collective naming none of the owners' additions … is founded, loses a member, forks and closes exactly as steps 3.7, 3.9 and 3.9f say …" | collective (W35) | nothing: dropped | a concept gone |
| S-203 | suite | 3.7an | "Its founding terms carry an abandonment clause allowing outcome 0 only: the terms are invalid in every client …" | abandonment (W48) | nothing: dropped | a concept gone |
| S-204 | suite | 3.7ao | "A collective names a control model (terms field 35) that a second verifier does not hold." | control model (W35) | nothing: dropped | a concept gone |
| S-205 | suite | 3.7ap | "A collective of three names no control model, its constitutional change rule every party …" | control model (W35) | nothing: dropped | a concept gone |
| S-206 | suite | 3.7aq | "A collective names a control model whose answer, for a resignation, asks two members' signatures …" | control model (W35) | nothing: dropped | a concept gone |
| S-207 | suite | 3.7ar | "A collective names a control model giving one member, alone, the power over its abandonment clause, keepers and succession plans …" | control model (W35) | nothing: dropped | a concept gone |
| S-208 | suite | 3.7as | "A collective issues new shares of its stake in itself." | issuance, stake (W12, W11) | nothing: dropped | a concept gone |
| S-209 | suite | 3.7at | "A holder signs a transfer of part of its stake; before the collective's line places it, the members change the rule binding the stake's holders …" | stake transfer (W49) | nothing: dropped | a concept gone |
| S-210 | suite | 3.7au | "… three members sign a clone changing one word of its constitution and its arbitrator, marked with the constitutional change rule alone: invalid in every client …" | judicial tier, mark (W29, W39) | the judicial changes only by an update the condition answers valid (G5.6(d)) | a concept gone |
| S-211 | suite | 3.7av | "A rotation declaring a clone that adds a member and changes the payment cMIP breaks the collective in every client …" | collective (W35) | nothing: dropped | a concept gone |
| S-212 | suite | 3.7aw | "The same payload under the Agreements MIR's hash, type 27, is invalid in every client …" | the old Agreements' spec hash (A1) | under draft 25's hash, "a type other than 0 or 1 is rejected" (E2) | a concept gone |
| S-213 | suite | 3.7ax | "A collective whose constitutional change rule counts among its stake's holders by share, and whose rule for Money names its treasurer alone …" | collective (W35) | nothing: dropped | a concept gone |
| S-214 | suite | 3.7ay | "A collective of three holding its stake in itself 50, 30 and 20 per cent names a control model …" | control model (W35) | nothing: dropped | a concept gone |
| S-215 | suite | 3.7ba | "… the member holding 30 per cent drafts, for the collective, a grant to an agent reaching its payee pointers …" | collective's grant (W42) | nothing: dropped | a concept gone |
| S-216 | suite | 3.7az | "The label then changes its control model, by a constitutional clone, to one that gives an area of the same id reaching the same acts …" | control model, area (W35) | nothing: dropped | a concept gone |
| S-217 | suite | 3.7bb | "A buyer bought a tenth of a collective's stake in itself; the collective's line placed its transfer under a version whose abandonment clause names a keeper's operator as the authority." | abandonment, stake transfer (W48, W49) | nothing: dropped | a concept gone |
| S-218 | suite | 3.7bc | "In a collective whose clause names a keeper's operator as the authority, a founder resigns, a departed holder, its plan naming a stake successor." | abandonment, succession (W48) | nothing: dropped | a concept gone |
| S-219 | suite | 3.8 | "Another member dies. Their succession plan gives their stake to two children in equal shares and their seat to a trusted colleague, with a position paying for the job …" | succession, position (W48, W6) | nothing: dropped | a concept gone |
| S-220 | suite | 3.8b | "In another collective, a member's plan gives their seat to a successor entering automatically …" | succession (W48) | nothing: dropped | a concept gone |
| S-221 | suite | 3.8c | "In a further collective, a party has no succession plan and declared an identity-level succession in a rotation, which its successor confirmed …" | succession (W48) | nothing: dropped | a concept gone |
| S-222 | suite | 3.8d | "A succession plan whose key 2 writes a voting weight beside a seat successor … is out of format …" | succession (W48) | nothing: dropped | a concept gone |
| S-223 | suite | 3.8e | "The succession clone, marked with the plan alone, writes B twice in field 0, A's place kept …" | succession, mark (W48, W39) | nothing: dropped | a concept gone |
| S-224 | suite | 3.8f | "**The recovery rotation, only where nobody else can draw the line.**" | collective's line (W36) | nothing: dropped | a concept gone |
| S-225 | suite | 3.9 | "**The fork of a collective.** A collective of three cannot agree …" | fork of a collective (W45) | nothing: dropped | a concept gone |
| S-226 | suite | 3.9 | "**The original's publications sell nothing from the fork's line**: a payment a Money-only wallet makes after it, naming the old price tag, is owed back to the payer as a refund …" | ending, price tag (W46, W16) | nothing: dropped | a concept gone |
| S-227 | suite | 3.9a | "In a collective of three whose members hold 40%, 30% and 30% of its income, the third member leaves with the powers to do so …" | departed holder (W35) | nothing: dropped | a concept gone |
| S-228 | suite | 3.9b | "Everyone agrees the collective has ended, but its works still earn: it stays a plain collective …" | collective (W35) | nothing: dropped | a concept gone |
| S-229 | suite | 3.9c | "… the release act names the work, the ownership agreement it ends, the claim naming its creators, and the content key of the bake carrying it, and is public." | release, claim (W44, W9) | nothing: dropped | a concept gone |
| S-230 | suite | 3.9d | "Two members fork, one on each side, each side's successor keeping the third member, who signs nothing, at their 25% as a departed holder." | fork of a collective (W45) | nothing: dropped | a concept gone |
| S-231 | suite | 3.9e | "An owner releases a work at a point on its ownership agreement's time reference …" | release (W44) | nothing: dropped | a concept gone |
| S-232 | suite | 3.9f | "A closing act drawn by a member and chain-signed by every member does not take effect: the collective still holds the work." | closing (W45) | nothing: dropped | a concept gone |
| S-233 | suite | 3.9g | "In step 3.9's collective, the third debt, kept out of sight … binds all the same …" | fork of a collective, history (W45, W36) | nothing: dropped | a concept gone |
| S-234 | suite | 3.9h | "A clone of the work's ownership agreement, signed for the collective under its rule for Agreements, gives the lender 40% of the work …" | collective, creditor's release (W35, W47) | nothing: dropped | a concept gone |
| S-235 | suite | 3.9i | "Terms carrying field 25 are invalid, and no area reaches it." | old field numbers, "done" (A8, W36) | nothing: dropped | a concept gone |
| S-236 | suite | 3.9j | "A collective, whose rule for Money names its treasurer alone, is the creditor of a debt of 500." | layer rule (W35) | nothing: dropped | a concept gone |
| S-237 | suite | 3.9k | "**A sale is recorded on the actions chain.**" | actions chain (W36) | nothing: dropped | a concept gone |
| S-238 | suite | 3.9l | "A public record putting the treasurer's clone in force is the line, wherever held." | record (W36) | nothing: dropped | a concept gone |
| S-239 | suite | 3.9m | "A collective's publication citing, on its chain, the decision it acts under counts …" | two chains (W36) | nothing: dropped | a concept gone |
| S-240 | suite | 3.9n | "A member draws a public debt for the collective that no act the closing's line cites reaches." | tie rule, closing (W36, W45) | nothing: dropped | a concept gone |
| S-241 | suite | 3.9o | "S's receipt names the 50/50 version while its history holds the complete 60/40 clone: the owners' line is divided 60/40, the latest complete version that history holds." | version in force for a receipt (W22, W10) | the version the payment names (G13.1, G13.2) | a rule to rewrite |
| S-242 | suite | 3.9p | "A closing every member chain-signs, sealed to one member alone, takes no effect; public, it closes the collective." | closing (W45) | nothing: dropped | a concept gone |
| S-243 | suite | 3.9q | "A collective's negotiation message, sealed to its counterparty alone, binds nothing and sits on neither chain …" | negotiation message (W8) | nothing: dropped | a concept gone |
| S-244 | suite | 3.9r | "A revocation citing the first, completed by the area's holder, ends the grant: the first binds; the second, racing it, is void (the ending wins) …" | collective's grant, revocation (W42, W36) | nothing for a collective; for a delegation, G5.4 and G5.7 | a concept gone |
| S-245 | suite | 3.9s | "A singer grants her agent a grant key reaching publications, by an everyday act, public, which the agent accepts …" | grant key (W42) | a delegation (G5.5); nothing for a grant key | a rule to rewrite |
| S-246 | suite | 3.9s | "The singer revokes by an everyday act citing the agent's first publication: that one binds; another, racing it on a second device, is void." | revocation, "void" (W42, A3) | G5.4: "**not shown** where citing gives no order"; nothing set aside (G5.7) | a rule to rewrite |
| S-247 | suite | 3.9t | "Ana and Ben, no collective, own their song 50/50 under its ownership agreement, and draw a publication naming split service S (field 3), selling the song's bake." | publication, split service (W13, W22) | an offer, a service under a deal (section 5.1) | a rule to rewrite |
| S-248 | suite | 3.9t | "Ownership terms carrying field 14 or 29 are invalid in every client, and so are ownership terms naming a split cMIP (task 8): ownership is one thing, distribution another." | field numbers, task 8 (A8, A4) | nothing: dropped; Terms key 14 is now `control` (A8) | a concept gone |
| S-249 | suite | 3.9u | "Ana and Ben's publication names service S in field 3 and, in field 11, service T as its backup …" | backups (W22) | nothing: dropped | a concept gone |
| S-250 | suite | 3.9v | "The label names its split service by its split agreement …" | split agreement (W14) | nothing: dropped | a concept gone |
| S-251 | suite | 3.9w | "Ana and Ben fork their collective; the fork is complete and ends it." | fork of a collective (W45) | nothing: dropped | a concept gone |
| S-252 | suite | 3.9x | "The sale binds: an act for the collective cited it, adopting it, and no ending racing that citation voids it …" | adoption, tie rule (W42, W36) | nothing: dropped | a concept gone |
| S-253 | suite | 3.9y | "Its members fork, the fork citing on the collective's chain only acts before the debt …" | fork of a collective (W45) | nothing: dropped | a concept gone |
| S-254 | suite | 3.9z | "A verifier without the rail's answer judges neither a purchase or a refund: the payment is pending, and whether it is a purchase is unknown." | "pending", "unknown" (A3) | unclear (U-03) | a rule to rewrite |
| S-255 | suite | 3.9ab | "A closing signed by signature acts (Agreements type 1) has no signature at all." | closing, signature type 1 (W45, W2) | nothing: dropped; type 1 is now a Statement (E2) | a concept gone |
| S-256 | suite | 3.9ac | "Ben drafts a closing and signs it; Ana does not." | closing (W45) | nothing: dropped | a concept gone |
| S-257 | suite | 3.9ad | "He writes three transfers, 30% to Eve, 20% to Carla and 10% to Dan, and signs them by chain signatures …" | stake transfer (W49) | nothing: dropped | a concept gone |
| S-258 | suite | 3.9ae | "In step 3.9's fork, each successor signs by a chain signature with its own chain key …" | fork of a collective (W45) | nothing: dropped | a concept gone |
| S-259 | suite | 3.9af | "A closing whose history names an act the verifier does not hold is unknown to it, never complete and never "not complete" …" | closing, "unknown" (W45, A3) | nothing: dropped | a concept gone |
| S-260 | suite | 3.9ag | "… the first side's successor's first split agreement takes an overhead the original's split agreement did not …" | split agreement (W14) | nothing: dropped | a concept gone |
| S-261 | suite | 3.9ah | "A collective with a departed holder and no holders' rule sells its share of a work to its members' new collective for a token price …" | owners' consent (W12) | nothing: dropped | a concept gone |
| S-262 | suite | 3.9ai | "A collective whose constitutional change rule counts by share, sixty per cent of its stake in itself …" | collective (W35) | nothing: dropped | a concept gone |
| S-263 | suite | 3.9aj | "A distributor's publication names, as its owners (field 1), a collective's ownership agreement (target `[1, null]`) …" | closed owner, ending (W45, W46) | nothing: dropped | a concept gone |
| S-264 | suite | 3.9ak | "Ben sells a fifth of a song's stake to Carla: he signs the transfer by a chain signature …(Identity rule 29; Agreements rule 10)" | stake transfer (W49) | nothing: dropped | a concept gone |
| S-265 | suite | 3, "Passes if" | "**Passes if:** deals 1, 3 and 5 bind the label, deal 2 is void, deal 4 binds once the label adopts it …" | collective, grant, split service, fork, closing | each as in the rows above | a concept gone |

### Section 3b, the label's control model

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-266 | suite | 3b, head | "… a rule they cite numbered 62 to 64, 66, 68 or 94 to 97 is that cMIP's (rule 67 is the Agreements MIR's)." | rule numbering, judicial tier (A2, W29) | nothing: dropped | a concept gone |
| S-267 | suite | 3b, 7c | "The release manager alone signs a clone changing the refund terms, marked with the Releases area's power …" | area, mark (W35, W39) | nothing: dropped | a concept gone |
| S-268 | suite | 3b, 7d | "A clone changing the keepers, marked with the release manager's area power and signed by the manager, is invalid …" | keepers, mark (W26, W39) | nothing: dropped | a concept gone |
| S-269 | suite | 3b, 7e | "One clone changes a field 2 entry the Releases area decides … and names a second payment cMIP for task 6 …" | tasks by number, area (A4, W35) | nothing: dropped | a concept gone |
| S-270 | suite | 3b, 7f | "Two members clone the arbitrator; the third does not sign. The judicial tier changes only with every member's signature (Agreements rule 67) …" | judicial tier (W29) | the judicial changes only by an update the condition answers valid (G5.6(d)) | a concept gone |
| S-271 | suite | 3b, 7l | "One clone changes the refund terms (the label's constitution, Agreements rule 98) and the keepers (its judicial tier, Agreements rule 67)." | constitution, keepers (W37, W26) | nothing: dropped | a concept gone |
| S-272 | suite | 3b, 7ab | "A holder votes on an owners' matter; the record names the signature …" | owners' matters (W12) | nothing: dropped | a concept gone |
| S-273 | suite | 3b, 7ac | "**An issuance.** A collective's stake in itself carries a sixty per cent holders' rule …" | issuance (W12) | nothing: dropped | a concept gone |
| S-274 | suite | 3b, 7ad | "**Who holds what at the vote.** A seller votes on an owners' matter, sells part of its stake …" | owners' matters (W12) | nothing: dropped | a concept gone |
| S-275 | suite | 3b, 7aj | "**A holders' rule.** Dana holds 10% of a collective's stake in itself under a 60% holders' rule she signed …" | holders' rule, an owners' matter (W12); stake, collective (W11, W35) | nothing: dropped | a concept gone |
| S-276 | suite | 3b, 7ak | "**Proxies.** A holder names a proxy, standing over its stake, placed by the collective's line …" | owners' matters (W12) | nothing: dropped | a concept gone |

### Scenarios 5 to 9, and the freeze procedure

| # | file | section or step | the sentence, quoted | what it leans on | what draft 25 has instead | kind |
|---|---|---|---|---|---|---|
| S-277 | suite | 5.2 | "A buyer pays anonymously the journalist's price tag on a piece, a bake the journalist uploaded: a purchase from its uploader, paid to the journalist unsplit (Money rule 18; Envelopes rule 23) …" | purchase of a bare bake (W17) | unclear (U-11) | a word to change |
| S-278 | suite | 5.3 | "They negotiate in a private thread of negotiation messages, Agreements acts carrying text …" | negotiation message (W8) | nothing: dropped | a concept gone |
| S-279 | suite | 5.8b | "A collective named as successor confirms by a chain signature naming the rotation, under its key grammar …" | collective (W35) | nothing: dropped | a concept gone |
| S-280 | suite | 6.1 | "A streaming company sells access under a publication requiring its own app: a proven delivery in the access form, the company its own split service, no partner …" | publication, proven delivery, split service (W13, W7, W22) | an offer; nothing for proven delivery | a rule to rewrite |
| S-281 | suite | 6.2 | "A grant of a collective carrying a grant key is invalid: a collective's grantee acts with its own key (Agreements, "Grant (type 9)")." | grant key, collective (W42, W35) | nothing: dropped | a concept gone |
| S-282 | suite | 6.3 | "… ends the publication by a later version selling nothing, signed by every party of it (here the company alone). A payment racing the ending is owed back by the split service, the company." | ending (W46) | never ended (G4.9); G10.5 | a rule to rewrite |
| S-283 | suite | 6, "Passes if" | "… the buyer's licence remains a portable, signed act after the publication ends, and a payment racing the ending is owed back." | ending (W46) | never ended (G4.9) | a rule to rewrite |
| S-284 | suite | 7.1 | "Each creator group's work has its ownership agreement, its stake on the claim; each group signs with the service a publication of its works, naming that ownership agreement as owners (field 1), the service as split service (field 3) and as a partner for its cut (field 2) …" | ownership agreement, publication, fields (W10, W13, A8) | a work; an offer; a service under a deal (section 5.1) | a rule to rewrite |
| S-285 | suite | 7.1 | "An ownership agreement carrying a split service or its backups (terms fields 14 or 29) is invalid …" | field numbers (A8) | nothing: dropped | a concept gone |
| S-286 | suite | 7.2 | "A listener subscribes: a monthly obligation under the subscription's publication, against its time reference …" | publication, time reference (W13, W31) | an offer; a clock | a word to change |
| S-287 | suite | 7.4 | "… each month, every incoming receipt is matched by a split under each creator's chosen model, and every payout is paid with its own receipt." | split, payout (W23, W24) | leg reports, legs (G11) | a rule to rewrite |
| S-288 | suite | 7.7 | "One creator group switches services: a new version of its publication, every party signing … names a new split service in field 3 …" | publication's version, split service (W13, W22) | an update and its condition (G4.11) | a rule to rewrite |
| S-289 | suite | 7.7 | "**The owners' side terminates a service's place** *(run)*: … a terminating act, a version changing only field 3 …(Agreements rule 11, "Termination") …" | termination (W46) | nothing: dropped | a concept gone |
| S-290 | suite | 7.7b | "… the publication names termination terms (field 13): a test cMIP whose parameters set a minimum term …" | termination terms (W46) | nothing: dropped | a concept gone |
| S-291 | suite | 7.7c | "A verifier that does not hold step 7.7b's test cMIP reads the version signed after the point: unknown, and the publication's state unknown from that act on, never active, never terminated …" | termination, "unknown" (W46, A3) | nothing: dropped | a concept gone |
| S-292 | suite | 7.7d | "After the point, the label alone signs a version of step 7.7b's publication dropping itself from field 2 …" | termination, partner (W46, W15) | nothing: dropped | a concept gone |
| S-293 | suite | 7.8 | "The subscription's pool is the first of the layers money passes through (Agreements rule 15) …" | money layer by layer (W20, W22) | a sequence of legs (G11.1) | a rule to rewrite |
| S-294 | suite | 7.8a | "A publication names its split service in field 3 and may name backups in order (field 11), with what counts as a failed attempt (field 12) …" | backups (W22) | nothing: dropped | a concept gone |
| S-295 | suite | 7.8a | "An owner that is another ownership agreement is paid through it, its part divided by its own stake." | ownership agreement as owner (W10) | a receiver that is an agreement, read for the act (G1.3, G1.4) | a rule to rewrite |
| S-296 | suite | 7.8b | "Each participant's check (Agreements rule 18) finds its whole cut at its own flow address …" | participant's check | the receiving side's confirmation, and halves matched or not (G11.4(b)) | a rule to rewrite |
| S-297 | suite | 7, "Passes if" | "… a publication is terminated, or a party's place in it, only by a terminating act that counts …" | termination (W46) | nothing: dropped | a concept gone |
| S-298 | suite | 8.1 | "Two clients map an agreement's task numbers to the same tasks." | tasks by number (A4) | unclear (U-10) | a word to change |
| S-299 | suite | 8.3 | "An agreement names an extension for a kind of work no task covers …" | extension, tasks (W41, A4) | nothing: dropped | a concept gone |
| S-300 | suite | 8.6 | "A publication selling a proven delivery names it in its access form … No agreement names it by a task number." | proven delivery (W7) | nothing: dropped | a concept gone |
| S-301 | suite | 8, "Passes if" | "… no client signs an agreement naming an extension it lacks …" | extension (W41) | nothing: dropped | a concept gone |
| S-302 | suite | 9, head | "*Each exit from a work, a collective or the protocol, written as the acts it needs …*" | collective (W35) | nothing: dropped | a concept gone |
| S-303 | suite | 9.1 | "Ana sells her whole share to Cy: a transfer (Agreements type 4) Ana signs, by a chain signature too, and Cy completes; it names the ownership agreement, its chain …" | stake transfer, split key 8 (W49, W23) | nothing: dropped | a concept gone |
| S-304 | suite | 9.2 | "**A member leaving a collective.** …" | collective (W35) | nothing: dropped | a concept gone |
| S-305 | suite | 9.3 | "**Succession.** A collective's member dies." | succession (W48) | nothing: dropped | a concept gone |
| S-306 | suite | 9.4 | "**Closing and fork.** A collective that cannot agree forks …" | fork of a collective, closing (W45) | nothing: dropped | a concept gone |
| S-307 | suite | 9.5 | "**The collective escapes**: a homeless rotation signed with its chain key, rebuilt from k of its members' shares, is its own escape endorsement …" | collective, key grammar (W35) | nothing: dropped | a concept gone |
| S-308 | suite | 9.6 | "A publication's parties sign a later version selling nothing, ending it; its split service has received a payment on a push rail … owed back (Agreements rules 11 and 12)." | ending (W46) | never ended (G4.9) | a rule to rewrite |
| S-309 | suite | 9.6 | "A purchase the buyer contests, by a contest naming their claim, is shown beside it, changing nothing (rule 54)." | contest naming a claim (W33) | a buyer's contest names the version and the settlement (G11.8) | a rule to rewrite |
| S-310 | suite | 9.7 | "What crosses is the bake (its bytes), the claim and the ownership agreement, each in core format …" | claim, ownership agreement (W9, W10) | nothing: dropped | a concept gone |
| S-311 | suite | 9, "Passes if" | "**Passes if:** an owner leaves a work by the transfer alone …" | stake transfer, collective, ending | each as in the rows above | a concept gone |
| S-312 | suite | Freeze procedure, 1 | "… and then the six MIRs' spec hashes, computed as Development rule 26 says …" | which text is Agreements, and its hash (A1) | unclear (U-09) | a word to change |
| S-313 | suite | Freeze procedure, 2 | "… a rail Module (Money), a split Module and a deal-assessment tool (Agreements)." | split, deal (W23, W5) | a K6 cMIP; "deal" has another meaning (W5) | a word to change |

## cMIPs and Modules: what leans, named only

*The Dubsar Suite lead's ground. Latest drafts only. Each row: the file, one sentence that shows it leans (quoted, "…" marks words left out), and what it leans on. No analysis, and nothing in them is changed.*

| # | file | the sentence, quoted | what it leans on |
|---|---|---|---|
| M-001 | `cmips/cmip-anchoring-draft-8.md` | "Draft 6 moves the pooled service from the standing offer to a publication and its price tag …" | publication (Agreements type 6), price tag (W13, W16) |
| M-002 | `cmips/cmip-appended-collective-draft-1.md` | "… and the Agreements MIR draft 16 (a collective's agreement in force, its parties, departed holders)" | names an old Agreements draft; collective, departed holder (W35) |
| M-003 | `cmips/cmip-collective-control-draft-6.md` | "*Draft 6, 6 November 2026, for Nobody, allegedly, to approve: draft 5 naming the Agreements MIR draft 23, no rule of its own changed" | names an old Agreements draft; collective, control model (W35) |
| M-004 | `cmips/cmip-conversion-draft-5.md` | "Draft 4 moves the conversion service from the standing offer to a publication and its price tag, as the anchoring cMIP's draft 6 does …" | publication, price tag (W13, W16); "A contest of a purchase" (W33) |
| M-005 | `cmips/cmip-corrections-draft-2.md` | "A correction is a plain text act … signed by the same signer (or by the collective, for a collective's act) …" | collective (W35) |
| M-006 | `cmips/cmip-grant-limits-draft-4.md` | "… **a collective has no signing key and no member keys** (Agreements rules 56 to 60) …" | grant, collective, rules 56 to 60 (W42, W35) |
| M-007 | `cmips/cmip-live-media-draft-1.md` | "… Agreements (offers, rule 32 and the offer format; rule 32b, the state of each sale; rule 15, the work claim) …" | an older Agreements (draft 10): offers, sale states, the work claim (W18, W9) |
| M-008 | `cmips/cmip-member-keys-draft-2.md` | "… **a collective has no signing key and no member keys**; each member acts for the collective with their own key, naming it (Agreements …" | collective (W35) |
| M-009 | `cmips/cmip-money-messages-draft-6.md` | "… under a **publication** (Agreements type 6) its split service's; **the split service receives in its own name** (Agreements rule 16) …" | publication, split service, terms fields 8, 14, 28, 29 (W13, W22, A8) |
| M-010 | `cmips/cmip-naming-draft-1.md` | "… (the name act is the root of its own chain, as a publication is)" | a publication's chain of versions (W13) |
| M-011 | `cmips/cmip-nudge-draft-4.md` | "… **a collective has no signing key and no member keys**, each member acting for it with their own key, naming it (Agreements rules 56 to 60)" | collective (W35) |
| M-012 | `cmips/cmip-payment-draft-6.md` | "… a **purchase is a payment naming a price tag a publication counts** (Agreements rule 12), its `purchase` now **the ownership agreement and the version whose shares it pays** …" | purchase, publication, ownership agreement, split service (W17, W13, W10, W22) |
| M-013 | `cmips/cmip-relay-transport-draft-7.md` | "… a collective's grantee with its own key too, the grant carrying no key (Agreements, "Grant (type 9)"); a signature act carries no key (its key 1 retired) …" | grant, signature act, collective (W42, W2, W35) |
| M-014 | `cmips/cmip-release-manifest-draft-5.md` | "Draft 5 says what a release is in those terms: **a release is a bake of the manifest, uploaded by a member for the collective, naming it**, and it counts for the collective where Agreements finds its uploader …" | collective (W35) |
| M-015 | `cmips/cmip-rotation-notice-draft-1.md` | "* Written against the Agreements MIR draft 17 (the negotiation message, type 18 …" | names an old Agreements draft; negotiation message (W8) |
| M-016 | `cmips/cmip-runner-draft-6.md` | "… each member acts for it with **their own key**, the act naming the collective in its `objects` (Agreements rule 58)" | collective, `objects` (W35, A5) |
| M-017 | `cmips/cmip-specification-card-draft-2.md` | "… the word publication now means only the Agreements act that sells (type 6)" | publication (W13) |
| M-018 | `cmips/cmip-split-draft-4.md` | "Written against Agreements draft 17 (the redesign from bake to publication: the publication, type 6, in place of the standing offer and terms fields 8, 14, 28 and 29) …" | names an old Agreements draft; publication, split service, split plan (W13, W22, W20) |
| M-019 | `cmips/cmip-website-draft-12.md` | "… **a collective has no signing key and no member keys**: a member acts for it with their own key, naming it (Agreements rules 56 to 60)" | collective, "publication" (W35, W13) |
| M-020 | `modules/module-airgap-chain-key-signer-draft-6.md` | "holder = [ role: 0 / 1 / 2, identity: hash / null ]   ; 0 a member, 1 a custodian holding it under the collective's grant, 2 an escrow released by the abandonment authority" | collective's key grammar, grant, abandonment (W35, W42, W48) |
| M-021 | `modules/module-lightning-rail-draft-3.md` | "… so the claim a purchase names on this rail is the one the seller's request committed to (Agreements rule 32a)" | an older Agreements rule; purchase (W17) |
| M-022 | `modules/module-onchain-rail-draft-3.md` | "… in a collective every member and the split service can locate every buyer's coins …" | collective, split service (W35, W22) |

**Not counted.** The other 19 latest specifications show none of the signs above: `cmip-accepted-draft-1`, `cmip-agent-memory-draft-2`, `cmip-long-form-draft-1`, `cmip-long-form-corrections-draft-1`, `cmip-notes-draft-1`, `cmip-people-draft-2`; `module-airgap-safety-signer-draft-4`, `module-bitcoin-clock-draft-3`, `module-chain-key-seed-hex-draft-2`, `module-chain-key-seed-words-draft-2`, `module-clock-timestamp-draft-2`, `module-identity-carry-words-draft-2`, `module-safety-seed-hex-draft-1`, `module-safety-seed-words-draft-1`, `module-signing-key-string-draft-1`, `units-bitcoin-draft-1`; and the three media Modules, `module-audio-draft-1`, `module-jpeg-draft-1` and `module-video-draft-1`. The media Modules do say that "a public publication describes" a work's bytes. That is the older sense of "publication", from Envelopes, before the word came to mean "only the Agreements act that sells" (`cmip-specification-card-draft-2`). Claude did not count them, and lists them here so that the joining session can decide. `cmip-accepted-draft-1` speaks of "the agreements' cMIPs" in plain words, and was not counted either.

## Where Claude cannot tell what draft 25 has instead

*Each in one line, then why. The ones on which a verifier's answer would turn come first. None is resolved here.*

**A verifier's answer turns on these.**

- **U-01** (S-017, S-051, S-135). *A co-owner sells the work alone, by an offer of her own.* Draft 24: "valid, visibly contradicting it, … never prevented". Draft 25: if her Terms name the work's envelope and she is not the holder of the baker's rights at the act they cite, they are **invalid** (G14.3(a)). If they name no envelope, G14 is not asked at all. The suite's step does not say which, so the answer could be valid or invalid.
- **U-02** (S-025, S-140). *A Money-only wallet buys.* Draft 25's buyer "signs by an assent to the version they buy under" (section 2, "Buyer"). A wallet that reads only Money signs no assent. Draft 25 says such a payer "is not shown as bound by those Terms" (G11.6(b)). It does not say whether the payment is then still a buyer's payment under the offer, or only a payment that reaches the receiver (G1.4).
- **U-03** (S-254). *"Pending" and "unknown".* The suite asks a verifier to answer "pending" and "unknown". Draft 25: "The core's 'unknown', 'void' and 'pending' have no word here" (section 8.1). Its own word for a rule it could not apply is **unchecked** (G9). It does not say that the two are the same.
- **U-04** (S-105, S-129, and the collective's rotations). *A signer rotates and disowns an act others relied on.* Draft 25 lists as needed and not had "What the Sign layer does when a key is replaced or lost, since that decides whether G6 sees a fork" (section 8.1). Its "what others relied on stands" (G12.5) is written for a tip that a resolving update sets aside, not for a rotation.
- **U-05** (S-150). *A buyer's contest, through a conversion service.* A buyer's contest names "the settlement the payment names" (G11.8). When the payment goes through two hops, with two receipts, draft 25 does not say which act that is: "What a settlement is, as the layer that holds value gives it" is listed as missing (section 8.1). So whether the contest is shown as a buyer's, or is **unchecked**, cannot be told.
- **U-06** (S-066, S-150, S-151). *A contest by someone who is not the buyer.* Draft 24: "the same contest signed by anyone else shows nothing". Draft 25: a contest by anyone "reaches the signers of what it is made against", and "Who else may make a contest, and when, is not said (section 8.4)".
- **U-07** (S-113). *A version the settlement never saw.* Draft 24: "a third version of the reference the settlement never saw" changes nothing. Draft 25: "A resolving update MUST name every tip" (G12.3). Where the verifier holds the third version, draft 25 reads a fork that stands. Where it does not hold it, draft 25's answers carry "as shown", and the text does not say what changes once the third version arrives after the resolving update was accepted.
- **U-08** (S-170, S-246). *Acts racing the end of a power, where citing gives no order and no place is named.* Draft 24 answers "void". Draft 25's G5.4 answers **not shown** in that case. G5.7 says no act "sets aside, voids or undoes an act made under its grant". The suite's steps name no place, so Claude cannot tell whether draft 25 would answer "per place" or "not shown" for them.

**The answer does not turn on these, or turns less.**

- **U-09** (S-312). *Which hash Agreements is frozen under.* The freeze rewrites each text's header and then hashes it. Draft 25's acts are written under "the hash of this file as published on its branch" (draft 25's head; E2), and "a later draft is a new specification". Draft 25 is not a MIR in `spec/`. The texts do not say whether the freeze step applies to it, or what becomes of acts written under its present hash.
- **U-10** (S-091, S-298). *Task numbers.* The suite has clients map "an agreement's task numbers" (Development's numbering, named in terms field 2). Draft 25's tasks are fields of an act, K1 to K8 (section 5). It does not say whether Development's numbers still name any of them.
- **U-11** (S-014, S-277). *Money sent to a bare bake.* Draft 25 reads payments that name a version of an agreement (G13.2, G1.4). It says nothing of a payment to a bare bake, or whether "unsplit" means anything there.
- **U-12** (all rows pointing at W13). *Publication as offer.* Draft 25 reads "offer" as an agreement with a role, and says: "That reading is Claude's (section 8.4)". Every row here that maps a publication to an offer rests on that reading.

## Counts

*Counted from the tables above.*

**By file.**

| file | rows | a word to change | a rule to rewrite | a concept gone |
|---|---|---|---|---|
| `spec/03-MOR-freeze-test-suite-v37.md` | 313 (S-001 to S-313) | 18 | 81 | 214 |
| `cmips/`, 19 of its 25 latest drafts | 19 (M-001 to M-019) | not sorted by kind | not sorted by kind | not sorted by kind |
| `modules/`, 3 of its 16 latest drafts | 3 (M-020 to M-022) | not sorted by kind | not sorted by kind | not sorted by kind |

*The prompt asks for the cMIPs and Modules to be named, not analysed, so they are not sorted by kind.*

**The suite, by part and by kind.**

| part | rows | a word to change | a rule to rewrite | a concept gone |
|---|---|---|---|---|
| head and core components (S-001 to S-098) | 98 | 7 | 30 | 61 |
| scenario 1 (S-099 to S-132) | 34 | 2 | 15 | 17 |
| scenario 2 (S-133 to S-158) | 26 | 3 | 16 | 7 |
| scenario 3 and 3b (S-159 to S-276) | 118 | 1 | 9 | 108 |
| scenarios 5 to 9 and the freeze procedure (S-277 to S-313) | 37 | 5 | 11 | 21 |
| **total** | **313** | **18** | **81** | **214** |

Of the 313 rows, 94 lean on the collective or its acts (W35, W36). Scenario 4, "A democracy round", leans on nothing.

**Unclear.** 12 (U-01 to U-12); 8 of them change a verifier's answer.

## The cold reader's check

A subagent that had seen neither the ledger nor this session's prompt read "In plain words" and ten rows (S-025, S-030, S-038, S-049, S-078, S-166, S-188, S-203, S-275, S-299). Fixed in the wording: the plain words now name the file and the MIR, gloss "leans on", the old words, the two examples, "unclear" and the cMIPs; "How to read" now explains the columns, the step labels, the bracketed scenario numbers and "unclear (U-NN)"; S-030, S-166, S-188, S-275 and S-299 name what they lean on more fully; "the label" is explained before scenario 3.

**Not fixed.** Words inside quotations stay as the suite wrote them, so a first-time reader still meets unexplained suite terms there ("save the judicial tasks", meaning "except"; "outcome 0"; "counted tag"). The plain-words examples cannot be checked from ten random rows; they point to S-110 and U-01. Where a row's kind rests on "the main thing the place tests" (S-049: what it leans on is dropped, yet the question it tests, which version a payment buys, has a rule in draft 25), the sorting is Claude's judgement, as "How to read" says.

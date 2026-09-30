# MIP: Law

*Draft 7, 30 September 2026. Written against core v18, Identity MIP draft 10, Envelope MIP draft 6, Text MIP draft 6, Finance MIP draft 5 and findings F1 to F104. Draft 7 is draft 6 with F103 and F104 written in (found while building roadmap step 11b, the collective client). F103: a collective's rules follow MOR's layers, and an agreement's rules fall in three tiers, constitutional, judicial and operational; operational areas are powers of members, who may grant within them, and a grant never reaches beyond its issuer's power; the constitutional tier has its own change rule, everyone by default, so nobody loses their say without signing. F104: a clone's field 4 is a mark stating truthfully which of the parent's rules brought it into force and by whose signatures; verifiers check it. Which tier and area a clone touches is defined mechanically from the fields it changes ("Tiers"). New exact formats: terms fields 4 (for a clone), 18, 19 and 20, the key grammar (its listed act types move to areas), areas, marks, and grant fields 5 and 6. Places where the findings are silent or allow two readings are written with the lean and marked [Qn]; two flaws in the findings are named and not resolved, marked [Flaw A] and [Flaw B]; all are listed in "Pending decisions" at the end, to be removed once decided. Draft 6 was draft 5 with the first exact formats, those a collective needs (roadmap step 5a, where the test collective first uses them): terms, including the key grammar and the abandonment clause; signature acts; clones; the Law declaration a collective's chain carries. It writes in F96 (a key grammar survives the loss of any one key holder) and F100 (an act of a collective that needs member signatures is judged under the agreement the collective's own chain declares at the act's binding, so a member change fences the old rules off). Draft 5 was draft 4 with one finding of the air-gapped safety key Module (roadmap step 6) written in: dealing the shares of a collective's next safety key verifiably stops a device from keeping sole control of it, never from keeping a copy (F97). Draft 4 applied review round 2: contests instead of disputes; a party bound only by its own signature; protected clauses a clone cannot change for a party who did not sign it; shares that refer to stakes; role-share evidence signed by a third party; keeper records that count only alongside the act they name; a seal that cannot predate a deal the grantor paid on; key grammars that always leave a way to rotate; a sale tied to the seller's agreement, said plainly; refunds claimable by proof.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

Law is the language of verifiable agreements between identities. It defines:

- how an agreement is proposed, signed, recorded and changed (by cloning, never by editing);
- keepers, the notaries that record deals as they happen, so a rotation cannot erase what someone relied on;
- stakes in works and publications, how they are bound, transferred and released;
- splits: how money that reached the owners' payee pointer is divided, exactly, including module fees and shares assigned to roles;
- offers accepted by payment, conditions, and time;
- grants and collectives: acting for others, within limits;
- abandonment, and what happens when someone disappears from a deal;
- non-performance: the core never enforces, but it makes default impossible to hide.

Finance ends when money reaches a payee pointer. Law says who owns what, how it is shared, and who failed when something breaks.

## Dependencies

Identity, Envelope, Text and Finance. Law is optional per client, but all or nothing: a client implements it fully, or shows its acts as unknown (core, client conformance). A client that acts on agreements implements Law (F11). No rule of a lower layer depends on Law: where Law needs a lower layer to carry something, it is a field there (the publication's `for`, Envelope).

## Definitions

- **Terms.** An act proposing an agreement: its parties, text, cMIPs, keepers and rules.
- **Signature.** An act by one party naming terms (or a clone, a transfer, a release) as agreed. Under one signer per act, every agreement is terms plus one signature act per party.
- **Agreement.** Terms together with the signatures its rules require. Its id is the id of its terms act. An agreement commits identities, not keys: a later rotation changes the pen, never the promise. A party is bound only through its own signature act.
- **Agreement chain.** The acts on one agreement (signatures, clones, records, transfers, payouts, contests), each naming the chain and the act it follows in `objects` (Envelope).
- **Position.** An agreement that confers income without ownership.
- **Keeper.** A relay, operated by an identity, named by an agreement to record the acts around a deal as they arrive, and to sign what it recorded: a notary stamping sealed envelopes. A keeper records act ids and signers, never content. A record counts only alongside the act it names.
- **Arbitrator or verifier.** A third party named by an agreement to judge content (escrow and milestones, arbitration, regulated checks). Unlike a keeper, it receives the keys of the acts it must judge, by ordinary key delivery.
- **Stake.** A share in a work or a publication, defined by an agreement, identified by the agreement and its index in the stakes list. Shares in each always add up to 100%. The current holder of a stake is whoever the transfer chain on the agreement names.
- **Work claim.** An act binding a work's hash to its creators.
- **Split plan.** The part of an agreement that says how incoming payments are divided: fixed shares on stakes, role shares, fees, a maximum fee per payout, and what happens to unfilled roles.
- **Split service.** An identity that receives payments on behalf of a work's owners, divides each one according to their agreement, and pays every party out. It can be a company, a collective, a friend running software, or the owners themselves; a sole creator is simply their own split service.
- **Split.** A split service's signed act dividing one incoming payment into payouts.
- **Payout.** One receiver's part of a split, paid as a simple Finance payment with its own receipt.
- **Role share.** A share assigned to a role rather than a named party, filled when the payment happens: for example the reposter who led to the sale, the relay that served the file, the modules the payment ran through. Its evidence is an act signed by a party other than the split service and the payee.
- **Standing offer.** Published terms that anyone accepts by paying.
- **Time reference.** A source of time an agreement names, such as a block height. Only it decides "before", "after" and "past its terms" for that agreement.
- **Collective.** Several identities acting together as one identity. A collective is a full identity (Identity MIP), with its own genesis, homes, signing key and safety key; its founding agreement says how its members hold and use those keys.
- **Key grammar.** The part of a collective's founding agreement that says how its keys are held and activated, and the way to rotate that needs less than every member.
- **Tier.** Each field of an agreement's terms belongs to one of three tiers ("Tiers"). **Constitutional:** who decides: the parties (membership), the change rules, the key grammar, the areas. **Judicial:** who judges and by what: the protected clauses. **Operational:** everything else.
- **Change rules.** The rules a clone must meet, each covering part of the terms: the **constitutional change rule** (terms field 18; every party when none was agreed); the **clone rule** (field 5), for the judicial tier and operational matters outside every area; and the **power** over each area.
- **Area.** A part of the operational tier that the constitution gives to some of its members, the area's **holders**: acts of the collective and operational fields of its terms. Its holders decide there, and may grant within it.
- **Power.** The right to bring a change into force: the constitutional change rule, the clone rule, or an area's holders meeting its threshold.
- **Mark.** A clone's terms field 4: which of the parent's change rules it claims to meet, and the parties whose signatures meet it (F104).
- **Layer.** One of MOR's layers (core, "Structure"): Identity; Envelope and Text; Finance; Law; Production. An act's layer is the layer of the MIP its `spec` names; an act whose `spec` is a cMIP or Module has no layer of its own here [Flaw B].
- **Grant.** A delegation of authority, with limits, from an identity or collective to another identity. A grant never reaches beyond the power of whoever issued it.
- **Contest.** A signed objection, by a party with standing, to another act. It changes nothing about any act's validity, status or selection; it makes disagreement visible. *Draft 3 called this a dispute; the word is now reserved for the status Identity gives an act after a rotation (F69).*
- **Standing.** Who may contest an act: a party to its agreement, a holder of a stake it affects, or a keeper, arbitrator or verifier the agreement names.
- **Protected clause.** A clause that can move a party's stake or voice without that party's later signature: the abandonment clause, the succession plan, the fork rule, the keepers, the split service and the time reference. Together they are the judicial tier; the split service is operational in kind, and protected as a stated exception, since it can move money.

## Act formats

All acts are Envelope MIP acts, private by default, visible to the agreement's parties and keepers unless they choose otherwise. Terms (type 0) and signatures (type 1) have exact formats, in the fields a collective needs (draft 6), with the tiers' fields (draft 7); grants have exact formats for the fields that tie them to an area (fields 5 and 6, draft 7); the fields still marked open, and the other acts, are sketched, and exact formats follow once the structure is settled. *A client that meets terms using a field whose format is still open refuses them rather than accepting them unchecked (Envelope rule 11, fail closed).*

| Type | Name | Signed by |
| --- | --- | --- |
| 0 | Terms | the proposer |
| 1 | Signature | each party (or grantee, or collective member) |
| 2 | Keeper record | a keeper's operator |
| 3 | Work claim | a sole creator; or one creator, completed by the other creators' signature acts |
| 4 | Stake transfer | the seller; completed by the buyer's signature; names the work's chain and the agreement's chain |
| 5 | Public domain release | a holder; completed by the required signatures |
| 6 | Standing offer | the owners under their agreement's rule, or a grantee |
| 7 | Delivery confirmation | the offer's side, for a publication whose key is public |
| 8 | Split | the split service, with its own key |
| 9 | Grant | the grantor; for a collective granting within an area, completed by its holders' signature acts |
| 10 | Revocation | the grantor, naming the act that seals the branch |
| 11 | Import or handover | the collective |
| 12 | Liveness | a party |
| 13 | Abandonment declaration | the authority the clause names, always an identity |
| 14 | Contest | anyone with standing |
| 15 | Module fee terms | a module's creator |

### Terms (type 0)

```cddl
terms-payload = {
  0 => [+ hash],            ; parties: identity or collective hashes
  1 => tstr,                ; the terms' words, as canonical text (with field 20, an area's own words [Q2])
  2 => { * uint => hash },  ; cMIPs, at most one per task (task number => cMIP hash); empty if it uses no task
  ? 15 => [+ hash],         ; extensions: cMIPs outside the listed tasks, which add rules and never relax the core's
  ? 16 => [+ succession-plan] ; succession plans of parties, part of the signed terms
  ? 3 => keepers,           ; named keepers and the rule for what counts as recorded
  4 => rule / mark,         ; founding terms: signing rule, which signatures make the agreement exist
                            ;   a clone: its mark, which change rule of the parent brought it into force, and by whom (F104)
  5 => rule,                ; clone rule: the judicial tier, and operational matters outside every area [Q5]
  ? 18 => rule,             ; constitutional change rule; absent: every party (F103)
  ? 19 => [+ area],         ; operational areas, powers of members (only with field 12)
  ? 20 => { + uint => tstr }, ; each area's own words, as canonical text, by area index [Q2]
  ? 6 => [ hash, any ],     ; time reference: the task cMIP and its parameters
  ? 7 => stakes,            ; stakes defined, in works or publications (format open)
  ? 8 => split-plan,        ; how incoming payments are divided (format open)
  ? 9 => abandonment,       ; the abandonment clause
  ? 10 => fork-rule,        ; how forks are settled, where parties may act independently (format open)
  ? 11 => hash,             ; parent: the agreement this one clones (with its latest act in objects)
  ? 12 => key-grammar,      ; present if this agreement founds a collective
  ? 13 => [+ hash],         ; arbitrators or verifiers named, who receive keys to judge content
  ? 14 => hash,             ; the split service's grant, where incoming payments go to one
  ? 17 => refund-terms      ; for standing offers: how long a refund stays claimable, on the time reference (format open)
}

key-grammar = {
  0 => holding,             ; how the signing key is held
  1 => holding,             ; how the safety key is held, usually stricter
  ? 3 => recovery           ; a way to rotate that needs less than every member, required when holding 1 names every member
}                           ; key 2 (draft 6: listed act types) is retired and never reused: areas reach acts (field 19)
holding  = [ 0, holder: hash ]                        ; one holder
         / [ 1, threshold: uint, members: [+ hash] ]  ; any k of these members: jointly for the signing key; by shares for the safety key
         / [ 2, custodian: hash, grant: hash ]        ; a custodian under the collective's grant
recovery = [ 0, custodian: hash, grant: hash ]        ; a custodian holds a share under grant
         / [ 1, authority: hash ]                     ; an escrowed share released by the abandonment authority

succession-plan = {
  0 => hash,                               ; the party whose succession this is
  ? 1 => [+ [ successor: hash, share: uint ]],   ; stake successors, shares in millionths of the party's stakes
  ? 2 => [+ [ successor: hash, weight: uint ]],  ; seat successors, with their voting weight
  ? 3 => uint                              ; seat entry: 0 automatic, 1 with the members' approval, under the power a change of parties needs (rule 44c)
}

abandonment = {
  0 => [ 0, hash ]          ; the authority: a named identity (a keeper's operator, or a third party)
     / [ 1, uint ],         ;   or a threshold of the other parties
  1 => [+ uint],            ; outcomes allowed (rule 53), ascending: 0 voice removed from the clone rule [Flaw A], 1 stake redistributed,
                            ;   2 stake transferred to parties named or defined by role, 3 obligations redirected or held, 4 agreement closed
  ? 2 => uint               ; the period of absence, on the agreement's time reference (only with one)
}

keepers   = [ [+ hash], rule ]                      ; keeper operators, and any one / threshold / all
rule      = [ 0 ] / [ 1, uint ] / [ 2, [+ hash] ]   ; all parties / threshold / named parties
stakes    = [+ [ object: hash, [+ [ holder: hash, share: uint ]] ] ]   ; shares in millionths, summing to 1,000,000; leftovers to the first party listed; each stake is identified by its index here

area = {
  0 => tstr,                ; its name, as canonical text, shown before signing
  1 => [+ hash],            ; holders: parties
  2 => uint,                ; how many of the holders decide together: 1 to the number of holders
  ? 3 => [+ kind],          ; the acts of the collective it reaches
  ? 4 => [+ field-ref]      ; the operational fields of the terms it reaches
}                           ; an area reaches at least one act kind or one field; it is identified by its index in field 19
kind = [ 0, layer: uint ]                 ; every act whose spec is a MIP of this layer: 0 Identity, 1 Envelope and Text, 2 Finance, 3 Law [Flaw B]
     / [ 1, spec: hash, type: uint ]      ; every act of this type in this specification
field-ref = [ 0, field: uint ]            ; a whole operational field: 7 stakes, 8 split plan, 17 refund terms
          / [ 1, task: uint ]             ; one entry of field 2: the cMIP for this task, where the task is operational

mark  = [ power, signers: [+ hash] ]      ; the change rule claimed, and the parties whose signatures meet it
power = [ 0 ]                             ; the parent's constitutional change rule (its field 18, else every party)
      / [ 1 ]                             ; the parent's clone rule (its field 5)
      / [ 2, area: uint ]                 ; the power over the parent's area of this index
```

*A rule's threshold is between 1 and the number of parties; named parties are parties. In a key grammar, members of a holding are parties. An area's holders are distinct parties; a mark's signers are distinct.*

**A clone** is terms with a parent (field 11). Its inside names, in `objects`, the parent's chain and the act of that chain it follows: `[[parent, act]]`. Founding terms name no chain. A clone's field 4 is a mark, founding terms' field 4 a rule; terms whose field 4 has the other form are invalid.

**Areas** (field 19) appear only in terms that carry a key grammar (field 12) [Q1], and area words (field 20) only for an area that exists. No two areas reach the same act or the same field: two kinds overlap when they are equal, or when one is `[0, layer]` and the other `[1, spec, type]` with `spec` a MIP of that layer. A field reference names an operational field or task ("Tiers"). Genesis and rotations are never in an area's reach: the key grammar governs them. Terms breaking any of these are invalid.

*Which layer a MIP belongs to is fixed by the core's structure and the six MIP hashes, so matching a `[0, layer]` kind needs nothing but the act's own `spec` field. An act whose spec is a cMIP or Module is reached only by a `[1, spec, type]` kind naming it.* [Flaw B]

### Signature (type 1)

```cddl
signature-payload = {
  0 => hash                 ; the act signed: terms, a clone, an act of a collective an area reaches, or a grant within an area
}
```

The inside names, in `objects`, the act signed as both chain and predecessor: `[[signed, signed]]`. *A signature follows the act it signs.* Signatures naming one act are parallel consents to it, never a fork among themselves: rule 5's forks are between acts that change an agreement. A signature counts only while valid under Identity's rules (rule 5).

### Collectives in the identity chain

A collective's genesis declares its founding agreement in the declarations slot (Identity): `[LAW, 0, agreement]`, where kind 0 is **the agreement the collective lives under** and the value its id. A rotation declares, the same way, each complete clone that changes the constitutional tier, membership included (rule 37) [Q8]. The latest declaration of kind 0 at a chain act is the agreement in force for every act that act's key signs; its areas are the ones that act is judged by.

### Split plan and split (type 8)

```cddl
split-plan = {
  0 => [+ share-rule],      ; fixed shares and role shares
  1 => hash,                ; split cMIP, which declares the remainder rule
  ? 2 => [+ fee],           ; module fees, each consented by whoever bears it
  ? 3 => unfilled,          ; what happens to a role share nobody fills
  ? 4 => [+ uint],          ; indexes of shares taken off the top, before the rest is divided
  ? 5 => uint,              ; who bears payout rail fees: 0 each receiver (default), 1 the split service
  ? 6 => amount / uint      ; maximum fee per payout the service may deduct: absolute, or in millionths of the payout
}
share-rule = [ 0, stake: uint, part: uint ]         ; a stake, by its index in the terms; paid to its current holder
           / [ 1, role: tstr, part: uint ]          ; a role, filled at payment time
           / [ 2, receiver: hash, part: uint ]      ; a named receiver that holds no stake (a service, a position)
fee        = [ module: hash, part: uint, bearer: hash ]
unfilled   = [ 0 ] / [ 1 ] / [ 2, party: hash ]     ; to the owners pro rata / held open / to a named party

split-payload = {
  0 => hash,                ; the receipt or payer's claim that brought the money to the owners' payee pointer
  1 => [+ payout],          ; each payout, summing exactly to the amount received
  2 => hash                 ; the split cMIP used
}
payout = [ receiver: hash, amount, ? role: tstr, ? evidence: hash, ? fee: amount ]
; evidence: an act signed by someone other than the split service and the payee; fee: the rail fee deducted, within the plan's maximum
```

Each payout is then paid as a simple Finance payment, with its own receipt naming the split. A fee taken off the top, and an app share for the client that brought the sale (a role share), are both expressed in the plan.

### Grant (type 9)

```cddl
grant-payload = {
  0 => hash,                ; grantee
  1 => uint,                ; scope: 0 sign new deals, 1 manage named existing ones, 2 act for an identity (post, publish, spend)
  ? 2 => [+ hash],          ; the agreements concerned, for scope 1
  ? 3 => any,               ; limits: per-deal cap, total, spending, as the grant's cMIP defines
  ? 4 => hash,              ; the cMIP defining the limits
  ? 5 => uint,              ; for a collective: the area whose power issues it, by index in the agreement in force at the grant's binding
  ? 6 => [+ kind]           ; the acts it reaches; required with field 5, and within that area's reach
}
```

A publication made under a scope-2 grant carries the grantor in its `for` field (Envelope), so payment reaches the grantor whatever client pays. A grant with field 5 is signed by the collective and completed by signature acts of the area's holders (rule 38a). Each kind in field 6 must lie within a kind the area reaches: equal to it, or `[1, spec, type]` with `spec` a MIP of the layer an area kind `[0, layer]` names; otherwise the grant is invalid.

## Agreements

1. **Proposal and signatures.** An agreement begins as terms. Each party signs with a signature act naming the terms. Founding terms exist once the signatures their signing rule (field 4) requires are present; a clone comes into force by its mark (rule 45). A party is bound by an agreement only through its own signature act: a threshold rule decides when the agreement exists among those who signed, never who owes. An obligation in the terms of a party who has not signed is shown as unsigned, never as open (F74).
2. **cMIPs.** Every agreement carries the hashes of the cMIPs it uses, at most one per task. An agreement that does not is invalid. It may also name extensions (Production); a client that does not implement all of them cannot sign it.
3. **Commitments of identities.** An agreement names identity hashes, not keys. After a rotation, the party's new key signs for the same agreement.
4. **Positions** are agreements that confer income without ownership.
4a. **What you sign is what you saw.** *Client conformance.* Before any terms, clone or grant is signed, the client MUST be able to show its text as plain text, SHOULD do so by default, and MUST show every bidirectional control visibly in that view (Text MIP, rule 5a).
5. **Agreement chains.** Every act on an agreement names the chain and the act it follows. Two acts naming the same predecessor are a fork, except signatures naming the act they sign, which are parallel consents; where the agreement lets parties act independently, its fork rule settles it; otherwise the status quo stands. An act on an agreement chain that is void or disputed under Identity's rotation rules confers nothing: no stake, no obligation, no consent (F57).

## Keepers

6. **Named by the agreement.** Keepers are chosen by the parties when they sign, so neither side can later substitute a friendly one; for a party who has not signed a clone, the keepers stay those that party signed (rule 46a).
7. **Records.** A keeper records the deal and the acts around it as they arrive, in its operator's sequence, and signs each record.
8. **Several keepers.** An agreement may name several keepers and a rule for what counts as recorded: any one, a threshold, or all. Only the named keepers' records count as testimony.
9. **Copies.** Records are signed and hash-linked, so they can be copied anywhere and verified wherever they sit. If a keeper disappears, its records survive in every copy.
10. **Keepers check homes.** Before recording an act, a keeper checks the signer's identity chain at its homes, and records any rotation it sees.
11. **What a rotation cannot erase.** A record counts against a rotation only if it sits before the keeper's own record of that rotation, in the keeper's sequence. Such an act, even outside the kept ancestry or disowned, becomes a visible dispute rather than void (Identity).
11a. **A record counts only alongside the act it names.** A keeper record counts, for that purpose, only if the verifier holds the act it names, that act is valid as an act, and the keeper is one named by an agreement the act's `objects` names. A record of an act nobody can produce changes no verdict (F58). *A keeper can delay recording a rotation while recording a thief's acts first. That is trust in keepers, accepted and stated: choose keepers as carefully as homes.*
12. **Keepers are always sealed.** *A keeper only has to prove that an act existed before a rotation. For that it needs the act id and the signer, both on the act's outside, and a check of the signer's home, never the content.* A client MUST NOT deliver an act's content key to a party because it is a named keeper; a keeper that must also judge content is named as an arbitrator or verifier as well. *This is a rule for clients: key deliveries are private, so no one else could check it.*
12a. **Judging content is someone else's job.** Where a third party must judge content (escrow and milestones, arbitration, regulated verification), the agreement names an arbitrator or verifier, and the parties deliver it the keys by ordinary key delivery.

## Stakes and works

13. **Stake rule.** Any act that changes the size of a stake requires its holder's signature. A signature on an agreement is consent to everything it defines, including pre-authorised changes such as abandonment outcomes. Clients SHOULD make such terms prominent.
14. **Transfer.** By default, a stake is sold or given by a transfer signed by the seller and completed by the buyer's signature. The transfer names both the work's chain and the agreement's chain in `objects` (Envelope). Other holders are notified, not asked. The new holder inherits the full position, and the transfer chain on the agreement is what names the current holder of each stake; a split service MUST follow it (F73).
15. **Binding a work.** A work is bound to its creators only by an explicit work claim: a sole creator alone; several creators by one creator's claim completed by signature acts from all the others, and bound only when all are present. A publication is a neutral carrier: carrying or quoting a work, or pointing to a web resource, claims nothing. The core records claims and their order, never legitimacy. Order is not evidence of authorship; a claim cMIP MAY carry a pre-publication commitment. Where claims from different identities conflict, priority can only be decided where they meet: by anchoring, or by a keeper that recorded both. Otherwise they remain openly contested.
15a. **Stakes are written in millionths,** summing to 1,000,000. Any leftover from dividing goes to the first party listed in the terms.
15b. **A sale is tied to the seller's agreement, not to the work's stakes.** The core cannot tie a sale of a work to that work's stakes: it ties a sale to the agreement of whoever sells, and makes a sale outside the claiming agreement visible to those it concerns. A publication or standing offer for a work with an existing claim, not signed under that claim's agreement, is a valid act that visibly contradicts a signed agreement: the claim's holders contest it, a keeper has the claim on record, and the seller's own split shows what they took. *The bits and bolts are all in the core: work claims with order, contests with standing, keeper records, the published split, the publication's `for` field, and the payer's claim. A client that refuses to sell a claimed work under a plan that does not pay the claim's holders, or a reputation service that reads contests, can be built on them, and adoption decides (F72).* *Client conformance.* A client SHOULD show such a publication or offer as outside the claiming agreement.
16. **Publication stakes.** A publisher may hold a stake in its publication, never in the work.
17. **Public domain.** The owners may release a work, now or at a future point on a named time reference. It needs every holder's signature unless pre-authorised, and it is permanent. Its legal effect lies outside the core.

## Splits

How a split service runs is defined by the split cMIP its owners' agreement names. Law keeps only the vocabulary and the guarantees below.

### Authority

18. **Named by grant.** The owners' agreement names the split service through a grant, with any limits the owners choose (for example how long it may hold money, or which rails it may use). The payee pointer of the identity publications are made for (the owners' collective, or the sole owner) points to it, so money actually reaches it (Finance, F46, F68). The grant is revocable at any time under the agreement's rule.
19. **What it receives:** the incoming payment (an ordinary Finance payment, for which it signs the receipt), any payer's claim for it, the split plan from the agreement, and the evidence for role shares: the referral the payer signed in its claim, a relay's signed delivery record, a module's signed use record.

### Duties

20. **Publish a split.** For every incoming receipt, and for every payer's claim that shows money arrived without one, the service publishes a split, signed with its own key, naming that receipt or claim and listing every payout.
21. **Conservation.** A split's payouts MUST sum exactly to the amount received, in the unit's smallest part. The split cMIP declares its remainder rule; where it declares none, leftovers go to the first party listed in the terms. A split that does not sum exactly is invalid.
22. **Role shares with evidence.** Each role payout names who filled the role and the proof, which MUST be an act signed by someone other than the split service and the payee: the payer's client for a referral (Finance, the claim's referral field), the relay for delivery, the module's own signed use record. A referral the service names on its own earns nothing. Anyone can check the evidence afterwards. A role share nobody fills follows the option the plan chose: to the owners pro rata, held open as an obligation, or to a named party (F75).
23. **Pay out.** Each payout is paid as a simple Finance payment to the current holder of the stake, or the named receiver, with its own receipt naming the split.
24. **Keep what it cannot deliver** as open obligations, visible until paid. Amounts below a rail's minimum are held until they add up to enough (F50).
24a. **Payout fees.** The split plan says who bears each payout's rail fee: each receiver by default, or the split service as part of its cut; and it states a maximum fee per payout. A payout is discharged when its receipt shows the amount minus a fee no greater than that maximum; a shortfall beyond it is an open obligation of the service (F64).
25. **Batching.** The grant may allow the service to accumulate and pay out periodically or above a threshold, measured on the agreement's time reference. Every incoming receipt must still be matched by a published split, so accumulation is visible. Payouts paid with one rail payment name the same batch in their receipts (Finance).

### Limits

26. A split service MUST NOT pay anyone outside the plan's stakes as currently held, roles as evidenced, and named receivers, and MUST NOT change the plan: only the owners can, by cloning their agreement.
27. **Fees.** A fee is one total with an agreed split among the modules that earn it. The service's own fee appears in the plan like any other cut. No split can include a fee without the signature of whoever bears its cost; on a creator-side fee, that is the creator. Every split names the modules it ran under, so an omitted declared fee is visible.
28. **Attention.** A split may follow plays, views or any metric a module reports. The metric, its module and the resulting payouts are named, so it is legible like any other; the metric's evidence is signed by the module, not by the service.

### Failure and switching

29. Every incoming receipt, and every payer's claim showing money arrived, without a matching split, and every payout without a receipt, is an open obligation of the service, naming exactly one receiver and one agreement.
30. The owners switch services by revoking the grant, naming a new one, and having the identity publications are made for publish a new version of its payee pointer. The old service still owes payouts on everything it received before.
31. **The trust that remains.** *Between receiving and paying out, the service holds other people's money. MOR cannot prevent theft, but makes it provable from the receipts and the payers' claims: hiding income requires the payer's silence or collusion. Owners who want less exposure choose services that pay out immediately, or payer-side splitting cMIPs, where capable clients pay each owner's pointer directly and no service's honesty is needed.*

## Offers, conditions and time

32. **Standing offers, accepted by performance.** Owners publish terms; anyone accepts by paying them. The deal is complete when the offer's side delivers the content key or, for a publication whose key is public, signs a delivery confirmation: that proves payment was verified and honoured. A payment that receives neither, such as one arriving after a withdrawal, creates an obligation to refund it. A refund owed on a payment whose payer is not named is owed to whoever presents the rail proof of that payment, by a payment claim naming where to be paid (Finance); the obligation stays open and visible until claimed and discharged, and a seller who refuses a valid claim is visibly in the wrong. The offer's terms MAY say how long a refund stays claimable, on the time reference; the core sets no lapse (F80). Paid access to a live stream, which has no work hash until it ends, is sold by a standing offer, not a publication.
33. **Time.** An agreement that needs deadlines names its time reference. "Past its terms" is judged against that reference only. Showing that something did *not* happen before a deadline needs evidence: an anchoring cMIP or a named keeper. Without either, the answer is undetermined.
34. **Conditions.** An agreement may make an obligation or a payout depend on a condition, evaluated by the condition cMIP it names.

## Grants and collectives

35. **A collective is a full identity,** with its own genesis, homes, signing key and safety key. It uses the Identity MIP unchanged: it signs its own receipts, sets its own payee pointers, and rotates. Its genesis declares its founding agreement (a Law declaration in the declarations slot), and the agreement carries its key grammar.
36. **Key grammar.** The founding agreement says how the collective's keys are held and activated, according to the members' taste: one holder, a threshold (any k of n members jointly produce one ordinary signature, for example with FROST threshold schnorr), or a custodian holding the key under the collective's grant. The safety key is held by one holder, a custodian, or as shares: split so that any k of n members can rebuild it. At rotation, k members bring their shares to one offline device, which rebuilds the key, signs once and forgets it. *For that moment one device holds the whole key; that is the price, and it holds the next key too, before dealing its shares. Nothing can prove a device forgot a key.* The Module that does it MUST deal the shares of the next key verifiably, and have them checked against the committed key before that key is relied on, so that the members' shares rebuild it: otherwise the device's holder could end up the only one able to rotate the collective (F97). *Verifiable dealing stops sole control, not a copy; a copy kept is the price above, stated.* **A key grammar MUST leave a way to rotate that survives the loss of any one key holder** (F96): a threshold below the member count, or a named recovery path (a custodian holding a share under grant, or an escrowed share released by the abandonment authority, which the abandonment clause names). A key holder is anyone holding the whole key or a share of it: a member, a custodian, the holder of an escrowed share. **Where one person holds the safety key, the agreement MUST name a successor (a seat successor in that holder's succession plan) and an escrowed share released to them under its succession or abandonment clause;** a single custodian likewise needs a recovery path held by another. A grammar without such a way is invalid. Two partners may choose "both", provided they name where a further share sits and who releases it; whether the path works is the members' risk, stated (F77). *For a single holder, one construction: the key is split so that any two of four shares rebuild it; the holder keeps two and signs alone, the successor and a keeper hold one each, useless alone. When the named authority declares the holder absent, the keeper releases its share and the successor rotates the collective to a new key; the succession clone passes the seat.* Where members want individual consent to show, the constitution gives acts of the collective to areas (rule 36a).
36a. **Areas: rules by layer, powers of members** (F103). A collective's founding agreement may divide its acts and its operational fields into areas, each held by some of its members: by whole layer (Identity, Envelope and Text, Finance, Law) or by act type within a specification. **An act of the collective that an area reaches counts only with valid signature acts naming it, by holders of that area who signed the agreement in force, at least as many as the area's threshold; the agreement in force is the one the collective's chain declares at the act's binding** (F100). An act no area reaches counts on the collective's own signature, as any identity's act does. *So when members change, the rotation that declares the clone also fences off the old rules: whatever the old key signs afterwards is void under Identity, whoever signs it. Members' own identities do not rotate when they leave a collective; without this, former members could sign under the old rules at any later time, and no one could tell.* *An area says whose consent counts; the key grammar says who can physically produce the collective's signature. A holder who should act alone without holding the key acts under a grant issued within the area (rule 38a), with their own key.* *Layers and areas are one construct here: a rule for a whole layer is an area that reaches that layer, held by the members who decide on it* [Q10]. *An area reaching a layer covers only acts whose `spec` is a MIP of it* [Flaw B].
37. **Changing members** means a rotation to new keys plus a clone of the founding agreement; the rotation declares the complete clone as the agreement the collective lives under. Membership is constitutional, so the clone needs the constitutional change rule: every party by default, the departing member included (rule 44c). Any other change to the constitutional tier (the change rules, the key grammar, the areas) is likewise declared by a rotation before it applies to the collective's acts. Each agreement the chain declares after the founding one MUST descend from the one declared before it through complete clones, of which only the last changes the constitutional tier; otherwise the collective's acts that need member signatures count for nothing. *Clones that change only the judicial or operational tier need no rotation: they change nothing about who signs what for the collective, so there is nothing to fence off* [Q8]. A departing member hands over nothing: the remaining members rotate to keys the departing member never held, and re-split the safety key among the members who stay or join. [Flaw A]
38. **Grants** delegate authority with limits: signing new deals, managing specific existing ones, or acting for an identity or collective (posting, publishing, spending up to a limit). An agent acting for a collective works under a grant, without holding the collective's keys; members import what they approve. A grant is its own act; acts under it name it in `refs`, and a publication under it names the grantor in `for` (Envelope). Grants are revocable at any time. A grant is authority to act in the grantor's name without a stake, the employer-and-employee kind; it confers no voice in the agreement.
38a. **A grant never reaches beyond the power of whoever issued it** (F103). The holders of an area may grant within it: the collective signs a grant naming the area (field 5) and the acts it reaches (field 6), within the area's reach, and it counts only with valid signature acts naming it by the area's holders, at least as many as its threshold, as for any act the area reaches (rule 36a); it is judged by the area it names alone, whichever area reaches grants as acts. A collective's grant naming no area is judged as any other act of the collective, and reaches only acts that no area of the agreement in force reaches. A grant whose field 6 reaches beyond its area is invalid. *So a member holding an area can act alone there, under a grant to their own identity, and can hire others for it; and neither they nor the one who holds the collective's everyday key can give anyone more than that area.*
39. **Branches.** A collective's chain is a tree; each grant opens a branch the grantee appends to.
40. **Seal.** Revoking a grant seals its branch at the act the revocation names. The seal act MUST be at or after the last act on the branch that the grantor itself acknowledged or paid on: a receipt or split signed by the grantor that names a deal on that branch counts as payment. A revocation naming an earlier seal is invalid (F76). *A grantor who took the money cannot later say the deal never happened.*
41. **Import and handover.** The collective's import act lists which acts of a sealed branch it accepts into its own chain; a handover assigns acts to another grant's branch. Imports can also be made routinely.
42. **Acknowledgements.** An acknowledgement counts against a seal if the collective's own chain recorded it before the seal act, or if the grantor acknowledged or paid on the deal itself (rule 40).
43. **Fate of acts.** An act in a sealed branch that is neither imported nor handed over does not bind the collective: void if unacknowledged, a visible dispute if acknowledged. **Counterparties: require import before performing.** Deals the grantor never touched can be sealed out.
44. **Evaluation.** A client evaluating an act made under a grant follows the pointer to its branch. Live branch: binding. Sealed branch: binding only if imported or handed over, or protected by rule 40. An act beyond the grant's reach (rule 38a) is not backed by it, whatever its branch. A publication whose `for` names a grantor without a grant a Law client can check MAY be refused by that client and is shown as unbacked; a Finance-only wallet still pays the `for` identity, which is the only party that could have been harmed by the lie.

## Tiers

*F103: nobody loses their say by default. Each part of an agreement is changed by the power that owns it, and which power that is follows mechanically from the fields a clone changes, so every verifier reaches the same answer and the mark (rule 45a) can be checked. The tiers apply to every agreement; areas exist only in a collective's* [Q1].

44a. **Every field belongs to one tier.**

| Field | Content | Tier |
| --- | --- | --- |
| 0 | Parties | Constitutional (membership) |
| 1 | The words | Constitutional [Q2] |
| 2 | cMIPs, per task | Task 10 (time reference): judicial. Tasks 9 (conditions) and 11 (anchoring): judicial [Q3]. Every other task: operational |
| 3 | Keepers | Judicial |
| 4 | Signing rule, or a clone's mark | None: each version states its own [Q9] |
| 5 | Clone rule | Constitutional |
| 6 | Time reference | Judicial |
| 7 | Stakes | Operational |
| 8 | Split plan | Operational |
| 9 | Abandonment clause | Judicial |
| 10 | Fork rule | Judicial |
| 11 | Parent | None: every clone names its own |
| 12 | Key grammar | Constitutional |
| 13 | Arbitrators or verifiers | Judicial [Q3] |
| 14 | The split service's grant | Judicial (the stated exception: operational in kind, able to move money) |
| 15 | Extensions | Constitutional [Q4] |
| 16 | Succession plans | Judicial |
| 17 | Refund terms | Operational |
| 18 | Constitutional change rule | Constitutional |
| 19 | Areas | Constitutional |
| 20 | Area words, per area | Operational, in the area whose index it carries [Q2] |

An area's field references (area key 4) name only operational fields and tasks: fields 7, 8 and 17, and tasks of field 2 other than 9, 10 and 11.

44b. **What a clone changes.** A clone changes a field when the field's deterministic encoding in the clone differs from the parent's, or the field is present in one and absent in the other. Fields 2 and 20 are compared entry by entry, by task number and by area index, and each differing entry is one change. Fields 4 and 11 are never compared. Each change is in the tier of its field or entry (rule 44a). An operational change is in the parent's area whose field references name that field or task; an entry of field 20 is in the area whose index it carries; any other operational change is in no area.

44c. **Which power a clone needs,** from its changes alone, in this order:
1. if any change is constitutional: the constitutional change rule, `[0]`, which may change every tier;
2. otherwise, if every change is in one and the same area: that area's power, `[2, area]`;
3. otherwise, if no change is in an area (judicial changes, operational changes outside every area, or no change at all): the clone rule, `[1]`;
4. otherwise (changes in two areas, or in an area and outside it): no power covers the clone, and it is invalid; such changes are made by separate clones [Q7].

*The clone rule does not reach into an area, and one area's holders do not reach into another: an area is its holders' to decide. The constitution that gave the area can take it back* [Q5].

44d. **Counting a power.** The constitutional change rule is counted among the parent's parties, under the parent's field 18, or every party when the parent has none; the clone rule among the parent's parties, under its field 5; an area's power among that area's holders in the parent, at least its threshold of them.

44e. **Protections still hold.** Whatever power brings a clone into force, it cannot reduce a stake without its holder's signature (rule 46), nor change a judicial clause for a party who did not sign it (rule 46a).

*Stated cost (F103): by default a member who is present but unwanted cannot be removed; the others can leave* [Q6]*, or use the abandonment clause where it applies. A group that wants expulsion writes a constitutional change rule below everyone at founding, where every founder signs it.*

*[Flaw A] With the default, a party who dies or vanishes is still needed for every constitutional change, unless an abandonment clause removes their voice: see "Pending decisions".*

## Changing agreements

45. **Clone, never modify.** A clone is new terms naming the parent and the parent's latest act. Its mark (field 4) names the power its changes require (rule 44c) and the parties whose signatures meet that power (rule 44d). It is a draft until every party its mark names has a valid signature act naming it, and the parent exists; a draft changes nothing. A party the clone adds is bound only once it signs the clone (rule 1). A complete clone closes the parent; obligations before that point settle under the parent.
45a. **A false mark makes a clone invalid** (F104). A clone is invalid, whatever signatures it gathers, if its mark names another power than the one its changes require, or names a signer who is not among the parties that power is counted among, or names too few of them to meet it. Signature acts by parties the mark does not name bind those parties (rule 1) and bring their protected clauses forward (rule 46a), but do not bring the clone into force. *The mark names exactly the required power, never "one at least as strong": powers are not ranked against each other (an area held by one member is neither stronger nor weaker than a clone rule of two of three), so "stronger" could not be computed. It names identities, not signature acts: the signature acts name the clone, so the clone cannot name them. Every version thus says on its face who brought it into force and under which power, and any verifier checks it from the parent and the clone alone. Founding terms' field 4 already said the same thing: which signatures make them exist.*
46. A clone can never reduce a stake without its holder's signature, unless the agreement pre-authorised it.
46a. **Protected clauses: the judicial tier.** A clone that a party has not signed cannot change, for that party, any protected clause: the abandonment clause, the succession plan, the fork rule, the keepers, the split service and the time reference. For that party, each such clause keeps the last version that party signed. An abandonment declaration against a party is judged under the clause version that party signed (F71). *A majority may change the keeper for themselves; the minority's stake is judged under the keeper and clause they agreed to. Per party, not blanket, so that one member cannot freeze every governance change forever.*
47. **Forks.** Where a change rule (a clone rule, or an area's power) lets parties act independently, the agreement must define how forks are settled. If it does not, the parent stays in force until a clone naming both branches resolves it.
48. **Exit.** Agreements are always in core format, so activity on a fading cMIP moves by cloning the agreement onto another.

## Succession

48a. **The core gives the language, not the answers.** A party may attach a succession plan to an agreement, as part of its signed terms: stake successors, each with a share of the party's stakes (summing exactly), and seat successors, each with a voting weight, entering automatically or with the members' approval. Stake and seat successors may be the same identity or different ones. Changing a plan takes a clone, which for the party concerned needs that party's signature (rule 46a).
48b. **Triggers.** A plan executes when the party triggers it while alive, or when the authority named by the abandonment clause declares the party absent. *Death is a complex issue; the core leaves it to the parties, their named authorities and verifying modules.*
48c. **Execution.** Succession is a clone: the new terms carry the stakes and seats the plan gives; a change of seats changes the parties, so the clone comes into force under the constitutional change rule (rule 44c) [Flaw A]; and any position attached to a seat is defined at that moment. For a collective, the members then rotate and re-split the safety key to include the new key holders, using the grammar's recovery path where a share is gone for good.
48d. **Fallback.** Where no plan exists, the identity-level succession declared in a rotation (Identity) applies, and otherwise the abandonment clause.

## Abandonment

49. **Clause.** Signed into the agreement, it names who decides absence and which outcomes may follow. The authority MUST be an identity: the keeper's operator, a threshold of the other parties, or a named third party. An anchoring cMIP is named as the time reference the authority judges absence against, never as the authority. Absence means absence from duty: no act by the party on the agreement, for a period measured on the agreement's time reference.
50. **Liveness.** A party with nothing else to sign shows presence with a liveness act.
51. **Declaration.** A signed act by the authority the clause names, stating the agreement, the clause, the party and the outcome. The core checks that it is signed by that authority, that the outcome is one the clause allows, and that the clause is the version the party declared absent signed (rule 46a).
52. **Contest.** A party who believes they were wrongly declared absent contests it with a contest act.
53. **Outcomes,** combinable: voice removed from the clone rule (whether also from the constitutional change rule and the areas: [Flaw A]); stake redistributed among remaining holders in proportion; stake transferred to parties named or defined by role; obligations redirected or held; agreement closed.

## Non-performance

*The core never enforces; it makes default impossible to hide.*

54. **Atomic where possible.** Payment is acceptance; delivery released by payment cannot be defaulted on.
55. **Failure attribution.** Finance's receipts and payment claims name the hop and agreement that failed; a split's missing payout names the receiver and agreement. Law defines what follows: refund, redirection, contest.
56. **Negotiation record.** Messages between parties are locked and signed, each naming the previous message in the thread and acknowledging the latest one received from the other side. The record is provably complete up to the last acknowledged message.
57. **Disclosure by choice.** Either party may publish the record, by publishing the keys of its messages (Envelope: going public later).
57a. **Standing.** A contest counts only when signed by someone with standing: a party to the agreement, a holder of a stake the contested act affects, or a keeper, arbitrator or verifier the agreement names. A contest never changes any act's validity, status or selection; it is shown alongside what it names (F69).

*Reputation, arbitration and courts build on this record from outside the core.*

## Tasks

- **Split.** A cMIP accepts an amount received and a split plan, and produces payouts that sum exactly, with its declared remainder rule and the evidence for each role share.
- **Condition evaluation.** A cMIP accepts a condition and the acts it refers to, and produces true, false, pending or unknown.
- **Time reference.** A cMIP accepts a point on its reference (for example a block height) and an act, and produces whether the act is before, after, or undetermined.
- **Anchoring.** A cMIP accepts an act id and produces a proof that it existed at a point on a time reference. *Anchoring is Law's tool for Law's purposes (deadlines, claim priority); Identity does not depend on it (F63).*
- **Grant limits.** A cMIP defines how a grant's limits are expressed and checked.
- **Work claims.** A cMIP MAY define pre-publication commitments carried by a claim.

## Reasoning

- **Terms plus signatures.** *One signer per act (F17) makes every consent a separate, visible act. An agreement is complete exactly when its rule is met, a party refuses simply by not signing, and nobody owes anything they did not sign for.*
- **Identities, not keys.** *Keys change; promises should not. Naming identities means a rotation never breaks a deal.*
- **Stakes and seats can go to different people.** *A stake is property: passing it changes only who is paid. A seat is trust: the other members chose to share control with that person. A plan can give the stake to an heir and the seat to someone trusted for the job, paid through a position.*
- **Collectives are identities.** *A collective that receives money must sign receipts and rotate like anyone else. Giving it its own keys, held as its members choose, keeps one Identity MIP for everyone. The price is that a threshold signature looks like one signature; where individual consent matters, an area can require visible member signatures. And every grammar leaves a way through that survives the loss of any one key holder, so a dead member never freezes the key, not even a sole holder, whose successor holds an escrowed share: the rule is about the exit, not the number (F96). A collective's member signatures are judged under the rules its own chain declared when the key signed, so leaving is final: a former member's signature never again counts for it (F100).*
- **Keepers stamp sealed envelopes, and only real ones.** *Proving an act existed before a rotation needs its id and signer, not its content. Keepers that never read keep private deals private; judging content is left to arbitrators and verifiers the parties choose and deliver keys to. A record counts only alongside the act it names, so a bought record of nothing changes nothing.*
- **Protected clauses.** *A stake cannot be reduced without its holder's signature; but the clause that decides absence, the keeper who judges it, the fork rule and the split service could move the stake in two steps. So for each party, those clauses stay as that party signed them, whatever a majority clones for itself.*
- **A split service holds authority, not discretion.** *It is named by grant, bound to the plan, and every incoming receipt or payer's claim must be matched by a split. It can still steal, but never invisibly, and never by naming its own sybil as the referrer: role-share evidence is signed by someone on the other side.*
- **Shares follow stakes, holders follow transfers.** *A plan written in holder names would go stale at the first sale. Written in stakes, it pays whoever the agreement's transfer chain names, and two services compute the same answer.*
- **Leftovers to the first listed party.** *Signatures may arrive in any order; the order in the terms is fixed. So remainders follow the terms, and every client computes the same result.*
- **Keepers are chosen up front.** *Testimony is only trusted if nobody could pick a friendly witness after the fact.*
- **Many ways to split, one vocabulary.** *A paying client may pay each owner directly; a service may receive and forward at once; or it may pool and let owners withdraw, with every unwithdrawn share an open obligation rather than a number in a private database. Each is a competing split cMIP on the same vocabulary.*
- **Splits belong to owners.** *Finance delivers money to a pointer; the owners' agreement decides who gets what. Each payout is a simple payment with its own receipt, so a missing one is as visible as a broken route.*
- **Exact sums, declared remainders, bounded fees.** *Rounding is where money quietly disappears; an unbounded fee line is where it disappears loudly. The plan states the maximum, and the payer's claim fixes what arrived.*
- **Role shares pay for help that is only known at payment time.** *A reposter, a relay or a module earns when its part in a sale is evidenced by someone other than the party paying it, so rewards attach to settlements, never to attention, and never to the service's say-so.*
- **A stake pays through whoever sells.** *The core cannot tie a sale to a work's stakes without judging which claim is the claim, and a rule that tried would be evaded by re-encoding the file. What it can do is make a sale outside the claiming agreement visible, and give builders every piece needed to refuse or rate such sales. The core is as little intrusive as possible, and carries the bits and bolts for sound solutions on top.*
- **Clone, never modify.** *Nothing in MOR is updated. A clone that meets its rule is the only way terms change, and the parent's history stays intact.*
- **Nobody loses their say by default.** *Protecting the abandonment clause guarded one route to removing a party's voice; rewriting the clone rule was another, unguarded (F103). So the rules that decide who decides form their own tier, changed by their own rule, which is everyone unless the founders, all of them, agreed otherwise. What judges a party stays as that party signed it. Everything else is operational, and can be handed to the members who run it, as areas: they decide there without asking the rest, and can hire, but never give more than they hold.*
- **The tier follows from the bytes.** *Which power a clone needs is read from which fields it changes, never from what it says about itself, so two verifiers cannot disagree, and a clone cannot slip a constitutional change past as an operational one.*
- **Every version says who brought it into force** (F104). *A field every agreement carries should never be free text that looks binding and is not. A clone's field 4 is a claim anyone can check: this power, these people. A false claim sinks the clone.*
- **A grantor cannot unsay a deal it was paid on.** *Sealing a branch before a deal the grantor acknowledged or collected on would leave the counterparty with a contest and nothing else. So the seal stops there. Deals the grantor never touched are the counterparty's risk, which is why import comes before performance.*
- **Default made visible.** *The core cannot force anyone to pay or deliver. It can make sure nobody can hide that they did not.*

## Open technical parameters

- Exact formats for every act type other than terms and signatures, and for terms fields 7, 8, 10 and 17 (stakes, split plan, fork rule, refund terms).
- Encoding of conditions and grant limits.
- How the Production layer, and acts of cMIPs by the layer of their task, are reached by an area [Flaw B].

## Decided in this draft

- **F35 (replaced).** Collectives are full identities with their own keys, held under their founding agreement's key grammar.
- **F36.** Binding is an explicit work claim; a publication is a neutral carrier (settles F28).
- **F37 (replaced).** Keepers are always sealed; content judges are arbitrators or verifiers, given keys by key delivery.
- **F38.** Stakes in millionths; leftovers to the first party listed, also the default remainder rule for payouts.
- **F39.** The split service: authority by grant, duties, limits, batching, failure and switching.
- **Round 2:** F57, F58, F64, F68, F69, F71 to F78, F80 to F82.
- **F97.** Verifiable dealing of a collective's next safety key stops sole control, not a copy.
- **F96.** A key grammar survives the loss of any one key holder; a sole holder names a successor and an escrowed share.
- **F100.** An act of a collective that needs member signatures is judged under the agreement its own chain declares at the act's binding.
- **F103.** Rules follow the layers; three tiers; operational areas as powers of members, who may grant within them; a grant never reaches beyond its issuer's power; the constitutional change rule, everyone by default.
- **F104.** A clone's field 4 is a mark of the power that brought it into force and whose signatures met it, checked by verifiers.
- **Draft 7 formats:** terms fields 4 (the mark), 18, 19 and 20; the key grammar without listed act types; areas, kinds, field references; grant fields 5 and 6.
- **Draft 6 formats (roadmap step 5a):** terms (fields 7, 8, 10 and 17 still open), the key grammar's listed act types with their rule, the abandonment clause, signatures, clones, and the Law declaration of kind 0.

## Freeze scenarios

- Agreements carry cMIP hashes, one per task: all.
- A party bound only by its own signature; a 2-of-3 agreement naming a non-signer's debt shows it unsigned: 3.
- Stakes, stake rule, transfer naming both chains; the split service pays the buyer after a sale: 1, 3.
- Binding a work; conflicting claims; a co-owner's lone sale visible as outside the claiming agreement: 2.
- Public domain, timed: 2.
- Clone drafts; fork rule; status quo default; protected clauses unchanged for a party who did not sign the clone: 1, 3.
- Standing offers; key delivery or confirmation as the binding moment; refund claimable by proof: 2, 5.
- Named time reference: 1, 7.
- Recurring obligation; lapse shown as past its terms: 7.
- Collective born from its founding agreement, with a grammar that leaves a way to rotate; a grammar with a single holder and no successor rejected (F96); a dead member's share released by the recovery path: 3.
- Grant branches, seal at a named act, not before a deal the grantor paid on, import, handover; a publication under a grant with `for`: 3.
- Acknowledgement recorded by the collective: 3.
- Keepers named by the agreement; keepers check homes; recorded acts survive rotation as disputes; a record of an act nobody holds confers nothing: 1.
- Several keepers with a threshold; a keeper lost, its records surviving in copies: 1.
- Abandonment declaration signed by the named authority, an identity, under the clause the party signed; contest by a contest act: 1.
- Liveness act: 1.
- Negotiation record with acknowledgements; disclosure by publishing keys: 5.
- Conservation and remainder rule; module fees and an omitted fee visible; maximum fee per payout; split by an attention metric evidenced by the module: 1, 2, 7.
- A role share filled by a reposter, with the payer's signed referral; a referral named by the service alone earning nothing; an unfilled role share following the chosen option: 2.
- A split service that receives a payment and fails to publish a split, or under-reports against the payer's claim, shown as an open obligation; the owners switch services: 2, 7.
- A collective with a threshold key grammar signs a receipt; a member leaves and the others rotate; the member who left, with another, signs an act an area reaches, and it does not count (F100): 3.
- A majority clone that rewrites the clone rule without the minority is incomplete under the default constitutional change rule; one whose mark claims the clone rule for it is invalid (F103, F104): 3.
- An area's power: its holder changes the area's fields alone, and grants within it; a grant beyond its issuer's area is invalid; an act beyond a grant's reach is not backed (F103): 3.
- A clone whose mark names a rule it did not meet, or another rule than the one its changes require, is invalid (F104): 3.
- Terms with a bidirectional override shown visibly before signing: 1.

## Pending decisions

*Where F103 and F104 are silent or allow two readings, this draft writes the lean and marks it [Qn]; nothing marked is decided. Where drafting exposed a flaw in the findings, the part is stopped and named [Flaw A], [Flaw B]. This section is removed once Nobody, allegedly, has decided each item.*

### Flaws found in the findings

- **[Flaw A] A member who dies can freeze the constitution for good.** *Plain words:* by default a constitutional change needs every party. Membership and the key grammar are constitutional. So if one member dies or vanishes, and the agreement has no abandonment clause that removes their voice, the others can never again add or remove a member, refit the key grammar after using its recovery path, or change any rule of who decides. The collective keeps working, but its first loss uses up the way to rotate F96 guarantees, and the grammar can never be refit to survive a second. That is the trap F96 closed for keys ("a dead member never freezes the key"), coming back through the rules. The same holds for ordinary agreements if the tiers apply to them [Q1], and for succession: a seat changing hands is a membership change (rule 48c). F103's stated cost covers the member who is present but unwanted, not the one who is gone. Also unclear: abandonment outcome 0 removes a voice "from the clone rule"; it does not say whether from the constitutional change rule and the areas too. *Options:* (1) as F96 does for keys: an agreement founding a collective whose constitutional change rule needs every party MUST carry an abandonment clause allowing outcome 0, and outcome 0 removes the voice from every change rule and area; (2) the default becomes "every party not declared absent", which still needs an authority to declare absence, so in practice (1) without the requirement; (3) keep it, as a stated cost, with clients warning at founding. *Lean:* (1), with outcome 0 covering every rule, and a succession clone counting the absent party's signed plan as that party's consent (rule 13: a signature is consent to pre-authorised changes).
- **[Flaw B] Acts name a specification, not a layer, and Production has no acts.** *Plain words:* F103 says every act names its layer, so rules by layer need nothing interpreted. That holds only for acts whose type a MIP defines: the MIP's hash gives the layer. An act of a cMIP names the cMIP; its layer is written only inside the cMIP's text (the task it fills), which a verifier would have to fetch, and an extension fills no task at all. And Production defines no act type: a specification, like a release, is an Envelope publication, so a rule for "the Production layer" reaches nothing. *Options:* (1) layers reach only acts of MIP types (as this draft writes); a cMIP's acts are reached by naming its type exactly; add a kind reaching publications by the specification of their media (a publication whose media is a specification, or a release manifest), which gives Production, and releases, a way to be ruled; (2) read a cMIP act's layer from the cMIP's own task list, failing closed when the verifier lacks it, and give Production the same media-spec kind; (3) drop Production from the list of layers and rule publications by media alone. *Lean:* (1), since it needs nothing but the act and its outside, and a collective can then give its releases to its release managers.

### Questions

- **[Q1] Do the tiers apply to every agreement, or only a collective's?** The side door F103 found (a majority rewriting the clone rule) exists in any agreement with a threshold clone rule, a film's contributors as much as a label's members. *Options:* (1) every agreement: the constitutional default protects everyone; areas stay a collective's only; (2) only agreements founding a collective (with a key grammar). *Lean:* (1). *Cost:* an ordinary agreement whose parties relied on a threshold to replace a vanished party now needs an abandonment clause (Flaw A).
- **[Q2] Which tier are the words (field 1)?** The words describe everything, including operational matters an area changes. *Options:* (1) constitutional: an area's holders can never change the words, which go stale when their area changes; (2) the words follow the rest of the clone's changes, a words-only clone needing the clone rule: an area holder could then rewrite the words about the constitution; (3) split: field 1 holds the constitution's and general words, constitutional; each area has its own words (field 20), changed by its holders. *Lean:* (3), as drafted.
- **[Q3] What else judges?** F103 puts in the judicial tier "who judges and by what", and names the protected clauses. Arbitrators and verifiers (field 13) judge content; the condition cMIP (task 9) and anchoring cMIP (task 11) are what payouts and deadlines are judged by. *Options:* (1) judicial and protected per party, like keepers, since a friendly judge chosen after the fact is what "keepers are chosen up front" guards against (this extends rule 46a); (2) judicial, changed by the clone rule, not protected; (3) operational, as F103's list reads strictly. *Lean:* (1). The draft places them in the judicial tier and leaves rule 46a's list as it was until decided.
- **[Q4] Which tier are extensions (field 15)?** An extension may add rules anywhere, a constitutional one included. *Options:* (1) constitutional; (2) operational, under the clone rule. *Lean:* (1), as drafted.
- **[Q5] Who decides operational matters?** F103: "a member given power over an area decides there". *Options:* (1) exclusively: inside an area only its holders (or the constitutional rule, which can take the area back); outside every area, the clone rule; (2) additionally: the clone rule may also change an area's fields. (2) leaves the side door F103 closed open at a smaller scale: a majority overriding the member given the area. *Lean:* (1), as drafted.
- **[Q6] What does "the others can leave" mean?** Leaving by a clone that removes oneself is a membership change, so by default it needs every party, the unwanted member included. *Options:* (1) walking away: you stop acting and found anew; you remain a party, keep your stake, and your voice is still needed for constitutional changes, so a departed member who later vanishes freezes them (Flaw A); (2) a clone removing only its own signers needs only their signatures, and those who stay then refit the rules; (3) a new act by which a party gives up its voice alone, keeping its stake, as abandonment outcome 0 applied to oneself. *Lean:* (3): it keeps the right of exit without letting anyone remove anyone else, and it also serves Flaw A's option (1).
- **[Q7] A clone that changes two areas, or an area and something outside it.** F104 says the mark names "which rule" it meets, singular. *Options:* (1) invalid: make separate clones, one per power; (2) it needs the constitutional change rule, everyone by default, a trap for an innocent combined clone; (3) the mark lists several powers, each met. *Lean:* (1), as drafted: every version names one power.
- **[Q8] Which clones must a collective declare by rotation?** Draft 6 (F100) had every declared agreement be a direct clone of the one before, so any clone meant a rotation, which needs the safety key rebuilt by several members: an area holder's decision would need a rotation. *Options:* (1) only clones changing the constitutional tier are declared, since only they change who signs what for the collective; judicial and operational clones follow the agreement chain; (2) every clone, as now. *Lean:* (1), as drafted.
- **[Q9] F103's "signing rule" in the constitutional tier.** F103 lists the signing rule as constitutional; F104 then made a clone's field 4 a mark, stating what brought that version into force, which nobody "changes". *Options:* (1) field 4 belongs to no tier: founding terms' field 4 already only said what brought them into force; who signs what for the collective is its areas, which are constitutional; (2) keep field 4 constitutional, which then means nothing for a clone. *Lean:* (1), as drafted.
- **[Q10] Are "rules by layer" and "areas" one construct?** F103 names both. *Options:* (1) one: a rule for a whole layer is an area reaching that layer, held by all the members who decide on it; areas may reach whole layers or single act types, and operational fields; (2) two: rules per layer, and areas only inside Law's operational tier. *Lean:* (1), as drafted: one check for every act, and draft 6's listed act types become areas unchanged in meaning.

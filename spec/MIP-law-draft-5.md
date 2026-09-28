# MIP: Law

*Draft 5, 28 September 2026. Written against core v15, Identity MIP draft 9, Envelope MIP draft 5, Text MIP draft 5, Finance MIP draft 5 and findings F1 to F97. Draft 5 is draft 4 with one finding of the air-gapped safety key Module (roadmap step 6) written in: dealing the shares of a collective's next safety key verifiably stops a device from keeping sole control of it, never from keeping a copy (F97). F96, on the same rule (a key grammar survives the loss of any one key holder), is written in at roadmap step 5a, where the test collective first uses it. Draft 4 applied review round 2: contests instead of disputes; a party bound only by its own signature; protected clauses a clone cannot change for a party who did not sign it; shares that refer to stakes; role-share evidence signed by a third party; keeper records that count only alongside the act they name; a seal that cannot predate a deal the grantor paid on; key grammars that always leave a way to rotate; a sale tied to the seller's agreement, said plainly; refunds claimable by proof.*

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
- **Grant.** A delegation of authority, with limits, from an identity or collective to another identity.
- **Contest.** A signed objection, by a party with standing, to another act. It changes nothing about any act's validity, status or selection; it makes disagreement visible. *Draft 3 called this a dispute; the word is now reserved for the status Identity gives an act after a rotation (F69).*
- **Standing.** Who may contest an act: a party to its agreement, a holder of a stake it affects, or a keeper, arbitrator or verifier the agreement names.
- **Protected clause.** A clause that can move a party's stake or voice without that party's later signature: the abandonment clause, the succession plan, the fork rule, the keepers, the split service and the time reference.

## Act formats

All acts are Envelope MIP acts, private by default, visible to the agreement's parties and keepers unless they choose otherwise. The acts below are sketched; exact formats follow once the structure is settled.

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
| 9 | Grant | the grantor |
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
  1 => tstr,                ; the terms, as canonical text
  2 => { + uint => hash },  ; cMIPs, at most one per task (task number => cMIP hash)
  ? 15 => [+ hash],         ; extensions: cMIPs outside the listed tasks, which add rules and never relax the core's
  ? 16 => [+ succession-plan] ; succession plans of parties, part of the signed terms
  ? 3 => keepers,           ; named keepers and the rule for what counts as recorded
  4 => rule,                ; signing rule: which signatures make the agreement exist (default: all parties)
  5 => rule,                ; clone rule: which signatures make a clone complete
  ? 6 => [ hash, any ],     ; time reference: the task cMIP and its parameters
  ? 7 => stakes,            ; stakes defined, in works or publications
  ? 8 => split-plan,        ; how incoming payments are divided
  ? 9 => abandonment,       ; the abandonment clause
  ? 10 => fork-rule,        ; how forks are settled, where parties may act independently
  ? 11 => hash,             ; parent: the agreement this one clones (with its latest act in objects)
  ? 12 => key-grammar,      ; present if this agreement founds a collective
  ? 13 => [+ hash],         ; arbitrators or verifiers named, who receive keys to judge content
  ? 14 => hash,             ; the split service's grant, where incoming payments go to one
  ? 17 => refund-terms      ; for standing offers: how long a refund stays claimable, on the time reference
}

key-grammar = {
  0 => holding,             ; how the signing key is held
  1 => holding,             ; how the safety key is held, usually stricter
  ? 2 => [+ [ hash, uint ]],; act types (spec, type) that also require visible member signature acts
  ? 3 => recovery           ; a way to rotate that needs less than every member, required when holding 1 names every member
}
holding  = [ 0, holder: hash ]                        ; one holder
         / [ 1, threshold: uint, members: [+ hash] ]  ; any k of these members: jointly for the signing key; by shares for the safety key
         / [ 2, custodian: hash, grant: hash ]        ; a custodian under the collective's grant
recovery = [ 0, custodian: hash, grant: hash ]        ; a custodian holds a share under grant
         / [ 1, authority: hash ]                     ; an escrowed share released by the abandonment authority

succession-plan = {
  0 => hash,                               ; the party whose succession this is
  ? 1 => [+ [ successor: hash, share: uint ]],   ; stake successors, shares in millionths of the party's stakes
  ? 2 => [+ [ successor: hash, weight: uint ]],  ; seat successors, with their voting weight
  ? 3 => uint                              ; seat entry: 0 automatic, 1 with the members' approval under the clone rule
}

keepers   = [ [+ hash], rule ]                      ; keeper operators, and any one / threshold / all
rule      = [ 0 ] / [ 1, uint ] / [ 2, [+ hash] ]   ; all parties / threshold / named parties
stakes    = [+ [ object: hash, [+ [ holder: hash, share: uint ]] ] ]   ; shares in millionths, summing to 1,000,000; leftovers to the first party listed; each stake is identified by its index here
```

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
  ? 4 => hash               ; the cMIP defining the limits
}
```

A publication made under a scope-2 grant carries the grantor in its `for` field (Envelope), so payment reaches the grantor whatever client pays.

## Agreements

1. **Proposal and signatures.** An agreement begins as terms. Each party signs with a signature act naming the terms. The agreement exists once the signatures its signing rule requires are present. A party is bound by an agreement only through its own signature act: a threshold rule decides when the agreement exists among those who signed, never who owes. An obligation in the terms of a party who has not signed is shown as unsigned, never as open (F74).
2. **cMIPs.** Every agreement carries the hashes of the cMIPs it uses, at most one per task. An agreement that does not is invalid. It may also name extensions (Production); a client that does not implement all of them cannot sign it.
3. **Commitments of identities.** An agreement names identity hashes, not keys. After a rotation, the party's new key signs for the same agreement.
4. **Positions** are agreements that confer income without ownership.
4a. **What you sign is what you saw.** *Client conformance.* Before any terms, clone or grant is signed, the client MUST be able to show its text as plain text, SHOULD do so by default, and MUST show every bidirectional control visibly in that view (Text MIP, rule 5a).
5. **Agreement chains.** Every act on an agreement names the chain and the act it follows. Two acts naming the same predecessor are a fork; where the agreement lets parties act independently, its fork rule settles it; otherwise the status quo stands. An act on an agreement chain that is void or disputed under Identity's rotation rules confers nothing: no stake, no obligation, no consent (F57).

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
36. **Key grammar.** The founding agreement says how the collective's keys are held and activated, according to the members' taste: one holder, a threshold (any k of n members jointly produce one ordinary signature, for example with FROST threshold schnorr), or a custodian holding the key under the collective's grant. The safety key is held by one holder, a custodian, or as shares: split so that any k of n members can rebuild it. At rotation, k members bring their shares to one offline device, which rebuilds the key, signs once and forgets it. *For that moment one device holds the whole key; that is the price, and it holds the next key too, before dealing its shares. Nothing can prove a device forgot a key.* The Module that does it MUST deal the shares of the next key verifiably, and have them checked against the committed key before that key is relied on, so that the members' shares rebuild it: otherwise the device's holder could end up the only one able to rotate the collective (F97). *Verifiable dealing stops sole control, not a copy; a copy kept is the price above, stated.* **A key grammar MUST leave a way to rotate that does not need every member:** a threshold below the member count, or a named recovery path (a custodian holding a share under grant, or an escrowed share released by the abandonment authority). A grammar without one is invalid. Two partners may choose "both", provided they name where a further share sits and who releases it; whether the path works is the members' risk, stated (F77). Where members want individual consent to show, the grammar lists act types that also require visible member signature acts.
37. **Changing members** means a rotation to new keys plus a clone of the founding agreement. A departing member hands over nothing: the remaining members rotate to keys the departing member never held, and re-split the safety key among the members who stay or join.
38. **Grants** delegate authority with limits: signing new deals, managing specific existing ones, or acting for an identity or collective (posting, publishing, spending up to a limit). An agent acting for a collective works under a grant, without holding the collective's keys; members import what they approve. A grant is its own act; acts under it name it in `refs`, and a publication under it names the grantor in `for` (Envelope). Grants are revocable at any time.
39. **Branches.** A collective's chain is a tree; each grant opens a branch the grantee appends to.
40. **Seal.** Revoking a grant seals its branch at the act the revocation names. The seal act MUST be at or after the last act on the branch that the grantor itself acknowledged or paid on: a receipt or split signed by the grantor that names a deal on that branch counts as payment. A revocation naming an earlier seal is invalid (F76). *A grantor who took the money cannot later say the deal never happened.*
41. **Import and handover.** The collective's import act lists which acts of a sealed branch it accepts into its own chain; a handover assigns acts to another grant's branch. Imports can also be made routinely.
42. **Acknowledgements.** An acknowledgement counts against a seal if the collective's own chain recorded it before the seal act, or if the grantor acknowledged or paid on the deal itself (rule 40).
43. **Fate of acts.** An act in a sealed branch that is neither imported nor handed over does not bind the collective: void if unacknowledged, a visible dispute if acknowledged. **Counterparties: require import before performing.** Deals the grantor never touched can be sealed out.
44. **Evaluation.** A client evaluating an act made under a grant follows the pointer to its branch. Live branch: binding. Sealed branch: binding only if imported or handed over, or protected by rule 40. A publication whose `for` names a grantor without a grant a Law client can check MAY be refused by that client and is shown as unbacked; a Finance-only wallet still pays the `for` identity, which is the only party that could have been harmed by the lie.

## Changing agreements

45. **Clone, never modify.** A clone is new terms naming the parent and the parent's latest act. It is a draft until signatures meet the parent's clone rule; a draft changes nothing. A complete clone closes the parent; obligations before that point settle under the parent.
46. A clone can never reduce a stake without its holder's signature, unless the agreement pre-authorised it.
46a. **Protected clauses.** A clone that a party has not signed cannot change, for that party, any protected clause: the abandonment clause, the succession plan, the fork rule, the keepers, the split service and the time reference. For that party, each such clause keeps the last version that party signed. An abandonment declaration against a party is judged under the clause version that party signed (F71). *A majority may change the keeper for themselves; the minority's stake is judged under the keeper and clause they agreed to. Per party, not blanket, so that one member cannot freeze every governance change forever.*
47. **Forks.** Where a clone rule lets parties act independently, the agreement must define how forks are settled. If it does not, the parent stays in force until a clone naming both branches resolves it.
48. **Exit.** Agreements are always in core format, so activity on a fading cMIP moves by cloning the agreement onto another.

## Succession

48a. **The core gives the language, not the answers.** A party may attach a succession plan to an agreement, as part of its signed terms: stake successors, each with a share of the party's stakes (summing exactly), and seat successors, each with a voting weight, entering automatically or with the members' approval. Stake and seat successors may be the same identity or different ones. Changing a plan takes a clone, which for the party concerned needs that party's signature (rule 46a).
48b. **Triggers.** A plan executes when the party triggers it while alive, or when the authority named by the abandonment clause declares the party absent. *Death is a complex issue; the core leaves it to the parties, their named authorities and verifying modules.*
48c. **Execution.** Succession is a clone: the new terms carry the stakes and seats the plan gives, the new signing authorities confirm it under the clone rule, and any position attached to a seat is defined at that moment. For a collective, the members then rotate and re-split the safety key to include the new key holders, using the grammar's recovery path where a share is gone for good.
48d. **Fallback.** Where no plan exists, the identity-level succession declared in a rotation (Identity) applies, and otherwise the abandonment clause.

## Abandonment

49. **Clause.** Signed into the agreement, it names who decides absence and which outcomes may follow. The authority MUST be an identity: the keeper's operator, a threshold of the other parties, or a named third party. An anchoring cMIP is named as the time reference the authority judges absence against, never as the authority. Absence means absence from duty: no act by the party on the agreement, for a period measured on the agreement's time reference.
50. **Liveness.** A party with nothing else to sign shows presence with a liveness act.
51. **Declaration.** A signed act by the authority the clause names, stating the agreement, the clause, the party and the outcome. The core checks that it is signed by that authority, that the outcome is one the clause allows, and that the clause is the version the party declared absent signed (rule 46a).
52. **Contest.** A party who believes they were wrongly declared absent contests it with a contest act.
53. **Outcomes,** combinable: voice removed from the clone rule; stake redistributed among remaining holders in proportion; stake transferred to parties named or defined by role; obligations redirected or held; agreement closed.

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
- **Collectives are identities.** *A collective that receives money must sign receipts and rotate like anyone else. Giving it its own keys, held as its members choose, keeps one Identity MIP for everyone. The price is that a threshold signature looks like one signature; where individual consent matters, the key grammar can require visible member signatures. And every grammar leaves a way through that needs less than everyone, so a dead member never freezes the key: the rule is about the exit, not the number.*
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
- **A grantor cannot unsay a deal it was paid on.** *Sealing a branch before a deal the grantor acknowledged or collected on would leave the counterparty with a contest and nothing else. So the seal stops there. Deals the grantor never touched are the counterparty's risk, which is why import comes before performance.*
- **Default made visible.** *The core cannot force anyone to pay or deliver. It can make sure nobody can hide that they did not.*

## Open technical parameters

- Exact formats for every act type.
- Encoding of rules, conditions and grant limits.

## Decided in this draft

- **F35 (replaced).** Collectives are full identities with their own keys, held under their founding agreement's key grammar.
- **F36.** Binding is an explicit work claim; a publication is a neutral carrier (settles F28).
- **F37 (replaced).** Keepers are always sealed; content judges are arbitrators or verifiers, given keys by key delivery.
- **F38.** Stakes in millionths; leftovers to the first party listed, also the default remainder rule for payouts.
- **F39.** The split service: authority by grant, duties, limits, batching, failure and switching.
- **Round 2:** F57, F58, F64, F68, F69, F71 to F78, F80 to F82.
- **F97.** Verifiable dealing of a collective's next safety key stops sole control, not a copy.

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
- Collective born from its founding agreement, with a grammar that leaves a way to rotate; a dead member's share released by the recovery path: 3.
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
- A collective with a threshold key grammar signs a receipt; a member leaves and the others rotate: 3.
- Terms with a bidirectional override shown visibly before signing: 1.

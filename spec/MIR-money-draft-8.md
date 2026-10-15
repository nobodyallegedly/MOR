# MIR: Money

*Draft 8, 15 October 2026, a working draft for Fable's aggregated review, for Nobody, allegedly, to approve: draft 7 (approved by Nobody, allegedly, 12 October 2026, with F255; its marked pass and second pass, F267 and the three readings confirmed, awaiting approval, as `spec/README.md` records it) with the decisions of the step 15 review written in (`docs/reviews/fable-step-15-money.md`): **F301** (Money Q1, decided by Nobody, allegedly, 14 October 2026: "Agreed"), a rail Module's kind and what its proof binds are fields of its specification, written as "Development Q6 and Q7, taken" words it: Development's specification format field 11 is the rail's kind alone (0 a request rail, 1 a push rail), and a new field 13 the set its proof binds (ascending, from 0 payee, 1 purpose, 2 previous hop), both required on a Module whose field 5 names the payment cMIP, the specification invalid without them (no specification, in F323's word, as Development draft 10 writes it); where this text said the kind or the binding was "FORMAT OPEN" or lived in the Module, it now cites Development's fields, read from the specification, never from the Module's code (rules 11, 18 and 24, the words "Rail Module", the payment task, the freeze scenarios); and Fable's three mechanics recorded with F301 for the freeze-ready draft: **M3**, "pending", not "unrecorded", one word for the one state (rule 18); **M4**, a payer's client that cannot anchor on any reference the payee's clock names says so before paying (rule 29, client conformance); **M5**, an obligation's states are shown by clients that read Agreements, a Money-only client showing them unknown, a Money view for MOR 2 noted (rule 15, the dependencies). Checked, and left unchanged: F297 (evidence counts only while its signer's chain keeps it) asks nothing more of Money's receipts, which rule 29 already treats so (its case (a), a receipt on a line the rotation kept, and its paragraph on the version a protected payment was paid under: an act the rotation did not keep "signs no receipt"); F298 (unknown where a verifier does not hold what a rule needs) agrees with every place Money cites Identity. The freeze scenarios gain the lines the review lists for decided findings (F295, F301, M4). Two points that writing F301 exposed, put as questions (Q-Money-1 and Q-Money-2 in `docs/drafts-after-step-15.md`, there Q4 and Q5), are answered by **F328** (decided by Nobody, allegedly, 15 October 2026) and written in: **Q4** ("Agreed."), where a rail's proof binds part of the set, rule 11 applies element by element: for payee, purpose and previous hop, the proof decides where field 13 holds it, the payer's claim where it does not, a contrary receipt shown as a dispute; where the payee is unbound, the payment address (rule 4) decides whose payment it is; **Q5** ("Agreed."), Development's format requires field 13 to hold payee and purpose wherever field 11 is 0 (a request rail), or the specification is no specification (FR11; rule 18). Written against Identity draft 12, Envelopes draft 9, Text draft 7, Agreements draft 13, Development draft 9 with F301 as decided, the payment cMIP draft 2 and the findings to F328.* Not the freeze-ready draft: old numbers and transition notes stay; the freeze-ready draft drops them after Fable's aggregated review. Draft 7's own header follows.

*Draft 7, 11 October 2026: a transition draft, for Nobody, allegedly, to review and approve (F251). It is draft 6 (approved 5 October 2026, revised in place since, last for the split Module build) written for plain reading, in Agreements draft 11's style. It comes in two parts. **The first part changes no rule**: how a payment runs most of the time comes first and the mechanics of rare cases after, and the rules are numbered afresh in reading order, each with its old number beside it. **The second part writes in F255**, the one sentence Agreements draft 11 points to (its rule 11, "Money rules 14 and 14a"), marked "new in draft 7 (F255)" where it stands: rule 17 (was 14), with a pointer from rule 3 (was 14a). **Then a marked pass** (12 October 2026, after the draft's approval, for Nobody, allegedly, to approve; `docs/core-v22.md`) **writes in F267**: a hop is passed on when a valid receipt or claim of the next hop names it, so a payment claim gains one optional field naming the previous hop's receipt; marked "new in draft 7 (F267)" and "to build" where it stands: rules 24 and 27 (were 5 and 9), the claim's format, and the definition of a route. **A second pass** (12 October 2026, evening; `docs/core-v22.md`, "Second pass") writes in the three readings the marked pass put as questions, each confirmed by Nobody, allegedly, and marked "reading, confirmed": a named batch lets one payment carry several forwards, for claims as for receipts (Q4, rules 12 and 24); a receipt and a claim of one hop naming different previous receipts are decided as rule 11 decides payee and purpose (Q5, rules 11, 24 and 27); and the claim that shows a hop is disclosed as its receipt would be (Q6, rule 26). Rule 21 (was 18a) also points to F271: a split plan stating no maximum fee per payout sets no cap. Written against core v21, Identity MIR draft 11, Envelopes MIR draft 7, Text MIR draft 6, Agreements MIR draft 11, Development MIR draft 6, the payment cMIP draft 2, the Lightning rail Module draft 2 and the findings F1 to F266. The record of how each rule came about (the revision notes of drafts 1 to 6, and the dates and words of each decision) stays in draft 6 and in the findings log; this draft does not repeat it. The freeze-ready draft that follows drops the old numbers.*

## How to read this draft

Normal text is the protocol. Italic text is commentary: reasons, examples and plain summaries. A summary that starts *In short* repeats what the rule says; where the two seem to differ, the rule's own text decides.

Each rule shows its number in draft 6 beside its new number: "Rule 3 (was 14a)". The table at the end maps every old number to its new one. Code comments, tests, records and the other drafts (Agreements draft 11 among them) keep citing the old numbers until the freeze-ready draft; the table is how to find them here. Agreements rules are cited here by draft 11's numbers; draft 11's own table maps draft 10's.

Some marks recur, and each matters to the next review:

- *Client conformance:* a duty of clients (wallets, a payer's or an owner's client). The protocol cannot check it from acts alone, so it is stated for builders.
- *Stated cost:* a weakness the rules accept knowingly, written down so nobody mistakes it for an oversight.
- *Reading:* a reading taken where the text was silent, with whether it is confirmed.
- **New in draft 7 (Fxxx):** a statement this draft adds, from a decided finding.
- **New in draft 8 (Fxxx):** a statement draft 8 adds, from a decided finding. Fable's mechanics recorded with F301 are marked "new in draft 8 (Fable's M3, mechanic)" and so on.
- **New in draft 8 (F328, Qk):** the answer to a point writing a decided finding exposed, put as question Qk in `docs/drafts-after-step-15.md`, written in.
- *To build:* the code does not do it yet; until it does, the code does what the statement replaced says.
- *Reading, confirmed (Qn):* a point F267's words left open, put to Nobody, allegedly, as a question by the marked pass (`docs/core-v22.md`) and confirmed as the lean (12 October 2026; findings log, "Core v22's six questions: the leans taken").

The MIR has four parts. Part one is a payment as it runs most of the time: where it goes, how it is proven, who is seen, debts, buying and refunds, fees. Part two is the rare cases: routes across rails through conversion services, and theft of the signing key. Part three is the act formats, for reference. Part four is the tasks, the reasoning, the open parameters and the freeze scenarios.

## Purpose

Money defines how a simple payment moves through MOR: never the rails themselves, and nothing about who owns what. A payer pays a payee pointer; Money's job ends when the money reaches it. How the money is then divided among owners is defined by their agreement, in Agreements.

Money defines what a settlement means to the protocol, whatever rail it happened on. Whatever the rail, Lightning, stablecoin or fiat, the receiver signs the same settlement receipt, and only the rail's proof differs, checked by the rule of the rail Module that defines it. When payer and payee use different rails, a conversion service, an identity that receives on one rail and pays on another, carries the money in between, and the payment reads as one verifiable chain of receipts. If a route breaks, the receipts show exactly which hop and which agreement failed. And because every payment can be recorded from both ends, a receiver cannot make money invisible by staying silent.

It also gives every client a shared language for:

- who owes whom, how much, in what unit (obligations);
- where payment to an identity (a person, an organisation or a collective) goes (payee pointers), with a flow that is easy to change and a vault that is not.

A payment to a work or a person, such as a tip, needs only this MIR and the payee pointer.

## Dependencies

Identity, Envelopes and Text. Money never depends on Agreements or Development: a Money-only client, such as a wallet that sends tips, is a complete client. Where a Money state depends on Agreements, a Money-only client shows it as unknown (F32). *A purchase names an Agreements claim (rule 18, F126): a Money-only client cannot make one, and shows the claim a receipt names as unknown; buying a work under an Agreements claim needs a client that reads Agreements.* **An obligation's states are shown by clients that read Agreements; a Money-only client shows them as unknown** (rule 15; new in draft 8, Fable's M5, mechanic).

## Words used in this MIR

### Rails and units

- **Rail.** A payment system outside MOR (Lightning, on-chain Bitcoin, ecash, stablecoins, cards, bank transfers), used through a rail Module.
- **Payment cMIP.** The cMIP that fills the payment task for an agreement (task 6): it defines how rail Modules plug in, how a receipt and a claim carry a rail's proof, and how they are checked. An agreement names at most one (Agreements, Development rule 7).
- **Rail Module.** A Module under a payment cMIP for one rail: the rail's address and vault-source formats, its proof format, and its verification rule. **Its specification states the rail's kind, a request rail or a push rail (Development, field 11), and what its proof binds, of payee, purpose and previous hop (Development, field 13)**; a verifier reads both there, never from the Module's code (new in draft 8, F301). *A rail Module's specification without them is no specification (Development; F323): a receipt or claim naming it is unknown to every client.* Several rail Modules work under one payment cMIP, one per rail (Development rule 8, F112). *A Module is a specification: it signs nothing and holds no money; the identities acting under it do.* *Built (code after step 15, part 2): the Lightning and on-chain rail Modules are published again with fields 11 and 13 (draft 3 of each: a request rail, binding payee and purpose), and the core reads both from the specification. Open, put to Nobody, allegedly (`docs/code-after-step-15-part-2.md`, question 1): field 13 names no payer, while a buyer is "the payer the payment commits to" (Agreements rule 22; F193); the core reads a proof binding the purpose as binding the payer, both in one commitment, until answered.*
- **Unit.** What an amount is counted in, in its smallest indivisible part. A unit is a small specification of its own, which rail Modules reference, so the same unit has one name on every rail that carries it.

### Where payment goes

- **Payee pointer.** Where payment to an identity goes: one or more rails in order of preference, each naming the rail Module that carries it. Together with the vault, it names the rail Modules the payee accepts (F115).
- **Flow pointer.** An identity's payee pointer for ordinary incoming payments, changed with the signing key.
- **Vault.** An identity's declared set of safer receiving entries, per unit and per rail, changed only with the chain key. The vault is the grammar for setting up safer pointers, if the owner wishes to.

### Proving a payment

- **Hop.** One movement of money on one rail, from one party to the next.
- **Settlement receipt.** The common proof of one hop, signed by its receiver, the same for every rail: who paid whom, how much, in what unit, under which agreement.
- **Payment claim.** A payer's record of a payment, carrying the rail's proof. Evidence on equal footing with a receipt.
- **Verification answer.** The result of checking a receipt or claim against its rail: valid, invalid, pending or unknown, with the hash of the rail Module whose rule computed it, and the trusted party it relied on, if any.
- **Batch.** A set of payouts a split service pays with one rail payment, as its grant allows (Agreements).

### Debts and purchases

- **Obligation.** A signed statement by a debtor that it owes a creditor an amount, in a unit.
- **Discharge.** A complete route, or several, that bring the owed amount to the creditor's payee pointer.
- **Creditor's release.** A signed statement by a creditor that it lets an obligation owed to it go, wholly, without full payment (type 4, F126; Agreements rule 92).
- **Purchase.** A payment for a work under an Agreements claim, naming the claim it pays under (receipt and claim field 9, rule 18, F126).

### Routes

- **Route.** One simple payment carried in several hops, across rails or units, through conversion services. Each receipt names the previous one; where the next payee signs no receipt, the paying hop's claim may also name it (new in draft 7, F267; to build).
- **Conversion service.** An identity that receives on one rail or unit and pays on another, at the rate of its own offer: it signs a receipt as receiver, with a forward, and is the payer of the next hop. A party, not a specification.

## Part one: a payment as it runs most of the time

*How it runs most of the time:* a payer reads the payee's pointer and vault, and pays on a rail the payee accepts. The payee signs a settlement receipt; the payer may sign a payment claim, carrying the same rail proof. Anyone holding either can check it by running the rail Module's rule. A debt is an obligation the debtor signs, discharged when payments naming it reach the creditor's pointer.

### 1. Where a payment goes

#### Rule 1 (was 12). The pointer that counts

The payee pointer that counts is the latest of an unbroken, unforked chain. Two pointers naming the same predecessor are contested: clients use the last pointer before the fork and warn the owner (F31).

#### Rule 2 (was 13). The flow and the vault change with different keys

A flow pointer is changed with the signing key. The vault is changed only in genesis or a rotation.

#### Rule 3 (was 14a). Vault limits, per unit, fail closed

*In short: where a vault is declared, each unit has its own limit; a payment above it goes to the vault, and a unit the vault does not cover cannot be paid to the flow at all. With no vault declared, everything goes to the flow.*

The vault and limits that apply to a payment are those the payee's chain declares. So a vault changed by a rotation, flow off included, applies at once to every payment not yet shown as made; a payment it affects is protected as rule 29 says (F164, F169).

An identity that declares no vault has no vault rule: every payment goes to its flow, and the owner has chosen no protection.

Where a vault is declared:

- a single payment in a unit counts as paid to the flow only if the vault has an entry for that unit and the payment is no larger than that unit's limit;
- above the limit it MUST be paid to the vault, under any entry of that unit;
- a limit of zero means every payment in that unit goes to the vault.

**Where the vault has several entries for one unit, the smallest of their limits is that unit's limit** (F114): no larger single payment counts as paid to the flow, and a limit of zero on any of them turns the flow off for that unit.

**The same limit bounds a refund paid to a payer's refund rail** (rule 17; new in draft 7, F255).

A payment in a unit for which the declared vault has no entry MUST NOT be paid to the flow: it is undeliverable until the owner adds an entry by rotation, and stays an open obligation (rule 5).

The vault is public, so a payer's client MUST check it and pay where the rules say (F67, F79).

*Fail closed is the safe side: a thief with the signing key cannot open a unit the vault does not cover. A missed payment is acceptable as long as the debt can be honoured later (Nobody, allegedly): it stays open and is paid once the unit is added (rule 5).*

#### Rule 4 (was 12a). The payee decides which rails it accepts

*In short: the agreement names the payment cMIP; the payee's pointer and vault name the rails; a receipt on any other rail counts for nothing.*

An agreement names its payment cMIP (Agreements, terms field 2, task 6). The payee's flow pointer and vault name the rail Modules it accepts, one in each rail or entry (F115).

A receipt or claim counts only if all of these hold:

- the rail Module its field 0 names is the one named by the rail of the payee's pointer, or the entry of the payee's vault, that the payment was paid to;
- that pointer is the payee's own and counts for that payment by rules 1 and 17;
- that pointer and vault are the ones rule 29 selects for that payment, as the chain stood for it (rules 3 and 29; F181);
  - **except that a collective's pointer that a fork or closing of the collective left outside its history still counts for payments already made to it, as the chain stood for each, and for nothing after the ending** (Agreements rule 91; F198);
- where the payment falls under an agreement, that rail Module implements the payment cMIP the agreement names (Development, field 5).

A receipt or claim naming any other rail Module counts for nothing, whatever its rail's proof shows.

A payer whose rail the payee does not accept cannot pay on it, except through a conversion service that pays the payee on a rail it accepts.

*A new rail Module therefore needs a new payee pointer (the signing key) or a new vault (the chain key), never a clone of an agreement; for agreements already signed, the payee's client signs one act on each, citing the new pointer (rule 17, F168). In a collective, the pointer is a Money act, so whoever holds the Money lane chooses the rails (Agreements, F106). Clients may build in cross-rail services charging a fee, giving their users free choice of currency and rail while delivering to the payee what it can receive.*

#### Rule 5 (was 16). Undeliverable payments

When a receiver has no payee pointer, or no rail the payer shares, or the vault rules leave nowhere to pay, the obligation stays open: a visible debt owed to that hash until it can be paid. Conversion services may bridge rails. How long an obligation stays open, and whether it is redirected, is for the agreement to define (Agreements).

#### Rule 6 (was 14b). The owner is informed

*Client conformance (F111): whether a notice arrived can never be checked, so these are not validity rules; the inbox already carries them.*

- **No clock.** Before genesis, or a rotation, that leaves the identity with no declared clock, the owner's client SHOULD say plainly that a theft's loss will be the owner's whatever it anchors (rule 29, F181).
- **Before signing.** The owner's client SHOULD warn before the owner publishes a standing offer, or signs terms, priced in a unit the owner's declared vault does not cover: nobody could pay it.
- **Debts.** The owner's client SHOULD show an obligation owed to the owner in a unit the vault does not cover as "owed in a unit your vault cannot receive", with the way to add it (a rotation).
- **Spontaneous payers.** A payer's wallet that refuses a payment under rule 3, or finds nowhere to pay under rule 5, SHOULD send the payee an ordinary message to its inbox route (Identity; Envelopes, "How acts reach people"), saying what it tried to pay, in which unit, for what, and why it could not. The message is a text act like any other: it creates no obligation and no act type.

### 2. Proving a payment: receipts and claims

#### Rule 7 (was 1). One format on every rail, signed by the parties

Receipts and claims on every rail use the formats of this MIR (Part three). The rail's proof is the only part that differs between rails, in the format the payment cMIP and the rail Module define.

A receipt is signed by the receiver of the hop:

- for a collective, with its own key or a grant key of its, its split service's among them;
- for a payee of a deal naming a split service, with its own key or the grant key it granted the service, or a backup the split cMIP's fields name (Agreements field 29, F250);
- a split service's grant key, a collective's as a payee's, signs only receipts for money coming in under the grantor's own claims and offers, never one whose payer is the service nor a payout the grantor is owed (F129 H4 H5, F130 H6 H7);
- each such receipt is judged by Agreements (Identity's scoped key, Agreements rule 80, F128); a Money-only client shows such a receipt's standing as unknown.

A claim is signed by the payer, or, for a payer that committed to a bare key, by any identity carrying that key's signature in key 8 (F113).

A specification never signs one (F112).

A claim's key 8 MUST verify under the key it names, over the bytes shown, or the claim is invalid.

#### Rule 8 (was 2). Checked by the rail Module's rule

A receipt or claim is verified by running the published rule of the rail Module named in its field 0 against the rail's proof. The answer is valid, invalid, pending or unknown, with that Module's hash. Anyone can run the same rule independently.

#### Rule 9 (was 3). A trusted party, named

Where a rail cannot give a proof anyone can check, as with card and bank rails, the rail Module's rule MAY rest on a named trusted party's signed confirmation. The verification answer MUST name that party, so everyone sees what the answer rests on.

#### Rule 10 (was 4). Valid only when the answer is valid

A client MUST NOT treat a receipt or claim as valid unless its verification answer is valid.

#### Rule 11 (was 10). Double entry

*In short: the payer's claim is evidence as good as the receiver's receipt; where they disagree, the greater amount counts until the receiver signs a matching receipt, and the payment's own commitment decides who and what it was for; where the rail binds no payee or purpose, the payer's claim decides what it fulfils.*

A payment claim is admitted as evidence on equal footing with a receipt. A payer MAY publish one at any time.

Where a claim and a receipt are of the same payment (rule 12, F200) and disagree in amount, payee, what the payment fulfils, or, on a route, the previous hop's receipt it passes on (rule 24; new in draft 7, F267), the disagreement is shown as an open question on the receiver, and the greater amount counts as received until the receiver signs a receipt matching the payment.

**Where they disagree in payee, in what the payment fulfils, or in the previous hop's receipt, the payment's own commitment decides** (as for a purchase, F131 IT3; the previous hop new in draft 7, F267, to build; *reading, confirmed (Q5)*):

- the act naming what the rail's proof commits to counts, the other counts for nothing;
- where the rail binds no payee or purpose, or no previous hop, the payer's claim decides what the payment fulfils and which forward it passes on, and the receiver's contrary receipt stays shown as a dispute on the receiver (F64, F151).

*It is the payer's money, and the payer chose its purpose in paying; a receiver cannot rename it afterwards and hold a payment hostage by never resolving it. Stated cost (F168): nothing records what the payer chose in paying on such a rail, so a payer can later relabel a payment, an old tip as a debt payment; the receiver's receipt saying otherwise stays shown. It is rare, since every rail written so far binds payee and purpose.* **What a rail's proof binds, its rail Module's specification says, in field 13: the set of payee (0), purpose (1) and previous hop (2) the proof binds, required on every Module implementing the payment cMIP; a verifier reads it there, never from the Module's code** (Development's specification format; new in draft 8, F301; it replaces draft 7's "a rail Module declares whether it binds them (FORMAT OPEN, F140 item 1)"). **Where field 13 holds part of the set, the two bullets above apply element by element: for each of payee, purpose and previous hop, the rail's proof decides where field 13 holds it, and the payer's claim where it does not, the receiver's contrary receipt shown as a dispute; where the payee is unbound, the payment address the payment was paid to (rule 4) decides whose payment it is** (new in draft 8, F328, Q4).

Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived (F64).

#### Rule 12 (was 8a). One payment, one count

What "the same payment" is, each rail Module says (F200: on Lightning the payment hash; on-chain the output the transaction created). Money's rules that tell payments apart (this rule, rules 11 and 29) read it through the rail Module, never through the proof's bytes: two proofs of one payment (a payment mined again after a chain reorganisation) are one payment, counted once. *A rail Module SHOULD also make its valid proof unique for a payment in a given place (the on-chain rail Module accepts one index where Bitcoin's tree repeats a node, F200); the identity of the payment does not rest on it.*

Receipts or claims MAY share a payment only if they name the same batch, and their amounts together do not exceed what the payment shows. Otherwise a verifier holding both counts neither until the receiver signs a receipt that resolves them (F65). **On a route, forwards too:** receipts or claims sharing one payment under a named batch may each name a different previous hop's receipt, one payment carrying several forwards in parts, for claims as for receipts; the money never counts twice (rule 24; new in draft 7, F267; to build). *Reading, confirmed (Q4).*

**One push payment to several holders** (Agreements rule 12, F128 W4) is one payment: each holder's receipt carries its one rail proof, for the amount that holder received, without a batch (a reading, F131, confirmed, F132). Where they name different claims, the payment's commitment decides (rule 18, F131 IT3).

### 3. Receivers and senders

#### Rule 13 (was 17). A receiver is public; its flows are its choice

A receiver's identity is always public. The visibility of its incoming flows is its choice, from counterparties only (the default) to fully public; public views SHOULD aggregate.

#### Rule 14 (was 18). A sender is never required

The core never requires a sender's identity. A receipt's payer field MAY be absent; delivery then goes to a key the payer supplies (Envelopes: a bare device or application key). A payer's claim, when published, is the payer's own choice of disclosure.

### 4. Debts

#### Rule 15 (was 7). Discharge, and an obligation's states

An obligation is discharged when valid routes ending at the creditor's payee pointer, each naming the obligation, sum to the owed amount.

A refund owed to a bare key (rule 19) ends where the claim carrying that key's signature says, and rule 4's pointer and vault do not apply to it (F174).

An obligation's states are:

- unsigned (Agreements: the debtor has not signed the agreement);
- open;
- discharged (by payment);
- **released** (by its creditor, rule 16; F126, E4);
- past its terms;
- closed by clone;
- redirected.

***Past its terms*: Agreements decide when an obligation's terms have passed and what follows** (Agreements rule 11, F219; F242, M1); Money only shows the state. Past its terms, closed by clone and redirected depend on Agreements; a client that does not implement Agreements MUST show them as unknown.

**An obligation's states are shown by clients that read Agreements; a Money-only client shows every state of an obligation as unknown, an obligation naming no agreement (an IOU) included** (new in draft 8, Fable's M5, mechanic). *Open, discharged and released are Money's states, but judging them reads which payments count toward a debt and which pointer it is paid to (rules 17 and 29), which MOR 1's clients do where they read Agreements. A small Money view answering the IOU case without Agreements (an obligation naming no agreement, paid to the creditor's pointer or vault, acknowledged by the creditor) is noted for MOR 2.*

#### Rule 16 (was 7a). The creditor's release

An obligation is released when a creditor's release (type 4) names it, valid under Identity and signed by the creditor the obligation names; a release signed by anyone else ends nothing (F126).

- A release ends the whole obligation, whatever was paid toward it. To forgive part, the debtor signs a new obligation for the rest and the creditor releases the old one.
- It counts wherever a verifier holds it, published or not, and ends an obligation whether or not that obligation binds yet.
- What it names in field 1 is a record only, never checked.

*Where the creditor is a collective, its release counts by its own rules, and is reached by its Money lane alone (Agreements rule 92, E2); a Money-only client cannot check that, and shows such a release's standing as unknown.*

#### Rule 17 (was 14). Which pointer a debt is paid to

*In short: a payment to the flow counts toward a debt only if it went to the pointer the creditor's own acts on that debt saw, or a later one; a payment to the vault counts. An obligation with no act of the payee's on its agreement counts only if paid to the vault, unless the payee acknowledges it. Money owed back follows the same rule; a refund to the payer's refund rail counts only up to the payer's vault limit, above it only at the vault.*

**The rule.** A payment to an identity's flow pointer counts only toward what has, as its version that counts, that flow pointer's version or a later one:

- for an obligation, the version selected below;
- for a payment under an agreement or offer, the version rule 29 selects;
- for a tip, the version of the payee pointer it follows.

Toward anything whose version that counts is earlier, it counts only if paid to the vault (F161).

**The version that counts for an obligation** is the latest of the payee's pointer chain held by an act of the payee's own. The payee's acts are its acts on the agreement:

- its signature acts;
- its offer, where the payee signed the offer (an offer another identity signed is not the payee's act; the payee's act is then its signature accepting it);
- any later act of the payee's on the agreement.

The latest pointer any of them holds counts (F133, F145, F155, F168).

An act holds what is reachable through its citations (`prev`, `objects`, `acks`, `refs`, directly or through what they cite), never a hash merely written in its payload. For selecting the payee's pointer, the walk passes only through the payee's own acts, never through an act another identity signed, so what a drafter's terms or a debtor's IOU cite never reaches it (F157). A forked pointer chain counts only up to the fork (rule 1).

**A payee's client signing an act that can pay its signer (its signature act on terms, its offer) MUST cite in `refs` the latest of the payee's pointers it can find where the payee's routes act says its Money acts are found, whichever device published it** (client conformance; F163, F170). *During a theft window this can cite a thief's pointer, as the stolen key can sign any of the payee's acts: the owner's cost until the lock change (F169, F170).* *An identity keeps one sequence per device, and its own acts cite only their own device's line; citing the latest pointer directly lets a deal signed on one device find a wallet published from another. Where the pointers are published is Money's business, not Identity's: homes stay the layer for keys.*

The version an obligation names is informative only: where it differs, the obligation is read as naming the version so selected (F155).

An obligation with no such act, such as one naming no agreement act (field 4 absent), counts only if paid to the vault, unless the payee acknowledges it with an act of their own that holds a pointer; an Agreements client checks that (F66).

*There is no clock to say when an act was made; what it cites says what it saw. The pointer is judged by the act of the one it pays, never by the act of the one who pays or drafts: a debt re-signed to name a pointer the payee's own act never saw, such as a thief's newer one, names a version that does not count for it. A payment to an older flow of the payee's still counts, as it always has; without a clock nothing can tell whether it came after the payee left that wallet, so a payee who abandons a wallet keeps it able to receive or moves what arrives there, a stated cost (F155).*

**Money owed back follows this rule exactly** (Agreements rule 93; QG2, F191). A refund owed to an identity on a payment is paid:

- to the refund rail the payer's own claim on that payment names (key 7), where it names one, **counting as repaid only up to the payer's vault limit for its unit, as rule 3 reads it; above it, only once it reaches the payer's vault** (new in draft 7, F255);
- otherwise, to the pointer this rule selects from the payer's own acts on that payment (its claims for it, its acts acknowledging a receipt or claim of it), or to the payer's pointer in force where they hold none.

A payment to the payer's vault always counts, and the payer's own receipt counts wherever the money went. A payer that declares no vault has no vault rule (rule 3). **A refund owed to a bare key has no vault, so no limit** (new in draft 7, F255): it is paid where the claim signed with that key says (rules 15 and 19).

*Why the limit (F255): a thief holding the payer's signing key during a theft window could sign a claim naming their own refund rail; "vault partly exists to take care of big IOUs" (Nobody, allegedly).*

*A repayment to any pointer the payer ever published would let a debtor repay a thief's pointer and be cleared; this rule and rule 29 stop that for every debt.*

### 5. Buying, refunds and referrals

#### Rule 18 (was 10c). A purchase names the claim it pays under

*In short: a payment for a work under an Agreements claim names that claim, except one following a lone seller's standing offer, which names none; whether it is a purchase, and what is owed when it is not, Agreements say; any refund is paid as rule 19 says.*

A receipt or claim of a payment for a work under an Agreements claim (a standing offer, or a publication carrying a work an agreement claims) names, in field 9, the claim it pays under: the claiming agreement, and the line at which the payer's client read it current (Agreements rule 12; F126). The payment commitment carries it on the rail (payment cMIP).

**Whether the payment is a purchase, and what is owed when it is not, Agreements say** (rule 12, which also reads which claim a purchase may name, step 12b, T-1; F242, M2); **a refund they owe is paid as rule 19 says.**

**Which claim the payment buys under is settled where the payment takes place** (F128, W4; Agreements rule 12):

- **on a request rail** (the payee's side commits to each payment before it is made, as the payment cMIP's commitment does), the claim a purchase names is the one the seller's request committed to;
- **on a push rail** (the payer pays an address with no request), **each holder of the work's stake in the claim named settles on its own chain whether its receipt is a sale** (Agreements rule 12, which says what each holder owes otherwise; F242, M3); a refund owed is paid by rule 19.

**Where the seller is a collective, Agreements say when a payment becomes a sale** (F127, W2: once the collective's actions chain records it) **and what is owed when it does not** (Agreements rule 12; F242, M4); a refund owed is paid by rule 19.

**The payment decides** (F131, IT3). Where the receipts or claims of one payment (one rail proof) name different claims, the claim is the one the payment's commitment names. **A receipt naming another claim is a wrong receipt, shown as such, counting for nothing**: its commitment, recomputed from it, is not the one the rail proof carries, and the rail Module's rule refuses it (payment cMIP). The rest are judged as above. Until a verifier has the rail's answer, such a payment is **pending** (rule 8; new in draft 8, Fable's M3, mechanic: draft 7 said "unrecorded" for the same state). *No payment is left undetermined (F128).* **Which rails are request rails and which push rails, the rail Module's specification says, in field 11 (0 a request rail, 1 a push rail), required on every Module implementing the payment cMIP; a verifier reads it there, never from the Module's code** (Development's specification format; new in draft 8, F301). **A request rail binds payee and purpose: Development's format requires field 13 to hold both wherever field 11 is 0, or the specification is no specification** (FR11; new in draft 8, F328, Q5). *So on a request rail the proof always shows which claim the seller's request committed to.*

A payment to an identity's own pointer (a tip) or toward an obligation is no purchase and names nothing. *Stated cost: a Money-only wallet can pay a claimed work's publication, but cannot tell whether it bought it; what is owed when it did not, Agreements say (rule 12), and a Money-only wallet can still receive the refund (rule 19; F242, M5).*

**A payment following a lone seller's standing offer** (one naming no co-owners' agreement, Agreements rule 11) **names no claim** (F215): the offer is itself the agreement with the buyer, and Agreements say what the payment accepts (rule 11).

**A payment for a stake transfer** (Agreements rule 10, F224) fulfils the transfer (field 5), or is named in its field 4; what it buys, and what the seller owes when the transfer is an over-sale, Agreements rule 10 says; a refund owed is paid by rule 19 (F242, M6).

#### Rule 19 (was 10a). Refunds to the committed key

*In short: an anonymous payer's refund goes to whoever signs with the key the payment committed to, never to whoever shows the rail's proof; a payment that committed to no key leaves its refund unclaimable.*

A refund owed on a payment whose payer is not named is owed to whoever signs with the bare key the payment committed to as its payer (receipt field 2; F80, F113). It is paid where a claim carrying that key's valid signature (key 8) says (key 7). Such a refund is outside rule 17's selection of a pointer, since its creditor is a bare key with no pointer or vault (F168).

Presenting the rail proof proves nothing about who paid: on some rails the payee and every node on the route learn it (Lightning's preimage).

**A refund to a bare key is shown repaid** by the refunder's claim naming the payment refunded (field 4), whose rail proof shows the money reached where the claim signed with that key said (QG1, F191): the same double entry as rule 11, a claim with a rail proof showing the money arrived.

A payment that committed to no key leaves its refund unclaimable: the obligation stays open and visible, and nobody can take it (what that means for a broken collective's closing, Agreements rule 93 says, QG1; F242, M7).

Until claimed and discharged, the obligation stays open and visible. Whether an unclaimed refund ever lapses is for the offer's terms (Agreements); the core sets no lapse.

*The payer's wallet supplies the key when it asks for the receiving address, and recomputes the commitment from what the payee's side signed before paying, so the payee's side cannot swap the key (payment cMIP).*

#### Rule 20 (was 10b). Referrals, and evidence of a rail Module's use

A referral counts as evidence for a role share (Agreements) only when it is signed by the payer, in a claim; a referral the receiver or its split service names on its own earns nothing (F75).

The evidence that a rail Module carried a payment is the receipt or claim naming it in field 0, signed by a party; a Module signs nothing (F116, Development rule 17).

### 6. Fees and attention

#### Rule 21 (was 18a). Payouts net of fees

A payout (Agreements) counts as discharged when its receipt shows the amount minus the rail fee the split plan says the receiver bears, and no more than the plan's maximum fee per payout, where the plan states one (a plan stating none sets no cap: Agreements rule 25; new in draft 7, F271); what the split service owes for a shortfall beyond it, Agreements say (the split plan, rule 25, F64, F214; F242, M8).

Amounts below a rail's minimum cannot be moved until they reach it (F50; what the split service holds meanwhile, Agreements rule 24 says).

#### Rule 22 (was 19). No fees for specifications

A plain payment in Money carries no fees for specifications beyond what the rail itself charges. The creators of cMIPs and Modules earn where there is an agreement (Agreements).

#### Rule 23 (was 20). Attention

MOR only ever sees a payment and, in Agreements, its split. Tracking plays or views belongs to the cMIPs that choose it.

## Part two: rare cases

### 7. Routes across rails

*Most payments are one hop. Where payer and payee use different rails or units, conversion services carry the money in several hops, each with its own receipt, and these rules read the hops as one route.*

#### Rule 24 (was 5). A valid route

*In short: a route is a chain of hops, each shown by its receiver's receipt or by the paying hop's own claim, each naming the hop before it and carrying on exactly what that hop forwarded.*

A route is valid when every receipt and claim in it is valid, each hop names the previous hop's receipt, and each hop's received amount equals the previous hop's forward. **A hop names the previous hop's receipt when a valid receipt or claim of that hop names it: the next payee's receipt (field 6), or the paying hop's own claim (key 10)** (new in draft 7, F267; to build). **Where a receipt and a claim of one hop name different previous receipts, rule 11 decides:** the payment's commitment, where it binds the previous hop (its rail Module's field 13 holds 2; new in draft 8, F301); otherwise the payer's claim, the receiver's contrary receipt shown as a dispute on the receiver (new in draft 7, F267; to build). *Reading, confirmed (Q5).* *This is double entry along a route, as rule 11 gives a single hop: where the next payee signs no receipt, the paying hop's claim with a valid rail proof shows the money arrived, and so that the forward was passed on.*

**Rule 12 bounds it:** claims of one payment that name different previous receipts count only as rule 12 lets receipts or claims share a payment: one payment, one count (new in draft 7, F267; to build). A named batch lets one payment pass on several forwards in parts, for claims as for receipts; without one, neither counts until the receiver resolves them. *Reading, confirmed (Q4).*

#### Rule 25 (was 6). Only conversion hops forward

Only conversion hops forward. A conversion hop forwards in the next unit, at the rate its agreement defines.

#### Rule 26 (was 8). Disclosure along the route

Each hop's receipt, or the claim that shows it (rule 24), MUST be disclosed at least to the next payee and to the final creditor, so the creditor can verify the whole route (the claim new in draft 7, F267). Everything else may stay private. *Reading, confirmed (Q6).* *A service relying on its claim to show a hop discloses it to the final creditor; undisclosed, the forward stays open for the creditor, so it is the service's interest anyway.*

#### Rule 27 (was 9). A hop that forwarded nothing

When a receipt declares a forward but no valid receipt or claim of the next hop names it, as rule 24 reads them (new in draft 7, F267; to build), the route stops at that hop. The forward stays an open obligation of that hop, under the agreement named in the forward.

#### Rule 28 (was 11). Failure named

In every case, the receipts and claims name the exact hop and agreement that failed. What follows (refund, penalty, contest) is Agreements' business.

### 8. Theft of the signing key: anchor or bear the loss

#### Rule 29 (was 15). Good faith

*In short: a payer who followed the payee's published pointer and vault is protected. When the owner, after a theft, changes the locks by a rotation and anchors that change on the clock it declared, a payment the change affects still counts if the payee's own receipt shows it, or if the payer's claim was anchored no later than the lock change's point (when its home quorum is anchored; before the first, where several lock changes affect it). Until the change is anchored, the owner bears the loss.*

**Which pointer a payment followed.** A receipt or payment claim names the payee-pointer act it followed, directly or through the obligation or agreement. For a payment under an agreement or offer with no obligation between, the pointer followed is selected as rule 17 selects it (F138, F145, F155, F168, F174); rule 17 then applies to it as to an obligation's.

**Theft: anchor or bear the loss** (F169).

A **lock change** is a rotation after which a payment that followed the payee's chain as published before it no longer follows the chain as published after it: a voided pointer, a vault limit lowered or removed, an entry or source replaced (F178).

**Where the lock change is not anchored** (its home quorum not anchored on the payee's declared clock, below), a payment that followed the pointer and vault published before it counts as made: the owner bears the theft window.

**Where it is anchored**, a payment it affects (one that followed the chain as published immediately before it and no longer follows it after; F181) counts as made only if:

- (a) **the payee's own receipt shows it**: a receipt on a line of the payee's that the rotation kept, or signed with a key the payee's chain binds after it, or signed by the payee's split service with a grant key whose grant still stands (F174); or
- (b) **the payer's claim is anchored before or at the lock change's point**, each act judged by its earliest anchor (F178).

**Which claims, and which anchors** (F200, F201, F203): the payer's claims of the same payment as the rail Module says.

- **Where the clock's Module reads the rail's own proof as the payment's anchor** (the Bitcoin clock Module and the on-chain rail, F201, F202), the payment's proof is that payment's anchor, its point the block that holds it, provided it passes the clock Module's check. The comparison is "the payment's block before or at the lock change's block", read through the payer's valid claims, and a pending claim's anchor counts for nothing.
- **On any other clock** (F203), the earliest anchor among the payer's claims of the same payment counts, once one of them is valid: a claim written and anchored at payment, while the rail still answered pending, protects the payment once it is proven.

*Stated cost (F203), at the size Fable's review found: a thief and a payer together can anchor a pending claim in the window for a signed transaction they hold back, broadcast that very transaction after the lock change, and be protected; the owner bears, having accepted on-chain payments under a clock that cannot see them, and closes it by declaring Bitcoin as its clock. Another transaction for the same commitment is another payment, and is not protected (F200). Not chosen: only a valid claim's anchor counting, which let the owner void any honest on-chain payment by a lock change within the hour of its confirmations.*

**The version a protected payment was paid under.** Where a payment counts as made under this rule, the version it was paid under is selected from the payee's acts as they stood before the lock change, those the rotation voided included, so a debtor who paid a deal the stolen key re-pointed does not pay twice (F178). Otherwise, for money, an act the rotation did not keep holds no pointer, signs no receipt and selects no version, whatever acknowledgement keeps it visible as disputed (Identity rule 16; F178).

**Several lock changes.** Where several anchored lock changes affect a payment, it counts only if the claim is anchored before the first of them (F175). A payment a lock change affects stays affected, even if a later rotation would let it follow the chain again (F182).

**The lock change's point is when its home quorum is met and anchored** (Identity, "Receipt" and rule 7; F177, F180): the point at which the home receipts the home rule requires for the rotation to count are all anchored, each receipt passing Identity's checks; with a single home, that home's receipt.

- A lock change counts from when the homes the rule requires publicly hold it, not from when it was signed or one home took it in, so one signed and kept back, or held by one home only, has no point yet.
- For a self-hosted identity, which counts on its rotation alone (Identity rule 22a), the rotation's own anchor is its point, a stated cost of that trust model.
- For a rotation that moves to new homes (a homeless rotation), the point is read from the new homes' quorum under the new home rule (F182).

*As with a registered letter, what counts is not when it was sent but when its receipt was confirmed (Nobody, allegedly).*

**Anchors are compared on the clock the payee's chain declared before the lock change** (F176, F179): on the main reference where the lock change is anchored there; otherwise on the backup, and then a claim anchored on the main reference also counts as made, whatever its point (F182). A lock change counts as anchored only on a reference that clock names; after it, a claim anchored on neither is not protected.

A payee that declared no clock has chosen no protection, as with no vault, and its lock changes count as not anchored, so the owner bears.

A payer's client MUST read the payee's clock before paying, as it reads the vault (rule 3). Anyone may anchor any act (F169).

*Client conformance:*

- After a lock change, the owner's client MUST obtain the home receipts that make up its quorum and anchor them on the main reference, and on the backup only where it cannot use the main one (F179, F181).
- **It SHOULD anchor them through two independent anchoring services, or by its own transaction, at an urgent tier**, the earliest anchor counting (a SHOULD; F226: a service may hold a paid hash back, unseen, up to its tier's deadline, and one working with a thief would let payments to the thief mined meanwhile count against the owner; the earliest of two anchors closes one service's delay; cost: two small prices, or one on-chain fee, per lock change, a rare event).
- A payer's client MUST write the payer's claim at the moment it pays and SHOULD anchor it promptly, and, on a rail whose proof is pending at payment, write a second claim once the rail answers valid (F203); how is the anchoring cMIP's business (F169).
- **A payer's client that cannot anchor on any reference the payee's clock names MUST say so before paying: the payment will not be protected against a lock change** (new in draft 8, Fable's M4, mechanic). *A payee may declare a clock Module no payer's client implements; the payer would then anchor on nothing the rule compares, and a lock change could put every such payment in doubt (F181's cost, with the payer's defence gone). The verdicts stay as written; the payer is told before it pays.*

*There is no clock, so a payment made during the theft window and one made afterwards on an outdated copy of the payee's chain look the same; only an anchor obtained at payment proves which side of the lock change a payment fell on. The owner bears what the stolen key did until the lock change, and reports it by anchoring; after it, a payer whose client did not anchor bears the loss, by the choice of client: a client that moves other people's money, and takes a cut for it, is responsible for doing it properly. Stated costs: the owner, by a lock change after receiving payments, can put in doubt every payment it affects whose receipt the rotation did not keep (disowning its own receipt included) and whose claim is not anchored by the point (F181); the lock change is visible on the owner's chain forever, counts only from a home's anchored receipt (F177), and a client that anchors promptly defeats it (F178). An old payment never anchored and never receipted can be put in doubt by a later lock change.*

The loss from a theft window falls on the owner until the lock change is anchored, never on a payer whose payment the payee's receipt or an earlier anchor shows. A payment that did not follow them (for example, paid to the flow above the limit) is not protected.

## Part three: act formats

All acts are Envelopes MIR acts. Payee pointers are public; obligations, receipts, payment claims and creditor's releases are private by default, visible to their parties.

```cddl
amount = [ unit: hash, value: uint ]      ; unit: the unit's specification; value in its smallest part
rail   = [ module: hash, address: bstr ]  ; a rail Module and the rail-specific address data, which only that Module reads
```

### Payee pointer (type 0)

```cddl
payee-pointer-payload = {
  0 => hash,               ; payee: the identity this pointer is for, which is also its only signer
  1 => uint,               ; version: 1, then the previous version plus one
  ? 2 => hash,             ; the previous payee pointer for this payee (absent for version 1)
  3 => [+ rail]            ; rails in order of preference
}
```

For an identity, this is the **flow pointer**. Pointers form a chain: each names the one it replaces and carries its version plus one, so nobody can jump ahead, and a fork is visible and contested (F31). A fork behind an act the owner's later rotation kept is settled by that rotation.

**Only identities have payee pointers (F46).** A payee pointer is valid only if signed by the identity it is for, with that identity's own key; collectives sign their own. A publication has no pointer of its own: it carries a price, and payment goes to the pointer of the identity named in its `for` field, or, if none, of its signer (Envelopes, F68). *A Money-only wallet needs nothing else: it reads `for`, follows that identity's pointer, and pays. Whether a grant backs the `for` is Agreements' business.* Where there are splits, that identity's pointer leads to its split service (Agreements).

```cddl
price = amount   ; carried in a publication's media entry (Envelopes, key 7)
```

The publication's price is the plain-payment price, for Money-only clients. Where the owners also publish a standing offer, the offer governs deals made under Agreements.

### The vault

Declared in the Identity MIR's declarations slot, in genesis or a rotation, so only the chain key can change it (F10, F79):

```cddl
vault       = [ MONEY, 0, [+ vault-entry] ]
vault-entry = [ unit: hash, rail-module: hash, source: bstr, limit: uint ]
; source: what the rail Module needs to obtain a fresh receiving address: a descriptor or extended key to derive one from, the key of a node that issues one (Lightning), or a fixed address for rails with neither
; limit: the largest single payment in this unit that may go to the flow; 0 means flow off for this unit
```

Several entries may share a unit, on different rails, so a dead rail does not make the vault unreachable until the next rotation. For each payment, a fresh receiving address is obtained under the source as its rail Module defines: derived from it where the rail allows derivation, or issued by the node the source names, so a vault never reuses an address by protocol design. *The core does not know what a source is; the rail Module does. On Lightning, the source names the vault's own node, whose invoices a payer verifies against it; nothing is derived offline (Lightning rail Module draft 1).* A null value for kind 0 removes the vault (Identity).

### The clock (F176)

Declared in the Identity MIR's declarations slot, in genesis or a rotation, so only the chain key can change it, as the vault is:

```cddl
clock = [ MONEY, 1, [ main: [ hash, any ], ? backup: [ hash, any ] ] ]   ; the main anchoring reference and, optionally, a backup, each a clock Module under the anchoring cMIP and its parameters, naming one time reference (Envelopes, task "Anchoring"; F202), in that order (F179, F181)
```

*Name your services, name your clock (Nobody, allegedly). An anchor is compared with another party's anchor, so somebody must name the reference, and it must be the party a thief cannot be: the owner, with the chain key. A null value for kind 1 removes the clock.*

### Obligation (type 1)

```cddl
obligation-payload = {
  0 => hash,               ; debtor: identity or collective; the signer
  1 => hash,               ; creditor: an identity
  2 => amount,
  3 => hash,               ; the creditor's payee-pointer act the debtor names; informative only: the version that counts is the one rule 17 selects (F155)
  ? 4 => hash              ; the agreement or offer it arises from (Agreements)
}
```

An obligation is signed by the debtor. A creditor's statement of what it is owed is a claim, never an obligation (F66).

### Settlement receipt (type 2)

```cddl
receipt-payload = {
  0 => hash,               ; rail: the rail Module that carried this hop
  1 => bstr,               ; the rail's proof, as the payment cMIP and that rail Module define it
  ? 2 => payer,            ; payer: identity or collective, or an anonymous payer's bare key (F113); absent if the payer stays anonymous and committed no key
  3 => hash,               ; payee: who received on this hop
  4 => amount,             ; how much was received, in this hop's unit
  5 => hash,               ; fulfils: the obligation, agreement, offer or payee-pointer act this hop follows
  ? 6 => hash,             ; the previous hop's receipt (absent on the first hop)
  ? 7 => forward,          ; conversion hops only: what is passed on to the next hop
  ? 8 => hash,             ; batch: the batch this receipt belongs to, when one rail proof covers several payouts (Agreements)
  ? 9 => purchase          ; a purchase: the claim it pays under (rule 18, F126)
}

purchase = [ agreement: hash, line: hash ]   ; the work's claiming agreement (Agreements), and the line at which the payer's client read it current

forward = [ next-payee: hash, amount, agreement: hash ]   ; amount in the next hop's unit
payer   = hash / signing-key                              ; signing-key as Identity defines it: [ scheme, key ]
```

**An anonymous payer's key (F113).** A payer who stays unnamed but wants a refund to remain claimable puts a bare signing key of its own, in Identity's `signing-key` form and used for this payment only, where the payment names its payer: in the payment commitment the payment cMIP defines, and so in the receipt's field 2. *It names no identity: the key is fresh, and links to nothing else the payer signs. It is not the delivery key of rule 14, which is an encryption key and cannot sign; a payer who wants both supplies both.*

A receipt is signed by the **payee of the hop**: the party that received the money. The previous hop's receipt is also named in `objects`, so a route is a chain in the Envelopes MIR's sense. *No receipt carries bytes nobody checks, and a referral is evidence only when the payer signs it (rule 20, F75).*

A receipt carries no split. The final payee is the payee pointer; if that pointer belongs to a split service, the split and each payout are defined by the owners' agreement, in Agreements, and each payout is itself a simple Money payment with its own receipt.

### Payment claim (type 3)

```cddl
claim-payload = {
  0 => hash,               ; rail: the rail Module used
  1 => bstr,               ; the rail's proof
  2 => hash,               ; the payee paid
  3 => amount,
  4 => hash,               ; the obligation, agreement, offer or payee pointer followed
  ? 5 => hash,             ; the receipt this claim disagrees with, if any
  ? 6 => referral,         ; referral: who led the payer to this payment, signed here by the payer (Agreements, role shares)
  ? 7 => rail,             ; where a refund owed on this payment is to be paid (F80)
  ? 8 => anonymous,        ; an anonymous payer's claim: the key the payment committed to as payer, and its signature (F113)
  ? 9 => purchase,         ; a purchase: the claim it pays under, as in the receipt (rule 18, F126)
  ? 10 => hash             ; the previous hop's receipt, where this payment passes on a forward, as receipt field 6
                           ;   (rules 24 and 27; new in draft 7, F267; to build)
}

referral  = [ identity: hash, evidence: hash ]   ; the referrer, and the act (a repost, a page) the payer followed
anonymous = [ key: signing-key, sig: bstr ]       ; sig: by key, over tagged_hash("MOR/finance/anonymous-claim", [ field 0, field 1, field 2, field 3, field 4, field 5 or null, field 6 or null, field 7 or null, field 9 or null, field 10 or null, inside key 3 or null, inside key 7 or null, inside key 8 or null ]) (F135, F147; field 10 added, F267, to build)
```

A claim carrying key 8 is the claim of the payer that committed to that key. Its signer, the act's signer, may be any identity, a one-time identity where the payer wishes to stay unnamed; the payer is the key, and the signature in key 8 binds it to this claim's rail, proof, payee, amount, purpose, disputed receipt, referral, refund rail, purchase and previous hop (F267), so nobody can lift it onto another claim. The signed bytes are the array shown, encoded in deterministic CBOR, with null where key 5, 6, 7, 9 or 10 is absent (F135; key 10, new in draft 7, F267; to build); the signature also covers the act's own citations, its `objects`, `acks` and `refs` (inside keys 3, 7 and 8, null where absent; F147), so nobody can re-wrap the payer's claim with other citations or acknowledgements. For an anonymous payer's claim, its history for rules 17 and 29 is only what those covered citations hold; its `prev`, which belongs to whoever signed the act, is not the payer's and does not count (F147). The signature scheme is the key's, as Identity defines it.

A payment claim is the payer's side of the record. It carries the rail's proof, so anyone can verify that the money reached the payee's rail address. It is private by default like every act; publishing it, to a counterparty or more widely, is the payer's choice and reveals the payer only to whom the payer chooses.

### Creditor's release (type 4)

```cddl
release-payload = {
  0 => hash,               ; the obligation it ends
  ? 1 => [+ hash]          ; what the creditor took instead, for the record: receipts, an Agreements agreement it was traded for, stake transfers; never checked
}
```

Signed by the creditor the obligation names, alone; nobody else's signature counts, and none is needed (F125, F126). Field 1 names each act once. *Forgiving a sum only gives up money, "a simple money decision" (Nobody, allegedly), so the release is a Money act (F126; Agreements' type 21 is retired). A release given against future terms (a share of income, stakes) is also a deal, an Agreements agreement signed on its own, which field 1 names (Agreements rule 92).*

## Part four: tasks, reasoning and freeze scenarios

### Tasks

- **Payment.** One payment cMIP per agreement fills this task (F112). It accepts an obligation, offer or payee pointer, an amount, and the payee's flow pointer or vault entry the payment goes to. It defines how rail Modules plug in under it, one per rail; how a payment on a rail carries what the receipt and claim will say (who is paid, how much, for what, by whom); how a receipt and a claim carry a rail's proof; and how a verifier checks them, by running the named rail Module's rule (valid, invalid, pending, unknown, and the trusted party relied on, if any). Each rail Module defines its rail's address and vault-source formats, how a fresh receiving address is obtained under a vault entry's source, its proof format, and its verification rule; **its specification states the rail's kind (Development, field 11) and what its proof binds (Development, field 13), and the payment cMIP reads both from the specification, never from code** (new in draft 8, F301). The receiver signs the receipt; the payer signs the claim; the cMIP and its Modules sign nothing.
- **Conversion.** A cMIP defining how a conversion is offered and evidenced: a conversion service, an identity, receives on one rail or unit and pays on the next at the rate of its own offer, and signs a receipt with a forward in the next unit; its onward payment is a hop like any other, under the payment cMIP.

Splits are an Agreements task. A custodial flow service, which holds an identity's hot pointer and enforces a rate off-protocol, is an identity, a party the owner points the flow at; it may run any Module it likes, and it is not one.

### Reasoning

- **Money ends at the payee pointer.** *A payment goes to the pointer set by the owners of what is paid for. How it is then divided is the owners' agreement, which is Agreements. That keeps Money simple enough for any wallet, and keeps every rule about sharing in one place.*
- **One receipt, every rail.** *Rails come and go; the core must outlive them. If every rail speaks the same receipt, a route across Lightning, a stablecoin and a bank transfer reads as one chain. Only the rail's proof differs.*
- **Rails are Modules under one payment cMIP (F112).** *An agreement names one cMIP per task; if each rail were a cMIP, every agreement would be confined to one rail. So the payment cMIP is the common language of an agreement's payments, and the rails plug in beneath it, as many as the parties use. A text cannot sign: receipts are signed by the people who received, claims by the people who paid. Services that convert or hold money are parties with their own offers, not specifications.*
- **The owner is told what the vault refuses (F111).** *Fail closed protects the owner from a thief, at the cost of payments that cannot arrive. A failed payment leaves no act behind, so nothing can make its absence a rule; the owner's own client and the payer's wallet tell the owner instead, through the inbox that already exists.*
- **Honest about fiat.** *Card and bank rails cannot give proofs anyone can check. Naming the trusted party in the verification answer keeps that visible instead of pretending otherwise.*
- **Double entry.** *The receiver signs the receipt, and the receiver is the party that benefits from silence. A payer's claim is the other half of the ledger: private by default, published by choice, and admitted as equal evidence. A mismatch between the two is itself the alarm. The measured promise is this: hiding income requires the payer's silence or collusion. Nothing more can be promised by a protocol that cannot see payments made outside it, and payer-side splitting cMIPs, where each owner is paid directly, are the models that need no service's honesty.*
- **Chained hops name where things break.** *When a route breaks, the last valid receipt and the missing next one point at exactly one hop and one agreement. Money says where; Agreements say what follows.*
- **The vault is a grammar for safer pointers.** *The flow is easy to change and easy to steal; the vault is where a thief with the phone cannot point payments. Three ways a thief takes money through the flow: the backlog, closed after the lock change because the version that counts for a debt is the latest the payee's own acts on a kept line hold, and only the debtor signs a debt, though during the window the stolen key can sign the payee's acts and re-point its deals, the owner's cost (F145, F155, F157, F169, F170); the large payment, closed by a per-unit limit; and the stream between theft and rotation, which no clockless rule can cap. So the core gives the two ends of the range, per-payment limits and flow off, and leaves the middle to services that hold the hot pointer and enforce a rate for owners who need one. Detection is shortened by the payer's claim and the inbox: the owner's client sees money land where it did not point.*
- **Per unit, fail closed.** *A limit in one unit cannot be compared with a payment in another, and a thief with the signing key chooses the unit. So every unit has its own limit, and a unit with none goes to the vault. Where several entries cover one unit, the smallest limit applies: a limit per rail would let the payer's, or a thief's, choice of rail pick the laxer one (F114).*
- **The receiver decides how it is paid (F115).** *A payer cannot pay on a rail the payee does not accept. Rail Modules change far more often than agreements; if terms named them, every upgrade would need a clone, every party signing in a deal. So the agreement names the payment cMIP, and the payee's pointer or vault, which its owner changes alone, names the rails. A receipt on a rail the payee never named counts for nothing, so a collective's lanes and two clients agree on every receipt.*
- **A refund goes to a key, not to a proof (F113).** *On Lightning the payee and every node on the route learn the preimage, so "whoever presents the proof" could be any of them. A key the payer committed to before paying is held by the payer alone.*
- **Experimental rails, costs stated (F117).** *The first rail Module, Lightning, names the payee's node in its pointer or vault: a public node exposes its channels and the coins behind them, may expose its network address, links identities that share it, and a Lightning vault stops a thief with the signing key, not one who takes the node. It is an instrument for testing this MIR, labelled experimental, its costs stated in its text and shown by clients.*
- **One name per unit.** *A satoshi is a satoshi on every rail that carries it, Lightning or on-chain. Naming units by their own small specification stops every hop between two rail Modules from looking like a conversion. A test network's coin is a unit of its own: a regtest satoshi is not a satoshi.*
- **Good faith protects payers.** *A payer who followed the published pointer and vault did everything right. Theft is the owner's risk, and protection against it is a market.*
- **Private by default.** *Receipts and claims are acts like any other, locked (F29), and disclosed only as far as the route, or the payer's choice, requires.*
- **Payments, not attention.** *Rewards attach to settlements, never to attention: MOR's iron law.*

### Open technical parameters

- The unit specification format.
- How a payment on a rail carries the id of the obligation, agreement or payee-pointer act it follows. *Proposed in the payment cMIP draft 2: a payment commitment, one hash over the payee, payer (an identity, an anonymous payer's bare key, or nobody), amount, what it fulfils and where it was paid, which each rail Module carries on its rail (for Lightning, as the invoice's description hash, signed by the payee's node). To be confirmed.*
- Rail proof formats, and vault source formats: defined by each rail Module.

### Freeze scenarios

*Each bullet names the freeze suite's scenarios that cover it.*

#### Where a payment goes

- Payment for a publication to the identity in `for`; a Money-only wallet and a full client pay the same identity; the wallet checks the vault; for a work under an Agreements claim, only the full client's payment, naming the claim, is a purchase (F126): 2, 3.
- Flow and vault; a thief changing the flow pointer cannot collect obligations that name an earlier version, nor re-issue them; a unit switch goes to the vault; a dead vault rail is covered by another; flow off: 1, 5.
- Several vault entries for one unit: the smallest limit applies (F114): 1, 5.
- A receipt on a rail the payee's pointer names counts; one on a rail it never named counts for nothing; in a collective, the treasurer chooses the rails (F115): 3.
- A payment refused under rule 3 or 5: the payer's wallet sends the payee an ordinary inbox message; the debt stays open (F111): 5.

#### Proving a payment

- Verification answers, including a trusted party named for a fiat rail: 1, 2.
- A payee pointer signed by another identity than the one it is for, an obligation signed by its creditor, a receipt signed by another than the hop's receiver, and a Money act with a field its format does not define or of a type Money does not define: invalid in every client (new in draft 8, F295, Fable's M1): 2.
- Double entry: a receiver under-reports, the payer's claim exposes the gap, the greater amount counts; a payout arrives short of the plan's maximum fee: 2.
- A rail whose field 13 binds the payee and not the purpose: a receipt and a claim disagreeing in payee, the proof decides; disagreeing in purpose, the payer's claim decides, the receipt shown as a dispute; on a rail binding no payee, the payment address the payment was paid to decides whose payment it is (new in draft 8, F328, Q4): 2, 3.
- One proof claimed against two obligations counts for neither; one batched payout proof covers several payouts: 2, 7.

#### Receivers and senders

- Receiver visibility dial; sender never required; a payer's claim published by choice: 2, 5.

#### Debts

- Obligation signed by the debtor, and discharge, unit-agnostic, possibly by several routes: 1, 4.
- A creditor's release, signed by the creditor alone, ends an obligation wholly after a partial payment; one signed by anyone else ends nothing; a collective creditor's counts only with its Money lane (F126): 3.

#### Buying, refunds and referrals

- A payment for a claimed work naming no claim is no purchase, and is owed back to the payer; one naming the current claim is a purchase, a collective seller's once its actions chain records it; one naming a collective's claim a fork superseded, never recorded by the original's chain before the fork, is owed back (F126, F127 W2); on a request rail, the claim the seller's request committed to is bought whatever came after; on a push rail, a payment two holders received is a purchase where both receipts came before their signatures on the new version, and refunded by both where one came after (F128, W4): 3.
- Two clients built with different readings of a rail Module read its kind (field 11) and what its proof binds (field 13) from its specification, and give the same answer on a push-rail purchase and on a disagreement in purpose; a rail Module's specification implementing the payment cMIP without them is no specification, and a receipt naming it is unknown (new in draft 8, F301, F323): 2, 3.
- A request rail Module (field 11 0) whose field 13 lacks the payee or the purpose: no specification, and a receipt naming it unknown (new in draft 8, F328, Q5): 2, 3.
- Undeliverable payment kept as an open obligation; refund to an anonymous payer claimed by a signature with the key the payment committed to, which a routing node holding the rail's proof cannot make (F113): 2, 5.
- A referral signed by the payer earns a role share; one named by the service alone earns nothing: 2.

#### Routes across rails

- A cross-rail route through a conversion service, read as one chain of receipts; one hop fails to forward, and the receipts name that hop and its agreement: 2.
- A conversion service pays on and the next payee signs no receipt: the service's claim naming the previous hop's receipt passes the forward on; two claims of one payment, naming two forwards and no batch, count for neither, and under a named batch count in parts (Q4); a receipt and a claim of one hop naming different previous receipts, the payer's claim deciding where the rail binds no previous hop, the receipt shown as a dispute (Q5); the claim disclosed to the final creditor (Q6) (new in draft 7, F267; to build): 2.

#### Theft of the signing key

- A payment to a pointer a lock change voids counts as made until the lock change's home quorum is anchored on the payee's declared clock, and after it only with the payee's kept receipt or a claim anchored by the point (F169, F176 to F181); a payment that ignored the vault is not protected: 1.
- A payee declares a clock Module the payer's client does not implement: the client says so before paying, the payment unprotected against a lock change (new in draft 8, Fable's M4; client conformance): 1.

#### Moved to Agreements

- Conservation and remainder rule; module fees and omitted fees; splits by attention metrics.

## Old numbers to new

Draft 6's rules, in their old order, with their numbers in this draft. Every old rule has exactly one new number; none was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| 1 | 7 | One format on every rail, signed by the parties |
| 2 | 8 | Checked by the rail Module's rule |
| 3 | 9 | A trusted party, named |
| 4 | 10 | Valid only when the answer is valid |
| 5 | 24 | A valid route |
| 6 | 25 | Only conversion hops forward |
| 7 | 15 | Discharge, and an obligation's states |
| 7a | 16 | The creditor's release |
| 8 | 26 | Disclosure along the route |
| 8a | 12 | One payment, one count |
| 9 | 27 | A hop that forwarded nothing |
| 10 | 11 | Double entry |
| 10a | 19 | Refunds to the committed key |
| 10b | 20 | Referrals, and evidence of a rail Module's use |
| 10c | 18 | A purchase names the claim it pays under |
| 11 | 28 | Failure named |
| 12 | 1 | The pointer that counts |
| 12a | 4 | The payee decides which rails it accepts |
| 13 | 2 | The flow and the vault change with different keys |
| 14 | 17 | Which pointer a debt is paid to |
| 14a | 3 | Vault limits, per unit, fail closed |
| 14b | 6 | The owner is informed |
| 15 | 29 | Good faith |
| 16 | 5 | Undeliverable payments |
| 17 | 13 | A receiver is public; its flows are its choice |
| 18 | 14 | A sender is never required |
| 18a | 21 | Payouts net of fees |
| 19 | 22 | No fees for specifications |
| 20 | 23 | Attention |
# Hostile review of the open formats proposal: the set as a whole

*10 October 2026. Written for Nobody, allegedly, against `docs/formats-proposal-2026-10-10.md` as merged (`4ad076a`), read against core v21, the six MIPs as revised in place to 9 October, the payment cMIP draft 2, the relay transport cMIP draft 3, the on-chain rail Module draft 1, and the findings log from F140 on, F184 to F199 above all. F192 to F199 are read as decided and not yet written; the proposal reads F192 to F197 and does not mention F198 or F199. Nothing in `spec/`, the code or the proposal is changed by this report. Where I give a reading of a question, it is a reading of what rules already decided imply, marked as such; it decides nothing.*

## In plain words first

The proposal does what step 12b asked: eighteen formats built field by field from rules already written, every choice it could not make marked as a question. Read as one set, three things stand out.

1. **One field of the offer opens three holes: `for`, the identity paid.** Under payer-side splitting (F124 P2, F125 D3), an agreement has no single payee, and the field, absent, pays the signer everything. In a deal, nothing checks that the payee it names is one field 14 lists, so under OF3 (b) a party who is not a payee sends purchases to its own pointer while the purchase names the claim and looks inside it. And an offer whose payee did not sign is not the payee's act (Finance rule 14, F168 item 13), so payments under it go only to the payee's vault. The format's "what a verifier checks" list does not check field 3 at all.
2. **The set's heaviest machinery answers a case the proposal has backwards.** OF10 (held role shares, a completing split, a new split key, a new rule 20, a changed delivery record) rests on "payment, then delivery, then the record, then the claim". For locked media the natural order is the other way: the locked bytes are fetchable before payment (Envelope, publication field 6), and the claim is written at the moment of payment (Finance rule 15), so the record exists when the claim is written and the acknowledgement is in it. Late evidence is a client that pays before it fetches. A conformance rule and a stated cost cover it; the proposal puts a second act and a new numbering on every split for it.
3. **The role share's evidence kind, `[1, spec, type]`, brings back the fault F115 removed for rails.** Every plan that pays a relay names one transport cMIP by hash inside the agreement. A new transport cMIP, frozen at publication like every cMIP, needs a clone of every plan, every party signing in a deal. F115's reason for making rails Modules under one cMIP was exactly this. A role named by its string, filled by any cMIP act the committed payer's claim acknowledges, is what QG3 and F184 ("role names belong to cMIPs") actually say.

Beside these: a fee's `bearer` cannot mean what it says (rule 26 takes fees off the top, so every stake bears them), and FR3 reads rule 27 down to a label; FR5 lets a split service make a declared fee not owed by leaving the Module out of key 6; the request to a judge has no delivery rule, so a party can start a judge's period with a request the judge never sees (the shape F189 (8) closed for declarations); a metric's measurer who is also a receiver weighs its own share (the self-evidence F194 closed, one step along); a transfer fork is a double sale that the proposal calls "visible" and rule 5 settles in the seller's favour; and under OF19 (a) the moment a transfer takes effect is the split service's to choose, with no alarm reaching the buyer until the service chooses. T-1 is real and dissolves by one reading of Finance rule 10c; F-1 is real and dissolves by retiring type 15, or else by the pair (c) and (f).

Of the 28 questions, six list an option that a decided text already excludes, and five are ordered before a question they depend on.

## How findings are marked

- **BREAKS**: a party gains at another's cost and can pull it alone, or a common case does not work, under the format as drafted.
- **CONFLICTS**: two formats, or a format and a decided rule, disagree; or an option list is missing the option decided rules give.
- **HIDDEN**: the proposal chooses where it says it does not, or marks a decision as a reading (FR).
- **HEAVY**: a rare case's weight falls on every ordinary act, against the writing rule of 10 October.
- **HOLDS**: I tried an attack and it failed; I say what I tried.

Each finding gives what breaks, the smallest story with Ana, Ben and Carla, who gains, the format and field, and a weight. Formats are numbered as the proposal's inventory numbers them.

## 1. The ordinary sale, walked once

Before the attacks, the common case, since the 10 October rule asks every document to open with it and the proposal does not do it for the set.

Ana and Ben own a song under a deal naming a split service and a request rail. Ana publishes an offer for the song's publication. Carla's client fetches the locked bytes from a relay, asks the relay for a delivery record, reads the deal's latest version, asks the service for an address committing to the price, the offer and the claim, pays, writes its claim at that moment, acknowledging the record and naming the claim. The service receipts in Ana's name with her grant key, splits by the plan, pays Ana, Ben and the relay, and delivers the content key. Carla checks the song against its work hash.

Formats this touches, of the eighteen: the offer (1), the split plan (4) and the split it governs, the rail's kind (17) read once from the Module, and a unit (18). Formats it never touches: the delivery confirmation (2), refund terms (3), a metric (5), a use record (6), fee terms (7), a publisher's mark (8), a work claim (9), a transfer (10), the concurrency rule (11), the import (12), liveness (13), the keeper record (14), the contest (15), the request to a judge (16), the closing's debts and the notice (Part F). Thirteen of eighteen are rare-case formats. That is right; what is wrong is where the set lets a rare case reach back into the five, which section 7 lists.

## 2. Who gains alone

### 2.1 The offer's `for` field pays the signer alone under payer-side splitting. BREAKS, CONFLICTS (format 1, field 3; rule 18, F124 P2, F125 D3)

**What breaks.** Field 3 is "the identity paid, whose payee pointer the payment goes to; absent: the signer". Rule 18 gives two split models, chosen by naming a split service in field 14 or not; under payer-side splitting "the payer's wallet, reading Law, pays each holder's own pointer by the stakes of the work's claim, one flow". An agreement under that model has no payee. The offer format has no form for it, so an offer under such an agreement names one identity, or none, and the verifier reads none as the signer.

**Story.** Ana and Ben own the song under a deal naming no split service, 60 and 40. Ana publishes the offer alone (OF3 b) and leaves field 3 empty. Carla's wallet, following the format, pays Ana's pointer the whole price. Nothing in the format tells it to pay Ben's pointer 40 per cent; rule 18's one flow is never taken. Ana receipts the whole sum with her own key; the purchase names the deal's claim. Ben sees a purchase under his deal that reached him nowhere.

**Who gains.** The signer, alone, under OF3 (b); under OF3 (a) Ben would not sign such an offer, but every honest payer-side offer still has no shape to take. **Weight: high.** The second split model was decided twice (F124, F125) and the set has no field for it. The format needs a form for "paid by the stakes" (field 3 absent and the agreement naming no service means payer-side, never the signer), and the verifier's checks must say so.

### 2.2 Field 3 is unchecked against field 14, so a party who is not a payee diverts purchases inside the claim. BREAKS (format 1, field 3; rule 18, F129 H4, X3)

**What breaks.** The proposal says, under X3, that "in a deal, the offer's payee must be a payee whose grant field 14 lists, or no service can receipt for it". It states it as a consequence. The format's "what a verifier checks" checks the signer, field 1's order, field 2's form and field 5's time reference, and nothing about field 3. Rule 18's pointer check reaches only "each payee whose own grant field 14 lists". A party of the deal who is not a listed payee has a pointer nothing checks.

**Story.** Ana, Ben and Carla's deal lists grants from Ana and Ben to the service; Carla, a party holding a stake, granted none. Under OF3 (b) Carla signs an offer with field 0 naming the deal's current version and field 3 naming herself. A buyer's client sees an offer inside the claim, pays Carla's pointer, which leads to no service; Carla receipts with her own key. No split service received the money, so rule 20 asks nothing of any service; the purchase names the deal's claim, so rule 15b's "shown as outside the claiming agreement" does not fire. The plan is never run.

**Who gains.** Carla, alone, under OF3 (b) or (c). **Weight: high under (b) or (c), closed by (a).** Whatever OF3 decides, the verifier must check that field 3, in a deal naming a split service, is a payee field 14 lists; the proposal knows this and does not write the check.

### 2.3 An offer whose payee did not sign pays only to the vault. CONFLICTS (format 1, field 3 with OF3 b; Finance rule 14, F168 item 13)

Finance rule 14 selects the payee's pointer from the payee's own acts: "its offer where the payee signed the offer (an offer another identity signed is not the payee's act; the payee's act is then its signature accepting it)"; with no such act a payment "counts only if paid to the vault". Under OF3 (b), Ben signs an offer naming Ana as paid; Ana signs nothing. Carla pays; rule 14 finds no act of Ana's on the offer; the payment counts only at Ana's vault, or, with no vault, nowhere. The proposal cites F168 item 13 as the source of field 3 and misses what it implies: in a deal, either field 3 is the signer, or the payee adds a signature act (type 1) naming the offer, which is OF3 (a) for the payee at least. **Weight: medium.** It also narrows OF3: (b) as written is not payable for anyone but the signer.

### 2.4 A fee's bearer cannot mean what it says; FR3 reads rule 27 down to a label. CONFLICTS, HIDDEN (format 4, plan field 2 `fee.bearer`; rules 26 and 27; FR3)

**What breaks.** The plan's fee is `[module, part, bearer: hash]`, "the party bearing it". The split's rule (Law, "Split plan and split", rule 26) says every fee is taken before the stakes divide, "so it falls alike on every stake". So a plan fee is borne by every holder, departed holders included (rule 46b), whatever `bearer` says. Rule 27: "No split can include a fee without the signature of whoever bears its cost." FR3 reads that as "the bearer is a party who signed this version". In a collective the plan is an operational field reached by an area (scenario 3 gives it to the treasurer), so the version is signed by the treasurer alone.

**Story.** Ana holds the collective's Finance lane and the split plan. She clones the plan alone, adding a 5 per cent fee to a Module Carla wrote, `bearer` naming Ana, as FR3 requires. Every split from then on takes 5 per cent off the top before Ben's and the departed holders' stakes divide. Rule 46b is met (equal treatment); rule 27's signature of "whoever bears its cost" is met by Ana's signature on a fee Ben bears.

**Who gains.** The area holder and the Module's creator, who may be the same person behind two identities (F112). **Weight: medium.** Whether a collective's area may add fees that fall on every stake is a decision rule 46b and F121 have half taken (departed holders accept the collective's rules); FR3 takes it fully and calls it a reading. The field needs a form for "every stake" (null, as S1 writes the collective), and the sentence in rule 27 needs Nobody, allegedly, to say which it means in a collective.

### 2.5 A split service makes a declared fee not owed by leaving the Module out. BREAKS, HIDDEN (format 4, split key 6; rule 27; FR5)

**What breaks.** Rule 27: "Every split names the modules it ran under, so an omitted declared fee is visible." FR5: "a fee in the plan whose module the split names is owed on that split; one whose module it does not name is not." The service writes key 6. Rule 27 made omission visible so that it could be called out; FR5 makes the service's list the thing that decides what is owed.

**Story.** Ana and Ben's plan carries a 2 per cent fee to Carla's publishing Module, which every sale through their publication runs through (the publication's media type names it). Their service lists in key 6 only the rail Module and the split cMIP. Under FR5 Carla's fee is not owed on any split. The proposal's stated cost: the omission "is visible only to someone who knows the payment used it", such as Carla, who then has a contest and nothing else.

**Who gains.** The service, alone, or the owners through it. **Weight: medium.** The reading that follows rule 27's own purpose is the opposite: a plan fee is owed on every split of a payment that ran through its Module, key 6 is the service's statement, and a Module whose use is readable from the acts (the publication's media type, the receipt's rail) is owed whatever key 6 says. FR5 is a decision; it should be put as one.

### 2.6 A request to a judge starts the period without reaching the judge. BREAKS (format 16; rule 34a, F124 N6; F189 (8) by analogy)

**What breaks.** Rule 34a: "The period runs from a signed request to the judge by someone with standing, and an answer the judge gives after it counts for nothing." The proposal's request names the version, the judge and the question. It says nothing about who must hold it. F189 (8) decided, for a declaration of absence, that an act which moves against a party counts only if public or addressed to that party, "so it reaches the member through the very act that uses it". A request is the same shape: it moves against the judge it names.

**Story.** Ana and Ben's deal names Carla as arbitrator for milestones, then Ana's friend as the next in the chain, thirty days each. Ana signs a request to Carla, sealed to nobody, and keeps it. Thirty days pass on the time reference; Ana anchors the request's existence (anyone may anchor any act, F169) and asks the friend, who decides for Ana. Carla, asked by Ben, answers too late: "counts for nothing in that question".

**Who gains.** The requester, alone, whenever the next judge suits them better. **Weight: medium to high.** The fix is the one already decided for declarations: a request counts, and the period runs, only where it is public or sealed to the judge it names. It belongs to the format, not to a client rule. The same applies to the settlement request (type 22), which the proposal would widen in OF24 (b): DQ8's "never before a party knows of the fork" rests on it.

### 2.7 A measurer who is also a receiver weighs its own share. BREAKS (format 5, `measurer`; rule 28; FR6; F194)

**What breaks.** FR6: "a measurer is not paid by its own record (F194 does not reach it): it weighs a share among others; it is not paid by it." That is true only where the measurer is none of the receivers. Rule 28 excludes the split service and a Module as signer; the proposal's verifier checks exclude nobody else.

**Story.** Ana, Ben and Carla, three creators, divide a listening service's share by plays. Ana runs the play-count service and is named measurer. Her record says Ana 600, Ben 300, Carla 100. Nobody checks plays against anything; the record divides the share. Under OF13 (a), which the proposal favours as the safer, Ana is "an identity the plan already pays", so the record adds nobody and the attack is inside the rule.

**Who gains.** The measurer, alone, for its share of every metric payout. **Weight: medium.** The check that follows F194 and rule 22's shape ("someone other than the split service and the payee"): the measurer is none of the identities the metric divides among, and not the split service. FR6 is a decision about F194's reach and should be put as one.

### 2.8 A transfer fork is a double sale that rule 5 settles for the seller. BREAKS (format 10; OF18 a; rule 5)

**What breaks.** Under OF18 (a) a transfer names the stake's previous transfer; "two transfers naming the same previous one are a double sale, a fork, visible". Visible and then what? Rule 5: two acts naming the same predecessor are a fork; where the agreement has no concurrency rule, "the status quo stands". The status quo is the seller holding the stake.

**Story.** Ben holds 400,000 of the song's stake. He sells 400,000 to Carla, and, from a second device, 400,000 to Dan, each transfer naming the same previous link, each completed by its buyer's signature, each paid. Both are a fork; the status quo stands; Ben holds the stake and both payments. Carla's and Dan's money is owed back by nobody in any format: a transfer carries no price, and field 4 ("what the seller took, never checked") is for the record.

**Who gains.** The seller, alone, with two devices. **Weight: medium.** A chain per stake also makes two honest partial sales from the same link (200,000 each, from one holding of 400,000) a fork, which they are not. The shape that follows decided rules: the holding is followed per seller along the seller's own transfers of that stake, the amount checked against the holding at that link, so two partial sales that fit are both valid and only an over-sale is a fork; and an over-sale is settled as W4 settles a holder's own race, on the seller's own chain, the second conferring nothing and its payment owed back by the seller. Whether a buyer's payment for a stake is a Finance obligation the transfer names is a question the proposal should ask.

### 2.9 Under OF19 (a) the seller and the service choose when a sale takes effect, and the buyer hears nothing. BREAKS as a story (format 4, split key 8; OF19; rule 14; rule 15a client conformance)

**What breaks.** "A transfer counts for splits from the first split citing it"; "between the transfer and the first split citing it, the seller is paid, at the service's pace." The alarm the proposal gives the buyer fires "when a split it receives after the transfer was delivered still cites the old head". The service delivers splits to the holders it recognises (rule 15a's client rule); until it cites the transfer it does not recognise Carla, and she receives nothing to raise an alarm on.

**Story.** Ben sells half his holding to Carla; Carla signs; Ana is notified. Ben and the service's operator are friends. The service keeps citing the old head; Ben keeps receiving Carla's share. Carla holds a complete transfer and sees no split. Her remedy is a contest, and the deal's judge where one is named.

**Who gains.** The seller with the service. **Weight: medium.** The option list is missing the one that F128 W4 gives: the burden where the action takes place. The seller signed the transfer; a payout receipt the seller signs for that stake after its own signature on the transfer, on its own chain, is a wrong receipt, counting for nothing, and the payout is owed to the buyer (rule 29: a payout without the holder's receipt is the service's open obligation). No clock is needed: the seller's own sequence orders its two acts, with W4's own reading for a second device. Key 8 can stay as the service's statement; it should not be the moment.

### 2.10 One delivery record, several payments; the proposed fix needs the order the common case does not have. HOLDS as a stated cost (OF10, smaller item i; relay transport cMIP draft 3, CH16)

The proposal would bind a record to one payment by setting its nonce to a hash of the payment's commitment, and notes this "needs the payment made before the fetch". For locked media the fetch comes first (section 1), so the fix would reorder every ordinary purchase to close a case where one payer buys the same object twice and acknowledges the same record both times. A split rule needs no cMIP change: a record acknowledged by a claim of the committed payer is spent for that payer's other claims naming the same object. Rare either way; a stated cost is enough. **Weight: low.**

## 3. Where formats contradict each other or a decided rule, and where an option is missing

### 3.1 Options a decided text already excludes

- **OF1 (a), publications only.** The proposal's own cost: "live access cannot be sold at all." Rule 32's last sentence, Envelope's "Publication" and the freeze suite's component line ("a live stream sold by offer: 1, 2, 6, 17") decide that it is sold by a standing offer. Since the suite is the specification of what to test, (a) is out. The live question in OF1 is only whether `[1, work]` exists; `[0]` and `[2]` are given.
- **OF8 (a), the core fixes `part`.** Freeze scenario 1 runs "a waterfall split cMIP"; scenario 7 pro-rata and user-centric sharing. (a) cannot run either. Out.
- **OF4 (c), no chain.** F188 decided, as a strong SHOULD, that the buyer's client verifies the offer "is truly the last in its chain". (c) leaves it nothing to verify. Out.
- **OF25 (b), keep the contest open.** Scenario 2 step 1 requires "the musician's contest is visible" for an offer outside the claim, and the suite is normative. (b) cannot pass it. Out, unless Nobody, allegedly, changes the scenario.
- **OF20 (b), precedence by power.** Its own cost: "a member who can meet the clone rule can override an area holder's concurrent change by writing any operational change." Q5 and rule 44c: an area's power is exclusive and the clone rule does not reach into it. Out as written.
- **OF3 (b), any one party.** The act table says "the owners under their agreement's rule", and a deal's rule is every party (F107). The proposal lays scenario 2 step 1 beside (b) as support; that step has a co-writer selling "under a 100% plan", that is under his own agreement, outside the shared claim (rule 15b), not under the shared deal alone. Finding 2.3 shows (b) is also unpayable beyond the signer under Finance rule 14. The option that follows decided rules is (a); a party who wants to sell alone does so under their own agreement, visibly outside, which 15b already allows.

### 3.2 Formats that disagree with each other

- **Field 3 of the offer against the second split model** (2.1).
- **The use record's role share against the evidence grammar.** Section 6 says a role for a use record is `[1, role, [1, spec, type], part]` and that "where the use record is one core type for every service, the role also needs to name which Module (OF12)". The evidence form has no slot for a Module. Under OF12 (a) the grammar is incomplete as drafted.
- **Rule 22's "to the owners pro rata" against publication stakes.** Under OF15 (a) or (b) a publication stake is a stake like any other, so the plan's `[0, stake, part]` for it applies to every payment, including payments for another publication. Rule 26 pays every stake its exact share on every split. Nothing in the plan says "this stake's share applies only to payments for publication P". So (a) and (b) need the `only-for` list the proposal gives (c) alone, and the proposal does not say so. X4 is half of this; the other half is missing.
- **Refund terms against the CDDL comment.** FR2 extends field 17 to every refund under the agreement; terms field 17's comment says "for standing offers". A reading that changes a format's comment is a change (a CH entry the table lacks).
- **The offer's field 0 against the purchase's field 9.** The offer names "the version of the claiming agreement the offer is made under"; the purchase names "the line at which the payer's client read it current". The two can differ (an offer made under version 3, a purchase naming version 5). FR1 takes the refund terms from field 0's version. Nothing says which version's refund terms govern where they differ, nor what field 0 adds for a collective, whose actions already cite the decision they act under in `objects` (rule 35b). In a collective where one area reaches type 6 and another reaches field 17 (scenario 3 gives field 17 to the release manager), the offer's signer picks the version, and with it the lapse: FR1's sentence "the offer's signer cannot shorten them alone" is false there.
- **The `fee` entry against rule 27's "one total".** Rule 27: "A fee is one total with an agreed split among the modules that earn it." The plan carries per-Module entries. Wording; no money moves.

### 3.3 Questions ordered before the question they depend on

The proposal says OF1 and OF15 "should be decided knowing" each other (X4) and puts them first and fifteenth. The same shape four more times:

- **OF7's second half** (does a lapsed refund block a closing) depends on Part F and OF28 (the closing's list of debts left open, from QG1 and F197), placed last. The answer decided rules give is Part F's: a lapsed refund is named in the closing act, as money owed to nobody is.
- **OF20 (a)** needs the request to a judge (OF24) and F192's "a judge speaks once per fork"; OF24 comes four places later.
- **OF4** ("until" on a push rail) and **OF9** (the third rail kind) depend on OF26's values, placed 26th. The values are fixed, as the proposal says; OF26 should still come first, as a confirmation.
- **OF2 (b)** (only an agreement every creator of the work claim signed) needs work claims public (OF16 a), placed sixteenth.
- **OF12 and OF13 (c) and (d)** are one question asked twice: where a cMIP's evidence record is defined, and whether a core type exists for it. They should be one.
- **OF25** is needed by rule 15b for the offer (OF1 to OF3) and should sit near the top.

## 4. Hidden decisions, and readings that decide

- **FR3** (the fee's bearer is a party who signed): decides how rule 27 reads in a collective (2.4).
- **FR5** (a fee is owed only on a split that names its Module): decides what rule 27's visibility means (2.5).
- **FR6** (F194 does not reach the measurer): decides F194's reach (2.7).
- **FR9** (a deal's terms carrying field 10 are invalid): rule 45b lists fields 18, 19 and 20, not 10; the proposal admits it in CH15. A decision in the FR list.
- **FR2** (field 17 governs every refund): changes a format comment (3.2).
- **The `unfilled` default, `[0]`.** Rule 22 gives three options and no default; the proposal writes "absent: [0]". The core allows a default that is one of the options; it is still a choice, and the one that sends every unfilled role share to the owners, the outcome 4c complained of.
- **Field 0 of the offer is required.** Rule 32a reads every standing offer as under a claim; the format writes it as a required hash. A sole seller with no agreement, the commonest seller there is, cannot publish an offer at all, and a live stream (which only an offer sells) needs a one-party deal first. Either that cost is stated, or field 0 is optional and an offer under no agreement is paid as a plain payment following the offer (Finance receipt field 5 already names "offer" among what a hop follows), no purchase, no lapse, refund by rule 10a. The proposal takes the first without stating it.
- **The evidence kind `[1, spec, type]`.** A format choice that decides, for every plan, that the owners name the transport cMIP (section 7.2).
- **OF8's `part`.** The CDDL comments give stakes in millionths (rule 15a) and leave `part` unexplained for roles, receivers and metrics while OF8 is open; a verifier reading the plan before OF8 is decided reads two meanings.
- **The split's key 6 includes "at least the rail Module and the split cMIP" (FR5).** The split cMIP is already key 2; the rail Module is already the receipt's field 0. Listing them again is harmless; making the list decide fees is the decision (2.5).
- **"The owners keep the money"** (format 3, in plain words). Finance rule 7 lists "past its terms" as a state beside "discharged"; it does not say the obligation ends. Whether a lapsed refund is the owners' is the decision OF7 half asks.
- **The delivery confirmation names "the payer's claim where no receipt exists".** A payee that signs a confirmation without a receipt signs that it was paid; the receipt is the lighter act. Under OF6 (b) this vanishes.

## 5. The twenty-eight questions, one at a time

For each: who gains under each option, and the option that follows from rules already decided, marked as my reading. Deciding nothing. Where an option is excluded by a decided text (3.1) I say so and do not weigh it.

- **OF1.** `[0]` and `[2]` are given by rule 32 and the suite. The question is `[1, work]`. Who gains under (b): a relay serving any publication carrying the work, a stranger's included, and the owners who need one offer for every publication; who loses: a publisher whose stake can never be paid on a work-wide offer (X4). Reading: `[0]` and `[2]` now; `[1]` only if OF15 keeps publisher stakes, since the two cannot coexist on one offer.
- **OF2.** (a) is what is built and what rule 15b and F72 say ("the documents stop overclaiming"); (b) ties ownership to authorship against rule 15; (c) judges which claim is the claim, which F72 refused. Reading: (a), with the one-word reading of Finance 10c in section 6.
- **OF3.** (b) excluded (3.1, 2.2, 2.3). (c) gains the convenience and keeps 2.2's hole unless field 3 is checked. Reading: (a), the act table with F107; its cost is F107's own.
- **OF4.** (c) excluded. (b) gains the publisher a way to kill an owner's offer by withdrawing a publication, which Envelope already allows for that publication. Reading: (a), with the fork rule the proposal leaves open answered by F186: a purchase under either version counts (the buyer is protected from the seller's two devices), the seller's client raises the alarm. For "until" on a push rail, (i): the seller who chose a push rail bears the undetermined place, as W4 puts the burden on the one answering; on a request rail the request decides.
- **OF5.** (b) gains buyers without conversion; (c) gains step 14a. Reading: (a) now; (c) needs a level index in the commitment and the purchase, which is 14a's own question.
- **OF6.** (a) keeps the owner online for every public-key sale; (b) lets the service's grant key complete it. Reading: (b), from H5 as written and "decisions built from elements already decided win"; one act fewer.
- **OF7.** (a) is the lightest and moves only by clone; (b) lapses only anchored payments; (c) has no start where delivery simply failed. Reading: (a), and the closing half by Part F (a lapsed refund named in the closing act, as QG1 names money owed to nobody), decided after OF28. Buyers must see the lapse before paying: a client conformance line the proposal lacks.
- **OF8.** (a) excluded. (c) gives `part` two meanings. Reading: (b); the holders' clients hold the cMIP since they signed terms naming it.
- **OF9.** (b) gains a service with a puppet on a rail binding nothing. Reading: (a), F193's reasoning in F193's words.
- **OF10.** (a) and (b) gain the relay at every split's cost; (c) gains the owners whose client never acknowledges. Reading: (c) with a client conformance rule (fetch, ask for the record, acknowledge in the claim written at payment), since the premise is a client's order of operations (section 7.1); the two smaller items as stated costs (2.10).
- **OF11.** (b) gains the relay that serves the larger copy; (c) hides the rule from a verifier without the cMIP. Reading: (a). Note that rule 15a's last tie-break, the smallest identity hash, lets a relay grind one low hash and win every leftover unit against every other filler for ever; for holders the set is fixed, for fillers it is not. Low, since it is units.
- **OF12.** (c) changes Law's "Layer". (a) needs a Module slot the grammar lacks. Reading: (b), QG3's "whatever cMIP defines it"; binds to the object, as the delivery record; one record spent per claim (2.10).
- **OF13.** (b) is F194's refused self-evidence by a puppet in the record; (a) has 2.7's hole until the measurer is excluded from the receivers. Reading: (a) with that check, and (d), the Module defining its record, since (c)'s core type would be the fourth evidence act for one job.
- **OF14.** See section 6. If type 15 stays: (c) changes no rule; (f) is what rule 27's "agreed" means. (e) gains a creator a veto over plans paying less, which "no cMIP or Module can force a fee" refuses.
- **OF15.** (a) and (b) change the stakes format and still need `only-for` (3.2); (c) uses grammar the plan already has and changes one word of rule 16; (d) withdraws rule 16. Reading: (a) is the text of rule 16 as it stands; (c) is the shape that dissolves the format question, at the cost of rule 16's wording, which is Nobody, allegedly's to weigh.
- **OF16.** (b) is the kept-for-later shape F148 and F166 broke on, moved to authorship. Reading: (a), with F189 (8)'s form: public, or addressed to every creator it names.
- **OF17.** (b) is F104's trap in F104's words. Reading: (a).
- **OF18.** (c) changes Envelope's `object`; (b) loses the work's view. Reading: (a), with 2.8's correction (the chain is the seller's, per stake, not one chain per stake).
- **OF19.** (c) is 2.9 as a stated cost; (b) needs a time reference on every selling agreement. Reading: (a) as the service's statement, with the W4-shaped rule for the seller (2.9) as the missing option. On the count: (d) is rule 14's "inherits the full position"; (e) is rule 15a's "a holder not named counting zero" read literally; (e)'s cost is the proposal's. Reading: (d).
- **OF20.** (b) excluded. (a) imports the deal's judge of forks into collectives, where B11 already settles a fork of records by the collective's own next line. Reading: (c), what Q38 and B11 decided; it adds nothing and withdraws field 10.
- **OF21.** (c) loses the keeper's one use at a theft. (b) lets the keeper order inside a record it signs at once, the trust 11a already states. Reading: (a) is rule 7 as written ("signs each record"); (d), since rule 9 says records are copied anywhere. The record reveals act ids and signers, which outsides already show.
- **OF22.** (a) builds and tests a second mechanism H3 said has no purpose. Reading: (b).
- **OF23.** (b) proves nothing to anyone. Reading: (a), F189 (8)'s form.
- **OF24.** (b) reuses a built type at the cost of its one field. Reading: (a), with the delivery rule of 2.6 in the format; an arbitrator's decision is an act of the condition cMIP (task 9 answers true, false, pending, unknown), left to it.
- **OF25.** (b) excluded. Reading: (a); standing computed per act contested is already rule 57a.
- **OF26.** (c) is F112's fault in reverse; (b) makes rules 10 and 10c rest on a cMIP's field. Reading: (a). Note that value 2 lumps "binds the payee, not the purpose" (a bank transfer to a fixed account, free reference) with "binds nothing"; rule 10 treats payee and purpose separately. A two-bit declaration, or a fourth value, if Nobody, allegedly, cares for that rail.
- **OF27.** (b) is misleading by design. Reading: (a), the client showing the hash.
- **OF28.** (b) cannot be checked, and F197 says the notice's conditions are visible so that good faith can be judged. Reading: (a). The notice needs a time reference in the collective's terms; a collective without one cannot close with such a debt, which should be said.

## 6. F-1 and T-1

### 6.1 T-1 is real, and one reading dissolves it

Finance rule 10c says a payment naming "a claim that is not the work's current one" is no purchase. "The work's current one" assumes one claim per work. Rule 15b and scenario 2 step 1 allow two agreements each holding a stake in one work, the lone co-writer's sale "outside" but "nothing prevented" and "the seller's own split shows what they took". Read literally, 10c makes that sale a refund, against 15b. The two sentences were written for different cases: 10c (F126, W2, W4) was written against a payment naming a *superseded version* of the agreement it names; 15b against a competing agreement.

The reading that dissolves it: in 10c, "the work's current one" means "the current version of the claiming agreement the payment names". Then every agreement holding a stake in the work is a claim a purchase may name (as built, OF2 a); a payment naming a superseded version of it is refunded (W2, W4, unchanged); a payment naming the other agreement is a purchase under that agreement, shown as outside the first by rule 15b's client rule, the contest (OF25) beside it. No rule changes; one sentence of Finance gains four words. The proposal lists OF2 (a) and does not say that it is a reading of 10c rather than a new rule, nor that CH21's list should carry 10c.

### 6.2 F-1 is real, and retiring type 15 dissolves it

Production's specification field 7 holds the fee terms' hash inside the content the spec hash covers; fee terms that named the Module would need the spec hash first. Real.

The proposal offers two shapes that keep both acts: (c) the specification names the fee terms, which name no Module; (d) the fee terms name the Module and field 7 goes. A third dissolves the flaw instead of patching it. What does a fee terms act do that the plan does not? Rule 27: a fee is "one total with an agreed split among the modules that earn it", and no split includes a fee "without the signature of whoever bears its cost"; F42: creators earn "through signed terms, not automatically"; the core's reasoning: "no cMIP or Module can force a fee". The plan's `fee` entry, signed by the plan's signers, is the signed terms. The creator consents to nothing (nobody refuses money) and cannot force anything. Fee terms add a *rate*, so that a plan paying less is "visibly short" (OF14 e), which is the one thing the texts say a creator cannot have. So: type 15 retired, never reused; Production rule 16 reads "a creator who charges says so in its specification's text, and earns where a plan's signers name its Module with a part"; field 7 becomes informative text or goes; "declared fee" in rule 27 means declared in the plan. OF14 (a) to (f) fall away; CH9 narrows to wording. Whether that is "fixing a fix" the project's four questions can settle: the fee terms act entered Law's table before the plan's `fee` entry carried a bearer; the entry now does its job.

If type 15 stays, (c) and (f) are the pair that changes no rule, and (e) should be weighed as a creator's veto. Note too that the case studies read "standing offer" more broadly than "accepted by paying": the gaming study has a studio publish its level format "with a standing offer: anyone may make and sell levels, and a share of each sale goes to the studio", accepted by making a level. The documents should say which they mean.

## 7. Where a rare case's weight falls on every ordinary act

### 7.1 OF10: held shares and the completing split. HEAVY

The premise, "evidence can arrive after the money is divided", is drawn from my own 4c and the proposal takes it as the common case. It is not. For locked media the buyer's client fetches the locked bytes before it pays (Envelope: the publication is public, its media locked, "where the locked bytes can be fetched" in field 6, the key delivered after payment), asks the relay for its record then, and writes its claim "at the moment it pays" (Finance rule 15, client conformance), acknowledging the record. On Lightning the receipt follows at once and the split has its evidence; on-chain the receipt waits six blocks and the record is an hour old by then. Late evidence is a client that pays first and fetches after, or a second relay used later. Under (a) every plan carries a held form, every split a key 9, every held share a second numbered act (QF4), rule 20 changes, the delivery record changes (CH16, CH22). Under (b) every payment waits. A client conformance rule (fetch and ask before paying, acknowledge in the claim written at payment) and one stated cost (a record acknowledged after the split fills nothing) carry the common case with no new act, and follow F184's "pay the pipe if you wish to" and F194's "good practice from client devs". **Weight: high**, as the set's heaviest machinery.

### 7.2 The evidence kind names a cMIP by hash in every plan. HEAVY, CONFLICTS (format 4, `evidence [1, spec, type]`; F115, F112; F184; QG3)

Every plan paying a relay writes the relay transport cMIP's hash. cMIPs are frozen at publication (Production rule 4); a successor transport is a new hash; every plan that pays relays needs a clone, every party signing in a deal, to pay relays on the new transport. F115's reasoning, which the proposal itself cites against OF26 (c): "Rail Modules change far more often than agreements; if terms named them, every upgrade would need a clone." QG3 was decided so that "no verifier needs telling which specification is the relay transport cMIP": its words are "any act offered as a relay's evidence counts only when the payer's claim acknowledges it, whatever cMIP defines it". F184: "role names belong to cMIPs." The option the proposal does not list: the role is its string; its evidence is an act of any cMIP whose type definition (Production, `type-def` carries a `name`) names that role, acknowledged by the committed payer's claim (F193). The acknowledgement is the gate, as F184 and F193 decided; a rogue cMIP naming "relay" earns only what a payer and a fake relay could already take, the stated cost F184 accepted. **Weight: medium to high.**

### 7.3 Field 0 of the offer, required. HEAVY (format 1; 4 above)

The sole seller with no agreement is the common seller and has no offer. Either stated, or optional.

### 7.4 Refund terms need a time reference in every selling agreement. HEAVY, stated

"Terms carrying field 17 name a time reference; terms that do not are invalid." Every deal that wants a refund lapse names a time reference cMIP, and under OF7 (b) every buyer anchors. Under (a) only the sellers' terms carry the weight, once. The default (no field 17, no lapse) is the lighter format and the heavier liability; a seller chooses knowingly. Say so beside OF7.

### 7.5 Split key 8 on every split. Light enough

One entry per stake that has a transfer chain, absent where none; most stakes never transfer. Fine as `? 8`, provided the deviation rule does not make an absent key a deviation for stakes with no transfer.

### 7.6 The buyer's three checks. HEAVY, decided elsewhere

A buyer's client under this set fetches the agreement's latest version (rule 32a), the offer's latest version (F188), the payee's clock (Finance rule 15) and vault (rule 14a), and compares field 0, the offer chain's head and field 9. Four fetches per purchase, all client conformance, all decided already. The set adds the offer chain; it does not add the weight so much as make it visible. Worth one plain paragraph in the offer's format, so a client author sees the whole list in one place.

### 7.7 Where the set is light

The delivery confirmation retired (OF6 b), the import retired (OF22 b), the concurrency rule withdrawn (OF20 c), fee terms retired (6.2), the keeper record as one small act per act (OF21 a), the unit with nothing machine-read (OF27 a), the rail kind one field (OF26 a): each of these is the option that adds nothing, and each follows from a decided text. The set is at its best where it removes.

## 8. What held, with what I tried

- **The three evidence kinds** reproduce F193 and F194 exactly: the committed payer's claim for referrals (under OF9 a), third-party acts acknowledged by that claim, the rail Module by the receipt the payee's pointer names. I tried the puppet payer of my finding 4 against each: closed by F193's wording wherever the rail commits to a payer, open only on a rail binding nothing, which OF9 (a) closes.
- **The closing's field 4 and the notice** follow QG1 and F197 as decided; I found nothing a collective gains by naming a debt it could have paid, since the notice's conditions are visible and the debt stays shown.
- **Split key 5's numbering** survives a completing split under OF10 (a): the completing split takes a number, and a gap stays the alarm.
- **FR12** (a fork is a link of each stake's transfer chain) is consistent with F199 (a fork judged by its own history) and F198 (a pointer outside the fork counts for payments already made).
- **The offer chain** `[first, previous]` with the agreement as `[agreement, agreement]`: I tried to make an offer version fork the agreement; the type distinguishes it, as a signature's does.
- **FR7, FR8, FR10, FR11** are readings of text already written and I could not turn any of them against a party.
- **X13** (a Module paid as a fee and as a rail role share): visible before signing (Production rule 15); nobody gains without the signers' consent.
- **The contest's generalisation** (OF25 a): I tried a contest by a stranger on an offer; rule 57a's standing holds it to the stake's holders, and it changes nothing anyway.

## 9. The order I would put the questions in

Confirmations first, then the hinge, then the plan, then the rest; each line names what it depends on.

1. OF26 (rail kind: confirm the values and the Production field).
2. OF25 (the general contest: forced by the suite; needed by OF1 to OF3).
3. OF15 with OF1 together (publisher marking and what an offer sells; X4).
4. OF2 (one reading of Finance 10c; T-1).
5. OF3 (the deal's signing rule, with field 3's check and the payer-side form written in).
6. OF4, OF5, OF6.
7. OF28 and Part F, then OF7 (the lapse, and the closing).
8. OF14 (F-1: retire type 15, or (c) and (f)).
9. OF8 (who computes), then OF9, OF11.
10. OF12 and OF13 as one question (where a cMIP's evidence record lives; the measurer excluded from receivers), with the evidence kind of 7.2.
11. OF10 (as a client rule and a stated cost, or the machinery).
12. OF16, OF17, OF18 (with 2.8), OF19 (with 2.9).
13. OF24 (with the delivery rule of 2.6), then OF20.
14. OF21, OF22, OF23, OF27.
15. The readings: FR1 (with field 0's relation to field 9), FR2, FR3, FR5, FR6 and FR9 put as decisions; FR4, FR7, FR8, FR10, FR11, FR12 confirmed.

## For the project lead

**Branch** `claude/formats-proposal-review`, one commit on main at `339f363`: this report only. Nothing in `spec/`, the proposal, the library, the bindings or the clients changed.

**Decisions this report asks for, grouped as they should be put to Nobody, allegedly, one at a time, before the 28 questions:**

1. **The offer's field 3** (2.1 to 2.3): a form for payer-side splitting; a verifier check against field 14 in a deal; and that the payee signs, which decides OF3 by Finance rule 14.
2. **The role share's evidence kind** (7.2): the role by its string and any acknowledged cMIP act, or the cMIP named by hash in every plan; this is where F115's lesson is kept or not.
3. **OF10's premise** (7.1): the common order of fetch, pay, claim, as a client rule, before the held form and the completing split are weighed.
4. **FR3, FR5 and FR6** (2.4, 2.5, 2.7) as decisions, each with its who-gains.
5. **The request to a judge's delivery** (2.6), with F189 (8) laid beside it.
6. **The transfer's chain and the double sale** (2.8), and **the seller's wrong receipt** (2.9), with W4 laid beside both.
7. **T-1** by the reading of 6.1; **F-1** by retiring type 15 or by (c) and (f).
8. Then the 28 questions in the order of section 9, with the six excluded options removed from their lists.

**For the findings log**, if Nobody, allegedly, decides any of these: 2.1, 2.4, 2.6, 7.2 and the reading of 10c change the protocol and would be numbered findings (next: F200); the rest are readings, checks or wording. **For the building session:** the proposal's format for the offer gains the payer-side form and the field 3 check before anything is built on it; the evidence kind is settled before step 13 (the split Module), which the plan's format feeds.

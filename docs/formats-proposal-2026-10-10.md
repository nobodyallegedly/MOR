# The open formats, as one set: a proposal

*Roadmap step 12b, 10 October 2026. A proposal for Nobody, allegedly, drafted in a GitHub session; next, Fable attacks the set as a whole; then Nobody, allegedly, decides the questions at the end one at a time; then a session writes the decisions in and builds them. **It changes nothing** in `spec/`, the core library, the bindings or the clients.*

*Written against core v21 ("Open before freeze"), Identity draft 11, Envelope draft 7, Text draft 6, Finance draft 6, Law draft 10 and Production draft 6 as revised in place up to 9 October 2026; the payment cMIP draft 2, the relay transport cMIP draft 3 and the on-chain rail Module draft 1; findings F1 to F197, every finding from F140 on read in full; and Fable's review of the F190 build (`docs/reviews/f190-review-2026-10-09.md`), findings 4b, 4c and section 8 above all. F192 to F197 were decided on the morning of 10 October and are not yet written into the texts; they are read here as decided.*

*Reading this document: each format starts in plain words (what it is for, who signs it, a short story with Ana, Ben and Carla), then gives the exact fields in CDDL, in the style of Law's terms and Finance's receipt and claim, then says where each field comes from. A field that needs a choice no rule makes is not chosen: it is marked **Q** with a number, and the question is set out under the format with its options and what each costs. Readings (places where a rule decides, but only once read a certain way) are marked **R**. The questions are gathered at the end, in the order they should be decided.*

*The repository's working practice applies to every question here: who gains, and can they pull it; the rare case, as a story; what it breaks elsewhere; how we got here, and whether it is fixing a fix. Where a question touches something Nobody, allegedly, already decided, that decision is quoted beside it.*

## In plain words first

The core promises an exact format for every act before it freezes (core v21, "Open before freeze"). Identity, Envelope and Text have theirs. Finance, Law and Production still have holes, places where the text says "format open" and a verifier refuses rather than guesses. Almost all of them are about money crossing a deal:

- **selling**: the standing offer, its refund terms, the delivery confirmation;
- **owning**: who made a work (the work claim), how a stake is sold (the stake transfer), what a publisher may hold;
- **dividing**: the split plan, with its role shares, fees and metrics, and a service's record of use;
- **living together**: two changes made at once (the concurrency rule), taking on an agent's act (the import), showing one is still here (liveness), a notary's stamp (the keeper record), asking a judge, contesting;
- **rails**: whether a rail is a request rail or a push rail, and whether it binds who is paid and for what.

Drafting them together, as Nobody, allegedly, decided ("tackling all this will force us to take decisions that will then trickle down or up to give the whole its actual shape"), shows four things that a format-by-format pass would miss:

1. **The standing offer is the hinge.** What it names decides whether a relay can ever be paid on a purchase (Fable's 4b), whether a split service may receipt money under it (H5), how a publisher's share is found, and how long a refund lasts. It is drafted first, and its first question (what an offer sells) is the first to decide.
2. **A role share must say what evidence it takes, not only its name.** Since F184, F193 and F194 there are exactly three kinds of evidence the core accepts, and a verifier can check a role only if the plan says which kind it expects. The plan's sketch gives a role a name and nothing else.
3. **Evidence can arrive after the money is divided** (Fable's 4c). Nothing in the formats says what a split does with a role whose proof comes later. It needs a decision, and that decision shapes the split, the plan and possibly the relay's delivery record.
4. **Three formats need "which head did you follow?"**: a split must say which transfers it followed, as it already says which receipt it follows for leftovers (F165, F171); a transfer needs a chain that does not fork the agreement; an offer needs a chain of its own, since F188 asks a buyer to check it is "truly the last in its chain".

Eighteen formats are drafted below, from rules already decided, with the fields two decisions of 10 October imply. **Twenty-eight questions** need Nobody, allegedly (OF1 to OF28). **One flaw** was found in rules already written (F-1: Production's fee terms and the fee terms act would each have to name the other's hash first), and **one tension** between them (T-1: which claim a purchase may name when two agreements hold stakes in one work). **Twenty-five places** (CH1 to CH25) are listed where writing the formats in would change a rule or a format already written, and **twelve readings** (FR1 to FR12) are taken, to confirm.

## The inventory

| # | Format | Where the text marks it open | How it entered this set |
| --- | --- | --- | --- |
| 1 | Standing offer (Law type 6) | Law act table; rule 32; "What a split service's grant key may sign", reading 4 ("a receipt following a standing offer, whose format is open, is refused") | asked |
| 2 | Delivery confirmation (Law type 7) | Law "Open technical parameters" (every act type not listed as exact) | found |
| 3 | Refund terms (terms field 17) | terms CDDL, "(format open)" | asked |
| 4 | Split plan (terms field 8), with the Modules a split ran under (rule 27) | terms CDDL; rules 27 and 46b ("whose format (field 8) is still open") | asked (rule 27 found) |
| 5 | A metric's fields (Law rule 28) | rule 28, "the fields' format open" | asked |
| 6 | The service's use record (Production rule 17, under F194) | Production rule 17, "The use record's format is open (F140)" | asked |
| 7 | Module fee terms (Law type 15), and Production's specification field 7 | Law "Open technical parameters" | found |
| 8 | How a publisher is marked (Law rule 16) | rule 16, "Format open (F140)" | asked |
| 9 | Work claim (Law type 3) | Law "Open technical parameters" | asked |
| 10 | Stake transfer (Law type 4) | the closing's text, "type 4, its format still open" | found |
| 11 | Concurrency rule (terms field 10) | terms CDDL, "(format open)" | asked |
| 12 | Import (Law type 11) | act table and rule 41, "its format is still open (a verifier refuses it)" | asked |
| 13 | Liveness (Law type 12) | Law "Open technical parameters" | asked |
| 14 | Keeper record (Law type 2) | Law "Open technical parameters"; the library takes keepers' logs as the caller's word | found |
| 15 | Contest, beyond a declaration of absence (Law type 14) | the contest's text, "keeps its format open" (BQ4) | found |
| 16 | The signed request to a judge (rule 34a) | no format exists; the MUST audit, row R34a-3 | found |
| 17 | A rail Module's kind and binding (F140 item 1, F168 item 12) | Finance rule 10, "FORMAT OPEN"; payment cMIP, rail Modules item 3; on-chain Module, "Format open" | asked |
| 18 | The unit specification | Finance "Open technical parameters" | found |
| — | Formats the decisions of 10 October imply: the closing's list of debts it leaves open (QG1, F191), the notice before closing (F197) | decided, not yet written | found |

**Searched and left out, with the reason.** Law's "Encoding of conditions and grant limits" is delegated by Law itself to the condition and grant-limits cMIPs (tasks 9 and 12); the core's only open point there is what a verifier does with limits it cannot read (the MUST audit's row 50 question), noted under the whole-set view. Outside Finance, Law and Production: Identity's home queries and the encrypted form of private links, Envelope's Merkle construction for commitments (which the relay transport cMIP draft 3 says is "still open there") and its inbox queries, Text's pinned Unicode version, and Production's RV32IM profile and signature-scheme format are technical parameters of other steps (15, 16), not act formats of this set. The payment cMIP's own open points (batches, conversion hops) are the cMIP's.

**Type numbers.** Law types 0 to 23 are taken (21 retired, never reused). Where a question's option needs a new Law act type, it would take the next free number, 24 and on, in the order decided; numbers are technical choices (as field 26's number was, F188).

**What "done" means for this step** (roadmap 12b): every act in Finance, Law and Production has an exact format, approved, and the library refuses none as "format still open". Today it refuses terms fields 8, 10 and 17 (`Terms::decode`), the import (`consent_judged`), a receipt following an offer (H5's reading 4, and `work_of` reads no offer), and it takes keepers' records as a list the caller states. Each refusal lifts when its format below is decided and built.

---

# Part A. Selling

## 1. The standing offer (Law type 6)

### In plain words

**What it is for.** Owners publish terms that anyone accepts by paying them (rule 32). A publication carries one plain price, which a Finance-only wallet can pay; a standing offer is how a work under a Law claim is sold under the owners' agreement, and the only way to sell something that has no work hash yet, such as access to a live stream (rule 32; Envelope, "Publication"). A payment that follows the offer and names the claim it buys under is a purchase (rule 32a, Finance rule 10c). The deal is complete when the offer's side delivers the content key, or, for a publication whose key is public, signs a delivery confirmation; a payment that gets neither is owed back (rule 32).

**Who signs it.** The act table says: "the owners under their agreement's rule, or a grantee". In a collective that is the collective, with its own key or a grant key of its (an action on its chain, done, rule 35a), reached by its Law lane or by an area whose kind names type 6. In a deal the table names no rule: question OF3.

**A story.** Ana and Ben own a song under a deal, Ana 600,000 and Ben 400,000 of its one stake. They publish a standing offer: the song's publication, 2,000 satoshis, paid to Ana as the deal's payee, whose pointer leads to their split service. Carla's wallet finds the offer, checks it is the latest in its chain (F188), and pays naming the song's claim and the version it read current. The split service, holding Ana's grant key, receipts the payment in Ana's name, which it may do because the receipt follows Ana's own offer (H5); it delivers the content key, and Carla checks it against the work hash. Carla fetched the locked song from a relay; Carla's claim acknowledges the relay's delivery record, and because the offer says which publication it sells, the verifier can see that the record names what was paid for: the relay's share is filled. Without that field no delivery record could ever count on a purchase naming an offer (Fable's 4b).

### Exact fields

```cddl
offer-payload = {
  0 => hash,                ; under: the version of the claiming agreement the offer is made under; a purchase following it
                            ;   names that agreement and the line it read current (Finance receipt and claim field 9)
  1 => [+ sold],            ; what it sells, ascending by deterministic encoding, none twice            (OF1)
  2 => amount,              ; the price, in Finance's form                                               (OF5)
  ? 3 => hash,              ; for: the identity paid, whose payee pointer the payment goes to; absent: the signer
  ? 4 => tstr,              ; the offer's words, canonical text: what a buyer must know before paying (an app required, a delivery to a bare key)
  ? 5 => any                ; until: a point on the time reference of field 0's agreement after which it accepts no payment  (OF4)
}

sold = [ 0, publication: hash ]       ; a publication (Envelope type 0), by its act id
     / [ 1, work: hash ]              ; any publication carrying this work hash                              (OF1)
     / [ 2, access: [ hash, any ] ]   ; something with no work hash yet (a live stream): a cMIP and its parameters  (OF1)
```

*Citations.* Its `objects` are question OF4 (an offer's own chain). Its `refs` cite the payee's latest pointer, as Finance rule 14 asks of every act that can pay its signer (client conformance, F163): this is already written, and applies to the offer once it exists.

### Where each field comes from

| Field | From |
| --- | --- |
| 0, under | Rule 32a: a purchase names "the claiming agreement, and the line at which the payer's client read it current"; rule 15b: an offer "not signed under that claim's agreement" is valid and shown as outside it, so the offer must say which agreement it is under; F188's strong SHOULD: the buyer verifies that the offer "is truly the latest in its chain", which needs the version it was made under. |
| 1, sold | Rule 22 and F184: a relay's delivery record counts only where "the object it names is the one the payment was for"; Fable's 4b (the object cannot be found from an offer that names none); Envelope, "Withdrawal": "offers attached to it close", which needs the offer to name the publication; H5: the split service's grant key signs receipts for money "under the grantor's own claims and offers"; rule 32: paid live access, with no work hash, is sold by an offer. |
| 2, price | Rule 32 ("anyone accepts by paying them"); Finance 14b (the owner's client warns before publishing an offer "priced in a unit the owner's declared vault does not cover", so the offer carries a unit); Finance, `price = amount` for publications. |
| 3, for | Finance rule 14 and F168 item 13: "an offer another identity signed is not the payee's act; the payee's act is then its signature accepting it", so the offer can be signed by someone other than the payee and must say who is paid; Envelope `for` (F68) is the same pattern; in a deal naming a split service the payee is a party whose grant field 14 lists (rule 18, F129). |
| 4, words | Rule 32 ("Owners publish terms"); the definition, "Published terms that anyone accepts by paying"; freeze scenario 6 ("the requirement is visible before purchase": access requiring the company's own app). |
| 5, until | Rule 32a, written as guidance with F188: "an offer may carry its own expiry on a named time reference"; Law's Q31 (one time reference per agreement); rule 33 (past a deadline is judged on that reference). |

**Refund terms are not a field of the offer.** Rule 32 says "the offer's terms MAY say how long a refund stays claimable", terms field 17 is "for standing offers: how long a refund stays claimable", and freeze scenario 3 gives the label's release manager an area reaching "the refund terms of its standing offers". **FR1:** "the offer's terms" are the terms of the agreement in field 0; an offer carries no refund terms of its own, so a lane can set them once for every offer, and the offer's signer cannot shorten them alone.

**What a verifier checks** (each from a rule): the offer is valid under Identity; its signer is one the rule of OF3 allows (in a collective, the collective's act, done, within the lane or area reaching type 6); field 1 is ascending, none twice; field 2 is a Finance `amount`; field 5 is present only where field 0's agreement names a time reference (rule 33). An offer under an agreement that does not claim what it sells is not invalid: it is shown as outside the claiming agreement (rule 15b, client conformance). **What it unlocks:** H5's reading 4 lifts: a split service's grant key may sign a receipt whose field 5 names an offer whose payee (field 3, or its signer) is the grantor and whose field 0 is the grantor's own claim (in a deal, a version of the deal; in a collective, a version of its agreement).

### Questions

**OF1. What a standing offer sells.** Rule 22 needs "the object the payment was for"; a relay's delivery record names a locked media hash. *Laid beside it, Nobody, allegedly, 9 October (F184): "Let's keep the mechanics solid for those who wish to form good partnerships knowingly."*

- **(a) Publications only** (`[0, publication]`). The object paid for is each publication's locked hash: exact and checkable; withdrawal of a publication closes the offer for it (Envelope). *Cost:* an offer for a work published in three places names three publications, and a new publication needs a new offer; live access cannot be sold at all.
- **(b) Publications or a work** (`[0, …]` and `[1, work]`). A work-wide offer covers every publication carrying that work hash, today's and tomorrow's. *Cost:* a delivery record then counts for any publication carrying the work, including a stranger's republication outside the claim, which a relay could serve and be paid for under the owners' plan; the verifier must hold the publication to read its work hash.
- **(c) Either, plus access with no work hash** (`[2, access]`). Live streams become sellable under Law, as rule 32 says they are. *Cost:* the core cannot say what object a delivery record names for access (a stream's segments are the media cMIP's), so a relay's role share on access counts only where that cMIP defines it, or not at all; and an offer for access names no work, so whether it is under a claim at all is a question of its own, which neither OF2 nor OF3 settles (rule 32a's purchase is "a payment for a work under a Law claim").

**OF2, which claim a purchase may name when two agreements hold stakes in one work,** comes before the signing rule and is set out with the whole set (X2, tension T-1): the offer's field 0 names one agreement, and whether a lone co-owner's offer under its own agreement makes purchases or refunds is decided there.

**OF3. Who signs a standing offer in a deal.** The table says "the owners under their agreement's rule"; a deal's rule is every party (F107), but an offer is not a change to the deal. *Laid beside it: rule 15b and scenario 2, step 1: "A co-writer holding half the claim publishes the song alone under a 100% plan and sells it: every rule holds, a client shows the publication as outside the claiming agreement… nothing is prevented."*

- **(a) Every party**, as for terms: one signs the offer, the others add signature acts naming it (type 1). An offer one party signed alone is outside the claiming agreement. *Cost:* every price change needs every party, so a silent party freezes the deal's prices; signature (type 1) field 0's list gains "a standing offer" (change CH1).
- **(b) Any one party.** The offer is inside the claim because field 0 names it, and the money cannot be diverted: the purchase names the claim, the split pays every stake (rule 26). *Cost:* any party sets the price alone, including selling for nothing, and two parties' offers can compete for the same work; the receipts show who sold at what price.
- **(c) The deal's terms name an offer rule**, as field 24 names the release rule: which parties sign offers. *Cost:* a new terms field (a format change, CH1 too); for a collective it adds nothing, since areas already decide.

**OF4. How an offer changes and ends, and what "until" means on a push rail.** F188 asks the buyer to find "the latest in its chain", but an offer has no chain yet. An offer cannot sit on the agreement's own chain as a step of it: two acts naming the same predecessor there are a fork (rule 5), and offers would fork against clones.

- **(a) An offer chain.** The first offer names no chain; a new version names, in `objects`, `[first, previous]`, as a negotiation thread does (type 18); the latest replaces the earlier; a version with an empty field 1 withdraws. The agreement is cited as `[agreement, agreement]`, never a fork, as a signature cites what it signs. *Cost:* two versions naming the same previous are a fork, which needs a rule (the earlier stays? the seller's alarm?); a buyer holding an old version pays it: on a request rail the seller's side does not commit to a superseded offer (client conformance), on a push rail the payment is judged by each holder's chain (rule 32a), as now.
- **(b) Envelope's withdrawal (type 3) also withdraws an offer.** *Cost:* changes Envelope rule 15 and its table (CH14); a withdrawal's authority is the publication's signer or `for`, which an offer signed by a collective's grantee does not fit; no versions, so every price change is a withdrawal and a new offer.
- **(c) No chain:** an offer ends only by its `until`, by the withdrawal of every publication it names, or by an ending of its collective (forks and closings withdraw offers, rule 47a). *Cost:* a price cannot be changed, only left to expire; F188's "latest in its chain" has nothing to check.

*And for every option:* on a push rail, a payment whose place against `until` the time reference answers "undetermined" (rule 33) is (i) a purchase, the buyer protected as in A4, or (ii) owed back. F148's working rule applies either way ("where a signed act expresses a time, anchoring is a MUST for what depends on it"): an offer with `until` expresses a time, so the payer's client anchors its claim. On a request rail the seller's request decides, as for W4.

**OF5. The price.** A publication carries one amount (Envelope key 7).

- **(a) One amount**, as a publication. *Cost:* a buyer whose wallet holds another unit pays through a conversion service (Finance, "Conversion"); an offer in two units is two offers.
- **(b) Several amounts, one per unit**, none twice. *Cost:* the vault warning (14b) runs per unit; a purchase's commitment already carries the amount paid, so nothing else changes.
- **(c) Levels**: several priced items in one offer, the purchase naming the level. Roadmap step 14a asks for "urgency tiers as levels of a standing offer". *Cost:* a level index in the purchase (Finance field 9 and the payment commitment change); or, without it, levels told apart by amount alone, which fails where two levels cost the same.

## 2. The delivery confirmation (Law type 7)

### In plain words

**What it is for.** Where what was bought has a public key, there is no key to deliver, so the offer's side signs that the payment was verified and honoured; that closes the deal (rule 32). Without it, the payment is owed back.

**Who signs it.** "The offer's side": the offer's payee (field 3, or its signer).

**A story.** Ana's poem is public. Ana publishes an offer: "own a signed copy", 500 satoshis. Carla pays. Ana's client signs a delivery confirmation naming Carla's receipt; Carla's purchase is complete and on the record. Had Ana withdrawn the offer first, the late payment would get no confirmation and would be owed back to Carla.

### Exact fields

```cddl
confirmation-payload = {
  0 => hash                 ; the payment it confirms: its receipt (Finance type 2), or the payer's claim where no receipt exists
}
```

Signed by the offer's payee, with its own key. Its inside names, in `objects`, the offer as both chain and predecessor, `[[offer, offer]]`: it follows the offer and is never a fork, as a signature follows what it signs. Field 0 names a receipt or claim whose field 5 names that offer.

| Field | From |
| --- | --- |
| 0 | Rule 32 ("signs a delivery confirmation: that proves payment was verified and honoured"); Finance rule 10 (a claim alone shows the money arrived where no receipt exists); the act table ("the offer's side"). |

### Question

**OF6. Its own act, or the receipt?** A receipt is already signed by the payee, names the offer (field 5) and the claim bought under (field 9).

- **(a) Keep type 7**, as above. The moment the deal completes is its own act. *Cost:* the split service's grant key signs receipts only (H5, H7), so a deal using a split service needs the payee's own key for every confirmation, the owner online for every sale of a public work; or H5 widens (a rule change, F129, F130).
- **(b) Retire type 7: the payee's receipt naming the offer and the claim is the confirmation** for a public key. *Cost:* changes rule 32 and the act table (CH24); a receipt signed with the split service's grant key then completes the deal, which H5 already allows it to sign; the number 7 is never reused.

## 3. Refund terms (terms field 17)

### In plain words

**What it is for.** A payment under an offer that gets neither key nor confirmation is owed back (rule 32), to the payer, or to whoever signs with the key the payment committed to (Finance rule 10a). The core sets no lapse; the agreement may say how long the refund stays claimable, on its time reference (rule 32, Finance 10a). After that, the debt is **past its terms** (Finance rule 7 already has the state) and the owners keep the money.

**Who signs it.** It is a field of the terms: every party in a deal; in a collective an operational field (rule 44a), reached by an area naming field 17 or by the clone rule.

**A story.** Ana and Ben withdraw their song's offer. Carla's payment arrives just after, paid with a one-time key. The deal's refund terms say a refund is claimable until block 900,000. Carla claims it at block 880,000, signing with the committed key and naming where to be paid; the service repays. Had Carla waited until block 910,000, the refund would show "past its terms".

### Exact fields

```cddl
refund-terms = {
  0 => lapse
}
lapse = [ 0, point: any ]     ; claimable until this point on the agreement's time reference      (OF7)
      / [ 1, period: uint ]   ; claimable for this long, in the time reference's units, from a start OF7 decides
```

Terms carrying field 17 name a time reference (field 6, or field 2's task 10); terms that do not are invalid.

| Field | From |
| --- | --- |
| 0, lapse | Rule 32 ("how long a refund stays claimable, on the time reference"); Finance rule 10a ("Whether an unclaimed refund ever lapses is for the offer's terms (Law); the core sets no lapse"); Finance rule 7 ("past its terms", a state that depends on Law); `point: any` as in the release's field 4; `period: uint` as in a chain of judgment's link. |
| the time reference required | Rule 33 ("An agreement that needs deadlines names its time reference"). |

**FR2.** Field 17 governs every refund owed on a payment under the agreement, whether it follows an offer, a publication the agreement claims, or names no claim at all (Finance 10c: "owed back to the payer as a refund, by rule 10a"), since 10a gives the lapse to "the offer's terms" for every unclaimed refund.

### Question

**OF7. How "how long" is measured, and what a lapsed refund does to a closing.**

- **(a) A fixed point** (`[0, point]`). Simple, the same for every payment; a payment made just before the point has almost no time. *Cost:* the terms must be cloned to move it.
- **(b) A period from the payment**, its earliest anchor on the agreement's reference. *Cost:* only an anchored payment ever lapses; an unanchored one stays claimable forever (F148's working rule: the time is expressed, so anchoring is a MUST for what depends on it).
- **(c) A period from when the refund became owed**: the withdrawal's anchor, or the offer's `until`. *Cost:* a payment that got no delivery for another reason (the seller simply never delivered) has no such start, and needs (a) or (b) as well.

*And:* a closing is complete only if every debt that binds the collective is "fulfilled in full by receipts a verifier holds, or ended by its creditor's release" (Law, "Closing (type 20)"); a refund past its terms is neither. **Should a refund past its terms count as ended for a closing?** If yes, that is a reading added to the closing rule (CH4); if no, a lapsed refund blocks a closing as QG1's unclaimable debt did before F191, and is named in the closing act like it (Part F).

---

# Part B. Dividing

## 4. The split plan (terms field 8), and what a split names (rule 27)

### In plain words

**What it is for.** The part of the owners' agreement that says how each incoming payment is divided (definition, "Split plan"): shares on stakes, paid to whoever holds each stake now; role shares, for helpers known only at payment time; named receivers who hold no stake (a service, a position); module fees, each consented by whoever bears it; who bears the payout rail fees, and the most a payout may lose to them; what happens to a role nobody fills. It names a split cMIP (task 8), which does the arithmetic and declares its remainder rule. The core does not run the plan; it checks the guarantees: every split sums exactly (rule 21), every payout matches its stake exactly, fees taken before the stakes divide (rule 26, N10), every role payout carries the evidence its kind needs (rule 22), every fee is one the bearer signed for (rule 27).

**Who signs it.** It is a field of the terms: every party in a deal; in a collective an operational field (rule 44a), reached by an area naming field 8, or by the clone rule. Before signing, the client shows what it computes on an example (Production rule 15, client conformance).

**A story.** Ana and Ben's plan for their song: 88% to the song's stake, 5% to the relay that served the file, 5% to whoever referred the buyer, a 2% fee to Ben's publishing Module borne by the owners, rail fees borne by each receiver up to 10 satoshis a payout. Carla buys after a friend's repost; Carla's claim names the friend as referrer and acknowledges the delivery record of the relay that served the file. The split pays the stake (Ana 60%, Ben 40% of it, leftovers by rule 15a), the friend, the relay, and the Module's creator, and names, as rule 27 asks, the Modules the payment ran through. A role the split cannot fill goes where the plan said.

### Exact fields

The draft's sketch (Law, "Split plan and split") is kept wherever a rule supports it. What changes: a role share says which evidence it takes (from rule 22, F119, F184, F193, F194); the plan can carry the split cMIP's parameters; metric shares (Part B, 5) and a held form for late evidence (OF10) are added.

```cddl
split-plan = {
  0 => [+ share-rule],       ; stakes, roles, named receivers and metric shares, in this order of kinds, then as the plan lists them
  1 => hash,                 ; the split cMIP (task 8), which declares the remainder rule and computes the payouts
  ? 2 => [+ fee],            ; module fees, one total split among the modules that earn it (rule 27)
  ? 3 => unfilled,           ; what happens to a role share nobody fills; absent: [ 0 ]
  ? 4 => [+ uint],           ; indexes in field 0 of the shares taken off the top, ascending, none twice     (OF8 for their meaning)
  ? 5 => uint,               ; who bears payout rail fees: 0 each receiver (the default), 1 the split service
  ? 6 => amount / uint,      ; the largest rail fee a payout may lose: absolute, or millionths of the payout
  ? 7 => any,                ; the split cMIP's parameters (a waterfall's thresholds), as its specification defines   (OF8)
  ? 8 => [+ metric]          ; the metrics the plan divides by (rule 28)                                      (OF13)
}

share-rule = [ 0, stake: uint, part: uint ]                   ; a stake, by its index in field 7 of the same terms; paid to its current holders
           / [ 1, role: tstr, evidence, part: uint, ? division: uint ]  ; a role, filled at payment time   (OF11 for division)
           / [ 2, receiver: hash, part: uint ]                ; a named receiver that holds no stake (a service, a position)
           / [ 3, metric: uint, part: uint ]                  ; a metric share: field 8's metric of this index    (OF13)

evidence   = [ 0 ]                       ; a referral: the one in the claim of the payer the payment commits to (Finance claim key 6; F75; OF9)
           / [ 1, spec: hash, type: uint ] ; an act of this type, in this specification, signed by its filler and acknowledged
                                         ;   by the claim of the payer the payment commits to (F184, F193, QG3 in F191, F194)
           / [ 2 ]                       ; a rail Module: the receipt or claim naming it in field 0, where the payee's own
                                         ;   pointer or vault names it (F119, Finance rule 12a)

fee        = [ module: hash, part: uint, bearer: hash ]   ; the Module or cMIP that earns it, its part, and the party bearing it
unfilled   = [ 0 ]                       ; to the stakes, in proportion to their parts (FR4)
           / [ 1 ]                       ; held open (OF10 for until when, and paid to whom)
           / [ 2, receiver: hash ]       ; to a named identity
```

**The split (type 8) gains, from rules already written:**

```cddl
split-payload = {
  ; keys 0 to 5 as written (the receipt or claim, the payouts, the split cMIP, the owners' agreement, the leftover count, the number)
  ? 6 => [+ hash],           ; the Modules and cMIPs it ran under (rule 27), ascending, none twice     (FR5)
  ? 7 => [+ hash],           ; the metric records it divides by (rule 28), each signed by the measurer the plan names
  ? 8 => [+ [ stake: uint, transfer: hash ]],   ; per stake, the latest transfer it follows               (OF19)
  ? 9 => [+ [ share: uint, amount: uint ]]      ; role shares held open, by their index in the plan       (OF10)
}
payout = {
  ; keys 0 to 6 as written
  ? 7 => uint                ; the metric share it pays, by its index in plan field 0                      (rule 28)
}
```

### Where each field comes from

| Field | From |
| --- | --- |
| plan 0, share-rule `[0, stake, part]` | Rule 26 ("A split service MUST NOT pay anyone outside the plan's stakes as currently held"); F73 ("Split plans refer to stakes; the transfer chain names the holder"); Law's reasoning, "Shares follow stakes, holders follow transfers". |
| `[1, role, evidence, part]` | Rule 22 and the role share's definition; F184 ("Role names belong to cMIPs": the name is a label, its meaning a cMIP's); the three kinds of evidence are the only three the texts accept since 10 October: the payer's referral (F75, Finance 10b), a third party's act the committed payer's claim acknowledges (F184 for relays, F193 for which payer, QG3 for "whatever cMIP defines it", F194 for services), and the receipt or claim naming a rail Module (F119). Naming the specification and type of kind 1 is what lets a verifier tell a relay's role from a service's without being told which cMIP is which (QG3's reason: "every verifier gives the same answer"). |
| `[2, receiver, part]` | Rule 26 ("named receivers"); F184 ("a named receiver holding no stake … covers helpers known at publication"); F194 ("a service chosen by the owners in advance is paid by a named share, with no evidence"). |
| `[3, metric, part]` | Rule 28 (Part B, 5). |
| plan 1 | Task 8; rule 21 ("The split cMIP declares its remainder rule"). |
| plan 2, fee | Rule 27 ("A fee is one total with an agreed split among the modules that earn it… No split can include a fee without the signature of whoever bears its cost"); Production rule 16; rule 26 ("every fee is taken before the stakes divide"). **FR3:** the bearer is a party who signed this version; a creator-side fee's bearer is the creator. |
| plan 3, unfilled | Rule 22 ("to the owners pro rata, held open as an obligation, or to a named party", F75). |
| plan 4 | The sketch; rule 26 (fees off the top). |
| plan 5, 6 | Rule 24a; Finance rule 18a. |
| plan 7 | Task 8 (the cMIP "accepts an amount received and a split plan"); freeze scenarios 1 (a waterfall) and 7 (pro rata and user-centric): parameters the core cannot foresee; the pattern `[hash, any]` used for the time reference, the absence proof and the clock. |
| split 6 | Rule 27 ("Every split names the modules it ran under… so an omitted declared fee is visible"). |
| split 7, payout 7 | Rule 28 ("The metric, its module and the resulting payouts are named"). |
| split 8 | Rule 14 ("a split service MUST follow" the transfer chain), OF19. |
| split 9 | Fable's 4c, OF10. |

**FR4.** "To the owners pro rata" means to the plan's stake shares in proportion to their parts, each stake's amount then divided among its holders as rule 15a says.

**FR5.** The Modules a split names in field 6 include at least the rail Module of the receipt or claim it splits (field 0 there) and the split cMIP (field 2 here); a fee in the plan whose module the split names is owed on that split; one whose module it does not name is not. *Stated cost:* a service that leaves out a Module the payment did run through skips its fee; the omission is visible only to someone who knows the payment used it, such as the Module's creator reading the publication's media type, or the buyer.

**What a verifier checks** (each from a rule): every stake index exists in field 7 of the same terms; every role names one of the three evidence kinds; every fee's bearer is a party of the version (FR3); field 4's indexes exist; field 5 is 0 or 1; field 6, if millionths, is at most 1,000,000; on a split, every role payout's evidence is of its role's kind (rule 22), every fee owed under FR5 is a payout naming its module and receiver (as F121 decided for fees), and the rest as now. Whether the parts add up, and to what, is OF8.

### Questions

**OF8. Who does the arithmetic: the core, or the split cMIP?** Rule 26 fixes that fees come off the top and every stake's holders get exactly their share of what the split pays that stake. It does not fix how much a stake gets. Freeze scenario 1 runs a waterfall, scenario 7 pro rata and user-centric sharing, each a split cMIP.

- **(a) The core fixes the meaning of `part`:** each in millionths; fees first, of the amount received; then the shares field 4 lists, of what is left; then the rest divided among the other share-rules in proportion to their parts, leftovers by rule 15a. Every verifier checks every amount. *Cost:* waterfalls, thresholds and user-centric sharing cannot be written; field 7 is useless.
- **(b) The split cMIP's rule computes the amounts** from the plan and its field 7; the core checks conservation, per-stake exactness, fees off the top, fees owed, role evidence. *Cost:* a verifier that has not adopted the split cMIP (or cannot run its RV32IM rule) shows the amounts as unknown, never as wrong; two plans with the same parts can pay differently under two cMIPs (shown before signing, Production rule 15).
- **(c) Both:** the core's meaning applies where field 7 is absent, the cMIP's where it is present. *Cost:* two readings of `part` in one format; every client must know which one it is showing.

**OF9. Whose referral counts: the payer the payment commits to?** *Laid beside it, F193 (Nobody, allegedly, 10 October, "Yes, the loss is minimal"): "the payer whose claim may acknowledge a delivery record is the payer the payment's own commitment names… never the payer a receipt names."* F193 was decided for delivery records; Finance rule 10b still says a referral counts "when it is signed by the payer, in a claim". On every rail that binds the payer the two readings agree, since a claim by anyone else recomputes another commitment and is invalid (payment cMIP, step 5). They differ only on a rail that binds nothing (OF26's third kind).

- **(a) Extend F193 to referrals:** a referral counts only in the claim of the payer the payment commits to; where the commitment names nobody, or the rail binds nothing, no referral counts. *Cost:* on such rails a referrer is never paid; changes rule 10b's wording (CH17).
- **(b) Leave referrals as written.** *Cost:* on a rail that binds nothing, a split service names a puppet as payer in its receipt, the puppet's claim names the service's friend as referrer, and the referral share leaves the owners: Fable's finding 4, one step sideways.

**OF10. Evidence that arrives after the split** (Fable's 4c). The order of events is payment, delivery, the relay's record, then the claim acknowledging it. Rule 20 asks for a split for every incoming receipt; a service that splits at once finds the role unfilled, and the plan's option 0 sends the share to the owners, so "the honest service that splits promptly pays no relay, ever".

- **(a) Hold, then complete.** The plan's held form names a period, `[1, period]`, on the agreement's time reference; the split lists the share as held (split key 9); a **completing split** naming the first (a new key) pays it to the filler whose acknowledged evidence arrived within the period, and after it the share follows a fallback (0 or 2). *Cost:* a second act for such payments; it is a split under the deal, so it takes a number (QF4, DQ6) and changes rule 20's "for every incoming receipt, a split" to "a split, and a completing split where shares were held" (CH22); "within the period" needs the claim anchored (F148's working rule).
- **(b) Wait.** The plan names an evidence window; the service splits only after it, which batching already allows (rule 25); a role with no acknowledged evidence by then is unfilled. *Cost:* every payment waits, and the service holds the owners' money longer (rule 31's trust); "by then" needs the claim anchored, or rests on the service's word.
- **(c) A split is final when made: stated cost.** A prompt split pays no late-evidenced role; owners who want relays paid allow the service to wait (rule 25). *Cost:* 4c stands as written: a plan can advertise a relay share that a prompt service never pays.

*Alongside, smaller (4c):* (i) a delivery record names an object, a size and a nonce, not a payment, so one record can be acknowledged by several claims of one payer for several payments of the same object, earning the share each time. It closes if the buyer's client sets the record's nonce to a tagged hash of the payment's commitment, so the record binds one payment; that changes the relay transport cMIP draft 3 (CH16), and needs the payment made before the fetch. Otherwise it is a stated cost. (ii) Where the paying client is the owners' own, the owners' client decides whether to acknowledge, and keeps the share by not doing so: a stated cost, legible in the plan and the claims (F184: "the choice applied to the builders").

**OF11. Several fillers of one role.** Scenario 2.4f: "Two relays' records acknowledged by one claim both count, the share divided as the plan says." The plan does not say yet.

- **(a) Equally**, leftovers by largest remainder, ties by turns as rule 15a.
- **(b) By the evidence's own measure**, such as a delivery record's size in bytes. *Cost:* a relay that serves a larger copy earns more; a measure only some evidence kinds carry.
- **(c) As the split cMIP says**, the role's `division` naming its rule. *Cost:* unknown to a verifier without the cMIP (as OF8 b).

## 5. A metric's fields (Law rule 28)

### In plain words

**What it is for.** A split may follow plays, views or any metric a module reports; the metric, its module and the resulting payouts are named, so it is legible like any other split; the metric's evidence is a record signed by the identity running the service that measured it, never by the split service, never by a Module (rule 28, F116).

**Who signs what.** The plan names the metric (the owners); the measuring service signs its record; the split names the record and the payouts.

**A story.** Ana, Ben and Carla are three creators in a listening service's catalogue. Their plan with the service divides each month's subscription share by plays, measured by a play-count Module run by an identity they named in the plan. The measurer signs a record for the month: Ana 600 plays, Ben 300, Carla 100. The split names the record and pays Ana 60%, Ben 30%, Carla 10% of the metric share. A record signed by any other identity, or by the split service, divides nothing.

### Exact fields

```cddl
metric = [
  module: hash,              ; the metric Module or cMIP that defines what is counted, by spec hash
  measurer: hash,            ; the identity running the service that measures, named in advance (FR6)
  ? params: any              ; the Module's parameters (what is counted, the period on the time reference)
]
```

A metric share `[3, metric, part]` divides its part among receivers in proportion to the counts of the records the split names (split key 7), each record signed by the metric's measurer; each such payout carries payout key 7.

| Field | From |
| --- | --- |
| module | Rule 28 ("The metric, its module … are named"). |
| measurer | Rule 28 ("a record signed by the identity running the service that measured it, never by the split service, and never by a Module"); F116. |
| params | The pattern `[hash, any]` (time reference, absence proof, clock). |

**FR6.** The measurer is named in the plan, chosen by the owners in advance, as F194 decides for services paid by a named share: the owners choose the witness up front, as they choose keepers (Law's reasoning, "Keepers are chosen up front"). A measurer is not paid by its own record (F194 does not reach it): it weighs a share among others; it is not paid by it.

### Question

**OF13. Who a metric may pay, and who defines its record.**

- *Who may receive.* **(a) Only identities the plan already pays** (its stakes' holders, its named receivers): the record weighs among them and can add nobody. *Cost:* a catalogue that grows needs a new version of the plan for each new creator. **(b) Any identity the record names.** *Cost:* the measurer decides who is paid from the owners' money, the self-evidence F194 refused, one step along (it needs only a puppet in the record).
- *The record's format.* **(c) The core defines it** (a Law act type, `{ 0 => period: any, 1 => [+ [ receiver: hash, count: uint ]] }`). **(d) The metric Module defines it**; the core checks only that its signer is the plan's measurer and its specification the plan's module. *Cost of (d):* a verifier without the Module cannot read the counts and shows the metric payouts as unknown.

*Also changed by the answer:* freeze scenario 7, step 4, says "A play-count module reports listening, with its own signed use record": under F194 and this format it is a metric record, signed by the identity running the play-count service, not a use record and not the Module's (CH8).

## 6. The service's use record (Production rule 17, under F194)

### In plain words

**What it is for.** Since F194: "a service chosen by the owners in advance is paid by a named share, with no evidence; a service chosen by the payer at payment time is paid by a role share only when the payer the payment commits to acknowledges its use record; a service evidenced only by its own record is not paid." The use record is the service's half of a two-signature proof, exactly as the relay's delivery record is (F184, F193).

**Who signs it.** The identity running the service (Production rule 17, F116). It counts only acknowledged by the claim of the payer the payment commits to.

**A story.** Carla runs a subtitle service. Ana and Ben's plan offers 2% to "the subtitle service the buyer used". A buyer's client asks Carla's service for subtitles, receives a use record, and acknowledges it in the buyer's claim; the split pays Carla's identity 2%. Carla signing a record for every sale, with no buyer acknowledging it, earns nothing; nor does a record acknowledged by a payer the receipt names but the payment never committed to (F193).

### Exact fields

```cddl
use-record = {
  0 => hash,                 ; the Module or cMIP the service ran, by spec hash
  1 => hash,                 ; what it served: the locked hash of the media object it worked on   (OF12)
  2 => bstr                  ; the client's nonce, 32 bytes, chosen fresh for this request
}
```

Signed by the identity running the service. A role share for it is `[1, role, [1, spec, type], part]`, naming the use record's own specification and type; where the use record is one core type for every service, the role also needs to name which Module (OF12).

| Field | From |
| --- | --- |
| the record itself, its signer | Production rule 17 and F116 ("a use record signed by the identity running the service"). |
| 0 | Production rule 17 ("the evidence that a Module was used"); rule 22 ("the modules the payment ran through"). |
| 1, 2 | The delivery record's shape (relay transport cMIP draft 3: object, nonce; "The nonce binds the record to one request and carries nothing about who asked"). |
| counts only acknowledged | F194; F193 (which payer); QG3 (whatever cMIP defines it). |

### Question

**OF12. Where the use record is defined, and what binds it to one payment.**

- **(a) Law defines it**, as a new act type (24 or the next free). Every verifier reads it. *Cost:* a fourth core act about evidence; the role must name the Module as well.
- **(b) cMIPs define it**, as the relay transport cMIP defines the delivery record; the core keeps only F194's rule, which applies "whatever cMIP defines it" (QG3), and Production rule 17's "format open" becomes "defined by the cMIP the service runs under". *Cost:* no shared shape; each role names its cMIP's specification and type (the evidence form above already allows it).
- **(c) Production defines it.** *Cost:* Law says "Production defines no tasks and no act types of its own" (Law, "Layer"); that sentence changes (CH10).
- *What it binds to:* the object served (as the delivery record) or the payment (its commitment's hash, as OF10's smaller item proposes for delivery records). *Cost of the object:* one record earns on several payments for the same object; *of the payment:* the service must be asked after paying.

*Also changed by F194 and this format, decided but not written:* Law rule 22's "the identity running a service for its use" and Production rule 17's "it is enough for role shares" (CH7); freeze suite's Production line, "a record the identity running a service signs" (CH8).

## 7. Module fee terms (Law type 15), and Production's specification field 7

### In plain words

**What it is for.** A Module's creator who charges publishes fee terms (Production rule 16); a plan that uses the Module carries a fee entry its bearer signs; a split that omits a declared fee shows it (rule 27); a Module's creator earns only through terms someone signed (F42).

**Who signs it.** The Module's creator (Law act table; Production rule 3).

**A story.** Ben writes a publishing Module and charges 2% of each sale it carries. Ben signs fee terms (2%, paid to Ben's identity) and names them in the Module's specification. Ana's plan for the song names Ben's Module with a fee of 2%, borne by Ana, who signs the plan; each split names the Module among those it ran under, and pays Ben 2%. A split that leaves the fee out is visibly short.

### A flaw in the rules as written

**F-1. Production's field 7 and the fee terms act cannot name each other.** A specification's field 7 holds "fee terms: a standing offer (Law)" by its hash, inside the content the spec hash covers (Production, "The specification format"). If the fee terms act names its Module by spec hash, it must be signed after the specification exists; but the specification must contain the fee terms act's id before its own hash exists. One of the two cannot name the other. The only shape that changes no written rule: **the fee terms name no Module**; the specification names them, and the same fee terms may serve several Modules of one creator. The other shape changes Production's field 7: the fee terms name the Module, and the specification names nothing (CH9).

Also, Production calls fee terms "a standing offer (Law)", and Law gives them a type of their own (15). They are not quite an offer: nobody accepts them by paying; a plan's bearer accepts them by signing.

### Exact fields

```cddl
fee-terms-payload = {
  0 => rate,                 ; what the creator charges
  ? 1 => hash,               ; who is paid: the identity whose pointer receives the fee; absent: the creator who signs
  ? 2 => tstr                ; the terms' words, canonical text
}
rate = [ 0, part: uint ]     ; millionths of each payment the Module runs on
     / [ 1, amount ]         ; a fixed amount per payment
```

| Field | From |
| --- | --- |
| 0 | Rule 27 (a fee as a part of a payment, "one total with an agreed split among the modules"); the plan's `fee` entry's `part`; F42 ("Module creators earn through signed terms"). The fixed amount follows the same need as rule 24a's absolute maximum. |
| 1 | Split payout key 5 ("a fee: the module whose fee it pays, its receiver being key 0"); Production rule 3 (a Module is its creator's only when the creator published it). |
| 2 | Terms' words (field 1) pattern. |

### Question

**OF14. What fee terms are, and whether the plan must match them.**

- *Their type.* **(a) Keep type 15**, and Production's field 7 reads "fee terms (Law type 15)" (CH9). **(b) Fee terms are a standing offer** (type 6) selling a Module's use, and type 15 is retired, never reused. *Cost of (b):* an offer is accepted by paying, fee terms by signing a plan; the offer's fields (under, sold, price) fit badly.
- *Which way they name each other* (F-1): **(c)** the specification names the fee terms, which name no Module (no rule changes), or **(d)** the fee terms name the Module and field 7 is dropped (a Production change).
- *The plan's part.* **(e) Must equal the rate**: a plan paying less omits part of a declared fee, visible as rule 27 says. **(f) Is the parties' and the creator's own business**: the rate is informative, a plan may agree another. *Cost of (f):* nothing shows an undercut fee, and nothing says the creator consented to it.

## 8. How a publisher is marked (Law rule 16)

### In plain words

**What it is for.** "A publisher may hold a stake in its publication, never in the work" (rule 16). A verifier must tell a publisher's stake from an owner's, so that a publisher who carries a work never ends up owning it. F140 left the marking to be settled with the split plan.

**A story.** Ana owns a song. Ben's label publishes it in its own publication. Ben wants 15% of what that publication sells, and nothing of what Ana sells elsewhere. Ana agrees. However it is written, a sale through Ben's publication pays Ben 15% and Ana the rest; a sale through Ana's own publication pays Ana everything; and Ben never holds a share of the song itself.

### What the rules fix, whatever the answer

- A publication is identified by its act id; a work by its work hash (Envelope). A verifier cannot tell the two apart from a bare hash without holding the act.
- A publisher's share applies only to payments for its own publication, so a split must know which publication a payment was for: the receipt's field 5 names the publication, or an offer that sells that publication alone (OF1). An offer selling a work, or several publications, cannot carry a publisher's share.
- Scenario 2 pays publishers by a creator-side fee of their publishing Module (step 3), which needs no stake at all.

### Question

**OF15. How a publisher is marked.**

- **(a) Type the stake's object** in field 7: `[0, work]`, `[1, publication]`, or null (this collective). A stake whose object is a publication is a publication stake; it is paid only on payments for that publication; a verifier tells them apart without holding the act. *Cost:* changes the exact stakes format (CH11); every agreement already written in tests is re-encoded.
- **(b) Mark the holder**: a holding may say "as publisher", valid only where the stake's object is a publication the holder signed. *Cost:* also changes the stakes format (CH11); the verifier must hold the publication to check it.
- **(c) No publisher stakes: a position.** The publisher is paid by a named receiver share that applies only to payments for its publication (`[2, receiver, part, only-for: [+ hash]]`); "never in the work" then holds by construction, since a position confers income without ownership (rule 4). *Cost:* rule 16's "may hold a stake in its publication" becomes "is paid by a position" (CH12); a position cannot be sold by a stake transfer.
- **(d) No publisher shares in the plan at all**: publishers are paid by creator-side fees of their publishing cMIPs, as scenario 2 does. *Cost:* rule 16 is withdrawn; a publisher's cut follows the Module, not the publication.

---

# Part C. Owning

## 9. The work claim (Law type 3)

### In plain words

**What it is for.** Who made a work: authorship, not ownership. "A work is bound to its creators only by an explicit work claim: a sole creator alone; several creators by one creator's claim completed by signature acts from all the others, and bound only when all are present" (rule 15). A publication claims nothing. The core records claims and their order, never legitimacy; where claims conflict, anchoring or a keeper orders them where they meet, otherwise they stay openly contested. A work-claim cMIP (task 13) may carry a pre-publication commitment. Ownership is elsewhere: the stakes of the claiming agreement (rule 15b, N12). A release to the public domain lists the work claims as "its creators' history" (release field 2).

*Wording hazard, noted:* "claim" names two things in the texts: the **work claim** (this act, authorship) and **the claim a purchase pays under** (the claiming agreement, ownership: Finance field 9, rule 32a). The formats keep them apart; the texts might say "work claim" and "claiming agreement" every time.

**Who signs it.** One creator; the others add signature acts naming it. A collective creator signs by its own rules (an act in its name, done).

**A story.** Ana and Ben write a song. Ana signs a work claim: the song's work hash, Ana and Ben as creators, and a commitment Ana's claim cMIP anchored before the song was published. Ben adds a signature act; the song is bound to both. Months later a stranger claims the same work hash. Both claims are shown, contested; where both are anchored on the same reference, Ana's earlier commitment shows priority. Who owns the song, and who is paid, is Ana and Ben's deal, not the claim.

### Exact fields

```cddl
work-claim-payload = {
  0 => hash,                 ; the work hash (Envelope, "Work hash")
  1 => [+ hash],             ; the creators: identities, ascending, none twice, the signer among them
  ? 2 => [ hash, any ]       ; a work-claim cMIP (task 13) and what it produces for this claim: a pre-publication commitment
}
```

Signed by one creator; bound when every other creator listed has a valid signature act naming it (type 1, field 0). Its `objects`: OF18.

| Field | From |
| --- | --- |
| 0 | Rule 15; the definition ("An act binding a work's hash to its creators"); Envelope, "Work hash". |
| 1 | Rule 15 ("several creators by one creator's claim completed by signature acts from all the others, and bound only when all are present"): the claim must name whom it waits for. |
| 2 | Rule 15 ("a claim cMIP MAY carry a pre-publication commitment"); task 13; the pattern `[hash, any]`. |

**CH1 again:** the signature act's field 0 lists what may be signed (terms, a clone, an act of a collective an area reaches, a grant within an area, a declaration); a work claim joins it, as the definition of a signature already lists "a transfer, a release".

### Questions

**OF16. Public, or private by default like every Law act?** Scenario 2 passes only if "conflicting claims are visible and ordered where possible"; the release, which ends a claim, is public.

- **(a) A work claim counts only if public.** *Cost:* a creator cannot claim quietly; secrecy before publication is what the pre-publication commitment (field 2) is for.
- **(b) Private allowed**, shown to whom it is disclosed. *Cost:* a claim kept back and revealed later, with an early anchor, wins priority at its reveal: the "kept for later" shape that broke absence twice (F148, F166), here on authorship.

**OF17. Creators' roles.** No rule names roles (composer, lyricist, director).

- **(a) None**: credits are words elsewhere (a publication's media, the terms' words). **(b) An optional label per creator**, canonical text, shown and never checked. *Cost of (b):* text that looks binding and is not, which F104's reasoning warns against ("A field every agreement carries should never be free text that looks binding and is not").

## 10. The stake transfer (Law type 4)

### In plain words

**What it is for.** A stake is sold or given by a transfer signed by the seller and completed by the buyer's signature; it names the work's chain and the agreement's chain; other holders are notified, not asked; the new holder inherits the full position; the transfer chain on the agreement names the current holder of each stake, and a split service MUST follow it (rule 14, F73). A member who wants to give income to another transfers part of a stake (N10). A creditor may take stakes instead of payment (rule 47b).

**Who signs it.** The seller, with its own key (a collective seller: an act in its name, done, by its Law lane or an area reaching type 4); the buyer completes it with a signature act naming it.

**A story.** Ben sells half of the 400,000 Ben holds in the song's stake to Carla. Ben signs a transfer of 200,000 to Carla; Carla signs a signature act accepting it; Ana is notified. From the first split that follows the transfer, the service pays Ana 600,000, Ben 200,000 and Carla 200,000 of the stake's share of each payment, and the split says which transfer it followed. When Ana and Ben later sign a new version of the deal, its stakes list Carla, or the version lowers Carla's share and needs Carla's signature (rule 45).

### Exact fields

```cddl
transfer-payload = {
  0 => hash,                 ; the version of the agreement that defines the stake
  1 => uint,                 ; the stake, by its index in that version's field 7
  2 => hash,                 ; to: the new holder
  3 => uint,                 ; how much, in millionths of the stake: above zero, at most what the signer holds of it
  ? 4 => [+ hash]            ; what the seller took for it, for the record: receipts, an agreement; never checked
}
```

Completed by the buyer's signature act (type 1) naming it. Its `objects`: OF18.

| Field | From |
| --- | --- |
| 0, 1 | Rule 14; the definition of a stake ("identified by the agreement and its index in the stakes list"). |
| 2 | Rule 14 ("completed by the buyer's signature"; "the new holder inherits the full position"). |
| 3 | Rule 15a (millionths); N10 ("transfers part of a stake"); rule 13 (a change to a stake's size needs its holder's signature: here the seller's own). |
| 4 | Rule 47b ("its assets can go to its creditors by sale or by stake transfers"); the creditor's release's field 1, the same "for the record, never checked". |

**FR7.** Across versions a stake is followed by its object, which each version names once (field 7: "Each stake names its object once"); its index may differ from version to version. A transfer naming a version that a later version has replaced applies to the stake with the same object there.

**FR8.** A version of the agreement made after a transfer carries the holders the transfer chain names; a version that does not, lowers the new holder's share, and is a draft until the new holder signs it (rule 45: "every holder whose share of a stake it drops or lowers has one too, member or not"). This needs no new rule.

**What it unlocks:** the closing's "holds nothing" can see a stake sold (Law, "Closing": "a stake sold by a transfer … is not seen, so a collective that sold one is shown as still holding it"); the split's check of holders follows transfers (rule 26).

### Questions

**OF18. Which chains a transfer names.** Rule 14 says "the work's chain and the agreement's chain" (and Envelope's commentary, F81, uses it as its example). Two things stand in the way. A transfer cannot be a step of the agreement's own chain: two acts naming the same predecessor there are a fork (rule 5), so every transfer racing a clone would fork the deal. And no act roots "the work's chain": a work hash is not an act.

- **(a) A chain per stake.** A transfer names the agreement as `[agreement, agreement]` (never a fork, as a signature does) and, as its second entry, the stake's previous transfer, or the version for the first; two transfers naming the same previous one are a double sale, a fork, visible. The work's chain is rooted at the work claim (OF16) where one exists, named as `[claim, claim]`. *Cost:* where no work claim exists the transfer names only the agreement; rule 14's "the work's chain" becomes "the work claim's chain, where one exists" (CH13).
- **(b) Drop the work's chain**: a transfer names the agreement and the stake's previous transfer only. *Cost:* someone following a work, not its deal, does not see its stakes move; rule 14 and Envelope's example change (CH13).
- **(c) A chain rooted at the work hash itself.** *Cost:* changes Envelope's `object` ("the chain's root act") for one case.

**OF19. When a split follows a transfer, and what the buyer inherits.** MOR has no clock. A split names the version it pays under (field 3) but not which transfers it saw, so two verifiers holding different transfers would judge one split differently, against F137 ("the same answer for every verifier, with its inputs").

- **(a) Splits cite the transfers they follow** (split key 8: per stake, the latest transfer). A transfer counts for splits from the first split citing it; a split citing an older transfer than one the same service already cited for that stake is a deviation that breaks the plan, as a tally reset is (rule 15a, F171). The buyer's client raises the alarm when a split it receives after the transfer was delivered still cites the old head. *Cost:* one more field per stake on every split; between the transfer and the first split citing it, the seller is paid, at the service's pace.
- **(b) The transfer names a point on the time reference** from which it applies. *Cost:* the agreement must have a time reference, and every split's payment must be placed against the point (anchoring, F148's working rule).
- **(c) Stated cost:** the service decides when it follows; the holders see it in the splits.

*And the leftover count* (split key 4, F165): **(d)** a buyer of a whole holding inherits the seller's count ("the new holder inherits the full position"), and a buyer of part starts at zero, as a new holder does (F182); or **(e)** every buyer starts at zero. *Cost of (e):* selling a holding resets its turn for ties, which a seller and buyer can use to take a tied unit twice.

---

# Part D. Living together

## 11. The concurrency rule (terms field 10)

### In plain words

**What it is for.** In a collective, two areas, or two devices, may each write a complete clone from the same version on lines neither of which is before the other: a fork of records. The concurrency rule says which clone is in force. Without one, the parent stays in force until a clone of one branch, recorded after both lines, resolves it (rules 37c, 47; B11). It is a judicial clause every member signs (rule 46a; "protected clauses").

**Who signs it.** Every member, as the whole judicial tier (rule 46a).

**A story.** Ana holds the Finance area of their collective, Ben the area of its words. On two devices, Ana's record adopts a new payment cMIP, Ben's record changes the area's words, each from the same version, neither citing the other. Without a concurrency rule both wait on the old version until someone records a clone of one branch after both lines. With one, a single answer, the same for every verifier, says which of the two is in force from those lines on; the other can be signed again on top of it.

### What the rules already exclude

- **The keepers' order.** "Keepers place only the collective's own acts: never … one line against another, which only the collective's tips order" (Law's C4).
- **A hash, or arrival.** A tie decided by a hash can be ground by whoever signs (F165's finding), and the order acts arrive in must never show through (IC7). DQ8: "never an automatic 'first wins'".
- **For deals.** Rule 45b says rule 47 applies to collectives only; a deal's forks are settled by field 26 and the judge of forks (field 27). **FR9:** terms of a deal carrying field 10 are invalid, as those carrying fields 18, 19 and 20 are (CH15).

### Exact fields, by option

```cddl
concurrency-rule = [ 0, judge: hash ]     ; (a) an identity among field 13 selects, on a request
                 / [ 1 ]                  ; (b) the power that brought each clone in decides
```

### Question

**OF20. What the concurrency rule may say.**

- **(a) A judge.** An identity among field 13 (arbitrators or verifiers) selects one clone, once activated by a member's signed request (OF24), as the judge of forks does for a deal (field 27, DQ8, QF2); it follows the chain of judgment (QG4) and speaks once per fork (F192). *Cost:* a third party decides between two members' valid changes; a silent judge leaves the parent in force until the chain passes.
- **(b) Precedence by power.** The clone whose mark names the stronger power is in force: the constitutional change rule, then the judicial tier's rule, then the clone rule, then an area's power; between two areas, the founders' order of areas in field 19. Mechanical and the same for every verifier. *Cost:* a clone needing a stronger power always wins, so a member who can meet the clone rule can override an area holder's concurrent change by writing any operational change; the area order is a new meaning for field 19's order, which today decides nothing (areas are followed by id, Law's Q32).
- **(c) Only the default**: no format; field 10 is withdrawn and rule 47's default stands for every collective. *Cost:* every fork of records waits for a resolving clone; nothing is lost, only time.

## 12. The import (Law type 11)

### In plain words

**What it is for.** "The grantor's import act lists acts of an ended grant it adopts into its own chain" (rule 41). An act a grant key signed after its grant ended, or racing the revocation, is void (the tie rule, rule 40), unless the grantor adopts it by an act of its own key that counts: "acknowledging it, citing it, paying on it or importing it" (rule 40). The handover is withdrawn (F129, H3): another grantee then manages the act under its own grant. The import is one of four ways to adopt.

**Who signs it.** The grantor, with its own key (for a collective, an act of its own key that counts: done, on its chain; no grant key adopts anything, rule 40).

**A story.** Ben was the collective's agent, holding a grant key. The collective revoked the grant; on a device that had not seen the revocation, Ben signed a deal with Carla, racing it: void. Ana and the others want the deal. The collective signs an import listing Ben's act; from then on the deal binds the collective, and another grantee manages it under its own grant.

### Exact fields

```cddl
import-payload = {
  0 => [+ hash]              ; the acts adopted, each signed with a grant key of the grantor, ascending, none twice
}
```

An action of the grantor's chain: for a collective, it cites its decision and heads in `objects` as every action does (rule 35b), and each act it imports as a citation of the collective's chain, so its history holds them (F131 IT2a; U3: "cites" is "holds in its history").

| Field | From |
| --- | --- |
| 0 | Rule 41 ("lists acts of an ended grant it adopts"); rule 40 (adoption by the grantor's own key); rule 42 (an adoption counts only as an act of the collective's own key that counts). |

### Question

**OF22. Keep the import, or retire it?** *Laid beside it, H3 (F129): "Adoption already does the job, visibly; a second mechanism would have no purpose of its own."* Since F131 (IT2a) citing an act adopts it; the import does nothing a citation does not.

- **(a) Keep it**, as above: an explicit act saying "we take these on", which a client can show as a deliberate adoption rather than a citation made for another reason. *Cost:* two ways to do one thing, both to be built and tested.
- **(b) Retire type 11**, never reused: adoption is by acknowledging, citing or paying on. *Cost:* rule 40, rule 41, core v21 (twice: "acknowledges, pays on or imports it") and freeze checklist line "import (3)" change (CH25).

## 13. Liveness (Law type 12)

### In plain words

**What it is for.** "A party with nothing else to sign shows presence with a liveness act" (rule 50). Since F172 presence is never proven by time in the core: whether a party is gone is the judgment of the authority the clause names, or, where the clause names one, of an absence-proof cMIP, which "may use anchors, liveness acts and acknowledgements as it defines" (task 14).

**Who signs it.** The party, with its own key.

**A story.** Carla is a party to Ana and Ben's film deal and has had nothing to sign for months. Carla's client signs a liveness act on the deal and anchors it; when a keeper's operator later considers declaring Carla absent, the act is there to see, and an absence-proof cMIP the clause names would refuse the declaration.

### Exact fields

```cddl
liveness-payload = {
  0 => hash                  ; the agreement, any version of it, on which the party shows presence
}
```

Its inside names, in `objects`, that version as both chain and predecessor, `[[agreement, agreement]]`: it follows the agreement and is never a fork, as a resignation does.

| Field | From |
| --- | --- |
| 0 | Rule 50; rule 49 ("Absence means absence from duty: no act by the party on the agreement"); F162 item 5's presence (acts naming any version), now an absence-proof cMIP's to use (F172). |

**FR10.** In a collective, a member's liveness act counts for the collective only where the collective places it: an act of the collective acknowledging it, or a keeper recording it, before the line (task 14: "acts of the party the collective acknowledged or a keeper recorded before the line"; "Made before, made after", 2). Its client delivers it to the collective (client conformance).

### Question

**OF23. To whom a liveness act must be shown.**

- **(a) Public, or addressed to the authority** (and the collective), as a declaration must be public or addressed to the member it names (F189, 8). *Cost:* a party's presence on a private deal becomes visible to whoever it is addressed to, or to all.
- **(b) The party's choice**, private by default like every Law act. *Cost:* a liveness act nobody but the party holds proves nothing; the party must deliver it where it matters, by client conformance.

## 14. The keeper record (Law type 2)

### In plain words

**What it is for.** A keeper is a relay named by an agreement to record the acts around a deal as they arrive, and to sign what it recorded: "a notary stamping sealed envelopes" (definition). It records act ids and signers, never content (rule 12). A record counts only alongside the act it names (rule 11a); one that sits before the keeper's own record of a rotation keeps an act the rotation left out visible as disputed rather than void (rule 11); keepers place a collective's own acts a line left out (Law's C4); in a deal, a declaration draws its own line as the keepers record it (Law's Q28); and an arbitrator settling a deal's fork weighs "the keepers' record of who signed what, and in what order" (DQ8). Today the library takes keepers' logs as a list the caller states.

**Who signs it.** The keeper's operator, as an everyday act in its own sequence: position, running summary and `prev` order and hash-link the records (Envelope rule 4; Law rule 9).

**A story.** Ana and Ben's film deal names Carla's relay as its keeper. Each act around the deal arrives at Carla's relay; it checks the signer's homes, and signs a record naming the act's id and signer. Ben's key is stolen; the thief signs a transfer; Ben rotates and disowns it. Carla's record of the transfer sits before Carla's record of Ben's rotation, so the transfer stays visible as disputed, never valid and never silently gone.

### Exact fields

```cddl
keeper-record-payload = {
  0 => [+ [ act: hash, signer: hash ]]   ; the acts recorded, each by its id and the signer its outside names
                                         ;   (for a genesis, which names none, the identity it founds)
}
```

| Field | From |
| --- | --- |
| 0 | Rule 7 ("records the deal and the acts around it as they arrive, in its operator's sequence, and signs each record"); rule 12 and the definition ("records act ids and signers, never content"); rule 10 ("records any rotation it sees", a rotation being an act with an id and a signer like any other). |
| the record being an everyday act | Rule 9 ("signed and hash-linked"); rule 11 ("in the keeper's sequence"). |

### Question

**OF21. One act per record, or several; and who may see it.**

- *Order.* **(a) One act per record**: the keeper's sequence is the order. **(b) Several, in the order listed**: an act listed before a rotation in one record counts as recorded before it. **(c) Several, all at once**: acts in one record are neither before nor after each other, so an act and a rotation in one record leave the act unprotected. *Cost:* (a) more acts; (b) the keeper chooses an order inside a record it signs at once, the trust rule 11a states; (c) a keeper batching fast loses its use exactly when a theft happens.
- *Visibility.* **(d) Public**, copyable anywhere (rule 9). *Cost:* anyone learns that these identities signed acts at this keeper, in this order: metadata about private deals. **(e) Private**, delivered to the parties of the agreements kept. *Cost:* a keeper sees only outsides, so it must be told whom to deliver to; a party who loses its copy depends on the others' (rule 9's promise holds only among them).

## 15. The contest, beyond a declaration of absence (Law type 14)

### In plain words

**What it is for.** A contest is a signed objection to an act, by someone with standing: a party to its agreement, a holder of a stake it affects, or a keeper, arbitrator or verifier the agreement names (rule 57a). It changes nothing; it makes disagreement visible. Its format is written for one case only, a declaration of absence answered by the party it names (BQ4); every other contest "keeps its format open: as new needs are discovered the grammar needs definition" (Nobody, allegedly, BQ4).

**This set discovers a need.** Rule 15b: a publication or standing offer for a claimed work, not signed under the claiming agreement, is valid and "the claim's holders contest it"; scenario 2, step 1: "the musician's contest is visible". A second: a second work claim on the same work (rule 15, "openly contested").

**A story.** Ben, co-owner of the song, publishes it alone under a plan paying only Ben. Ana, holding the other half of the stake, signs a contest naming Ben's offer. Every client showing the offer shows Ana's contest beside it; the offer stays valid, and buyers see the dispute before paying.

### Exact fields (the generalization)

```cddl
contest-payload = {
  0 => hash                  ; the act contested
}
```

Signed by anyone with standing (rule 57a) for the act named; its inside names that act as chain and predecessor, `[[act, act]]`, as the absence form does. The absence form is this one where the act is a declaration of absence and the signer the party it names; for that case BQ4's rule stands (signed by anyone else, it shows nothing).

### Question

**OF25. Write the general contest now, or keep it open?** **(a) Now**, as above, since rule 15b and rule 15 need it for offers, publications and conflicting work claims. *Cost:* standing must be computed for each kind of act contested (for an offer, the holders of the stake it affects). **(b) Keep it open** until a build needs it, as BQ4 decided. *Cost:* scenario 2's "the musician's contest is visible" cannot be built; an offer outside the claim is shown only as outside, with no signed objection.

## 16. The signed request to a judge (rule 34a)

### In plain words

**What it is for.** A judge that does not act within its period passes the question to the next in the chain of judgment; "the period runs from a signed request to the judge by someone with standing" (rule 34a, N6). For specifications (condition evaluation, time reference, anchoring, absence proof) a request is not needed: they always answer. For identities (a keeper's operator, an arbitrator or verifier, the abandonment authority, the split service), nothing can start the period, so no chain can ever pass: the request has no format. The settlement request (type 22) is the one written case: a party asking the judge of forks to settle a deal's fork.

**Who signs it.** Anyone with standing (rule 57a).

**A story.** Ana and Ben's film deal names Carla as arbitrator for milestones, with a second arbitrator in the chain, thirty days each. Ana signs a request to Carla naming the disputed milestone; thirty days pass on the deal's time reference with no answer from Carla; the second arbitrator may now decide, and an answer Carla gives after that counts for nothing in this question.

### Exact fields

```cddl
judge-request-payload = {
  0 => hash,                 ; the version of the agreement whose chain of judgment (field 21) names the judge
  1 => judge,                ; the judge asked, in the terms' `judge` form
  2 => hash                  ; what it is asked about: the act in question (a milestone's act, a payout, a declaration)
}
```

Its inside names the agreement version as chain and predecessor, `[[agreement, agreement]]`, never a fork.

| Field | From |
| --- | --- |
| 0, 1 | Rule 34a; terms field 21 and the `judge` form. |
| 2 | Rule 34a ("in that question": the answer after the period counts for nothing in that question, so the request must name the question). |

### Question

**OF24. A general type, or type 22 widened; and the judges' answers.**

- **(a) A new type** (24 or the next free), as above; type 22 stays the fork case. **(b) Type 22 widened**: its field 0 becomes the agreement, with fields 1 and 2 as above, the fork case being the judge of forks and the reference (CH18). *Cost of (b):* type 22 is already built and tested with one field.
- *And:* an identity judge's **answer** has a format only for forks (type 23) and absence (type 13). An arbitrator's decision on a milestone (scenario 1, step 8) has none. Either it is left to the condition cMIP the agreement names (task 9: "true, false, pending or unknown"), the arbitrator signing an act of that cMIP; or Law defines a decision act. Decide with this question, or record it as open for step 15.

---

# Part E. Rails and units

## 17. A rail Module's kind and binding (F140 item 1, F168 item 12)

### In plain words

**What it is for.** Two of Finance's rules depend on what kind of rail a payment ran on. Rule 10c: on a **request rail** (the payee's side commits to each payment before it is made) the claim a purchase names is the one the seller's request committed to; on a **push rail** (the payer pays an address with no request) each holder settles on its own chain (W4). Rule 10: where a rail binds payee and purpose, the payment's commitment decides a disagreement; where it binds nothing, the payer's claim decides (F151), and a payer can relabel a payment later (F168's stated cost). F140 item 1: "a rail Module declares in its specification whether it is a request or a push rail, in a field clients read". F168 item 12: "a rail Module declares whether it binds them (FORMAT OPEN)". Today the library reads the kind from the Module (step 12a), and a verifier is otherwise told.

**Who signs it.** Nobody signs a rail's kind: it is part of the Module's specification, published by its creator (Production rule 3).

**A story.** Ana sells a song over Lightning (a request rail: Ana's side signs each invoice's commitment); Ben accepts on-chain payments at a published Taproot address with each payment's commitment tweaked in (also a request rail, step 12a); Carla's rail is a bank transfer where the payer types a reference the bank does not check (a push rail binding nothing). Every client reads the three kinds from the three Modules' specifications, and applies rules 10 and 10c the same way.

### Exact fields

```cddl
rail-kind = 0                ; a request rail: the payee's side commits to each payment's commitment, so the rail binds payee and purpose
          / 1                ; a push rail binding the commitment: the payer binds it in the payment as the Module defines
          / 2                ; a push rail binding nothing
```

| Value | From |
| --- | --- |
| 0 | Payment cMIP, rail Modules item 3 and "The payment commitment" (the payee's side issues each receiving address for one commitment, which names payee and purpose); Finance rule 10c; the on-chain Module ("request rail, binding payee and purpose"). **FR11:** a request rail always binds payee and purpose, since the commitment names both; no fourth value is needed. |
| 1 | Payment cMIP item 3 ("On a push rail … the Module says where the payer binds the commitment"). |
| 2 | Finance rule 10 (F151, F168: "where the rail binds no payee or purpose"). |

### Question

**OF26. Where the kind is declared.**

- **(a) A new field of Production's specification format** (11), read only for a Module implementing a payment cMIP. Every verifier reads it, as QG3 asks ("no verifier needs telling"). *Cost:* Production's format names a Finance notion (it already depends on Finance); CH19.
- **(b) A generic field** (11) for "what the cMIP it implements asks it to declare", `{ * uint => any }`, whose keys the payment cMIP defines (key 0, the rail's kind). *Cost:* rules 10 and 10c, which are core, would rest on a field whose meaning a cMIP defines; a verifier without the payment cMIP cannot read it, and shows the payment's standing as unknown.
- **(c) In the payment cMIP's own list** of its rail Modules. *Cost:* a cMIP is frozen at publication (Production rule 4), so a new rail would need a new payment cMIP, against F112's reason for rails being Modules.

## 18. The unit specification

### In plain words

**What it is for.** A unit is what an amount is counted in, in its smallest part; it is "a small specification of its own, which rail Modules reference, so the same unit has one name on every rail that carries it" (Finance). Production's specification format already gives it a kind (2). Finance lists "the unit specification format" as an open parameter; the Bitcoin units draft says "each text below is the whole of its specification for now". No rule reads anything from a unit but its hash: amounts compare by unit hash, vault limits are per unit hash.

**A story.** Ana's vault has an entry for the satoshi; Ben's wallet holds regtest satoshis, which are a different unit with a different hash (Finance, "One name per unit"). Ben's payment in regtest satoshis is refused by Ana's wallet rule (14a), whatever the number says.

### Exact fields

A unit is a Production specification of kind 2 carrying fields 0, 1 and 9 (kind, creator, text), and nothing else.

### Question

**OF27. Anything machine-read in a unit?** **(a) Nothing**: the text says what the unit is; every rule reads only its hash. **(b) Display fields** (a symbol, the number of decimal places a person reads). *Cost of (b):* a field nothing checks, which a hostile unit can make misleading (a "dollar" symbol on a token); client conformance would have to show the hash beside it.

---

# Part F. Formats the decisions of 10 October imply

Two decisions of 9 and 10 October need fields that are not written yet. They are not "format open" in the texts, because the texts do not yet carry the decisions; they are listed so the set is whole.

**The closing's list of debts left open** (QG1, F191: "the closing act names every such obligation it leaves open"; F197: a debt to a payer who gave no address, after a notice, "the debt named in the closing act and visible, unpaid"). Built straight from the decisions:

```cddl
closing-payload = {
  ; keys 0 to 3 as written (the agreement, the collective, its chain act, its kept tips: the line)
  ? 4 => [+ [ obligation: hash, ? notice: hash ]]   ; the debts it leaves open, ascending, none twice: money owed back
                                                    ;   to nobody (QG1), or to a payer with no address after a notice (F197)
}
```

**The notice before closing** (F197: "before closing, the collective sends the payer a notice sealed to their identity, with a deadline on a time reference, asking where the money should go. The notice's conditions (its deadline, how it was sent) are visible"). Its fields, from the decision: the obligation; the deadline, a point on the collective's time reference; sealed to the payer (Envelope `to`). The closing that names the debt cites it, so whoever checks the closing must obtain it, as a declaration reaches its member through the act that uses it (F189, 8).

```cddl
notice-payload = {
  0 => hash,                 ; the obligation owed back
  1 => any,                  ; the deadline: a point on the collective's time reference
  ? 2 => tstr                ; the words: what the payer is asked to do
}
```

**OF28. The notice: a Law act, or a text message?** **(a) A Law act** (24 or the next free), as above. *Cost:* one more type. **(b) An ordinary text message to the payer's inbox**, as Finance 14b's spontaneous payer's message is ("a text act like any other: it creates no obligation and no act type"), the closing citing it in `refs`. *Cost:* a text act has no fields: the deadline is in words, so nothing can check that the closing came after it, and "the degree of that good faith depends on the conditions of the notice" (Nobody, allegedly, F197) is left to a reader's eye.

---

# The set as a whole

## Where one format constrains another

**X1. What an offer names decides whether a relay is ever paid on a purchase** (Fable's 4b). Rule 22 counts a delivery record only where "the object it names is the one the payment was for". A purchase following an offer names the offer in its field 5, so the object is whatever the offer says it sells (OF1). Publications give an exact answer; a work gives "any publication carrying it", a stranger's republication included; access gives none the core can read. Which payer may acknowledge is already decided and does not depend on the offer: the payer the payment's commitment names (F193).

**X2. Which claim a purchase may name, when an offer is "outside the claiming agreement"** (OF2, tension T-1). Rule 15b and scenario 2, step 1, let a co-owner sell a claimed work alone under its own plan: "every rule holds… nothing is prevented". Since F126, Finance rule 10c says a payment for a claimed work "naming … a claim that is not the work's current one, is no purchase: … owed back". With two agreements holding stakes in one work, the texts do not say which is "the work's current one". The offer format makes this concrete: its field 0 names one agreement. As built, the library treats every agreement holding a stake in the work as a claim a purchase may name. This is a question of principle beside the formats, and the offer's signing rule (OF3) depends on it.

**X3. The offer unlocks the split service's receipts under it** (H5, F129, F130). A split service's grant key signs receipts "for money coming in under the grantor's own claims and offers"; reading 4 refuses a receipt following an offer "whose format is open". With the offer's fields 0 and 3, the check is exact: the offer's payee is the grantor and its field 0 is the grantor's own claim. In a deal, the offer's payee must be a payee whose grant field 14 lists, or no service can receipt for it.

**X4. A publisher's share needs to know which publication was bought** (OF15). Whatever marks a publisher, its share applies only to payments for its publication, so a payment must name that publication, in field 5 directly or through an offer that sells it alone. An offer selling a work, or several publications, cannot carry a publisher's share: OF1 and OF15 should be decided knowing this.

**X5. Time appears three times on the selling side, all on one reference.** An offer's `until` (OF4), refund terms (OF7) and a held role share's period (OF10 a) each express a time, so each needs the agreement's one time reference (Q31) and, by F148's working rule, anchoring for what depends on it: the payer's client anchors its claim. On a request rail the seller's request settles most of it, as for W4 (rule 32a).

**X6. A lapsed refund meets the closing.** A refund past its terms is neither fulfilled nor released, which is what a closing's "owes nothing" asks (Law, "Closing (type 20)"). OF7 asks whether lapsing counts as ending; the closing's list of debts left open (Part F) is the other path, decided for money owed to nobody (QG1) and to a payer with no address after a notice (F197).

**X7. The three kinds of evidence are one rule for relays and services.** After F184, F193, QG3 and F194, a relay's delivery record and a service's use record follow the same rule: a third party's act, acknowledged by the claim of the payer the payment commits to. The plan's evidence kind `[1, spec, type]` names the act's specification and type, so every verifier reads the same answer without being told which cMIP is which: QG3's aim, and the end of Fable's 4d. The referral is the second kind, and whether its payer is also the committed payer is OF9. The rail Module is the third (F119), the one exception where the split service's own receipt counts, because the payee named the Module publicly.

**X8. Late evidence touches four formats** (Fable's 4c). Whatever OF10 decides reaches the plan (the held form), the split (key 9, and perhaps a completing split), the numbering of a deal's splits (QF4, DQ6: a completing split is a split and needs a number, or is exempt by rule), and possibly the relay transport cMIP's delivery record (a nonce binding it to one payment). The tally chain of leftovers (F165, F171) is untouched: a held role share is not a stake.

**X9. Transfers, splits and clones must agree on who holds a stake.** Splits pay "the plan's stakes as currently held" (rule 26), and holders "follow transfers" (Law's reasoning: "two services compute the same answer"). Without clocks, that needs the split to cite the transfer it follows (OF19 a), as it already cites the previous split for leftovers (rule 15a). A clone after a transfer must list the new holder or wait for its signature (FR8, rule 45, no new rule). A fork already "transfers the original's stake in each work, as a stake transfer" (rule 47a): **FR12:** under OF18 (a), a fork act is a link of each stake's transfer chain it divides, so a successor's later transfer names the fork as its previous link.

**X10. The work claim may root the work's chain** (OF16, OF18). Rule 14 wants a transfer on "the work's chain"; the only act that could root it is a work claim, and only if claims are public (OF16 a), or a hidden root would surface later. The release's field 2 already names the work claims as "its creators' history".

**X11. A judge in the concurrency rule needs the request to a judge.** If OF20 takes a judge, it needs a signed request to start its period (OF24), the chain of judgment (QG4), and F192's "any judge speaks once per fork". The deal's judge of forks (fields 27, types 22 and 23) is the model; widening type 22 (OF24 b) would serve both.

**X12. The keeper record must not order lines.** Whatever the keeper record carries, rule C4 of Law (keepers "never … one line against another") and the deals' Q28 (a declaration draws its own line, as the keepers record it) stay as written; this is why the keepers' order is excluded from the concurrency rule (OF20), and why OF21's ordering inside one record matters for rule 11.

**X13. A Module can be paid two ways.** A fee in the plan (rule 27) and a rail Module's role share (F119) can both name the same Module; a plan doing both pays it twice, which the client shows before signing (Production rule 15). No rule forbids it; the formats keep the two apart (`fee` and `[1, role, [2], part]`).

**X14. The rail's kind reaches three questions.** A push rail binding nothing is where a referral's payer matters (OF9), where "until" is undetermined without anchors (OF4), and where a payer can relabel a payment (Finance rule 10, F168). OF26 decides only where the kind is written; its values are fixed by rules already decided.

**X15. The signature act signs more things.** Its field 0 lists what may be signed: terms, a clone, an act of a collective an area reaches, a grant within an area, a declaration. The formats add a work claim (always), a transfer's acceptance (always; the definition already says "a transfer, a release") and, if OF3 (a), a standing offer.

**X16. Adoption by import or by citation** (OF22): since F131 (IT2a) a citation adopts; the import is the same adoption with a name.

**X17. Grant limits the core cannot read.** Not a format of this set (task 12 is a cMIP's), but the MUST audit asked whether an act under a grant whose limits a verifier cannot read should be refused; as built it is backed as unknown. The offer and transfer formats do not change this; it is recorded here so the set is read with it.

## Rules and formats already written that these formats would change

Each is flagged for Nobody, allegedly; none is changed by this document.

| # | What would change | Why | Depends on |
| --- | --- | --- | --- |
| CH1 | Signature (type 1) field 0's list of what may be signed | work claims and transfers are completed by signature acts (rules 14, 15); offers too if OF3 (a) or (c) | always; OF3 |
| CH2 | "What a split service's grant key may sign", reading 4 (a receipt following an offer refused) | lifts once the offer has a format (X3) | OF1, OF3 |
| CH3 | Rule 32's "the offer's terms MAY say how long a refund stays claimable" | read as the claiming agreement's field 17 (FR1) | FR1 |
| CH4 | The closing's "owes nothing" (Law, "Closing (type 20)") | a refund past its terms counts as ended, or is named in the closing | OF7 |
| CH5 | The split's exact format (type 8) | gains keys 6 to 9 and payout key 7 (rules 14, 27, 28; 4c) | OF10, OF13, OF19 |
| CH6 | The split plan's sketch | a role share gains its evidence kind and division; `unfilled` [1] may gain a period | always; OF10, OF11 |
| CH7 | Law rule 22's "the identity running a service for its use"; Production rule 17's "it is enough for role shares" | F194, decided 10 October, not yet written | always |
| CH8 | Freeze scenario 7, step 4 ("its own signed use record"); the suite's Production line ("a record the identity running a service signs") | a play count is a metric record (rule 28), and a service's own record no longer pays it (F194) | always |
| CH9 | Production's specification field 7 ("fee terms: a standing offer (Law)") | flaw F-1, and Law's own type 15 | OF14 |
| CH10 | Law, "Layer": "Production defines no tasks and no act types of its own" | only if the use record goes to Production | OF12 (c) |
| CH11 | Terms field 7, the stakes format (exact) | a typed object or a publisher mark | OF15 (a), (b) |
| CH12 | Law rule 16 | a publisher paid by a position, or by fees only | OF15 (c), (d) |
| CH13 | Law rule 14's "the work's chain", and Envelope's commentary on `objects` (F81) | no act roots a work's chain | OF18 |
| CH14 | Envelope's withdrawal (rule 15, the types table) | if a withdrawal also withdraws an offer | OF4 (b) |
| CH15 | Law rule 45b's list of fields a deal may not carry | field 10 in a deal invalid (FR9) | FR9 |
| CH16 | The relay transport cMIP draft 3, the delivery record's nonce | binding a record to one payment | OF10 |
| CH17 | Finance rule 10b, "signed by the payer, in a claim" | the payer the payment commits to | OF9 (a) |
| CH18 | Law type 22, the settlement request | widened into the general request to a judge | OF24 (b) |
| CH19 | Production's specification format | a field where a rail Module declares its kind | OF26 (a), (b) |
| CH20 | The closing's format (type 20) | gains field 4, debts left open (QG1, F197: decided, not yet written) | always |
| CH21 | Every "format open" note: Law's first open technical parameter, core v21's first "Open before freeze" item, the terms CDDL notes, rule 16's, rule 27's and rule 28's notes, Production rule 17's last sentence, the payment cMIP's and the on-chain Module's notes, Finance rule 10's "FORMAT OPEN" | closed on approval | approval |
| CH22 | Law rule 20 ("for every incoming receipt … a split"), and QF4's numbering | a completing split for held role shares | OF10 (a) |
| CH23 | The library's refusals: `Terms::decode` (fields 8, 10, 17), `consent_judged` (type 11), `work_of` (offers), keepers' logs taken as stated input | the step's "done when" | approval, then code |
| CH24 | Law rule 32 and the act table (type 7) | the receipt as the delivery confirmation | OF6 (b) |
| CH25 | Law rules 40 and 41, core v21 ("acknowledges, pays on or imports it", twice), the freeze checklist's "import (3)" | if the import is retired | OF22 (b) |

## Readings taken in drafting, to confirm

- **FR1.** "The offer's terms" (rule 32, Finance 10a) are the terms of the agreement the offer is made under, field 17; an offer carries no refund terms of its own.
- **FR2.** Field 17 governs every refund owed on a payment under the agreement, an offer's, a claimed publication's, or one naming no claim.
- **FR3.** A plan fee's bearer is a party who signed that version; a creator-side fee's bearer is the creator.
- **FR4.** "To the owners pro rata" is to the plan's stake shares in proportion to their parts.
- **FR5.** A split's list of Modules includes at least the receipt's rail Module and the split cMIP; a plan fee is owed on a split that names its Module; leaving a used Module out is a stated cost.
- **FR6.** A metric's measurer is named in the plan in advance; F194 does not reach it, since the measurer weighs a share and is not paid by it.
- **FR7.** Across versions a stake is followed by its object, not its index.
- **FR8.** A version made after a transfer lists the new holder, or is a draft until the new holder signs (rule 45).
- **FR9.** Terms of a deal carrying field 10 are invalid (rule 45b: rule 47 is for collectives only).
- **FR10.** A member's liveness act counts for a collective only where the collective acknowledged it, or a keeper recorded it, before the line.
- **FR11.** A request rail always binds payee and purpose.
- **FR12.** Under OF18 (a), a fork act is a link of each stake's transfer chain it divides.

## Questions for Nobody, allegedly, in the order they should be decided

One at a time. The selling questions come first, because the offer is the hinge (X1 to X5); then the split plan, which roadmap step 13 needs; then ownership, which the splits follow; then the acts of living together; then rails, units and the notice, which depend on nothing above them. Each line gives the options; the costs are in the section named.

1. **OF1. What a standing offer sells** (section 1). (a) publications only; (b) publications or a work; (c) either, plus access with no work hash. *Decides X1 (4b) and X4.*
2. **OF2. Which claim a purchase may name when two agreements hold stakes in one work** (X2, tension T-1, between rule 15b with scenario 2 and Finance rule 10c). (a) any agreement holding a stake in the work is a claim a purchase may name, a lone seller's sale a purchase under its own agreement, shown as outside the other (as built); (b) only an agreement every creator of the work's work claim signed; (c) the one placed first where the claims meet (anchoring or a keeper), payments under the other owed back. *Costs:* (a) two co-owners can each sell the work under different plans, both purchases; (b) ties ownership to authorship, a new rule, and fails where no work claim exists; (c) a claim with no anchor or keeper is never placed, so neither wins and both stay contested, leaving buyers unrecorded.
3. **OF3. Who signs a standing offer in a deal** (section 1). (a) every party; (b) any one party; (c) a rule the deal's terms name.
4. **OF4. How an offer changes and ends; "until" on a push rail** (section 1). (a) an offer chain of versions; (b) Envelope's withdrawal extended; (c) no chain. And: an undetermined place against "until" is a purchase, or owed back.
5. **OF5. The price** (section 1). (a) one amount; (b) one per unit; (c) levels (step 14a's tiers).
6. **OF6. The delivery confirmation** (section 2). (a) its own act, type 7; (b) the payee's receipt is the confirmation, type 7 retired.
7. **OF7. How a refund's lapse is measured, and what a lapsed refund does to a closing** (section 3). (a) a fixed point; (b) a period from the payment's anchor; (c) a period from when the refund became owed. And: does a refund past its terms count as ended for a closing?
8. **OF8. Who does the split's arithmetic** (section 4). (a) the core fixes `part`; (b) the split cMIP's rule; (c) the core's meaning unless the plan carries the cMIP's parameters.
9. **OF9. Whose referral counts** (section 4). (a) the payer the payment commits to, extending F193; (b) as written.
10. **OF10. Evidence that arrives after the split** (section 4, Fable's 4c). (a) hold, then a completing split; (b) wait for an evidence window; (c) final when made, a stated cost. And the two smaller items: a record binding one payment, or a stated cost; the owners' own client acknowledging, a stated cost.
11. **OF11. Several fillers of one role** (section 4). (a) equally; (b) by the evidence's own measure; (c) as the split cMIP says.
12. **OF12. Where the use record is defined, and what it binds to** (section 6). (a) Law; (b) cMIPs, under F194's rule; (c) Production. And: the object served, or the payment.
13. **OF13. Who a metric may pay, and who defines its record** (section 5). (a) only those the plan already pays, or (b) anyone the record names; (c) the core defines the record, or (d) the metric Module does.
14. **OF14. What fee terms are, and whether the plan must match them** (section 7; flaw F-1). (a) type 15, or (b) a standing offer; (c) the specification names the fee terms, or (d) the fee terms name the Module; (e) the plan's part equals the rate, or (f) it is the parties' and the creator's business.
15. **OF15. How a publisher is marked** (section 8). (a) a typed stake object; (b) a publisher mark on the holding; (c) a position, no stake; (d) fees only, rule 16 withdrawn.
16. **OF16. Work claims: public, or private allowed** (section 9). (a) public only; (b) private allowed.
17. **OF17. Creators' roles in a work claim** (section 9). (a) none; (b) an optional label.
18. **OF18. Which chains a transfer names** (section 10). (a) a chain per stake, the work claim rooting the work's chain where one exists; (b) the work's chain dropped; (c) a chain rooted at the work hash.
19. **OF19. When a split follows a transfer; the leftover count** (section 10). (a) splits cite the transfer they follow; (b) a point on the time reference; (c) a stated cost. And: (d) the count inherited with a whole holding, or (e) every buyer from zero.
20. **OF20. What the concurrency rule may say** (section 11). (a) a judge on request; (b) precedence by power; (c) only the default, field 10 withdrawn.
21. **OF21. Keeper records: order and visibility** (section 14). (a) one act per record, (b) several in order, or (c) several at once; (d) public, or (e) delivered to the parties.
22. **OF22. Keep the import, or retire it** (section 12). (a) keep; (b) retire type 11.
23. **OF23. To whom a liveness act must be shown** (section 13). (a) public or addressed to the authority; (b) the party's choice.
24. **OF24. The request to a judge, and judges' answers** (section 16). (a) a new type; (b) type 22 widened. And: an arbitrator's decision left to the condition cMIP, or a Law act, or recorded as open for step 15.
25. **OF25. The general contest: now, or kept open** (section 15). (a) now; (b) open, as BQ4 decided.
26. **OF26. Where a rail Module declares its kind** (section 17). (a) a Production field; (b) a generic field the payment cMIP defines; (c) the payment cMIP's own list.
27. **OF27. Anything machine-read in a unit** (section 18). (a) nothing; (b) display fields.
28. **OF28. The notice before closing** (Part F). (a) a Law act; (b) a text message the closing cites.

*Then:* the twelve readings (FR1 to FR12), confirmed or corrected together; the flaw F-1 settles with OF14. After the decisions, one session writes the formats into Finance, Law and Production (and the cMIPs where named), rebuilds the core library's readers and the bindings, and turns each refusal of CH23 into a tested reading; roadmap step 13 (the split Module) then builds on the split plan as decided.

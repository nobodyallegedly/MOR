**Starting the final merge of main: stopped here for the MOR lead to write "preparing to merge".** Everything before that step is done and pushed: the decisions (F413) in the texts and the core with vectors, the eight sentences built, the escape's path fixed in the relay. The six web releases are not yet rebuilt. Question 1 below is a flaw found in the decided sentence on who buys through a route: it needs Nobody, allegedly, before the suite builds the client line.

# S7j: S7i's gaps closed

*Session S7j, 1 November 2026, on `claude/s7i-routes` (pull request 116), continuing S7i. This session records no finding of its own: F414 stays free.*

## In plain words

- **Who buys through a route.** The person who paid the first hop is the buyer, if their own claim of that hop names the seller's price tag. Built, with Fable's three cases first: names the tag, names another, names none. The core gives three answers. **But building it showed a flaw** (question 1): on a request rail the claim must match the payment's commitment, and the conversion service's commitment names its own tag. As written, the buyer's claim is refused by its rail.
- **A refund through a route** runs back hop by hop. Each hop owes its own payer, in its own unit. Built through one and two converters, and with a converter that keeps the refund.
- **Unknown spreads by Fable's bound.** An answer that rests on two or more records not yet verified is unknown until they are. One vector moved.
- **A forward paid in parts adds up.** A stop now shows only what is still short. Three vectors moved.
- **Claims carry no batch** (the door closed). The texts now say "receipts".
- **The eight sentences the core did not follow are now built**, each with vectors or a test. They are the four about Identity and the four about Agreements.
- **Kišib's escape test was red because of the relay, not Kišib.** A self-hosted home refused the escape as a conflict and did not keep it. So no reader ever learned which new home to ask for the receipt. Fixed in the relay, with a test. Kišib is green on GitHub.

## 1. Decided by Nobody, allegedly (F413)

**The buyer through a route.**
- *Texts:*
  - Money rule 24 has a new paragraph, "The buyer through a route", in Fable's words. Its stated cost: a first payer with no MOR claim has no standing. Its client conformance line: a client paying through a route signs the first hop's claim naming the tag in key 4.
  - Agreements, "A contest of a purchase": the buyer is the first payer, with "yet" for a route not yet answered, and the same stated cost.
  - Money rule 28: the refund clause, back hop by hop, each hop's debt paid as rule 17 says (rule 19 for a bare key).
  - Money's words: "First payer".
  - The suite: a new step, 4l.
- *Core* (`core/src/agreements/view/routes.rs`):
  - `route_buyer`: the first payer, the service for its own account (with the first payer's claims astray), none, unknown, or no route.
  - `refund_along`.
  - `purchase_contests` reads the first payer's claim of the first hop as the buyer's claim. The service's own claim of the last hop is a carrier's.
- *Binding:* `moneyRouteBuyer`, `moneyRefundAlong`.
- *Vectors, Fable's three first:*
  - the claim names the tag: the first payer is the buyer;
  - it names another tag: the service's own purchase, the first payer's claim astray;
  - there is no claim: the service's own purchase.
  - Then: both contests; the claim, or the last hop, not yet answered (unknown); the swap never paying (no purchase at the seller); no route.
  - The refund: through one swap; through two converters; the seller repaying the second converter, who passes nothing back (the refund stops there); a purchase (nothing owed).

**How unknown spreads: Fable's bound.**
- *Text:* Money rule 8 now says it: one such record, judged both ways; two or more, unknown until verified. A list is one answer.
- *Core:* `answered` counts the receipts and claims an answer reads whose rail answer is pending or not held. Only those records count, never a price tag or pointer.
- **The vectors whose verdict moves (one):** "a vow's sale whose buyer's claim has no verification answer: unknown, not pending". The club's receipt and the fan's claim of one payment both lack an answer. Old: `{ sales: [the fan's sale, "unknown"] }`. New: `"unknown"`. Two core tests follow the same way (`core/tests/vows.rs`).
- No other vector moves: every other vow list holds at most one record without an answer.

**Q-M2, the door closed.**
- Money rules 12 and 24 and the suite's 4g now say "receipts" where they said "for claims as for receipts".
- A claim carries no batch. The stated cost is beside it, in rule 12.
- The core already read it so.

## 2. Taken by the MOR lead under delegation (F413)

- **R1 (b), a forward in parts.**
  - *Texts:* rules 24 and 27: the records naming a forward add up to it, one payment counted once; the stop shows only the shortfall.
  - *Core:* `route_from` follows a branching route and stops at the first forward not wholly carried; `forward_owed` gives the shortfall.
  - **Three vectors move**, renamed, their acts unchanged:
    - the pool's 4900 of 5000 sat, read back: broken → valid;
    - followed forward: owes 100, not 5000;
    - the 94 of 95 cents: owes 1 cent, not 95.
  - One case is new: the rest paid in a second payment, valid.
- **R3:** one italic stated cost in rule 27: a silent conversion service is shown only as paid, and the conversion cMIP's order binds it.
- **R4:** rule 24 has S7i's clause.
- **The stranger's O-points, settled where the texts are clear:**
  - O1: rule 25 now says a conversion forwards in the next hop's unit, "another unit, or the same unit on another rail".
  - O6: the suite's 4b no longer stops a route at the order's deadline.
  - O8: Money's word "Batch" now covers forwards, on receipts only.
  - O7, O9 and O10 the texts already decide: rule 11; forwards only in receipts; rule 25's rate.
- **S7i's question 9 (a), a price change on a push rail.**
  - *Text:* Agreements rule 12.
  - *Core:* a later version changing the price is read as a withdrawal is.
  - *Vectors:* the receipt after it, no purchase; before it, a purchase.
- **Q-D1.**
  - *Text:* Development rule 3.
  - *Core:* `AgreementsView::specification_claim` reads an act for a collective that Agreements counts, or a backed grant key's act, as the creator's.
  - *Vectors (three):* the member the founding names for Envelopes (a specification's publication is a bake); a stranger; a backed grant key.

## 3. The eight sentences, each built

- **Q-I1** (rule 34):
  - *Text:* Fable's sentence, with "(bound to a rotation that does not count yet: everyday check 2)" so "that rotation" has something to refer to.
  - *Core:* a pending acknowledgement makes the act pending: `Judgement::Pending` in `chain.rs`.
  - *Vectors:* pending; then disputed once the rotation counts, void once a rival one does.
- **Q-I2** ("What stops a chain"):
  - *Text:* already written.
  - *Core:* each position is read again with unknown and pending evidence taken as valid and as absent. This covers receipts, kept lines, cosignatures, objections and absence statements. Where unknown evidence changes which rotation counts: "cannot tell"; where only pending evidence does: pending.
  - *Vectors:* ten.
- **Q-I3** (rule 45):
  - *Text:* Fable's sentence, with "or both so sit". Without it, the sentence would contradict its own cosigned case.
  - *Core:* it already read so.
  - *Vectors:* two, a home that never rotates and then does.
- **Q-I5** (the table):
  - *Text:* "exactly that one entry and no other".
  - *Core:* `check_homeless_path_objects`. Read so, an act naming no entry is invalid too.
  - *Vectors:* three.
- **Q-A4** ("owes nothing"):
  - *Text:* written in S7i.
  - *Core:* a closing is not complete while the collective owes a refund on a payment to it that is not repaid or ended. It is unknown while that rests on a rail's answer.
  - *Vectors:* two, owing and repaid.
- **Q-A21:**
  - *Text:* written in S7i.
  - *Core:* `gave_no_address` reads the payer's claim (key 7), chain (vault) and held pointers; unknown where the chain cannot be resolved.
  - *Tests:* in `f197_…`, the decided case. Its lapsed case's payer is now an identity with a chain. The unknown case and a payer with a held pointer were added.
- **Q-A11** (rule 64.4):
  - *Text:* Fable's sentence.
  - *Core:* `[5, stake]` under an every-holder rule is allowed in the mark, names every holder at the line, and is needed where the terms declare that rule (`owners_powers`).
  - *Test:* `s7j_an_every_holder_rule_…`, three cases. A test, not a vector: the fixtures with a stake's holders' rule live in the core tests.
- **Q-A13** (rule 15):
  - *Text:* Fable's sentence, and an italic: "in force at that consent" is read from the acts.
  - *Core:* `line_signed`. The version in force gives a new consent. An earlier version's consent stands where the version in force, or its parties' signature acts on it, hold it in their history.
  - *Vectors:* three. The F254 test's "carried through every later version" passes under this reading.

The four Identity sentences were built by a worker in its own worktree and checked here. All four bite: with the old core put back, 8 of their new cases mismatch.

## 4. The escape's path (S7i's question 11)

**The cause is the relay.**
- A self-hosted home is a home of the old set. Its homeless rotation went to the first-held-wins conflict check, because `names_us` compares operators and a self-hosted home has none. It was refused (relay error 4) and not kept.
- The reader (`clients/genesis/src/lookup.ts`) finds new homes only from escapes the homes in force hold. So it never asked the new home for its receipt.

**The fix** (`relay/src/node.rs`, test `a_self_hosted_home_keeps_an_escape_as_evidence` in `relay/tests/home.rs`):
- At its own self-hosted home, a homeless rotation is kept as evidence: not chained, no receipt, no objection. This is what Identity rule 48 asks of a home of the old set.
- An objection there would be signed by the identity itself, and would void its own escape (rule 49).

Kišib needs no change; its five rare tests pass, F299 included, here and on GitHub. *(The fix went into an earlier commit by mistake; the next commit's message explains it.)*

## For the Dubsar Suite

- **The binding's changes, old shape first**, and every verdict an app may see change, are in `wasm/README.md`, "Changed in S7j". Above all:
  - a vow, a purchase's contests or a collective's owed-back list resting on two or more records without a rail answer is unknown as a whole;
  - a closing waits on a refund owed;
  - an inner deal consents by its version in force.
- **Theirs to change:**
  - **`clients/collective/test/rb.test.ts`, "QG1 and F197"** (red on GitHub): its two broken-stretch payments are on a test rail no Module answers. So the owed-back list is now unknown as a whole, where it was two entries each unknown. `clients/collective/src/actions.ts` (line 3723) catches the throw and shows an empty list. It should show the list as unknown, waiting for the rail, and still block the closing. Then the test expects that.
  - **Ummia's pinned hashes** (`clients/ummia/src/cards.ts`), final once the texts stop moving: given in "Checks" below.
  - **The client conformance line for paying through a route**: Money rule 24. *Do not build it before question 1 is decided.*
  - **Kišib:** nothing.

## Questions

1. **The buyer's claim through a route cannot be valid on a request rail as written.**
   - *Plain words:* the buyer's claim must say "this was for the seller's song". But on Lightning the claim must also match what the payment committed to, which is the conversion service's own price tag. Two different things in one field: the rail refuses the claim. On a rail that binds no purpose, rule 11 lets the claim win instead, and the swap's sale of its conversion disappears.
   - *Precisely:*
     - Money rule 18: a claim naming another tag than the commitment is refused by the rail Module's rule.
     - The conversion cMIP (draft 4, item 5) commits the first hop to the service's tag.
     - Rule 11: where the rail binds no purpose, the payer's claim decides what the payment fulfils.
     - Fable's sentence puts the route's purpose in key 4, the same field. The vectors here use a rail with no specification held, so the core trusts the stated rail answers. The flaw is in the texts, not the build.
   - *Options:*
     - **(a)** the first payer's claim keeps key 4 as the commitment's (the service's tag) and names the seller's tag in its `refs`. Rule 24 matches the purchase's field 5 against that citation. No format change. The anonymous payer's signature already covers `refs`.
     - **(b)** the first hop's commitment names the seller's tag. The conversion is read from the forward's agreement, and a hop declaring a forward is no payment of what it names. This changes the conversion cMIP (the suite's) and rule 18's reading.
     - **(c)** as written, rule 11 not comparing a first hop's key 4. The rail still refuses the claim, so this needs the payment cMIP to change too.
   - *My lean:* (a). *Cost:* two sentences change (rule 24 and the contest), and one line of core (which field is matched).
2. **A refund owed to nobody outside a broken stretch blocks a closing forever.**
   - *Plain words:* Q-A4 counts every refund owed. One owed on a payment that committed no key can never be paid, so such a collective can never close.
   - *Options:* (a) as built; (b) field 4 may leave open such a refund, and one owed to a payer who gave no address, as it does for the broken stretch.
   - *Lean:* (b). *Cost:* a sentence in "owes nothing" and a few lines of core.
3. **A route stopped before the seller: who owes the first payer?**
   - *Plain words:* Fable's prose says the stopped hop owes its forward and "every hop before it owes back what it received". A first converter that paid on correctly would then owe the buyer a refund.
   - *Built:* rule 27's forward only. `refund_along` answers only on a valid route ending in no purchase.
   - *Options:*
     - (a) as built: the forward is the debt, and the conversion agreements say the rest;
     - (b) Fable's prose: each hop before the stop owes back too.
   - *Lean:* (a).
4. **Q-A11's scope:** built for a stake whose terms declare the every-holder rule (field 30). A stake with no entry, every holder by default, keeps rule 48's signatures outside the mark. *Lean:* as built. *Cost:* two shapes remain, for declared and default rules.
5. **Q-A4's placement:** the core counts every payment to the collective it holds, not only those before the closing's line. *Lean:* place it by the line, as other debts are placed (one more core change).
6. **The relay's reading** (section 4):
   - a self-hosted home signs no objection;
   - it keeps any homeless rotation of its identity as evidence, also at a free position (before, it held one there as the identity's rotation).
   - *Lean:* as built, rule 48 as written.

## The stranger's reading

*(To come.)*

## Vectors

- 496 verdict cases, 48 of them new, every one made by the core's own functions.
- Every earlier case keeps its verdict, acts and ids, save the four above, each a decision's own case.
- New questions: "route buyer", "refund along", "specification claim, reading Agreements".
- Both READMEs are updated, the c-box's too.
- The library's check (`core/tests/vectors.rs`) knows the new questions.
- The Python check: all 276 vectors agree, 98 verdict cases judged there.

## Checks

*(To come.)*

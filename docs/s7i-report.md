**Starting the final merge of main: stopped here for the MOR lead to write "preparing to merge".** Main has not moved since this branch left it (`14520bb`), so the merge is empty; the six web releases are not yet rebuilt on this branch's WebAssembly. Everything before that step is done and pushed.

# S7i: routes built, and the last sentences before the freeze

*Session S7i, 31 October to 1 November 2026, branch `claude/s7i-routes`, from main (`14520bb`). This session recorded no finding of its own: F413 stays free.*

## In plain words

- **A collective can claim a work.** A claim a member signs for the collective is the collective's: the collective opens it, is a creator, and is the work's default holder. Members may be listed beside it.
- **The core reads a publication before it is signed** (`readPublication`), so the apps no longer decode it themselves.
- **Routes are built.** The core now follows money across rails hop by hop. In the first scenario, an anchoring pool pays on Lightning, and a swap service pays out on-chain. The route is checked hop by hop. A swap that takes the Lightning and never pays on-chain is shown owing the forward, to whom, how much, under which agreement. A buyer paying across rails through one and through two converters works the same way. Every failure names its hop and its agreement. A debt is paid by a route only if the whole route is valid.
- **Fable's remaining sentences:** most were missing, and are now written. Where a sentence changes a verdict, the core was changed to follow it, with a vector. Three of the must-close sentences are written, but the core does not yet follow them. They are named below as gaps for the next core session.
- **The wording pass** is done. S7h-3's eight points are handled (one turned out to be a real question), and rule 23 now names field 5.
- **Every earlier vector keeps its verdict, acts and ids.** 47 vectors are new.

## 1. A collective's claim (F412)

- **Texts.**
  - Agreements, "Claim (type 3)": the format's comment now reads "its opener among them: the signer (who opens it), or, for a claim a member signs for a collective, the collective (rule 58)". A new paragraph adds:
    - the collective is the opener and a creator, and the claim counts where the member may act for it (rule 60);
    - members may be listed as co-creators, each binding the claim by their own signature act;
    - a claim naming neither its signer nor a chain its `objects` name among its creators is invalid;
    - one whose opener, so read, is not among its creators counts for nothing.
  - Rule 58 adds the claim to the formats that carry the collective's chain entries, and says the claim is the collective's.
  - The type table, the MICS and the suite say the same.
- **Core.** `WorkClaim::decode` accepts an opener that `objects` names. `work_owners` reads the opener as rule 58 reads an act's author (`claim_opener`), judged under rule 60.
- **Vectors.** Seven cases, with a new question, "work owners":
  - the collective alone;
  - a member as co-creator, not bound until that member's own signature act, then bound;
  - a stranger's claim, nobody's;
  - a member's claim naming the collective that lists only the member, counting for nothing;
  - one naming neither its signer nor the collective, invalid.

## 2. A core reader of a publication

- `Publication::decode_payload` applies every format check that reads the payload alone. `decode(inside)` adds the `objects` checks.
- The binding's `readPublication(payload)` gives the fields and throws outside the format. The test is `core/tests/read_publication.rs`. Its shape is in `wasm/README.md`.

## 3. Routes (F397)

**What was built** (`core/src/agreements/view/routes.rs`):

- `route_to(record)`: the route ending at a receipt or claim, as its final creditor reads it, followed back through receipt field 6 and claim key 10.
- `route_from(receipt)`: followed forward.
- `forward_owed(receipt)`: rule 27's open obligation.
- The verdict is **valid** (its hops), **stopped** (at the hop, the forward it owes, and the records near it, rule 27), **broken** (at a record, under the agreement the failure names, rule 28) or **unknown** (a rail's answer not held).
- Each link checks:
  - the record is valid on its rail and stands: a receipt signed by the hop's receiver, a claim that is a payer's claim;
  - it names the previous hop's receipt;
  - that receipt declares a forward (rule 25);
  - its payee is the forward's next payee, and its amount, unit included, is the forward's (rule 24);
  - a claim is the paying hop's own, signed by the previous hop's payee, and a receipt that names a payer names that service;
  - rule 11 between a receipt and a claim of one hop naming different previous receipts: the commitment decides where the rail binds the previous hop, else the payer's claim;
  - rule 12 between records of one payment naming different forwards: they share it only under a batch they share, and the receiver's receipts resolve the claims.
- **Rule 15:** a receipt or claim naming a previous hop counts toward an obligation only where the route ending at it is valid.
- **Rule 26, as far as the core can check it:** a route whose earlier receipt the verifier does not hold is not shown valid, so it pays no debt. A forward whose carrying claim the verifier does not hold stays open for that verifier. How an act reached a verifier, the core cannot see.
- **Binding:** `moneyRoute`, `moneyForwardOwed`.

**The scenarios, as vectors** (32 cases):

- **First, the pool.** An anchoring pool pays a swap on Lightning; the swap pays on-chain to the pool's wallet:
  - valid, followed both ways;
  - the swap never pays: stopped, the swap owing the pool 5000 sat under its publication;
  - the pool's wallet signs nothing: the swap's claim carries the forward on;
  - a debt to an on-chain supplier paid across the route: discharged by the valid route alone, and nothing paid while the swap has not paid on, or while the verifier lacks the first hop's receipt.
- **The failures each rule names:**
  - a short forward;
  - a hop without its rail's answer (unknown, never stopped);
  - a first hop invalid on its rail;
  - a receipt naming one that declares no forward;
  - another payer;
  - a claim that is not the paying hop's;
  - two claims of one payment naming two forwards (neither);
  - two receipts of one payment under one batch (both), and with none (neither);
  - a receipt and a claim naming different previous receipts, on a rail binding no previous hop (the claim decides) and on one binding it (neither).
- **A buyer across rails:**
  - through one swap, a purchase of the seller's tag;
  - through two services, Lightning to a stablecoin to on-chain, three hops, two units;
  - the second service never paying, owing the seller;
  - the first forwarding short;
  - a hop paid to another than the forward's next payee.

**Where building found a rule unclear or wrong** (questions R1 to R4 below; the build follows the texts as written):

- **R1.** A forward paid short, or in parts, carries nothing on, and the whole forward stays owed.
- **R2.** Who the buyer is through a route.
- **R3.** A conversion service that signs no receipt declares no forward the core can see.
- **R4.** The previous forward's "next payee" and the paying service are read into rule 24.

**Q-M2, from what was built: a route does not need a claim's batch.**

- *Plain words:* the one place a batch on a claim was wanted is a service paying several forwards in one payment to a payee that signs nothing. Two things already cover it:
  - where several forwards go to one payee in one payment, the payee's receipts under a batch carry them (built, with a vector);
  - where the payee signs nothing, a payment per forward does it (on-chain, one transaction with an output per forward is several payments; on Lightning, payments are separate anyway).
  - For the anchoring pool, the next payee is the pool's own wallet, which can sign its receipts.
- *Options:*
  - **(a)** add a batch key to the claim format before the freeze. It is a one-way door: a frozen format never gains a key.
  - **(b)** say "receipts" where Money rules 12 and 24 and the suite's 4g say "for claims as for receipts", and close the door.
- *My lean:* (b). The core already reads it so. *Cost:* a silent next payee paid several forwards in one payment shows them unpaid; such a service pays one payment per forward, or asks the payee for receipts. A cMIP's companion act can carry a batch later.
- *The texts still say "for claims as for receipts":* the wording waits on this decision.

## 4. Fable's sentences, question by question

Checked against the texts on this branch, every question in the third review (a reading by a subagent, then my own check of each sentence I wrote).

**Already in:**
- Q-A3, Q-A10, Q-A12, Q-A22: Nobody, allegedly's decisions.
- Q-A6: Money rule 21 and Agreements rule 25. The plan is now required, so Fable's "no split plan" case no longer arises.
- Q-A9 (rules 94 and 95).
- Q-A18, Q-A20, Q-I6 (Text rule 14 reads the genesis).
- S7e Q3.
- Q-A2, Q-A14, S7e Q2 and S7f Q3 (core only; the text's words are present).

**Moot after the redesign:**
- S7f Q1 and Q2: terms no longer name split services; the publication does.

**Written** (where a verdict turns on it, the core follows, with a vector or test):

- **Identity:**
  - **Q-I7**, rule 4: a self-hosted identity's homeless rotation counts only with an escape endorsement. Core changed: the self-hosted home's own vote no longer counts a homeless rotation. Three vectors.
  - **Q-I0**: such a rotation is void, with every rotation built on it, and the acts bound to them invalid. Core changed: a rotation built on it read invalid, now void. Three vectors; one core test's word corrected, its own comment already saying "both are void".
  - **Q-I4**: auditors distinct. The core already counted them so.
  - **Q-I2**: what "cannot tell" covers (the core gap is below).
- **Money:**
  - **S7e Q4**: how unknown spreads, rule 8: both readings, every such record together, a list entry by entry. The core already did this. The words follow the core, not Fable's "two or more, unknown": question 5.
  - **Q-M1**, rule 18: pending names the payment's state, unknown the purchase verdict.
- **Envelopes, Q-E1**, rule 8: a private encryption key is invalid. Core changed; one vector.
- **Agreements:**
  - **Q-A8**, rule 47: a clone relies only once complete; the service's receipt relies, a payer's claim never. Core tightened: it let any valid act rely, a stranger's unsigned clone and a buyer's claim included. One vector; the invariants' oracle follows the text.
  - **Q-A1**, rule 10: wrong once the transfer is complete.
  - **Q-A23**, rule 82: a living party triggers its plan by signing the clone marked with it. Core changed; a fifth run of `a_seat_passes_by_automatic_succession`.
  - **Q-A4**, "owes nothing": a refund owed among them (the core gap is below).
  - **Q-A21**, the closing: a payer with no address read from its chain; unknown where it cannot be resolved (the core gap is below).
  - **Q-A5**: unknown where the verifier cannot tell.
  - **Q-A7**: the split cMIP's answer.
  - **Q-A15**: a free sale's confirmation reads as "Promises, and bundles" says.
  - **Q-A16**: priority shown only.
  - **Q-A17**: italic.
  - **Q-A19**: the judge of forks' standing.
  - **S7f Q8**: "or public, as rule 57 says", and the set-aside's purpose.
- **Development, Q-D2:** "any item".
- **MICS, Q-I8:** "under the home rule it declared".

**A question** (each in "Questions"):

- **Must-close sentences written, the core not yet following:** Q-I2, Q-A4, Q-A21 (question 6).
- **Not written**, because the core reads otherwise and the change is not one line: Q-I1 (a pending acknowledgement), Q-I3 (a home that never rotates; Fable: can wait), Q-I5 ("exactly that entry"), Q-A11 (`[5, stake]` where every holder signs), Q-A13 (an inner deal's version in force) (question 7).
- **Q-D1:** a specification published by a member for a collective. The redesign changed its shape: member keys are gone (question 8).
- **Q-M2:** above. **Q-M3:** built.

## 5. The wording pass

S7h-3's eight points (its question 5):

1. **The freeze line's "both chains":** already corrected on main ("the agreement's chain").
2. **9.1's pass line:** it now says from the service's first split following the complete transfer, owing the buyer every payout to the seller from its first split citing it (rule 10's window).
3. **"Counts twice" beside "no voting weight":** rule 81 now says, in italics, that a successor already a party holds two seats, never a weight the plan writes.
4. **9.3's fourth case:** rewritten. A collective of one: the declaration takes effect at the recovery rotation, whose naming of others' signature acts applies only where the authority is a threshold.
5. **Rule 11, a lone seller's publication:** its drafter is the owners' side, selling what it owns alone, or a vow no ownership agreement claims (rule 14).
6. **9.1, "receipted or not":** added.
7. **Rule 11's racing test:** it now reads as rule 12's: on a push rail, a receipt after the service's own signature on the ending. This is what the core does.
8. **A withdrawal signed by the designated party:** rule 12's italic now says it stops push-rail sales once the service's history holds it, as the core reads it. **A price change** (a later version with another price) is not wording: question 9.

Two more:

- **Rule 23:** a payout's receipt names its split in field 5, what it fulfils (taken under delegation, F412). The core no longer accepts a split named in `objects` alone; no vector or test moved.
- S7h-4's reading in rules 94 and 97 was already written by S7h-5. The c-box's vectors README already carried S7h-3's bullet.

## Vectors

- 451 verdict cases, 47 of them new, every one with acts made by the core's own functions.
- Every earlier case keeps its verdict, acts and ids. The comparison by name shows only main's two cases that share one name.
- New questions: "work owners", "route to", "route from". New fact: `rail_invalid`.
- Both READMEs are updated, the c-box's too (counts brought up to date).
- The Python check agrees: 276 vectors, 98 verdict cases judged there. The new cases are the library's to judge, as the Agreements and Money cases are.

## For the Dubsar Suite

- **The binding's changes, old shape first,** are in `wasm/README.md` ("Changed in S7i"): `readPublication`, `moneyRoute`, `moneyForwardOwed`, and seven verdicts an app may see change.
- **The anchoring pool's money across a route** (anchoring draft 7, item 24: "through a conversion service, the move is a Money route"): the core now reads that route.
  - `moneyRoute(specs, swapReceipt, "from")` follows the pool's Lightning payment to the on-chain hop. "valid" ends at the record of the pool's own on-chain receipt, the coins item 22 counts as shown. "stopped" names the swap as owing the pool the forward, under its publication: that is what items 22 and 23 can show as not arrived.
  - The custody accounting itself (items 21 to 24) stays the suite's.
- **The core sees a forward only in the swap's receipt** (field 7). A swap that takes the Lightning and signs no receipt declares no forward the core can read. The conversion cMIP's order is what binds it ("a silent service still owes its order"). The pool's client should hold the order beside its claim.
- **The conversion cMIP's own route reading** (`cmips/conversion/src/route.rs`) reads as the core now does. Its readings match what was built: payee and amount of the forward, the paying hop's claim, receipt before claim. The suite may call the core instead of its own copy in its next round; nothing here changed `cmips/`.
- **A collective's claim:** made with `makeEveryday` by a member, naming the collective in `objects` and listing it among the creators. Edubba's Publishing can offer it now.
- **A payout's receipt names its split in field 5:** the suite's apps already do (round 9).

## Questions

Each in plain words, then precisely, with options, my lean and the cost.

1. **R1. A forward paid short or in parts.**
   - *Plain words:* rule 24 asks a hop to receive exactly the forward. A service that pays 4900 and then 100 has paid 5000 but is shown owing all 5000, and the next payee could claim 5000 more.
   - *Options:*
     - (a) as written: one payment of exactly the forward; a short one carries nothing on, shown beside the stop.
     - (b) the records naming a forward add up to it, rule 12 bounding each, and the stop shows only the shortfall.
   - *Lean:* (b). *Cost:* a sentence in rules 24 and 27, and the core's route becomes a small tree where a forward is paid in parts. Built: (a).
2. **R2. Who is the buyer of a purchase paid through a route?**
   - *Plain words:* the last hop's payer is the conversion service, so a refund owed is the service's, and the buyer's claim of the first hop names the service's tag, not the seller's.
   - *Options:* (a) as the texts give today: the service is the buyer of record, and the real buyer's remedies run through the conversion agreement (rule 28); (b) the route's first payer.
   - *Lean:* (a) for MOR 1. *Cost:* a buyer through a converter cannot contest the seller's sale as its buyer.
3. **R3. A silent conversion service.**
   - *Plain words:* the core sees a forward only in the service's receipt, so a service that signs nothing is shown only as paid.
   - *Lean:* leave it to the conversion cMIP's order, as written, and say it as a stated cost in Money rule 27. One italic sentence, not yet written.
4. **R4. Readings built into rule 24** (and the stranger's O1 to O10 above).
   - *Plain words:* "the previous hop's forward" is read as its next payee and its amount; the paying hop is the previous hop's payee.
   - *Lean:* one clause in rule 24: "each hop paid by the previous hop's payee to the forward's next payee, its received amount the forward's".
5. **How unknown spreads, with several unverified records.**
   - *Plain words:* Fable's sentence said "unknown where it depends on two or more" such records. The core takes them all as valid, then all as counting for nothing. A case where only a mixed reading differs would be answered by the core and unknown by Fable's words.
   - *Options:* (a) the text as written now, matching the core; (b) Fable's bound, the core counting records as rule 12 counts pairs.
   - *Lean:* (b), for soundness. *Cost:* a core change; vow lists with two or more unverified buyers' claims become unknown, and some existing vow vectors would move. So it is Nobody, allegedly's to decide.
6. **Q-I2, Q-A4, Q-A21: written, the core not yet following.**
   - *Plain words:*
     - Q-I2: "cannot tell" now covers a receipt, absence statement or cosignature whose signer's chain the verifier cannot resolve, judged both ways. The core treats such evidence as absent.
     - Q-A4: "owes nothing" now names a refund owed. The core counts only a broken stretch's money owed back.
     - Q-A21: a payer's lack of address is now read from its chain. The core takes the notice's lapse as stated.
   - *Lean:* a short core session (S7j) builds the three, with vectors, before the third box. *Cost:* until then the texts give verdicts the core does not, on these three.
7. **Not written, the core reading otherwise:** Q-I1, Q-I3, Q-I5, Q-A11, Q-A13. Each is Fable's sentence as given, waiting for the same core session. Fable marked Q-I3 "can wait"; Q-I1, Q-I5, Q-A11 and Q-A13 "before the freeze".
8. **Q-D1 after the redesign.**
   - *Plain words:* a specification counts as its creator's only if the creator signs it. A collective signs nothing itself.
   - *Lean:* "an act for a collective that Agreements counts (rule 58), or under a grant key Agreements backs, is the creator's for this rule", with the core following. *Cost:* a core change in Development's claim check.
9. **A price tag's price change on a push rail.**
   - *Plain words:* the core lets a payment naming an earlier, priced version buy at that price after a later version changes the price. Money rule 18 says the latest version counts.
   - *Options:* (a) settle it as a sale before a withdrawal is settled: no purchase once the service's history holds the new version; (b) a payment naming an earlier priced version buys at its price, as the core does, said in the texts.
   - *Lean:* (a). *Cost:* a core change.
10. **Q-M2:** in section 3.

## The stranger's reading

A subagent was limited to the eight texts, the diff of every sentence written here, and the 47 new cases told as situations, each with the core's verdict. It read no code.

**The verdicts:** of the 47 cases, 33 agree with the texts, 14 the texts leave silent, and none differs outright.
- The claim, readPublication's subject, Q-I7, the private key and most route cases agree.
- Silent, all but two in routes:
  - who pays and who receives a hop: the payer, the forward's next payee, the "paying hop" of a claim (R4);
  - a short forward: whether rule 27's "names it" includes the amount (R1);
  - "broken" and "stopped" are not defined words, and a broken result names its hop but the texts don't say how (R4);
  - which record of a route names a debt (R4);
  - a receipt and a claim both answered valid on a rail binding the previous hop: the texts say it cannot happen, so the core's "neither" is its own (R4);
  - the rotation built on a voided homeless rotation, said only in the re-homed-without-audit paragraph: **fixed** (rule 49 now says it).

**Its points on my sentences, and what I did:**
- *Fixed:*
  - the MICS's "the home rule it declared" became "the homeless rotation declared";
  - rule 82, "no other trigger", the seat successors still signing;
  - "owes nothing": the refund, not the payment, not ended;
  - Q-A21: the pointer is read from the acts held, the vault from the chain, as the closing is judged after the deadline;
  - rule 10: "after the transfer's chain signature";
  - Q-I0: invalid "while it stands", judged anew with the objection.
- *Kept, with the reason:* the citation of rule 57, which does say "where a holder is a deal, the act is public" (I now cite those words). Q-A17 and the italic sentences are commentary as Fable asked.
- *Its point on Money rule 8's new sentence is right, and serious.* Two pending records of one payment naming two forwards give "neither carries" both when all are valid and when all count for nothing, yet with only one valid the route is valid. So "every one together" can answer where the truth is unknown. This strengthens question 5: my lean is now firmly (b), Fable's bound. Until it is decided, the core's answer and the text agree, and both can be wrong in that case.

**Points on the route rules, added to R4** (each a reading of the build):
- **O1:** is a Lightning-satoshi to on-chain-satoshi swap a conversion hop? Rule 25 says a conversion forwards "in the next unit", and Money's "one name per unit" says such a hop is no conversion. The build lets any receipt with a forward forward, whatever the units.
- **O6:** the suite's 4b stops a route "once the order's deadline has passed"; rule 27 has no deadline. The deadline is the conversion cMIP's order, and the core shows a forward unpaid at once.
- **O7:** on a rail binding no purpose, the service's claim of the last hop decides which debt it pays (rule 11), not the debtor.
- **O8:** a batch names nothing the texts define for a conversion service.
- **O9:** a hop shown only by a claim can never forward, since claims carry no forward.
- **O10:** the rate is never checked by the core (rule 25: the agreement's).

## The releases

Not yet rebuilt: stopped at the final merge, as asked. After "preparing to merge": merge main (empty today), rebuild the six as their READMEs say, and check GitHub green, the reproducible display client included.

## Checks

- `cargo test --workspace`: green, before Fable's second part.
- `cargo test -p mor-core`: green at the head; the invariants were replayed on the seed that caught the oracle.
- `python3 core/vectors/check.py`: all 276 agree.
- `scripts/c-box/make-c-box.sh` into a scratch folder: 8 texts, 12 vector files, nothing refused.
- CI on GitHub: below.

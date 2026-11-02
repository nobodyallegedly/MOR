**Done, and stopped here: F414's second part built, the texts moved and the six web releases rebuilt again; GitHub green save the suite's two (`clients/collective`'s `rb.test.ts` and Ummia's pinned hashes, final values in "Checks").** Main had not moved, so its merge stays empty. F413 and both parts of F414 are built in the texts and the core with vectors; the eight sentences are built; the escape's path is fixed in the relay. Four older contradictions are left for the MOR lead (section 6).

# S7j: S7i's gaps closed

*Session S7j, 1 November 2026, on `claude/s7i-routes` (pull request 116), continuing S7i. This session recorded no finding of its own; F414 is the MOR lead's, deciding every question of this session (sections 5 and 6).*

## In plain words

- **Who buys through a route.** The person who paid the first hop is the buyer, if their own claim of that hop cites the seller's price tag. Building the first wording showed a flaw: on a request rail, the claim's purpose field must match what the payment committed to. Decided (F414): that field stays the conversion service's tag, and the seller's tag is cited beside it. Built, with Fable's three cases on a rail whose specification is held: cites the tag, cites another, cites none. The core gives three answers.
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
  - *Vectors:* four, with F414 (section 5).
- **Q-A21:**
  - *Text:* written in S7i.
  - *Core:* `gave_no_address` reads the payer's claim (key 7), chain (vault) and held pointers; unknown where the chain cannot be resolved.
  - *Tests:* in `f197_…`, the decided case. Its lapsed case's payer is now an identity with a chain. The unknown case and a payer with a held pointer were added.
- **Q-A11** (rule 64.4):
  - *Text:* Fable's sentence.
  - *Core:* `[5, stake]` under an every-holder rule is allowed in the mark, names every holder at the line, and is needed where the terms declare that rule (`owners_powers`).
  - *Test:* `s7j_an_every_holder_rule_…`, three cases. A test, not a vector: the fixtures with a stake's holders' rule live in the core tests.
- **Q-A13** (rule 15):
  - *Text:* Fable's sentence, and an italic: "in force at that consent" is read as a version in force for an act is (rule 1): the latest version of the inner deal's line each signature act's history holds. This is the stranger's reading, simpler than my first build, with the same verdicts.
  - *Core:* `line_signed`.
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
  - **The client conformance line for paying through a route** (Money rule 24, decided in F414): the first hop's claim keeps key 4 as its commitment's and cites the seller's tag in `refs` (`makeEveryday`'s refs).
  - **Kišib:** nothing.

## 5. F414, built

- **Question 1, decided by Nobody, allegedly, lean (a).**
  - *Texts:* Money rule 24, "The buyer through a route", and its client conformance line; Agreements, "A contest of a purchase"; the suite's 4l; the MICS. The first payer's claim keeps key 4 as its commitment's (the service's tag) and cites the seller's tag in its `refs`. The purchase's field 5 is matched against that citation. An italic says why `refs`.
  - *Core:* `route_buyer` reads the claim's `refs`.
  - *Vectors:* Fable's three, rewritten on a Lightning request rail whose specification the verifier holds (field 11 0, field 13 payee and purpose):
    - the claim valid on the rail, the citation matched: the first payer is the buyer;
    - another tag cited: the swap's own purchase, the claim astray;
    - no claim: the swap's own.
    - New beside them: the claim naming the seller's tag in key 4 against the commitment, refused by the rail, the swap's own.
    - The contests, unknown and stopped cases follow the same claim.
- **Q2 (b), taken under delegation:** field 4 may leave open a refund owed to nobody, and one owed to a payer who gave no address after a lapsed notice, as for the broken stretch. *Texts:* "owes nothing"; "Money owed back that field 4 may leave open"; the notice. *Core:* the closing reads field 4 for refunds too.
- **Q5, taken under delegation:** a refund is placed by the closing's line, as other debts are. Only a payment recorded by the collective's own act, or acknowledged by one, in the closing's history counts. It is repaid only by receipts the line relies on (an act of the collective there acknowledging them). *Core:* `refunds_owed_to_payers` reads the line; `repaid_if`.
- *Vectors* (the closing):
  - recorded by the collective's receipt before the line: not complete;
  - repaid by the fan's receipt that an act of the collective in the history acknowledges: complete (the case the stranger's reading dropped, back);
  - recorded only after the line: does not block;
  - owed to nobody, named in field 4: complete.
- **Q3, Q4 and Q6:** as built.

## 6. F414, second part, built

- **Identity, a conflict at one home** (decided by Nobody, allegedly: step 2 governs). *Texts:* the glossary's "contested position" (line 70), rule 44, and rule 45's last sentence. A home whose two receipts conflict at a position has them left out, and the other homes may still meet the rule. Beside it, the stated cost: a conflict the home's own rotation proves never ends, that home's receipts count for nothing later, and the owner moves to other homes or leaves by the escape. *Core:* no change; it already read so. The two Q-I3 vectors the stranger found differing now agree with the texts.
- **A vow's sale and a referral through a route** (under delegation).
  - *Texts:* Agreements rule 13 and Money rule 20, and the suite's 4l. The sale, and the claim carrying a referral, are the route's first payer's claim of the first hop citing the tag.
  - *Core:* the vow's sales read `route_buyer` first. `payer_acknowledged` reads the first payer's claims of the first hop.
  - *Vectors:* the vow's sale through a swap, pending; confirmed by a later claim of the fan's of the first hop. *Test:* `s7j_a_referral_through_a_route_is_the_first_payers`, the citing claim filling the role share, the non-citing one not.
  - *Found while building:* the core listed a first-hop claim citing nothing as "astray". Money rule 24 shows as astray only one citing another tag; the core now follows it. No vector moved.
- **Q-A11** as built. Rule 65 now says how `[5, stake]` is counted under every holder: every holder of the stake at the line, members and holders who are no members alike, each signing.

**A third stranger's reading** (these sentences and their two cases): both cases agree.
- *Its points on my sentences, fixed in the texts (no core change):*
  - Identity: "Conflicting receipts", step 1, section 9's "In short", the glossary's tail, the MICS row and the suite's 7d now say that a conflict leaves the position contested only where the other homes do not meet the rule without it;
  - rule 44's cost: "a conflict proven (rule 45)", with both ways out said;
  - rule 45's last sentence: the receipts are left out before proof and after it;
  - rule 13: conditional on Money rule 24's test, the service the buyer otherwise;
  - rule 22 and Money rule 20: one route sentence for every kind of evidence, and "their referral there, or their acknowledgement of other evidence";
  - the suite's 4l: "an act about the vow".
- *For the MOR lead, older contradictions these sentences meet but do not settle:*
  1. **Rule 65 (as F414 asks) against rules 94, 95 and 48.** Under every holder, rule 65 now has every holder sign, members too; rules 94, 95 and 48 have only holders with no voice sign, members consenting through the collective's own rules. Rule 64 item 4 asks `[5, stake]` only where the rule is by share. *Lean:* rules 94, 95 and 48 follow rule 65 for a declared every-holder rule, and rule 64 item 4 names it; one sentence in each.
  2. **The way out of a position contested for good by a proven conflict.** Rule 29 allows a second rotation with the same chain key only after a rotation refused, or contested at a self-hosted home. So an owner whose remaining homes cannot meet the rule has no escape. *Lean:* add to rule 29's second exception "or contested by one home's proven conflict (rule 44)", the endorsement naming both rotations as abandoned. A new rule, so not written.
  3. **A bare-key first payer and a vow:** rule 13 says a bare-key payer signs nothing onto a vow; the contest paragraph lets them contest by a key-8 claim. Older, now met through routes. *Lean:* one sentence in rule 13 matching the contest paragraph.
  4. **Several claims of the first hop**, one citing the tag and one citing another or none: the core takes any citing claim (the smallest act id). *Lean:* as built, said in rule 24.


## The stranger's reading

A subagent read only the eight texts, the diff of every sentence written here, and the 49 new or moved cases told as situations.

**The verdicts: 43 agree, 3 silent, 3 differ.**
- *Differ:*
  - the two Q-I3 identity cases (decided in F414: they now agree, section 6);
  - the closing completed by the fan's receipt of the refund (no act of the collective acknowledges it): the case was dropped, and is back once F414 placed refunds by the line (section 5).
- *Silent:*
  - the closing owing a refund on a payment naming another seller's tag (no text says such a payment is no purchase; with F414 the first hop names the converter's own tag, so routes no longer meet it);
  - the first-payer case itself (the claim's validity on its rail: decided in F414, the vectors now on a held rail specification);
  - the inner deal's consent, under my first reading: rebuilt on the stranger's reading, now decided by the texts.

**Its points on my sentences, and what I did:**
- *Fixed:*
  - the contest paragraph no longer contradicts Money on a first payer with no claim (the purchase is the service's own; a bare-key payer contests by a key-8 claim);
  - "stopped or broken" became "stops (rule 27) or is not valid";
  - rule 24's first sentence admits a part;
  - the first payer is read from receipt field 2 alone;
  - the last hop's tag may be in a claim's key 4;
  - "astray" no longer cites rule 28 for what it does not say;
  - rule 28 now covers money owed back on the last hop (the usual refund is no purchase), names the seller's agreement, and says each hop owes what it received;
  - rule 8 says records are counted one by one, "until the rail answers each";
  - rule 27's italic says a forward in flight shows owed at once;
  - Development rule 3's words no longer reuse "publication" and "claim";
  - the price-change sentence parses, and covers a change of payee;
  - the suite's 4l is a sixth purchase, and 4g's out-of-order "fifth" is "another";
  - the MICS's route paragraph and receipt field 8's comment no longer give claims a batch;
  - the inner deal's italic follows rule 1's reading.
- *Questions:* all decided in F414 (sections 5 and 6).
- *Left as written:*
  - the Identity worker's Q-I1 sentence (the stranger would extend it to several pending or unknown acknowledgements; the core already judges those both ways);
  - "until the home has so rotated, or both so sit" (rewritten with F414: the home not yet proven, its two receipts left out).

**A second reading, of F414's sentences and their 13 cases** (the same limits): **13 agree.** Two rest on weaker ground than the builder's words:
- that a payment naming another seller's counted tag, paid to the collective, is no purchase rests on the suite's 9f and Money rule 18's "pays the price … to the tag's payee", not on a rule that says so;
- the claim refused by the rail rests on rule 11 ("the act naming what the rail's proof commits to counts") more than rule 18.

Its points, all fixed in the texts (the core already read so):
- a refund to a bare key repaid by the collective's own claim in its history;
- the contest paragraph and Money now agree that the service is the buyer only where the first payer's claim, valid on its rail, does not cite the tag;
- key 4 is "what the first hop follows (on a rail binding purpose, what its commitment names)", and the buyer is read from the citation alone;
- the MICS says "in its `refs`", and an italic in Envelopes rule 20 says that other MIRs may read what a `refs` entry names;
- the citation is of "the tag version" the last hop names;
- a contest naming the first-hop claim is shown beside the last hop's purchase;
- a refund the line does not place stays owed and visible, and does not block the closing;
- rule 93 says its two exceptions and their tests apply to refunds owed too.

Left open: a claim citing several price tags (the core reads any matching citation).

## Vectors

- 501 verdict cases, 53 of them new, every one made by the core's own functions.
- Every earlier case keeps its verdict, acts and ids, save the four above, each a decision's own case.
- New questions: "route buyer", "refund along", "specification claim, reading Agreements".
- Both READMEs are updated, the c-box's too.
- The library's check (`core/tests/vectors.rs`) knows the new questions.
- The Python check: all 276 vectors agree, 98 verdict cases judged there.

## Checks

- **Here, at `6c9dde0`:**
  - `cargo test --workspace`: green (core, relay, harness, the WebAssembly crate);
  - `python3 core/vectors/check.py`: all 276 agree, 98 verdict cases judged;
  - the generator gives the same bytes again;
  - `scripts/c-box/make-c-box.sh`: 8 texts, 12 vector files;
  - the display client's reproducible build: 2 of 2.
- **The deal invariants** (`deal_promises_hold`): a random seed failed, on S7i's head as on this branch, so S7j did not cause it. The core counts a later clone as reliance where the clone keeps its own completeness by being relied on in turn. Rule 47 says so: "once that version is itself complete", and a version relied on stays complete. The oracle accepted only strictly valid signatures. The oracle now reads it by the same rule, and the seed passes.
- **The releases:** main merged (empty). The WebAssembly is rebuilt, then `npm run release` in `clients/site`, `dub`, `kishib`, `damgar`, `ummia` and `desk`. Only their `built/` changed. Kišib's airgap WebAssembly was rebuilt too, as it depends on the core.
- **Ummia's pinned hashes, final for these texts** (`clients/ummia/src/cards.ts`): see below. They are computed as its test computes them. The same script gives S7i's published values on S7i's texts.
  - `MICS_HASH = 'ff3335579e323954b4918277b4ce94808e1959c591494c6749060617e5c83e0a'`
  - `SUITE_HASH = '222f9b4d7b63b867fd8a328548eb337f673ab0f9ce7d33e5c7dfbdcb7b934804'`
- **GitHub, at `6c9dde0`** (F414's second part and the releases rebuilt again; run 41336902123, read by me): **green save the suite's two.**
  - Green: the Rust workspace; the vectors byte for byte; the Python check; the WebAssembly; every client but two (Kišib included); the modules; the reproducible display client and its fingerprints; regtest; Nakišib; Kišib's seal on macOS; the site in WebKit; Edubba's release.
  - Red, the suite's, one test each: `clients/collective`, "QG1 and F197" (`rb.test.ts`); `clients/ummia`, the eight texts' hashes (`cards.test.ts`).
  - The commit after it carries this report only.

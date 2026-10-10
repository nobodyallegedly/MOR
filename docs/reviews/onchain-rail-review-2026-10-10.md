# Hostile review of the on-chain rail (roadmap step 12a)

*10 October 2026. Written for Nobody, allegedly, after step 12a was built and merged (`docs/onchain-rail-step-12a.md`, main at `b0e30e7`). Targets: the on-chain rail Module draft 1 (`modules/module-onchain-rail-draft-1.md`), its code (`modules/onchain/`), the end-to-end test (`harness/tests/onchain_rail.rs`), read against the payment cMIP draft 2, the Lightning rail Module draft 2, Finance draft 6 (rules 8 to 16, and rule 15 in full), roadmap steps 12a and 14a, and findings F111 to F117, F128 (W4), F131 (IT3), F164, F168 to F181, F193 and F194. The two decisions of 9 October 2026 are taken as given: a request rail by pay-to-contract, no OP_RETURN; the vault an ordinary Bitcoin key changed only by a rotation. Nothing in `spec/`, `modules/` or the code was changed. What could be reproduced is reproduced in one new test file, `modules/onchain/tests/review.rs` (8 tests, all passing, run with `cargo test -p mor-onchain --test review -- --nocapture`); each test says in its name whether it shows a break. The brief's third attack item arrived empty (the message ended at "3."); it is not covered here.*

## In plain words first

The rail does what it says in the ordinary case: the address really is the payee's key mixed with the payment's fingerprint, only the payee's declared request key can sign a request, a payment to any other address or for any other amount is refused, a forged block chain is refused unless it carries real work, and a proof with fewer than six blocks on top is pending. I could not make the rule accept a wrong payee, a wrong amount, a wrong purpose, a request from the wrong key, a tampered Merkle branch or a broken header chain. The theft rule and the pending claim behave exactly as the build report says.

**Two things break, one of them in a common case.**

First, "one payment, one proof" is false without any reorganisation. Bitcoin's Merkle tree repeats the last transaction of every odd row, and a transaction sitting in such a spot has a second position in the tree whose proof is different bytes and verifies just as well. In blocks of ordinary size about one transaction in eight sits in such a spot. A payer whose payment lands there can write a claim with the second proof, and Finance, which tells payments apart by their proof's bytes, counts the payment twice: a debt of 2,000 paid with 1,000 shows discharged. A payer who mines can put its payment there on purpose. Question 3 thought this needed a reorganisation first; it does not.

Second, neither answer the build offers for question 2 is free, and the report's "cost: none found" for its preferred answer is wrong. Under option 1 (the pending claim's anchor counts once the same payment is proven), a payer in the theft window anchors a claim for a transaction it never broadcasts, waits until the owner has changed the locks, and only then pays the thief's address: the pending claim's anchor is before the point, so the owner bears a payment made after it changed the locks. Under option 2 (only a valid claim's anchor counts), the owner gains an hour-wide lever that no prompt anchoring beats: receive a payment at your own flow, change your locks and anchor the quorum within the hour, and the payment, confirmed after the point, counts for nothing while your own key holds the coins. On Lightning that lever is beaten by anchoring at payment (F178); on-chain it cannot be, because no valid claim can exist before six blocks.

**One cost is larger than stated, and grows.** The floor that makes a forged proof cost real work is a fixed number in a Module that will be frozen. Today six forged headers at the floor cost about 0.7 of a block, roughly 2.2 BTC of forgone reward; at ten times today's hash rate, 0.07 of a block. The payments it pays to forge are the large ones, which rule 14a sends to the vault: the rail's weakest point sits exactly where the vault's purpose is. And in the other direction: at the difficulty Bitcoin had in July 2021, every honest Bitcoin proof would answer unknown, because the network's own target was easier than the floor.

The rest is smaller: the Module's own text overstates what a receipt proves (the rule never reads whose coins paid, so a payee holds a valid receipt naming any payer, as on Lightning); a request rail's guarantee that the buyer pays the version the seller committed to rests on the request key, which is the online one; and a few client-conformance traps. What held, with what I tried, is listed at the end.

## How findings are marked

- **BREAKS**: an attack works, or a common case does not work, under the text and code as they stand.
- **COST**: a stated cost that is larger, or differently shaped, than the text says.
- **CONFLICTS**: two texts, or a text and the code, disagree.
- **UNCLEAR**: the text can be read two ways, or says something the rule does not check.
- **HOLDS**: I tried an attack and it failed; I say what I tried.

Each finding gives the sentence, the smallest story, who gains, whether they can pull it, and the test that reproduces it where there is one. Ordered by weight.

## 1. One payment, two valid proofs in one block, no reorganisation needed. BREAKS (the Module, "One payment, one proof"; Finance rules 8a, 10, 15; question 3)

**Sentences.** The Module: "For a payment confirmed in a given block, the valid proof is unique: the request signature the payee's side gave, the transaction without its witness, its output, its position, its branch, and exactly N headers." Rule 8a: "Receipts or claims MAY share a rail proof only if they name the same batch"; rule 10 and `paid_toward` key claims by proof bytes; question 3 in the build report: "a payment re-mined after a reorganisation has a second valid proof", and option 3, "as now, a stated cost, rare; it needs a reorganisation first".

**What happens.** Bitcoin hashes a row of an odd number of nodes by duplicating its last node (the behaviour behind CVE-2012-2459). A transaction whose node is that last one, at any level of the tree, has a sibling at that level equal to itself, and `dsha256(x || x)` is the same whichever side `x` is on. So the index with that level's bit flipped, with the very same branch bytes, gives the same root. The rule (step 8) checks only that the branch from the txid at `index` gives the header's root; it accepts both indexes. The two proofs differ in one integer, so they are different bytes, and Finance treats them as two payments.

**Story.** A block holds the coinbase, another transaction, and Alice's payment last (three transactions; the tree has four leaves). Bob's watcher builds the honest proof with index 2. Alice writes her claim with index 3 and the same branch: valid. Toward a debt of 2,000, Bob's receipt counts 1,000 and Alice's claim, carrying "another" proof, counts 1,000 more: 2,000, discharged. With five transactions and the payment last, there are three twins (indexes 5, 6 and 7): one payment, four proofs.

**How common.** It depends on the block's transaction count: over blocks of 1,000 to 4,000 transactions, on average 12.2% of transactions have a twin, and in 90% of block sizes at least 1% do (a block of 3,000 transactions: every transaction from index 2,048 on, 952 of them). A payer cannot choose its position, but one payment in eight will have one; a payer who mines, or pays a miner for placement, chooses it.

**Who gains.** The payer, every time its payment lands in such a spot: a debt paid in half, a purchase counted twice toward anything summed by proof. The payee's two receipts with twin proofs would also both count (rule 8a's "neither counts" fires only on shared bytes), though I found no case where a payee wants its income counted twice.

**Tests.** `break_one_payment_has_two_valid_proofs_in_one_block_when_its_merkle_node_is_duplicated` (the rule), `break_a_twin_proof_counts_one_payment_twice_as_finance_stands` (Finance: `paid_toward` gives 2,000 for one payment of 1,000), `how_often_a_payment_has_a_twin_proof` (the count, checked by brute force on small blocks).

**Readings, not decided.** Either the Module makes the proof canonical (a rule step: where the sibling at a level equals the running hash, the index's bit at that level must be 0; then the twin is invalid), which keeps "one proof, one payment" true and changes nothing in Finance; or Finance stops identifying a payment by its proof's bytes, which is question 3's option 1 or 2 and answers this and the reorganisation case together. The first is a Module change (the Module is a draft, and experimental); the second is a Finance change. Both at once would be belt and braces. Note that the canonical-index fix alone leaves question 3's reorganisation case as it is.

## 2. Question 2, option 1: a pending claim anchored in the window protects a payment made after the lock change. BREAKS, as a reading (the build report, question 2: "Cost: none found: a pending claim never confirmed protects nothing")

**Sentences.** Option 1: "The pending claim's anchor counts, once the same payment is proven valid. Rule 15 reads the earliest anchor among the payer's claims of the same payment, provided one of them is valid. Needs 'the same payment' (question 3)." Question 3, option 1: "The commitment identifies the payment."

**Story.** The thief has Ana's phone and has re-pointed the label's deal to the thief's address (the window). The label computes the commitment for a royalty, gets the thief's request, signs a transaction paying the address, and anchors a pending claim carrying that transaction at 100, without broadcasting it. Ana changes her locks; her home's receipt is anchored at 160. The label now pays the same commitment with another transaction, or broadcasts the one it kept; six blocks; the valid claim, anchored at 170. Under option 1 read by commitment, the pending claim is a claim of the same payment, its earliest anchor is 100, before the point, and rule 15 counts the payment: the owner bears a payment the label made after the lock change. Identified by transaction instead (question 3's option 2), the two claims are two payments, and the label must have anchored the very transaction later mined; it can, by holding a signed transaction back, so the trick survives, with one more step. The test shows the inputs: as Finance stands nothing counts; `claim_in_time` says the pending claim is in time and the valid one is not; `rule_15` over both claims answers "counts".

**Who gains.** The thief (the money reaches its key) and a colluding payer, who splits it, or a payer who alone wanted a reason to pay late; the owner bears. The cheapest colluder is the thief itself as the payer, buying the owner's work for nothing. Can they pull it? Yes: a pending claim costs a signed request and a signed transaction, and the rule cannot tell a transaction kept back from one stuck in the mempool.

**Why it was missed.** On Lightning a claim is valid at payment, so "anchored at payment" and "paid" are one moment. On-chain the anchor proves when the claim was written, not when the chain took the payment; the only thing that proves that is the block, which is on another reference than the clock, unless the clock is the Bitcoin chain itself (step 14a). A reading worth putting beside the options: on this rail the proof's own headers are an anchor of the transaction on Bitcoin, and where the owner's clock is Bitcoin (as 14a intends), "the payment's block is before the lock change's block" is the comparison rule 15 wants, with no claim act in between. That would make this rail the one where rule 15 is checkable from the chain alone. It is not an option the build listed, and it needs Finance to let a rail Module supply a point on a reference.

**Test.** `question_2_option_1_lets_a_pending_claim_anchored_in_the_window_protect_a_payment_made_after_the_lock_change`.

## 3. Question 2, option 2: the owner's lever is an hour wide and no anchoring beats it. BREAKS, as the rules stand (rule 15; F178, "a client that anchors promptly defeats it"; F181 item 3)

**Sentences.** Rule 15: "the owner, by a lock change after receiving payments, can put in doubt every payment it affects whose receipt the rotation did not keep ... and whose claim is not anchored by the point (F181); the lock change is visible on the owner's chain forever, counts only from a home's anchored receipt (F177), and a client that anchors promptly defeats it (F178)." The Module: a claim written at payment is pending; the valid claim exists after six blocks.

**Story.** The label pays 20,000 on-chain to Ana's own flow (Ana's own key: no thief anywhere), and anchors its claim at payment, at 100, as rule 15 tells it to. Within the hour Ana signs a rotation disowning her own flow pointer "as stolen", her home receipts it, and the quorum is anchored at 160. The payment confirms; the label writes the only claim that can be valid and anchors it at once, at 170. The payment is affected by an anchored lock change; Ana signs no receipt; the claim anchored by the point is pending, the valid one is late. `paid_toward` is 0: the debt stays open, Ana holds the coins, and the label pays twice or goes to Law. The promise that prompt anchoring defeats the lever is kept on Lightning and broken on-chain for every payment, for the six blocks plus the anchor's own delay (twelve blocks if the clock is Bitcoin).

**Who gains.** The owner, against any on-chain payer, for the price of a visible rotation. Can they pull it? Yes, and more easily than on Lightning: the window is the rail's own confirmation time, not a race against the payer's client.

**Test.** `question_2_option_2_gives_the_owner_an_hour_wide_lever_no_prompt_anchoring_beats`.

**Together with 2.** Option 1 hands a lever to the thief's side, option 2 to the owner's. Whichever is chosen, its cost should be stated at this size, and the reading in finding 2 (the payment's block as its point, where the clock is Bitcoin) is the only one I found that gives neither side a lever.

## 4. The floor: fixed in a frozen Module, cheaper to beat every year, aimed at the vault, and able to refuse honest proofs. COST (the Module, "The floor", "Costs, stated"; parameters to confirm)

**Sentences.** "Forging N headers costs at least N × 2^76 hashes: about 0.8 of a block's work in 2026 for N = 6." "A payment worth more than that is protected by the proof alone only as far as that." "Unknown if a header's target is above this network's floor."

**The arithmetic** (test `the_floor_on_bitcoin_costs_and_protects_this_much`, from the rule's own `target`): the floor is difficulty 2^44, 7.6 × 10^22 hashes per header, 4.5 × 10^23 for six.

| Difficulty | Six floor headers, in blocks | In BTC at 3.125 subsidy | Honest proofs |
| --- | --- | --- | --- |
| 13.7 T (July 2021) | 7.7 | 24 | **unknown**: the network's target was easier than the floor |
| 150 T (early 2026) | 0.70 | 2.2 | verify |
| 1,500 T | 0.07 | 0.22 | verify |
| 15,000 T | 0.007 | 0.02 | verify |

**Three consequences.**
- **It gets cheaper.** The cost of a forged proof is fixed in hashes; its price in money falls with the hash price, which has fallen in almost every year of Bitcoin's life. A Module frozen at publication (Production) carries this floor for its life; the only remedy is a new Module, which for the vault means a rotation with the safety key (F115).
- **It is aimed at the vault.** Rule 14a sends every payment above the unit's limit to the vault. The payments worth forging a proof for (today, above about 2.2 BTC, less the fee a miner forgoes) are those. A payer with hash power, or renting it, discharges a large debt without paying; the payee's answer is outside Finance (finding 6 of the questions, below: under question 1's option 1 there is no input for a counter-proof either). The Module states the cost in one sentence; it should say which payments it falls on.
- **It can refuse the truth.** At any difficulty below 2^44, which Bitcoin had until 2021 and could have again after a large fall in hash rate, every honest Bitcoin proof answers unknown, and the rail stops. The Module's text does not say so.

Beside this, the rule reads nothing else of a header: no difficulty schedule, no timestamp order, no checkpoint. Six headers with six different targets, times running backwards, and a first header building on a hash no chain ever had, answer valid (test `the_rule_reads_no_difficulty_schedule_timestamp_or_checkpoint`). That is the design (Production rule 12, no network), and the floor is the whole defence; I record it so the parameter is confirmed knowing what it carries. For the choice of N and the floor: N should be chosen from the forgery cost against the amounts the vault will hold, not from reorganisation risk, since a forged six-header chain costs a tenth of a six-block reorganisation and needs no majority; question 1's option 3 is the only option of the three that touches this, and only if its number comes from the floor.

## 5. The rule proves payment to the key, not payment by the payer. CONFLICTS (the Module, "What a verifier ties together": "The payee alone can sign a request and a receipt, but cannot make the payer's claim, nor a transaction from the payer's coins")

The sentence is true and beside the point: the rule reads of the transaction only its outputs; it never reads whose coins it spends. Bob pays his own tweaked address from his own coins, with a commitment naming Alice as payer, and holds a receipt that the rule and the payment cMIP answer valid: "Alice paid Bob 5,000" (test `the_payee_alone_holds_a_valid_receipt_naming_any_payer`). The Lightning Module says of itself, rightly, "its receipt naming a payer proves only what the payee says; the claim is the payer's"; the on-chain Module's text suggests more. What such a receipt buys the payee is little under Finance (it discharges Alice's debt, a gift) and shut off in Law since F193 and F194 (only the committed payer's claim acknowledges a delivery; no service is paid on its own record), so no attack follows; the text should match the Lightning Module's.

## 6. The request key is online, and W4 rests on it. UNCLEAR (the Module, "The request", "A thief with the vault's request key can make the payee's side commit to payments, but every such payment still goes to the vault's own Bitcoin key: it can sign requests, never spend")

True for the money. But what a request commits to is not only the address: it is the whole commitment, the purchase's claim and line included, and the request rail's promise (F128 W4, Finance rule 10c) is that "the claim a purchase names is the one the seller's request committed to", on the payee's side "MUST sign only" the current claim (client conformance). A thief holding the request key makes the seller's side commit to any version, so a buyer can be sold a version the seller has left; the money still reaches the seller, so the loss is the sale under wrong terms, not the coins. Lightning has the same shape (the node is online). It should be in "Costs, stated", beside "a vault's request key must stay reachable", and the Module should say that `request` equal to `key` for a flow puts the flow's Bitcoin key online for signing requests, which is what a flow is for anyway.

## 7. Smaller findings

### 7a. More than six headers is invalid, not valid. UNCLEAR, a trap (rule step 11)

A watcher that collects "the headers built on it" to the tip and overshoots gets invalid, the same word as "paid to an address not tweaked by this payment's commitment". The reference client caps at six; the Module should say, as client conformance, that the proof is truncated to N, and should say why the answer is invalid rather than valid (uniqueness, which finding 1 shows is not achieved anyway).

### 7b. Sweeping to the bare key links the output to the payee. UNCLEAR, client conformance (the Module, "A fresh receiving address": "Nobody watching the chain can link ... an output to the payee's declared key")

The end-to-end test sweeps the tip to `taproot_script(&address.key)`, the untweaked key's own address, which is the one thing on the chain that ties the output to the key the pointer publishes. The Module says nothing about where a payee moves its money. One sentence: a client never sweeps to the declared key itself.

### 7c. Nothing in the proof names the network. HOLDS today, worth a line

The proof carries no network; the address does, and the unit check (step 2) ties the amount to it, but the headers are told apart from another network's only by the floor. A mainnet address paid on testnet with testnet headers is refused only because testnet headers are easier than the mainnet floor; as far as I know testnet3's difficulty has always stayed well below 2^44 (to be checked against the chain before the floor is confirmed), so it is no cheaper than forging. Worth stating in the Module so the floor's second job is known when the parameter is confirmed.

### 7d. For step 14a: the same tweak, two meanings, and anchors inherit question 1

The Module says anchoring "reuses it with a batch's Merkle root in place of a payment commitment". An output is then "K tweaked by a 32-byte root", whether the root is a payment commitment or a batch root; whoever holds K and chooses the batch's contents (the anchoring service) can make the batch root equal any 32-byte value it likes, a payment commitment among them, if a batch of one leaf has the leaf as its root. Domain-separate the batch root (a tagged hash) before 14a reuses `p2c`. And an anchor on this rail is a proof under this Module's rule: six confirmations, final or not as question 1 decides. Rule 15's lock-change point and every claim's anchor will rest on it, so question 1 is also "can a lock change's point be undone by a reorganisation", which answers itself in favour of option 1 for anchors.

## The three questions: who gains under each option

Readings only; nothing is decided here. "Pull it" asks whether the gainer can bring the case about on purpose, and at what price.

### Question 1. A payment counted at six confirmations, then taken back

- **Option 1, final at the Module's confirmations.** *Gains:* whoever can rewrite six Bitcoin blocks keeps goods and money; on Bitcoin that is a majority of the world's hash rate for an hour, forgoing about six block rewards (19 BTC and the risk of failing), so a payment worth more than that. *Also gains:* everyone who built on the payment (a split's payouts, the next hop, an anchor): their state never reopens, and two verifiers never disagree. *Hidden cost:* option 1 gives the rule no input beyond the proof, so a **forged** proof (finding 4: 0.7 of a block, no majority needed) cannot be answered either; the payee's only recourse to both is Law. On test networks everything is a reorganisation; the end-to-end test shows it, so a client must say that test-network proofs mean nothing, which the Module does. *Pull it:* a reorganisation, rarely; a forgery, by anyone with a block's worth of hashing, for any vault-sized payment.
- **Option 2, undone by evidence.** *Gains:* the payee of a reorganised payment (the record follows the chain), and the payee of a forged one, which this option alone can answer: a heavier chain without the block undoes both. *Loses:* finality; every act built on the payment reopens; verifiers with different evidence disagree. *Attack:* a counter-proof must be heavier than the proof it answers, so against a real six-block proof it costs a little more than six blocks of work in forged floor headers (about 19 BTC today, falling with the hash price); a payee could un-record a purchase it regrets, a rival un-record a sale, and, through 14a, anyone un-record a lock change's point and reopen a theft window. *Pull it:* at a price, by anyone, with no majority; the price falls every year, as finding 4 says.
- **Option 3, confirmations growing with the amount.** *Gains:* the payee of a large payment, at the payer's cost in waiting. It changes the reorganisation cost in proportion and the forgery cost in proportion, so it is the only option that touches finding 4, and only if the number is set from the floor: to make forging cost the amount, N is about the amount divided by an eighth of a block reward (a 100 BTC payment: about 275 headers, two days). *Pull it:* nothing to pull; it narrows option 1's cost without changing its kind.

### Question 2. The theft rule meets a claim still pending

- **Option 1, the pending claim's anchor counts once the same payment is proven valid.** *Gains:* the honest payer whose payment confirmed after the point; and, as finding 2 shows, a payer who anchors a claim for a transaction it never sends and pays after the lock change, with the thief. "Cost: none found" is wrong. *Pull it:* yes, cheaply; the thief as its own payer is the cheapest case. Identifying the payment by transaction instead of commitment leaves it one step harder, not closed.
- **Option 2, only a valid claim's anchor counts.** *Gains:* the owner, with an hour-wide lever against every on-chain payer (finding 3), beating F178's promise. *Loses:* every honest payer in flight at the lock change, which is not rare if an owner is being robbed and reacting. *Pull it:* yes, by the owner alone, more easily than on Lightning.
- **A third reading, not among the options:** where the owner's clock is the Bitcoin chain (14a), the payment's block is its anchor, and "mined before the lock change's point" is the comparison. It gives neither side a lever and needs Finance to let a rail Module supply a point on a reference. Where the clock is another reference, the two options above are what there is, and the chosen one's cost should be stated at the size found here.

### Question 3. One payment, two proofs

- **Option 1, the commitment identifies the payment.** *Gains:* honest accounting; it answers the reorganisation case, finding 1's twin, and any future rail whose proof is not unique. *Loses:* a payer who really pays the same commitment twice (two outputs on the chain) is counted once, and the second payment is not even an open refund; on Lightning that cannot happen (a payment hash is paid once), on-chain and on a push rail it can. It also opens finding 2 at its widest, since "the same payment" is then whatever shares a commitment, mined or not. *Pull it:* nothing to pull; the costs are stated.
- **Option 2, the rail Module identifies the payment.** *Gains:* the same honest accounting for the two cases found (both twins and a re-mined transaction share the outpoint), with Finance staying rail-agnostic: "the same payment" is one more question a Module answers. *Loses:* a Module can answer it wrongly, and this Module's draft 1 would have answered "the proof's bytes". It narrows finding 2 by one step without closing it.
- **Option 3, as now.** *Gains:* the payer, in one payment of eight on-chain (finding 1), and anyone with a reorganisation; not rare, and not needing a reorganisation. Stating it as a cost is not available.

## What held, with what I tried

- **The tweak binds the commitment.** `pay_to_contract` is BIP 341's output key (checked against rust-bitcoin in the Module's own tests); another commitment, another address; the untweaked key, the BIP 86 key, the request key's address and the vault's address presented as the flow's are all refused. A payer cannot relabel: amount, purpose and payee are in the commitment, so a changed claim recomputes another address the transaction did not pay.
- **The request.** Signed by another key, by the money key instead of the request key, or over another commitment: invalid. The request signature cannot double as a Taproot spend: the message is a tagged hash under this Module's tag, the sighash another's, and key-path spends sign with the tweaked key.
- **The block.** A branch with a wrong sibling or wrong index (short of a twin), a header not naming the one before, a header above its own target, a transaction the block does not hold: invalid. Headers easier than the network's floor: unknown. Fewer than six: pending; more: invalid.
- **Shapes.** A transaction of 64 bytes is refused (a payment with a Taproot output is at least 94 bytes, so no honest one is); the witness serialisation is refused; outputs, counts and compact sizes are read as Bitcoin Core reads them; the Merkle branch and index guards cannot panic.
- **Before confirmation.** A claim at payment and a claim at k of 6 are pending, inert for rules 8a, 10 and 15, and stay so forever; a reorganisation before six undoes nothing counted.
- **Through the cMIP.** A claim by someone other than the committed payer, an anonymous claim without its key's signature, a receipt moved from vault to flow: invalid. A vault holding one unit on both rails takes the smaller limit (F114).
- **Keys apart.** A thief with the request key cannot spend; a thief with the flow key cannot touch the vault; the vault's key is never on the chain except as swept to (7b).

## To confirm with the Module, read against this review

- **N = 6 and the floor 0x170fffff**: confirm knowing finding 4 (fixed, aimed at the vault, and able to refuse honest proofs below 2^44), and that they are the only thing standing between a payer with hash power and a valid proof. If N is to answer forgery rather than reorganisation, it is question 1's option 3 with the number from the floor.
- **"One payment, one proof"**: not true as written (finding 1); either the Module makes the index canonical, or Finance identifies a payment otherwise (question 3), or both.
- **"Cost: none found" for question 2's option 1**: withdrawn by finding 2; the cost of option 2 is finding 3.
- **The pattern-1 paragraph**: finding 5; "Costs, stated": findings 6, 7a, 7b, 7c.
- **For step 14a before it starts**: 7d.

*The brief's third attack item was not received: the message ended at "3." with nothing after it. Send it and it can be run against the same test file.*

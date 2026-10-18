# Damgar, round 2: report

*18 October 2026 (F338, F345, F349, F350, F351; H38, H39, H40). Round 2 of Damgar: apps paying with permission. A GitHub session: test identities only; regtest only; no real money; nothing touched the servers (homes and relays ran on local ports, the regtest network in the session's own folder). Branch `claude/damgar-round-2`, one pull request, not merged.*

## In plain words

Round 1 made every money act wait for a person in Damgar. Round 2 lets an app pay **by permission**: a **lane**.

- **A lane** is a permission you give an app in Damgar: "this app may sign these kinds of money acts for me, each at most this amount, until this date". It is a grant of your identity to itself (F351): the app makes a key and keeps it, and the grant names that key, never an app. So an app not yet written can hold a lane too. Damgar reads each lane to you in plain words before you sign it: what it may sign, the cap, the expiry and the clock that judges it, that the grant is public, and how to end it. **Lanes** lists every lane with its state (in force, revoked, past its expiry) and every act signed under it, with **Revoke it**.
- **Dub's lane.** You ask in Dub (its identity window, "Paying from Dub: a lane from Damgar"). The request travels as an act sealed to yourself. You grant it in Damgar. Then a tip, or a pay-per-view purchase, is paid from Dub itself: **Pay now, under the lane**. Past the cap, after the expiry or once the lane is revoked, Dub refuses and says why. The money still moves in your wallet: Dub shows the invoice and takes the preimage back.
- **The payee's side, by itself.** The payee's Damgar can hold its own lane, "Receipts and invoices, by itself". Below its cap it answers invoice requests (with an address, or with an invoice its node made) and signs receipts without asking. To make Lightning invoices it needs a **receive-only permission** from your node (on lnd, a macaroon that can make invoices and nothing else). It is off by default and explained in Settings with its cost, and you can remove it. Damgar refuses a permission that can read the balance (F351). With both lanes, a small tip is one tap for the payer, plus paying in the wallet, and nothing at all for the payee.
- **Every step by hand.** A setting, off by default, for those who want to follow the real process step by step. When it is on, every signature waits for you, as in round 1. The account shows, for each act, whether it was signed by hand, by Damgar itself, or under a lane (and which one), and, for the other side's acts, on whose authority.
- **A pay-per-view post.** In Dub, **Seal a post with a price**: the text is locked, and an offer states the price (and, if you like, a referral share). A buyer pays from Dub under its lane. The seller's Damgar signs the receipt by itself and tells the seller's Dub, which delivers the key, sealed to the buyer. The post opens in the buyer's Dub, its text checked against its fingerprint.
- **Referral through a repost (film 3).** A third person reposts the sealed post at their relays. A buyer who reads only those relays finds it there, buys it, and names the repost in the claim. The seller's Damgar then prepares the referral share and asks the reposter for it under its "Referral shares, by itself" lane. The reposter's Damgar answers, and signs the receipt by itself. This is **a promise in words, not judged** (F351): the offer's words state the share, and no rule checks that it was paid. The judged form, a split plan, is round 3's (F215). Not a gap.
- **Finding each other across homes (H38, H39).** IDs now have a form written for people: `mid1…`, with a checksum, so a typo is caught (F349). **Copy ID with where it lives** adds a home and a relay to it (`?r=`). **Follow** and **To…** take either form, an ID with a home address beside it, or the old hexadecimal. Where an ID is asked, an act's form is refused, with the reason. Dub can **Change its relays** for an identity it made: a new routes act, read back first. Homes change only in Kišib. An identity brought into Dub keeps publishing no routes (reading 5).
- **Every app shows and takes the forms**: Dub, Edubba, Kišib, Damgar, Ummia, the reader and the connector. Each also still takes the bare hexadecimal.
- **Kišib** has a top-level door, **Change the vault** (H40). It says first that changing the vault is a change of keys.

Every check is the core library's: the forms, the grant and its reach, the lane's cap judged by the grant limits cMIP, the rail's proof, the key against the sealed post's fingerprint.

## The questions asked, and their answers

1. **4a, the forms for people** (F349). Proposed: placement in Identity, bech32m. Answered: bech32m (BIP-350), lowercase (all capitals accepted, mixed case refused), one label per kind of thing hashed: `mid`, `mact`, `mkey` (deterministic CBOR `[scheme, key]`), `mspec`, `mwork`. No form for any secret. The where-it-lives form is the short form plus `?r=` hints, outside the checksum. Bare 64-character hexadecimal stays accepted everywhere. Vectors for each label, a mistyped string, a cut string and a wrong label. Built so: Identity draft 14, "Written for people"; `core/src/textual.rs`; `core/vectors/textual-forms.json`.
2. **A receipt or a claim under a person's grant** (F350). Money rule 7 allowed grant keys only for a split service. Answered: Money draft 9, rule 7: a receipt or a claim may be signed with a grant key its party granted, if that grant reaches the act's type. It is judged as scoped by Agreements, and a Money-only client shows it unknown. Built so, with the core's check and its tests.
3. **Who a lane is granted to** (F351, question 1). Answered: to yourself. A grant whose grantee is its own grantor is valid, and its acceptance is the grantor's own (Agreements draft 15, rule 73).
4. **The referral** (F351, question 2). Answered: (A). The offer's words state the share, the buyer's claim names the repost (Money claim field 6), and the seller's Damgar prepares the payment. State the cost: a promise in words, not judged; not a gap (F215, round 3).
5. **Lightning invoices made by themselves** (F351, question 3). Answered: (a), a receive-only permission, off by default, its cost said, revocable, the manual path kept. This revises F338's "no wallet connect", for receiving only.

## Questions for Nobody, allegedly

1. **A lane's revocation and the tie rule** (Agreements rule 76). An act signed under a grant counts only if the revocation's history holds it. So when a lane is revoked, every act signed under it that the revocation does not cite stops counting, including receipts already given for payments made. Damgar cites in the revocation's `objects` every act under the lane that it finds at the identity's places (`actsUnder`). Edubba now cites the strand's tip when it revokes an agent's grant; before, its revocations voided every earlier act. **The cost:** an act under the lane that Damgar cannot find (signed by Dub at a relay Damgar does not read, say) is voided by the revocation. A lane used for a year makes a long revocation.
   - **(A) the build's lean, built:** keep rule 76 as it is. The app holding the lane keeps its acts at the identity's places (Dub does), and Damgar says, once it has revoked, how many acts it cited.
   - (B) Agreements' next draft: a grant's revocation cites only the last act of each strand under it, since an act's history holds those before it. This is shorter, but it needs lane acts chained in a strand (Dub's are not: each is sealed on its own).
   - (C) acts under a lane carry a clock's stamp, and a revocation voids only those stamped after it. This needs a clock on every payment.
2. **A grant carries no words.** A lane's name ("Dub on this computer") travels only in the sealed request and in Damgar's own record. Anyone else reading the public grant sees "a grant of X to itself" with its scope and limits, but no name. Should a grant carry an optional plain-words field (Agreements' next draft)? Lean: not now. A name in a public act is the person's to choose, and the scope and limits already say what it permits.
3. **An answer to an invoice request names no amount** (money messages cMIP, type 4). The grant limits cMIP judges a cap only from what an act carries, so it cannot judge the receipts lane's cap on an answer. Damgar checks it against the payment's amount before answering, and a receipt under the lane is still judged by the cMIP. Should the messages cMIP's next draft put the amount in the answer, so that every act under a lane is judged by the core? Lean: yes, a small field. Not written until answered.
4. **The sealed post's media specification.** Dub seals the text as an Envelopes publication whose media specification is the Text MIR's hash (its bytes canonical UTF-8 text). No rule names a media specification for plain text. Confirm this, or name another.

## What was built, precisely

| Part | Where |
| --- | --- |
| Money draft 9, rule 7 (F350) | `spec/MIR-money-draft-9.md`; the core: `core/src/agreements/view.rs`. `valid` refuses a person's grant-key receipt or claim whose grant does not reach its type (`person_grant_reaches`). `money_counts`, used where Money counts what was paid (`standing`, `payers_claim`, `receipts_for_proof`), also requires it to be backed or binding, cached per act. Test: `core/tests/agreements_collective.rs`, `a_persons_lane_signs_its_receipts_and_claims_f350`. |
| Agreements draft 15 (F351) | One sentence in rule 73: a grant whose grantee is its own grantor is valid, its acceptance the grantor's. |
| Identity draft 14 (F349), MICS v29, suite v29 | "Written for people": the labels, the refusals, no secrets, where-it-lives, bare hex, cMIP labels, stated costs. The suite's steps for F349, F350 and F351. |
| The forms in the core | `core/src/textual.rs`: hand-written bech32m (`encode`, `decode`, `read`, `with_hints`; `Refusal` in words, such as "this is an act (mact), not an identity (mid)"). Tests: `core/tests/textual.rs`, cross-checked against the `bech32` crate, with every single-character typo and every cut refused. Vectors: `core/vectors/textual-forms.json`, which `check.py` reads in Python on its own (130 agree). WebAssembly: `formEncode`, `formWithHints`, `formRead`. |
| The forms in the apps | `clients/genesis/src/forms.ts` (reading, through the core); `clients/genesis/src/shown.ts` (display only). Dub, Edubba (`clients/desk`), Kišib, Damgar, Ummia (`mspec`), the reader (takes `mact` links), the connector (takes `mact`; shows `mid` and `mact`). |
| The money messages cMIP, draft 2 | `cmips/cmip-money-messages-draft-2.md`: type 5, a lane asked; type 6, a sale. Draft 1's acts are still read. |
| Lanes in Damgar | `clients/damgar/src/damgar.ts` (`grantLane`, `ownLane`, `revokeLane`, `lanes`, `laneFor`, `byItself`, `authority`, `howSaid`, `payUnderLane`); `clients/grants/src/lanes.ts` (`reaches`, `grantsForKey`, `revocationsOf`, `actsUnder`); `clients/grants/src/grant.ts` (`authorityOf` opens a private act with the key it is given, so a cap is judged on the act's content; the words for a lane). Page: the **Lanes** tab, Settings' **Every step by hand**, **The clock for lanes**, **Making invoices by itself (receive-only)**. |
| The receive-only link | `clients/damgar/src/link.ts` (lnd REST, its certificate pinned; a permission that can read the balance refused), `link-say.ts`; `modules/lightning/regtest/up.sh` bakes `receive.macaroon` for each node. Program only: the web client never makes a link. |
| Dub's lane and pay-per-view | `clients/dub/src/money.ts` (Damgar's own code with a keep in Dub's place, `money-*`); `clients/barebone/src/sealed.ts` (the sealed publication, the lone seller's offer, the key delivery, the repost). |
| H38, H39 | `clients/dub/src/dub.ts` (`readIdWhere` in Follow, To… and the Private box; `relaysReview`/`relaysPublish`); `clients/dub/test/across.test.ts`. |
| H40 | `clients/kishib/src/page/view.ts` (the vault door); `clients/kishib/test/vault-door.test.ts`. |
| The connector | `clients/connector/src/read.ts`: a grant read ("A lane: a grant of an identity to itself"), and a sealed act under a lane ("A private act signed under a lane"). It can say that the lane stands; it cannot open the act. |

## Found while building (writing code is also a review)

1. **Money rule 7 had no place for a person's grant** (F350, asked and answered). Worse, the core counted any receipt signed with a grant key whose grant stood, whatever the grant's reach: a lane for claims could sign a receipt that counted. Fixed in the core with the rule, and tested (a claims-only lane's receipt: not backed, pays 0).
2. **Judging backing inside `valid` was exponential.** The first fix ran the whole backing judgement from `valid`, and the Rust workspace ran for over forty minutes. `valid` now checks only the reach; the full judgement (`money_counts`) runs only where Money counts, cached. The invariants take about 28 seconds (24 before).
3. **The tie rule voided a lane's earlier acts on revocation**, and Edubba's agent revocations had the same bug since they were built. Both now cite what is under the grant (question 1).
4. **`authorityOf` judged a private act's cap from its outside**, where no amount is visible. With the key given, it now opens the act and judges what it says.
5. **A payee's look-up lacks the payer's grant.** A claim under Dub's lane arrived as "unknown", not "scoped", since the payee had not fetched the grant. Damgar now asks for authority on any scoped or unknown act that names a binding.
6. **An answer carries no amount** (question 3), so Damgar judges the receipts lane's cap itself before it answers.
7. **An outsider cannot judge whether a sealed act under a lane is backed**: the connector says the lane is in force and that the act is private. It cannot say more without the key.
8. **A grant carries no words** (question 2).
9. **A hidden order between regtest tests**: the anchoring test relied on the test wallet's test having funded carol. It now funds carol itself.
10. **A channel's reserve**: bob's node could not pay the referral share from its new channel (the reserve held it). In the regtest test and human test 14 it is paid from alice, as a wallet the seller controls would.
11. **Links stay in hexadecimal for now.** The reader served at reader.dubsar.org is the old one and reads no `mact`. The reader here takes both, and Dub's links switch to `mact` once the new reader is served.
12. **A label says what was hashed** (F349): a lane's grant is an act (`mact`), never a key, though it names one.

## Readings (to confirm), and costs

- **A lane asking for no cap is refused** in Damgar: every lane names a cap per act.
- **A lane's expiry** is judged by readers on a timestamp clock the person names (the grant limits cMIP, 3.1): until the clock stamps an act, whether it came before the expiry is unknown to them. Before signing, the app holding the lane refuses by its own clock once the expiry has passed. Without a clock named in Settings, a lane can have no expiry.
- **On-chain addresses are still answered by Damgar itself**, as in round 1, under the receipts lane where it reaches answers.
- **"By itself" means while Damgar runs with that identity in use**: its page looks every 20 seconds while To sign is open, and each look does what the lanes allow. A Damgar answering for every identity it holds, page closed, is not built; Dub likewise delivers a sold post's key when its main screen opens with the seller in use.
- **What Damgar does by itself** is done only under a lane it holds and within its cap, and never while "Every step by hand" is on. Lanes other apps hold still sign there: the setting governs Damgar, and revoking governs the lane.
- **The referral share is read from one sentence** of the offer's words ("Referral: N% of the price to the repost the buyer names."), rounded down. The repost must name the publication and be signed by the reposter. Cost: a promise in words, not judged (F351).
- **The sealed post's key** is delivered once per buyer, signed with the seller's own key (an Envelopes act, Dub's layer), and kept in the seller's Dub.
- **A lane's key is kept in Dub's folder** (`money-keys.json`), beside the identity's keys. A thief of that folder can pay within the cap until the lane is revoked. Said where the lane is asked.
- **The receive-only permission**: a thief of it can make invoices in the node's name and can never take anything. Said in Settings. Removing it is one button.
- **Where an identity lives, as given, stays in the app** (`people.json`, `where`). The sealed follow list carries no hints.

## Round 1's leftovers taken up (part 5)

- Round 1's reading "a Lightning invoice it cannot make" is now optional: the receive-only link makes it (F351).
- "Collective payments and splits" are now said as round 3's (F351), not round 2's.
- The hidden order between regtest tests (found 9) is fixed.

## Rails that would remove the invoice round trip (competitive layer, not built)

A tip today takes a round trip: the payer's app asks, the payee's Damgar answers with an invoice or an address, then the payer pays. Rail Modules that would remove it:

- **BOLT 12 offers**: a reusable offer in the payee pointer. The payer's node fetches a fresh invoice over Lightning itself, and the payment's commitment rides in the payer note. A Lightning BOLT 12 rail Module would need the offer's signature and the invoice's binding to the commitment as its proof.
- **A direct on-chain payment named in the pointer**: the payer derives the address alone from the payee's key and the payment's commitment (pay-to-contract, as the anchoring service does, or a silent-payments form). No answer is needed. The cost: the payee's wallet must learn each commitment to spend, from the claim.
- **Keysend and AMP do not qualify today**: the payer chooses the preimage, so it proves nothing about the payee's receipt.

## Tests

- **The core** (`cargo test --workspace`): RESULT_RUST.
- **Every client** (`npm test` in each): RESULT_CLIENTS.
- **Lanes** (`clients/damgar/test/lanes.test.ts`): a lane asked in Dub, read in plain words and granted in Damgar; a tip from Dub within it; the payee's Damgar answering through a receive-only link and receipting by itself; the account's how; the connector reading the grant and the sealed claim under it; refused past the cap, after the expiry, and once revoked, each saying why; every step by hand, off by default and, when on, every signature waiting; a permission that reads the balance refused. An act under a lane read as backed by Damgar, Dub and the connector.
- **Pay-per-view** (`payperview.test.ts`): the seller at one relay, the reposter at both, the buyer at the other only. The buyer finds the post only through the repost, buys it from Dub naming the repost, and the key is delivered on the receipt. The post opens; the referral share is paid; the accounts agree.
- **On regtest, with real btcd v0.24.2 and lnd v0.18.5-beta** (`regtest.test.ts`, `MOR_LN_REGTEST`): round 1's three, and round 2. A tip under Dub's lane, its invoice made by the payee's own lnd through `receive.macaroon` (the admin macaroon refused), receipted by itself; a sealed post bought through a repost on another relay and opened; the referral share paid. All four pass here.
- **H38, H39** (`clients/dub/test/across.test.ts`); **H40** (`clients/kishib/test/vault-door.test.ts`); the forms in each app's tests and the browser tests.
- **The releases**, rebuilt in this pull request from one WebAssembly: the site, Dub, Kišib, Damgar and Ummia, each built twice the same (`test/build/reproducible.test.ts`, `web-build.test.ts`).

## Human test 14: lanes, pay-per-view and finding each other, on the author's Mac and the web pages

*For Nobody, allegedly. Test identities only; regtest only: the coins exist only on the Mac. Homes and relays: the test homes, as in human test 11. Write one line per observation: what you did, what you expected, what happened, how it felt.*

**On the Mac**

1. **The Mac.** In Terminal, from the MOR folder: `git pull` (or `git checkout claude/damgar-round-2` before the merge). Then `cd clients/genesis && npm install && npm run wasm && cd ../desk && npm install && cd ../dub && npm install && sh scripts/make-app.sh && cd ../kishib && npm install && sh scripts/make-app.sh && cd ../damgar && npm install && sh scripts/make-app.sh && cd ../testwallet && npm install && cd ../..`.
2. **The regtest network.** As in `docs/damgar-regtest.md`: `modules/lightning/regtest/up.sh ~/mor-regtest`, and wait for "ready". Check that `~/mor-regtest/bob/receive.macaroon` exists (new: it makes invoices and nothing else). In a second Terminal window: `cd clients/testwallet && npm start -- ~/mor-regtest`, and open `http://127.0.0.1:8478/`.
3. **Three test identities.** Use P (the payer) and Q (the payee) from human test 11, or make them again in Dub. Make a third, **C** (the critic), display name "C". For each, write down its signing key's words. Bring all three into Damgar (**Bring an identity you have**), and **Accept these** with everything ticked. Check: the new entry "grant limits" is in the list.
4. **The forms (F349).** In Dub, Q's identity window: **Copy ID** gives `mid1…`, and **Copy ID with where it lives** gives `mid1…?r=…`. Paste each into a note. Change one letter of the first, then try to **Follow** it as P: refused, "checksum does not hold". Follow Q with the true one: Q's posts appear. In Damgar, Kišib and Edubba, check that IDs are shown as `mid1…`.
5. **Where Q is paid, and the receive-only link (as Q, in Damgar).** Settings: Lightning, bob's node key (from the test wallet), network regtest, **Read it back**, **Sign and publish it**, as in human test 11. Then "Making invoices by itself (receive-only)": `https://127.0.0.1:18081`, `~/mor-regtest/bob/receive.macaroon`, `~/mor-regtest/bob/tls.cert`, **Check it and keep it**. Read its cost. First try `~/mor-regtest/bob/data/chain/bitcoin/regtest/admin.macaroon`: refused, since it can read the balance.
6. **Q's own lane (as Q).** **Lanes**, "Receipts and invoices, by itself": at most 5000, unit regtest, Until empty, **Read it back**. Read every line, then **Sign this lane**. Check: it is listed as in force, its key held by this Damgar.
7. **Dub's lane (as P).** In Dub as P, identity window, "Paying from Dub: a lane from Damgar": keep "Dub on this computer", at most 2000, regtest, Until empty, **Ask Damgar for this lane**. In Damgar as P, **To sign**, **Look again**: the lane, in plain words (what it may sign, the cap, that it is public, how to end it). **Grant this lane**. Back in Dub, the fold shows it in force.
8. **A tip from Dub (as P).** On a post of Q's: **Tip**, 1500, **Pay now, under the lane**. In Damgar, **Use this one** for Q and leave **To sign** open: it looks every 20 seconds (or press **Look again**), and answers by itself with an invoice from bob's node. Check: nothing was asked of Q. Back in Dub as P, Private tab, "Payments, under the lane": the invoice. **Copy the invoice**, pay it from **alice** in the test wallet, paste the preimage, and **Check it and sign the claim, under the lane**.
9. **The receipt, by itself.** In Damgar as Q, **Look again**: "signed your receipt by itself". The account: came in 1 500, and the claim says "Signed under a lane of …" (P, a grant to itself), backed. As P: went out 1 500, the claim signed under "Dub on this computer". In **Lanes**, P's lane lists the acts signed under it.
10. **Past the cap.** In Dub as P, tip 3000, **Pay now, under the lane**: refused: "3000 is above the grant's cap of 2000 per act". **Prepare it for Damgar** still works, as in round 1.
11. **Every step by hand (as Q).** Settings, tick "Follow every step by hand". Tip Q 500 from Dub as P. Q's Damgar now waits: in **To sign**, an invoice to make, by hand as in human test 11, step 11. Untick it afterwards.
12. **A sealed post (as Q in Dub).** Public tab, "Seal a post with a price": the text "The recipe: two parts clay, one part reed.", what everyone sees "A recipe, sealed.", price 1000, referral 10, **Seal it and post it**. In Damgar as Q, Lanes, "Referral shares, by itself": at most 500, **Read it back**, **Sign this lane**.
13. **The repost (as C in Dub).** C's relays: in its identity window, "Change its relays", add a second relay (any test relay Q does not use), **Read it back**, read "A new routes act", **Sign and publish the new routes**. Follow Q, then **Repost** Q's sealed post. *(Optional: also try "Change its relays" on an identity brought into Dub: it says it publishes no routes for it.)*
14. **C's receipt lane and link (as C in Damgar).** Settings: Lightning, carol's node key, **Read it back**, **Sign and publish it**. The receive-only link with `https://127.0.0.1:18082`, `~/mor-regtest/carol/receive.macaroon` and `~/mor-regtest/carol/tls.cert`. Lanes: "Receipts and invoices, by itself", at most 5000, signed.
15. **The buyer reads only the other relay.** Make a fourth identity in Dub, **B**, its relay only the second one. Bring it into Damgar, and give it a lane as in step 7. In Dub as B, follow C by its ID (`mid1…`). The repost appears with its price; Q's original is not at B's relay. **Buy it, under the lane**: Dub says to name the repost you followed, and does. In Damgar, **Use this one** for Q, **Look again**: it answers with an invoice from bob's node. In Dub as B, Private tab, "Payments, under the lane": pay the invoice from **alice** in the test wallet, paste the preimage, **Check it and sign the claim, under the lane**.
16. **The key, delivered.** Damgar as Q: **Look again** ("signed your receipt by itself", "A sale of your offer", "your offer promises 10% to the reposter"). Then in Dub, switch to Q (opening Dub's main screen looks for sales and delivers the key), then switch to B. The post opens in B's feed with its text.
17. **The referral share.** Damgar as Q, **Look again**: "the referral share to C is asked for by itself". **Use this one** for C, **Look again** (it answers with an invoice from carol's node); back to Q, **Look again**, then **Pay**: 100 regtest satoshis. Pay it from **alice** in the test wallet (bob's channel cannot: its reserve), and paste the preimage. Damgar as C, **Look again**, then the account: came in 100, the claim "Signed under a lane of …" (Q), backed.
18. **Revoke a lane (as P).** Damgar, **Lanes**, "Dub on this computer", **Revoke it**. In Dub, tip again: refused, "“Dub on this computer” was revoked. Nothing was signed". Damgar said how many acts the revocation cites; the earlier tips stay paid in both accounts.
19. **Kišib: Change the vault (H40).** Open Kišib: the first screen has the door **Change the vault**. Open it and read the first words (a change of keys, the chain key's paper needed). Stop there, or go on as in human test 11, step 18.
20. **Stop.** `modules/lightning/regtest/down.sh ~/mor-regtest`; Ctrl-C in the other windows.

**On the web pages** (once this release is served: `https://dub.dubsar.org/`, Damgar's web client at damgar.dubsar.org, `https://kishib.dubsar.org/`)

21. **Dub on the web.** Make an identity, as above. Check: **Copy ID** gives `mid1…`, and **Copy ID with where it lives** carries `?r=`. Follow P by P's ID with where it lives (copied on the Mac in step 4's way): P's posts appear. Ask for a lane: its words say "Dub on the web".
22. **Damgar on the web.** Bring the web identity, grant its lane. Settings, "Making invoices by itself (receive-only)": it says the web client never makes a link. The **Lanes** tab lists the lane, and **Revoke it** works.
23. **Kišib on the web.** The door **Change the vault** is on the first screen. An identity's record shows `mid1…` and its acts as `mact1…`, with the hexadecimal beside.
24. **Report.** One line per observation. Mark anything not in plain words, any button whose effect surprised you, any proof not verified, and any refusal that did not say why.

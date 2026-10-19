# Round 3: collectives and their money, report

*Written for Nobody, allegedly, on 19 October 2026, by the session that built round 3 on the branch `claude/round-3`. Test identities only; regtest only.*

## In plain words

Round 3 is done, all four parts, each merged into `claude/round-3` only once its tests passed. If this session had stopped early, the branch would have held only finished parts. Nothing is left half built.

- **Part A**: a collective is founded from a grid. Its members get keys of their own as they sign. A member can leave alone. A member's own key acts for the collective from Damgar and from Ummia.
- **Part B**: Edubba's Publishing tab. Protected files (a text or a JPEG picture) and vows, published as oneself or as a collective. Each vow sale is confirmed or contested from Dub or Edubba. One identity's vow sales can be looked up at the relays you choose.
- **Part C**: the collective's money and its keepers.
  - The money is set in Edubba's Collectives tab: who owns the income, a referral share, and the split service that divides each payment. Every member signs it in their own app.
  - A buyer's payment then goes to the split service. The service signs the receipt for the collective and pays each member their part.
  - A lone seller gets the same, judged: a one-party deal with the referral share in its split plan, paid by the same service.
  - Keepers record the collective's acts, and an Edubba agent can be one. A member whose own key change disowns their signature is shown as a dispute, not a void.
  - A missed deadline is shown only when an anchor or the chain proves it.
- **Part D**: one end-to-end test with A, iPa and iPh runs the whole round. It passes on test nodes and on the real regtest network (btcd and three lnd nodes).

The six releases are rebuilt in this pull request (site, Dub, Edubba, Kišib, Damgar, Ummia). Each one builds twice to the same bytes.

**Where it stopped:** at the end. The pull request is open and not merged, as asked.

**What needs you:**
- **The five questions are answered** (F358 and question 5's decision), below; 1 and 5 are built in this round.
- **Readings to confirm**, each with its cost.
- **Human test 15**, at the end of this report.

## Questions for Nobody, allegedly, and their answers (F358)

All five were answered on 19 October 2026: 1 to 4 in F358, in the findings log; 5 below.

1. **Who signs the collective's payee pointer to its split service. Decided, (b)**: "It is a money matter and money areas should be able to do it. A founder should not have a special position if the constitution does not say so."
   - **Built in this round:**
     - Money draft 10, rule 7: a collective's pointer may be signed with the member keys of its area reaching Money, judged by Agreements with that area's holders and threshold.
     - Edubba signs the pointer with a Money area holder's own key and asks the area's other holders for theirs. The collective's own key signs none of it.
     - Damgar pays a collective through the pointer Agreements count.
     - The core's test shows the rule.
   - Reading 1 (the collective's own key) is withdrawn.
   - *Cost:* a Money-only client shows such a pointer unknown and cannot pay through it.
2. **A lone seller's deal: which pointer the buyer pays. Decided ("Agreed"), (a)**: the service's own pointer. The commitment's payee is still the seller, and its "paid to" names the service's pointer, as field 14 makes the service the agreement's designated pointer. The seller's own pointer stays theirs, for tips. As built.
3. **and 4. Keepers, redefined.** A keeper is a signed ordering mechanism serving proofs: it signs a sequence, checkable from any copy.
   - Its record format (OF21's `{ 0 => [act, signer] }`, type 2) goes into the core, which will read it.
   - Only anchors place anything on the clock. A keeper may anchor its own sequence.
   - Rule 33 becomes: a deadline is shown missed by an anchor, of the act itself or of a keeper's sequence. A keeper's word alone never says late.
   - **Where:** the freeze-ready drafts. Until then, round 3 leaves the keeper deadline path unbuilt, and its keeper logs stay client-stated, as built.
5. **What a keeper records. Decided**: the reach is right, but it was written for collectives only. Keepers serve any agreement, deals between solo identities included (rule 36). So a keeper records:
   - the agreement's own acts (its versions; for a collective, every public act of the collective itself);
   - every party's public act naming one of its versions (signatures, resignations, offers under it);
   - every party's rotation, recorded before that party's other acts (rule 40).

   Parties' acts naming no version are not recorded. **Built in this round:** `keep` (`clients/grants/src/keeper.ts`) now takes any agreement. Before, a deal's founding version was missed, since it names no version in its objects. A test with a deal between two solo identities covers it.

## What was built, precisely

### Part C, item 7: the split service

- **`clients/split-service`** (new): a test service of its own, with its own identity, its node (carol by default) and its own grant keys.
  - `tick` does each round's work:
    - It accepts the grants that name its keys, by a signature act (F128).
    - It answers invoice requests for payees whose agreement names it (draft 4, 4.4), checked, with its node's invoice.
    - Once the invoice is settled, it signs the receipt with the grantor's grant key, sealed to the payer and every party (rule 57).
    - It waits for the payer's claim (the referral evidence, rule 22).
    - It publishes the split (type 8, delivered to every holder it pays, rule 20). Leftover units go by rule 9, from its own tally. The splits under one agreement are numbered (DQ6).
    - It tells each party of the sale (draft 4, 7.2.3).
    - It pays each payout as an ordinary Money payment: an invoice request, the holder's answer checked by the rail's rule, then paid and claimed.
  - The command line: `run` and `key GRANTOR`, plus `--payer` for regtest (see "Found while building").
- **Edubba, a real collective's page: "Its money: who owns its income, who divides it".**
  - You give each member's share in %, a referral share, the service's ID and its key, and the keepers with how many must record an act.
  - **Review it** reads it back in Agreements' own words, with the deal-assessment tool's risks.
  - It is refused in plain words where the shares do not add up to 100, the service is a member, or the key is malformed.
  - Signing makes one clone. The collective's key signs the service's grant (field 14), and every member signs in Dub's Signing tab (rules 8 and 67).
  - **Record it** writes the clone on the collective's line (rule 72) and points the collective's payee pointer at the service (question 1, F358):
    - the pointer is signed with a Money area holder's own key (the proposer's where they hold one), never the collective's own;
    - where the area needs more keys, its other holders are asked, each in their own app (Dub's Signing tab says where the pointer sends the money);
    - until enough have signed, a buyer's payment is refused before anything is signed.
- **Money draft 10** (`spec/MIR-money-draft-10.md`, F358): rule 7 and the payee pointer's format. A collective's pointer may be signed with the member keys of its area reaching Money, judged as scoped by Agreements with that area's holders and threshold. The WebAssembly gains `agreementsPointer` and `agreementsChoose` (the core's `payee_pointer`). Damgar pays a collective through the pointer Agreements count (`collectivePointer`, `clients/grants/src/member.ts`). The reader ships draft 10.
- **Damgar** (money messages draft 4, F357):
  - It reads field 14 of the agreement an offer is made under (field 0), or of a collective payee's agreement in force.
  - It sends the invoice request to the service and accepts the service's answer.
  - It sends the claim to the service, and pays the designated pointer where the payee's own pointer does not lead to the service (question 2).
- **The judged referral (F215, F351).** Edubba's Publishing tab, as yourself, has **Judge the referral: paid by a split service**.
  - In order: the seller's grant to the service (Agreements type 9, "this agreement" written null, F129 H4); a one-party deal (`dealTermsPayload`); the seller's signature on it (`sign`); the offer under it, paying the seller (field 0 the deal, field 3 the seller).
  - The deal itself:
    - parties: the seller alone;
    - signing rule and clone rule: every party;
    - its stake: the publication, wholly the seller's;
    - its split plan: the stake at 1 000 000, then the referral role off the top;
    - field 14: the seller's one grant.
  - The core checks it before anything is signed.
  - When the service tells the seller of a sale, Edubba checks the receipt (signed in the seller's name, the buyer's, following the offer) and delivers the key.

### Part C, item 8: keepers, disputes, deadlines

- **Keeper records** (`clients/grants/src/keeper.ts`). Each record is one public act per act recorded, `{ 0 => [act, signer] }`, Agreements type 2 (OF21 a, d).
  - A keeper's log follows the operator's own line (each record naming the one before), so it is its sequence.
  - `keep` records what its log lacks, each signer's rotations first (rule 40).
  - It reads only the outside of each act: never content, never a key (rule 43).
- **Edubba, "Its keepers"**: each keeper the agreement in force names, and how many of this collective's acts it recorded. A keeper held here (an Edubba agent) has **Record what arrived**. A keeper not named is refused (rule 36).
- **Disputes, not voids.** For each signature a recorded version relies on, Edubba asks Identity for its status. Where it is void or disputed, Edubba shows it as a dispute when:
  - the version it signed is still in force for the collective, which the core decides by C5 (F302: the collective's line placed it before any line registering the rotation); and/or
  - a keeper named recorded the signature before recording the rotation (rule 41).

  Otherwise it says it counts for nothing.
- **A missed deadline, shown only from the anchor or the chain** (Agreements rule 33; anchoring cMIP item 12).
  - Edubba reads each anchor's ticket from the service's own public acts (item 21): its batch and its deadline block.
  - Each anchor then reads one of:
    - **omitted**: the batch was published without the leaf;
    - **anchored by its deadline**;
    - **late**: an anchor after the deadline block, as the anchor itself shows;
    - **default**: the chain followed stands at the deadline plus the clock's depth less one, with no anchor shown;
    - **pending**.
  - Following no chain, Edubba says the deadline cannot be judged here.

### Part D

`clients/desk/test/round-3.test.ts`: one test with the cast.

- **Areas**: Publishing (any one member), Offers and deals (A or iPa), and Money (A or iPa, one key, two above 10 000).
- **A's own key from Damgar**: a promise of 2 000 counts alone; one of 50 000 counts once iPa signs it in Dub with iPa's own key.
- **A's own key from Ummia**: a release of the collective.
- **The money**: A 50%, iPa 30%, iPh 20%; a 10% referral share; the split service; an Edubba agent as keeper. iPa and iPh sign in Dub, and Edubba records it.
- **A protected text of the collective**:
  - A reposter reposts it, and a buyer who follows only the reposter buys it from Dub.
  - The service answers, receipts with the collective's grant key, and splits it: 300 to the reposter, 1 350 to A, 810 to iPa, 540 to iPh. It pays each one, and each member's Damgar answers and receipts by itself.
  - A's Edubba delivers the key as the collective, and the buyer opens it.
- **A vow of A's**, bought by two buyers: one confirms and one contests, from Dub. Edubba's look-up reads both.
- **The end**: the keeper records again. iPh resigns from Dub's Signing tab, A's Edubba registers it, and the keeper records the resignation and the line. No dispute, and the money terms are still in force.

It runs on test nodes by default, and with `MOR_LN_REGTEST=RUN_DIR` on the regtest network:
- the members' invoices come from bob's node through receive-only links;
- the reposter's come from carol's;
- the service's invoices come from carol's;
- every payment is made from alice through the test wallet.

## Found while building (writing code is also a review)

1. **The WebAssembly lacked three things, now added** (part B):
   - the rail verdicts stated to the core (`railValid`), which a vow's sales are read with;
   - the vow's judgment itself (`agreementsVow`);
   - a purchase in the payment commitment (`purchase`, the payment cMIP's eighth element), in both directions.
2. **Money's pointer needed a valid binding**, so a member's scoped key could not sign a collective's pointer that Money reads (question 1). Answered (F358): Money draft 10 lets the Money area's keys sign it, judged by Agreements. The core already counted such a pointer in its Agreements view (`valid` stands a member key where its naming signature does; the area's consent applies); only Money's text and a Money-only client refused it. Built in this round.
3. **The keeper record is decided in text and refused by the core** (question 4): the flaw in the MIR this build exposed. Answered (F358): its format goes into the core in the freeze-ready drafts.
4. **On regtest only alice can pay.** The split service's node, carol, receives a few thousand satoshis that sit below its channel's reserve, so it cannot pay the payouts. This is the same finding as human test 14 (bob's referral share). The service's command line gained `--payer alice`, and the end-to-end test pays every payout from alice. MOR checks the invoice each holder's node signed and the preimage, never which wallet paid.
5. **A keeper cannot show "not before" alone** (question 3). The missed deadline was built on the anchoring cMIP, whose item 12 already says exactly how. Answered (F358): only anchors place anything on the clock, a keeper's sequence among what may be anchored.
6. **Kišib leaves out the lines it cannot read.** A member's Dub makes private acts, so Kišib cannot follow that line without its card, and a rotation without cards leaves it out (its acts void). In the keepers test the disowned signature was on a line Kišib could read and was left out by name. In human test 15, Kišib's warning says which lines go.
7. **An Edubba agent becomes an agent only once its terms are published.** Until then the keepers' card shows it as an identity held here, not as an agent.
8. **Edubba's anchors list now shows the ticket's deadline**, so its old last line ("Anchored at block …") is followed by "By its deadline … delivered" or a missed deadline. The anchoring test was updated to match.

## Readings (to confirm), and costs

*Reading 1 of the first report (the collective's own key signing its pointer) is withdrawn: F358 decided (b), built in this round.*

1. **A pointer moves no amount**, so where the Money area carries the grant limits cMIP's cap, each pointer is stated within it (2.2 judges amounts only) when Damgar and Edubba ask Agreements for the collective's pointer (F358). *Cost:* none known; an area's limits cMIP that judged more than amounts would need its own verdict here.
2. **Who signs the pointer first**: the identity that proposed the money terms where it holds a box in the Money area with its own key, otherwise another identity held in that Edubba that does. Where the area needs more than one key, every other holder is asked, each in their own app, as Damgar asks for a promise above its cap. Until enough have signed, a buyer's payment to the collective is refused before anything is signed ("It cannot be paid").
3. **A lone seller's deal pays the service's own pointer** (question 2, decided as built, F358). *Cost:* the commitment names a pointer that is not the payee's own. A reader must follow field 14 to see why it counts.
4. **The split waits three of the service's rounds for the buyer's claim** before splitting without one. *Cost:* a buyer who never sends a claim names no reposter, and the referral share goes to the stake. A buyer can also delay the split by those rounds and no more.
5. **The sale is told to each member** (draft 4, 7.2.3, a mechanic) so a member's app can deliver the key. *Cost:* the service learns who the members are, which it already does from the terms.
6. **A vow's claim is signed again in public** (part B) so its sale can be seen. *Cost:* the buyers of a vow are public.
7. **A vault transfer's `fulfils` names the person's own payee pointer in force** (F355, as decided). The payment cMIP's next draft lets it name the vault declaration (F355 c).
8. **H46's warning** says "this money can then be spent only with the chain key and its record". On screen, "its record" is spelled out: the vault's own key, declared with your chain key in Kišib, and the record Damgar keeps sealed to you.
9. **The keeper's sequence is its operator's line** (records naming the one before). Records off that line follow in the order a place gave them, as one device keeps. *Cost:* a keeper on two devices would need its lines merged by cards, as any identity does. Until the freeze-ready drafts (F358), the logs are client-stated.
10. **What a keeper records** (question 5, decided): for any agreement, its own acts, every party's public act naming one of its versions, every party's rotation first; nothing naming no version. *Cost:* the records are public and list act IDs and signers, which those acts' outsides already show (OF21 d).
11. **A dispute is shown from three facts**: Identity's status, the core's agreement in force, and the keepers' order. The core decides whether the signature still counts; Edubba only shows it.
12. **The clock's depth is six blocks** (the Bitcoin clock Module, draft 3), written as a constant in Edubba's anchors list.
13. **The service's payouts on regtest are paid from alice** (found 4). Off regtest, a service pays from its own node.
14. **A collective's referral is its split plan's role share, judged**: the role off the top (rule 22), its evidence the repost the buyer's claim names. The payout carries the role (key 3) and its evidence (key 4).

*Stated costs, unchanged and said on screen:*
- the service holds the money between receipt and payouts (rule 32);
- a member's key file opens wherever their homes are read by their own apps;
- the deal-assessment tool's risks on the money terms (uncapped fee, a stake's plan changeable without its holder, absence on the other members' word, the window after a stake transfer).

## Tests

- **Every client changed**, run in this session:

  | Client | Passed | Failed |
  | --- | --- | --- |
  | Edubba | 110 | 0 |
  | Damgar | 27 | 0 |
  | Dub | 39 | 0 |
  | Ummia | 23 | 0 |
  | Kišib | 18 | 0 |
  | the reader | 21 | 0 |
  | repo | 21 | 0 |
  | grants | 5 | 0 |

  The split service and the anchoring service type-check; they are tested in Edubba's and Damgar's suites.
- **The core** (`cargo test --workspace`): 757 passed, 0 failed (with F358's test).
- **New in round 3, part C and D:**
  - `split.test.ts`: the split service end to end, and the judged referral (200 to the reposter, 800 to the seller). Since F358: the Money area is A and iPa at two keys; the pointer, signed with A's own key, is scoped; a Money-only reader reads none; a buyer is refused until iPa signs it in Dub's Signing tab, which says where the pointer sends the money.
  - The core's `a_collectives_pointer_signed_by_its_money_area_f358`: one key of two puts no pointer in force; with the second it is the collective's; a key holding no box in Money never moves it.
  - `keepers.test.ts`: an Edubba agent keeping; a rotation in Kišib leaving out the line iPh's Dub signed on; the dispute.
  - `clients/grants/test/keeper.test.ts`: keepers for a deal between two solo identities (question 5). CI now runs the grants tests, which it did not before.
  - `round-3.test.ts`: the end-to-end test.
  - Damgar's `anchor.test.ts`: one anchor late, one defaulted, nothing said missed before the chain shows it.
  - The web Edubba browser test reads a collective's money back by clicks and finds its keepers' card.
- **On regtest** (btcd v0.24.2, lnd v0.18.5-beta, `modules/lightning/regtest/up.sh`): `round-3.test.ts` passes, as do Damgar's four regtest tests.
- **The releases**: rebuilt from one WebAssembly. Each app's `test:build` and `web-build.test.ts` pass: built twice the same, the page asking only for operations both sides answer.

## Human test 15: a collective and its money, on the Mac, the iPad and the iPhone

*For Nobody, allegedly, with the cast:*
- **A** on the Mac: Edubba, Dub, Damgar, Ummia, the test wallet and the split service;
- **iPa** on the iPad, in Dub's web client;
- **iPh** on the iPhone, in Dub's web client.

*Test identities only. Regtest only: the coins exist only on the Mac. Homes and relays: the test homes and relay of human test 11. Write one line per observation: what you did, what you expected, what happened, how it felt.*

*iPa's and iPh's money is received on the Mac. Their Damgar runs there with their identities brought in, because the web Damgar makes no invoice by itself and the test wallet runs on the Mac. Copying from the iPad or iPhone to the Mac is easiest by Universal Clipboard: copy on one, paste on the other.*

**On the Mac: setting up**

1. **The Mac.** In Terminal, from the MOR folder: `git checkout claude/round-3` (or `git pull` after the merge). Then:

   ```
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install && sh scripts/make-app.sh
   cd ../dub && npm install && sh scripts/make-app.sh
   cd ../damgar && npm install && sh scripts/make-app.sh
   cd ../ummia && npm install && sh scripts/make-app.sh
   cd ../kishib && npm install && sh scripts/make-app.sh
   cd ../testwallet && npm install
   cd ../split-service && npm install
   cd ../..
   ```
2. **The regtest network.** As in `docs/damgar-regtest.md`: `modules/lightning/regtest/up.sh ~/mor-regtest`, and wait for "ready". In a second Terminal window, `cd clients/testwallet && npm start -- ~/mor-regtest`, and open the page it prints.
3. **The split service.** In a third window:

   ```
   cd clients/split-service && npm start -- --regtest ~/mor-regtest --homes HOMES --relays RELAY --payer alice
   ```

   HOMES is the test homes, separated by commas, and RELAY the test relay. It prints its identity (`mid1…`): copy it into a note. Leave it running; it says what it does each round.
4. **The cast's identities.**
   - A: in Dub on the Mac, A as in human test 14 (or make A again). Write down its signing key's words.
   - iPa: on the iPad, in Dub's web client, make **iPa**. Write down its signing words; Dub shows them on request.
   - iPh: on the iPhone, make **iPh** the same way.
   - On the Mac, bring all three into Damgar (**Bring an identity you have**, by their signing words) and **Accept these**, everything ticked.
5. **Where each is paid.** In Damgar, for each of A, iPa and iPh in turn (switch identity):
   - Settings: Lightning, bob's node key (from the test wallet), regtest, **Read it back**, **Sign and publish it**.
   - The receive-only link: bob's REST port, `~/mor-regtest/bob/receive.macaroon`, `~/mor-regtest/bob/tls.cert`, **Check it and keep it**.
   - **Lanes**, "Receipts and invoices, by itself": at most 10000, **Sign this lane**.
6. **Edubba.** Open Edubba and bring A by its words (Identities tab). In the Agents tab, use an agent you already have (Machine, allegedly) as the keeper: copy its ID.

**Founding, areas and member keys**

7. **The grid (Edubba, Collectives tab, + Found a real collective).**
   - Members: A (the founder), iPa and iPh by their IDs.
   - Areas:
     - **Publishing**: posts and publications, all three boxes, 1 key.
     - **Offers and deals**: agreements (the whole layer), A and iPa, 1 key.
     - **Money**: A and iPa, 1 key, **Above 10000 regtest sats, one more key**.
   - Read every band and each member's column. **Review**, read it, then sign.
8. **Signing on the iPad and the iPhone.** In Dub's web client, turn the Signing tab on (its warning). Read the founding in plain words and sign it. Check: "your own key" is said, made as you sign. Write down the share when it is shown, then type back the three words asked.
9. **Found it** (Edubba): tick "I have read what this device will hold", then **Found it: deal the shares**. Write down A's share.
10. **A's key from Damgar.** On the Mac, Damgar as A, **For a collective**: give the collective's ID.
    - Check: "Its Money area, “Money”: … 1 key; above 10,000 an act, one more".
    - A promise to iPh, 2000, "clay": **Read it back**, then **Sign it for the collective, with my own key**. It counts.
    - Then 50000, "a kiln": it says it needs 2 keys.
11. **iPa's second key, on the iPad.** In Dub's Signing tab, the money act: read it, sign it. Back in Damgar as A: both promises count, the second "2 of 2 keys, each a member's own".
12. **A's key from Ummia.** Ummia, A brought by its words. **Act for it**, the collective's ID, then choose it under Who acts. Release a small folder. Check: one key of Publishing counts, signed with A's own key.

**The collective's money**

13. **The service's key for the collective.** In a fourth Terminal window:

    ```
    cd clients/split-service && node --import tsx src/cli.ts key COLLECTIVE_ID
    ```

    COLLECTIVE_ID is the collective's ID. It prints a key of 64 hexadecimal characters.
14. **Its money (Edubba, the collective's page, "Its money: who owns its income, who divides it").**
    - Fill in: A 50, iPa 30, iPh 20; referral 10; the service's ID and the key from step 13; the keeper's ID (the agent), 1.
    - **Review it**, and read each section: who owns its income, how each payment is divided, who divides it, who keeps its record, what it changes, the risks.
    - Try 50 / 30 / 10 first: refused, "add up to 90%".
    - Then sign it.
15. **iPa and iPh sign it in Dub on the web** (Signing tab).
16. **Record it.** Back in Edubba, on its card, **Look for answers**, then **Record it**. Check: "Its payee pointer now leads to the split service …, signed with A's own key in its area “Money”" (F358: the Money area signs it, never the collective's own key), and "One key of the area". In the service's window: "grant … accepted".
17. **The keeper.** The collective's page, **Its keepers**: the agent, **Record what arrived**. It lists each record. Press it again: nothing new to record.

**A protected file, bought through a repost**

18. **Publishing (Edubba).** Who acts: the collective. A text, "Three verses, by three hands.", title "Verses, by the collective", price 3000. **Read it back**: it says it is the collective's, under its agreement in force. Sign it.
19. **The reposter.** In Dub on the Mac, make **R**, bring it into Damgar, and link it to carol's node as A was linked to bob's in step 5 (carol's REST port, `~/mor-regtest/carol/…`). As R, follow the collective, then **Repost** its post.
20. **The buyer.** In Dub on the Mac, make **B**; bring it into Damgar and give Dub a lane as in human test 14, step 7. As B, follow R only. The repost shows its price. **Buy it, under the lane**: Dub says the split service answers for the collective.
21. **Paying.**
    - The service's window: "An invoice of its node sent".
    - Damgar as B: **Look again**.
    - In Dub as B, Private tab: copy the invoice, pay it from **alice** in the test wallet, paste the preimage, **Check it and sign the claim, under the lane**.
22. **The split.** The service's window, within a few rounds:
    - "its receipt signed with … grant key";
    - "naming the repost by …";
    - "Split …: 300 … (referral), 1350 …, 810 …, 540 …";
    - "The sale told to 3 parties".

    In Damgar, switch to A, then iPa, iPh and R, pressing **Look again** each time: each answers its payout's invoice request by itself. The service pays each one ("Paid … to …").
23. **The accounts.** Damgar, each of A, iPa, iPh, R: came in 1 350, 810, 540 and 300, from the split service, receipted.
24. **The key.** Edubba, Publishing tab: open it, and it delivers the key "as the collective". In Dub as B, the post opens with its text.

**A vow, and the referral judged as yourself (optional)**

25. **A vow of A's.** Publishing tab, Who acts: A. A vow, "A seat at the reading of the tablets, on the first evening.", title "A seat, vowed", price 500. Read it back, then sign.
26. **Two buyers on the iPad and the iPhone.**
    - In Dub on the web as iPa and as iPh: each asks Dub for a lane (on the Mac, Damgar as iPa or iPh: **To sign**, **Grant this lane**). Each follows A and **Buy it, under the lane**.
    - On the Mac, Damgar as A, **Look again**.
    - Each invoice: copy it from the iPad or iPhone, pay it from alice on the Mac, paste the preimage back on the device.
27. **One kept, one not.**
    - On the iPad (iPa): Signing tab, **Vows you bought**, **Confirm: it was kept**.
    - On the iPhone (iPh): **Contest it**, "The seat was given to someone else."
    - Edubba, **Look up an identity's vow sales**: A, the test relay. One confirmed, one contested.
28. *(Optional)* **A judged referral as yourself.** Run `key` with A's ID instead of the collective's. Publish a text as A with referral 20, then open **Judge the referral: paid by a split service**: the service and that key. Read the new section, "The deal, before the offer". Buy it as B through R's repost: 200 to R and 800 to A, paid by the service, and the key delivered by Edubba.

**Keepers, a resignation, a dispute**

29. **The keeper again.** **Record what arrived**: the sale's acts of the collective.
30. **iPh resigns, on the iPhone.** Dub's Signing tab, the founding, **Leave this collective…**. Read it (you resign alone; it takes effect at the collective's line; you keep your stake). Then **Sign my resignation**.
31. **Registered.** Edubba, the collective's page: "Leaving alone", **Register it at the collective's line**. Then **Record what arrived**: the resignation and the line are recorded.
32. *(Optional; it changes iPa's keys)* **A dispute, not a void.**
    - In Kišib on the Mac, change iPa's keys from iPa's chain key paper (the words written when iPa was made). Read which lines it keeps; leave out the one that holds iPa's signature on the money terms, and read the warning. A line Kišib cannot read (a private act made on the iPad) is left out by itself: the warning names it.
    - In Edubba, **Record what arrived**, then the keepers' card: "Disputes, not voids". iPa's signature is void under Identity and shown as a dispute, recorded before the rotation, and the money terms are still in force.
    - On the iPad, give Dub iPa's new signing words.
33. **Stop.** `modules/lightning/regtest/down.sh ~/mor-regtest`; Ctrl-C in the other windows.
34. **Report.** One line per observation. Mark:
    - anything not in plain words;
    - any button whose effect surprised you;
    - any proof not verified;
    - any refusal that did not say why;
    - anything on the iPad or iPhone that did not fit the screen.

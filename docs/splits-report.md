# Splits between separate people: the report

*The Dubsar Suite, 23 October 2026, for Nobody, allegedly, and the MOR lead. Finding F388. The reading: `docs/splits-reading.md`. The cMIP: `cmips/cmip-money-messages-draft-5.md`. Screens: `docs/splits/`.*

**The reading I took, running alone** (the prompt: "take the most reasonable reading, say at the top of your report which reading you took"): as the texts stand, whoever is the payee of a deal with a split service must point their whole payee pointer at the service (Agreements rule 16, Money rule 4), which would send every personal tip of theirs there too. So **each deal gets its own payee**: one more identity, made by Edubba for the deal and held in the proposer's Edubba, a party of the deal holding no stake, whose pointer names the split service's rails and whose grant is the one field 14 lists. Nobody's own wallet changes, and "a tip to a person stays a payment to their own pointer". The other way (paying the service's own pointer in a payee's name) needs a change to Money rule 4: it is the MOR lead's (below), and nothing here depends on it.

## 1. In plain words

**What a person can do now.** River, Pa and Ana recorded a song together. In River's Edubba, **Publishing › A protected file**, River chooses the recording, gives it a title and a price, and opens **Details › Who shares in it**: Pa 30%, Ana 20% (by the names River gave them in contacts), River 50%, 10% off the top for whoever reposts it where a buyer finds it, and the split service with the key it made for the deal's own payee (its ID is shown right there to give the service). **Read it back** says first that the work then belongs to the deal and every payment for it, a tip included, goes to the split service; then who gets what, who is paid, who signs, the costs, and the deal-assessment tool's reading. River signs. Pa and Ana each find it in **their own Edubba, Publishing › To sign**, read it from its exact bytes, and sign. **Nothing is announced until both have**: then River's Edubba publishes the post and the sealed recording, and seals its key to Pa and Ana, who co-own it.

The same works for **a vow** (Vows › A new vow, Details) and for **a plain post** (Publishing › A shared post), whose tips go to the people sharing in it.

**How a buyer and a tipper see it.** In Dub, Buy and Tip on a shared work say one line before paying: *"This work is shared: River (50%), Pa (30%), Ana (20%). The split service, …, answers for it."* Buying pays the deal, through its service. **A tip on a shared work goes to the deal, not to whoever posted it**: it is still a tip (nothing is bought, nothing is owed back), divided like a sale. A tip on River's own, unshared post goes to River alone, as before.

**What each party receives.** The service signs the receipt in the deal's payee's name, publishes the split, and pays each person their share (with no repost named, the referral share goes to the owners: Agreements rule 22). Each party's **Damgar, Account › Shared deals** shows every payment to the deal (a sale, a tip) and their own payouts, paid. Each party's **Edubba, Publishing › Sales › Shared works** lists every sale, and beside it the buyer's contest, if they made one: the buyer's claim is now sealed to every one of them (decided with the MOR lead).

**Screenshots to look at** (`docs/splits/`):
- `edubba-who-shares-in-it.png`: "Who shares in it", filled in.
- `edubba-shared-read-back.png`: the read-back before signing.
- `edubba-to-sign-a-shared-deal.png`: what Pa reads in their own Edubba's To sign.
- `edubba-shared-deals-waiting.png`: the deal waiting for Ana.
- `dub-buy-a-shared-work.png`: the buyer's one line before paying.
- `damgar-shared-deals.png`: Pa's Damgar, the sale and Pa's payout.
- `edubba-sales-shared-contested.png`: the buyer's contest beside the shared sale, in Pa's Edubba.

**The Dubsar clock** has its identity now, `1c743854ba1884b470f02221395d18d1abe977631bf86f0f221e32e6d83cf453`, in every app (`clients/barebone/src/clock.ts`) and on dubsar.org's feed page; a lane's Until is prefilled with it in Dub and Damgar. **Not checked against the homes from here**: this container's network policy refused home1.dubsar.org and home2.dubsar.org (a 403 from the proxy), so its genesis and stamps were not looked at; please check it on the Mac (Human test steps, 5).

## 2. The reading's verdicts (`docs/splits-reading.md`)

1. A deal between two or three solo identities: **fits as written** (with the deal's own payee; a vow's deal is two versions, its stake first its signer's, rule 14).
2. The split service for a deal: **fits as written**; the test service needed the tip's case (built).
3. A work, a vow or a plain post under the deal, and how an app finds its agreement: **needs a cMIP draft** (money messages draft 5, section 8).
4. Buying under the deal: **fits as written**, with **a cMIP draft** for 4.4 and 7.2.3 (a deal where draft 4 says a collective).
5. A tip to a work under the deal: **fits as written: it stays a tip**, no purchase, nothing owed back; **a cMIP draft** for the finding and the service's answer.
6. Contest: **needs a cMIP draft** (draft 5, section 9), following the MOR lead's decided core line.
7. The costs: stated in the reading.
- Which pointer a direct payment under a deal is paid to: **needs a MIR change, the MOR lead's** (Money rule 4); built meanwhile on the texts as they stand.

## 3. What was built, and what was not

**Built:**
- **Edubba** (`clients/desk/src/deals.ts`, `publishing.ts`, the page): "Who shares in it" under Details of a protected file and a new vow, and **A shared post**; the read-back with the deal-assessment tool; the deal's own payee made and published (genesis, routes, encryption key, pointer naming the service's rails, grant to the service); the terms, a vow's second version, the offer, each signed by the proposer and the payee; the proposal sealed to each person; **To sign** in Publishing (the deal read from its exact bytes, every act it names signed); **Shared deals** (who has signed, Look for signatures); the work announced only once every person signed (the post, the locked bytes, its key sealed to each person); the key delivered to each buyer; **Sales › Shared works**, for a deal and for a collective, the buyer's contest beside each, or the core's own words where it reads no purchase. Refused in plain words: shares not adding to 100, the service as one of the people, a person by an ID alone, the service's key missing; a party who has not signed: nothing announced.
- **Dub**: Buy and Tip on a shared work say the one line and pay the deal's payee; a tip under the lane follows the deal; Ask Damgar names the post and Damgar follows the deal; by hand refused for a shared work (it cannot carry the post). Purchases shows a shared purchase's contest.
- **Damgar**: Account › Shared deals; a payment's card names its deal; a drafted tip for a shared post follows the deal; **a purchase's claim sealed to every party or member** of what it buys (one container, the payee or service first); the clock for lanes prefilled.
- **The test split service**: a tip that follows the deal itself; a vow's sale told to every party.
- **`clients/grants`**: `deal.ts` (the terms, the clone, reading a deal, finding a post's deal, the one line); `authorityOf` holds the deals a payee's grant counts through, with every party's signature and chain.
- **The money messages cMIP, draft 5** (no format change; its acts keep draft 4's test value).
- **The Dubsar clock's identity** written in the apps and the feed page; the lanes' clock prefilled; the READMEs say which clock, by name and ID.
- **Fixed in passing**: round 3's one-party deal (the judged referral) wrote its stake on the publication's ID, which the core reads as "no purchase"; it now names the work's hash, as the core reads what a purchase pays for.

**Not built, and why:**
- **Paying the service's own pointer directly** (the other way out of "the one thing"): depends on the MOR lead's point 1.
- **Backups** (terms field 29) for a deal: no second test service, and a direct payer cannot reach a backup as the texts stand (the split cMIP's QS1, the same point 1).
- **A later version of a deal looked for before paying** (the strong SHOULD of rule 12): no app makes a later version of a deal yet; the apps pay under the version the work names, said in the cMIP.
- **Any party delivering the key**: a buyer's Dub takes a key only from the publication's signer; the proposer's Edubba delivers. A mechanic for a later draft.
- **The collective's contest shown beside its sale**: the core reads a collective's sale as no purchase (point 2 below); the claim reaches every member and Edubba says what the core reads.
- **The suite's Rust** (`cmips/payment`, `split/`): unchanged, so the WebAssembly is main's.

## After S7e (merged into this branch, 23 October 2026, its "For the Dubsar Suite" applied)

S7e (pull request 103) lets the core answer **unknown** for a sale or a purchase whose answer rests on a receipt or claim with no rail answer, and adds the error `law/rail-unanswered`. Applied, so every screen that shows a sale says "unknown" where the core does, never "paid", "pending" or "none":
- **Dub**: a vow bought whose sale reads unknown says so in Purchases; a purchase whose contests the core cannot read says "unknown" with the reason; `law/rail-unanswered` has its own words; the reader now states **receipts'** rail answers too, beside claims (S7e: "`specs.railValid` naming the payments' receipts as well as the buyers' claims").
- **Edubba**: Track shows an unknown sale as unknown (not counted as kept or pending), and a vow's count of payments unknown; Sales says "unknown" with its reason where the core does.
- **Damgar**: a payout under a deal reads "paid" only where its payment's rail answer here is valid; otherwise unknown.
- **A collective's sale** now reads **unknown** in each member's Sales, before point 2 below can show: a collective's payee pointer is signed with a member's key, which a Money-only reading does not hold, so its claim's and receipt's rail answers are not stated (a gap of the suite's readers, not of the texts: the Agreements reading of a collective's pointer, `agreementsChoose`, is Damgar's when paying; a reader stating a collective's rail answers through it is for a later round). The test says so.
- The six web releases rebuilt from the merged branch; the WebAssembly is main's (S7e's).

## 4. For the MOR lead

**Point 1. Which pointer a direct payment under a deal is paid to, and in whose name.**

*In plain words:* Agreements says a deal's money goes to its split service, whoever pays; Money says a payment counts only at the payee's own pointer, and a person has one. So either a payee points their whole wallet at the service (their personal tips then land where nobody can receipt them), or the deal's money goes to a pointer that is not the payee's own, which Money refuses. Round 3 built the second for a lone seller (F358, 2), and its receipts do not verify.

*The text:* Money rule 4 ("that pointer is the payee's own and counts for that payment by rules 1 and 17"); Agreements rules 15 ("The work's agreement designates the one pointer at which it accepts payments, the same whoever pays: a buyer directly, or a layer above"), 16 (the pointer check) and 17 ("A backup paid directly receipts in the owners' name, with the grants it already holds … a backup's address is the one its own signed pointer carries"); the split cMIP's QS1. Found: the judged referral's buyer's claim reads "unknown: the payee pointer it was paid to is not held" in the buyer's Dub; the payment cMIP's verifier calls it invalid once held ("paid to another identity's pointer", `cmips/payment/src/lib.rs`).

*My lean:* extend Money rule 4 by one clause: "or, where the payment follows an agreement or offer whose terms list, in field 14 or 29, a grant of the payee's, the pointer of that grant's grantee, the agreement's designated pointer (Agreements rules 15 and 17)", judged by Agreements as rule 7 judges a collective's pointer; the payment cMIP's step 3 follows (the suite's draft 5), and both F358 (2) and rule 17's backups then verify. Until then the suite keeps the deal's own payee.

**Point 2. A collective's sale is no purchase for the core.**

*In plain words:* the core reads a payment for a collective's work, under its offer and agreement, as no purchase, because the collective's agreement stakes the collective itself (all its income), not that work. Every collective sale is then, for the core, money owed back, and a buyer's contest of it shows beside nothing.

*The text:* the glossary, "Stake": "A stake whose object is the collective whose agreement defines it is a share of all that collective's income, whoever earns it and whenever"; rule 12 ("a payment for a standing offer … is a purchase only if its receipt or claim names the claim it pays under"); the core's check (`core/src/agreements/view.rs`, `purchase_unjudged`: "the agreement it names carries no stake in the work it pays for"), which reads a stake on the work's hash only. Found by the collective's test this round (`clients/desk/test/shared-deal.test.ts`, the third test); round 3's tests never asked the verdict.

*My lean:* the core counts the collective's own stake (object null) as a stake in every work the collective sells under its agreement, as the glossary says; a vector for it. Otherwise, a collective writes a stake in each work it sells (a clone per work), which Edubba would then do.

**One line, for your rehearsal script:** `scripts/rehearsal/rehearse.ts` fills the feed page's clock by replacing the placeholder `CLOCK-IDENTITY`, which the page no longer carries (the Dubsar clock's identity is written in its place, as decided): its replace finds nothing, and the rehearsal's site names the real clock. A pattern, as it already uses for the two authors, keeps it.

**And, for the core line you write before the rehearsal** (the buyer's claim readable by every member or party): the money messages cMIP's draft 5, section 9, follows it by its words, and seals the claim once to every reader in one container. Nothing else for you.

## 5. Questions for Nobody, allegedly

**Question 1.** Draft 5 of the money messages cMIP changes no format, so its acts keep draft 4's test value (no app needs its accepted list renewed). *My lean:* keep it so, and give a new test value only to a draft that changes bytes.

**Question 2** (after the MOR lead's point 1). If Money rule 4 changes, shall the deal's own payee go, each person's own pointer then a payee, paid at the service's pointer? *My lean:* yes; the deal's own payee is a workaround held by one person.

**Question 3.** Who delivers the key of a shared work: only the person who published it (as built), or any party holding it? *My lean:* the publisher for now; any party once a buyer's app takes a key from any party of the deal the offer names (a draft 6).

**Question 4.** A shared post's tips go to the deal; should a reply or a repost by one of the parties go there too? *My lean:* no: only the post naming the deal.

## 6. Human test steps (checked against the READMEs)

*Regtest only; test identities only; the test split service never for real money (`clients/split-service/README.md`).*

1. **Three people, two of them yours.** In Dub make River and Pa (two of your identities), and ask a friend to make Ana in their own Dub; bring each into its own Damgar (Where you are paid: a Lightning node of the regtest network; Damgar's own lanes: receipts) and its own Edubba (+ Add › Bring one). In River's Edubba, add Pa and Ana to the contacts with those names (Follow: add to contacts).
2. **The split service.** Start it (`cd clients/split-service && npm start -- --regtest RUN_DIR --homes … --relays …`). In River's Edubba, Publishing › A protected file › Details › Who shares in it: copy the deal's own payee's ID shown there, and run `node --import tsx src/cli.ts key ID` while the service runs; paste the key it prints.
3. **The deal.** Choose a recording (an M4A) or a text, a title, a price; Who shares in it: Pa 30, Ana 20, yours 50, referral 10, the service's ID and key. Read it back (it says the work then belongs to the deal), Sign. In Pa's Edubba and in Ana's (your friend's): Publishing › To sign, read it, Sign it. In River's Edubba, Shared deals: Look for signatures; it reads announced.
4. **A purchase.** A fourth identity, in Dub with a lane from its Damgar, follows River (and Pa and Ana, for their names): Buy on the post shows "This work is shared: …"; pay the invoice in the regtest wallet, paste the proof. The service splits it and pays each one; in each party's Damgar, Account › Shared deals shows the sale and their payout; River's Edubba delivers the key (Published here › Deliver keys, or by itself); the recording plays in the buyer's Dub, Purchases. Contest it from its menu; Pa's and Ana's Edubba, Sales › Shared works, show the contest beside the sale.
5. **A tip, and the clock.** River posts a shared post (Publishing › A shared post, the same people); tip it from the buyer's Dub: the line says it is shared, the tip is split; tip one of River's own posts: it goes to River alone. On the Mac, check the Dubsar clock against the homes: `1c743854…cf453`'s genesis found at home1 and home2, its acts stamps of the timestamp clock Module; the feeds then show "… · by the Dubsar clock".

## Tests

- `clients/desk/test/shared-deal.test.ts` (Node, real homes and a relay, test Lightning nodes, headless Chromium for the screens): the deal set up by River and signed by Pa and Ana in their own Edubba; the refusals; nothing announced before both signed; the file bought from Dub by a fourth, the service paid, the split published (500, 300, 200), each paid and told, Damgar's Shared deals for each, the key delivered, the file opened; the buyer's contest in every party's Edubba and in Dub's Purchases; a tip to River's own post paid to River alone. A vow under a deal bought and confirmed; a plain post under a deal tipped under the lane and through Ask Damgar, the tip split (300, 200), no sale told, Damgar naming the deal; by hand refused. A collective's work bought: its claim opened by every member's Edubba, and the core's reading shown beside the sale.
- Every existing test, run again: see the pull request.

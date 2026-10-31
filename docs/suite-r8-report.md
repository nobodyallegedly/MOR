# The Dubsar Suite, round 8 (F407): the whole suite on the redesigned core

*Session of 29 and 30 October 2026, on the branch `claude/s7h-the-redesign` (pull request 113), beside the MOR lead's S7h-3 and S7h-4. Author of record: Nobody, allegedly. The finding is F407; no other number was taken.*

**Readings taken** (the round ran alone; each is the most reasonable reading, and each is open to change):
1. **The suite lead's hold on Part 5 was kept.** The six web releases were rebuilt only after `docs/s7h-4-report.md` said, in its first line, that S7h-4 was done, against its WebAssembly (`3974a18b…`, the same in all six).
2. **A release and a site's version fall under the Envelopes layer's rule,** both being bakes (Envelopes type 0) with an extension's media spec, unless the founders name a finer area; the release manifest (draft 5) and website (draft 12) drafts say so, and ask (question 6).
3. **A collective's income through a split service is a payment to the service that fulfils the split agreement**, the service signing no receipt in another's name (Agreements rule 16).
4. **One change outside the suite's folders:** the relay refused a collective's first act, its genesis with no signing key (`relay/src/node.rs`, three lines, said under For the MOR lead). Without it no collective could be founded at a home. Nothing in `core/`, `wasm/`, `spec/` or the vectors was changed.
5. **The anchoring binding stays the MOR lead's.** `anchoringOffer`, `anchoringReadOffer` and `anchoringCheckTicket` in `wasm/src/money_js.rs` still refuse ("the anchoring cMIP still makes a standing offer…"); S7h-4 says the binding follows the moved cMIP once it is on its branch, which it now is. The tests that anchor wait for it (listed in Part 5).
6. **The anchoring and conversion cMIPs' own regtest tests** (`harness/tests/anchoring.rs`, `conversion.rs`) moved with their cMIPs, as "their Rust tests compiling and passing" asks; nothing else in `harness/` changed.
7. **Assess** (`clients/assess`) was not moved: it judges the old money terms (fields 8, 14, 28, 29), it is not in CI, and whether it should judge publications at all is a question (question 1).

## 1. In plain words, app by app

**What changed for everyone.** A collective no longer has a key of its own. When a member acts for it, the member signs with their own key and names the collective and its latest decision; the apps show "Posted for the collective, signed with your own key". A collective's founding now names, for each of five layers (Text, Envelopes, Money, Agreements, Development), who acts for it, Money shown first, and says what one member may do alone. A collective always has shares, as an ownership agreement does. An upload (a *bake*) is never withdrawn: what sells it, a price tag or a publication, can be.

**Edubba** (the collectives and publishing app).
- *Founding a collective:* two members to start, you and one other, then **+ Add a member**. Below them, "The five layers: who acts for it", one row per layer with a number to fill (all members, or so many of them); above it, in a box, what one member may do alone, Money first. **Finer areas** are optional: "some kinds of act within a layer", each kind named in words and drawn from the core's own type tables; a Money area may carry a cap. **Shares** band: even until you touch it, and it must add up to 100.
- *Changing members:* the same grid, filled from what is in force. A joining member's share box starts empty and must be written; a member who leaves keeps their share as a departed holder.
- *The Money tab:* only where payments land. **A split service** (a split agreement of the collective naming the service, which reads the shares from the constitution at each payment, never a copy, and which the service signs too), or **one trusted pointer** (one member's own wallet; the others rely on them). A referral share may come off the top. Keepers are their own form beside it.
- *Publishing,* four ways in: upload a file (then nothing, a price tag, or a claim); a price tag read or withdrawn; a claim and its ownership agreement; a publication (owners, what it sells, partners with labels, a split service, a referral share), and its ending.
- *Splits (H98):* on a publication, two rows, you and one other, then **+ Add a person**.

**Dub** (the feed).
- Buying follows the seller's price tag. A tip goes through the publication where you found the work. Where a bake's uploader is not one of its owners, Dub says so and offers **Buy from the owners' publication**.
- **Withdraw the price tag** and **Withdraw the publication** say plainly: "The bytes stay where they were uploaded unless homes and relays drop them." For a bare upload or a profile picture, Dub explains there is nothing to withdraw at the protocol level.
- Screenshots: `docs/suite-r8/dub-sales-feed.png`, `dub-sales-owners.png`, `dub-sales-withdrawn.png`.

**Damgar** (the wallet). Payments by publication and price tag: the tag decides who is paid. A tip to a collective with a split agreement goes to its service. **Rely** keeps a copy of what was relied on (F400), left at one's homes and relays.

**Kišib** (keys). A collective's rotation carries no signing key. Kišib refuses a person's key-change flows for a keyless identity, in plain words. Member keys are gone; the runner's `/runner/member` answers 410. "Make an identity with Nakišib" checked and passing.

**Nakišib** (Kišib's offline companion). `sitting.rs:696` fixed (the rotation's signing key, now optional in the core, built as `Some(…)` in the test helper). A collective's keyless genesis is not offered this round; its README says so.

**Ummia** (releases). A collective's release is uploaded by a member naming the collective; the uploader counts as one of its signers.

**The display client** (dubsar.org). A site's version is a bake, never withdrawn; the listing shows the six layers; a collective's site is uploaded by a member and counts once its rule is met. "Uploaded by" is shown.

Screenshots of Edubba's founding, its five layers, the Money tab's read-back and Publishing are in `docs/suite-r8/` (listed under Tests).

## 2. The cMIPs reassessed

Each kept unless said. In plain words first, then what moved.

- **Split (draft 4, kept).** The core checks amounts, never computes them. The split cMIP's job is the route (the service, its backups in field 11, what happens on failure) and the amounts (partners, roles, metrics, fees off the top in millionths, rounded down; the rest to the owners' line, leftover units one each by rule 15a's turns). Taken over by the publication: it carries the service, the plan, the partners and the backups; shares are read by reference; a purchase follows a price tag. Gone: terms fields 8, 14, 28, 29, payee grants, multi-stake plans and their order, stake and receiver shares in a plan. The code: `divide(amount, &Publication, Owners::Lone | Line{…}, &Facts)`. Its spec value changed (draft 4's test value).
- **Anchoring (draft 6, kept).** The core judges the publication, the tag under it and the purchase; Money-only wallets pay; refunds are shown. The cMIP keeps tiers, tickets, batches, deadlines, omission, default and the amount check. Gone: its own standing-offer reading (payee by field 3, "names no claim"). A publication with a lone seller, its service the split service, sells `[2, [cmip, terms]]`; one price tag is the most one hash costs. Type 3 is now the batch notice.
- **Conversion (draft 4, kept).** The core binds no forward, reads no route and judges no delivery (rules 24 to 28). Only the offer reading goes.
- **The on-chain Module (kept, no source change).** Only its tests moved.
- **Website (draft 12), relay transport (7), release manifest (5), nudge (4), money messages (6), payment (5), runner (5), grant limits (4), specification card (2):** each written anew for six layers and keyless collectives. The runner's draft 5 drops member keys. The relay transport's member-key binding check is withdrawn. Payment: a purchase commits `[agreement, version]`; the grant-key paragraphs are withdrawn.
- **Member keys (draft 2): retirement proposed.** A collective has no key to share, so nothing is left for it to do.
- **Approved in their headers** ("Approved and tests will refine them", Nobody, allegedly, 29 October 2026): runner draft 4, notes draft 1, rotation notice draft 1.
- *Flagged, not rewritten:* `cmip-live-media-draft-1` is untrue throughout and not the suite's (lean: retire, or leave to the core's side); `cmip-corrections-draft-2`, one word.

## 3. Part by part

**Part 1, the cMIPs.** Done as above. Every Rust test of `cmips/` and `modules/` compiles and passes (`cargo test --workspace --locked`, Part 5).

**Part 2, every app on the new core.** Keyless collectives, six layers, the bake and the price tag, one withdrawal per layer, Text rule 14 (a text act carries one object), member keys removed everywhere, the eight texts' new test hashes (`MICS 30add49a`, `SUITE 4485bf65` in the cards). Shared code: `clients/genesis/src/identity.ts` (a test collective acts through a member, citing its latest decision), `clients/repo/src/agreements.ts` (terms fields 12, 19, 33, 34 and 7; the mark power `[6, layer]`), `clients/repo/src/collective.ts` (a keyless genesis; shares carried across member changes; a collective's places are its relays and its homes), `clients/grants/src/member.ts` (signing as a member; the area or layer reaching an act).

**Part 3, the designs.** As in section 1. The design note's "Built in round 8" lists them (`docs/design/suite-redesign.md`); hand test v3's rows H98, H101, H118 and H120 are marked "Built in F407".

**Part 4, CI.**
- Every test stops its servers whatever the outcome: `world.ts` `stopAll`/`closeAll` in every `after`; Dub's `stop.ts`; the collective's setup stops what it started, with a ten-second force-kill; servers registered for `after` the moment they start; launchers stopped in `finally`.
- **The "all" job's timeout, its root cause:** a lossy relay helper was left open after a failed founding, so the job hung to its limit. Fixed; the helper now errors when its relay is down.
- Read-once waits replaced by waits that look again (`shows()`, `eventually()`): 22 in Damgar and Ummia, 7 in the collective, menus, reply cards and contacts in Dub, two fixed timeouts in the connector and site replaced by waiting for the picture to load.
- `test.yml`: each app's step has its own time limit (Edubba 40 minutes; Ummia, Damgar, the site, Dub, Kišib and the collective 30; the others 20), so one hang names its app; the "all" job's limit is 180.
- A product bug found on the way: Dub's Private redraw wiped the draft. Fixed.

**Part 5, releases and tests.** Pulled and rebased on S7h-4's last commit, once `docs/s7h-4-report.md` said in its first line that it was done; its binding change taken in (an area count's `area` is now a JavaScript number, minus the layer for a layer's rule: the suite's own report). All six web releases rebuilt against its WebAssembly (`3974a18b…`, the same in all six): display client, Dub, Kišib, Damgar, Ummia, Edubba; Edubba's and Dub's rebuilt again after the last fixes below.

What S7h-4's core changed for the apps, and what the suite did:
- **A collective's split agreement is judged in its judicial tier:** every member signs it, whatever the Agreements layer's rule. Edubba's Money tab now asks every member whose voice remains (it asked the layer's members), and says so in its read-back.
- **The apps' readers of a sale now hold the collective a publication names** (its own chain, and its members), so the core can count the collective's consent: without it, the core read the collective as no collective and the publication as unsigned (`dub/src/vows.ts`, `dub/src/money.ts`). A collective's posts are judged with its chain held too (`desk/src/collectives.ts`).
- **A bug found:** a correction of a collective's post named the collective as the corrected act's signer; a member signs it now. Fixed in the collective app.
- **A regression of this round, undone:** leaving a collective's agreements at its homes as well as its relays meant a record "lost on the way to the relay" was never lost, and 13 of the collective app's tests no longer built their broken stretch. The agreements go to its relays again; Kišib finds them through the members' places.
- **Premises replaced in Edubba's tests** (said in each): a collective's rotation in Kišib ends at "done", with no words to show; a release counts by "signatures, each with its member's own key"; the shared sale of S7e is now a verified purchase with the buyer's contest beside it (question 2); round 3's sale goes through the collective's own publication.
- **Words fixed:** Edubba's founding form no longer says the founder "holds its signing key"; the retired Member keys rule is off Edubba's list of rules to approve.
- The disk filled during one full run (test folders left in the system's temporary folder by earlier runs); the Rust build folder was cleared and rebuilt, and the last run kept its temporary files in a folder of its own.

### S7h-4's verdicts, where the apps show them

The suite lead's message of 30 October, 17:40, asked that each verdict S7h-4 lets an app see be shown in plain words where the app shows it, with a test where an app reads it.

- **A person's homeless rotation, objected to by a live home of the old set, is void (was pending).** Kišib, reading an identity, now hands each served homeless rotation that does not count back to the old homes. It holds any objection a home gives back, and the core decides. A void rotation is said once, in red: "Void: the homeless change of its keys at position 1… A home of its old set, still alive, objected to it, and no escape endorsement signed with its signing key backs it (Identity rule 49): it can never count." It is no longer listed as waiting for receipts. Kišib's own escape is always endorsed with the signing key, so an objection never voids it. Test: `clients/kishib/test/rare.test.ts`, "S7h-4 (Identity rule 49)": a homeless rotation made with the stolen paper alone, objected to by a live old home, read as void.
- **A succession plan's clone passes the party's stakes to the heirs, and changes a layer's rule only by putting the successor in the party's place.** No suite app makes a succession plan or a plan-marked clone. The collective app reads a clone's mark in words, so the plan's power now says what its clone must do (Agreements rules 64 and 83). Test: `clients/collective/test/explain.test.ts`, "S7h-4 (rules 64 and 83)".
- **A withdrawn price tag on a push rail: a receipt the split service records after the withdrawal is no sale.** This cannot arise in the suite. The core judges it only on a push rail, and the suite's split services are paid on Lightning only, by invoice request (a request rail), and refuse a request naming a withdrawn tag ("the price tag it names is withdrawn"). Where the core does call a payment no purchase, Dub's Purchases and Edubba's Sales already show its reason, word for word. Nothing new was built.
- **A collective's split-agreement version paying its non-member holders less needs their signatures.** No suite app makes a later version of a collective's split agreement. Edubba's Money tab makes a first version each time, and a first version is not judged so. Where Edubba checks a split agreement, it already names everyone still to sign. Nothing new was built. Once an app offers a change of a split agreement's plan, it should say why a departed holder is asked.

### Tests

Run on this machine after the last fixes (Linux x86-64; Chromium for the browser tests), every app's `npm test`, then `cargo test --workspace --locked`:

| App | Passed | Failed | Why it fails |
| --- | --- | --- | --- |
| collective | 45 | 0 | |
| Kišib | 44 | 0 | |
| repo, grants, kit, barebone, manage, testwallet | 21, 8, 18, 15, 7, 4 | 0 | |
| reader, reports, longform, connector | 22, 9, 26, 13 | 0 | |
| genesis | 41 | 0 | |
| split service | 2 | 0 | |
| display client (site) | 86 | 0 | |
| Dub | 46 | 0 | |
| **Damgar** | 37 | **4** | the anchoring binding (For the MOR lead, 1): the act menu's anchor, a collective's act anchored, a missed deadline, Edubba's pieces by clicks |
| **Ummia** | 34 | **1** | the anchoring binding: a release anchored on Bitcoin |
| **Edubba** | 116 | **1** | the anchoring binding: Dub's "an act anchored, by clicks" |
| Nakišib | 10 | 0 | (and its 3 Rust tests) |
| Modules: audio, carry, jpeg, timestamp, video | 8, 7, 14, 5, 6 | 0 | |
| anchoring service | typechecks | | tested where it is used (Damgar) |
| Rust workspace | 782 | 0 | 1 ignored, as before |

Every one of the six reds throws the binding's own words: "the anchoring cMIP still makes a standing offer, which the core no longer reads…". They turn green once the binding follows anchoring draft 6; nothing in the suite can do that (`wasm/` is the MOR lead's). **Assess** (`clients/assess`, not in CI) was not moved: 12 of 39 fail (reading 7, question 1).

**On GitHub** (pull request 113, commit `ca6fa19`):
- **Green:** seal, release, mac, linux and the four browsers jobs.
- **"all":** 26 minutes, each app inside its own time limit; red only on the same six anchoring tests (Edubba 1, Damgar 4, Ummia 1). Every other app passed with the same counts as here: Rust workspace, vectors regenerated byte for byte and checked in Python, WebAssembly, and every client and Module.
- **"regtest":** red on one more test of the same kind, Damgar's "regtest, anchoring: a collective's act" (it starts the anchoring service). Lightning, on-chain, round 2 and round 3 end to end on regtest all passed.

No check failed only on some runs, so nothing was re-run.

**Screenshots** (`docs/suite-r8/`): `edubba-founding.png` (two members, + Add a member, what one member may do alone); `edubba-founding-layers-finer-areas.png` (the five layers and a finer area's kinds); `edubba-web-money-review.png` (the Money tab's read-back: the shares by reference, the referral); `edubba-publishing-upload.png`, `edubba-publishing-ownership-two-rows.png`, `edubba-publishing-publication.png` (Publishing's ways in); `edubba-sales-contest.png` and `dub-purchases-contest.png` (a collective's sale, the buyer's contest beside it); `dub-sales-feed.png`, `dub-sales-owners.png`, `dub-sales-withdrawn.png` (Dub's buying by price tag, the owners' publication, a withdrawn tag).

## 4. For the MOR lead

None of these was changed by the suite.

1. **The anchoring binding** (`wasm/src/money_js.rs`, `anchoringOffer`, `anchoringReadOffer`, `anchoringCheckTicket`). The moved anchoring cMIP (draft 6) is now on this branch. A sketch of the binding: `anchoring_offer(network, tiers, words, service, split_cmip)` returning a publication; `anchoringPriceTag`; `read_offer(pubAct, tagAct)` via `Offer::from_publication`. Also: `PublicationIn` writes keys 5 and 6 into the batch notice citing "draft 6 (this build's)", which draft 6 no longer defines.
2. **The relay refused a collective's genesis** ("an act signed with a chain key must be a rotation or a chain signature"): a genesis with no signing key is signed by the first chain key. The suite let it through (`relay/src/node.rs`, the `keyless_genesis` test beside the chain-key check). Please review or replace.
3. **A release by a departed member with two current signatures counts** (rule 58): the suite's test now covers the one-signature case; is the two-signature case meant?
4. **No core way to find a publication's price tags or its latest version** (`pub_versions` is `pub(super)`): every app walks the line itself.
5. **Money rule 18, "pays the price it states":** a tag's price is the most; a cheaper anchoring tier pays less, and a Money-only wallet can then buy only the top tier. Alternative: one tag per tier.
6. **A backup paid under a tag reads as no purchase** (split draft 4, QS1): rule 17 says a backup may be paid "still naming the tag", the core's purchase check calls a payment to another identity than the tag's payee no purchase.
7. **`publicationPayload` cannot carry a plan's fees,** so a fee shows as unplanned.
8. **`agreements::Offer` and `OfferAct` are still exported,** used only by the binding.
9. **Field 9 naming task 11** (anchoring, judicial) has no stated meaning.
10. **Words:** genesis' `ENVELOPES_TYPES.publication` (an Envelopes type 0 is a bake); `clients/repo/src/release.ts` problem strings say "publication"; the relay's manage view calls Envelopes 0 "publication" (needs a relay/manage rebuild, outside the suite); the core's Contest line, "the payee of a purchase is a collective", now the split service.
11. **Fixed by S7h-4:** the `agreementsConsent` lane-id overflow the suite reported.
12. **Worth a word in the texts:** a member's act for a collective is judged only where a reader holds the collective's own chain; a collective publishes no routes, so every reader must find it through the act's objects. The suite's readers now do; a line in Agreements rule 58 or the runner cMIP saying where to look would help other apps.

## 5. Questions, one at a time

Each has a lean; each is for Nobody, allegedly, unless said.

1. **Assess: move it, or retire it?** It judges the old money terms; it is not in CI. *Lean:* move it next round to judge publications, since that is where a buyer needs a second opinion.
2. **The shared-sale test's premise** (S7e: paid to the collective's pointer): with a split service the payee is always the service. *Lean:* keep the case for one trusted pointer only.
3. **A collective's claim, ownership agreement and publication from Edubba's Publishing:** not offered this round. *Lean:* next round, the owners being the collective's founding agreement.
4. **Co-owners delivering keys** for a sealed work: not yet. *Lean:* later, with the delivery cMIP.
5. **Dub's purchase, field 9:** it names the ownership agreement's version in force. *Lean:* follow the line to the latest version.
6. **Which layer governs a release, and a site's version?** Both are bakes with an extension's media spec. *Lean:* Envelopes for both, unless the founders name a finer area.
7. **A site's version, a bake, cannot be withdrawn:** only a rotation disowning it (Identity rule 34). *Lean:* leave it so.
8. **Money messages keeps draft 4's test value?** *Lean:* keep until the freeze.
9. **The runner tells a collective's act** by objects naming an identity whose genesis declares a founding. *Lean:* keep.
10. **A collective's income paid to its service** fulfils the split agreement (reading 3). *Lean:* confirm.
11. **`publishing work read`,** an alias kept for old tests. *Lean:* remove next round.
12. **Website draft 12** is built but not approved. *Lean:* approve after the hand test.

## 6. Human test steps

**On the Mac (Edubba, Dub, Damgar, Kišib, Ummia).**
1. In Edubba, Collectives, **+ Found a collective**: you and one other are there; **+ Add a member** adds a third. Check the box above the grid says, Money first, what one member may do alone.
2. Set Money to "all", Text to "any one"; add a finer area under Money with a cap; touch one share and see the total asked to add to 100.
3. Review, sign; each member signs in their own Edubba. Then Members, **Change its members**, add one: their share box is empty and the review is blocked until it is written.
4. Money tab: choose a split service, give its ID and a referral share; read the review ("never copied here"); the service signs; **Record it**.
5. Publishing: upload a picture with a price tag; in Dub on another identity, buy it; withdraw the tag and read the words about the bytes.
6. In Ummia, make a release for the collective; sign it in another member's app; see it counted.

**On the iPad.** The founding grid scrolls sideways in its own box; the page does not. Steps 1 to 3 by touch; the Shares band's boxes reachable.

**On the iPhone.** Dub at 390 px: the price tag's buy button, the "owners' publication" link and the withdraw words, all readable without sideways scrolling. Edubba's collective page at phone width.

**Nakišib, on two Macs.** On the offline Mac, make an identity with Nakišib from Kišib's request; carry the paper to the online Mac; Kišib reads it. Then rotate the identity the same way. Check Nakišib says it does not make collectives this round.

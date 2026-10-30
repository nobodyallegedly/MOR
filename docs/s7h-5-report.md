**Not yet ready to merge: the anchoring tests stay red until the suite moves four call sites in its apps** (listed below and in `wasm/README.md`). Everything else this session asked for is done; once the suite has moved them, the pull request is ready.

# S7h-5, the last core points before the merge: report

*Session S7h-5, 30 October 2026, on branch `claude/s7h-the-redesign` (pull request 113), after the Dubsar Suite's round 8. It built F409's decisions into the core, the binding and the texts. It recorded no finding of its own. Main has nothing new to merge: it is already contained in this branch.*

## Done

1. **The anchoring binding follows anchoring draft 6** (77fc0a57).
   - A lone seller's publication.
   - One price tag per tier, each priced exactly at its tier (item 5).
   - The publication is read with its tags, and a ticket is checked against the tag paid.
   - Shapes, old first, are in `wasm/README.md`.
   - **Keys 5 and 6 of the batch notice stay**: F341 decided them, and Edubba and Ummia read the key to check an anchor. Draft 6's text, the suite's, left them out (question 1).
2. **The relay's keyless genesis** (`relay/src/node.rs`): the suite's three lines are right and kept.
   - The core's genesis check, applied when the relay reads the payload, refuses a genesis that declares no signing key and declares nothing in its place, or that is signed by any other kind of key. The signature is verified against the key it reveals (Identity rules 1 and 7).
   - The comment now says so.
   - New test `a_home_takes_a_collectives_keyless_genesis`: a home takes it and receipts it, and refuses the two bad ones.
3. **Item 3, a departed member's act** (`consent_judged`).
   - An act a member drafts for the collective after the line registering their departure counts for nothing, however many current members sign it (rule 58).
   - A departed member's signature acts were already left out of the count.
   - Test: `a_declaration_is_the_authoritys_judgment_with_no_anchors` now drafts on a current member's device, and checks Cy's own act separately.
4. **Item 4, `publication_tip`** and its binding, `agreementsPublicationTip`. It gives a publication's latest versions, the latest version of each price-tag line that counts under it, and its ownership agreement with that agreement's latest version.
5. **Item 6, a backup paid under the tag is a purchase** (rule 17). The purchase check accepts a payment to a backup the publication lists, the payment still naming the tag; on a push rail the backup's own receipts settle it.
6. **Item 7:** `publicationPayload` carries the split plan's fees.
7. **Item 8: `agreements::Offer` and `OfferAct` stay.** `cmips/anchoring` (`Offer::read`) still uses them. They go once the suite drops it.
8. **Item 9, written** (Agreements, "Publication (type 6)"): field 9 naming a judicial task names the publication's judge for it, as terms field 2 does. Task 11 names the anchoring cMIP whose anchors show an act made by a point on the publication's time reference (fields 7 and 8), read as rule 33 reads them. The texts implied it: field 9's comment, "a judge among them is named for no other task".
9. **Item 10, the words.**
   - The relay says "bakes" for Envelopes type 0.
   - The relay's manage page is built from `clients/manage/src/view.ts` (line 91, "publication"). The suite changes it there, and the page follows on its next build.
   - The old offer's "paid to the collective" survives only in the retired offer formats (`open_formats.rs`), which go with item 8.
10. **Item 12** (rule 58): "A member's act for a collective is judged where the reader holds the collective's own chain: its identity chain and the acts on its chain the act cites, found through the act's `objects`."
11. **S7h-4's reading, one sentence each in rules 94 and 97:**
    - A version of a collective's split agreement is put in force by no line, so its own history is its line: transfers and proxies are placed there.
    - A holder's own signature, held and valid, always beats its proxy.

## Vectors

- **Every earlier case keeps its verdict, acts and ids.**
- **Two Agreements cases added:**
  - 9.2, a pointer Cy drafts after the line, both current members signing it: it counts for nothing.
  - A payment to a backup the publication lists, still naming the tag: a purchase.
- **Checks:** the Rust check passes 10 of 10, and the Python check says "all 276 vectors agree".
- **Readmes:** `core/vectors/README.md`, `scripts/c-box/vectors-README.md` and `core/README.md` are updated.

## For the Dubsar Suite: the anchoring tests

**The binding cannot meet the apps' current calls and follow draft 6.** The service makes its offer with three arguments, so no split service or split cMIP is named. It signs no tag, and its buyers pay the publication, which draft 6 reads as a tip that buys no ticket.

The four changes, in `clients/`:
1. **`clients/anchoring-service/src/service.ts:152`:**
   - make the publication with `anchoringOffer(3, TIERS, words, this.me.id, SPEC.split)`;
   - sign each of `anchoringPriceTags(3, TIERS, o.id, this.me.id)` under Money, keeping the tag ids;
   - at line 246, accept a payment whose `fulfils` is the ticket's tier's tag.
2. **`clients/damgar/src/damgar.ts:1935`:** look up the tag act a payment fulfils, and pass it to `anchoringCheckTicket`.
3. **`clients/desk/src/money.ts:164`** and
4. **`clients/ummia/src/anchor.ts:89`:** pass the service's tag acts to `anchoringReadOffer`, and pay `tags[tier].tag`.

Also for the suite: the anchoring cMIP's Rust (`Offer::from_publication`) and draft 6's text still say one tag at the top price. F409 decided one tag per tier. Until they move, the binding checks the publication against a stand-in tag at the top price and checks the real tier tags itself.

CLIENTS_PLACEHOLDER

## Questions

1. **Keys 5 and 6 of the anchoring batch notice.**
   - *Plain words:* F341 put them in (the x-only key and the script tree's root), and the apps check anchors with them. Draft 6's text no longer lists them, so the binding still writes keys the text does not define.
   - *Options:*
     - (a) Draft 6's text lists them again.
     - (b) Rule against F341, which leaves every anchor uncheckable by the apps.
   - *Lean:* (a). *Cost:* none in the core; one sentence in the suite's cMIP.
2. **A stopgap for the anchoring tests.**
   - *Plain words:* the binding could treat a payment naming the publication as paying its top tier's tag until the suite moves its four call sites. Draft 6 says such a payment is a tip and buys no ticket.
   - *Lean:* no stopgap: the suite moves the four call sites. *Cost:* the merge waits for that round.

## c-box

C_BOX_PLACEHOLDER

## Checks

CHECKS_PLACEHOLDER

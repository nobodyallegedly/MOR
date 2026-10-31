The last core points before the redesign merges, on S7h's branch, in the MOR repository (`nobodyallegedly/MOR`): **on `claude/s7h-the-redesign` (pull request 113)**, after the Dubsar Suite's round 8. A short session: the anchoring binding (the only red left on GitHub), the relay's keyless genesis reviewed, and the round's points for the MOR lead.

**Read first, yourself:** `CLAUDE.md`; `docs/suite-r8-report.md` in full, above all "4. For the MOR lead" and "Part 5"; `docs/s7h-4-report.md`; in `docs/findings/MOR-findings-log-round-2.md` on `claude/lead-records`, **F409** (how each point is decided); `cmips/` anchoring draft 6 and split draft 4 on this branch.

**Touch** `core/`, `wasm/`, `relay/`, `spec/` (only where named below) and `docs/`. The suite's apps already pass save the anchoring tests; if a change of yours moves an app's answer, run that app's tests and say so. Rebuilding the web releases is needed once the WebAssembly changes: **rebuild the six** (the display client, Dub, Kišib, Damgar, Ummia, Edubba) as their READMEs say, last, and be green on GitHub, the reproducible display client included. Pull before each push; never force-push.

**1. The anchoring binding** (suite item 1): `anchoringOffer`, `anchoringReadOffer`, `anchoringCheckTicket` follow anchoring draft 6 (a publication with a lone seller, its price tags, `Offer::from_publication`); `PublicationIn` stops writing keys 5 and 6 draft 6 no longer defines. Damgar's four, Ummia's one and Edubba's one anchoring tests, and Damgar's regtest anchoring test, pass.
**2. The relay's keyless genesis** (item 2): review the suite's three lines in `relay/src/node.rs` against Identity rules 1 and 7 (a collective's genesis signed by its first chain key, revealed); keep, or replace with the right check, with its test.
**3. Decided (F409):**
- Item 3: a release by a departed member counts for nothing, however many current members also sign: a departed member's signature never counts for the collective after the line registering the departure; the act counts only if the current members' signatures alone meet the rule. Core and a test.
- Item 4: a core function, exposed in the binding, giving a publication's latest version and its price tags, and an ownership agreement's latest version on its line (Nobody, allegedly: "Clients need to provide the tip": every app that pays follows the line to the latest version first, with this).
- Item 5: one price tag per price: a publication selling several tiers names one tag per tier, each paying exactly the price it states (Money rule 18 unchanged; the anchoring cMIP's tiers each a tag).
- Item 6: a backup paid under a tag (split draft 4, Agreements rule 17's "still naming the tag") is a purchase: the core's purchase check accepts a payment to a backup the publication lists, as rule 17 says. Core and a vector.
- Item 7: `publicationPayload` carries the split plan's fees.
- Item 8: `agreements::Offer` and `OfferAct` go if nothing but the old binding uses them.
- Item 9: field 9 naming task 11 (anchoring, judicial): write what it means, or refuse it, whichever the texts already imply; if neither, a question.
- Item 10: the core's and relay's words (Envelopes type 0 is a bake; the Contest line's payee is the split service).
- Item 12: one sentence in Agreements rule 58: a member's act for a collective is judged where the reader holds the collective's own chain, found through the act's `objects`.
- From S7h-4 (F406): its question's reading in rules 94 and 97 (a publication's version's own history is its line), one sentence each.

**Vectors:** every earlier case keeps its verdict, acts and ids unless a decision is exactly that case: say which and why. Both READMEs and the c-box's; the Python check.

**Then the pull request is ready to merge:** merge main (nothing new on it is expected), rebuild, all green; say in your report's first line that it is ready, and stop: the MOR lead writes "preparing to merge" and Nobody, allegedly, says when.

**Questions:** plain words, then precisely, with options, your lean and the cost.

**Finding number.** If this session records a finding of its own, it is **F409**'s; do not take another (the MOR lead records its decisions there).

**Report:** `docs/s7h-5-report.md`, short, its first line whether it is ready to merge.

**Do not:** change any rule beyond these decisions; write any finding number, review label or history into the eight texts; change `clients/` or `cmips/` beyond the releases' rebuilt `built/`.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Push to `claude/s7h-the-redesign`; do not merge.

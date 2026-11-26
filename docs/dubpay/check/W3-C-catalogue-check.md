# DubPay W3-C: a cold check of the leans in the catalogue of Money

*DubPay wave 3, session C, 26 November 2026. Nobody, allegedly. A review only: no file of DubPay's was changed, nothing is fixed or decided. It checks `_team/dubpay/wave-3/results/B/catalogue-money.md` (and its JSON and hand-made part) against the acts in `_research/`, read through the kit copy in `_team/dubpay/wave-2/kit/`. Counts come from `check-w3c.mjs` beside this file (it writes `check-w3c-counts.json`); every in-force word below is the core library's answer through the kit, "as far as the acts held show". Marks: **counted** (the script counts it), **traced** (an act's words show it), **inferred** (the reviewer's reading). Ids are cut to 8 characters. Every verdict is the reviewer's.*

> Used is not checked: the kit checked no rule above the core; every use count here says a text was applied by hand, not that it works. The players are machines, and the hosts' prompts (notices 7 and 8, the contest's remainder rule, the day-five prompts) asked for several of the patterns counted.

## In plain words (five points)

1. **The escrow was tried with money.** The catalogue says Until's escrow "was never used with money (only a test vow)". The acts show three test vows on draft 4 where The Back Row and its test buyer paid 300 test sats and got 300 back: a refund for non-delivery, a contest upheld and refunded, deliveries checked and released to a maker who could not receive them. M8's lean rests on a reading the acts contradict. **Counted, traced.**
2. **M1's "two outcomes" are wrong on the straight split's side.** The kit's "shown in force" for the straight split comes only from five draft-4 deals, the ones with the hole Hop found (the service the only signer). Under draft 7, none of the 60 Terms naming it can be shown, and that is because no verifier holds the straight split's own in-force rule, not named signers. Hop's split is shown in force in all 8 of its deals today, with no cMIP at all. **Counted.**
3. **M4's base is the pot draft DubPay itself called flawed.** Spare Wheel's run, the lean's reason, used pot draft 1. DubPay wrote that draft 1's spent line "signed a debt for someone else", and that the tab is "better on the point that matters most". No act runs pot draft 2. **Counted, traced.**
4. **Two solutions sit in the wrong place, and one turns on rule 3 without saying so.** Kept Word (deliver or refund, no holder) is listed as built on the escrow, but its Terms never name it. The Mending Circle is listed as built on hours of care, but it uses its own text lines. The money decision (M6) can be paid only while its Terms are in force, and its one run sits under Terms in force by named signers. **Counted, traced.**
5. **Reviewer's verdicts:** M1 stands with a change; M4 stands with a change; M8 does not stand as written. None of the leans would make DubPay hold money until its catalogue says so, except the merged split: the straight split's caps leave owed sats out, so a service holds them with no cap. **Traced, inferred.**

## 1. The 15 problems, read against the acts

| Problem | Stated as the acts show it? | Missing, misplaced, kinder or harsher | Mark | Acts read |
|---|---|---|---|---|
| **M1** a payment reaches every owner | Mostly. The differences table is fair. "Hop pauses the whole deal at 9/10 of its limit" is listed as what a late payee does to sales. In Hop's text it is a rule about the total held. It reaches a late payee only because an owed share counts toward `limit`. That is a real point (the class of Until's finding a0c711ff), but it is the catalogue's reading. | **Kinder to the straight split:** its "kit: shown 3" comes only from draft-4 deals (82a722c1, 5d42a349, ae5a0c55, d4fbd1e6, 6d5d03e6). In each one the service is the only signer, with the work as an agreement and no in-force field: Hop's hole (9144a9c0). All 60 Terms naming draft 7 read unchecked. **Harsher to Hop's split:** "19 acts, 3 identities; by others 3 acts, 2 ids". The core shows 8 Hop deals in force, every owner a signer, with 11 identities other than Hop among them. Hop signed 38 report-block acts. | counted; traced | b9e43db4, 86011ca3, 79832852, 9144a9c0, a0c711ff, 8df3e122 |
| **M2** whoever brought the buyer | Yes. | None found. 10 Terms name the client spot; 7 read unchecked for want of named signers, consistent with its rule-3 mark. | counted; traced | a0108c37, b7fca8d1, d7b32ddf |
| **M3** everyone paid can check what came in | **Framed by the report block, not the acts.** The report block shows one leg (G11.6, Hop's "Open"). The solutions that answer "what came in" are Hop's lodged window list [C1] and the straight split's sealed list with commitments (S11). Neither is a solution here, and the catalogue's own lean sends the commitment to the MOR lead. The report block is the hosts' proposal 4 (`docs/lead/proposals/report-block-4.md`, per 01-where-to-read), so "the kit (no window)" is fair, and the lean does not favour DubPay. | Missing: Hop's [C1] list and S11 as solutions. Uses: 81 report acts, 63 of them by Hop (38) and DubPay (25). | counted; traced | 86011ca3, b9e43db4 |
| **M4** shared costs, nobody holds money | Partly. "The pot then stood while Hop kept the tab open" is right. "Nobody joined" the round's tab is Hop's word of the afternoon (c80a559d). After it, DubPay wrote two debts in that same tab (2528023c, 1c00aec8: 2,000 to Until, 500 to Jonas), still open at the round's end (8df3e122). | **Kinder to the pot:** Spare Wheel's ask 2 ran on draft 1 (98145bee names spec e91f72f5; d7855792 "draft 1"). DubPay called draft 1's spent line "signing a debt for someone else" (0fe96813). 17 pot lines name draft 1, 0 name draft 2. The seven members are one window's players. **Harsher to the tab:** "nobody joined" leaves out DubPay's own debts. | counted; traced | 73bece9f, da0d4fa0, 0fe96813, c80a559d, 232fc7c7, 8df3e122, 98145bee, d7855792 |
| **M5** a rotating savings circle | Yes. | None. All six parties of f0152013 are the clusters' window; "used by its own authors only" holds. | counted; traced | d2aa5dec, 44b07c7f, f0152013 |
| **M6** a group decides who is paid | Yes. | **Turns on rule 3 without being marked:** a decision is "payable only while the Terms version it names is the one in force" (f2970dcc). Its one run, Spare Wheel, is under Terms in force by named signers (73db2ea4 names ed7e3956, so the core says unchecked). The fault field is marked traced on three acts that are sealed in the research copy (5d54329e, eb56f122, 54193dc9). What is traced is Plain Words' own account of them in f2970dcc, not Counterparty's words. | counted; traced | f2970dcc, 73db2ea4, 98145bee |
| **M7** circles that swap time | Yes. | **Misplaced:** the Mending Circle is "built on" hours of care, but by the catalogue's own words it "counts repairs owed with its own one-line text acts, not this Statement kind" (104dcc6d). It is a second solution. Not rule 3: the Cercle, Krog varstva and Mending Circle Terms are shown in force with no named signers. | counted; traced | 6b0cc411, 64cd7830, 104dcc6d |
| **M8** pay before, money back if not delivered | **No.** "Never used with money (only a test vow), so nothing about release or refund was tried" and "No vow is signed under any draft: the one vow seen says TEST VOW: nobody pays". | **Harsher than the acts:** 4 vows name the escrow (b381f537 "nobody pays", and efb3c3ce, edf75998, 243186a6, labelled "refunded"). 25 acts by Until, The Back Row and its test buyer speak of money in them. Paid in: 1c4cba58, 0c4407c8, 24bd233e. Non-delivery refund: 2276db11. Contest upheld, refund: bb98f1ce, abdc12ea. Release due but not receivable, held as owed: abdc12ea, 660aea94. Test money returned: 928c53ea, 660aea94 ("300 paid in, 300 back"). Buyers' verdict: "every path we set out to test has run as … draft 4 says" (832f1763). **Misplaced:** Kept Word is listed as built on the escrow, but its Terms (825b834d) do not name it. Its charter promises delivery or a full refund with "the guild holds no money" (713ad026): a competitor. **Missing:** the straight split's S15, under which a service that sent no delivery note owes the buyer the refund itself. | counted; traced | ca9d95cd, b381f537, 660aea94, 832f1763, bb98f1ce, abdc12ea, 713ad026, 825b834d, b9e43db4 |
| **M9** a home's operator breaks its word | Yes. | None. Its one Terms (be5f5d6c) reads unchecked because of the place, not rule 3. | counted; traced | 9cbdffb3 |
| **M10** held for an owner who has not come | Yes. | None. Hop's 746,566 sats held past the round are stated. | traced | ecf9afc4, 8df3e122 |
| **M11** an invoice made privately | Yes. | None. | traced | beb3fdad, 46aaf149 |
| **M12** paid by the period | Yes. | None. | traced | 15d03f0c |
| **M13** a money service stops | Yes. | None. Rule 2 is applied to the last report's rule D. | traced | ff9e88fb, ca9d95cd |
| **M14** proving a debt from bytes | Yes. | None. | traced | de67b513, 07e86444 |
| **M15** lending a thing | Yes. | The lean is labelled "keep one", but its words move the text out of Money ("Not Money's by its own words"): the label and the words differ. | traced | 8ff8ac74 |

The catalogue's 89 cited ids all resolve to acts in the research copy, 3 of them sealed (counted).

## 2. The leans, and the strongest case for each competitor

**M1, the straight split and Hop's split (lean: merge two, the straight split's per-line holding with Hop's exit).** The case for Hop's split as the base, from its acts:
- Every owner signs the deal (E2), so the deal is in force by the grammar's own default: "a verifier can check that without any further cMIP" (86011ca3). The core shows all 8 Hop deals in force (counted). Draft 7 of the straight split puts its own threshold rule in `inForce` and `condition`. No verifier holds it, so all 60 Terms naming draft 7 read unchecked (counted).
- The service is never a party to the work, so it cannot block the owners' exit (86011ca3, "Leaving"). In the straight split the service may be an owner. In Edubba, DubPay holds 20 parts, and that is half of Hop's finding (9144a9c0, point 3). Draft 7 eases it with "a deal like for like is a group decision" but does not forbid it (traced).
- Holding is bounded: everything held counts toward `limit` (86011ca3). Under the straight split's S7, owed sats "never count toward either cap", so they are held without a cap (traced, b9e43db4).
- It ran with other windows' owners: 8 deals, 11 other assenting identities, 38 report acts by Hop (counted).

Against it: every owner must sign, so one silent owner blocks a new deal (Counterparty's N1, quoted in b9e43db4). An unpayable owner's share counts toward `limit` and can pause the whole deal (inferred). The lodged list is in the clear and makes sales public ([X2]), where the straight split uses commitments (S11).

**Does the lean survive?** The direction survives: one split text, per-line holding, an exit that needs no service. Its rule-3 outcomes do not. Outcome 1 says that if named signers become the default, "the straight split's threshold count becomes one parameter of it". Named signers "takes no parameters" and counts every named party (d8a19d7d): no threshold. So the straight split's in-force rule stays unchecked in both outcomes, and Hop's shape is checked in both (counted; traced). **Survives with a change.**

**M4, the pot and the tab (lean: merge two, the pot as base).** The case for the tab, from its acts:
- A debt counts only when the debtor signs it, "the admission" (da0d4fa0). DubPay wrote that this is "better on the point that matters most" and that its own spent line was "a claim" (0fe96813).
- Draft 2 of the pot answers with a dispute that counts. But a spent line still binds others until they dispute it (73bece9f, P2 and P4).
- The tab has a cap per member, names a refused payment in every later clearing, and makes the clerk pay for its own error (da0d4fa0).
- The pot's only outside run is on draft 1, one ask, one window (counted). In practice it rested on three members' money decisions as much as on the spent line (98145bee).

Against the tab: one clerk signs every clearing, and it ran with no member but Hop and DubPay's two debts. Hop itself first recommended the pot (c80a559d), then kept the tab open as clerk with DubPay's reader as a second check (8df3e122).

**Does the lean survive?** Only if the debt rule flips: a debt between members is the debtor's own line, as in the tab; the spent line becomes the note each member signs from, which is DubPay's own offer 2a in 0fe96813. The lean should also say the run was draft 1 and that draft 2 is untried. **Survives with a change.**

**M8, the escrow (lean: gap still open).** No DubPay text competes here. The lean's reason ("never used with money … nothing about release or refund was tried") is contradicted by 25 acts (counted). The competitor it misses is Kept Word's promise without a holder (713ad026). Its strength: no one holds money, and its charter Terms are shown in force by the core (counted). Its weakness: a refund rests on the maker's word plus receipts and public default. What is really still open, from the acts:
- draft 5 (the arbiter clause [AW]) was never run, since all vows name drafts 3 and 4 (counted);
- no real buyer, only The Back Row's test identities and Until's test maker (counted);
- a release to a maker whose key rotated cannot be received (abdc12ea, a0c711ff);
- the guarantee is "the bank's word" (ca9d95cd).

**The lean as written does not survive.** What the acts support is "keep one", tried on draft 4 with test money by two windows, with those named gaps (inferred).

**The payment report and Damgar.** The report block is the hosts' proposal 4, not DubPay's, and M3 has no rival text, so the lean favours no one. But the problem is framed by it (see M3). Damgar is DubPay's. It is placed under M1 as "built on it" and compared with nothing. Other windows' tray apps (register.mjs, shelf.mjs) are solutions of their own problems. Edubba and the other readers that show payments are not set beside Damgar (inferred). Its open fault is narrower in the catalogue than in its own act: "a report's key is never checked against its signer's chain", where 9be6cfc3 says it "does not verify signatures" at all. Tobias's second point, that `pay` pays without asking (7a8c4db3), is not followed up (traced).

## 3. The order's three rules

**Rule 1, used is not checked.** The caveat heads every problem section with counts (14 of 14) and sits in every table header and "built on it" line (counted). Problem M13 has no use counts and no caveat, which is fine. Use claims inside leans carry neither the caveat nor the prompts caveat: "the only one run by other members" (M4), "used only by its author" (M12), "used by its own authors only" (M5). M4's lean rests on one, and its texts are marked prompted by the day-five prompt (traced). The prompts caveat is given once at the top and as a column. It is not beside the counts the leans rest on.

**Rule 2, recovery by vouching.** Nothing tried only by vouching is catalogued as tried. The last report's rule D (M13) and the "taken identity" item are marked not tried (traced). One nuance: the limits say every Money solution "assumes the same key throughout". One did meet a key change: the escrow's release to a rotated maker could not be received (abdc12ea). That is rotation, not recovery, but it belongs in the limits (traced).

**Rule 3, named signers and buyer by assent.** The 7 marked leans (M1, M2, M4, M5, M8, M11, M15) each give two outcomes (counted). M1's outcomes are wrong on the straight split's side (section 2). In M8 the rule-3 point is real (update 3 reads assents, ca9d95cd), but the vows read unchecked today because of the place, not rule 3 (counted). Of the other 8:
- **M6 turns on it** through Spare Wheel (counted; traced).
- M7, M9, M3, M10, M12, M13 and M14 do not, as far as their acts show (counted where Terms exist).

## 4. The three main leans: the reviewer's verdicts

- **M1 (reviewer's verdict): stands with a change.** Correct Outcome 1 (named signers has no threshold). Say the kit's "shown" came only from draft-4 deals with Hop's hole. Take Hop's every-owner-signs as the checkable base, the straight split's threshold as an option that stays unchecked, and count owed sats toward a cap.
- **M4 (reviewer's verdict): stands with a change.** Make the debtor's own line the debt and the spent line a note. Say Spare Wheel ran draft 1, one ask, one window, and that draft 2 is untried. Keep DubPay's open debts in the tab in view.
- **M8 (reviewer's verdict): does not stand as written.** The escrow was run with test money on draft 4: 300 sats in, 300 back, a contest upheld, releases due but held as owed. The remaining gaps are draft 5, real buyers and a release after rotation. Kept Word belongs beside it as a solution without a holder.

## 5. Would DubPay hold money, decide a release, or change the core?

- **Hold money:** yes, under the merged split, if DubPay runs a service as it did for Edubba and three other works (82a722c1 and others, DubPay the only signer). The straight split's S7 leaves owed sats out of every cap, so they are held with no limit (traced). Hop's `limit` counts them. The pot, the tab and the escrow leans give DubPay no holding (traced).
- **Decide a release:** yes, in two places of the straight split. Under S2b the service judges a step "unchecked", which holds a line and later moves it to the named owners. Under S15 a service that sent no delivery note owes the buyer the refund itself (traced; that the judgement is the service's is inferred).
- **Change the core:** M1's Outcome 1, as written, needs named signers, or the grammar's default, to take a threshold parameter. That is a core change carried inside a lean (inferred from d8a19d7d). Section 3's items for the MOR lead are labelled as proposals and change nothing (traced).
- **An interest to state:** DubPay owes 2,500 sats as lines in Hop's tab, the M4 competitor (2528023c, 1c00aec8; still open in 8df3e122) (traced).

## Limits

- Review only. No file of DubPay's was changed. Nothing here is decided, fixed or built. Only B, A (as cited by B), the order, `_research/` and the kit copy were read. DubPay's wave-2 listing and its reader were not.
- The index holds 14,413 acts from `windows/*/acts` and the feed pages. B reports 17,168 acts read through a reader I did not open, so a few counts may differ for acts held elsewhere (counted).
- In-force words are the core's, through the kit, holding only the Agreements acts in the research copy. A place or clock answer the kit does not hold reads unchecked.
- A Terms "names" a text when any 64-character hash in it starts with that text's draft act id or spec hash, as B's table lists them. This is wider than "names it in `control`": the 77 Terms for the straight split include works that name a deal.
- Windows are read from the folders that hold an identity's acts, which also hold acts by others. "One window" claims are rough (inferred).
- Sealed acts were not opened. No key was read. Nothing was signed, posted or paid. Test identities only.

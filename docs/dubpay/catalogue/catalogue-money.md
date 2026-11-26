# The catalogue of Money, by problem (DubPay W3-B)

*DubPay wave 3, session B, 2026-11-25. Nobody, allegedly. Made by `catalogue-money.mjs` (beside this file; rerun: `node ~/Documents/mor-round-2/_team/dubpay/wave-3/results/B/catalogue-money.mjs`) from listing B, slice check A, the shared inventory and the hand-made `catalogue-money-hand.mjs`. Marks: **counted** (the script counted it), **traced** (an act's words show it), **inferred** (our reading). Every lean is **DubPay's (proposed)**; nothing here is decided, fixed or built. Ids are cut to 8 characters; `catalogue-money.json` holds them whole.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works. "Prompted" marks what the hosts' prompts asked for: notice 7 (apps), notice 8 (attack the shower, with bounties; it named the straight split draft 4), the contest's remainder rule, and the day-five prompts ("something MOR has not been used for", "what the language could not say"). The players are machines: where a prompt asked for a pattern, the pattern is the prompt's.

## 1. In plain words

15 problems (counted). Each Money text of A's slice sits under exactly one (33 of 33, counted).

- **M1.** A buyer's payment for a work reaches every owner of it, each their share, at once: including an owner who has not signed yet, or cannot be paid. *Lean: merge two.*
- **M2.** Whoever brought the buyer (the app they paid through, the guide they followed) gets a share of that sale, and only if the buyer says so. *Lean: merge two.*
- **M3.** Everyone paid from one payment can check, in signed lines, what came in, what was passed on, what was kept and what is still owed. *Lean: keep one.*
- **M4.** People who share costs (flatmates, a crew, a hardship fund) know who owes whom, and settle in few payments, with nobody holding the money. *Lean: merge two.*
- **M5.** A savings circle where each member takes the whole pot in turn, and a member who took the pot stops paying. *Lean: gap still open.*
- **M6.** A group decides together who is paid from its money, and nobody can push through more than the group's rules allow. *Lean: keep one.*
- **M7.** Circles that swap time or favours instead of money (babysitting, repairs) keep a fair balance of what each owes. *Lean: keep one.*
- **M8.** A buyer pays before the thing exists and gets the money back if it never comes, or if it is not what was sold. *Lean: gap still open.*
- **M9.** People who keep their identity on a home are paid if its operator breaks its word or closes badly. *Lean: keep one.*
- **M10.** Someone honestly holds money for an owner who has not come for it (a maker without an invoice, a refund), and the owner can claim it with one act. *Lean: keep one.*
- **M11.** A buyer gets an invoice from a seller who must make it first, privately, and the invoice itself says what it is for. *Lean: merge two.*
- **M12.** Rent or anything paid by the period: anyone can see which periods are paid, late, unpaid or never asked for. *Lean: keep one.*
- **M13.** When a money service stops, everyone it owes can see what it held, what it owed and who takes over. *Lean: gap still open.*
- **M14.** Someone who paid and got nothing proves the debt, from bytes, where the next payer will read it. *Lean: keep one.*
- **M15.** A neighbour lends a thing (a ladder, a drill) and can show it is late or came back, with no money moving. *Lean: keep one.*

**DubPay's three most important leans (proposed):**

1. **M1, merge two.** Merge the straight split and Hop's split into one split text: the straight split's per-line holding (S2b, S7) with Hop's exit without the service's signature, its `backup`, and remainder by settlement as an option. Keep Stall split as the small form the windows ask for ("the texts that need no change are the small ones"). *Turns on named signers and buyer by assent: see its two outcomes.*
2. **M4, merge two.** One text, the pot as base (the only one run by other members: Spare Wheel's ask 2), with the tab's debtor-signed debt as a line kind and its acceptance clause as an option for groups that want a clerk. *Turns on named signers and buyer by assent: see its two outcomes.*
3. **M8, gap still open.** Keep Until's escrow, the only one; the gap is that it was never used with money (only a test vow), so nothing about release or refund was tried. *Turns on named signers and buyer by assent: see its two outcomes.*

Leans: keep one 8, merge two 4, gap still open 3; 7 turn on whether named signers and buyer by assent become the grammar's defaults (counted).

## 2. Problem by problem

### M1. A buyer's payment for a work reaches every owner of it, each their share, at once: including an owner who has not signed yet, or cannot be paid

*Category: 1. Splits and payout services.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| The straight split | 880d33f2 (dubpay) | 1: b10d576b → 4fae88be; 2: 23b67a3a → d2912f38; 3: 31579733 → 6f02c766; 4: 0ece915a → 767b0984; 5: 2e295742 → 7ff9be42; 6: 7e0ac8f1 → 4f8626c7; 7 (first publication, titled "draft 6"): 333bdbc7 → 47c874cb; 7 (republished, title corrected): b9e43db4 → e51e8653 | K6 control, with K4 inForce and condition, in a deal between the service and the owners | 126, 31, 13 | 107 acts, 30 ids | 77 | 13 | shown 3 | prompted (another draft of the work); prompted |
| Hop's split (round two) | a48e4b24 (hop) | 1: f94aa721 → 3de83b05; 2: f8fd362d → b84b121d; 3: 2185922e → 04c96aba; 4: 83b71841 → 7933f0bb; 5: 86011ca3 → 3ed64a40 | K6 control, in a deal D between the service and the work W | 19, 3, 3 | 3 acts, 2 ids | 8 | 3 | shown 3 | no |
| Stall's pass-on and Stall split | ddafffcd (stall) | 1 (pass-on by the receiver): 12927103 → eab368d4; 2: 79832852 → e8ce3555 | K6 control, the receiver named in Terms (the doer) | 10, 2, 2 | 2 acts, 1 ids | 7 | 2 | unchecked 3 | not found; no |

*Counts: counted, from listing B.*

**The straight split**

- Who holds money, who decides a release: The service holds between receipt and payout, up to a cap per receiver (default 10,000 sats) and per deal (100,000). It decides nothing: it pays exactly the lines the work's body cMIP returns (S2a), at once (S5). (b9e43db4) *traced*
- A remainder, a failed share: Remainder to the body's remainder owner (S2a); rounding gives up to owners − 1 sats to that owner (S14). A share that cannot be paid, or whose owner has not assented, stays a still-owed line in that owner's own name, never spread or kept (S6, S7, section 1). An unchecked step holds that one line only, never the payment (S2b). Lateness freezes one line, never the work (S7). (b9e43db4) *traced*
- A member who stops: An owner who stops answering: their share waits as owed and counts toward no cap, so sales go on (S7, after Until's finding a0c711ff). A service the owners replaced says so and issues no invoice (S7a). (b9e43db4, a0c711ff) *traced*
- The way out if its service closes: The owners move the work to a new deal under the work's own condition, like for like (section 1, "Changing service"). The core cannot stop a payment naming an old version from reaching the replaced service (section 8, W5). (b9e43db4) *traced*
- What it proves, and what is only someone's word: Proven by bytes: the report lines add up (S1), a line is closed only by a report naming it, a line is confirmed only by its receiver's received line (section 4, vectors 6 and 7). Only the service's word: every line its receiver has not confirmed, and what came in, beyond the window list sealed to owners (S11, section 5). (b9e43db4) *traced*
- Faults found, by whom, fixed or not: 13 acts by others speak of a fault (listing B, counted). Read: Hop, serious, the service could rewrite its deal alone and refuse the owners' exit (9144a9c0): fixed in draft 7, section 1. Until, one owner who can never be paid froze the work (a0c711ff): fixed, S7. Counterparty's one-pipe readings W1 to W10 and N1 to N7 (2ac300da, c924941a): folded in, credited in section 9. The text says "nothing pending". (9144a9c0, a0c711ff, 2ac300da, c924941a, b9e43db4) *traced*
- Prompted, read: Notice 8 named draft 4 for attack, with bounties; the contest asked for "a split service whose cMIP names its remainder rule".
- Built on it: **DubPay's shape for a deal's parameters (section 6)** (880d33f2, dubpay; uses 15 acts by 6 identities, counted; used ≠ checked; prompted: not found). DubPay's shape for section 6 (fee, caps, deadline, rail as one map), answering DubLaw's and DubWeb's seam acts; the hosts' ruling calls it "one way to write them, not the only one"; Léa's deal wrote them as text keys (795859ee). (393f664c, 795859ee, ede89994) *traced*
- Built on it: **Damgar (DubPay's money hub, a tray app)** (880d33f2, dubpay; uses 9 acts by 2 identities, counted; used ≠ checked; prompted: prompted (notice 7 asked for apps)). DubPay's tray app (balance, payments, flow). Its one fault not fixed in the round: a report's key is never checked against its signer's chain (0.1.3 says so, 9be6cfc3); the wave-3 order names it a fault to fix. (9be6cfc3, db5bcb2e) *traced*

**Hop's split (round two)**

- Who holds money, who decides a release: The service holds up to `limit`, pauses at 9/10 of it, pays out within `payout_within` (48 blocks). It decides nothing: the division is a rule anyone can recompute. (86011ca3) *traced*
- A remainder, a failed share: Remainder to the owner the body names; else one sat each to the largest fractions dropped; or, by `remainder_by: settlement`, by the payment hash mod the number of owners [E1]. A payout that fails stays owed to that owner, never kept or given to another. (86011ca3) *traced*
- A member who stops: No rule for a silent owner beyond "still owed"; before the first payout the service asks the verifier whether D is in force, and pays nothing while it is not shown [C4]. (86011ca3) *traced*
- The way out if its service closes: The owners update W's receiver without the service's signature ("Leaving"); a `backup` service may be named; once W names another receiver the old service takes no fee [C2] and pays out everything still owed. (86011ca3) *traced*
- What it proves, and what is only someone's word: Each owner can recompute their own line from A, the fee and W's shares; the window list of received settlements, lodged at a place, lets a buyer check their payment is in it [C1]. Only the service's word: any owner's line beyond their own leg (G11.6, "Open"). (86011ca3) *traced*
- Faults found, by whom, fixed or not: 3 acts by others (listing B, counted): Counterparty's five findings on draft 1 (1a7b3d53) and two on draft 3 (02646bd6), answered in drafts 2 to 4; Counterparty's end-of-round report (aa552d9c). Still open by Hop's own words: draft 6 (the clock field, where a deal's parameters live) is named but no text act of it is held. (1a7b3d53, 02646bd6, aa552d9c, 8df3e122) *traced*
- Prompted, read: The contest's remainder-rule requirement (prompted); otherwise no prompt found.

**Stall's pass-on and Stall split**

- Who holds money, who decides a release: The doer receives and pays each line within the window or the next, on the payee's invoice. (79832852) *traced*
- A remainder, a failed share: Remainder to the body's remainder owner, else the first signer, never the doer. A line with no invoice is still owed, every window, never the doer's. (79832852) *traced*
- A member who stops: Not stated beyond "still owed" (inferred: a silent payee simply waits). (79832852) *inferred*
- The way out if its service closes: Not stated in the text (inferred: a new version of the Terms naming another receiver). (79832852) *inferred*
- What it proves, and what is only someone's word: What the doer may never do is listed; the leg report is the doer's word. No window list, no commitment. (79832852) *traced*
- Faults found, by whom, fixed or not: 2 acts by others (listing B, counted): Turnstile's contest catalogue naming draft 2, "Not yet attacked, Stall says", beside a warning about an identity posing as Stall (2ef3ee1b), and its catalogue update (fb4fab43). Neither is a fault of the text; no finding against it was found. (2ef3ee1b, fb4fab43) *traced*
- Prompted, read: The contest's remainder-rule requirement (prompted; it counted Stall split draft 2).

- Pointer: Shower work (DubLaw) writes the division the straight split pays; it sits in Agreements. (b9e43db4) *traced*

- **They agree on:** All three: the service keeps no remainder; a share that cannot be paid stays owed in its owner's name; the body's remainder owner wins where it names one; the service is paid by a named fee or a part, never both. (b9e43db4, 86011ca3, 79832852) *traced*
- **They differ, and why it matters:** Who must sign the deal (straight split: the service and owners holding the group threshold; Hop: the service and every owner, or W's own signature); how the owners leave (straight split: by the work's condition, a deal like for like; Hop: by updating W alone, the service not needed); what a late payee does to sales (straight split freezes one line; Hop pauses the whole deal at 9/10 of its limit); remainder with no named owner (largest fractions or by settlement against first signer). It matters because the first two decide whether one party can hold a work hostage (Hop's finding 9144a9c0 was exactly that). (b9e43db4, 86011ca3, 79832852, 9144a9c0) *traced*
- **Lean, DubPay's (proposed): merge two.** Merge the straight split and Hop's split into one split text: the straight split's per-line holding (S2b, S7) with Hop's exit without the service's signature, its `backup`, and remainder by settlement as an option. Keep Stall split as the small form the windows ask for ("the texts that need no change are the small ones"). Rests on b9e43db4, 86011ca3, 79832852, 9144a9c0, a0c711ff.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). Who signs the deal is the difference that matters, and the kit answered "unchecked" on deals because it holds no named-signers cMIP. *Outcome 1:* If named signers become the grammar's default: a deal naming the owners as signers (Hop's E2) is checked by the kit with no cMIP; the straight split's threshold count becomes one parameter of it; the merge is mostly wording. *Outcome 2:* If not: each split keeps its own in-force rule, read by hand; the merge must carry the straight split's inForce cMIP, and readers keep answering "unchecked". (86011ca3, b9e43db4, fe1403bc)

### M2. Whoever brought the buyer (the app they paid through, the guide they followed) gets a share of that sale, and only if the buyer says so

*Category: 1. Splits and payout services.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| The client that served the payment (a spot) | 84ae1e82 (pointer) | 2: ae1a22e7 → de52a421; 3: a0108c37 → bdcee1a5 | K5 spot, kind done, in an offer's parties | 20, 3, 3 | 14 acts, 2 ids | 11 | 1 | unchecked 3 | no |
| cMIP guide spot (Turnstile) | 11e77c4b (turnstile) | 1: b7fca8d1 → 824698f3 | K5 spot, kind done, in an offer's parties | 0, 0, 0 | — | 0 | 0 | no Terms names it | no |

*Counts: counted, from listing B and inventory (by spec hash).*

**The client that served the payment (a spot)**

- Who holds money, who decides a release: Holds nothing. The buyer's assent names one served record; the split or receiver pays the part the offer's words give. (a0108c37) *traced*
- A remainder, a failed share: Unfilled, or named twice: the part goes where the offer's words say (recommended "stays with the owners"). An unchecked filling is paid nothing (P6). (a0108c37) *traced*
- A member who stops: Not applicable: nobody owes a payment over time (inferred). *inferred*
- The way out if its service closes: A client that closes serves no more records; its past fillings stand once a leg report has paid them (R1). (a0108c37) *traced*
- What it proves, and what is only someone's word: Proves that a signed record from client C is named by the buyer's assent and the first payment (conditions 1 to 6). Only the buyer's word: that C served them; "nothing is checked about served". (a0108c37) *traced*
- Faults found, by whom, fixed or not: Counterparty's seven findings on draft 1 and two retest points, all accepted (section 10); the core form, "when is a filling final", published by Counterparty (d7b32ddf). One act by others in listing B (14b01383) is Edubba's release reading it, not a fault (inferred). (a0108c37, d7b32ddf, 14b01383) *traced*
- Prompted, read: No prompt found.

**cMIP guide spot (Turnstile)**

- Who holds money, who decides a release: Holds nothing; the guide's pay is the offer's own Terms. Turnstile's own: 1% rounded down, remainders to the seller. (b7fca8d1) *traced*
- A remainder, a failed share: No assent naming a listing: no filling, nothing paid to any guide. (b7fca8d1) *traced*
- A member who stops: Not applicable (inferred). *inferred*
- The way out if its service closes: Not stated (inferred: listings stay readable on homes; a listing made after the fact can fill unless the offer names a place, rule 3). (b7fca8d1) *inferred*
- What it proves, and what is only someone's word: Proves the buyer's assent names an act signed by the guide that mentions the offer. Only the buyer's word: that they followed it. "Not yet attacked: rely on it for no money before it is." (b7fca8d1) *traced*
- Faults found, by whom, fixed or not: None found; the text says it was not attacked. The inventory counts it never named, 0 uses by hash (counted, inventory). (b7fca8d1) *traced*
- Prompted, read: No prompt found.

- **They agree on:** Same shape: a K5 spot of kind done, filled once per sale by the buyer's own assent naming one act, resting on the buyer's word, paying nothing where the buyer names nothing. (a0108c37, b7fca8d1) *traced*
- **They differ, and why it matters:** Who may fill (client spot: any client that served a record; guide spot: one named `guide`); what is named (a served record with a fresh random value and nothing about the buyer, against a public listing); when a filling is final (client spot fixes it at the leg report that pays it; guide spot does not say). It matters for buyers' privacy and for whether a later act can unmake a payout (d7b32ddf). (a0108c37, b7fca8d1, d7b32ddf) *traced*
- **Lean, DubPay's (proposed): merge two.** One spot text with two fillers (any client, a named guide), taking the client spot's finality rule and served record; the guide spot was never used or attacked. Rests on a0108c37, b7fca8d1, d7b32ddf.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). Both are filled by the buyer's assent. *Outcome 1:* If buyer by assent becomes a grammar case: the assent naming a served record or a listing is a grammar fact, and the spot reduces to "which act the assent names"; Edubba's warning "it proves an assent, never a payment" (4c59cb1f) still holds. *Outcome 2:* If not: both stay spots resting on a cMIP the kit does not check, and the filling stays unchecked until Money answers a settlement (client spot, section 7). (a0108c37, 14b01383, 4c59cb1f)

### M3. Everyone paid from one payment can check, in signed lines, what came in, what was passed on, what was kept and what is still owed

*Category: 1. Splits and payout services.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| The payment report (the report block, proposal 4) | the kit (no window) | proposal 4: — → 7b65c60f | The report block, proposal 4 (a spec of the kit, not a players' text) | 81, 5, 5 | 81 acts, 5 ids | 0 | 0 | check pass 1 | no |

*Counts: counted, from listing B.*

**The payment report (the report block, proposal 4)**

- Who holds money, who decides a release: Holds nothing; it is the language of the reports the splits, the tab and the escrow sign. (b9e43db4) *traced*
- A remainder, a failed share: Line kinds: received, passed on, own part, kept, still owed; a passed-on line may close an earlier still-owed one (the straight split's section 4). (b9e43db4) *traced*
- A member who stops: A still-owed line stays open until a later report by the same signer closes it. (b9e43db4) *traced*
- The way out if its service closes: Not applicable: a format (inferred). *inferred*
- What it proves, and what is only someone's word: Proves the reporter's signed lines and their sum; a line is confirmed only by its receiver's own received line. Only the reporter's word: any line not so confirmed. (b9e43db4, 73bece9f) *traced*
- Faults found, by whom, fixed or not: None found by B's script. Damgar's readers found its spec hash written with 62 characters in Damgar 0.1.0, so `flow` never matched (7a8c4db3): Damgar's fault, fixed in 0.1.1. (7a8c4db3) *traced*
- Prompted, read: No prompt found; it came with the kit.

- Pointer: DubWeb's open books reuse its line codes for a purse (Web: open books). (ae14b26f) *traced*

- **They agree on:** One text, no competitor.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): keep one.** Keep the report block; what it cannot say goes to the MOR lead (a withheld line, one report for many payments, a payer-checkable commitment). Rests on b9e43db4, 86011ca3, ae14b26f.

### M4. People who share costs (flatmates, a crew, a hardship fund) know who owes whom, and settle in few payments, with nobody holding the money

*Category: 2. Pools and mutual credit.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| DubPay's common pot | 880d33f2 (dubpay) | 1: bba5c058 → e91f72f5; 2: 73bece9f → f608f7fa | K1 body (the pot's Terms) and its own Statement kind for pot lines | 21, 10, 2 | 16 acts, 9 ids | 2 | 1 | unchecked 2 | prompted; prompted (another draft of the work) |
| Hop's tab (clearing a group's debts) | a48e4b24 (hop) | 1: 3ce77ad5 → 9b210440; 2: da0d4fa0 → 6924a08f | K1 body of a tab's Terms, with a call (task 6) for debts and payments | 5, 1, 1 | 0 acts, 0 ids | 2 | 2 | unchecked 2 | prompted; not found |

*Counts: counted, from listing B.*

**DubPay's common pot**

- Who holds money, who decides a release: Nobody: "money is never held" (P7). The balance is the sum of the lines; a paid-back line counts only once the payee's received line names it (P3). (73bece9f) *traced*
- A remainder, a failed share: Rounding left over from a spent line is the spender's (P2). A payment back not confirmed reads "paid, not yet confirmed". (73bece9f) *traced*
- A member who stops: A member who stops paying keeps a negative balance; leaving is a new version and "the member's balance at that version is still owed, in their name" (section 6). Spare Wheel adds its own rule: unpaid shares on two decided asks in a row and the member is left out of the next version, the shares still owed (d78557927156). (73bece9f, d7855792) *traced*
- The way out if its service closes: No service to close: any reader recomputes from the lines (DubPay's pot.mjs, Hop's settlement code). (73bece9f, 2525e63d, 232fc7c7) *traced*
- What it proves, and what is only someone's word: Proves who wrote each line, in what order, and that a payee confirmed a payment back. Only the signer's word: that a spent line's money was spent (section 4). A spent line binds others only because they assented in advance; draft 2 makes a disputed line count for nothing between the two (P4). (73bece9f, 232fc7c7) *traced*
- Faults found, by whom, fixed or not: DubPay's own: draft 1's spent line signed a debt for others (0fe96813); answered in draft 2 by giving a dispute force (232fc7c7). Hop: "the fewest payments" was not exact; reworded (c80a559d). One act in listing B (14b01383) is Edubba reading it, not a fault (inferred). (0fe96813, 232fc7c7, c80a559d, 14b01383) *traced*
- Prompted, read: The inventory marks draft 1 prompted; its announcement opens "something MOR has not been used for" (d6d2c2a0), the day-five prompt.
- Built on it: **DubPay's pot reader (build/pot/pot.mjs)** (880d33f2, dubpay; uses 3 acts by 1 identities, counted; used ≠ checked; prompted: prompted (notice 7 asked for apps)). DubPay's build/pot/pot.mjs: reads both drafts, checks Hop's clearings, eight tests. (232fc7c7, b89d1e7f) *traced*
- Built on it: **Hop's settlement suggestion for the common pot** (a48e4b24, hop; uses 1 acts by 1 identities, counted; used ≠ checked; prompted: not found). Hop's settlement code for rule P5; it reproduces the pot's vectors (c80a559d). Listing A: worth keeping as shared test vectors. (2525e63d, c80a559d) *traced*
- Built on it: **Spare Wheel (a hardship fund)** (3b4073ae, public-under-30; uses 48 acts by 9 identities, counted; used ≠ checked; prompted: not found). A hardship fund of seven: version 2 runs on the common pot with Plain Words' money decision; ask 2 was carried out with nobody holding money (98145bee). Its version 1 had one holder of 1,700 sats, paid back to close it (28698495). (73db2ea4, 98145bee, 28698495) *traced*

**Hop's tab (clearing a group's debts)**

- Who holds money, who decides a release: Nobody; Hop is the clerk: it reads, adds up and signs the clearing, "it moves nothing". (da0d4fa0) *traced*
- A remainder, a failed share: No rounding (whole debts). A payment not made stays owed payer to payee and the next clearing reads it. Over a member's cap, their newest debts are left out. (da0d4fa0) *traced*
- A member who stops: "A refused payment" is shown in each later clearing by name; "the tab cannot make anyone pay". A member leaves only at zero, or if the others carry their debt outside the tab. (da0d4fa0) *traced*
- The way out if its service closes: Clearings are Hop's posts alone; if the clerk stops, debts stand as the debtors' own admissions but nobody else signs a clearing (inferred). DubPay offered its reader as a second check (0fe96813); Hop kept the clerk role (8df3e122). (da0d4fa0, 0fe96813, 8df3e122) *inferred*
- What it proves, and what is only someone's word: Proves the debtor's own signature on each debt ("an admission"), and the clearing's arithmetic anyone can redo. Only Hop's word: which homes and records it read (the clearing says so). If the clerk errs, Hop pays. (da0d4fa0) *traced*
- Faults found, by whom, fixed or not: Hop found its own: draft 1 let one member's payment settle another's debt; fixed in draft 2 (da0d4fa0). DubPay's act 0fe96813 is a comparison, not a fault. (da0d4fa0, 0fe96813) *traced*
- Prompted, read: The inventory marks draft 1 prompted (day five).
- Built on it: **The round's tab (Hop, clerk)** (a48e4b24, hop; uses 24 acts by 4 identities, counted; used ≠ checked; prompted: not found). The round's tab, Hop as clerk: nobody joined, and Hop stopped it (c80a559d), then named it open with a draft 3 to come (8df3e122). (370a189c, c80a559d, 8df3e122) *traced*

- Pointer: Open books (DubWeb) say which tool for which purse: members who hold nothing together use the common pot, not open books. (ae14b26f) *traced*

- **They agree on:** Nobody holds the money; each payment back counts only when the payee says it arrived; settle by largest debtor to largest creditor, "not always the fewest"; a disputed debt is left out between the two (pot draft 2 took it from the tab). (73bece9f, da0d4fa0, c80a559d, 232fc7c7) *traced*
- **They differ, and why it matters:** Who writes a debt: the pot lets the spender write a shared expense others assented in advance to hear; the tab counts a debt only when the debtor signs it. Who computes: the pot needs no clerk; the tab has one clerk's signed clearing and a cap per member. Each author called the other's better in the same minutes (0fe96813, c80a559d); the pot then stood (232fc7c7) while Hop kept the tab open with a draft 3 (8df3e122). Unsettled at the round's end. (0fe96813, c80a559d, 232fc7c7, 8df3e122) *traced*
- **Lean, DubPay's (proposed): merge two.** One text, the pot as base (the only one run by other members: Spare Wheel's ask 2), with the tab's debtor-signed debt as a line kind and its acceptance clause as an option for groups that want a clerk. Rests on 98145bee, 73bece9f, da0d4fa0, 0fe96813, c80a559d, 232fc7c7.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). Both are in force by DubLaw's named signers; the round's tab takes members by buyer by assent. *Outcome 1:* If both become defaults: a pot or tab is in force by the kit's own check, and the round's tab's "member by assent" is a grammar case; the merge is only about lines. *Outcome 2:* If not: every pot and tab reads "unchecked" in force (the kit said so on 5a706a74, 73db2ea4, c4700b24, 370a189c), and a merged text keeps naming the cMIP. (5a706a74, 73db2ea4, c4700b24, 370a189c)

### M5. A savings circle where each member takes the whole pot in turn, and a member who took the pot stops paying

*Category: 2. Pools and mutual credit.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| The clusters' rotating pot | ba28ac63 (clusters) | 1: d2aa5dec → 01c17e38 | K1 body | 2, 1, 1 | 0 acts, 0 ids | 1 | 0 | unchecked 1 | no |

*Counts: counted, from listing B.*

**The clusters' rotating pot**

- Who holds money, who decides a release: Nobody between rounds: each member pays the round's taker directly; the taker signs one receipt per round. (d2aa5dec) *traced*
- A remainder, a failed share: Whole contributions; no rounding. A member neither listed nor holding a proof still owes the taker, in the taker's own name. (d2aa5dec) *traced*
- A member who stops: "A member who takes their turn early and stops paying is the classic loss of every chama: MOR cannot prevent it." The `late:` line is the group's own words; no rule reads it. (d2aa5dec, 44b07c7f) *traced*
- The way out if its service closes: No holder; order rests on the place where receipts are lodged (Postmark's). (d2aa5dec) *traced*
- What it proves, and what is only someone's word: Proves payment by the payer's own preimage, even against the taker's silence; the receipt is the taker's word. (d2aa5dec) *traced*
- Faults found, by whom, fixed or not: None found by B's script; one member broke what he could and stated the limit (44b07c7f). (44b07c7f) *traced*
- Prompted, read: No prompt found.

- **They agree on:** One text.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): gap still open.** Keep the rotating pot; the member who took the pot and stops is a gap no text closes (only visibility). Note: its Terms (f0152013) were used by its own authors only. Rests on d2aa5dec, 44b07c7f, f0152013.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). In force by named signers (the kit: unchecked, f0152013). *Outcome 1:* If default: the circle's Terms are checked in force by the kit. *Outcome 2:* If not: they stay "unchecked" and members read the rule by hand. (f0152013)

### M6. A group decides together who is paid from its money, and nobody can push through more than the group's rules allow

*Category: 2. Pools and mutual credit.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Plain Words' money decision (a Statement kind) | 76a78f70 (plain-words) | 1: 759b8d58 → ced79f7c; 2: e7bba1fa → d9dab85a; 3: 14e01443 → 30148187; 4: ed56f60c → 88cf4137; 5: f2970dcc → 8cd7b8b1 | K7 Statement kind, counted by a K3 power | 16, 13, 4 | 14 acts, 12 ids | 3 | 1 | not shown 2, unchecked 1 | no |

*Counts: counted, from listing B.*

**Plain Words' money decision (a Statement kind)**

- Who holds money, who decides a release: A keeper ("the agent") holds and pays; the power's signers decide; limits come from the power's rule, never the decision's own parameters. (f2970dcc) *traced*
- A remainder, a failed share: Not applicable: one payee, one amount. A decision expires (`max_life`) and is payable only while its Terms version is in force. (f2970dcc) *traced*
- A member who stops: Not applicable (inferred); in Spare Wheel, a member who does not pay is handled by the pot's Terms (rule 5). (d7855792) *inferred*
- The way out if its service closes: Not stated (inferred: the decision is a record; the keeper is outside the text). *inferred*
- What it proves, and what is only someone's word: Proves who signed the decision and that it was witnessed by a place (V4). "The grammar never sees the payment, only the decision"; paying twice is "the payer's breach, shown by its published holdings". (f2970dcc) *traced*
- Faults found, by whom, fixed or not: Counterparty's K7-1, K7-2, B1, V4 and W-1 fixed across drafts 2 to 5 (5d54329e, eb56f122, 54193dc9); V3 stated as a cost. One act in listing B (14b01383) is Edubba reading it (inferred). (5d54329e, eb56f122, 54193dc9, 14b01383) *traced*
- Prompted, read: No prompt found.

- Pointer: Spare Wheel (M4) decides its asks with three members' money decisions (98145bee). (98145bee) *traced*

- **They agree on:** One text here; the round's own list groups it with escrow and the arbiter's award as "a held sum released on signed conditions" (cmips-indispensable).
- **They differ, and why it matters:** Against escrow (M8): the decision has no holder of its own and no deadline but expiry; the escrow holds and releases on a clock. (f2970dcc, ca9d95cd) *inferred*
- **Lean, DubPay's (proposed): keep one.** Keep the money decision. Whether it, the escrow's release and DubLaw's award become one shared text is a seam question with DubLaw, not settled here. Rests on f2970dcc, ca9d95cd, 5102247f.

### M7. Circles that swap time or favours instead of money (babysitting, repairs) keep a fair balance of what each owes

*Category: 2. Pools and mutual credit.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Hours of care (a Statement kind, for circles that swap time) | 058d65d4 (public-30-49) | 1: 6b0cc411 → 4a737c66 | K7 Statement kind | 5, 4, 1 | 3 acts, 3 ids | 0 | 0 | no Terms names it | no |

*Counts: counted, from listing B.*

**Hours of care (a Statement kind, for circles that swap time)**

- Who holds money, who decides a release: No money: "Nothing is paid; the balance is the count." (6b0cc411) *traced*
- A remainder, a failed share: Quarter units; an "owed" not confirmed in time lapses; a disputed one does not count until the Terms' words decide. (6b0cc411) *traced*
- A member who stops: The Cercle's own Terms: nobody below −10 or above +20 hours; a member leaves within 2 hours of zero (64cd7830). (64cd7830) *traced*
- The way out if its service closes: "No one runs this": the record is the acts; a counting script is offered, to be read before it is run. (64cd7830) *traced*
- What it proves, and what is only someone's word: Proves the giver confirmed, "not that the care happened". The time limit rests on the place's anchors. (6b0cc411) *traced*
- Faults found, by whom, fixed or not: None found by B's script. *traced*
- Prompted, read: No prompt found; its Terms' scripts follow notice 7 (apps).
- Built on it: **Le Cercle de garde (a babysitting circle)** (058d65d4, public-30-49; uses 25 acts by 8 identities, counted; used ≠ checked; prompted: not found). Le Cercle de garde, Lyon: five parents; version 2 in force by the kit (shown). (caede5b5) *traced*
- Built on it: **Krog varstva (a copy of the Cercle, Ljubljana)** (8ca0c2e8, public-30-49; uses 17 acts by 6 identities, counted; used ≠ checked; prompted: not found). Krog varstva, Ljubljana: a copy of the Cercle; version 2 in force (shown). (b059f5d1) *traced*
- Built on it: **cercle-count.mjs (the Cercle's counting script)** (058d65d4, public-30-49; uses 3 acts by 1 identities, counted; used ≠ checked; prompted: prompted (notice 7 asked for apps)). cercle-count.mjs, the Cercle's counter. (3024f5c3) *traced*
- Built on it: **The Mending Circle (a repair circle)** (e4e5f6db, public-prosumers; uses 37 acts by 11 identities, counted; used ≠ checked; prompted: not found). The Mending Circle counts repairs owed with its own one-line text acts, not this Statement kind; lending moved to the lending shelf in version 3 (104dcc6d). (6b2736be, 104dcc6d) *traced*
- Built on it: **mending.mjs (counts the Mending Circle)** (e4e5f6db, public-prosumers; uses 1 acts by 1 identities, counted; used ≠ checked; prompted: not found). mending.mjs, counts the Mending Circle from feed pages. (046b26cd) *traced*

- Pointer: The lending shelf (Agreements) counts loans of things with no money; the Mending Circle uses it. (8ff8ac74, 104dcc6d) *traced*

- **They agree on:** Record by the one who received, confirmation by the one who gave, a balance anyone counts; nobody runs it. (6b0cc411, 64cd7830, 104dcc6d) *traced*
- **They differ, and why it matters:** The Cercle and Krog use the Statement kind (checked by the kit as Statements); the Mending Circle uses plain text lines (MEND-…), read by the reader only. The common pot (M4) counts sats only and says another unit "needs another draft" (73bece9f, section 6). (64cd7830, 104dcc6d, 73bece9f) *traced*
- **Lean, DubPay's (proposed): keep one.** Keep hours of care as the one Statement kind for a balance in a unit not sats; the gap is a unit-named count shared with the common pot. Rests on 6b0cc411, 73bece9f.

### M8. A buyer pays before the thing exists and gets the money back if it never comes, or if it is not what was sold

*Category: 3. Money held.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Until's escrow | 3022fb29 (until) | 1: 9ae61048 → cf337a8e; 2: a2d41910 → 559c7ffb; 3: caf80755 → 89c80e3c; 4: ef17be4f → cadbbc54; 5: ca9d95cd → a54b6066 | K6 control in a vow whose receiver is the escrow, with K4 locked updates | 51, 8, 6 | 24 acts, 7 ids | 15 | 11 | unchecked 3 | no |

*Counts: counted, from listing B.*

**Until's escrow**

- Who holds money, who decides a release: The escrow holds; release per stage once the contest window passes with no contest; refund in full if not delivered by `deliver_by`. A contest refunds on the buyer's word in mode event, unless the vow relies on an arbiter clause [AW]: then the arbiter's award decides and the escrow executes it. (ca9d95cd) *traced*
- A remainder, a failed share: Fees round down, the remainder to `release_to`. An unclaimed refund is held apart as still owed and paid on the first invoice, however late [U6]; a release that cannot be received stays held, stated each window. (ca9d95cd) *traced*
- A member who stops: A maker who stops after a stage keeps what was released; "it does not protect against the maker failing after a stage was released". (ca9d95cd) *traced*
- The way out if its service closes: If the escrow stops: a last report within 144 blocks [LR], and a guarantee held apart (at most 2× before audit, 4× after). This round the guarantee is "the bank's word, not a proof" [V6]. (ca9d95cd, 28a5608f) *traced*
- What it proves, and what is only someone's word: Proves deliveries and contests by their record in a place's lane, the escrow's `delivered` Statement, a checker's yes or no on a key. Only the escrow's word: its tick in a gap between anchors, and the guarantee's balance. (ca9d95cd) *traced*
- Faults found, by whom, fixed or not: 11 acts by others (listing B, counted). Counterparty: 17 findings on drafts 1 to 3, all accepted and answered; "none is open today" (96d5fc8e); three more on draft 3, answered in draft 4. No vow is signed under any draft: the one vow seen says "TEST VOW: nobody pays" (b381f537). (96d5fc8e, a66c2005, b381f537, ca9d95cd) *traced*
- Prompted, read: No prompt found.
- Built on it: **Kept Word (deliver or refund, a guild charter)** (28070ee8, public-creators; uses 19 acts by 12 identities, counted; used ≠ checked; prompted: not found). Kept Word, a guild charter: deliver within 144 blocks or refund in full; "the guild holds no money"; a buyer who wants money held uses an escrow such as Until's (charter, rule 6). (825b834d, 713ad026) *traced*

- Pointer: Plain Words' room let (Agreements) holds the deposit under this escrow, used the other way round. (9f1911e7) *traced*
- Pointer: DubLaw's arbiter's award decides a contest under draft 5 [AW]. (5102247f, c96e1cea) *traced*
- Pointer: Kept Word's delivery receipt (Agreements or Web, theirs to settle) judges a delivery; refunds hang on it. (fa31564e) *traced*

- **They agree on:** One escrow text; Kept Word and the room let both lean on it rather than hold money themselves. (825b834d, 9f1911e7) *traced*
- **They differ, and why it matters:** Not applicable among Money texts.
- **Lean, DubPay's (proposed): gap still open.** Keep Until's escrow, the only one; the gap is that it was never used with money (only a test vow), so nothing about release or refund was tried. Rests on ca9d95cd, b381f537.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). Buyers fill a role and are not signers; the only update that needs buyers reads their assents (update 3, [V5]). *Outcome 1:* If buyer by assent becomes a grammar case: update 3 is checked by any verifier that reads assents. *Outcome 2:* If not: "a verifier that reads only signers must not be relied on for this update" (the text's own words). (ca9d95cd)

### M9. People who keep their identity on a home are paid if its operator breaks its word or closes badly

*Category: 3. Money held.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Until's home bond | 3022fb29 (until) | 1: 9cbdffb3 → e33943e7 | Terms reusing the escrow (a single-stage vow) with a role of kind fits | 3, 1, 1 | 0 acts, 0 ids | 1 | 0 | unchecked 1 | prompted |

*Counts: counted, from listing B.*

**Until's home bond**

- Who holds money, who decides a release: The escrow holds the operator's bond; the named arbiter decides each claim, "neither the operator nor the escrow". (9cbdffb3) *traced*
- A remainder, a failed share: Each upheld claim pays `per_claim`; if claims exceed the bond, equal shares in whole sats, remainder to the earliest claim; what is left at the end goes back to the operator. (9cbdffb3) *traced*
- A member who stops: The operator who stops is the case it covers (promises 1 to 4). (9cbdffb3) *traced*
- The way out if its service closes: "The bond is only as good as the escrow"; here the escrow's money sits in the hosts' bank. (9cbdffb3) *traced*
- What it proves, and what is only someone's word: Proves the manifest's hash, anchored, and every claim and decision. Cannot prove an absence: a 404 is not a signed statement. (9cbdffb3) *traced*
- Faults found, by whom, fixed or not: None found by B's script. *traced*
- Prompted, read: The inventory marks it prompted.

- **They agree on:** One text.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): keep one.** Keep the home bond under Money (its money is held under the escrow); its promises are DubWeb's homes, a seam. Rests on 9cbdffb3.

### M10. Someone honestly holds money for an owner who has not come for it (a maker without an invoice, a refund), and the owner can claim it with one act

*Category: 3. Money held.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Stall's held for you | ddafffcd (stall) | 1: ad3b8e7f → 31b66901; 2: ecf9afc4 → 08ae1b2c | Plain text lines (HELD, CLAIM, PAID, RELEASED, GOT); no Agreements task | 3, 2, 2 | 1 acts, 1 ids | 0 | 4 | no Terms names it | prompted; prompted (another draft of the work) |

*Counts: counted, from listing B.*

**Stall's held for you**

- Who holds money, who decides a release: The holder holds and admits it in a line it cannot take back; only the owner named claims, with their own invoice; release to another needs the HELD's `until` and a place that saw no claim (rule 4). (ecf9afc4) *traced*
- A remainder, a failed share: A PAID for less than N leaves the rest held. With `place none`, the holder can never release. (ecf9afc4) *traced*
- A member who stops: An owner who never comes: the line waits; "a CLAIM unanswered by a PAID within 48 blocks reads claimed, unpaid" for the holder. (ecf9afc4) *traced*
- The way out if its service closes: Not stated where claims go if the place stops (the round's list asks for it). Hop holds 746,566 sats in such lines past the round: "If the round's bank closes first, Hop owes them still, in its own signed words" (8df3e122). (ecf9afc4, 8df3e122) *traced*
- What it proves, and what is only someone's word: Proves the holder's admission, the owner's claim, the payment by preimage. "It cannot prove the holder has the money." (ecf9afc4) *traced*
- Faults found, by whom, fixed or not: 4 acts by others in listing B: DubWeb's open books build on it (9e1daa90, ae14b26f), Edubba reads it (14b01383), the lending shelf borrows its shape (3c225f82); none a fault (inferred). Stall fixed its own `since` wording in draft 2. (9e1daa90, ae14b26f, 14b01383, 3c225f82, ecf9afc4) *inferred*
- Prompted, read: The inventory marks draft 1 prompted.
- Built on it: **held.mjs (Stall's reader for held for you)** (ddafffcd, stall; uses 1 acts by 1 identities, counted; used ≠ checked; prompted: prompted (notice 7 asked for apps)). Stall's held.mjs 0.1: reads a holder's book. Listing A counts HELD lines in 23 acts by 4 signers and CLAIM lines in 8 acts by 7 signers. (863a5bbd) *traced*

- Pointer: Open books (DubWeb) write a keeper's debts in this form (section 2a). (ae14b26f) *traced*
- Pointer: Proven claim (Web: record and time) is its mirror: the one owed proves a debt the debtor ignores. (de67b513) *traced*

- **They agree on:** One text.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): keep one.** Keep held for you (the round's list: mostly "no change needed"); the gap is where claims go when its place stops. Rests on ecf9afc4, 8df3e122.

### M11. A buyer gets an invoice from a seller who must make it first, privately, and the invoice itself says what it is for

*Category: 4. Asking to be paid.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Invoice request form (piece A of Commission 1) | 6d354b6f (followers) | 1: 72bbce87 → b13f771c; 2: beb3fdad → 76c65a26 | Sealed acts; no Agreements task | 15, 9, 5 | 14 acts, 8 ids | 1 | 1 | no Terms names it | no |
| Hop's answerer (it writes the invoice for you) | a48e4b24 (hop) | 0.1: 46aaf149 → d497df18 | A tray app (code as a text act); no Agreements task | 1, 1, 1 | 0 acts, 0 ids | 0 | 0 | no Terms names it | not found |

*Counts: counted, from listing B.*

**Invoice request form (piece A of Commission 1)**

- Who holds money, who decides a release: Holds nothing. (beb3fdad) *traced*
- A remainder, a failed share: Not applicable. A refused request is closed; one live invoice per request; a second request with the same nonce is ignored. (beb3fdad) *traced*
- A member who stops: A seller who never answers: the buyer abandons the request and refuses a late invoice (L6). (beb3fdad) *traced*
- The way out if its service closes: Not applicable: a text, no service. *inferred*
- What it proves, and what is only someone's word: Proves the invoice's description hash is the request's id, and what the buyer's client checks before paying. Does not hide timing or the purchase from the bank and the home's operator. (beb3fdad) *traced*
- Faults found, by whom, fixed or not: Sanne Verhoeven's reading (S1 to S7) and Laurent Lambert's (L1 to L6), all answered in draft 2 (77f589ec, b97fac85). "No code exists": piece B was not started. (77f589ec, b97fac85, beb3fdad) *traced*
- Prompted, read: Commissioned by Commission 1 (a player's paid commission, the lurker window); no hosts' prompt found.
- Built on it: **Commission 1 (Odile Ferrant pays for an invoice request form and a seller's answerer)** (d79c1ba7, lurker; uses 39 acts by 14 identities, counted; used ≠ checked; prompted: not found). Commission 1: a buyer pays 20,000 sats for the request form, 40,000 for a seller's answerer, 150,000 for a buyer's client; the test is Sanne Verhoeven's. (51c0ec8b, c9ad32e5) *traced*

**Hop's answerer (it writes the invoice for you)**

- Who holds money, who decides a release: Holds nothing; it asks the payee's bank for an invoice under a cap and posts it. (46aaf149) *traced*
- A remainder, a failed share: Not applicable; never above `--cap`. (46aaf149) *traced*
- A member who stops: Not applicable. *inferred*
- The way out if its service closes: Hop: "the real fix, a payee's own node answering a BOLT 12 offer, needs a Lightning rail Module draft" (8df3e122). (8df3e122) *traced*
- What it proves, and what is only someone's word: Binds the invoice to the asking act by its description hash. The ASK line is public: payee and amount are seen by all. (46aaf149) *traced*
- Faults found, by whom, fixed or not: None found by B's script; listing A: only Hop's self-test seen (one ASK, one INVOICE), Ampersand ran it. (46aaf149, 9a49cfc8) *traced*
- Prompted, read: No prompt found; it answers Commission 1's piece B in part (inferred).

- **They agree on:** The invoice's description hash names the act that asked for it; the payee signs the reply. (beb3fdad, 46aaf149) *traced*
- **They differ, and why it matters:** The form seals the request and the reply to a fresh identity; the answerer reads public ASK lines. The form has no code; the answerer is code with one self-test. It matters for buyers' privacy, the point of Commission 1. (beb3fdad, 46aaf149, c9ad32e5) *traced*
- **Lean, DubPay's (proposed): merge two.** One path: the request form as the shape, an answerer as its reader and writer; the gap is that neither was run against the commission's test. Rests on beb3fdad, 46aaf149, c9ad32e5.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). The request may carry the buyer's assent sealed with it (field 6). *Outcome 1:* If buyer by assent is a grammar case: the receiver holds a grammar assent beside the request. *Outcome 2:* If not: the assent is a cMIP spot the kit does not check; in both cases "it proves an assent, never a payment". (beb3fdad, 4c59cb1f)

### M12. Rent or anything paid by the period: anyone can see which periods are paid, late, unpaid or never asked for

*Category: 4. Asking to be paid.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| Plain Words' period payment (a Statement kind) | 76a78f70 (plain-words) | 1: 15d03f0c → 50bcb2e5 | K7 Statement kind | 3, 1, 1 | 0 acts, 0 ids | 0 | 1 | no Terms names it | prompted |

*Counts: counted, from listing B.*

**Plain Words' period payment (a Statement kind)**

- Who holds money, who decides a release: Holds nothing. (15d03f0c) *traced*
- A remainder, a failed share: Not applicable; the amount is the Terms' words. (15d03f0c) *traced*
- A member who stops: A payer who stops: periods read "unpaid"; what follows is the Terms' words. A payee who never asks: "not asked", nothing owed. (15d03f0c) *traced*
- The way out if its service closes: Not applicable: a Statement kind. *inferred*
- What it proves, and what is only someone's word: A preimage proves the invoice was paid, "not who paid it". (15d03f0c) *traced*
- Faults found, by whom, fixed or not: One act in listing B, hours of care, shaped after it (6b0cc411): not a fault (inferred). (6b0cc411) *inferred*
- Prompted, read: The inventory marks it prompted.

- Pointer: Made for the room let (Agreements). (9f1911e7) *traced*

- **They agree on:** One text.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): keep one.** Keep it; used only by its author (3 acts). Rests on 15d03f0c.

### M13. When a money service stops, everyone it owes can see what it held, what it owed and who takes over

*Category: 3. Money held (and what is owed).*

No Money text of the slice answers it (counted).

- Candidate: The last report, drafts 0 and 1, by a lurker window's player: "Still not a cMIP; it binds nobody". Not in the inventory or listing B (A's candidate, inferred). (28a5608f, ff9e88fb) *inferred*
- Candidate: The escrow's own last report [LR], in the same shape (M8). (ca9d95cd) *traced*
- Candidate: A holder's book under held for you is lines 1 and 2 of the last report, "kept as you go" (M10). (ecf9afc4) *traced*

- **They agree on:** The escrow and held for you both take the last report's lines. (ca9d95cd, ecf9afc4) *traced*
- **They differ, and why it matters:** Only the escrow binds itself to it; the last report binds nobody. (ca9d95cd, ff9e88fb) *traced*
- **Lean, DubPay's (proposed): gap still open.** No Money text in the slice; the last report is a candidate to list. Its rule D rests on a person's word in advance and two witnesses saying TAKEN, drawn on the vouching case: not tried (the order's rule 2). Rests on ff9e88fb, cd3dc69b.

### M14. Someone who paid and got nothing proves the debt, from bytes, where the next payer will read it

*Category: 4. Asking to be paid (a debt recorded, nothing recovered).*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| register.mjs (reads Proven claims) | 21a3f657 (followers) | 0.3: dffe90fb; 0.4: 0372e86b; 0.6: 2992758f | A tray app reading Proven claim acts; no Agreements task | 5, 2, 1 | 1 acts, 1 ids | 1 | 0 | no Terms names it | prompted (notice 7 asked for apps) |

*Counts: counted, from listing B.*

**register.mjs (reads Proven claims)**

- Who holds money, who decides a release: Holds nothing; "It recovers nothing" (Proven claim). (de67b513) *traced*
- A remainder, a failed share: Not applicable. *inferred*
- A member who stops: A debtor who never pays: the claim stays open beside the debtor's number. (de67b513) *traced*
- The way out if its service closes: A register is "a sum anyone can redo, from the files it read and the places it trusts, both named". (de67b513) *traced*
- What it proves, and what is only someone's word: Proves the debtor signed the invoice and the preimage matches; rival claims are ordered only by a witness place. Cannot prove who paid, nor that a delivery happened. (de67b513, 726e8c43) *traced*
- Faults found, by whom, fixed or not: A copier won under draft 1's ordering (07e86444); fixed in draft 2 by ordering through a witness. (07e86444, de67b513) *traced*
- Prompted, read: Notice 7 asked for apps; its first announcement opens "Something MOR has not been used for" (e038575c), the day-five prompt.

- Pointer: Proven claim itself is placed in Web: record and time (DubPay's proposal in A, with a pointer from Money 4). (de67b513) *traced*

- **They agree on:** One reader of one text.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): keep one.** Keep register.mjs beside its text; Money keeps a pointer, and a payer's app reads the register before paying (listing A, row 8). Rests on de67b513, 623a2749.

### M15. A neighbour lends a thing (a ladder, a drill) and can show it is late or came back, with no money moving

*Category: 5. Loans and returns.*

> Used is not checked: the kit checked no rule above the core; a count says the text was applied by hand, not that it works.

| Solution | Author (window) | Drafts: act → spec | Task it plugs into | Uses: acts, identities, windows (used ≠ checked) | By others | Built on it | Acts speaking of a fault | The kit on Terms naming it (in force; at most 3 asked) | Prompted (slice A) |
|---|---|---|---|---|---|---|---|---|---|
| shelf.mjs (the lending shelf's tray app) | 2c381cf6 (steward-and-co) | 0.1.0: 342921d6 | A tray app reading the lending shelf's Terms and Statements | 1, 1, 1 | 0 acts, 0 ids | 0 | 0 | no Terms names it | prompted (notice 7 asked for apps) |

*Counts: counted, from listing B.*

**shelf.mjs (the lending shelf's tray app)**

- Who holds money, who decides a release: No money: "Nothing is sold and no money has to move"; a deposit, if any, is held under an escrow the Terms name. (8ff8ac74) *traced*
- A remainder, a failed share: Not applicable. *inferred*
- A member who stops: A borrower who keeps the thing: the loan reads open, then late; a warning notice may follow in the Mending Circle's Terms (rule 13). (8ff8ac74, 104dcc6d) *traced*
- The way out if its service closes: It only reads; any reader holding the same acts gets the same count. (73a05f6e) *traced*
- What it proves, and what is only someone's word: Proves who said handed, returned and received back, in order; "MOR cannot see the ladder". (8ff8ac74) *traced*
- Faults found, by whom, fixed or not: None found by B's script; the first loan was a demonstration between Steward's own two identities, "so it earns neither of them trust" (3c225f82). (3c225f82) *traced*
- Prompted, read: Notice 7 asked for apps.

- Pointer: The lending shelf itself is placed in Agreements 4 (DubPay's proposal in A). (8ff8ac74) *traced*

- **They agree on:** One reader of one text.
- **They differ, and why it matters:** Not applicable.
- **Lean, DubPay's (proposed): keep one.** Not Money's by its own words: shelf.mjs follows its text to Agreements, and Money keeps a pointer for a deposit held under escrow. Rests on 8ff8ac74, e5d774d2.
- **Turns on named signers and buyer by assent** (a core question for Nobody, allegedly). The borrower is a role filled by buyer by assent; the listing is in force by named signers. *Outcome 1:* If both become defaults: a listing and a loan are checked by the kit with no cMIP. *Outcome 2:* If not: the shelf names both cMIPs and the kit answers "unchecked" (e1975bda). (8ff8ac74, e1975bda)

## 3. For the MOR lead: what the language could not say, in Money's area

*Adds to listing B's section (11 items there, not repeated). Its section's shape is a day-five prompt's ("what the language could not say", in 19 acts, counted by B). Nothing here is decided.*

- A payment naming a version that is no longer in force is still divided by it (G13.1): no cMIP can stop a replaced service taking it. The straight split leaves it to the core (section 8, W5); the escrow refunds such a payment at once (U2); Hop's split takes no fee on it. (b9e43db4, 96d5fc8e, ca9d95cd, 86011ca3) *traced*
- No settlement act: Money's side of draft 25 ("the same payment", the order of settlements) is undefined; spots stay unchecked and the escrow stands in a Lightning payment hash. (a0108c37, ca9d95cd) *traced*
- Who paid: a preimage proves knowledge, not identity. Said by the period payment, Proven claim and the escrow (which refuses to pay whoever shows a preimage). (15d03f0c, de67b513, ca9d95cd) *traced*
- A leg report shows one leg (G11.6): a payer-checkable commitment of membership in the report block would let any owner check what came in; and whether one report may cover several payments is open. (86011ca3, ca9d95cd) *traced*
- A pool: what a leg report names from a pool is open in draft 25 (P6), so Hop's split keeps none. (86011ca3) *traced*
- A decision to pay and the payment are not linked in the grammar: "the grammar never sees the payment, only the decision"; paying twice is invisible to it. (f2970dcc) *traced*
- A debt cannot follow an identity that was taken: "only the debtor signing again moves the debt". This rests on the vouching case, which was not tested (rule 2). (ff9e88fb) *traced*
- A buyer's assent proves an assent, never a payment (Pointer's finding, ruled; Edubba 12 prints it). (14b01383, 4c59cb1f) *traced*

- And the core question the order names: whether named signers and buyer by assent become the grammar's defaults. In Money's area it decides the in-force reading of every deal, pot, tab, circle and listing above; the groupings that turn on it are marked, each with its two outcomes.

## 4. Seam problems

*Each sits on another Dub's area. Settled by seam act before filing; not settled here.*

| Problem | Other Dub | What sits on their area | Acts |
|---|---|---|---|
| M1 | DubLaw | The division itself is shower work's; the deal's parameters (section 6) were settled by seam act and a hosts' ruling, not in the text. | 393f664c, ede89994, b9e43db4 |
| M2 | DubLaw | A spot in an offer's parties, filled by a buyer's assent: DubLaw placed both spots in Agreements 1 (when Terms are in force, who signs). | a0108c37, b7fca8d1 |
| M3 | DubWeb | Who may read a full report (public flow's readers, the commitment): what people see. | b9e43db4 |
| M4 | DubLaw | A disputed pot line may go to an arbiter under DubLaw's award. | 73bece9f, 5102247f |
| M4 | DubWeb | Open books say which tool for which purse; a pot and a purse shown in the open meet there. | ae14b26f |
| M6 | DubLaw | A held sum released on signed conditions: money decision, the escrow's release and the arbiter's award. | f2970dcc, 5102247f |
| M7 | DubLaw | Circles are Terms for people (consent, joining, disputes by three members). | 64cd7830, 104dcc6d |
| M7 | DubWeb | Hours of care was placed in open books by DubWeb; its time limit rests on a place's anchors (records and time). | 6b0cc411 |
| M8 | DubLaw | Contests, the arbiter's award, deposits under Terms (the room let), the delivery receipt. | ca9d95cd, 9f1911e7, fa31564e, c96e1cea |
| M9 | DubWeb | Homes and the way out: the bond's promises (notice, receipts, nothing lost, closure by the book). | 9cbdffb3 |
| M10 | DubWeb | Open books 2a and the two clocks (place and anchor): records and time. | ecf9afc4, ae14b26f |
| M11 | DubWeb | What a buyer is seen doing: the timing and size of sealed containers (L1). | beb3fdad |
| M12 | DubLaw | Rent under a let, in plain words: the room let is DubLaw's. | 15d03f0c, 9f1911e7 |
| M13 | DubWeb | Where a record lives after a service stops, and how a person carries their own out (line 6). | ff9e88fb |
| pointer | DubWeb | Proven claim (Web: record and time), with a pointer from Money 4. | de67b513 |
| pointer | DubLaw | The lending shelf (Agreements 4), with a pointer from Money 5 (loans and returns). | 8ff8ac74 |

## 5. Limits

- The problems, the placement of each text under one, and every lean are hand-made in catalogue-money-hand.mjs; each is DubPay's proposal, nothing is decided.
- Fields were read from each text's latest draft and the acts named; earlier drafts were read only where a fault's answer is traced.
- Faults: listing B finds them by words; the ones read are named; a count of fault acts is not a count of faults.
- Used is not checked: no count here says a split, pot, escrow, decision, claim or invoice rule works. Nobody used the escrow with money.
- Sealed acts were not opened; the windows' reports were read only through listing B's counts.
- Nothing was signed, posted or paid; no key was read.
- Recovery by vouching: the last report's rule D (M13) and the "taken identity" item (section 3) rest on the one case of an identity others spoke for, where thief, victim and vouchers were one window. Not catalogued as tried. No Money solution was tried with a recovered identity: every line, claim and confirmation assumes the same key throughout.
- Cited ids: 89, of which 89 are acts held in the research copy and 0 media hashes; 0 not found (counted).
- Placement check: every Money key of slice A is under exactly one problem (33 of 33, counted).

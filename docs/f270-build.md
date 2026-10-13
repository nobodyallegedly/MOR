# F270, with F273 and F274: built

*12 October 2026, night. One roadmap step: the core's business decided on the deal assessment tool's question Q2 (F270) and on core v22's second-pass questions Q7 and Q8 (F273, F274), written into the texts and built. Test identities only. For Nobody, allegedly, to approve: Agreements draft 12, the MICS v24 and the freeze suite v24.*

## In plain words

Someone can own part of what a deal or a collective earns without having any say in how its money is split: an investor who bought into a film's deal without becoming one of its parties, or a member who left a collective and kept their share. Until now, the people with the say could quietly pay such a holder less, without touching the holder's share itself: by raising someone else's cut, adding a fee, changing the program that does the split, and so on.

That is now closed, as you decided:

- **F270:** a new version that pays such a holder less needs that holder's signature. Without it, the new version is only a draft and nothing changes.
- **F274, what "paid less" means:** anything that lowers what the stake receives from a payment, or can expect from the plan as written. Your list, each item now checked by the core: another share added or raised, a role share added, unfilled roles sent elsewhere, the rail fee moved onto the receivers, the maximum fee raised or removed, the split program (the split cMIP) or its settings changed, and a fee added or raised. The core compares the old and the new plan by their effect: if the investor's part goes down, it asks for the investor's signature; if a change only looks different but pays the same or more, it does not.
- **F273, advance permission:** in a deal, nothing the parties wrote in advance lets them cut the investor's pay. In a collective, a member who left signed the rules while a member, so what those rules allowed in advance still reaches their pay. In practice: if a departed member vanishes, the collective can declare them absent, as its clause allows, and is then no longer blocked from adding a fee.

Members who hold the say, or chose it by signing the constitution, are left to the collective's own rules, as decided.

The deal assessment tool follows: it no longer warns that an investor or a departed member can be paid less behind their back (the core now refuses it), it still warns about members outside the power, and its warning about an uncapped fee now quotes rule 25's current words.

**One question for you** (below, Q1): which advance permission the core should accept for a departed member's pay. I built the reading I think fits your decision, marked "to confirm".

## Precisely

### The texts

**Agreements draft 12** (`spec/MIR-agreements-draft-12.md`). Draft 11 stays, approved. Draft 12 changes rule 48 (was 46) alone, and says so in its header ("Nothing else changes"):

- where draft 11 had *"Open (core v22, Q7): whether the first paragraph's 'unless the agreement pre-authorised it' reaches this one."*, it now reads: **"The agreement's advance permission reaches a collective's departed holder's pay, and never a deal's non-party holder's** (new in draft 12, F273). The first paragraph's 'unless the agreement pre-authorised it', the abandonment clause among such permissions, reaches what a departed holder is paid, who signed the constitution as a member; it never reaches what a deal's holder who is no party is paid, who never signed the agreement." Then the reading, marked *"Reading, to confirm (`docs/f270-build.md`, Q1)"*, and the decision's words, *"A) agreed"*.
- where draft 11 had *"Open (core v22, Q8): which changes of the split plan 'lower a stake's part'."*, it now reads: **"A stake is paid less by any change that lowers what it receives from a payment or can expect from the plan as written** (new in draft 12, F274): another share added or raised, a role share added, unfilled roles sent elsewhere, the rail fee moved onto receivers, the maximum fee raised or removed, the split cMIP or its parameters changed, as well as a fee added or raised. **What a cMIP pays cannot be read from the plan alone, so changing the split cMIP or its parameters counts.**" Then the decision's words, *"What money sees and money expects is what matters"*.
- F270's "to build" marks are removed where this build does it: rule 28 (fees), rule 45 (the clone's list of signatures), rule 48, rule 68 (departed holders), and F270's freeze line. Each still reads "new in draft 11, F270".

**The MICS v24** (`spec/02-MOR-MICS-v24.md`): version 23, approved, naming Agreements draft 12. Version 23's header moves to "Earlier versions", marked approved. The sentences changed:

1. The header: "Version 24 … naming Agreements draft 12, which writes in F273 and F274 … F270 is built with them … Agreements draft 12 …".
2. "Changing an agreement": "… a deal's holder who is no party, a collective's departed holder (F270, to build). A deal's clone needs every party." now reads "… a deal's holder who is no party, a collective's departed holder (F270). **A stake is paid less by any change that lowers what it receives from a payment or can expect from the plan as written; a change of the split cMIP or its parameters counts, since what a cMIP pays cannot be read from the plan alone (F274). The agreement's advance permission reaches a collective's departed holder's pay, never a deal's non-party holder's (F273).** A deal's clone needs every party."
3. "Departed holders": "Their stake never shrinks without their signature, nor is what it is paid lowered without it (F270), and is a share of all the collective's income." now reads "… nor is what it is paid lowered without it (F270), **save where an advance permission they signed as a member reaches it (F273)**, and is a share of all the collective's income."
4. "Open before freeze": "To build first: F267's claim field and route reading, F268's declared field, F270's signatures. … Open, from the second pass (Q7, Q8): whether an agreement's pre-authorisation reaches F270, and which changes of the split plan lower a stake's part." now reads "To build first: F267's claim field and route reading, F268's declared field. … **The second pass's two questions are answered (F273, F274), written in Agreements draft 12 and built with F270's signatures (`docs/f270-build.md`); one reading taken building them, what advance permission the core can read, is to confirm (its Q1).**"

**The freeze suite v24** (`spec/03-MOR-freeze-test-suite-v24.md`): version 23, approved, matching core v24 and Agreements draft 12. The sentences changed:

1. The header, saying what is tested where.
2. The Agreements line on departed holders: "… nor what it is paid lowered without it, by the split plan's parts or a fee (F270, to build) *(scenario: to write)*;" now reads "… nor what it is paid lowered without it, **by any change that lowers what it receives or can expect from the plan as written, the split cMIP or its parameters included (F270, F274), save where an advance permission it signed as a member reaches its pay (F273) (3.7x, 3.7y)**;".
3. The Agreements line on clone drafts: "… a deal's version paying a holder who is no party less, by the split plan or a fee, a draft until that holder signs (F270, to build) *(scenario: to write)*;" now reads "… a deal's version paying a holder who is no party less, **by any change that lowers what it receives or can expect from the plan as written, a draft until that holder signs, the deal's advance permission never reaching its pay (F270, F273, F274) (1.9d, 1.9e)**;".
4. Step 3.7q: "The members then raise the split service's fee: the fee is taken before the stakes divide, …" now reads "The members then raise the split service's fee, **with the departed holder's signature (F270; 3.7x)**: the fee is taken before the stakes divide, …". *F270 made the old sentence wrong: without that signature the raise is a draft.*
5. Scenario 1's "Passes if": after "stakes change only as signed or pre-authorised and pay their current holder," it adds "**what a holder who is no party is paid is lowered only with its signature, whatever the deal pre-authorised (1.9d, 1.9e),**".
6. Scenario 3's "Passes if": after "a stake never shrinking without its holder," it adds "**nor what a departed holder is paid lowered without its signature, save under an advance permission it signed as a member (3.7x, 3.7y),**".
7. New steps: **1.9d** (a holder who is no party, paid less: every item of F274's list, and the changes that pay no less), **1.9e** (the deal's advance permission does not reach it), **3.7x** (a departed holder, paid less), **3.7y** (an advance permission reaches a departed holder's pay; the threshold authority counted at the line). Each names the test that runs it.

**`spec/README.md`**: three lines for the new texts, each "for Nobody, allegedly, to approve"; the findings range to F274.

### The code

**`core/src/agreements/pay.rs`** (new). Two public functions, re-exported from `agreements`:

- `stakes_paid_less(parent, clone)`: each stake of the parent that the clone pays less, followed by its object, with the reasons (`PaidLess`: `Shares`, `Unfilled`, `RailFee`, `MaxFee`, `Fee`, `Cmip`). Computed from the two versions' plans (field 8) and fees (field 28) alone.
- `pay_signers(parent, clone)`: the identified holders of those stakes who have no voice in the power making the change: in a deal, a holder who is no party of the parent; in a collective, a holder the parent's departed members entry (field 22) names.

How "paid less" is computed (F274, judged by effect):

- **The split cMIP or its parameters** (plan keys 1 and 7) changed, or a plan added or removed: every stake the parent's plan pays counts. What a cMIP pays cannot be read from the plan.
- **The shares** (keys 0 and 4), with the cMIP unchanged. Each share is followed across versions by what it pays: a stake by its object, a role by its name, a named receiver by its identity, a metric share by its metric. For a stake in the rest (not taken off the top), its portion is its part over the sum of the parts left after the top; where unfilled roles go to the stakes (key 3, the default), a stake's portion grows by its share, in proportion to the stakes' parts, of the roles nobody fills. The two versions are compared exactly (arbitrary-size integers, no rounding) for **every way the roles can be filled or not**, since the plan as written lets a stake expect each; lower in any one counts. What comes off the top is in the split cMIP's units (OF8 b), so it is compared share by share only: a share taken off the top added or raised, a share moved onto or off the top, or the stake itself moving, counts; a stake on the top in both is paid less only if its own part is lowered.
- **Unfilled roles** sent elsewhere than the stakes, where roles exist: counts (reported as `Unfilled`).
- **The rail fee** (key 5) moved from the service onto the receivers: counts.
- **The maximum fee per payout** (key 6), where the receivers bear the rail fee: removed, or raised in the same form (millionths, or an amount of the same unit), counts; a change of form or unit cannot be compared, and counts.
- **A fee** (field 28) added, raised, or its payments widened (a scope that is not the old entry's): counts. Fees fall on every stake.

**`core/src/agreements/view.rs`**:

- `must_sign` (the clone's list of signatures, rule 45) now adds `pay_signers`. It is split in two (`must_sign_parts`): those asked for their share, their stake plan or the release rule, whom nothing replaces; and those asked for their pay alone.
- In a deal, nothing replaces a non-party holder's signature: a deal's clone is complete only with it (F273, "never").
- In a collective, a departed holder asked for its pay alone signs, or is reached by an advance permission (`pay_permitted`, F273 as read in Q1): a declaration of absence against that holder, under the clause of a version it signed as a member, valid as the core already checks declarations (rule 87: its authority, the clause's outcomes, field 1 the last version it signed, an absence-proof cMIP's acceptance where the clause names one), stating outcome 1 or 2. A threshold authority is counted at the line where the clone is judged, as declarations already are (rule 85, Q37); without a line (the `ready` preview), by the signature acts on the declaration among the parent's parties.
- `declarations_against` takes the outcomes it looks for, so it serves both voice removal (outcome 0, unchanged) and pay.
- A record putting such a clone in force without the departed holder's signature or a permission is a draft, with its own reason: "it pays a departed holder less, and that holder has not signed it, nor does an advance permission reach its pay (Agreements draft 12, rule 48; F270, F273, F274)".

**`wasm/src/lib.rs`**: `agreementsClonePlan` also returns `paySigners`, the core's `pay_signers`, for the clients.

**`clients/assess`** (the deal assessment tool):

- `signersFor` now counts the core's `paySigners` beside the powers' signers. So a deal's non-party holder and a collective's departed holder are no longer flagged as payable less without signing (`uncapped-fee`, `dilutable-stake`): the core refuses it. A member outside the power is still flagged: left to the collective's own rules.
- New, F273: a departed holder whom the clause may declare absent with outcome 1 or 2 is flagged (`dilutable-stake`), since that permission reaches its pay.
- The uncapped-fee flag quotes rule 25's current wording (F271): the plan "may state a maximum fee per payout"; "where it states none, there is no cap", flagged before signing.
- The rule texts it sends with a question now come from Agreements draft 12 (the newest by number), where rule 48 carries F273 and F274.
- One of the 19 test deals changes its expected flags: "A work two owners may release without the third" no longer shows `uncapped-fee`, since the third, who is no party, now signs any version adding a fee.

## Readings taken

Each is marked here; none is a decision of principle except Q1, which is put as a question.

- **Q1's reading, F273, to confirm** (below): the advance permission the core can read is an abandonment outcome, a declaration against the departed holder stating outcome 1 or 2.
- *Who has no voice, in a deal:* a holder who is no party of the parent version. A party whose voice a declaration removed (outcome 0) is still a party of the parent: it signed the clause, so F270 does not cover the very clone put in force under that declaration; once a later version drops it from the parties, it is a non-party holder and F270 covers it. *Mechanic, the build's: who is a party is the core's own definition, and the clause is the participants' choice.*
- *Who has no voice, in a collective:* a holder the parent's departed members entry names. A member leaving in the same clone is a member of the parent and signs that clone anyway (rule 70).
- *A stake the parent's plan pays nothing* (no share names it, or a part of zero) cannot be paid less, and is not asked. Where the parent has no plan, what a stake receives is not read from the terms, so a clone writing one counts for every stake.
- *Metrics* (plan key 8: a metric's Module, measurer or parameters) are not counted as paying a stake less: a metric share pays identities, never a stake (rule 29). A metric share's part is a share like any other, and counts as one.
- *The maximum fee where the service bears the rail fee* is not counted: no fee then comes off a receiver's payout, so raising the cap pays nobody less. Judged by effect, as F274 reads.
- *A holder whose share in the stake rises while the stake is paid less* is still asked: the two are not netted (a stake's pay and a holder's share stay separate, F73).
- *Unfilled roles going to the stakes* are read as divided among the stake shares in proportion to their parts (rule 22, F218); where a stake or role share sits on the top in such a plan, the split cannot be read without the cMIP's units, and a change counts.

## Question for Nobody, allegedly

Checked against the working rule (F265) first: participants choose their abandonment clause (who declares, which outcomes, which proof); what the core must say is which of those outcomes is the "advance permission" that reaches a departed holder's pay, which is what F270 protects. So it is put.

**Q1. Which advance permission reaches a departed member's pay?** *(area: core business, Agreements stakes; rule 48, F273)*

*Answered on 13 October 2026 by F279, differently from all three options: no advance permission reaches anyone's pay; abandonment moves a stake by succession. See "Revision: F279 and F280" below. The build of this first pass (`pay_permitted`) is removed.*

*In plain words:* you decided that what a collective allowed in advance reaches a departed member's pay, which is also the way out when one vanishes. The only advance permission the core can check is the abandonment clause: someone it names declares a person absent, with outcomes the clause lists (0 their voice removed, 1 their stake shared among the others, 2 their stake given to named people, 3 their obligations redirected or held, 4 the agreement closed). Which declaration should let the members pay a departed member less without their signature?

- **(a) A declaration against them stating outcome 1 or 2** *(built, my lean)*. These are the outcomes that may already take the stake itself (rule 48's first paragraph, "unless the agreement pre-authorised it"); paying it less is less than taking it. A clause allowing only outcome 0 gives no such permission.
- **(b) Any valid declaration against them**, whatever its outcomes. The authority's word that they are gone suffices. Simpler; but a clause that never allowed touching anyone's stake would then allow cutting a departed member's pay.
- **(c) As (a), and outcome 3 too** ("obligations redirected or held"). Outcome 3 could be read as what is owed to them; it is ambiguous whether it means what they owe or what they are owed.

How it works today, under (a): the declaration must name a version of the agreement the departed member signed while a member (a declaration can only name a party of the version it names), and is judged by that version's clause.

## Noticed, not changed

- **Rule 48's first paragraph is not built for shares.** "A clone can never reduce a stake without its holder's signature, unless the agreement pre-authorised it": the code asks the holder's signature for any share lowered, pre-authorised or not. So today a departed member declared absent with outcome 1 can be paid less without signing (F273, built) but cannot have their share lowered without signing. Not this step's; for the freeze-ready drafts, with Q1's answer. A test records today's behaviour (`f273_an_advance_permission_reaches_a_departed_holders_pay`, its last part).
- **Which clause judges a departed member?** Rule 67 says every departed holder is judged by the version in force; a declaration against a departed member can only name a version where they were a party, and the core applies that version's clause (rule 87, reading 7 as built). Where the clause changed after they left, the two differ. Not put now (one question at a time); it bears on Q1 and is the next question if Q1 stands.
- **Members outside the power** (in a collective) can still be paid less without signing, as decided: the tool still flags it.
- **`docs/deal-tool-asks-claude.md`**, "Noticed, for the tool's next pass": both points are done here (the rule 25 quotation, F270 built). That record keeps its words.

## Tests

**New, in `core/tests/agreements_collective.rs`**, each seen failing without the change:

- `f270_f274_a_deals_non_party_holder_signs_what_pays_it_less` (suite 1.9d): for each of 16 changes covering every item of F274's list (another share raised; another share added; a role share added; a role share raised; the stake's own part lowered; a share moved onto the top; unfilled roles sent elsewhere; held open; the rail fee moved onto receivers; the maximum fee raised; removed; the split cMIP changed; its parameters changed; a fee added; raised; widened to more payments), the core names the right reason, asks the investor alone, and the version, signed by every party, does not exist until the investor signs. Eleven changes that pay no less exist with the parties alone.
- `f273_a_deals_advance_permission_never_reaches_a_non_party_holders_pay` (1.9e): a valid declaration with outcome 1 against the investor, a former party; a version adding a fee still needs its signature.
- `f270_f274_a_departed_holder_signs_what_pays_it_less` (3.7x): the same 16 changes in a collective, met by the members under the clone rule: not ready, a record puts nothing in force, then in force with the departed member's signature. Of the changes that pay no less, ten are read so by the core, and the five that start from the collective's own plan come into force with the members alone (a collective's words are constitutional, so that case is the deal's).
- `f273_an_advance_permission_reaches_a_departed_holders_pay` (3.7y): a declaration with outcome 1 lets the members add a fee alone; one with outcome 0 alone does not; lowering the departed member's share still needs them (today's reading of rule 48's first paragraph, above).
- `f273_a_threshold_authority_reaches_a_departed_holders_pay_at_the_line` (3.7y): the clause's authority two of the other members; one signature on the declaration is not enough, two placed at the line are.
- One unit test in `pay.rs`: the arbitrary-size comparison.

*Seen failing:* with `pay_signers` switched off in `must_sign`, all four of the first tests fail, and the two loops name all 16 changes each as wrongly accepted; with `pay_permitted` switched off, the F273 collective test fails on the outcome-1 case. Both restored after.

**`clients/assess`:** the flag tests changed to the new rules (49 tests, as before): a deal's non-party holder and a collective's departed holder no longer flagged for the plan or fees; a member outside the power still flagged; the F273 flag; rule 25's current words. A collective fixture the core refused (a 2-of-2 key with no recovery path) was making three checks pass vacuously; it is fixed and now checked to be accepted.

**The whole suite**, every step of `scripts/test-all.sh`, on main and on the branch:

| | Rust | TypeScript |
| --- | --- | --- |
| main (`23a4fcb`) | 662 passed, 0 failed, 1 ignored | 319 of 319, in 15 packages |
| this branch | 668 passed, 0 failed, 1 ignored (662, plus 5 in `agreements_collective.rs` and 1 in `pay.rs`) | 319 of 319, the same counts in every package (`clients/assess` 49, its tests changed, none added) |

`scripts/test-all.sh` itself, run on the branch's final code: **"All tests passed"**. The ignored test is the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set. `wasm-bindgen` 0.2.129 was installed outside the repository first; the site's browser test used the container's Chromium. Main was run the same way, every step to the end, in a separate checkout.

---

# Revision: F279 and F280

*13 October 2026, morning. The same branch, main merged in first (F278 to F280, Machine, allegedly, plugged in). Before merge, at Nobody, allegedly's decision: F279 answers Q1 differently from its three options, and F280 was decided the same morning. Agreements draft 12 is not yet approved, so it is revised in place, each change marked "new in draft 12 (F279)" or "(F280)", with the MICS v24 and the freeze suite v24.*

## In plain words

**F279: abandonment passes a stake on; it never cuts pay.** When someone is declared absent (they died, or vanished), their stake now goes to the person their succession plan names, with all its pay. Only if they named nobody may the clause share their stake out among the others (outcome 1) or hand it to someone named (outcome 2). While the stake stays with them, nobody can pay them less without their signature, whatever the agreement allowed in advance. So the first pass's "advance permission" is gone: a departed member who vanishes no longer blocks the collective because their stake moves on, and whoever holds it next is asked, or is already a member.

Until now the core could not pass a stake on at all: the text said "a stake passes by succession as planned", but any clone lowering a share needed its holder's signature, which a dead person cannot give. That is now built.

**F280: non-owners are paid off the top only.** A plan can still pay a service, a referrer, a relay or an app, but only as overhead taken first. Whatever is left goes to the owners alone, divided as they own it. A plan that puts a non-owner beside the owners in the remainder is now refused. This also makes F274's checks simpler: inside the remainder there are only owners, so the core only has to compare the overhead and the owners' own parts.

**One question for you (Q2)**, and one after it (Q3), below. The second one matters more widely: several case studies split a pool among creators by plays or viewing, or have no owners at all (a worker and a platform), and F280 changes what they can write.

## Precisely

### The texts

**Agreements draft 12** (`spec/MIR-agreements-draft-12.md`), each change marked:

- **Header:** a paragraph saying what this revision adds, that the first pass's reading of F273 and its Q1 are withdrawn, and that nothing else changes.
- **Rule 48:**
  - After the first paragraph: "**A stake moved by succession is not a reduction, and the only advance permissions that move a stake without its holder are rule 89's** (new in draft 12, F279): a declaration of absence passes the stake to the stake successors the holder's succession plan names, or, where it names none, outcome 1 or 2 redistributes or transfers it."
  - On the list of who has no voice: "in a collective, a departed holder (rule 68)" now carries a reading, to confirm (Q2): every holder who is no member, a stake successor or a buyer included.
  - F273's paragraph and its reading are replaced by: "**No advance permission reaches what a stake is paid** (new in draft 12, F279; F273's mechanism superseded by F279). Abandonment never lowers what a stake is paid while the stake stays with its holder. A departed holder who vanishes does not block the collective's fees, because its stake moves: declared absent, to its stake successor, or, with none named, by outcome 1 or 2 (rule 89); whoever then holds it signs, or already holds the say. F273's 'never' for a deal's holder who is no party stands (new in draft 12, F273)." Then his words.
  - After F274's paragraph: "**Since a plan pays non-owners off the top only, every share in the rest is a stake's** (new in draft 12, F280): a stake is paid less by anything taken off the top added or raised (a role share, a named receiver, a metric share), by a role nobody fills sent away from the stakes, or by its part lowered against the other stakes' parts; never by a non-owner's share in the rest, which no valid plan has."
- **Rule 87:** a fourth check: "that, where the party's succession plan names a stake successor, it states neither outcome 1 nor outcome 2 (rule 89; new in draft 12, F279)."
- **Rule 89:** before the list: "**A declaration moves a stake only by succession** (new in draft 12, F279): the stake, and its pay with it, goes to the stake successors the holder's succession plan names, in the plan's shares (rules 81 to 83). A clone carrying exactly that, put in force under the declaration, needs no signature of the absent holder. Abandonment never lowers what a stake is paid while the stake stays with its holder (rule 48)." Outcomes 1 and 2 each gain "**only where the holder's succession plan names no stake successor**". After the list: "Outcomes 0, 3 and 4 are unchanged. A declaration stating outcome 1 or 2 against a holder whose succession plan names a stake successor is refused." The closing comment now reads "Removing a voice never takes the stake; that takes the party's succession plan or, where it names no stake successor, outcome 1 or 2, which the party also signed."
- **Rule 22:** a first paragraph: "**Every share paying anyone but a stake, a role share, a named receiver or a metric share, is paid off the top only, as overhead; what is left goes to the stakes alone, and within each stake by its holders' shares. A plan putting a non-owner in the rest is invalid** (new in draft 12, F280)." Then his words, and "Weights between several stakes stay a business choice."
- **Rule 29:** "**A metric share is paid off the top only, as overhead, like every share paying anyone but a stake** (rule 22; new in draft 12, F280)."
- **The split plan's format:** the comments on keys 0 and 4 say every share but a stake's is named in key 4, and the rest goes to the stakes alone.
- **Glossary**, "Split plan": "**Every share paying anyone but a stake is paid off the top, as overhead; what is left goes to the stakes alone** (new in draft 12, F280)."
- **Freeze lines:** two added, one for F279 and one for F280.
- **Rule 25** needed no change. It says who bears a payout's rail fee and its cap, and places no share.

**The MICS v24**, the sentences changed in this revision:

1. The header gains: "*Revised 13 October 2026 (morning), before its approval:* Agreements draft 12, revised in the same way, writes in **F279** (…) and **F280** (…)."
2. "Changing an agreement": "The agreement's advance permission reaches a collective's departed holder's pay, never a deal's non-party holder's (F273)." is replaced by "No advance permission reaches what a stake is paid: abandonment moves a stake only by succession, and never lowers its pay while it stays with its holder (F279)."
3. "Departed holders": "…nor is what it is paid lowered without it (F270), save where an advance permission they signed as a member reaches it (F273), and is a share of all the collective's income." now reads "…nor is what it is paid lowered without it (F270), and is a share of all the collective's income. Declared absent, a departed holder's stake passes to its stake successor, or, with none named, is redistributed or transferred as the clause allows (F279)."
4. "Open before freeze": "…one reading taken building them, what advance permission the core can read, is to confirm (its Q1)." now reads "…F273's mechanism is superseded by F279; one reading taken building them, who has no voice in a collective, is to confirm (its Q2)."
5. "Split service" gains a line: "A share paying anyone but a stake (a role, a named receiver, a metric) is paid off the top only, as overhead; what is left goes to the stakes alone, and within each stake by its holders' shares. A plan putting a non-owner in the rest is invalid (F280)."
6. "Abandonment" gains a line: "A declaration moves a stake only by succession: the stake, and its pay with it, goes to the stake successor the holder's plan names. Redistributing or transferring a stake applies only where the plan names no stake successor. Abandonment never lowers what a stake is paid while it stays with its holder (F279)."

**The freeze suite v24**, the sentences changed in this revision:

1. The header gains: "*Revised 13 October 2026 (morning), before its approval:* **F279** and **F280** …", saying what is tested where.
2. The departed holders line: "save where an advance permission it signed as a member reaches its pay (F273) (3.7x, 3.7y);" now reads "abandonment moving its stake only by succession and never lowering its pay while it stays (F279) (3.7x, 3.7y);".
3. The clone drafts line: "…the deal's advance permission never reaching its pay (F270, F273, F274) (1.9d, 1.9e);" now reads "…no advance permission reaching its pay (F270, F274, F279) (1.9d, 1.9e);".
4. Two new lines after "Succession plan": one for F279 (the stake moved only by succession; outcomes 1 and 2 only with no successor named; no declaration lowering pay) and one for F280 (non-owners off the top; the rest to the stakes alone, by parts and ownership, to the smallest unit).
5. Step 1.9: "…redistributing their stake as the clause defined: one identity (Flaw B19)." now reads "…redistributing their stake as the clause defined, the party having named no stake successor (F279): one identity (Flaw B19)."
6. Step 1.9d is rewritten. Its plan pays a mastering service 100,000 off the top, and the film's and the soundtrack's stakes 800,000 and 200,000 of what is left. F274's list is as F280 leaves it: "another share moved onto the top" and "a role share added with the stake's part raised to match" are gone (see below), and another stake's part and a stake taken off the top come in.
7. Step 1.9e is re-headed "**No advance permission reaches it**" (F273, F279); it adds that the investor names no stake successor, and that the stake stays with it.
8. Step 3.7y is replaced by F279's: "**A departed holder's stake moves by succession, its pay never cut.**" It covers the successor named, outcome 1 refused, the stake passing to the successor, and the successor then signing a fee raise; with none named, outcome 1 sharing the stake out; and the threshold authority.
9. Scenario 3's "Passes if": "…save under an advance permission it signed as a member (3.7x, 3.7y)," now reads "…its stake moving only by succession, or, with no successor named, as the clause allows (3.7x, 3.7y),".

**`spec/README.md`**: draft 12's line says what the revision adds; the findings range runs to F280.

### The code

**F279** (`core/src/agreements/view.rs`):

- **`pay_permitted` is removed.** F270's signature is needed from every holder paid less who has no voice, with no exception.
- **A declaration's own check refuses outcome 1 or 2** against a party whose succession plan, in the version the declaration names, names a stake successor. Reason given: "outcome 1 or 2 against a party whose succession plan names a stake successor: its stake goes to that successor by succession (rule 89, F279)".
  - *Item 6, the choice: refused, not read as the plan.* A declaration's outcomes are the authority's signed words, and the core refuses what it cannot take as written rather than rewriting it ("refused, never guessed", as everywhere in the build). Reading outcome 1 as "the plan" would make the same signed act mean two things depending on a field the authority may not have looked at. The authority can sign a new declaration at once.
  - *Its cost:* a declaration combining outcome 0 with 1 against such a party is refused whole, voice removal included, until re-signed.
- **The stake succession is built** (`moved_by_abandonment`). A clone needs no signature from a holder whose share it lowers when all of these hold:
  - a declaration of absence against that holder counts as the clone uses it. That is the existing checks: its authority, a threshold counted at the line, and any absence-proof cMIP's acceptance;
  - the clone takes the holder's whole share of every stake it held;
  - each gain matches either:
    - the holder's plan in the parent: each stake successor gains its share of what the holder held; or
    - where that plan names no stake successor and the declaration states outcome 1: the stake's other holders gain in proportion to their shares.
  - Each gain may be off by less than one millionth, the total exact (mechanic, the build's).
  - The holder's plan may be dropped in the same clone.
  - The release rule must be unchanged.
  - This holds in deals and collectives alike, at the line and in the `ready` preview.
- **Outcome 2 is not built.** It transfers the stake "to parties named or defined by role", named in the clause's words, which the core cannot read; a clone doing it still needs the holder's signature (noticed, below).
- In a collective, taking a departed holder off field 22 is constitutional (the departed members entry). So a departed holder's stake moving puts the clone in force by a rotation, as for any constitutional clone.

**F280** (`core/src/agreements/open_formats.rs`, `formats.rs`):

- `SplitPlan::check_overhead`, called by `Terms::check`, refuses a plan where any share but a stake's is not named in key 4: "split plan: a share paying anyone but a stake is paid off the top only; what is left goes to the stakes alone (F280)".
- It is a validity rule, not a format rule. Such terms still decode, so a client reads them and explains the refusal (the deal tool does), and every agreement the core holds is checked (`AgreementsView::terms`).
- Stakes may still be weighted in the rest, or one taken off the top: weights between stakes are a business choice (F280's words).

**F274's reading, simplified by F280** (`core/src/agreements/pay.rs`). The rest now holds stakes only, so:

- **Gone, impossible now:** a non-owner's share in the rest raised or added; a non-owner moved onto the top (it must already be there); and comparing a stake's portion against role shares in the rest for every way the roles may be filled. That was a 2ⁿ enumeration; roles now come off the top, and filled or not they change only what the top takes.
- **Gone too: compensation.** A role share added with the stake's own part raised to match no longer pays no less. An overhead added always lowers what is left; a stake's part counts only against the other stakes'.
- **Kept:**
  - anything taken off the top added or raised;
  - unfilled roles sent away from the stakes;
  - a stake's part lowered against the other stakes', compared exactly;
  - a stake moved on or off the top (counts: units unread);
  - a stake on the top in both versions, its own part;
  - the rail fee, the maximum fee, a fee, the split cMIP and its parameters, as before.
- **Who has no voice:** `pay_signers` now asks every holder who is no party of the parent, in a deal as before and in a collective too. That covers a departed holder, a stake successor and a buyer of part of a stake (reading, to confirm: Q2).

**WebAssembly:** `paySigners`' description follows.

**The deal tool (`clients/assess`):**

- The F273 flag is gone. In its place, under `dilutable-stake`: a clause allowing outcome 1 or 2 is flagged before signing for each holder who can be declared absent and names no stake successor, a departed one included. One who names a successor is not flagged. It quotes rule 89's "only where the holder's succession plan names no stake successor".
- A plan F280 makes invalid is refused before signing. The tool shows "Agreements refuse these terms" with the core's words naming F280, and judges no further.
- Its probe version (a plan written where the terms had none) now names a stake share, not a receiver in the rest.

### The sweep (item 11)

**Freeze steps.** Only 1.9d, this branch's own, stated a non-owner in the rest; it is rewritten. The role-share steps (2.4, 2.4d, 2.4e, 2.4f, 3.8's "position paying for the job") and the subscription scenario (7) do not say top or rest, so F280 reads them off the top; none needed rewriting.

**Test fixtures, rewritten:**

- `core/tests/agreements.rs`, the f12b plan (a role and a named receiver now off the top).
- `core/tests/agreements_collective.rs`, `plan_of` (every non-stake share off the top: the role, metric and receiver tests run unchanged on it), and this branch's own F270 fixtures.
- `clients/assess/test/deals.ts`, five of its 19 deals: the song before its publishers, the band's song (case study 08), the renovation job (12), the club's live rights (17), and the award (21). Each overhead now comes off the top, in millionths, and a note at the file's head says so.
- `cmips/split/tests` had a plan with two receivers in the rest. Its `divide` never checks terms, so it passes; it is left for the cMIP's pass.

**Case studies and cMIPs, for a later pass (not edited here):**

- **`cmips/cmip-split-draft-1.md`**, "The amounts", step 2: "The rest is divided among the other shares in proportion to their parts", a named receiver among them. `cmips/split/README.md` says the same. It should say the rest goes to the stakes.
- **`cmips/cmip-relay-transport-draft-3.md`**, delivery records, rule 3: "several relays can fill a role share … as the split plan divides it". Compatible; it should say the share is off the top.
- **08** (musician to label): the members' shares, a reposter share, a "tools used" share and the service's cut as peers (the 90/5/5 case).
- **09** (cat video): ad revenue "55% to the team, 45% to the platform" as two peer parts. Subscription money divided among works "by total viewing" or "by each subscriber's own viewing" (by a metric, among owners).
- **11** (journalism): "Sara's share, the resident's price, the verifier's fee" as peers. Subscriptions split "by what that reader actually read" (by a metric).
- **12** (gig economy): every plan pays named receivers only, with no stake (worker and platform; restaurant, courier and platform; the holiday flat; the mutual pool).
- **13** (gaming): the level maker and the studio; the seller, the item's maker, the studio and the marketplace; "tools used" and streamer shares, all as peers.
- **14** (learning and work): the raters' pool as a named receiver; tutors, locations and equipment as named shares; a recruiter's share.
- **15** (advertising): "10% of any sale you lead to", a role share, compatible off the top; an attention deal paid by metric.
- **16** (commerce): courier, warehouse, insurer and storefront role shares, compatible off the top.
- **17** (live sports): Dario's share, the club's and a relay's as peers; feeds and a raid referral share.
- **18** (adult content): the platform divides subscription revenue among creators by what subscribers follow (by a metric).
- **19** (software): a dependency pool divided by how often each library is used (by a metric).
- **20** (AI): Tarek, the compute lenders' stakes, a dataset share and the base model's makers in one split; evaluators paid beside researchers.
- **21** (academic publishing): helpers paid by a named share; compatible off the top.
- **04** (augmented democracy): a budget split among projects by the vote's result, named receivers only.
- **`docs/companions/05-MOR-the-unwritten-layer-v3.md`**: the client and maintainers' shares "come out of the owners' split"; a pool split by minutes.
- **`docs/companions/05-MOR-who-can-earn-v6.md`**: "Services can still split money by attention, as streaming does today": in tension with F280 for pools (Q3).

## Readings taken

- **Q2's reading, to confirm:** in a collective, every holder who is no member has no voice and signs what pays it less. That covers a departed holder, a stake successor and a buyer. Put as Q2.
- *The stake successors' shares* apply to every stake the holder held, as rule 81 writes it ("a share of the party's stakes"). *Mechanic, the build's.*
- *The clone executing a succession* is marked by the powers its changes need, like any clone, not by `[3, party]`, which names a seat's automatic entry (rule 83). A departed holder's stake moving takes them off field 22, so it is constitutional. *Mechanic, the build's.*
- *Each heir's or holder's gain* within one millionth of the exact share, the total exact. *Mechanic, the build's.*

## Questions for Nobody, allegedly

Both were checked against the working rule (F265) first. Each asks what F270 or F280 protects, which no participant's choice may break, so each is put. They are numbered after this branch's Q1, which F279 answered.

**Q2. In a collective, who signs what pays them less: departed members only, or every holder who is no member?** *(area: core business, Agreements stakes; rule 48, F270 with F279)* *(asked now)*

*In plain words:* F270 named two kinds of holder without a say: an investor in a deal, and a member who left a collective. F279 creates a third. A successor who inherits a departed member's stake holds part of the collective's income, but is neither a member nor someone who left. A fourth already existed: someone who bought part of a collective's stake. F279's own consequence says whoever then holds the stake "can be asked to sign".

- **(a) Every holder who is no member** *(built, my lean)*. That covers departed members, successors and buyers. It is F270's own principle ("no voice in the power making that change"), and the core can compute it from the terms: anyone holding a stake who is not a party.
  - It changes one of the deal tool's test collectives, case study 19's maintainers: the past contributors who hold 10% are now protected, and no longer flagged.
- **(b) Departed members and successors only.** Buyers stay unprotected, as the second pass of core v22 left them. Stated cost: the terms do not record who is a successor, so a successor would have to be written into the departed members entry, changing what that entry means ("who left").
- **(c) Departed members only**, as F270's words list them. Stated cost: a successor can then be paid less without signing, which F279's consequence rules out.

**Q3 (next, once Q2 is answered). Can a pool still divide its money among owners by plays or viewing?** *(area: core business, Agreements splits; rules 22 and 29, F280)*

*In plain words:* F280 puts metric shares off the top, as overhead. But in several case studies (09, 11, 18, 19, and a companion), a subscription service or a pool divides its income among creators by what was played or read. They are owners being paid by use, not non-owners. And some deals have no owners at all: a worker and a platform (case study 12). Under F280 as written, both can still be expressed: the metric share or the named receivers take everything off the top, leaving nothing for stakes. But then "overhead" is the whole income, which is not what F280 meant.

The options I would put: (a) as written: pools and no-stake deals take everything off the top, a stated cost; (b) a metric may divide the rest among stakes only, weighting stakes by use, since weights between stakes are a business choice; (c) a plan with no stakes is exempt from F280. *Not built either way; the code applies F280 as written.*

## Noticed, not changed

- **Outcome 2 (transfer) is not built.** Its recipients are "parties named or defined by role" in the clause's words, which the core cannot read. Until a format names them, a clone transferring an absent holder's stake still needs that holder's signature.
- **Rule 48's first paragraph is now built** for succession and outcome 1. That closes the first pass's note that pre-authorised share cuts were not built.
- **Which clause judges a departed member** (first pass, noticed): unchanged. A declaration against a departed member still names a version where they were a party, and is judged by that version's clause and plan.
- **The nesting walk** (`walk_signed`, an agreement as a party of another) still asks a stake's absent holder to sign a succession clone. It fails closed: a nested agreement may read such a version of a deal as unsigned until the walk learns succession.
- **Units off the top.** F280 makes every overhead a top share, whose units are the split cMIP's (millionths in draft 1). Several case studies write overhead as a percentage beside owners' parts; the cMIP pass should settle that a top share is a fraction of the payment.
- **A test failing on main, not this branch's:** `clients/assess/test/ask.test.ts`, "asking stays in the local process". It finds `clients/desk/src/claude.ts`, which pull request 37 (Machine, allegedly, plugged in) added on main, importing Anthropic's SDK. Whether the desk may (it runs on the author's Mac, like the deal tool's command) is that pull request's to settle; this branch leaves it.

## Tests

**New or replaced**, each seen failing without its change (by switching the change off and running; each switched back after):

- `core/tests/agreements.rs`, `f280_a_non_owner_is_paid_off_the_top_only`: a named receiver, a role or a metric share in the rest refused by the check (still decoded); the same off the top accepted; stakes weighted, or one off the top, accepted. *Fails with the F280 check off.*
- `cmips/split/tests/f280.rs` (new file; the cMIP's code and text unchanged): the overhead off the top, rounded down; everything left to the stakes, three parts to one; within the album, by ownership, each within one unit; exact to the unit, for four amounts.
- `core/tests/agreements_collective.rs`:
  - `f270_f274_a_deals_non_party_holder_signs_what_pays_it_less` and `f270_f274_a_departed_holder_signs_what_pays_it_less` (1.9d, 3.7x): F274's list as F280 leaves it, 17 changes, and 11 that pay no less, on the new plans.
  - `f279_no_advance_permission_reaches_a_deals_non_party_holders_pay` (1.9e).
  - `f279_a_declaration_passes_the_stake_to_the_successor` (3.7y): outcome 1 refused; a fee raise and a sharing-out both need Cy while the stake stays; the stake passes to the heir with the members alone; the heir must then sign a fee raise. *Fails with the stake succession off, with the refusal off, and with "no voice" read as departed holders only.*
  - `f279_with_no_successor_outcome_1_shares_the_stake_out` (3.7y): a fee raise needs Cy while the stake stays, even under outcome 1, which the first pass would have let through; out-of-proportion and partial moves need Cy; the proportional move goes ahead with the members alone, and a fee raise then needs nobody else; under outcome 0 alone, nothing moves without Cy. *Fails with the stake succession off.*
  - `f279_a_threshold_authority_moves_the_stake_at_the_line` (3.7y): one signature on the declaration is not enough; with the second placed before the rotation, the stake moves. *Fails with the stake succession off.*
- **Removed:** the three F273 tests of the first pass.
- **`clients/assess`:** the F279 flag (a holder with no stake successor flagged, one with a successor not, a departed holder included); a plan F280 refuses explained before signing, the same off the top read; five deals rewritten; the maintainers' collective's expected flags under Q2's reading. 50 tests (49 before; one added).

**The whole suite:**

| | Rust | TypeScript |
| --- | --- | --- |
| main (`92deee3`) | 662 passed, 0 failed, 1 ignored | 352 of 353, in 16 packages; the one failure `clients/assess`, "asking stays in the local process" (noticed above) |
| this branch | 671 passed, 0 failed, 1 ignored (662, plus 6 in `agreements_collective.rs`, 1 in `agreements.rs`, 1 in `pay.rs`, 1 in `cmips/split/tests/f280.rs`) | 353 of 354: every package as main, `clients/assess` 49 of 50 (one test added), the same one failure |

Every step of `scripts/test-all.sh` was run on both, to the end, not stopping at a failure. The script itself stops at `clients/assess` on main and on the branch alike, because of main's failing test. The ignored test is the Lightning regtest. `wasm-bindgen` 0.2.129 is installed outside the repository; the site's browser test used the container's Chromium.


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

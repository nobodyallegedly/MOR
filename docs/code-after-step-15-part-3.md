# The code after step 15, part 3: Agreements

*15 October 2026. For Nobody, allegedly. The code for the step 15 decisions on Agreements (F302 to F305, F307 to F320, F327, with F328 Q1 to Q3, Q11 to Q16, F329 Q1 to Q4, Fable's A6, and Agreements Q5 and Q6, taken), built against Agreements draft 14, the MICS v28 and the freeze suite v28, with the drafts corrected where the build showed them wrong or where the aggregated review's mechanics (G1 to G5, G8) were still to be written. Part 3 of 4; one pull request, stacked on part 2's (merge parts 1 and 2 first). Test identities only; regtest only; no real money.*

## In plain words first

The core library now runs Agreements draft 14: what a collective's line placed stays placed, a missing act makes an answer unknown rather than wrong, and owners who run nothing have the protections the draft gives them.

- **What the line placed stays placed** (F302, with C5). A resignation, a declaration of absence, a vote, a transfer, a proxy: once a line of the collective has registered or relied on it, a later rotation of its signer disowning it shows a dispute and changes nothing for the collective. Only a line registering that rotation *before* the placement takes it away.
- **A hole gives "unknown", never "void"** (F304). Where a line's history names an act this verifier does not hold, "made before, made after" is unknown, and so is a fork or closing drawn there.
- **Endings rest on keys and on what the collective acknowledged** (F303). A fork's successor signs for its debts by a chain signature with its own chain key; a closing relies on a creditor's receipt or release only where an act of the collective in its history acknowledges it.
- **A deal's version that something relied on stays complete** (F314), and in a deal a version counts the transfers its field 31 names (F316).
- **Owners, counted by share** (F307, F308, F311, F316). A stake can carry a holders' rule ("owners holding at least 60% of it decide what hits every owner alike"); rules may count parties by share, holders by share, or "all of" several. Who holds what at a vote is the roster the collective's line placed.
- **The owners' matters** (F310): what a stake is paid, an issuance in it, a sale or release of the collective's works, and a fork's successors paying a kept owner less, each needs the owners' consent by their rule or each signing.
- **Issuance, with pre-emption** (F309, F315, F328 Q14, F329 Q3). New shares go first to every existing owner in proportion, on the same terms, for a period; the core checks the offer reached each owner, each owner's take-up and payment, and that every share came out exactly right. A standing waiver, set by every owner, lets an issuance go without an offer.
- **Proxies** (F327, G5): a passive owner's vote, handed on narrowly; never on what needs every owner, never on the owner's money.
- **Owners see the money** (F318, F329 Q4): a Money act of a collective with owners outside its members binds only once it reaches them all; where an owner is itself an agreement, only in public.
- **The collective's own reserve** (F312), **a vanished owner** (F313), **a nominee by identity-level succession** (F305), **a grant's expiry** (F320).
- **Every act of the Agreements layer is judged against its format** (Fable's A6): an act out of its type's format, or of a retired type, is invalid.

The second verifier (verifier2), the ordering simulation, the invariants and the collective client follow. Two questions for Nobody, allegedly, came out of this part (below).

## Tests: before and after

| | Before (part 2's branch, `b855204`) | After (this branch) |
| --- | --- | --- |
| Rust workspace (`cargo test --workspace`) | 710 passed, 0 failed, 1 ignored | RUST_AFTER |
| TypeScript, 18 packages (`scripts/test-all.sh`'s list) | 419 passed, 0 failed | 419 passed, 0 failed (no new TypeScript tests; the collective client's money-and-endings story now runs through draft 14's rules, below) |
| verifier2's own tests (`python3 verifier2/test_agreements_endings.py`) | 24 passed | 24 passed (two stories now unknown, one closing story with and without acknowledgement) |
| The ordering simulation (`cargo run -p mor-ordering-sim -- 20000`) | 0 wrong answers | 0 wrong answers; one new story, `f302_a_registered_resignation_stays_placed` |

The one ignored Rust test is the same as before (the Lightning regtest test). The display client's and Dub's web client's `built/` folders are not touched.

**verifier2 against the library.** VERIFIER2_RESULT

## Which suite steps now run

Each step's mark in the suite now names its test. In short:

- **1.9g** (F314), **1.9h** (F316).
- **3.7z** (F302), **3.7aa** (F304), **3.7ab** (F302, F314), **3.7ac** (issuance), **3.7ad** (the roster), **3.7af** (F318), **3.7ag** (F313), **3.7ah** (by share), **3.7ai** (F312), **3.7aj** (the holders' rule), **3.7ak** (proxies), **3.7an** (F328 Q11).
- **3.7ae** (F311, F317), for the core: the owners' constitutional clone complete and unexecuted until the key holders rotate, and a rotation without the owners breaking the collective.
- **3.7al** (F320), for a collective's grant.
- **3.7am** (F319): every step of 3.7, 3.9 and 3.9f runs unchanged with draft 14's code.
- **3.8c** (F305), **3.8d** (F328 Q15).
- **3.9ae** (F303), **3.9af** (F304), **3.9ag** (F310, F328 Q12), **3.9ah** (F310).
- **In any order**: `owners_verdicts_do_not_depend_on_order` replays random owners' stories (sales placed or not, proxies, revocations, issuance offers and take-ups, votes) in shuffled orders; every verdict comes out the same (300 stories in the longest run; 16 by default).

Still to build: in **3.7ae**, the rotation the owners make through the recovery path's custodian, and the founding client's warning (client conformance).

## What was built

**Core library** (`core/src/agreements/`):

- `formats.rs`: the rule forms by share, "all of" and among a stake's holders (`[3, stake, share]`, `[4, rules]`, `[5, stake, share]`); `Power::Holders`; terms fields 30 (holders' rules, with the standing waiver), 31 (transfers counted, a deal's), 32 (issues under, a collective's); the release rule by share, `[1, k]` invalid; the succession plan's seats with no weight; the own reserve in a collective's terms only; draft 14's other format checks.
- `owners.rs` (new): the issuance offer, the proxy and its revocation (types 26 to 28); `in_format`, the A6 dispatcher every Agreements act passes at the verifier.
- `view.rs`, `view/owning.rs`: the unified placement test (`kept_at`, `sig_counts`), F304's unknown, F303's chain signatures and acknowledged receipts, F314's relied-on versions, `roster_at` (F316), the holders' rule and rules by share counted in a clone, the owners' consent to a sale or release (`owners_consent`), a fork's kept holders (F310 item 4), the own reserve paid to the vault (F312), a declaration against a holder who is no party (F313), Money acts done only once every owner is reached (F318), `nominee` (F305), a grant's limits answered by the caller (F320).
- `view/issuance.rs` (new): rule 96, the offer's reach and period, take-ups, the exact shares, the standing waiver.
- `view/proxies.rs` (new): rule 97 and its fence.
- New caller-stated answers on the view, as for every time reference: `offer_periods_lapsed`, `take_ups_within`, `grant_limits`.

**WebAssembly** (`wasm/`): the new rule forms, the release rule by share, the holders' rules, transfers counted, issues under, seats without weight.

**Clients**:

- `clients/collective`: describes the new rules; its release names the owners who must consent and has those this device holds sign (F310); its debts are sealed to every owner (F318); a fork's successor chain-signs (F303); a closing first publishes one act of the collective acknowledging the creditors' releases it relies on (F303).
- `clients/repo`: a collective's chain signature, its chain key rebuilt from the members' shares and a fresh one dealt (`TestCollective.chainSign`).
- `clients/genesis`: a chain signature with a key held as shares.
- `clients/assess`: the release rule by share.

**The second verifier and the simulation**:

- `verifier2/`: an ending whose history it does not hold is unknown (F304); a closing relies only on what the collective acknowledged (F303). Its exporter writes the library's unknown, successors' chain signatures, and the collective's liveness acts.
- `harness/ordering`: a registered resignation stays placed against its signer's later rotation (F302).

## What was not built, and why

- **3.7ae's custodian rotation and the founding client's warning**: the first needs a test collective whose recovery custodian the owners hold, a key setup the clients do not yet make; the second is a client screen, for part 4.
- **Share counting in forks and closings**: a fork or closing under a constitutional rule by share is counted by head, every voice that remains, the strictest reading (question 2).
- **Proxies on a sale or release of a work**: a proxy counts in a clone's holders' rule; the owners' consent to a transfer or release (an act with no line of its own) counts the owners' own signatures only. A proxy can never count for less than the owner, so this is the strict side.
- **Keeper records** (F329 Q2): the record (type 2) has no format, so nothing in the core places by one yet; the sentence is written in.
- **A person's grant with limits** (3.7al's second half): the caller's answer is the same; no separate test.

## What changed in the drafts

- **Agreements draft 14**:
  - G1 (F329 Q1): rule 95 says prices are no owners' matter, the owners protected by sight and the exit; rule 55 no longer calls a release a price of zero.
  - G2 (F329 Q2): C5's list names a keeper's record a rule reads; and a take-up a line registers.
  - G3 (F329 Q3): a take-up within the period counts, placed by the line or not; and "the same terms are the offer's own" (G7).
  - G4 (F329 Q4): where a holder is an agreement, the act is public, in rule 57, rule 96, the issuance offer's section and the scenario line.
  - G5: the proxy's "signed nothing" is now "placed no signature at or before that line".
  - G8: the glossary's "Purchase" cites Money draft 8's rule 18.
  - The record's field 3 also registers take-ups (a mechanic of the build).
- **The freeze suite v28**:
  - 3.7ac and 3.7af follow F329 Q3 and Q4.
  - 3.9's fork step no longer says "the others add signature acts" (G8).
  - Each step listed above is marked with its test.

## Readings taken while building (for Nobody, allegedly, to see; any may be overruled)

1. **One placement test for everyone** (C5 and F302). An act a line placed counts for the collective unless a line registering the rotation that voided it comes before the placement, for members and others alike. A rotation no line registers never unplaces it. This dissolved what had looked like a question (a non-party's rotation cannot be registered).
2. **Who is reached and who takes up, at an issuance.** The offer must reach the holders at its own placement; each holder's proportion is read on the roster at the line putting the issuance in force, so a buyer after the offer takes up in its seller's place, in proportion to what it bought.
3. **A take-up's payment.** The take-up is paid by Money receipts or claims fulfilling it, paid to the collective, together at least its exact proportion of the price: no owner pays less than its exact part.
4. **Members vote in person** (rule 97, Q1). A proxy counts only for a holder who is no party of the agreement in force.
5. **Rounding at an issuance.** Each share written lies within less than one millionth of its exact value (rule 9's rounding), the total exact.
6. **A collective's own reserve and its vault.** The vault is read at the link of the line judging the plan (at founding, the genesis).
7. **The roster for a sale or release of a work** is field 7 of the agreement in force: the act has no line of its own to read a roster at.

## Questions for Nobody, allegedly

**Question 1 (Agreements, rule 85; F313): what outcome does a declaration state against a vanished owner who is no member and has a stake successor?**

*In plain words.* An owner who is not a member, and vanished, can now be declared absent, so that their stake moves and the collective is not blocked. The text allows only "the outcomes that move the stake": succession where the owner's plan names a successor, else outcome 1 or 2. But outcomes are numbers (0 to 4), and none of them means "succession". For a member, a declaration with a plan states outcome 0 (the voice removed) and the plan moves the stake. For a non-member the text says "never 0".

*The fair cases:*

- **(a) outcome 0 alone, read as succession**: the declaration removes no voice (the owner has none), and the stake goes to the plan's successor. The same declaration as for a member with a plan. What the code does now, marked in the code as a reading.
- **(b) outcome 1 or 2, read as the plan** where the plan names a successor. Rule 89 (F279) refuses exactly this reading for members.
- **(c) a new outcome number for succession.** A format change before the freeze.

*Recommendation: (a).* One sentence in rule 85: "against a holder who is no party and whose plan names a stake successor, the declaration states outcome 0 alone, which removes no voice, and the stake passes by succession".

**Question 2 (Agreements, rules 47a and 69, with F308 and F311): how is a fork or closing counted under a constitutional rule by share?**

*In plain words.* A fork or closing follows the constitutional change rule. If that rule counts by share (members, or owners, holding at least so much of a stake), two things are missing from the text. First, which holdings count: an ending has no record of its own to read "who holds what" at. Second, how an owner who is no member signs an ending, since only members chain-sign.

*Precisely.* The text counts a clone by share at the line that puts it in force (rule 94, F316). An ending's line is its chain act and tips, and the text gives no roster there. Chain signatures are members' (F132), and kept owners consent to a fork's plans by a signature act that an act of the original acknowledges (F328 Q12). The code now counts endings by head, every voice that remains, which never lets through less than the text asks.

*The fair cases:*

- **(a) by share, at the ending's line.** Field 7 of the agreement in force at the line, plus the transfers placed in the ending's history. Owners who are no members consent by a signature act that an act of the original in the ending's history acknowledges, as kept owners already do (F328 Q12).
- **(b) by head at endings, said plainly.** Endings stay the members' alone, counted by head whatever the constitution says, a stated cost.
- **(c) a rule by share cannot govern endings.** Terms whose constitution counts by share name an ending rule of their own.

*Recommendation: (a).* It is the text's own pattern, applied where the text is silent.

# The deal-assessment tool (roadmap step 14): the report

*Report, 12 October 2026. Written for Nobody, allegedly, against main at `04f743a`, on branch `claude/deal-assessment-tool`. Read against the step as Nobody, allegedly defined it on 12 October 2026 (`docs/roadmap-v1.md`, step 14), Agreements draft 11, freeze test suite v21, the case studies in their latest drafts, and the collective client's and connector's readings of acts. A client feature: the core library is unchanged, nothing in `spec/` is touched. Test identities only.*

## In plain words

**What it is.** A tool that reads an agreement and says, in plain words, what signing it means: who has signed, what each party is bound to, the shares and the fees, who judges and in what order, how it ends, and what is still owed. Then it flags the obvious risks: a party with no exit, an uncapped fee, a judge who is also a party, no judge of forks, a stake that can be diluted without its holder, and the stated costs the deal's own clauses bring. Each flag says which rule or stated cost it rests on. A flag is something to read before signing, not a verdict on the deal; a deal carrying none of the risks shows none.

**Where it is.** One piece of shared code (`clients/assess`), used in three places: a command, `mor-assess <agreement id> --at <relay>`; the collective client, which now shows the shares and fees and the risks beside its own reading before any agreement is signed; and the desk, which shows them when an identity receives terms (they are still signed only in the collective client). It reads every fact through the core library: the terms from their exact bytes, which power a change needs, who signed, whether it is in force, what is owed. It decides no rule itself.

**One example: the label deal of case study 08** ("From Bedroom to Label", draft 4, section 3). The label advances the recording and is repaid first, then takes 80% of the release; the band keeps 20%. The deal names a split cMIP, a condition cMIP, a time reference and a keeper, and a maximum fee per payout. The tool says (shortened; the full output is in "The example, in full" below):

- *Who signed:* the relays were not asked, so it does not know yet; each party is bound only by its own signature.
- *What each party is bound to:* the words, and every rule of the terms. The label holds 80% of the release and is a named receiver in the plan; the band holds 20%. No version changes without both signatures.
- *Shares and fees:* the stake is 80/20, in millionths. Each payment is divided by the split cMIP: the label's recoupment comes off the top first, then the stake. Each receiver bears its rail fee, never more than 1% of a payout; a shortfall beyond that is the split service's obligation.
- *Who judges, and in what order:* conditions by the condition cMIP; time by the time reference; a keeper records. **No judge of forks.**
- *How it ends:* a deal has no closing act; it ends by a new version both sign, saying where the stakes went and what is still owed.
- *What is still owed:* nothing is known without the relays; what the split service fails to split or pay out is its open obligation; no refund terms, so a refund owed stays open until claimed.
- **Risks flagged:**
  1. **No exit.** Neither the label nor the band can be declared absent: if either goes silent, the deal can never change or end. *Rests on Agreements rule 47, stated cost ("one silent party blocks every change to a deal").*
  2. **No judge of forks.** If two complete versions ever stand side by side, the deal waits on the last version both agree on until both sign a settlement, and either can keep it there. *Rests on rule 47 and field 27, and their stated cost.*
  3. **The split service's window.** Between receiving and paying out, the service holds the money; after a stake is sold, the seller and the service together can keep paying the seller until the first split citing the sale. *Rests on rule 10, stated cost.*

  The 80% is not flagged: a label that takes 80% may do so, as the case study says, and every band can read it.

**What building it exposed.** Two places where Agreements say less than a reader needs, put as questions below: a split plan may leave out the maximum fee per payout that rule 25 says it states (Q1); and a split plan or a fee can be changed without the signature of a stake holder whom that change pays less (Q2). Neither stops the tool: it flags both as the core reads them today.

## Before writing: main

`scripts/test-all.sh` on main (`04f743a`), without `--reproducible` or regtest: **all green.** Rust: 647 passed, 0 failed, 1 ignored. TypeScript: 249 of 249, in the 15 packages the script runs. The first attempt stopped at the WebAssembly step because this container lacked `wasm-bindgen-cli` (no test had failed); it was installed at the pinned version 0.2.129 and the whole script run again from the start.

## What was built

| Where | What |
| --- | --- |
| `clients/assess/src/assess.ts` | `assess(payload, names, found?)`: the explanation in step 14's order (who signed, what each party is bound to, shares and fees, who judges and in what order, how it ends, what is still owed), then the collective client's own sections on a collective's keys, areas and absence, then the risks. `beforeSigning(payload, names)`: the shares and fees and the risks, for the clients that sign. |
| `clients/assess/src/gather.ts` | `gather(id, relays)`: fetches the terms, their earlier versions, everything their parties published (signatures, later versions) and, for a deal, its split service named by the payees' grants; hands them to the core's verifier and asks it who signed, whether it exists, the version in force or the fork, and what is owed (the split service's account; a collective's debts and money owed back). |
| `clients/assess/src/cli.ts` | `mor-assess ID --at URL [--at URL …] [--via URL=LOCAL] [--json]`. Words signed by others are fenced as data, as the connector does. |
| `clients/collective/src/actions.ts` | The readings that sign new terms (founding, changing members or rules, an area's words, the absence rule, the stakes) end with the tool's "Shares and fees" and "Risks, before you sign". |
| `clients/desk/src/desk.ts`, page | Terms an identity receives are assessed (shares and fees, risks) and shown under the item; "signed in the collective client, never here". |
| `wasm/src/lib.rs` | `readTerms` now gives the split plan (field 8), the refund terms (field 17) and the fees (field 28), from the core's own decoding; `readGrant` reads a grant (who it names). Bindings only: `core/` unchanged. The display client embeds this WebAssembly, so a display client release follows the merge, as after earlier binding changes. |
| `clients/collective/src/explain.ts` | `TermsRead` gains those fields; the abandonment outcomes' words are exported. Nothing it says changed. |

### The test deals, and what is flagged in each

Ten from the freeze suite, eight from the case studies, one carrying nothing, all in `clients/assess/test/deals.ts`, each read back by the core first. The flags are exactly these, no others.

| Test deal | Source | Flags |
| --- | --- | --- |
| The feature film | Freeze 1.1–1.3, 1.9 | no judge of forks; dilutable stake (outcome 1); absence on word; split service window |
| The film, with its judge of forks | Freeze 1.7a | dilutable stake; absence on word; split service window |
| The second film, any two judging absence | Freeze 1.9c | refused by Agreements (B19): explained, not flagged |
| The film cloned onto its clock as payment cMIP | Freeze 1.7 | refused by Agreements (Q20, Q25): explained, not flagged |
| The song, before its publishers | Freeze 2.1–2.4 | no exit; no judge of forks; split service window |
| Publisher A's publication | Freeze 2.3, 7.8 | no exit; no judge of forks; split service window |
| The label (a collective) | Freeze 3.1, 3.7r, 3.7t, 3.7v | uncapped fee (no maximum); dilutable stake (the treasurer alone changes the plan); absence on word; split service window |
| A work two owners may release | Freeze 3.9c | no exit; no judge of forks; dilutable stake (release, plan); uncapped fee (the third bears fees the two can raise); payer-side split |
| Two musicians, half each | Freeze 3.9o | no exit; no judge of forks; payer-side split |
| Ana and Ben, with a backup service | Freeze 3.9t, 3.9u, 7.8b | no exit; no judge of forks; split service window |
| A song's agreement in the band | Case study 08 | no exit; no judge of forks; split service window |
| The label deal | Case study 08 | no exit; no judge of forks; split service window |
| The coproduction | Case study 09 | no exit; no judge of forks; uncapped fee; split service window |
| A renovation job, its judges a chain | Case study 12 | no exit; no judge of forks; **judge who is a party** (the platform, last stage of the chain) |
| The club's live rights | Case study 17 | no exit; no judge of forks; split service window |
| The maintainers' collective | Case study 19 | dilutable stake and uncapped fee (past contributors, not members); absence on word; payer-side split |
| The award | Case study 21 | no exit; no judge of forks; uncapped fee |
| A game on the PC store | Case study 13 | no exit; no judge of forks; payer-side split |
| A service contract | The tool's own | none |

Every listed risk is carried by at least one test deal and flagged there. No freeze-suite deal makes a judge one of the parties; the case study 12 job does, when "the platform decides" is a stage of the chain.

## Readings

Where the texts are silent, the tool takes these readings. *To be confirmed by Nobody, allegedly.*

1. **What is flagged, and what is only said.** A flag marks something this deal's own terms choose and could have chosen otherwise: the five listed risks, and three stated costs a clause brings (absence on the authority's word alone, rule 87; payer-side splitting, rule 16 and rule 9; the split service's window, rule 10). Stated costs every agreement of its kind carries (rule 47's bait branch where a judge of forks is named; a collective's rules 57, 66, 67, 70 and F109) are not flagged; the collective client already says several of them. So every deal that divides money by stakes carries one of two stated costs: a split service's window, or payer-side splitting.
2. **No exit** is read for deals only: a party the abandonment clause cannot remove (no clause, no outcome 0, or the party is the authority itself), using the collective client's own `uncovered`. A collective's member can always leave alone (rule 70), and Agreements refuse a collective leaving a voice uncovered (rule 61).
3. **An uncapped fee** is a split plan stating no maximum fee per payout (Q1), or a stake holder who bears fees (every stake does, off the top) and whom the power over the fees field does not need.
4. **A judge who is also a party** looks at identities only: arbitrators and verifiers, the judge of forks, keepers' operators, a named absence authority, and later links of the chain of judgment. A collective's "any k of the other members" judging absence is not flagged: no one judges their own case. An agreement that is a party is not looked through to its own parties.
5. **A stake diluted without its holder** covers what a stake earns as well as its share: an abandonment clause pre-authorising outcome 1 or 2 (rule 48's exception), a release rule short of every holder (a release ends what a stake earns), and a split plan changeable without a holder (Q2).
6. **Who a change needs is the core's answer.** The tool asks `agreementsClonePlan` which powers a version changing only the split plan, or only the fees, would need, then names whom each power cannot do without: every party for the clone rule in a deal; the named, or all where the threshold is the whole number, for a rule; an area's holders where all of them decide. "Any k of more than k" needs nobody in particular.
7. **A source that leaves a term unsaid** gets terms without it, and the tool says what that leaves: case study 09's coproduction and 21's award name no maximum fee per payout, so they are flagged for it; no case study names an abandonment clause for a deal or a judge of forks, so each deal is flagged for both.
8. **"As far as the relays asked show"**, as in the connector: who signed, whether it exists, the version in force and what is owed are what the relays given hold.
9. **What is still owed**, from the core only: for a deal, its split service's account under any version of the deal (`agreementsServiceAccount`, the service found from the payees' grants); for a collective, its debts and money owed back. Refunds owed by payers under payer-side splitting have no verdict to read and are not shown; the refund terms are.
10. **Where it is offered.** The collective client: the five readings that sign new terms built from their exact bytes. Not the split-service reading, whose terms are made only once the service's grant exists, after the reading. The desk: terms received, assessed, never signed there.
11. **Rules cited by draft 11's numbers**, with the older number where it differs ("rule 47, was 45b"); the code and findings still use the older ones.

## Questions for Nobody, allegedly

Both checked against the working rule (F265: "where the core gives participants the means to choose, the choice is theirs; the core keeps only what no choice may break"). Neither stops the tool; the answers change what it flags.

**Q1. A split plan without a maximum fee per payout** *(area: Agreements, splits; rule 25, Money rule 21).* Rule 25 says the split plan "states a maximum fee per payout", and Money rule 21 discharges a payout by it; the format makes it optional (plan key 6, `? 6`), no rule says what its absence means, and the core never reads it. The freeze suite speaks of the plan's maximum (steps 1.3, 2.4d), yet every split plan in the core's own tests leaves it out.
- (a) Optional; absent means no cap: the participants' choice, and a conforming client flags it. *As built.*
- (b) Required: terms with a split plan and no maximum are refused (a core change).
- (c) Absent means zero: any rail fee a payout loses is the service's obligation.
- *Lean: (a), under the working rule, with rule 25 reworded "may state".*

**Q2. A stake paid less without its holder** *(area: Agreements, stakes and tiers; rules 45, 48, 28).* A new version needs a holder's signature to lower its share (rules 45, 48; the core's `must_sign`), but not to change the split plan's parts or add or raise a fee (fields 8 and 28), which fall under their own power. So a holder outside that power can see what their stake is paid cut without signing: a stake holder who is no party of a deal, a past contributor holding a share of a collective (case study 19), the members outside an area reaching field 8 or 28 (freeze 3.1's treasurer). Rule 68 protects departed holders only by making fees fall alike on members.
- (a) As now: the share is protected, its pay is not; clients flag it. *As built.*
- (b) Rule 48 covers what a stake is paid: a version lowering a stake's part of the plan, or adding or raising a fee, needs every holder it pays less (a core change, in `must_sign`).
- (c) As (b), but only for holders with no voice in that power (non-parties and departed holders).
- *Lean: (c): the voices chose the power; those without one did not, which is what no choice may break.*

### Noticed in the text, for its next draft (no question of rule)

- Field 28 (fees) is missing from the terms CDDL and from the tier table; it is defined only beside the split plan and in rule 28.
- The terms CDDL says field 10 is withdrawn; the tier table, the glossary and rule 67 still list the concurrency rule as judicial.
- Task 14 (absence proof) is judicial in its own entry and a `judge` form, but the tier table and rule 67 name tasks 9, 10 and 11 only.
- The fee entry's CDDL comment cites "rule 27" for fees, now rule 28.

## Tests

- **Failing first:** the 30 tests of `test/flags.test.ts` and `test/deals.test.ts` were run against an empty `assess` before it was written: 29 failed, and the one passing checks only that the test deals carry every listed risk. Then all passed. The command-line test and the two client tests were written after the code; they were not seen failing.
- `clients/assess`: 33 tests. `flags.test.ts`: each flag present and absent on the smallest terms carrying it, with what it rests on; a deal carrying none shows none; refused terms flagged no further; `beforeSigning`. `deals.test.ts`: the 19 test deals explained in step 14's order, their words shown as signed, flagged exactly; every listed risk carried and flagged; shares, fees and judges in words; what the relays show in words. `cli.test.ts`: `mor-assess` against real homes and a relay: a deal signed by one party (who signed, not in force, the risks, a payee grant missing from the relays, the words fenced), then both (in force, `--json`); nothing to assess said plainly.
- `clients/collective`: the founding reading carries "Risks, before you sign" and its flag (absence on the members' word, rule 87).
- `clients/desk`: terms received are assessed; their risks shown; signed in the collective client, never at the desk.
- **The whole suite, on the branch** (`scripts/test-all.sh`, without `--reproducible` or regtest): Rust 647 passed, 0 failed, 1 ignored (as on main); TypeScript 283 of 283 (249 on main, plus 34). The tree was untouched during each run.

## The example, in full

The label deal of case study 08, as `assess` says it (names as the test gives them; the command shows fingerprints).

```
A deal between 2 parties: The label and The band. 3 risks flagged, each with the rule it rests on.

Who signed
- The relays were not asked: who has signed is not known here. Its parties: The label and The band.
- Each party is bound only through its own signature act (Agreements rule 1).
What each party is bound to
- Each party who signs is bound to the words below, as signed, and to every rule of these terms: a signature is consent to everything they define, pre-authorised changes included (Agreements rule 8).
- The label: holds 80% of The release and is a named receiver in the split plan.
- The band: holds 20% of The release.
- No version of it changes without every party’s signature (Agreements rule 47, was 45b).
Shares and fees
- Stake 0, in The release: The label 80% and The band 20%, written in millionths summing to 100% (Agreements rule 9).
- Each payment in is divided by the split cMIP Split, which computes the amounts from these parts: stake 0, paid to its holders as currently held, part 90; The label, a named receiver holding no stake, part 10, taken off the top first (Agreements rules 17, 27).
- Each receiver bears its payout’s rail fee; no payout may lose more than 1% of each payout to it, and a shortfall beyond that is the service’s open obligation (Agreements rule 25).
- Payments go to a split service, by each payee’s own grant (2): it publishes each split, delivered to every holder it pays, naming each fee and who received it (Agreements rules 16, 20).
Who judges, and in what order
- Conditions are judged by the condition cMIP Cond.
- Time is judged by the time reference Clock: for this agreement, only it says whether something is before, after or past its terms (Agreements rule 33).
- ⚠ No judge of forks: if two complete versions of the deal ever stand side by side, only a version every party signs settles them (Agreements rule 47).
- A keeper records what happens, sealed, without reading it: operated by KeeperA; its record counts (Agreements rule 36).
- A judge that answers “unknown”, or does not act within its period, passes the question to the next in its chain, which every party signed; only the active link settles (Agreements rule 35).
How it ends
- A deal has no closing act. It ends, or winds down, by a new version every party signs, stating where its stakes went, what is still owed, and, where it is a party of another agreement, to whom that one now pays (Agreements rule 47, F263).
- A party leaves only as its terms provide.
- A stake ends if released to the public domain, which every holder of it signs (Agreements rule 55, field 24).
What is still owed
- The relays were not asked: no payment made under it is known here.
- What its split service receives and does not split, or splits and does not pay out, is that service’s open obligation, naming one receiver and this agreement (Agreements rule 30).
- No refund terms: a refund owed stays open until claimed (Agreements rule 11; the core sets no lapse, F80).
- A party who has not signed owes nothing under it: its obligations are shown as unsigned, never as open (Agreements rule 1, F74).
If someone disappears
- No abandonment clause: nobody can declare a party absent.
Risks
- ⚠ The label and The band cannot be declared absent: if any of them goes silent, nobody can change or end the deal, and no party can leave it. Rests on: Agreements rule 47 (was 45b), stated cost: “one silent party blocks every change to a deal, however large”; the way out is an abandonment clause removing an absent party’s voice (rule 89, outcome 0).
- ⚠ No judge of forks: if two complete versions of the deal ever stand side by side, the deal stays on its reference until every party signs one settling version, and any party can keep it there. Rests on: Agreements rule 47 (was 45b), field 27: “With no judge of forks named, the deal stays on its reference”; stated cost: “a party of either branch can refuse every settlement and keep the deal on its reference”.
- ⚠ A split service holds the money between receiving and paying out: after a stake is sold, a seller and the service acting together can keep paying the seller until the first split citing the sale. Rests on: Agreements rule 10 (was 14), stated cost (the window after a transfer); rule 32 (was 31), the trust that remains.
```

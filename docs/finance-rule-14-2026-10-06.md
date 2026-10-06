# Finance rule 14 in code, and seeds for the invariant runs

*6 October 2026. Branch `claude/confident-euler-qnejr7`, from main at 8f9a2e3. Against Finance draft 6, the payment cMIP draft 2, the freeze test suite v21 (scenario 1, step 5c) and findings F31, F34, F66. No rule in `spec/` was changed.*

## In plain words

### Rule 14: a thief cannot collect the backlog through a new flow pointer

Every identity has a flow pointer, where everyday payments go, and may have a vault, a safer place only the offline key can change. A thief who steals the everyday key can point the flow at their own wallet. Finance rule 14 stops the thief from collecting money owed from before: each debt (an obligation) names the flow pointer that was in force when it arose, and a payment to the flow counts only for debts naming that pointer or a later one. Older debts count only if paid to the vault.

The core library read the pointer each debt names, but never compared it with where the money went. Now it does:

- the comparison itself is in the core library (`counts_toward`, in `core/src/finance.rs`);
- the payment cMIP, which knows from each receipt or claim where the payment was paid, applies it (`pointer_in_force`, in `cmips/payment/src/lib.rs`). The cMIP's text says this is judged *beside* the rail's own verdict, not inside it, so the rail's verdict is unchanged: a payment to the thief's flow is still a real payment on the rail; it just does not count for an older debt.

The story of freeze scenario 1, step 5c, is now a test, with real signed Lightning invoices from test keys:

| What happens | Result |
| --- | --- |
| Royalties owed under the contributor's own pointer (version 1) are paid to the thief's new flow (version 2) | the rail shows the payment; it does not count for the debt |
| The same royalties paid to the vault | counts |
| The same royalties paid to the pointer the debt names (the contributor's own) | counts: rule 14 refuses only a flow later than the one named |
| The thief re-issues the debt, naming the new pointer, signed with the creditor's stolen key | invalid as a debt: only the debtor signs one (F66); a payment naming it counts for nothing |
| A fan tips, following the published pointer (the thief's), before the rotation | counts as made |
| A tip naming the old pointer, paid to the thief's flow | does not count |
| A debt that arose under the thief's pointer (a deal made after the theft), paid to that flow | counts: the window between theft and rotation is a stated cost |
| A debt naming a pointer the verifier does not hold, or a payment for an agreement that names no pointer | unknown, never "counts" |
| A debt naming another identity's pointer | invalid |

### Seeds

The invariant runs draw thousands of random stories. Until now, the random number each run started from (its seed) was not recorded, so a large run could not be repeated exactly. Every run now prints its seed, and a failure names it again; giving that seed back replays the run exactly. How to do it is in `docs/law-invariants.md`, "Seeds".

## What looked like flaws in the text

Nothing here was decided: each is for Nobody, allegedly.

**R14-1. "When the obligation's agreement act was made" has no clockless meaning yet (rule 14, third sentence; F66).** Rule 14 ends: "The version an obligation names MUST be one that counted when the obligation's agreement act was made; a Law client checks that." This was not built, because the text does not say how to tell that moment. MOR has no clock, and order exists only where one act cites another; the agreement and the creditor's pointers are acts of different identities, so nothing orders them. The text also leaves open which act is meant (the terms, a party's signature, the moment the deal came into force), what applies when an obligation names no agreement (field 4 is optional), when the creditor never signed the agreement (an offer by the debtor), and for a collective creditor. Law draft 10 has no rule that does this check.

*What it costs today:* the thief alone still cannot collect the backlog, because a debt signed by the creditor's key is no debt (tested). But a debtor who re-signs an old debt naming the thief's pointer (tricked, careless, or colluding) makes a debt that the thief can collect through the new flow, and no check refuses it. Possible directions, for discussion only: order by the creditor's own chain (the creditor's signature on the agreement must come after the named pointer, and no later pointer before it), which fails where the creditor signs nothing; have the agreement name the creditor's pointer itself; or make it client conformance, a stated cost.

**R14-2. Good faith after the rotation (rule 15).** Rule 15 says a payment that followed the published pointer "counts as made, even if a later rotation invalidates that pointer." The test shows the fan's tip counts *before* the rotation. After it, the thief's pointer is void, unless someone acknowledged it, and a verifier that holds only valid pointers (as the regtest harness's reader does) answers "unknown" for the tip. Making it count needs a way to tell a tip paid before the rotation from one paid after, to a thief still running the node: the same missing "when" as R14-1. Not built, not tested after the rotation.

**R14-3. A payment for an agreement or offer names no pointer (rules 14 and 15).** Rule 15 says a receipt names the pointer it followed "directly or through the obligation or agreement", but Law's terms have no field naming a payee pointer. So, for a payment that fulfils an agreement or an offer rather than an obligation or a pointer, there is no version to compare; the code answers "unknown" there rather than choose. A reading to confirm.

**R14-4. A wording difference, to confirm.** Scenario 1.5c says the older royalties "can only be paid to the vault". Rule 14 also lets them be paid to the flow pointer they name, the owner's own earlier one. The code follows rule 14 (a test shows it); read in context, the scenario means "not to the thief's flow". Nothing to change unless Nobody, allegedly, reads it otherwise.

## Precisely

- `core/src/finance.rs`: `PaidInto` (`Flow(version)` or `Vault`) and `counts_toward(named, into)`: to the vault, always; to the flow of version *v*, only where the named version is *v* or later. A necessary condition only: rules 2, 12a and 14a are judged on their own.
- `cmips/payment/src/lib.rs`: the `Held` trait gains `obligation(id)` (a valid obligation signed by its debtor); `pointer_in_force(record, held)` decodes where the payment was paid, reads the pointer version what it fulfils names (an obligation's field 3, or the payee-pointer act a tip follows), and answers valid, invalid or unknown. An obligation owed to someone other than this hop's payee is not this hop's to judge (a conversion hop), and answers valid. `verify` is unchanged.
- `modules/lightning/tests/flow_theft.rs`: the five story tests above. `core/tests/finance.rs`: `rule_14_older_obligations_and_the_flow`. The two existing `Held` implementations (`modules/lightning/tests/rule.rs`, `harness/tests/lightning_rail.rs`) gain `obligation`.
- `core/tests/law_invariants.rs`: `seed()`, `runner()` and `Run`, used by the five random properties; `docs/law-invariants.md`, "Seeds".
- `docs/paper/mor-paper-draft-2.md`: claim 7 from reasoned to run, naming the tests and the part not checked (R14-1); section 7.1 points at that gap; section 7.2's sentence on seeds.

**Tests:** `scripts/test-all.sh` on this branch, 6 October 2026: all passed. Rust workspace 336 (330 before, plus five story tests in `flow_theft.rs` and `rule_14_older_obligations_and_the_flow`), none failed, the regtest Lightning test skipping as usual; TypeScript 156 (nine clients, the website client with its browser test, and the jpeg module), none failed.

**The reproducible-build check fails on this branch, because of this change.** The core library is compiled into the display client's WebAssembly, so the copy released in `clients/site/built/` (built on GitHub from main) no longer matches a build from this code. On main the check is green (GitHub run 29, 421621d). (On this container the check also fails on main's unchanged code, so the local result alone proves nothing; the hashes differ between main's build and this branch's.) Merging needs a new release of the display client (the release workflow, run by a push naming "[release display client]"), and then the server following it. That is outward-facing, so it was not done here: this branch is not merged, for Nobody, allegedly, or the project lead, to decide.

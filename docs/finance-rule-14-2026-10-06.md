# Finance rule 14 in code, and seeds for the invariant runs

*6 October 2026. Branch `claude/confident-euler-qnejr7`, from main at 8f9a2e3. Against Finance draft 6, the payment cMIP draft 2, the freeze test suite v21 (scenario 1, step 5c) and findings F31, F34, F66. No rule in `spec/` was changed; the freeze suite's step 1.5c reworded to follow rule 14 (R14-4).*

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

**R14-1. "When the obligation's agreement act was made" had no clockless meaning (rule 14, third sentence; F66).** Rule 14 ended: "The version an obligation names MUST be one that counted when the obligation's agreement act was made." With no clock, that moment cannot be told: the agreement and the creditor's pointers are acts of different identities, and nothing orders them. A debtor who re-signed an old debt naming the thief's pointer made a debt the thief could collect through the new flow.

*Decided by Nobody, allegedly, 6 October 2026 (F133): the version an obligation names must be one its agreement act holds in its history (cites, directly or through what it cites); "'when' is to be avoided unless anchoring is involved." Built the same day; see "F133, built" below.*

**R14-2. Good faith after the rotation (rule 15).** Rule 15 says a payment that followed the published pointer "counts as made, even if a later rotation invalidates that pointer." The test shows the fan's tip counts *before* the rotation. After it, the thief's pointer is void, unless someone acknowledged it, and a verifier that holds only valid pointers (as the regtest harness's reader does) answers "unknown" for the tip. Making it count needs a way to tell a tip paid before the rotation from one paid after, to a thief still running the node: the same missing "when" as R14-1. Not built, not tested after the rotation.

**R14-3. A payment for an agreement or offer names no pointer (rules 14 and 15).** Rule 15 says a receipt names the pointer it followed "directly or through the obligation or agreement", but Law's terms have no field naming a payee pointer. So, for a payment that fulfils an agreement or an offer rather than an obligation or a pointer, there is no version to compare; the code answers "unknown" there rather than choose. A reading to confirm.

**R14-4. A wording difference, to confirm.** Scenario 1.5c says the older royalties "can only be paid to the vault". Rule 14 also lets them be paid to the flow pointer they name, the owner's own earlier one. The code follows rule 14 (a test shows it). *Wording fixed, at the project lead's instruction: step 1.5c now says "only to the vault, or to the flow pointer the debt names (Finance rule 14), never to the thief's". The finding stays open for the author with the other three.*

## F133, built

In plain words: a debt names a flow pointer, and its agreement act must have seen that pointer, meaning the agreement cites it, directly or through acts it cites. The core library now walks those citations back from the agreement act. If the pointer is found, the debt's version counts. If the whole history is held and the pointer is not in it, the version does not count, so a payment to that flow counts for nothing, and only the vault counts. If part of the history is missing, the answer is "not known", and a payment to the flow is not counted.

| Story (scenario 1.5c, signed test acts) | Result |
| --- | --- |
| The royalty debt names the contributor's own pointer, under the film's deal, which the contributor drafted after that pointer | cited |
| The same under an offer of the service citing the pointer in its `objects` | cited |
| The debtor re-signs the debt naming the thief's newer pointer, under the same deal or offer | not cited: paid to the thief's flow, counts for nothing; paid to the vault, counts |
| A deal the thief made after its pointer, and a debt under it naming that pointer | cited (the stream between theft and rotation, a stated cost) |
| An agreement act not held, or a history with a gap before the pointer is found | not known: never counted on the flow |

**One reading to confirm (not decided, built the literal way):** an obligation naming no agreement act (field 4 is optional) has no history that could hold its pointer, so its version does not count for it: only the vault counts for such a debt. *Consequence, stated: a client making an agreement must make its act cite the creditor's pointer (by its sequence when the creditor drafts it, or in its `objects`), or every debt under it is payable only to the vault.*

Precisely: `finance::pointer_cited(verifier, obligation)` in `core/src/finance.rs` walks each act's `prev` and every `objects` predecessor, from the agreement act; `Some(true)`, `Some(false)` or `None`. The payment cMIP's `Held::obligation` now returns a `HeldObligation` carrying that answer, and `pointer_in_force` answers invalid where it is false and unknown where it is not known, for a payment to the flow; a payment to the vault is unaffected. Tests: `core/tests/finance_f133.rs` (over signed acts) and `a_debt_resigned_to_the_thiefs_pointer_its_agreement_never_cited_does_not_count` in `modules/lightning/tests/flow_theft.rs`.

## Precisely

- `core/src/finance.rs`: `PaidInto` (`Flow(version)` or `Vault`) and `counts_toward(named, into)`: to the vault, always; to the flow of version *v*, only where the named version is *v* or later. A necessary condition only: rules 2, 12a and 14a are judged on their own.
- `cmips/payment/src/lib.rs`: the `Held` trait gains `obligation(id)` (a valid obligation signed by its debtor); `pointer_in_force(record, held)` decodes where the payment was paid, reads the pointer version what it fulfils names (an obligation's field 3, or the payee-pointer act a tip follows), and answers valid, invalid or unknown. An obligation owed to someone other than this hop's payee is not this hop's to judge (a conversion hop), and answers valid. `verify` is unchanged.
- `modules/lightning/tests/flow_theft.rs`: the five story tests above. `core/tests/finance.rs`: `rule_14_older_obligations_and_the_flow`. The two existing `Held` implementations (`modules/lightning/tests/rule.rs`, `harness/tests/lightning_rail.rs`) gain `obligation`.
- `core/tests/law_invariants.rs`: `seed()`, `runner()` and `Run`, used by the five random properties; `docs/law-invariants.md`, "Seeds".
- `docs/paper/mor-paper-draft-2.md`: claim 7 from reasoned to run, naming the tests, F133's among them; section 7.1 no longer names a gap; section 7.2's sentence on seeds.

**Tests:** `scripts/test-all.sh` on this branch, 6 October 2026: all passed. Rust workspace 338 (330 before, plus six story tests in `flow_theft.rs`, `rule_14_older_obligations_and_the_flow` and `finance_f133.rs`; rerun after F133 was built), none failed, the regtest Lightning test skipping as usual; TypeScript 156 (nine clients, the website client with its browser test, and the jpeg module), none failed.

**The reproducible-build check fails on this branch, because of this change.** The core library is compiled into the display client's WebAssembly, so the copy released in `clients/site/built/` (built on GitHub from main) no longer matches a build from this code. On main the check is green (GitHub run 29, 421621d). (On this container the check also fails on main's unchanged code, so the local result alone proves nothing; the hashes differ between main's build and this branch's.) Merging needs a new release of the display client (the release workflow, run by a push naming "[release display client]"), and then the server following it. That is outward-facing, so it was not done here: this branch is not merged, for Nobody, allegedly, or the project lead, to decide. *Decided by the project lead: merged to main with "[release display client]" in the merge commit's message, so GitHub's release workflow rebuilds `clients/site/built/` on Linux and commits it; nothing released by hand.* *The first merge (62cb34c) did not release: its release run built the client, but its push was refused because F133 reached main in the meantime. The merge carrying F133's build names the release again.*

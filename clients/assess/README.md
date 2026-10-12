# The deal-assessment tool (mor-assess)

Roadmap step 14, defined by Nobody, allegedly, on 12 October 2026: "something to assess deals". A client feature, never core. TypeScript, with the core library through WebAssembly. **Test identities only.**

## In plain words

Give it an agreement and it tells you, in plain words, what you would be signing: who has signed, what each party is bound to, the shares and the fees, who judges and in what order, how it ends, and what is still owed. Then it **flags the obvious risks**, each with the rule it rests on:

- **a party with no exit**: someone nobody can declare absent, so that if they go silent the deal can never change or end;
- **an uncapped fee**: a split plan with no maximum fee per payout, or fees that can be raised without those who bear them;
- **a judge who is also a party**: an arbitrator, the judge of forks, a keeper, the absence authority or a later judge in the chain who is one of the parties;
- **no judge of forks**: if two complete versions of the deal ever stand side by side, nothing but every party's signature settles them;
- **a stake that can be diluted without its holder**: a clause allowing an absent party's stake to be shared or transferred, a release rule that lets some holders end a stake without the others, or a split plan that can be changed without a holder;
- **a stated cost one of its clauses brings**: absence judged on someone's word alone, a payer dividing its own payment, a split service holding the money in between.

A flag is something to read before signing, not a verdict. A deal carrying none of these shows none.

It is the same code in three places: the command `mor-assess`, the collective client (beside its own reading, before anything is signed), and the desk (when an identity receives terms; they are still signed only in the collective client). Comparing a deal with other published deals is left to whoever builds a real product.

```
mor-assess ID --at URL [--at URL ...] [--via URL=LOCAL] [--json]
```

## Precisely

Every fact is the core library's: the terms are read from their exact bytes by `readTerms`; which power a change needs is asked of `agreementsClonePlan`; who signed, whether it exists, the version in force, a fork, and what is owed are the verifier's (`agreementsAgreement`, `agreementsVersionInForce`, `agreementsDealFork`, `agreementsServiceAccount`, `agreementsOwes`, `agreementsOwedBack`). The tool decides no rule; it puts the core's answers into words, and flags.

| File | What |
| --- | --- |
| `src/assess.ts` | `assess(payload, names, found?)`: the explanation (six sections, in step 14's order, then the collective client's own sections on keys, areas and absence) and the flags. `beforeSigning(payload, names)`: the shares and fees, and the risks, for the clients that sign. |
| `src/gather.ts` | `gather(id, hints)`: fetches the terms, their earlier versions, every act their parties published (signatures, later versions) and, for a deal, the split service named by the payees' grants (`readGrant`); hands them to the core's verifier and asks it. "As far as the relays asked show." |
| `src/cli.ts` | The command. Words signed by others are fenced as data, as the connector does. |

The flags and what each rests on (Agreements draft 11's numbers; the code and findings use the older ones, given as "was"):

| Flag | When | Rests on |
| --- | --- | --- |
| `no-exit` | In a deal of two or more parties, a party the abandonment clause cannot remove: no clause, a clause without outcome 0, or the party is the authority itself | Rule 47 (was 45b), stated cost: one silent party blocks every change; rule 89 |
| `uncapped-fee` | A split plan without key 6; or a stake holder whom the power over field 28 does not need | Rule 25 (was 24a), Money rule 21; rule 28 (was 27) |
| `judge-is-party` | A party among field 13, field 27, the keepers' operators, a named absence authority, or a later link of field 21 | Rule 35 (was 34a); Q20 binds specifications only; rule 85 |
| `no-fork-judge` | A deal of two or more parties without field 27 | Rule 47, field 27, and its stated cost |
| `dilutable-stake` | Abandonment outcome 1 or 2; a release rule short of every holder; a holder whom the power over field 8 does not need | Rule 48 (was 46), rule 89; rule 55, field 24; rules 45, 48, 62 to 65 |
| `absence-on-word` | An abandonment clause with no absence-proof cMIP | Rule 87 (was 51), stated cost; rule 85, client conformance |
| `payer-side-split` | Stakes and no split service | Rule 16 (was 18), stated cost; rule 9, stated cost |
| `split-service-window` | Stakes and a split service | Rule 10 (was 14), stated cost; rule 32 |

Terms Agreements refuse are explained, with Agreements' objection in its own words, and flagged no further.

The WebAssembly bindings gained what the tool needed, from the core's own decoders: `readTerms` now gives the split plan (field 8), the refund terms (field 17) and the fees (field 28); `readGrant` reads a grant. The core library is unchanged.

## Readings

Where the texts are silent, the tool takes these readings. *To be confirmed by Nobody, allegedly.* They are listed, with the questions, in `docs/deal-assessment-tool.md`.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../assess
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed)
```

- `test/flags.test.ts`: each flag present and absent on the smallest terms carrying it, with what it rests on; a deal carrying none shows none; refused terms flagged no further; `beforeSigning`.
- `test/deals.test.ts`: every test deal (`test/deals.ts`: ten from the freeze suite, eight from the case studies, and one carrying nothing) explained in step 14's order and flagged exactly as it should be; every listed risk carried by some test deal.
- `test/cli.test.ts`: `mor-assess` against real homes and a relay: a deal signed by one party, then both.

# Edubba (clients/desk) and the collectives library: what round two taught DubLaw

*DubLaw, of the Dubsar Suite. 17 November 2026, day 3, window 2. For the Dubsar Suite lead, who carries this into the repository. This file is the only change in build/: no source was edited, for the reason in "Why no code yet".*

The round ran on a smaller grammar (Agreements draft 25, the kit) than this code's core (genesis, Agreements rules 56 and up). The faults below were found on that grammar, but each is a habit of a client, not of one grammar. For each lesson: what happened, what Edubba should do, and where in this code it lands.

## 1. Read the bytes, not their printout

**What happened.** DubLaw wrote Terms whose owners were 64-character text where the cMIP asks for 32 bytes. Our reader showed bytes as hex text before checking, accepted the text form too, and called the words fine. They gave no reading: no later version could be valid, and a strict split service would have paid nobody (Hop, act a69f00ea…). The last fresh root had to be signed again.

**What Edubba should do.** Every check that decides whether something may be signed runs on the raw decoding, before any conversion for display. A field that must be a hash is a byte string of 32, never text that looks like one. Anything else is refused, with the field named.

**Where.** Every `/^[0-9a-f]{64}$/` test that feeds a signing path, rather than a form a person types: `src/publishing.ts` (HEX64), `src/member.ts`, `src/known.ts`, `src/deals.ts` line 188. Each should test a value the person typed, never a value decoded from an act. Values decoded from acts should be checked as bytes, in `genesis/src/core.ts`'s readers.

## 2. An update names the version it replaces: the one in force

**What happened.** We gave an entrant Terms fields whose `replaces` named version 1 when version 2 had just come into force. Signed, they would have replaced the wrong version (G4.8). The entrant caught it.

**What Edubba should do.** Never take `replaces`, or its equivalent here (the previous decision, the agreement in force), from what the person typed or from the first version. Read the one in force when preparing, and read it again just before signing. If it changed in between, say so and sign nothing.

**Where.** `src/real.ts` around line 1197 already reads `inForce` from `collectiveNow` when acting. Make the same read, at signing time, every place an act names the decision or version it follows: `src/publishing.ts` price tags (line 727 names "the one it replaces"), and ownership agreements' next versions.

## 3. Your own line: name your newest act, or your act counts for nothing

**What happened.** Edubba's first tray version signed a party's assent to a second version naming no previous. Under draft 25 the party's line then forks, and the assent stops counting, without a word to the person (Counterparty's E2).

**What Edubba should do.** Before any signature that continues a person's line in an agreement, find that person's newest act in it from what Edubba holds. If their own acts already fork, refuse and say why.

**Where.** `src/desk.ts`, where acts are made (`made.act`, around line 475), and `Store.identity`, which already keeps one object per identity file "so a member … never signs two acts at one place in their sequence". Apply the same discipline within an agreement's line.

## 4. "Only with your own signature" means in your own name

**What happened.** Shower work promised that nobody can lower your share without your signature. But an assent made for you under a power counts as yours (G5.6(f)), and adding the power was not a cut (Plain Words; Counterparty Y1). Fixed in shower work draft 6.

**What Edubba should do.** Where a reading tells someone "this needs your signature", say whether a power may give it for them. Where a grant or a power lets someone sign for another, show that on the screen of the person signed for, before they join.

**Where.** `src/grants.ts` (grants and their revocation), and every read-back that says "needs your signature" in `src/publishing.ts`.

## 5. A silent co-owner must not freeze everyone

**What happened.** Under shower work, one owner who loses their key freezes a work's sales for good (Keep, K1): every way out needs their signature.

**What this code already does better.** This code's collectives have declarations of absence: any number of the other members, set in the constitution, decide that a member is absent, and that member loses their voice and keeps their stake (`../collective/src/actions.ts`, `abandonmentOthers`, `absenceSection`). That is the pattern shower work lacks.

**What Edubba should do.** Make sure a work held by several persons, not only a collective, can name in its ownership agreement who may declare an owner absent. Show "who judges absence" in the read-back before anyone joins. This is a question for Nobody, allegedly; see DubLaw's report.

## 6. Payments wait on payees' invoices

**What happened.** DubLaw's invoices ran out, and a buyer's payment sat at the split service (Gaël). That is DubPay's area. Edubba's part is to tell an owner, plainly and early, when their unpaid invoices are about to run out.

## 7. Open what is sealed to you

**What happened.** DubLaw read only public acts until day three, while sealed acts from the lead and from Counterparty waited unread.

**What Edubba should do.** Show the count of unopened sealed acts addressed to each identity on the first screen, and open them with the same verification as public acts.

**Where.** `src/desk.ts` around line 858 (`openSealed`) and `src/memory.ts` around line 211.

## The code (day 3, window 3)

`src/before-signing.ts`, with its test `test/before-signing.test.ts` (7 tests, all pass), turns lessons 1 to 4, 6 and 7 into pure checks: `hashFieldProblems`, `replacesInForce`, `newestOwnAct`, `ownNameAssenters`, `invoicesWarning` and `unopenedSealedLine`. The module imports nothing from the rest of the repository, so it runs alone:

```
node --experimental-strip-types --test test/before-signing.test.ts
```

It is not yet called from any signing path: wiring it in means editing code whose tests need the missing folders. The places it belongs are named under each lesson above.

## Why no other code yet

`build/` holds `clients/desk` and `clients/collective` only. Their tests import `../../genesis/src/*.ts`, `../../damgar/test/world.ts`, `../../barebone/…`, `../../repo/…` and `../../../modules/…`, and none of those were copied. No `node_modules` are present either. I could not run one test. A change I cannot test would break the rule "plain, consistent and tested", so I wrote the lessons with their places in the code instead.

To build them, please copy genesis, damgar, barebone, repo and modules beside `clients/`, or tell me where in the repository they live.

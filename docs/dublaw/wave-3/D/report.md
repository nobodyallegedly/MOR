# DubLaw, wave 3, session D: report

The stint's wish (Nobody, allegedly, 20 November 2026): "Current wish: extract data, knowledge and understanding from the simulation run"

*A record of work by Claude for DubLaw, 22 November 2026. Not a decision; nothing merged.*

## Summary

1. Edubba and the collective client implemented the earlier Agreements (the MIR series, "draft 17" and nearby), not draft 25: 25 faults listed (`fault-list.md`): 17 fixed (eleven of them in the library only, the old writers left as questions), 7 left as questions, 1 not reached (the round's additions); 9 questions for the MOR lead.
2. Tests pass: 173 of 174 run, 0 failed, 1 skipped (the round's real acts, out of reach), 0 changed. New: 8 pass, 1 skipped.
3. The fix reads and writes draft 25 by the core library's own code (the kit's binding, from `claude/agreements-verifier-2`), never by bytes written by hand.
4. Edubba now reads every draft-25 act an identity receives: fields, the checker's verdict, whether the Terms are in force.
5. The collective library writes Terms, assents, counter signatures, contests, resolves and reports, each passing the kit's own `agreements check`.
6. Not fixed: every old writer (claims, ownership agreements, publications, collectives, grants), which needs cMIPs draft 25 does not name (Q1 to Q7).
7. Not done: DubLaw's round additions not brought in, and the round's real acts not read, because no folder on the Mac was shared with this session.
8. Branch `claude/dublaw-w3-clients-draft25`; draft pull request: https://github.com/nobodyallegedly/MOR/pull/225.

## What was fixed

Both clients run the same new library, in the collective client (which is the library Edubba's Collectives tab runs on):

- `clients/collective/src/agreements-25.ts`: draft 25's spec hashes and types (F1); every act read to its fields by the kit's names, accepted only where the core's builder writes the same bytes from them (F3 to F7, F21); the checker's verdict; whether Terms are in force, from the core's grammar verifier (F10); writing Terms, an assent, a counter signature, a contest, a resolve and a report, with no `objects` or `acks` (F8), each Statement's `previous` the signer's latest act in that agreement, the Terms act for its author (F7, F9, F11, F12, F18, F19); checked before the identity's key signs and again after; a collective's keyless line refused (E3).
- `clients/collective/src/explain-25.ts`: such an act in plain words.
- `clients/desk/src/desk.ts`, `readItem`: an act of draft 25 reaching an identity is no longer filed as "other", unread: Terms are filed as terms, and each act is read with the acts of draft 25 the identity received, this refresh's included (F20, F24). On the web, such an act is said and not read (`clients/desk/src/web/agreements-25.ts`; the web build keeps the binding out).
- `clients/collective/built-25/`: the kit's core, unchanged, its fingerprints checked by a test. Main's core has no draft 25.

## Left as questions (for the MOR lead)

Q1 collectives; Q2 the body and update-condition cMIPs of Edubba's deals; Q3 which fingerprint the words hold; Q4 a split service's receiver, control cMIP and reports; Q5 the seller's alarm (Money); Q6 claims and the baker's rights (the envelope's chain); Q7 grants and revocations; Q8 the web release; Q9 main's core. Each with its rule and code in `fault-list.md`.

## Tests, and how they were counted

Run on commit `2175d37c`, each client's whole suite (`node --import tsx --test test/*.test.ts`, with `MOR_CHROMIUM` naming the container's Chromium, since the tests' default path names a build this container does not have):

| | Before (main, untouched) | After | Failed | Changed |
| --- | --- | --- | --- | --- |
| collective client | 46 of 46 | 51 pass, 1 skipped, of 52 | 0 | 0 |
| Edubba (`clients/desk`) | 119 of 119 | 122 of 122 | 0 | 0 |

The new tests (9): in the collective client, 6:
- the binding's fingerprints and spec hashes;
- the kit's 6 worked examples plus the offer they need, read to the same fields;
- 9 acts the library writes, each passing the kit's own `agreements check`, with `previous` and in force by the grammar;
- refusals;
- old acts "not this encoding";
- the real-acts sample, **skipped**.

In Edubba, 3:
- the worked examples read to the same fields;
- the web stand-in's spec hashes;
- Terms and an assent through the program, read, "not shown" in force without its own assent.

The real-acts test was run once against a feed page of the shape `_research` holds (42 kit-signed acts): 36 found, 2 drawn by its rule, both read as the kit reads them. It has not met the round's own acts.

## Limits

- **The Mac was out of reach.** No folder on the Mac was shared with this session, so: DubLaw's round additions (`shower-work.ts`, `public-flow-readers.ts`, `deal-parameters.ts`, `before-signing.ts`, `arbiter/`) were not brought in, and are on no branch of the repository; the round's real acts in `_research` were not read (the test that reads them is written, with its drawing rule, and is skipped without them; run with `MOR_RESEARCH=PATH-TO-_research`); and this report and the fault list are in the repository (`docs/dublaw/wave-3/D/`), not in `~/Documents/mor-round-2/_team/dublaw/wave-3/results/D/`. Copy them there.
- **No screen writes a draft-25 act.** The writers are in the library and tested; no button of either app uses them, since that would be a feature, and the screens' own acts are the old writers (Q1 to Q7).
- **The grammar's answers are provisional**: the core's grammar verifier rests on stub cMIPs and stand-in layers (its own words), and any other cMIP gives "unchecked".
- **Edubba's released web files** (`clients/desk/built/`) were not rebuilt: that is the release's step after a merge. `npm run test:build` will say they differ from the sources until then.
- **Not run here**: `clients/kishib`'s airgap package is not built in this container, which gives one type error in Edubba's typecheck, on main as well.

## 26 November 2026: session D2, on the Mac

*A record of work by Claude for DubLaw, 26 November 2026. Not a decision; nothing merged. It does the two things above left undone (Summary, item 7; Limits, "The Mac was out of reach"), now that the round's folder was within reach. The questions Q1 to Q9 are left as they are.*

### What was done

1. **DubLaw's round additions, brought in unchanged** (commit `9635250f`): the twelve files of DubLaw's round copy (`_research/windows/dublaw/build/`), written against main at `5d73191b`, copied byte for byte: `clients/desk/src/shower-work.ts`, `public-flow-readers.ts`, `deal-parameters.ts`, `before-signing.ts`, their four tests in `clients/desk/test/`, `clients/desk/ROUND-2-LESSONS.md`; and `arbiter/` (`arbiter.ts`, `arbiter.test.ts`, `README.md`), placed at **`clients/arbiter/`**: it is reference code for a cMIP ("an arbiter's award") written for a client to run (pure functions, no keys, no network, no import), not a text, so it sits beside the clients that would read awards rather than in `cmips/`, which holds the cMIPs' texts. It has no `package.json`: Node 22 and later run its test as it is (`node --test clients/arbiter/arbiter.test.ts`).
2. **Their tests, as they are**: 43 tests (31 in Edubba, 12 for the arbiter), all pass. None assumed the older grammar (each file is pure, with no import from genesis or the core), so no commit brought one to draft 25.
3. **The round's real acts** (commit `7f5471a1`): the skipped test now runs on a sample of fifty public Agreements acts of round two (20 Terms, 30 Statements), drawn by DubLaw's manifest (`_team/dublaw/wave-3/d2/sample-manifest.json`: seed 20261125, `random.Random(seed).sample` over the Agreements acts some window kept), copied byte for byte from `_research/windows/<keptBy>/acts/<id>.mor` with the manifest into `clients/collective/test/real-acts/`. A sample, not the round's data: nothing else was copied. Each act is read on its own by the collective library and by the kit (`test/kit/`, round two's, unchanged; `tools/postman/kit` at `74739bb`), and through Edubba's reading (`draft25Item`), with the fifty held:

| Compared, per act | Where | Comparisons | Match | Mismatch |
| --- | --- | --- | --- | --- |
| kind, id, signer: the library against the kit's `agreements check`, and the manifest against it (6 per act) | collective | 300 | 300 | 0 |
| the core's verdict: the library's and the kit's | collective | 50 | 50 | 0 |
| fields given where it passes | collective | 50 | 50 | 0 |
| the payload, written by the kit's own builder from the library's fields | collective | 50 | 50 | 0 |
| Terms: the body's cMIP, the manifest's | collective | 20 | 20 | 0 |
| Terms: in force, with the fifty held: word, rule and qualifier, the library's and the kit's `agreements ask in_force` | collective | 20 | 20 | 0 |
| the core's verdict, through Edubba, and the kit's | Edubba | 50 | 50 | 0 |
| filed as terms (Terms) or other (Statements) | Edubba | 50 | 50 | 0 |
| fields, Edubba's and the library's | Edubba | 50 | 50 | 0 |
| Terms: the plain words name the kit's in-force answer | Edubba | 20 | 20 | 0 |
| **All** | | **660** | **660** | **0** |

All fifty pass the checker. Of the 20 Terms, none is shown in force from the fifty alone: 7 "not shown" (G4.1, no assent held in the name of every party named as a signer) and 13 "unchecked" (their in-force cMIP is not a stub the grammar verifier answers, G9), the kit and the library alike. That says what the fifty show, not what the round did: the sample holds few of the round's assents. Each mismatch would be listed by act id and fail the test; a test act with one byte changed gave two mismatches, so the test does see a difference. Rerun: `cd clients/collective && node --import tsx --test --test-name-pattern="real acts" test/agreements-25.test.ts`, and the same in `clients/desk`.

### Tests, before and after

Run on this Mac (Node 26.10.0; the core's WebAssembly built by `clients/genesis/scripts/build-wasm.sh`; `MOR_CHROMIUM` naming the installed Google Chrome, since the Playwright Chromium here lacks its framework and does not start), `node --import tsx --test test/*.test.ts` in each client:

| | Before (`31578291`) | After (`7f5471a1`) | Changed |
| --- | --- | --- | --- |
| collective client | 51 pass, 0 failed, 1 skipped, of 52 | 52 pass, 0 failed, 0 skipped, of 52 | the skipped real-acts test replaced by one that runs and passes |
| Edubba (`clients/desk`) | 121 pass, 1 failed, 0 skipped, of 122 | 153 pass, 1 failed, 0 skipped, of 154 | 32 new, all pass (31 of the round's, 1 real-acts); no other outcome changed |
| arbiter (`clients/arbiter`) | not in the repository | 12 pass of 12 | new |

The one failure, before and after: Edubba's `folders.test.ts`, "H23: where no folder is, a near match is named". It expects `tablets` not to be found where `Tablets` exists, which holds only on a case-sensitive disk; this Mac's disk is not, so the folder is found. Left failing: not a fault of the code, nor of this session.

### Left undone, and why

- **27 type errors in `clients/desk/src/shower-work.ts`** (`npm run typecheck`: implicit `any` parameters and a union read without narrowing), as copied from the round. The tests pass; the file runs. Not a grammar fault, so not fixed in this wave. Before it, Edubba's typecheck had only the one known error (`clients/kishib`'s airgap package).
- **Names in the round's files**: `before-signing.ts`, its test and `ROUND-2-LESSONS.md` name "Gaël", and `deal-parameters.test.ts` names "Léa": both are identities the round simulated in its public windows (the round's own reports name them as buyers), not real people. They are kept, since the files were to be copied unchanged; whether they stay is the lead's to say.
- **`clients/README.md`** has no row for `clients/arbiter/` yet: that would be a change beyond the copy.
- **Edubba's released web files** (`clients/desk/built/`), as above, not rebuilt.
- **Other clients' suites**: not run; this session changed no file of theirs.

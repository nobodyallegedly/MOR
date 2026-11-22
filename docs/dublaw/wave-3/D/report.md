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

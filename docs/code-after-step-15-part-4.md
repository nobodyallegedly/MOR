# The code after step 15, part 4: the clients, and the rehearsal of step 17

*15 October 2026. For Nobody, allegedly. The clients' part of the code for the step 15 decisions: the reader and the display client hold a signer's sequence before judging (Identity draft 13, F298), the rehearsal of step 17 names what each release implements by spec hash (release manifest cMIP draft 4, Development Q7, taken) and publishes the specifications as Development draft 10 writes them, and the founding client's warning of freeze suite step 3.7ae (F317). Then the rehearsal, run, and its checklist. Part 4 of 4; one pull request, stacked on part 3's (merge parts 1 to 3 first). Test identities only; regtest only; no real money.*

## In plain words first

- **A reader judges a post with everything the author signed before it, not with the post alone.** After the author's first rotation, a post made earlier counts only if it lies on the line the rotation kept. A reader holding the post alone could not tell, and answered "unknown". At the last rehearsal it read "void", and dubsar.org went dark. The reader and the display client now fetch the author's sequence first, wherever the author's chain has a rotation, so every reader gives the same answer (Identity draft 13, F298).
- **The rehearsal publishes the specifications as Development draft 10 writes them.**
  - The MICS document and the freeze test suite under their own kinds.
  - Each Module naming what it works under.
  - The two rail Modules naming their kind and what their proof binds.
  - Each release naming what it implements by spec hash.
- **The terms reading warns when owners who choose the members hold no key** (F311, F317): if they vote the members out and the members refuse to rotate, the vote stands complete and unexecuted.
- **The rehearsal now passes 16 of its 17 checks** once the display client is rebuilt (below). The one failure is the one the texts expect: the clients name test values for the specifications until step 17 makes the real hashes.

## Tests: before and after

| | Before (part 3's branch) | After (this branch) |
| --- | --- | --- |
| Rust workspace | 736 passed, 0 failed, 1 ignored | the same: part 4 changes no Rust |
| TypeScript, 18 packages | 419 passed, 0 failed | 421 passed, 0 failed |

The new tests:
- `clients/barebone/test/post.test.ts`: a post signed before its author's rotation reads "valid" with the author's sequence. Without it, the same post reads "unknown"; checked by switching the fix off.
- `clients/collective/test/explain.test.ts`: the F317 warning, given and withheld.

The display client's and Dub's web client's `built/` folders are not committed (below).

## The rehearsal of step 17: its checklist

`scripts/rehearse-step-17.sh`, run twice on this branch. Each run used two fresh homes under two operators, a relay and the browser, all on 127.0.0.1, with test identities only. Each left nothing running and nothing behind.

**First run, as committed: 14 of 17 pass.** The display client is served from its committed `built/` folder, which the project lead releases. That folder still holds the code from before this part.
- **FAIL 7.** The listing found no Module verified. The rehearsal published every Module without field 5, which Development draft 10 now requires (part 2's decoder). Fixed in `scripts/rehearsal/specs.ts`.
- **FAIL 10.** The first acts name test values, not the published specifications' spec hashes. As at the last rehearsal: by design until step 17.
- **FAIL 17.** After the rotation, the gateway's display client said "Failing: the site this gateway serves does not verify". This is the fix of this part, still missing from the released build.
- **Check 16 now passes:** the reader shows the first post verified after the rotation. At the last rehearsal it read "void".

**Second run, with the display client rebuilt from this branch: 16 of 17 pass.** The rebuild went into the working copy for the run only. `built/` was restored from the repository afterwards and nothing of it is committed.

```
  PASS   1. Two fresh homes under two different operators, and a relay, started for this run.
  PASS   2. The author's identity is born from the signer's commitment export (its chain key never leaves the signer), with a receipt from each home.
  PASS   3. Every act (40) verifies through its signer's identity chain, from a fresh process that knows only one home's address.
  PASS   4. The reader shows the first post (its photograph too), the shower text and Thank you for MOR, each verified and signed by the author's identity; the specifications, releases and site version, which the reader does not show as text, are signed by it too (check 1).
  PASS   5. The display client, verified from its release on MOR, is what the gateway serves, and the gateway serves the site exactly as signed: SAME.
  PASS   6. In a browser, the gateway's display client says the site is verified, signed by the author's identity, and shows the first act verified.
  PASS   7. The listing, reading the two homes the listing page names, finds every specification and every release, each verified; its extensions section is there, and empty.
  PASS   8. The public feed shows the first post, verified, and Machine, allegedly's first act, in the clock's order.
  PASS   9. A stranger's report, signed by its own test identity, reaches the reporting identity and is read there, verified.
  FAIL  10. The first acts name the specifications published at step 17 as their formats: the photograph the JPEG Module, the documents the long-form cMIP, the site the website cMIP, the releases the release manifest cMIP, the stamps the clock Module.
              the photograph, the shower text, the site version, the first release, a clock stamp name a test value, not the published specification's spec hash: the clients carry the test values until they are rebuilt with the hashes step 17 makes
  PASS  11. Machine, allegedly's co-signature names each of the author's documents (the shower text, every specification, Thank you for MOR).
  PASS  12. The rotation of the author's identity, signed on a signer restored from the seed words alone, counts at home 1, asked alone.
  PASS  13. The rotation of the author's identity, signed on a signer restored from the seed words alone, counts at home 2, asked alone.
  PASS  14. A post signed after the rotation, with the key it installed, verifies from outside.
  PASS  15. The first post, signed before the rotation, still verifies after it, judged with its signer's whole sequence (as the feed and the release verifier read).
  PASS  16. After the rotation, the reader still shows the first post verified, signed by the author's identity.
  PASS  17. After the rotation, the gateway's display client still shows the site and its first act verified, in a browser.

1 of 17 checks FAILED.
```

**For the project lead:** once the display client is released from these merges, check 17 passes as committed.

## What was built

- **`clients/genesis`:**
  - `holdSequence` (`src/lookup.ts`): wherever a signer's chain has a rotation, every act the signer has at its homes in force and at the places given is added to the verifier before one of its acts is judged.
  - `TestIdentity.chainSign` takes a chain key held as shares, rebuilt by the caller (part 3, for a collective's chain signature).
- **`clients/barebone`:** the reader's judge holds the signer's sequence; the web reader (`clients/reader`) reads through it.
- **`clients/site`:** the feed's judge, the listing's and the site verification all hold the signer's sequence.
- **`clients/collective`:** the F317 warning in the terms reading every client shows before signing terms.
- **`scripts/rehearsal`:**
  - `implements` by spec hash, each publication a hint;
  - the specifications in Development draft 10's form: the MICS document kind 6 and the test suite kind 7, naming no creator;
  - field 5 on every Module, and fields 11 and 13 on the two rail Modules.

## What was not built, and why

- **The display client's and Dub's web client's released builds** (`clients/site/built/`, `clients/dub/built/`): the project lead releases them after the merges, as the brief says.
- **Check 10:** the clients carry test values for the specifications until the hashes step 17 makes exist; step 17 rebuilds them ("Done by hand at step 17", 9, in `docs/step-17-rehearsal.md`).

## What changed in the drafts

None in this part. The rehearsal's record, `docs/step-17-rehearsal.md`, has a dated note with this run.

## Readings taken while building (for Nobody, allegedly, to see; any may be overruled)

1. **What the four key Modules work under.** Field 5 names what a Module works under. Six Modules say it in their text:
   - the payment cMIP: the two rails;
   - the anchoring cMIP: the two clocks;
   - the Envelopes MIR, whose task 5 they fill: the JPEG and video Modules.

   The air-gapped chain-key signer, the two seed Modules and the identity carry Module say only that they are Identity's. The rehearsal names the Identity MIR for them. This is a choice for step 17's publications, written nowhere in the drafts; each of those four drafts could say it in one line before step 17.
2. **No sequence fetched without a rotation.** With no rotation, an everyday act's standing rests on the chain alone: position and summary are judged only when a line is rebuilt (Envelopes draft 10, F292). So a reader fetches the sequence only where the chain has a rotation, sparing the feed a fetch per author.

## Questions for Nobody, allegedly

None from this part. The four parts' open questions are in their reports:
- **Part 2, question 1:** what a rail must bind for its payer to count as the buyer.
- **Part 3, question 1:** the outcome a declaration states against a vanished owner with a successor.
- **Part 3, question 2:** forks and closings under a rule by share.

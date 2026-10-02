# Law draft 9 and the code

*1 October 2026. A report for the project lead, from the build window of the roadmap's item "a short pass writing B17 to B19 into Law draft 9 and the code". Branch `claude/law-draft-9`, from main. Not merged to main; the roadmap is not edited.*

## In plain words

Law draft 8 named three rare gaps (B17 to B19). Nobody, allegedly answered them the same evening. They are now written into the texts and built into the code.

- **B17: someone who holds the safety key alone always has a named successor.** When their seat passes automatically, the successor takes the key. In the same change, the successor names their own successor and signs it. Until now this change was impossible, because it would have left the key with no successor named.
- **B18: an absent member who holds the everyday key alone can be declared absent.** The collective cannot write anything without that person, so the other members' signatures on the declaration cannot be recorded in the usual way. The fix: the safety-key rotation that removes the member lists those signatures. The declaration takes effect there.
- **B19: in a deal, one identity judges absence.** That identity can be a party, a keeper or a collective. A deal whose terms say "any two of the other parties judge absence" is now invalid. Parties who want to decide together form a collective and name it as the judge.

Writing these in exposed no new flaw. I had to choose four details while writing; each is listed at the end of Law draft 9 for confirmation (below).

## What changed in the text

- **`spec/MIP-law-draft-9.md`.** Law draft 8 with B17 to B19 written in:
  - the header;
  - the clause format: the threshold form is for collectives only;
  - "A deal" (B19);
  - the act table;
  - the declaration section (B18);
  - "Made before, made after", items 2 and 3, and the deal paragraph;
  - "Collectives in the identity chain": the third element, and a new paragraph on what it may name;
  - rules 36, 44c, 48c and 49;
  - "Reasoning", "Decided" and the freeze list;
  - "Open in this draft": B17 to B19 removed, B14's open points kept, readings added.
- **`spec/02-MOR-core-v20.md`.** Changes only:
  - the header;
  - one sentence in "Succession" and one in "Abandonment";
  - the current-drafts list, which had still said Law 7 and now says Law 9.
- **`spec/03-MOR-freeze-test-suite-v20.md`.** Changes:
  - the header and the checklist;
  - scenario 3, step 7k (B18) and step 8b, a sixth collective (B17);
  - scenario 1, step 9: "the keepers' operators sign" becomes the one keeper's operator the clause names, which is what the clause's format always allowed and B19 now says;
  - scenario 1, new step 9c (B19), and both "Passes if" lines.
- **Kept until approval:** draft 8, core v19 and suite v19. `spec/README.md` lists both versions.
- **`docs/findings/MOR-findings-log-round-2.md`.** One new paragraph under F109, "Draft 9", records that B17 to B19 are applied. Earlier wording is untouched.

## What changed in the code

- **Core library (`core/src/law/`):**
  - **B17.** A succession clone for a party who held the safety key alone must carry the successor's own plan, in the place of the plan it executes. The successor signs the clone in any case (they are the signer its mark names). Otherwise the clone is invalid. Anywhere else, a succession clone still adds no plan.
  - **B18.**
    - A rotation's Law declaration may carry a third element. Each act it names must be a valid signature act on a declaration against a party that the rotation removes as C7 says. Otherwise the rotation puts nothing in force, as Flaw M already does for a clone's signatures.
    - The signatures it names are counted at that rotation.
    - The "unsettled" refusal is gone.
  - **B19.**
    - Terms of a deal with a threshold authority fail the terms check.
    - The deal-threshold counting code and its "unsettled" refusal are removed.
- **WebAssembly bindings:** a rotation's declaration takes an `absence` list beside `signatures`.
- **Repo client:**
  - `declareAbsent` on the holder of the everyday key makes the declaration and the signature acts, and no record.
  - The next `changeMembers` that removes that member names those signature acts in its rotation.
- **Collective client:**
  - The refusal to declare its own key holder absent is lifted. The review says that no record is made and that the member change removing them is where the declaration takes effect.
  - Until that change, actions that would draw a line with the absent holder's key are blocked, with a plain reason: leaving, stepping down, new words, who judges absence, and another declaration.
  - The member change's review says that it names the others' signatures.
- **Ordering simulation:** its final line now names Law draft 9. Nothing else changed, since it models none of B17 to B19.

## Test results

All run on the final code:

- **Rust workspace:** 239 passed, 0 failed. In `law_collective.rs`, 35 of 35 passed. Changes there:
  - **B17:** the sixth collective of 8b, run to the end, plus four invalid shapes; a second test checks that no plan is added where the key is shared.
  - **B18:** the 7k recovery case in four variants: placed before; named by the rotation; named nowhere, where Ana is still counted and the clone is incomplete; another act named, which puts nothing in force. A further test checks that only a recovery rotation may name such signatures.
  - **B19:** threshold terms of one and of two are invalid, even when every party signed them; a collective named as the authority removes a voice.
  - The two tests that showed the old refusals were replaced.
- **Clients:** every client typechecks.

  | Client | Passed |
  | --- | --- |
  | collective | 18/18 (one new: the holder of the everyday key declared absent, then the recovery rotation, judged by a fresh verifier) |
  | repo | 11/11 |
  | genesis | 13/13 |
  | barebone | 9/9 |
  | longform | 15/15 |
  | manage | 7/7 |
  | reader | 16/16 |
- **Ordering simulation:**
  - 20,000 worlds: 0 wrong answers, for the rule tested and for the rules as draft 9 writes them;
  - stories and sweep: 21/21.

  The simulation does not model succession, threshold authorities, recovery rotations or deals, so this shows only that nothing it models moved.

## Readings to confirm

These are listed at the end of Law draft 9. I took the reading closest to the text in each case.

1. **B17:** the successor's plan sits in the place of the plan it replaces, so one meaning has one encoding. It is added only where the departed member held the safety key alone.
2. **B17:** the successor's own plan passes their seat automatically later only if every voice signed a version carrying it (Q14). The other members can do that by signing the succession clone too. Otherwise the successor's successor comes in by nomination. Rule 36 asks only that a successor be named.
3. **B18:** a rotation that names, in the third element, anything other than a signature act on the declaration taking effect there puts nothing in force. This is as strict as Flaw M is for a clone's signatures.
4. **B19:** the threshold form is invalid in a deal whatever its number, "any one of the others" included, because "one identity" is an identity the clause names.

One reading of draft 8 is withdrawn because B19 makes it moot: how a deal's threshold authority was counted.

## Still open

- What B14's answer leaves open, as before, refused rather than guessed. These are left for the end of the roadmap:
  - where a successor goes among the parties when not in the departed member's place;
  - a seat's voting weight;
  - a successor who is already a party;
  - several successors to a key held by one person;
  - a departed custodian or recovery holder.
- The deployed test collective still uses draft 6 formats and must be refounded (test only).

## Ready to approve and merge?

**Yes.** Law draft 9, core v20, freeze suite v20 and the code are consistent and tested, with nothing failing, and nothing new is open. Approval should include a look at the four readings above. None of them changes an outcome Nobody, allegedly decided; each one fixes a detail the answers did not spell out.

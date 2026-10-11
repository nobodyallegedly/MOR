# Fix: F254's loop walk (draft 11 build, reading 6)

11 October 2026. One step: the fix settled the same evening in `docs/findings/MOR-findings-log-round-2.md` ("The draft 11 build: readings"), a mechanic, not a rule. Test identities only.

## In plain words

Take the Label and Carla's album agreement (A) and Ana and Ben's song agreement (B). The album's later version adds the song as a party, and everyone signs: the Label, Carla, and Ana and Ben for the song.

Then Ana and Ben alone sign a version of the song naming the album as a party. Under rules already decided, a version of the song naming the album needs the album's consent (F254, and F107: every party signs). Without the Label's and Carla's signatures it is not a version of the song at all, only a draft.

The library made two mistakes with that draft:

1. **The loop check counted the draft.** To find loops (an agreement ending up as a party of itself), the library walked through the versions of each inner agreement. It counted a version once the parties who are *people* had signed it, and skipped the parties that are *agreements*. So it counted Ana and Ben's draft, saw "album names song, song names album", and refused the album's later version, which everyone had signed. Ana and Ben could undo the album's change on their own. This was the flaw reading 6 described.
2. **Reading the two versions crashed.** This was found while writing the tests, and it was not described before. When two later versions name each other's agreements, asking whether either one stands made the library ask about the other, which asked about the first again, with no end. The program ran out of memory for the chain of questions and stopped. On main, all three new tests stop this way before any check runs.

After the fix:

- The draft moves nothing. It is no version of the song, and the album's later version stands.
- If the Label and Carla sign the song's version too, everyone has agreed to a loop. The loop is still refused, as before: both later versions are refused, and each agreement returns to its earlier version. The refusal stays as the guard against money running in a circle.
- Nothing crashes.

## The change

All of it is in `core/src/agreements/view/parties.rs`, plus one field in `core/src/agreements/view.rs`.

- **The walk follows only versions every party signed** (`signed_versions`, new `walk_signed`). A party that is a person counts through their own signature. A party that is an agreement counts only through its own line (new `walk_line_signed`): every party of some version of that line must have signed. That version must itself be one every party signed, read the same way. Recursion stops at `NESTING_BOUND`, and a line already on the way gives no consent. The loop refusal itself (`party_problem`, `loop_walk`) is unchanged.
- **Why `walk_line_signed` and not `line_signed` itself.** `line_signed` reads the inner agreement's version in force. That depends on whether its later versions are refused, and that is the very walk being computed, so calling it would loop. `walk_line_signed` asks the same question but reads only terms and signatures, never another version's verdict, as reading 5 required: no judgment depends on itself. In one way it is wider than `line_signed`: it accepts consent from any held version of the line every party signed, not only versions up to the one in force, because the walk cannot know which version is in force.
- **A reading taken by the session (mechanic, the build's), for review.** For a deal's clone, "every party" includes every party of its parent, since a deal changes only unanimously (F107). Without this, anyone could draft a clone of the album naming only themselves and sign it. That clone would count as "every party signed", the album's consent would come from it, and the same flaw would come back by another route. The third test shows this. The old walk (reading 5) had the same opening: any held version whose people had signed was followed, whoever drafted it. A collective's clone keeps its own rule (its own parties, as before), because a collective changes by its thresholds, not by unanimity.
- **The crash: a guard, failing closed.** A new field, `consenting`, lists the lines whose consent `line_signed` is reading. If the same line is asked again while its own answer is still being read, it gives no consent. This is the same pattern the view already uses for records (`busy`) and citations (`citing`).

### Stated limits, not fixed here

- **A deal's clone made after a party's voice was removed (B19, absence).** The rule-45b check counts that clone without the absent party's signature. The walk requires every party of the parent, so it does not follow such a clone. A loop made only through such a clone would go unrefused. That is the convenient side of a rare case, so it is named here: should the walk read deal voices (rule 45b)? That needs the keepers' records and declarations, which the walk does not read today. This is for the project lead.
  *Fixed, 11 October 2026 (`docs/closing-owes-fix.md`, part 2): the walk reads deal voices as rule 45b does.*
- **The guard depends on the order of questions.** Inside one question, a line asked twice gives no consent. So an answer computed in the middle of a cycle can differ from the same answer asked on its own. Every question the tests ask gives the expected answer, each asked of a fresh view. A cycle needs versions naming each other's lines, and where every party signed them, the walk refuses them anyway.

## Tests

New, in `core/tests/agreements_collective.rs`, with a shared setup `album_and_song` (A v1: the Label and Carla; B v1: Ana and Ben; A v2 adds B, all signing):

| Test | What it shows | On main | With only the crash guard | After |
|---|---|---|---|---|
| `f254_a_draft_of_the_song_naming_the_album_does_not_undo_the_album` | B v2 names A, signed by Ana and Ben only: B v2 is no version of B, B stays at v1, A v2 stands and is in force | stack overflow | fails: A v2 refused for a loop | passes |
| `f254_a_loop_every_party_signed_is_still_refused` | the same, and A v2 stands while only Ana and Ben signed; then the Label and Carla sign B v2: both later versions refused for the loop, A and B back at v1 | stack overflow | fails at "a draft moves nothing" | passes |
| `f254_a_clone_its_drafters_alone_signed_gives_no_consent` | Ana and Ben draft a clone of A naming only themselves and sign it, then B v2 naming A: still no version of B, A v2 stands | stack overflow | fails: A v2 refused | passes |

The third test also fails when only the clone rule is removed from the fix (the walk counting a clone's own parties only), and passes with it.

The existing F254 tests (named by line, no loops, the bound at 8, manifests) pass unchanged.

`deal_promises_hold`, ten seeds, each passing (`AGREEMENTS_INVARIANT_SEED=<seed> cargo test -p mor-core --test agreements_invariants -- --exact deal_promises_hold`): 1, 2, 3, 42, 1000, 65535, 271828, 3141592, 17655411432439988002, 9876543210123.

`scripts/test-all.sh` (without `--reproducible`, regtest not set), the tree untouched during each run:

- **On main (cde340f), first:** all passed. Rust 622, TypeScript 220 (barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, jpeg 14, video 6). The first attempt stopped at the WebAssembly step because `wasm-bindgen-cli` 0.2.129 was not installed in this container. After installing it as the script asks, the whole run passed.
- **At the end, on this branch, first run:** failed in Rust, in `collective_promises_hold`, a property this change does not reach, on a random seed: CLOSING-OWES, "a complete closing with an open debt in its history", seed 9763223879668712927, 48 cases. Replayed with that seed on main, without this change, it fails the same way. So it is an earlier fault that a new random seed found, not this step's. It is not recorded in `docs/` yet. It is left for its own step, as F266 was, with the replay command: `AGREEMENTS_INVARIANT_SEED=9763223879668712927 AGREEMENTS_INVARIANT_CASES=48 cargo test -p mor-core --test agreements_invariants -- --exact collective_promises_hold --nocapture`.
- **At the end, on this branch, second run (the whole script, so the TypeScript packages ran too):** all passed. Rust 625 (622 and the three new tests), TypeScript 220. No vector changed.

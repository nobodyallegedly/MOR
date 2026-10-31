FIRST_LINE_PLACEHOLDER

# S7h-6, the last two reds before the merge: report

*Session S7h-6, 31 October 2026, on branch `claude/s7h-the-redesign` (pull request 113), after the suite's round 8 follow-up. It recorded no finding of its own: F410 stays free. No rule changed.*

## 1. GRANT-COUNTS: the core was right, the invariant's oracle was not

- **The seed's smallest case:** two members, one device, a Money area held by both members with number 1, and a grant in that area that the agent accepts and no other holder signs.
- **Who draws the grant:** the collective's device, a device of member 0, who is one of the area's holders.
- **What the texts say:** an act for the collective counts where its signer is "a member meeting, with the others who signed it, the rule of the layer the act falls in, or of the area within it" (rule 58, counted as rule 60 says). The drafter is one of those who signed. So the area's number is met by the drafter alone, the grant counts, and the agent's act within it binds (rule 74). The core said so.
- **Where the mistake was:** the invariant's oracle (`make_grant` in `core/tests/agreements_invariants.rs`) wrote "holders signed" only when the case asked other holders to sign. It forgot the drafter's own signature, which it already counted for the collective's other acts.
- **The fix, in the oracle:** a grant drawn by a holder of an area whose number one meets counts.
- **Fixed test:** `a_grant_in_an_area_counts_once_the_areas_rule_is_met_its_drafter_signing_by_drafting` (`core/tests/keyless_collective.rs`). It runs both ways:
  - drawn by a holder, with no other signature, the grant and its grantee's act count;
  - drawn by a member holding no part of the area, no holder signing, neither counts.
- **Two vectors** show the same.
- **Many seeds:** `collective_promises_hold` and `collective_verdicts_do_not_depend_on_order`, 500 cases on each of four seeds (2,000 each), pass. The suite's seed passes too.

## 2. The relay test's race

`a_live_home_objects_to_a_homeless_rotation` (`relay/tests/home.rs`). Its first reader stands for one who could not reach the old home, and has not yet seen its objection. The new home, though, may already hold that objection, brought by its own probe: then the reader saw it, rule 49 voided the rotation, and the test, expecting it to count, failed on some runs.

- **The fix:** the reader now leaves out any objection it gets from the new home.
- **What the test then shows, in order:**
  - it counts the rotation, on its own failed attempt to reach the old home;
  - once the objection reaches it through the relay's probe, the rotation is void.
- **Run here:** 40 times in a row, all passing.

## 3. The retired offer

- **Removed:** `agreements::Offer`, `OfferAct` and `Paid`, the standing offer's types and decoder in `open_formats.rs`. Nothing else names them.
- **The workspace builds and passes without them.**
- **The binding's `read_anchor` is left as it is.** Calling `Offer::from_publication_tags` would change its answers, so the change is not the small one asked for:
  - it refuses a publication read with no tags, which the binding reads alone;
  - it stops at a tag with no price, where the binding skips one.

## Vectors

- **Every earlier case keeps its verdict, acts and ids.**
- **Two Agreements cases added:**
  - a grant in an area of number one, drawn by one of its holders: its grantee's act counts;
  - the same grant drawn by a member holding no part of the area: it counts for nothing.
- **Checks:** the Rust check passes 10 of 10, and the Python check says "all 276 vectors agree".
- **Readmes:** `core/vectors/README.md`, `scripts/c-box/vectors-README.md` and `core/README.md` are updated.

## Releases and checks

- **The six web releases are rebuilt** (11abb283): the display client, Dub, Kišib, Damgar, Ummia and Edubba.
  - The WebAssembly changed with the retired types.
  - Built with the tools `BUILT-WITH.txt` names. The display client's and Kišib's rebuild checks pass here.
- **`cargo test --workspace`:** every test passes.
- **c-box:** `scripts/c-box/make-c-box.sh` into a scratch folder assembled 8 texts and 12 vector files, refusing nothing.
- **GitHub:** GITHUB_PLACEHOLDER

## Questions

None. The grant case asked for no decision: rule 58 already counts the drafter among those who meet the rule, and the core already followed it.

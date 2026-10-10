# The rename pass: why the tests failed on main, and the fix (10 October 2026)

*Report of a GitHub session, for Nobody, allegedly. Branch `claude/rename-ci-fix`. One file changed, a test file; no rule, no wire format, no hash tag, no stored field and no vector changed.*

## In plain words

The rename pass changed the names inside the code: the module called `law` became `agreements`, `finance` became `money`, and so on. Every test file on the rename branch was renamed with it, and all 577 tests passed there.

While that branch was being worked on, main gained a new test file: the one that pins how the core treats announcements today (`core/tests/review_announcements.rs`, from the review of F230 to F234). It was written on main, under the old names, about fifteen minutes after the rename branch started. The rename branch never had the file, so the rename could not touch it, and nothing on the branch could fail because of it.

When the branch was merged into main, git saw no conflict: one side added a file, the other side changed other files. So the merge went through cleanly, and the result was a tree where one test file still asks for `mor_core::law` and `mor_core::finance`, which no longer exist. Rust refuses to compile that file, and when one test file does not compile, Cargo runs no tests at all. That is the exit code 101, twice: the step and its rerun.

The fix is the same rename, applied to that one file: the module names, the type `LawView`, the helper `law_act` and the names of the fields of the test's stand-in specification hashes. The strings that are hashed (`"LAW, test value until the freeze"`, `"FINANCE, …"`) are untouched, exactly as the rename pass left them everywhere else. After the fix, every test runs: 581 Rust tests, the 577 the rename pass counted plus the four in the new file, and the 204 TypeScript tests. The vectors were regenerated and are byte for byte what they were.

The two other failing steps in the same workflow run ("Reproducible build of the display client" and "Fingerprints…") are the known state before a release: `clients/site/built/` still holds the previous release's display client. They are left alone, as asked.

## Precisely

**What failed.** `cargo test --workspace --locked` on main at `3212e104` (and at the merge `f0f3ee75`):

```
error[E0432]: unresolved import `mor_core::finance`
  --> core/tests/review_announcements.rs:33:15
error[E0432]: unresolved import `mor_core::law`
  --> core/tests/review_announcements.rs:36:15
error: could not compile `mor-core` (test "review_announcements") due to 2 previous errors
```

A compile error in one test target aborts `cargo test` before any test binary runs, with `--no-fail-fast` as well (that flag only keeps going past failing *tests*). So the step ran zero tests, and no other Rust failure hides behind this one: once the file compiles, all 65 test binaries run and pass.

**Why the rename branch did not show it.** The rename branch forked from `17726e9` (pushed 16:50 UTC). Main then gained `48c194e` (17:07 UTC), which added `core/tests/review_announcements.rs` using the pre-rename names, and nine more commits that touched only documents. Part 1 of the rename (`03fecff`, 17:22 UTC) and parts 2 and 3 renamed every test file *in the branch's tree*; the new file was not in it. The rename report's counts (577 before on `17726e9`, 577 after) are right for that tree: `core/tests/` holds 372 `#[test]` functions at both `17726e9` and `b9bb739`. The merge `f0f3ee75` had no textual conflict (an added file on one side, modified and moved files on the other), and the merged tree was not tested before it was pushed. The workflow runs on pushes to main and on pull requests; the rename branch had no pull request, so GitHub never ran the tests on it either. The first run of the merged tree was the failing one.

**What changed.** One file, `core/tests/review_announcements.rs`, 26 lines, the same substitutions part 1 and part 2 of the rename pass made in its sibling `core/tests/review_live_work.rs`:

- imports: `mor_core::finance` → `mor_core::money`; `mor_core::law` → `mor_core::agreements`; `LawView` → `AgreementsView`;
- the stand-in `Mips` fields: `envelope:` → `envelopes:`, `finance:` → `money:`, `law:` → `agreements:`, `production:` → `development:` (the hashed strings `t("ENVELOPE")`, `t("FINANCE")`, `t("LAW")`, `t("PRODUCTION")` unchanged);
- `mips().law` → `mips().agreements`, `mips().finance` → `mips().money`;
- the helper `law_act` → `agreements_act`, and every `law::` path → `agreements::` (`types::SIGNATURE`, `types::TERMS`, `types::STANDING_OFFER`, `types::WORK_CLAIM`, `signature_payload`, `WorkClaim`, `Offer`, `Sold`, `Paid`);
- two comments: "as in the other Law tests" → "Agreements tests"; "Dario's everyday key" → "Dario's signing key". `everyday_act` stays, as the rename pass kept it (its question 2).

Nothing else was touched: no source file, no vector, no document other than this report. The file's test data and assertions are as the review wrote them.

**The wire proof, rerun as the rename report's section 4 does.** From the fixed tree:

- `cargo run -p mor-core --example gen_vectors`: the seven files in `core/vectors/` rewritten, `git status` shows no change.
- `cargo run -p mor-airgap --example seed_vectors`: output compared with `cmp` to `modules/airgap/vectors/seeds.json`, identical.
- `npm run vectors` in `clients/longform` (37 vectors written) and in `modules/jpeg` (9 vectors): no change to `clients/longform/vectors/` or `modules/jpeg/vectors/`.

This is expected: the change is to a test file, which nothing on the wire is built from. It is checked anyway because the task asked for it.

**Test counts.**

| | Rust (`cargo test --workspace --locked --no-fail-fast`) | TypeScript (`scripts/test-all.sh`) |
|---|---|---|
| main `3212e104`, before | build fails; 0 tests run (exit 101) | not reached by the script (`set -e`) |
| rename branch `b9bb739`, from its report | 577 passed | 204 passed |
| after the fix | 581 passed, 0 failed, 1 ignored, 65 test binaries | 204 passed |

The four added tests are the new file's: `today_an_access_offer_sells_without_count_so_a_limited_announcement_is_sold_past_its_limit`, `today_voiding_the_opening_act_voids_nothing_that_names_its_id`, `today_a_closing_act_naming_what_an_announcement_became_is_read_by_nobody`, `today_an_access_offer_under_a_second_agreement_on_the_same_announcement_is_never_shown_outside_the_first`. The one ignored test is `verifier2_export`, ignored before this change as well. The TypeScript count by package: barebone 9, collective 39, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 34, jpeg 14.

`scripts/test-all.sh` ran to the end in this container ("All tests passed"), with the pinned Rust 1.97.0, wasm-bindgen-cli 0.2.129 installed with `cargo install --locked`, Node 22, and `MOR_CHROMIUM` pointing at the container's Chromium for the browser tests. The `--reproducible` pass was not run: it is the known pre-release failure named above, and the task leaves it.

**Not a flaw in a MIP.** Nothing here touches a rule. It is the ordinary hazard of renaming on a branch while main keeps moving: a merge that compiles each side but not their union. The check that would have caught it is to run the tests on the merged tree before pushing the merge to main, or to merge through a pull request, since the workflow runs on pull requests.

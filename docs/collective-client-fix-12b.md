# The collective client after step 12b (10 October 2026)

*A fixing session for Nobody, allegedly. Main's "tests" workflow failed at `clients/collective` from the merge of step 12b (the open formats, `docs/formats-build-12b.md`, merge commit `52d6dd5`); the Rust workspace passed. The 12b session did not run the TypeScript clients. Branch `claude/collective-client-12b-fix-k10059`. Nothing in `spec/` or the core library changed. Test identities only.*

## The cause, in plain words

One test in the collective client was written while the split plan's format was still open. It checked that terms carrying a split plan were refused with the words "not supported yet (format still open)". Step 12b decided that format and built it, so the core now reads a split plan; the test's made-up plan (an empty list, where Law's format asks for a map) is refused for a different reason, "not in the Law format: split plan". The core is right, and the spec agrees (`spec/MIP-law-draft-10.md`, `split-plan = { 0 => [+ share-rule], 1 => hash, ... }`). The test held on to the old rule: it was the test that had to change, not the core.

Reproduced: WebAssembly built (`cd clients/genesis && npm run wasm`), then `npm test` in `clients/collective`: 37 passed, 1 failed, `explain.test.ts`, "what this client does not implement cannot be signed; open formats are refused outright", with `The input did not match /not supported yet.*split plan/. Input: 'law/shape: not in the Law format: split plan'`.

The cause is in the client's test, not in the core: nothing to stop and report.

## The fix

- **Test rewritten** (`clients/collective/test/explain.test.ts`, the test above, renamed "…terms out of their format, or with a withdrawn field, are refused outright"). *Why:* it pinned the split plan's "format open" refusal, which step 12b replaced with the decided format. It now checks the refusal Law gives today (a plan not in its format), and adds the other 12b decision that touches terms: field 10, the concurrency rule, is withdrawn, and the core refuses terms carrying it with its own words.
- **Words matched to the decided formats**, in the collective client (no test pinned them):
  - `explain.ts`: field 28, the fees (F213), is named, both where an area reaches it and where a clone changes it; field 10 ("the fork rule") is no longer listed among the fields a clone can change, since it is withdrawn. The comment on `termsOf` no longer speaks of open formats.
  - `actions.ts`, the reading of a split: a payout the plan does not justify was described as one "only the split plan, whose format is open, could justify". It now says the split plan and fees of the version in force do not name it (Law rules 26, 27), as the core now checks it against the plan.

## F207's client half: the drafts a resignation leaves behind

Small, so added. *Client conformance (Law draft 10, F207):* "her client names the drafts when she resigns."

- `clients/repo/src/law.ts`: `signedBy(member, relays)`, every act a member signed by a Law signature act the relays hold (the loop `signedVersions` already had, now shared); `resign(…, drafts)` passes them to the binding's `resignationPayload`, which sorts them.
- `clients/collective/src/actions.ts`, `prepareLeave`: before the review, the client finds the versions of this collective's agreement the member signed that are not the one the resignation names and not one seen in force (the core says which collective a version belongs to, by its lineage: `lawCollectiveOf`). The review shows a new section, "Drafts left behind", naming them, or saying none was found; either way it states F207's cost: a version signed elsewhere and not found at the relays cannot be named, and would bring the member back if a line ever put it in force. The resignation signed is exactly the one reviewed (the drafts are in its payload, which the review's digest covers).
- **New test** `clients/collective/test/f207.test.ts`: Ada and Sim One sign a change stopped before its record (a draft, never in force); Ada leaves; the review names the draft, and the resignation at the relay carries it in field 2. Sim Two, who signed no draft, is told none was found. Seen failing with the drafts left out, passing with them.
- *Not done:* stepping down from the Releases area (also a resignation, with an area) and the resignations signed inside "Change members" name no drafts. F207 speaks of the resignation; whether a step-down from one area should name drafts too is a question for Nobody, allegedly, not one to settle in the client.

## Noticed, not changed (the core)

The doc comments of `LawView::split`'s `unplanned` (`core/src/law/view.rs`) and of the binding's split output (`wasm/src/lib.rs`) still say the plan's format is open; the code below them checks the plan. Comments only, no behaviour: left for the core's next pass, as the core is not changed here.

## Results

RESULTS_PLACEHOLDER

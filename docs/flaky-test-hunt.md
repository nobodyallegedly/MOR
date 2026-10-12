# Flaky test hunt: pull request 23's red "Rust workspace"

*12 October 2026. Report only: no code, test or spec changed. Branch `claude/flaky-test-rust-pr-23-nqmvzo`, from main at `04f743a`. Test identities only. rustc 1.97.0, on a 4-CPU machine (as GitHub's runner).*

## In plain words

Pull request 23 changed only texts, yet its first test run on GitHub failed and the rerun passed. The failing test was `too_large` in `relay/tests/relay.rs`. It is the same test that failed twice before (`docs/split-module-build.md`, `docs/f188-f189-build-2026-10-09.md`), each time with a closed connection.

The test sends a relay something far too big and checks that the relay answers "too large". **The relay does answer, but then hangs up while the sender is still sending.** When the machine is busy, the hang-up can reach the sender before the answer does. The sender then sees "connection broken" instead of "too large". Sometimes the answer arrives but the broken connection is reused for the next request, and that request fails instead.

So **the test is right and the relay is at fault**: a relay bug, not a race in the test and not a seed. As the brief asks, I stopped there and changed nothing. The fix belongs in the relay library, and one decision is needed from Nobody, allegedly (below).

No other test failed in 60 full runs. No property test failed on any seed.

## Before anything: main as it stands

`scripts/test-all.sh` on main at `04f743a`, without `--reproducible` or regtest, the tree untouched during the run: **all passed.**

- Rust workspace: 647 passed, 0 failed, 1 ignored (the Lightning regtest).
- TypeScript: 249 passed, 0 failed, in 14 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, poster 7, reader 16, repo 18, site 58, jpeg 14, video 6, carry 6.

## What GitHub saw

From the log of the first attempt (run 515, attempt 1, step "Rust workspace"):

```
test too_large ... FAILED
thread 'too_large' panicked at relay/tests/relay.rs:20:18:
expected an error of the cMIP, got Err(Transport("error sending request for url (http://127.0.0.1:<port>/acts)"))
```

Attempt 2, on the same commit, passed.

## The runs

Every run was `cargo test --workspace --locked`, exactly GitHub's step: the default test threads, from the repository root, on the untouched tree. Each run's log was kept and checked.

| | Runs | Clean | Failed | Time per run |
|---|---|---|---|---|
| 1. Alone, one after another | 20 | 20 | 0 | 129–146 s, mean 137 |
| 2. Under load: two whole workspaces at once (second one in its own build directory), 20 each | 40 | 38 | 2 | 159–180 s, mean 167 |
| **All** | **60** | **58** | **2** | |

Every failure seen:

| Run | Test | Message | Seed |
|---|---|---|---|
| Load, workspace B, run 2 | `relay/tests/relay.rs` `too_large` | `relay.rs:220:38`: `called Result::unwrap() on an Err value: Transport("error sending request for url (…/info)")` | none (not a property test) |
| Load, workspace B, run 8 | `relay/tests/relay.rs` `too_large` | `relay.rs:20:18`: `expected an error of the cMIP, got Err(Transport("error sending request for url (…/acts)"))` | none |

Cargo stops at the first test file that fails, so each failing run counts 640 passed, not 647: the test files after the relay's never ran. GitHub's log shows the same.

The six seeded properties (`core/tests/agreements_invariants.rs`) passed in all 60 runs, each run on a fresh random seed (a property prints its seed only when it fails, so none was printed). No seed failure to judge, so no MIP gap to raise.

## Reproducing it

`too_large` alone, 200 times in a row, with six busy loops keeping all four CPUs occupied: **197 passed, 3 failed.** Both kinds appeared: twice at line 20 (`/acts`, GitHub's kind) and once at line 220 (`/info`).

## The cause

**What the test does** (`relay/tests/relay.rs`, `too_large`). It starts a relay accepting acts up to 2,000 bytes. Then it sends, among other things, 200,000 bytes to `POST /acts`, and expects the cMIP's error 6, "too large". Then it asks `GET /info`.

**What the relay does with it.** This was watched directly. A relay was started from `target/debug/mor-relay` on a local port with the test's limits, and fed a 200,000-byte body by hand, a little at a time.

1. The relay reads the body up to its cap, the act limit plus 64 KB (`relay/src/http.rs`, `router`: `DefaultBodyLimit`). The rejection arrived after about 69,600 bytes.
2. It answers correctly: `HTTP/1.1 413`, with the cMIP's error body, code 6.
3. Then it closes the connection at once, about 126,000 bytes before the sender is done. The answer does **not** say `Connection: close`.

The closing comes from hyper, the HTTP server under axum. When a handler drops a request body before its end, hyper reads only what is already buffered, then closes the read side (`hyper-1.11.1`, `proto/h1/dispatch.rs` → `conn.rs` `poll_drain_or_close_read`).

**Why the test sometimes sees no answer.** The sender's next bytes reach a socket that is closed for reading. The relay's system then answers them with a reset, and a reset throws away anything not yet read on the sender's side, the 413 included. Either the sender reads the 413 before the reset arrives, or it doesn't. On an idle machine it almost always does; on a busy one, sometimes not. That is line 20's failure: reqwest reports "error sending request".

**Why `/info` sometimes fails instead.** When the 413 does get through, nothing in it says the connection is finished, and reqwest keeps connections for reuse. The next request, `GET /info`, can go out on the connection the relay already closed. That is line 220's failure.

**Why this is the relay's fault, not the test's.** The relay transport cMIP says "Every error is answered as in 'Errors' below", and lists "6: too large". The test checks exactly that, and its comment says so: "Too large even to read: still an answer of the cMIP." The relay usually keeps that rule, but under load it can lose its own answer. That is behaviour of `mor-relay` (its HTTP layer and the way hyper closes), and no wait in the test can fix it. A test can only wait for an answer that is coming. Making the test pass would mean accepting "connection broken" as a valid answer, which weakens the check, or no longer sending oversized bodies, which drops the check. Either is the convenient path, so neither was taken.

**Why it matters outside the test.** A real client sending an oversized act can be told "unreachable" (`ClientError::Transport`) instead of "too large". In this library, `ClientError::answered()` counts a transport error as no answer. The cMIP's "When a home counts as unreachable" treats a home as unreachable only when it "fails to answer at all … on at least two attempts". The effect there is small, since two attempts are needed and the identity-record request is also tried. It is still a home that answered being recorded as silent. The cMIP already lists "limits a relay must accept at the least (a rotation under scheme 3 is over 17 KB)" as open, so a large rotation meeting a small limit is not far-fetched.

**What the earlier reports said.** Both earlier records called it a timing race and moved on. Writing it down as a test race would be wrong: the test is not racing anything; the relay is.

## Fixes made

None. The only failure is a relay bug, and the brief says to stop and report. No test race was found, so there was nothing to prove with 50 runs.

## The question for Nobody, allegedly

**When someone sends a relay more than it accepts, must the relay's "too large" answer always reach them?**

- **Yes (recommended).** The relay is fixed so its answer always arrives. When a body is too large, it reads and throws away the rest of it, up to a bound, before closing, and marks the answer `Connection: close` so no client reuses the connection. The cMIP's "every error is answered" then holds, and the test stays as it is. *Stated cost:* a relay reads some junk it will not keep, up to the bound, from whoever sends it. A sender that goes past the bound is cut off as now. This is a library change in `relay/src/http.rs`, for its own session.
- **No.** The cMIP is changed to say that a body larger than the relay's limit may be answered by closing the connection. The test then accepts either answer, and clients treat a closed connection on an oversized upload as "probably too large", not "unreachable". *Stated cost:* the answer is no longer certain, and the unreachable rule has to tell this case apart.

Until this is decided, `too_large` will keep failing now and then on GitHub (about 1 run in 20 under load, rarely alone). A red "Rust workspace" whose only failure is `too_large` with "error sending request" is this bug, not the change being tested.

## How to replay

```
cargo test -p mor-relay --test relay -- --exact too_large
```

Alone it nearly always passes. To see it fail, keep the CPUs busy (for example, run the whole workspace's tests twice at once) and repeat it a few hundred times.

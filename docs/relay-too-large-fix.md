# The relay's "too large" answer: the fix

*12 October 2026. Branch `fix/relay-too-large`, from main at `c78d9ae`. Following the decision of Nobody, allegedly, 12 October 2026, option (a) (findings log, "The relay's 'too large' answer always reaches the sender"; development layer, relay transport cMIP). Background: `docs/flaky-test-hunt.md`. Test identities only. rustc 1.97.0, on a 4-CPU machine.*

## In plain words

**What was wrong.** When someone sent a relay more than it accepts, the relay answered "too large" and hung up while the sender was still sending. The sender's computer, finding the line cut mid-send, could throw away the answer it had not yet read, and report "connection broken" instead. Or the answer got through but nothing in it said the line was finished, so the next request went out on the dead line and failed. On a busy machine this happened about once in a hundred tries, and it made the test `too_large` fail now and then on GitHub.

**What changed.** The relay now keeps reading what the sender sends, throws it away, and only then answers "too large" and hangs up. Its answer now says "this connection is closed", so no client sends its next request on it. The test `too_large` is unchanged, and now passes every time: 300 times out of 300 under load, where unchanged main failed 3 times in 200.

**What it costs.** A relay reads data it will not keep: at most 16 MiB per refused request. Someone who sends more than 16 MiB past what the relay accepts is cut off as before, and may see only a broken connection instead of "too large".

**One line added to the cMIP**, under "Errors" in the relay transport cMIP draft 3, marked as following the decision. Without it, the cMIP's "Every error is answered" would promise more than any relay can keep for a sender past the bound. Two small questions came up (at the end); neither was decided here.

## Precisely

### The bound

A relay reads a body up to its **cap**: its larger limit (act or media) plus 64 KiB, as before. For a body over the cap it now reads on and throws away up to **16 MiB** more (`DISCARD` in `relay/src/http.rs`).

- *Why 16 MiB.* It covers by far any act or sealed container over the default 256 KiB act limit, and a media upload up to 16 MiB over the default 64 MiB media limit: the likely mistakes of an honest client. Per refused request it costs a relay at most a quarter of what one accepted media upload already costs. It is fixed, not proportional to the limits, so an operator raising the media limit does not raise the junk a stranger can make the relay read.
- *Past the bound.* A body declared longer than cap + 16 MiB (by its `Content-Length`) is answered at once, unread; a body without a declared length (chunked) is answered as soon as it passes cap + 16 MiB. Either way the answer is the same error 6 with `Connection: close`, and the connection closes with the rest unread, as before the fix: the sender's system may then throw the answer away. Seen in a throwaway check on a local relay (cap 64 KiB): 15 MiB over, declared or chunked, was answered 413; 17 MiB over with a declared length gave the sender "broken pipe"; 17 MiB chunked happened to get its 413; 40 MiB chunked gave "broken pipe".
- *Within the cap but over a limit* (for example a 300 KiB act to a relay accepting 256 KiB): read whole, as before, and answered error 6 without closing. Nothing is left unread there, so the connection is sound and stays open.

### The code changed

- `relay/src/http.rs`
  - `body(s, b)` replaces the old `body(b)`. The six handlers that read a body (`POST /acts`, `/acts/get`, `/sealed`, `/media`, `/probe`, `/proofs`) now take the raw `Body` and read it frame by frame, counting bytes: kept up to the cap, thrown away past it up to `DISCARD`, then answered.
  - `too_large()`: error 6 (HTTP 413, as reading 8 of the relay README) with the header `Connection: close`. hyper, the HTTP server underneath, closes the connection after sending an answer carrying that header; since the body was read to its end, it closes cleanly and the answer arrives.
  - The `DefaultBodyLimit` layer is gone: it worked only through axum's `Bytes` extractor, which on overflow dropped the body unread and let hyper close mid-send (`hyper-1.11.1`, `proto/h1/conn.rs`, `poll_drain_or_close_read`: the cause found by the flaky hunt). The cap it set is now `body_cap`, the same value. The management page's routes never went through that layer and are untouched.
- `relay/tests/relay.rs`: `too_large` unchanged. One test added, `too_large_closes_the_connection`: a 200,000-byte body to `/acts`, `/media` and `/sealed` is answered 413, `Connection: close`, with error 6 in the body; a 101-byte body to `/media` (over the 100-byte media limit, within the cap) is answered 413 with no `Connection: close`.
- `relay/README.md`: a section "A body too large (12 October 2026)" stating the bound, why, and what happens past it; the `tests/relay.rs` line mentions the new check.
- `cmips/cmip-relay-transport-draft-3.md`: one paragraph under "Errors", after the table, marked "decided by Nobody, allegedly, 12 October 2026": a relay refusing a body as too large reads the rest and throws it away, up to a bound of its own stated in its documentation, before closing, and marks its error 6 with `Connection: close`; cost stated. Draft 3 because draft 2 is approved and draft 3 is the working draft. No other line of `spec/`, `cmips/` or `docs/` was touched.

### The runs

**`too_large` under load**, the flaky hunt's method: the test binary run alone, `--exact too_large`, one run after another, while six busy loops kept the four CPUs full and two loops beside it ran the other relay tests continuously (the rest of `tests/relay.rs`, then `home.rs`, `address.rs`, `manage.rs`, over and over). Same machine, same script, before and after.

| | Runs | Passed | Failed |
|---|---|---|---|
| Before: main at `c78d9ae`, unchanged | 200 | 197 | 3 |
| After: this branch | 300 | 300 | 0 |

The three failures before were the flaky hunt's two kinds: twice `relay.rs:20:18`, "expected an error of the cMIP, got Err(Transport("error sending request for url (…/acts)"))", and once `relay.rs:220:38` (the `/info` request on the dead connection).

**The full workspace**, `cargo test --workspace --locked` (GitHub's step), one run after another on the untouched tree:

| Runs | Clean | Failed | Time per run |
|---|---|---|---|
| 20 | 20 | 0 | 235–259 s, mean 246 |

Every run: 653 passed, 0 failed, 1 ignored (the Lightning regtest), `too_large` and `too_large_closes_the_connection` passing in all 20. (653, not the flaky hunt's 647: main has grown since, and one test is added here.) These ran one after another on an otherwise quiet machine; the load runs above are the ones that showed the bug before.

## What the decision did not foresee

Nothing that changes the decision. Three things for Nobody, allegedly, to see; none was chosen quietly.

1. **The bound is each relay's own.** The cMIP line says "up to a bound of its own stated in its documentation". The decision named a bound but no number, and the transport's limits are themselves still open (the cMIP's "limits a relay must accept at the least", left to the freeze). *Question:* should the cMIP fix a smallest bound every relay must read past its cap (for example 16 MiB), so a client knows how far over it can go and still be told "too large"? Or leave it to each relay, as written now?
2. **A sender past the bound and "unreachable".** A sender cut off past the bound sees no answer. The cMIP's "When a home counts as unreachable" counts a home as unreachable only if "every direct attempt fails to answer at all … on at least two attempts", and a verifier's attempts there are requests for the identity record, which are never large, so the effect is small (the flaky hunt said the same). It matters only to a client that counts a failed upload as an attempt; in this library, `ClientError::answered()` counts a broken connection as no answer. A client can read a relay's limits from `GET /info` before sending. *Question:* should the cMIP say a client SHOULD NOT send a body larger than the relay's stated limits? Not written; the decision accepted the cut-off as its cost, and this would be a new client rule.
3. **Draft 3's header still says "Nothing else changes".** The new paragraph is a second addition to draft 3, but the header's wording was left alone, as asked, while the rename pass runs. It needs a phrase when the header is next edited. Also, `relay/README.md` still says the relay speaks draft 2; unchanged here.

## How to replay

```
cargo test -p mor-relay --test relay -- --exact too_large
cargo test -p mor-relay --test relay -- --exact too_large_closes_the_connection
```

Under load, as above: keep the CPUs busy and run the first a few hundred times.

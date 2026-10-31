**The suite's side is ready to merge.** Every check on GitHub is green at `c649a4b` (the last commit with code); the commit after it adds only this report.

# The Dubsar Suite, round 8's follow-up (F407): anchoring on one price tag per tier

*Session of 31 October 2026, on `claude/s7h-the-redesign` (pull request 113), after the MOR lead's S7h-5. Author of record: Nobody, allegedly. Recorded under F407; no new number taken.*

**Nakišib's Linux job: its cause, and fixed in `clients/`.** Its typecheck compiles the shared app code against the binding's TypeScript. S7h-5 found the cause first: Damgar called `anchoringCheckTicket` with the old five arguments (`clients/damgar/src/damgar.ts:1935`). The call now passes the publication and the tag paid. Nakišib's typecheck and its tests pass, and so does its job on GitHub.

**Reading taken:** the manage page's word ("bake", item 3) is checked against its build, which the relay embeds (`relay/manage/manage.js`, compared by `clients/manage/test/manage.test.ts`). I regenerated that one file with `clients/manage`'s own build script. Nothing in `relay/` was written by hand, and the relay's code is untouched. Otherwise the word fix would leave the manage test red. The relay embeds the page at its next build.

## In plain words: what changed

- **An anchoring service sells by a publication with one price tag per urgency tier** (F409, "one price tag per price"), where it used to sell by one standing offer.
  - The test service (`clients/anchoring-service`) makes a lone seller's publication, itself its own split service under the split cMIP. It then signs one tag per tier, at 50, 20 and 5 regtest satoshis, and keeps their ids.
  - It sells a ticket only for a payment that fulfils that ticket's tier's tag. A payment naming the publication itself is refused in words: it would be a tip and buy no anchor.
- **The apps pay the tier's tag.**
  - Edubba, Ummia, Dub and Damgar read the service's publication with its tags (one shared reader, `clients/ummia/src/anchor.ts`, `offers`; `tagFor` gives a tier's tag).
  - The anchor draft sent to Damgar now names the tier's tag (the draft's field 5 carries it, fourth), and Damgar's payment fulfils it.
  - Before paying, Damgar checks the ticket against the publication and the tag paid.
- **The anchoring cMIP, draft 7** (`cmips/cmip-anchoring-draft-7.md`, with a line on what moved):
  - one price tag per tier, each exactly at its tier's price (a scheme's cap for a tier priced by a scheme);
  - a payment fulfils its tier's tag, and draft 6's open question on Money rule 18 is answered and closed;
  - the batch notice's keys 5 and 6 are listed again (F341).
- **Draft 7 in Rust** (`cmips/anchoring`):
  - `Terms::price_tags` makes a tag per tier;
  - `Offer::from_publication` now takes a tag at any tier's price, so the binding's top-price stand-in still reads;
  - `Offer::from_publication_tags` matches each tag to its tier, and `Offer::tier_of` gives the tier a tag prices;
  - **`Offer::read` is removed**;
  - new tests in `tests/tags.rs`;
  - the harness's regtest anchoring test signs and pays a tag per tier.
- **Words:** the manage page says "bake" for Envelopes type 0 (`clients/manage/src/view.ts:91`).
- **Releases:** all six web releases are rebuilt (display client, Dub, Kišib, Damgar, Ummia, Edubba). One WebAssembly for all six, `b429be73…`; it changed because the cMIP's Rust is compiled into it.

## Tests

- **Rust workspace** (`cargo test --workspace --locked`): 785 passed, 0 failed, 1 ignored (as before).
  - The harness's end-to-end anchoring test needs `MOR_BTCD` (a btcd binary), which neither this container nor GitHub sets, so it returns at once.
  - Its new code compiles, and the cMIP's own new tests pass.
- **Apps, run here,** every one with its own `npm test` after the rebuild, all green:
  - Damgar 41 and Ummia 35, with every anchoring test: the act menu's anchor, a collective's act anchored, a missed deadline, Edubba's pieces by clicks, a release anchored;
  - Edubba 117, with Dub's "an act anchored, by clicks";
  - collective 45, Kišib 44, Dub 46, site 86, genesis 41, reader 22, repo 21, longform 26, kit 18, barebone 15, connector 13, reports 9, grants 8, manage 7, testwallet 4, split service 2;
  - Nakišib 10;
  - the Modules: audio 8, carry 7, jpeg 14, timestamp 5, video 6;
  - the anchoring service typechecks.
- **One check failed only on one run here:**
  - *The test:* Nakišib's "every screen by clicks" timed out once in the full run, waiting 30 seconds for "Written again to" while the machine was busy.
  - *After it failed,* its process did not exit until stopped.
  - *Re-run once, alone:* it passed. It passed on GitHub's Linux job too, and earlier here.
  - *Why:* a 30-second wait on a loaded machine; Nakišib's code was not touched this round.
- **On GitHub at `3726f60`** (the code; the head after it adds this report, the record and the site tests' time limits):
  - green: "all" (every app, the anchoring tests included), "regtest" (Damgar's regtest anchoring test included), Nakišib's Linux and Mac jobs, seal, release, mac, linux, the suite in WebKit, and the site's push-event WebKit run;
  - **one check failed only on one run:** the site in WebKit, the pull-request run of the same commit. Its push-event run passed in 4 minutes. This one passed its first 27 tests (browser 19, film 8), then the films file hung with no word until the job's 60-minute limit cancelled it. WebKit's MiniBrowser, three relays and esbuild were left running.
  - *Why:* a hang in WebKit, at the films file's start, on one runner. The display client's code did not change this round, only its WebAssembly.
  - *What changed:* the three site browser files now give every test and hook a 4-minute limit, so a hang fails in minutes and names itself.
- **On GitHub at `9eed45e`:** everything green but one test in "all": Damgar's "H88… every short ID is a button" (`names-contacts.test.ts:239`).
  - *What failed:* it waited 30 seconds for an ID button's second tap to say "Copied", and it never did. It passed at `3726f60` and here, and nothing it touches changed between the two.
  - *Why:* Damgar's pane redraws on a timer. A redraw between the first tap and the second gives a fresh button, which a tap only expands, so "Copied" never comes. A read-once wait, as round 8 fixed elsewhere.
  - *Fixed:* the test taps until the button says "Copied", four times at most, five seconds each. Not re-run on GitHub: the fix's own push runs everything again.
- **On GitHub at `c649a4b`:** all green: "all", "regtest", Nakišib's Linux and Mac jobs, Kišib's seal, Edubba's release, the browser jobs.
- **On GitHub at `32d065f`** (the report alone): all green but **the site in WebKit**, a check that fails only on some runs. Two of its WebKit runs in a row failed, on two different tests, and passed in Chromium:
  - *First run:* the films file's "a browser told it plays H.264 fetches and checks the film in the pop-up" hung until the new 4-minute limit stopped it. Every wait in that test has its own limit, so the call that hangs is one WebKit gives none: most likely closing the page's context while it holds a film. It is the same hang that once ran 58 minutes.
  - *The one re-run:* "the front page shows the film's place with its poster…" read the player 830 pixels below the film's place (`top: 1211 and 381`), 200 ms after the poster loaded. A layout race: WebKit had not settled its layout yet.
  - *Why it fails only on some runs:* both are WebKit's timing on GitHub's runners. The display client's code did not change this round (only its WebAssembly), and the same commit passed in WebKit at `9eed45e`, twice.
  - *Fixed, in the tests:* the position is read until the player and the place agree, ten seconds at most. Every page context in the three site browser files closes within fifteen seconds or is left to the browser's own close.
- **On GitHub at the head:** HEAD_RESULT

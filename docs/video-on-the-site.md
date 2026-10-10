# A film on dubsar.org's front page (F243)

*Build report, 10 October 2026. Branch `claude/video-module-draft-1`. For Nobody, allegedly. No MIP changes; nothing published; the server untouched.*

## In plain words

You decided that the explainer film plays on dubsar.org's front page, carried by MOR (F243). Three things were missing, and this step builds them.

**1. A rule for what a film is: the video Module, draft 1.** A film is one MP4 file, the kind every phone and editing program writes, with its pictures in H.264 and, if it has sound, its sound in AAC. Every browser and every iPhone plays that. Before anything plays a film, the client reads the file's boxes, without decoding a single picture, and checks that the file is whole, that it holds only pictures and sound (no subtitles, no links, no encryption), that nothing in it points to anywhere outside the file, and that it is within the limits the Module states. If anything fails, the film is not played, and the client says why.

Like a photo, a film from a phone carries more than the film: where it was filmed, when, the device, titles. Before a film is published, it is stripped to the film alone, as pictures already are. Nothing is re-encoded: every compressed picture and sound is copied byte for byte, so the film plays exactly the same. Tests prove it, and ffmpeg, a program independent of ours, agrees.

**2. A rule for films on websites: the website cMIP, draft 4.** A page may now show a film of its own signed version, with a poster picture of its own signed version. Still nothing from anywhere else. Draft 3 stays beside it.

**3. A player in the display client.** On the front page, the film's place shows its poster and a play button. Nothing of the film is downloaded until the visitor presses play: then the display client fetches it, checks that it is exactly what you signed, checks it against the video Module, and plays it, inside the page (not full screen on an iPhone), with its controls, never starting on its own with sound. If the gateway altered the film, it is not played, and the bar says so. If the browser cannot play it, it says so and shows the poster. The page itself is unaffected either way.

**Size.** The homes accept one media object of up to 64 MiB. Locking adds 16 bytes, so **a site accepts a film of at most 67,108,848 bytes** (about 64 MiB), at most ten minutes long, at most 1920 × 1080. Your film, about 23 MB at 1280 × 720, fits. **A longer or sharper film needs the media cMIP that serves one file in parts from many homes**; that is not this step.

**What I need from you:** two things, both below under "Questions". Nothing in the MIPs needed changing.

## Precisely

### What was built

| Where | What |
| --- | --- |
| `modules/module-video-draft-1.md` | The video Module, draft 1, on the JPEG Module's pattern: the media object (rule 1); what a client checks before playing (rules 2 to 9: an MP4 with one index, one H.264 picture track and at most one AAC-LC sound track, which way up, an index that holds together, nothing from elsewhere, limits); stripping before publishing (rule 10, client conformance); playing on the viewer's action, inline, with a poster (rule 11); what a player cannot play (rule 12); a film in a post by reference (rule 13, not built); stated costs; test vectors. |
| `modules/video/` | `mor-video` in TypeScript: `read()` (rules 1 to 9) and `strip()` (rule 10), for Node and the browser; 19 synthetic test films (`scripts/fixtures.py`, ffmpeg's `testsrc` and a sine tone; 488 KB in all); vectors (`vectors/video.json`, `vectors/stripped/`) and `vectors/check.py`, checking them with ffprobe and ffmpeg. |
| `cmips/cmip-website-draft-4.md` | Draft 4 (draft 3 kept): `.mp4` as a fifth kind of file (rule 4); films carry only the film (rule 6a, with the size limit); rule 12 extended to a `video` naming a film of the same version with a `poster` of the same version; rule 12a, how a film is shown, and what happens when it does not match or cannot be played; rule 17 for a film at its own address; two stated costs. |
| `clients/site` | The film as a kind of file (`manifest.ts`); `publish` refuses a film the Module would not play or still carrying more than the film, every reason at once (`publish.ts`); `mor-site strip` strips a film (`cli.ts`); the page's `video` turned into a place for the film, its poster checked with the page (`shell/page.ts`); the player (`shell/film.ts`, new); the bar lists films (`shell/view.ts`); the content security policy lets a film play only from checked bytes (`media-src blob:`, `headers.ts`). |
| CI | `modules/video` in `scripts/test-all.sh` and the tests workflow; `test/film.test.ts` in the WebKit workflow beside the browser test, in WebKit and in Chromium. |

### How the existing checks cover the film

- **SAME** (`mor-site check`, rule 20): the player is part of the display client's `gateway.js`, compared with the release like the rest. Nothing new is served outside it.
- **Served as signed** (rules 8, 10, 18): the gateway fetches and checks the film with every other file before serving a version, and serves it only as bytes at `/_mor/file/film.mp4`. The display client checks those bytes against the work hash and size in the signed manifest before the video Module reads them, and the video Module before the browser plays them. A poster is checked with the page, as every picture.

### Readings (mechanics chosen where F243 and the texts are silent)

Each is built and tested; each can change.

1. **Pictures:** H.264 in `avc1` only (parameter sets in the configuration box), profiles Baseline, Main and High, 4:2:0, 8 bits, progressive, level 4.2 at most. *Other ways:* also `avc3`, interlaced, or High 10. These are the pictures every phone decodes in hardware.
2. **Sound:** AAC-LC only, mono or stereo, at most 48 kHz. *Other way:* HE-AAC too.
3. **Limits:** 67,108,848 bytes, 600 seconds, 1920 × 1080 either way round, 60 pictures a second. The size follows the homes' default; the rest is what every phone made since 2015 plays. *Other ways:* no duration limit (size alone), or 4K.
4. **Strict on boxes:** the Module reads only the boxes it names, and refuses any other, naming it, rather than guess. QuickTime files (`.mov`) and some cameras' files must be remuxed first, without re-encoding (`ffmpeg -i in.mov -c copy -map_metadata -1 out.mp4`). *Other way:* ignore unknown boxes. Stated as a cost.
5. **Metadata:** played but never shown, as for pictures; stripped before publishing: user data and metadata boxes, the place, the dates in the headers, the handler and compressor names, free space, unknown boxes, the object descriptor, and media data no sample uses. Stripping rewrites the file as file type, index, media data (the index first), copying every chunk byte for byte. What an encoder writes inside the compressed stream (x264's settings) stays: removing it would touch the stream. Stated as a cost.
6. **Which way up:** only the four quarter turns in the picture track's matrix; mirrored, scaled or skewed refused; the movie's matrix the identity.
7. **Refused outright:** fragmented files, encrypted tracks, more than one sample description or data reference, a data reference to elsewhere, a URL in the sound's descriptor, a data reference inside metadata, any track but pictures and sound.
8. **Fetched only when play is pressed,** not with the page: a visitor who does not watch pays nothing. *Cost:* if fetching and checking take long, Safari may ask for a second press on play (the first press's permission to play with sound has lapsed); the player then shows its controls and says "Press play". *Other way:* fetch with the page, at 23 MB per visit.
9. **The player lives in the display client's own page, laid over the place the page gave the film,** moving with it. *Why:* the page's frame may run no script, and Safari's own film controls are a script; they would not work inside it. The page decides where the film goes and how wide its place is (by its stylesheet, through the `video`'s class and id, carried to the place); its `autoplay`, `loop`, `muted`, `controls` and `preload` are not the page's to set; `source` and `track` children are dropped (only `src` on the `video` counts).
10. **A poster that does not match fails the page** (like a stylesheet); **a film that does not match fails only the film,** the page staying shown. This departs from the site's reading 5 ("one wrong file fails the whole page") because the film is checked only when play is pressed, after the page is shown.
11. **The place's shape** is the poster's (16:9 without one), so nothing of the film is cropped; a page's stylesheet may still size it.
12. **Before fetching,** the player asks the browser whether it plays H.264 at all, and fetches nothing if not; after checking, it asks about the film's exact codecs.
13. **A film opened at its own address** (`/film.mp4`) is fetched with that address, as every file is (the visitor asked for it), and played on press.
14. **The website cMIP keeps its test value:** draft 4 does not change the manifest's format, so every version already published still verifies. A display client released before draft 4 refuses a version holding a film, as holding a path it does not know (fails visibly). The video Module's own spec hash (for a film published as its own publication, rule 13) is not used by the site, which knows a film by its extension, and is not yet defined in code.
15. **The gateway holds every film whole in memory,** as it holds every file it serves.

### Questions for Nobody, allegedly

- **Q1. Where the film goes on the front page.** Your layout of 7 October says nothing goes under the first act: the first act, then the two shortcuts, then the four sections. The test puts the film after the shortcuts, before the sections, only to test it. The site's own `index.html` is unchanged until you say where.
- **Q2. Approval** of the video Module draft 1 and the website cMIP draft 4, and of the readings above.

### Tests

- `modules/video`: 6 tests (every fixture read or refused as its vector says; the films it plays; each refusal and its rule, and a file over the size limit refused before reading; a matrix that is not a quarter turn; stripping keeps every sample byte for byte, removes everything else, puts the index first, and is stable; 20,000 damaged films each read or refused as not a film, every one read stripping clean). `python3 vectors/check.py`: 19 vectors, 0 failing (ffprobe and ffmpeg agree on codecs, sizes, turns, durations and sound; every stripped film has the same packets and decodes to the same frames, with no tags left).
- `clients/site`: 42 tests, among them `test/film.test.ts` (8 tests, described in `clients/site/README.md`), and the publishing checks and kinds extended in `test/site.test.ts`. Here, Playwright's Chromium plays no H.264, so the path "this browser does not play H.264 films, nothing fetched" was tested, and the check path by telling the browser it plays H.264 (it then checks the film and says its decoder could not). On GitHub, Google Chrome plays H.264 and runs the playing path; WebKit (Safari's engine) runs in the WebKit workflow.
- Before the pull request: rebased on main (`52f74ee`); `cargo test --workspace --locked` and `scripts/test-all.sh`; no existing test vector changed (no file outside `modules/video/vectors/` under any vectors folder differs from main). Results in the last section.

### Not done in this step

- **Not published:** no site version, no film, and the server untouched.
- **The display client is not released.** `clients/site/built/` still holds the released display client without the player; it is rebuilt on GitHub after merging, by a commit whose message contains `[release display client]`, as before. Until then, the CI step comparing a fresh build of the display client with `built/` ("Reproducible build of the display client") is expected to fail on this pull request, as on earlier display-client changes.
- **To publish the film later** (a machine session): see `clients/site/README.md`, "Run a gateway", step 1: strip the film and its poster with `mor-site strip`, add the `video` element where you choose (Q1), publish the next version, and run a gateway whose display client was released with draft 4.
- **A film in a post** (Module rule 13) is specified but not built in the barebone client or the reader.

### Results

Run on this branch after rebasing on main (`52f74ee`), with Rust 1.97.0, wasm-bindgen 0.2.129, Node 22 and Playwright's Chromium:

- `cargo test --workspace --locked`: 585 passed, 0 failed.
- `scripts/test-all.sh`: all passed. clients/barebone 9, collective 40, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, **site 42**, modules/jpeg 14, **modules/video 6**.
- `python3 modules/video/vectors/check.py`: 19 vectors, 0 failing.
- Existing vectors unchanged: no file under any existing vectors folder differs from main, and the JPEG Module's vectors, written again (`npm run vectors`), are the same bytes; so are the video Module's. The core's freeze vectors are checked by the Rust tests above.
- Not run here: the WebKit browser tests (Playwright's WebKit is not installed in this container) and H.264 playback (Playwright's Chromium has no H.264). Both run on GitHub, in the WebKit workflow and with Google Chrome.

## WebKit

On the pull request, the workflow "site in WebKit" failed at "Browser tests in WebKit (Safari's engine)" (runs 38087659086 and 38087639412). The Chromium step passed. The run logs could be read from the session. Playwright's WebKit could not be installed here (its download server is blocked), so the results below come from GitHub.

**What failed.** Three of the eight film tests, the same three in both runs, out of 27 browser tests (24 passed):

- the front page shows the film's place with its poster…;
- pressed, the film is fetched, checked, and played…;
- a film the gateway altered is not played….

In each one, every check about the film passed. The only thing that failed was the last check, "no errors on the page". It found one message: `ResizeObserver loop completed with undelivered notifications.`

**Why.** The display client makes the page's frame as tall as the page, and lays the film's player over its place. Both follow size changes with a ResizeObserver (a browser feature that reports when something changes size). When the poster loads, the film's place takes the poster's shape, so the page grows and the frame is resized. The frame changes size again within the same screen update. WebKit reports this as an error on the page, though the observer's rules deliver the remaining size changes at the next update, so nothing is lost. The first test confirms it in WebKit: the player lies exactly on the film's place, within 1.5 pixels, and that check passed before the error check failed. This is not something Safari cannot do. It is the notice the Safari report of 9 October (`docs/dubsar-org-safari-2026-10-09.md`) already decided not to count. `test/browser.test.ts` has filtered it out since then, but the new `test/film.test.ts` did not.

**What changed.** Only the tests changed, not the display client, and no WebKit test was skipped:

- That rule (`benign`) now lives in `clients/site/test/world.ts`, and `browser.test.ts` and `film.test.ts` both use it. Any other page error still fails a test, in either browser.
- After that push, the "tests" workflow's `clients/site` step failed (run 38088841964): all eight film tests failed before running, because `scripts/build.ts` failed. The site's test files run at the same time. `browser.test.ts`, `site.test.ts` and `film.test.ts` each built the display client into the same `dist/` folder, and a build empties its folder first, so one build could empty `dist/` while another was writing to it. This came from the film tests added in this pull request, and the earlier runs passed by luck. `film.test.ts` now builds the display client into its own temporary folder.

**Results** (commit `dd10b66`):

- WebKit (Safari's engine), on GitHub (run 38089450335, and 38089447460 for the push): 27 tests, 27 passed, 0 failed (19 site tests, 8 film tests).
- Chromium (Google Chrome, which plays H.264), in the same runs: 27 tests, 27 passed, 0 failed.
- "tests" workflow (run 38089450336): every step passed, including `clients/site`, except "Reproducible build of the display client" and the fingerprints step after it. Those are expected to fail until the display client is released (see "Not done in this step").
- In this session: `cargo test --workspace --locked` 585 passed, 0 failed. `scripts/test-all.sh` all passed (site 42, video 6, the other counts as above). `python3 modules/video/vectors/check.py` 19 vectors, 0 failing. No test vector changed.

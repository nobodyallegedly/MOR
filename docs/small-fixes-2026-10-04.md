# Small fixes, 4 October 2026

*A GitHub session. Two small client jobs, each on its own branch. Nothing merged. Nothing in `spec/`, `core/`, the Law or Finance code, or `clients/collective` was touched: another session is rewriting those on `claude/core-pass-v21`. No flaw in a MIP was found.*

## Job 1: MOR Identities (`clients/desk`, `clients/connector`)

Branch `claude/desk-small-fixes`, made from `main`. These are the three small fixes listed at the end of roadmap step 11c's retest.

### What changed, in plain words

1. **New drafts appear even when another window covers the page.** Every few seconds the page asked the program whether new drafts were waiting, but only when the browser said the page was visible. On the Mac, with Claude's window over the browser, the page was counted as hidden, so it stopped asking. Now it asks whether or not the page is visible. It also asks as soon as the browser window is clicked into.
2. **The app restarts a desk program left running from older code.** The desk program keeps running in the background after its page is closed. After a pull, double-clicking MOR Identities used to find the old program still running and open its page, which was the older version. Now the program reports which version of the code it runs: a fingerprint of all its source files, its page and the core library. When the app is double-clicked, it compares that fingerprint with the code on disk. If they differ, it stops the old program, starts a new one and opens the new page. Programs from before this fix report no version at all, so the one now running on the Mac will be restarted on the first double-click.
3. **The README asks you to check the settings backup once by eye.** Both READMEs (connector and desk, at the install step) now ask you to open the saved copy of Claude's settings, `claude_desktop_config.json.before-mor`, and check that it has no `"mor"` entry. If it has one, as on the author's Mac, that copy is not the original. Should Claude's settings ever be restored from it, that entry must be removed first.

### Precisely

- `clients/desk/src/page/app.ts`: `watch()` no longer checks `document.visibilityState`. It also runs on the window's `focus` event.
- `clients/desk/src/version.ts` (new): `version()` bundles the program's two entry points with esbuild to list every local source file the program runs, including those taken from other clients. It hashes them (SHA-256), together with `static/index.html` and `../genesis/wasm/mor_wasm_bg.wasm`.
- `clients/desk/src/server.ts`: the program computes its version at start. `/hello` now gives `pid` and `version`, and `run.json` gains `version`.
- `clients/desk/src/cli.ts`: `open` asks the running program for `/hello`. If the version is missing or differs from the code on disk, it sends that process SIGTERM. It then waits up to ten seconds for the program to stop answering (with a plain error if it does not), and starts a new one as before.
- `clients/connector/README.md` and `clients/desk/README.md`: the check by eye, with the command to show the file. The desk README also lists the new file and the new tests.

### Tests

| Client | Before | Now |
| --- | --- | --- |
| desk | 8 | **10 of 10 pass** |
| connector | 12 | **12 of 12 pass** |

Both clients also pass their type checks. The two new desk tests:
- `test/browser.test.ts`, a second test in headless Chromium. The page is told it is hidden from the moment it loads, as macOS did. A draft prepared by Claude still appears by itself, with "A new draft from Claude arrived". **Run against the old page code, this test fails**, so it reproduces the bug.
- `test/launcher.test.ts`: a stand-in for a pre-fix program (answers `/hello` with no version) is running. `mor-desk open`, run as the app runs it, says it is restarting, stops that process, and starts one whose `/hello` and `run.json` carry the version of the code on disk. Opened again, the same program stays (no restart).

### What a human test on the Mac should check

Before starting, leave MOR Identities running from the old code, as it is now.

1. In Terminal, from the MOR folder: `git fetch origin && git checkout claude/desk-small-fixes`, then `cd clients/desk && npm install`. You do not need to rerun `make-app.sh` or `npm run add-to-claude`: the app and the connector are unchanged.
2. **Restart:** double-click **MOR Identities**. The page opens, paired. Then run `tail -3 ~/mor-desk-launcher.log`: it should say "restarting the program, left running from an older version". Close the page and double-click again: this time there should be no new "restarting" line.
3. **Drafts behind Claude's window:** put Claude's window over the browser, as in the retest, and ask Claude to prepare a post for "Machine, allegedly". Without clicking or refreshing, move Claude aside after about ten seconds: the draft should already be there.
   - Browsers slow down timers on pages they count as hidden, so on a covered page a check can take up to about a minute. Clicking into the browser window checks at once.
   - Say if it ever needs a refresh.
4. **The backup:** follow the new paragraph in `clients/connector/README.md` (step 1) and run the `cat` command it gives. Check that the paragraph is clear. Expected on the author's Mac: a `"mor"` entry is there, as the roadmap noted. Nothing needs changing unless the settings are ever restored from that copy.

## Job 2: the website (`clients/site`, `docs/dubsar.org`)

Branch `claude/step-10a-website`, which is not merged. Commit `c3ccd12`, on top of `e1f120c`.

### What changed, in plain words

1. **A clear button, "MOR in one page"**, on dubsar.org's front page, between the first act and the four doors. I asked Nobody, allegedly, where it should lead. *Decided (4 October 2026):* to the document's act in the reader, with the link a placeholder until the act exists at step 17. The link is `https://reader.dubsar.org/#ONE-PAGE`. It opens in a new tab, apart from the site, as every outside link does. Until step 17 the reader will say the link is not valid. At publishing, `ONE-PAGE` is replaced with the act's id, the same way as `FIRST-ACT` (written in the README's publishing step).
2. **A plain message when the browser blocks WebAssembly.** Before, if the browser offered no WebAssembly, the checker waited for the core library forever and the page kept saying "Loading the core library…". Some privacy settings do this, as do Tor Browser's Safer and Safest levels. Now the bar turns red and says: "This page cannot be checked in this browser, so it is not shown." Under it, opened, it explains:
   - the checker needs WebAssembly to run MOR's core library, which checks who signed the site and each page;
   - some privacy settings and Tor Browser's stricter levels turn it off;
   - how to see the site anyway: allow it (in Tor Browser, the Standard level), use another browser, or check it with `mor-site verify`;
   - nothing from the site is shown unchecked.

   If the core library fails to start for another reason, for example its file could not be fetched, the bar says so and gives the reason. And if it is still loading after twenty seconds, the bar says a slow connection, such as Tor, can take a minute.

### Precisely

- `clients/site/src/shell/cannot.ts` (new, imports nothing): `blocksWasm()`, `cannotCheck(err)` and `stillLoading()`. An error counts as "WebAssembly blocked" in three cases: the `WebAssembly` global is missing, the error is a `CompileError` or `LinkError`, or its message names WebAssembly. Any other error gets the general message with the reason, escaped.
- `clients/site/src/web/core.ts`: before `init`, a missing `WebAssembly` is an error. Any error from `init` is shown by `cannotCheck` and then thrown again, so nothing else runs. A twenty-second timer gives the "still loading" words and is cleared when loading ends.
- `docs/dubsar.org/index.html` and `site.css`: the button (`.one-page a.button`), with a comment saying the link is a placeholder until step 17.
- `clients/site/built/`: rebuilt with `npm run release`. Only `gateway.js` and its work hash in `BUILT-WITH.txt` changed. The WebAssembly rebuilt in this session (rustc 1.97.0, wasm-bindgen 0.2.129, esbuild 0.25.12, the same tools as recorded) is byte for byte the released one.
- `clients/site/README.md`: the new file and tests, and the placeholder at publishing.

### Tests

| Suite | Before | Now |
| --- | --- | --- |
| site (`npm test`) | 25 | **27 of 27 pass** |
| reproducible build (`npm run test:build`) | 2 | **2 of 2 pass**: the display client built from source is the one in `built/` |

The type check passes too. New in `test/browser.test.ts`:
- **The front page shows the button.** It reads "MOR in one page", leads to `https://reader.dubsar.org/#ONE-PAGE` and opens apart from the site. This is added to the existing front-page test.
- **A browser with no WebAssembly** is shown the plain message, and no page. The page loses WebAssembly before anything runs, which is the state Tor Browser's setting leaves. Chromium ignores its own switch for turning WebAssembly off, so the test cannot use it.
- **A core library that cannot be fetched** gives the general message with its reason, and no page.

### What a human test should check

This needs a machine session first. Publish a new version of the site from the Mac, so the front page carries the button (README, "Run a gateway", step 1). Then pull this branch on the server and reload the gateway, so it serves the new display client.

1. On a phone and on the Mac: the front page shows a clear **MOR in one page** button, and every page still says "Verified".
   - Tapping the button opens the reader in a new tab. Until step 17 the reader says the link is not valid; that is expected.
   - Say whether the button's look and place are right.
2. **Tor Browser** on the phone, at `https://dubsar.org` (there is no onion address now):
   - at **Safer**: the red message appears quickly instead of endless loading. Check that its wording is clear;
   - at **Standard**: the site verifies as before;
   - at **Safest**: scripts are off entirely, and the page shows the existing note asking for JavaScript.
3. From another machine with this branch checked out: `npm run -s cli -- check https://dubsar.org` says SAME.

## Left open

Nothing new. The one decision this session needed, where the button leads, was asked and answered (above). The site's wording is still placeholders, as before.

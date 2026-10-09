# dubsar.org in Safari's engine (9 October 2026)

*Report of a GitHub session on roadmap step 10a, after the machine session of 9 October 2026: two faults seen in Safari only, and the first act's opacity, asked for by Nobody, allegedly. Nothing was published and the server was not touched.*

## In plain words

Safari's engine is WebKit. Every browser on an iPhone uses it, Chrome and Firefox included. Two things worked in Chromium but not in WebKit. Both are now fixed and tested in WebKit itself.

- **The photograph sat in a short box that scrolled.** The display client grows the act's frame to the act's height once the act has loaded. It learned that the act had loaded by waiting for an event. WebKit never delivers an event inside a page that may not run scripts, and a site's page may never run scripts. So in Safari the frame stayed at its default height of 150 pixels. Now the display client writes the act into its frame directly and measures it from outside, so it waits for no event.
- **The tab icon did not show.** WebKit looks at a page's icon once, just before the page finishes loading, and never again. The display client set the icon later, once the page had been checked. Now it keeps the page "still loading" until the icon has been checked and set, then lets it finish. The icon is still only the site's own picture, as the bytes the display client checked (website cMIP draft 3, rule 16a). Nothing is fetched from an address.
- **The photograph a little less opaque:** 0.85, set in dubsar.org's own stylesheet, `docs/dubsar.org/site.css`, as `--first-act-opacity`. To change it, edit that one number and publish a new site version. The display client does not need to change. *Stated cost:* the act is shown in its own frame, and a site's stylesheet cannot reach inside it. So the value applies to the whole first act: the photograph, its words, and the act's own "verified" line beneath it. The bar above the page, which says who signed it, is not affected. To fade the photograph alone, the website cMIP would need a new rule that lets a page style the pictures inside an act. That question is left for Nobody, allegedly.

**The display client changed, so it must be released again** before the server is updated (see "For the machine session"). The site itself changed too (`site.css`), so a new version of the site has to be published.

## Precisely

### The act's frame (`clients/site/src/shell/app.ts`, `showActs`)

The cause is in WebKit's source (`JSEventListener::handleEvent`). Before WebKit calls a listener, it asks whether the document holding the event's target may run scripts, and it skips the listener if not. The act's frame lies inside the page's frame, which is sandboxed without `allow-scripts` (rule 11). So the act frame's `load` listener, added by the display client from the top window, never ran in WebKit. Chromium decides by the listener's own window, so it ran there.

The fix:
- The act's frame is put in place without `srcdoc`. Its document is then written at once from the top window (`open`, `write`, `close`).
- It is then sized by `fitFrame`, the same function that sizes the page's frame. `fitFrame` uses a `ResizeObserver` belonging to the top window. An observer's callback is not an event of the framed document, so WebKit runs it. It keeps the frame as tall as the act when the picture loads or a phone turns, capped at 100,000 px as before.
- The act's frame keeps its own sandbox, without scripts.

### The icon (`clients/site/src/shell/hold.ts`, `app.ts`, `cannot.ts`)

The cause is also in WebKit's source. `Document::implicitClose` calls `DocumentLoader::startIconLoading` once, just before the window's load event, and WebKit's own comment says that icons added later are not looked at.

The fix: `hold.ts` runs first, before the core library starts. It adds a hidden, empty frame of the display client's own and opens its document for writing (`document.open`). A window does not finish loading while one of its frames is still being written, so the load event waits. The hold is released, by closing that document and removing the frame, in these cases:
- when the display client's work on the page ends (`main().finally`). By then the page's checked icon is on the tab, or the page has none, or the page is not shown;
- when the checker cannot start (`cannotCheck`);
- after 30 seconds at the most. The page then finishes loading anyway, and WebKit shows no icon.

Rule 16a is kept: the icon is still the `data:` address of the bytes the display client checked, and an icon from elsewhere is still dropped. The gateway's front page (`static/index.html`) is unchanged.

*Stated cost:* while a page is being checked, the browser shows it as still loading, usually for a second or less. On a slow connection such as Tor this can last up to 30 seconds. That is honest, since the page is still being checked, but it is visible.

### Tests (`clients/site/test/browser.test.ts`)

- The browser tests run in WebKit when `MOR_BROWSER=webkit` is set, and in Chromium otherwise.
- New checks:
  - the icon is already set when the window finishes loading, which is the moment WebKit reads it, and the hold is gone afterwards. Removing the hold makes this test fail in Chromium too;
  - the first act is shown at the stylesheet's opacity, which is less than 1. The test reads the value from the stylesheet, so changing the number needs no change to the test;
  - on every page, the display client triggers nothing that the page's sandbox refuses.
- Two changes to how the tests run in WebKit:
  - WebKit writes a console notice when the page's sandbox refuses something. These notices are kept in a list of their own, apart from errors;
  - the door test clicks with a plain mouse click, because Playwright's own click adds listeners inside the page's frame, which WebKit's sandbox refuses.
- WebKit's notice "ResizeObserver loop completed with undelivered notifications" is not counted as an error. The remaining size changes are delivered at the next frame, so nothing is lost.

### The WebKit run on GitHub (`.github/workflows/site-webkit.yml`)

Playwright's WebKit could not be downloaded in this session: its download server is blocked here. So a workflow, "site in WebKit", runs the site's browser tests on GitHub in WebKit, then in Chromium. It runs on every push or pull request that changes the display client, the site, or the code they share, and can also be started by hand.

The runs on branch `claude/tender-lamport-g6aklb`:

| Commit | What | WebKit | Chromium |
| --- | --- | --- | --- |
| `ef4939e` | the new tests, without the fixes | 9 of 14 | 12 of 14 |
| `6c4bc8c` | the fixes | 13 of 14 | 14 of 14 |
| `6a0c23c` | the WebKit-specific test changes | 13 of 14 (a page error not yet sorted) | 14 of 14 |
| PENDING | WebKit's sandbox reports sorted, page errors too | PENDING | PENDING |

The first run reproduced both faults in WebKit:
- the act's frame stayed 150 px tall while the act inside it was 474 px tall, so it scrolled;
- the tab's icon was still the empty placeholder when the window finished loading.

In Chromium, only the new tests of the icon at load and of the opacity failed, as expected without the fixes.

### All the site's tests here (Chromium)

- `npm test` in `clients/site`: **29 of 29 pass** (site 15, browser 14). The typecheck is clean.
- `npm run test:build`: 1 of 2. The core library's WebAssembly, built twice, is the same byte for byte. As in the layout session, the display client built here differs from the released copy in `built/` (`gateway.js differs`). That is expected, because the source changed. The release is rebuilt on GitHub, and the CI step "Reproducible build of the display client" will show this one failure until the release commit lands on `main`.
- No other client changed.

## For the machine session (the Mac)

1. **Release the display client.** Push a commit to `main` whose message contains `[release display client]`, or run the "release display client" workflow by hand.
2. Update the gateway on the server to that release (`clients/site/README.md`, "Run a gateway"). Check it with `mor-site check https://dubsar.org`.
3. Publish a new version of the site from `docs/dubsar.org/`, because `site.css` changed. Set `--previous` to the version now served, `08fffaef…ee87`, and replace `FIRST-ACT` with the first act's id, as before.
4. Check again on an iPhone and in Safari on the Mac, in light and dark:
   - the photograph is shown whole, with no box scrolling inside the page;
   - the KI icon is on the tab;
   - the first act is a little less opaque.

# dubsar.org: the first screen, option B (9 October 2026)

*Report of a GitHub session on roadmap step 10a, building option B, decided by Nobody, allegedly, on 9 October 2026. Nothing was released or published, and the server was not touched.*

## In plain words

The photograph of the Earth stays as it was decided on 7 October: whole, as wide as the act. Nothing caps its height.

The room on a phone's first screen now comes from two other things:

- **The checking bar is slimmer on a phone.** Its top line used to take three lines: *"Verified: this page is exactly what was signed by the identity this gateway names as Nobody, allegedly. Checked in this browser."* On a phone it now says only **"Verified: signed by Nobody, allegedly"**, on one line. Under it, *"Who signed it, and how to check"* is unchanged, and opens on exactly what it opened on before: the signer's whole fingerprint, whose identity it is, the version, the acts shown and how to check without this gateway. On a computer screen the bar is as before.
- **The two shortcuts sit side by side**, not one above the other. On a phone, "Thank you for the shower" wraps onto two lines inside its button, so both buttons are the same size.

Below the shortcuts, the band from the earlier session stays: a soft gradient behind the four sections, never over their words, made from the page's own light and dark colours.

**What it gives, on a phone 390 × 844:** the bar, the whole photograph, both shortcuts, and **Read** with its first line, all on the first screen. Before, Read began at the very bottom edge and its name was cut off.

**What it does not give:**

- **As Safari leaves an iPhone's screen (about 390 × 664, an estimate):** the photograph is whole, but the shortcuts are cut by the bottom edge (they start at 627 pixels and end at 692), and Read is below the screen. See question 1.
- **A phone held sideways (844 × 390):** the photograph, whole and as wide as the act, is 654 pixels tall on a screen 390 tall, so only the bar and the top of the act show. The decision of 9 October accepted a band showing only the shortcuts on a short screen; here not even the shortcuts show. See question 2.

**For every site, not only dubsar.org.** The checking bar belongs to the display client, which is the same for every site. So on every site served by a gateway running this display client, on a phone (a screen narrower than 640 pixels, or shorter than 480 pixels), the bar's top line becomes "Verified: signed by" and the name the gateway gives the site's owner in its settings. It changes only once the page verified: while checking, and when something fails, the bar says what it says today, in full. Everything under "Who signed it, and how to check" is unchanged on every site.

**The WebAssembly did not change.** No Rust and no WebAssembly source was touched. Only the display client's TypeScript changed (`view.ts`, `app.ts`), so the display client must be released again. *Already the case before this session:* the WebAssembly on `main` is newer than the released copy in `clients/site/built/`, from F190 (merged earlier today, release waiting for this session), so the one release covers both.

## Screenshots

Taken here in Chromium (the browser in this session's container; WebKit cannot be downloaded here), through the real gateway, display client, homes and relay, by `clients/site/scripts/first-screen.ts`. The photograph is a square stand-in for the Earth's, as large as the real one (2400 × 2400). They are in `docs/first-screen-b/`:

| | Light | Dark |
| --- | --- | --- |
| Phone, 390 × 844 | [light](first-screen-b/first-screen-chromium-upright-light.png) | [dark](first-screen-b/first-screen-chromium-upright-dark.png) |
| As Safari leaves it, 390 × 664 | [light](first-screen-b/first-screen-chromium-upright-safari-bars-light.png) | [dark](first-screen-b/first-screen-chromium-upright-safari-bars-dark.png) |
| Held sideways, 844 × 390 | [light](first-screen-b/first-screen-chromium-sideways-light.png) | |

Where each part sits, in pixels from the top, is in `first-screen-b/first-screen-chromium.json`. On 390 × 844, before and after (Chromium):

| | Before (main) | After (option B) |
| --- | --- | --- |
| The checking bar ends at | 106 | 63 |
| The first act (photograph 324 × 324) | 148 to 646 | 105 to 603 |
| The shortcuts | 670 to 782, stacked | 627 to 692, side by side |
| Read begins at | 806 (its name cut off) | 716 (name and first line shown) |

*Fonts differ:* Chromium on Linux has no Apple fonts, so on an iPhone the words will be set a little differently and the heights a few pixels off. WebKit, Safari's engine, runs the browser tests (the new one included) on GitHub, in the existing "site in WebKit" workflow.

## Precisely

### The display client (`clients/site/src/shell/`), the same for every site

- `view.ts`: `BarState` gains `brief`, the top sentence said briefly, or null. `bar()` writes it, when there is one, as `#mor-brief` before the full sentence `#mor-standing`. Its stylesheet hides `#mor-brief` by default, and on `(max-width:40em), (max-height:30em)` shows it and hides the full sentence after it. The `details` block, "Who signed it, and how to check", is unchanged. `briefWords(settings)` gives `Verified: signed by ${settings.name}`.
- `app.ts`: `brief` is set with `verifiedWords` wherever a file verified (a page, a picture, a text file), and cleared by `fail()`. While checking it is null, so the full sentence shows on every screen.
- Each screen shows one of the two sentences, so a screen reader reads one.

### The site (`docs/dubsar.org/site.css`)

- Taken from the band branch (`claude/jolly-dijkstra-nokr3v`, `f72f51a`), adapted: `--band`, the text's colour mixed 12% into the page's colour; `.doors` as wide as the screen on a phone, on a gradient from the page's colour to `--band` over the first 8em; the section boxes see-through (`background:transparent`), so the gradient is behind their words; no space under the shortcuts, so the gradient starts right below them. Its comment no longer speaks of a picture share.
- New: `.shortcuts` no longer wraps; each `.button` centres its words. Under 32em wide, the two buttons share the width equally (`flex:1 1 0`), with less padding and 16-pixel words, so the longer one wraps inside its button.
- `index.html` is unchanged.

### Not taken from the band branch

The height cap in the display client (`PICTURE_SHARE`, the screen probe and `--mor-screen`), the test that required it, and its workflow `.github/workflows/site-first-screen.yml`, which had write permission. No workflow was added or changed.

### Tests

- New browser test (`clients/site/test/browser.test.ts`), at 390 × 844 in light and dark, with a large square photograph: the photograph spans the act's width and keeps its proportions (whole, never cropped, the act's frame not scrolling); both shortcuts whole on the first screen, side by side; Read's first line on the first screen, below them; a gradient behind the sections, their boxes drawing nothing over it; the brief line shown, "Verified: signed by Nobody, allegedly", the full sentence hidden; "Who signed it, and how to check" opening on the whole fingerprint, "The identity this gateway names as Nobody, allegedly. The name is the gateway's setting", the version and the act shown. Checked to fail with the old `site.css` (the shortcuts stacked).
- New browser test: on a wide screen (1280 × 800) the bar keeps its whole sentence, and the brief one is hidden.
- The earlier tests are unchanged and pass, among them the photograph scaling to the width, whole, at 390 and 1280.
- Here (Chromium): `npm test` in `clients/site`, **31 of 31 pass** (site 15, browser 16). The typecheck is clean.
- `npm run test:build`: **1 of 2, as on `main` before this session.** The WebAssembly built twice is the same, byte for byte. The second test compares the build with the released copy in `built/`: on `main` it already failed (`mor_wasm_bg.wasm differs`, from F190); now `gateway.js` differs too. Both go when the display client is released, which this session does not do.
- On GitHub: the results of "test" and "site in WebKit" on this branch are given in the session's last message; this report is written before they run.

## Questions for Nobody, allegedly

1. **On an iPhone with Safari's bars (about 390 × 664), the shortcuts are cut at the bottom and Read does not show.** The photograph cannot shrink (option B), and the bar is down to two short lines. What else takes the height, from the top: the bar (63 pixels), the space between the bar and the act (42), the act's own lines around its picture (its signer and id, its words, the picture's line, "Plain text": about 174 pixels together), the picture (324). The act's lines are the reader's way of showing any act, on every site. Should anything more give way on a phone, and which, or is the first screen at 390 × 844 enough? Not chosen here.
2. **Held sideways, nothing of the band shows**, since the whole photograph at the act's width is taller than the screen. The decision accepted the shortcuts alone on a short screen. Is this acceptable as it is, or should something be done for a phone held sideways? Not chosen here.

**One reading, kept within rule 9, for Nobody, allegedly, to confirm.** The brief line follows the example given: "Verified: signed by Nobody, allegedly". The full sentence says "the identity *this gateway names as* Nobody, allegedly", because the name is the gateway's setting, a hint (rule 21). The brief line drops those words. Rule 9 is kept as written: "Verified" says in plain words that the version verified, and is shown only when the signer is the identity expected; the whole fingerprint, whether the signer is the identity expected (with "The name is the gateway's setting") and the version are under "Who signed it, and how to check", one tap away, exactly as before. If the brief line should keep the hedge, it could say "Verified: signed by the identity named Nobody, allegedly", likely two lines on a phone.

## For the machine session (the Mac)

1. Release the display client: push a commit to `main` whose message contains `[release display client]`, or run the "release display client" workflow by hand. This release also carries F190's WebAssembly.
2. Update the gateway on the server to that release (`clients/site/README.md`, "Run a gateway"), the Mac's own WebAssembly rebuilt first, as last time. Check with `mor-site check https://dubsar.org`.
3. Publish a new version of the site from `docs/dubsar.org/`, since `site.css` changed: `--previous` the version now served, `c60c8748…c17a`, and `FIRST-ACT` replaced by the first act's id, as before.
4. Check on an iPhone, upright and sideways, in light and dark: the photograph whole at the act's width; the bar's brief line, and "Who signed it, and how to check" opening as before; the shortcuts side by side; Read and the gradient behind the sections.

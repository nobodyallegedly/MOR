# dubsar.org: the band at the bottom of the first screen (9 October 2026)

*Report of a GitHub session on roadmap step 10a, building what Nobody, allegedly, decided on 9 October 2026: the first screen of the front page ends in a broadish band. Nothing was released or published, and the server was not touched.*

## In plain words

The first act's photograph is now less tall, and still whole: never cropped, and nothing scrolls inside the page. This makes room for a band at the bottom of the first screen. At the top of the band sit the two shortcuts, *MOR in one page* and *Thank you for the shower*. Below them a soft gradient begins, and the four sections sit on it. On a phone, the first line of the sections, **Read**, shows through at the bottom of the screen and invites the scroll.

The gradient is a background, behind the sections. Nothing is drawn over their words. It is made from the page's own two colours, white and near-black, with a little of the text's colour mixed in, so it is right in light and in dark.

**To choose by looking.** The photograph's height is one number: the most of the screen's height the photograph may take. The screenshots show three values: **20%, 25% and 30%**. The page is set to the middle one, 25%, until Nobody, allegedly, chooses.

The task's own examples were 65%, 72% and 80%. Those would change nothing. A square photograph like the Earth's is only about 38% of a 390 × 844 phone screen tall already. Most of the first screen goes to other things: the checking bar and the space under it (about 165 pixels in WebKit), the act's own lines above and below the picture (about 175), and the two shortcuts, which sit one above the other on a phone (about 125). So the values that make a difference are lower. *The real photograph's shape is not in the repository; the screenshots use a square stand-in of the same size. If the real one is taller than it is wide, the same value gives a narrower picture, not a taller one.*

**One thing to know before choosing.** A 390 × 844 screenshot shows the whole screen of the phone. Safari on an iPhone keeps part of it for its own bars, which leaves about 390 × 664 for the page. That figure is an estimate, not measured here. So each value is also shown at that size: at that size, in WebKit, 20% shows both shortcuts whole and the top of the first section, its name cut by the bottom edge; 25% shows both shortcuts whole, with the sections starting just below the screen; at 30% the second shortcut is cut at the bottom (it ends at 688 pixels on a 664-pixel screen).

**The display client changed.** The page's own stylesheet could not do this alone, for two reasons:

- The photograph is inside the act's own frame, which the site's stylesheet may not reach (website cMIP, rule 13: an act is shown apart from the page's styles).
- Inside the page's frame, "the screen's height" is not known. The frame is made as tall as the whole page so that nothing scrolls inside it. To the page, the "screen" is therefore the whole page.

So the display client now measures the screen's height in its own window. It gives that height to each act's frame, and caps the act's picture at a share of it. **The WebAssembly did not change**: no Rust and no WebAssembly source was touched. Only the display client's TypeScript changed, so the display client must be released again before the gateway is updated. The band itself, the shortcuts' place and the gradient, is in the site's own `site.css`.

## Screenshots (WebKit, Safari's engine)

Taken in WebKit on GitHub, through the real gateway, display client, homes and relay, by `clients/site/scripts/first-screen.ts`. They are in `docs/first-screen-webkit/`, committed by the workflow "site first screen in WebKit" (`.github/workflows/site-first-screen.yml`), since WebKit cannot be downloaded in this session's container, nor GitHub's stored artifacts read from it.

| Share of the screen's height | Phone, 390 × 844, light | Phone, 390 × 844, dark | As Safari leaves it, about 390 × 664, light |
| --- | --- | --- | --- |
| 20% | [light](first-screen-webkit/first-screen-webkit-upright-light-20.png) | [dark](first-screen-webkit/first-screen-webkit-upright-dark-20.png) | [Safari's bars](first-screen-webkit/first-screen-webkit-upright-safari-bars-light-20.png) |
| **25% (set now)** | [light](first-screen-webkit/first-screen-webkit-upright-light-25.png) | [dark](first-screen-webkit/first-screen-webkit-upright-dark-25.png) | [Safari's bars](first-screen-webkit/first-screen-webkit-upright-safari-bars-light-25.png) |
| 30% | [light](first-screen-webkit/first-screen-webkit-upright-light-30.png) | [dark](first-screen-webkit/first-screen-webkit-upright-dark-30.png) | [Safari's bars](first-screen-webkit/first-screen-webkit-upright-safari-bars-light-30.png) |

The phone held sideways (844 × 390, at 25%): [sideways](first-screen-webkit/first-screen-webkit-sideways-light-25.png). **Less than what was accepted:** the decision accepted a band showing only the shortcuts. Held sideways, even the shortcuts fall just below the first screen: they start at 396 pixels on a screen 390 pixels tall. The checking bar and the act's own lines take most of the height, and the picture is already only 98 pixels tall. See question 5.

Where each part sits, in pixels from the top, is in `first-screen-webkit.json` beside the pictures.

**To set the chosen value:** change `PICTURE_SHARE` in `clients/site/src/shell/view.ts` (for example `0.2`), then release the display client. The site's own files do not need to change for it.

## Precisely

### The display client (`clients/site/src/shell/`)

- `view.ts`: `PICTURE_SHARE = 0.25`, one value. Inside an act's frame, the picture is `width:100%; max-height: calc(var(--mor-screen) * var(--mor-picture-share)); object-fit: contain`. It is still as wide as the act's box, but never taller than its share of the screen. When the cap applies, the picture is scaled down whole and centred, with the page's colour on either side, and never cropped (`contain`). The top window gains a hidden, fixed probe, `#mor-screen`, `100svh` tall.
- `app.ts`: the screen's height is read from the probe and set on each act frame's root as `--mor-screen`. It is set when the act is written into its frame, and again whenever the probe's size changes, for example when a phone turns. The observer belongs to the top window, as `fitFrame`'s does, so WebKit runs it. The value is set through the style object, which the content security policy allows; no `style` attribute is written.
- *Why `svh`:* the small viewport is the screen as first seen, with the browser's bars showing. Safari's bars hide on scrolling, and with `vh` the picture would change size as they did.
- *Stated cost:* the cap belongs to the display client, so it applies to every act's picture on every site, not only to dubsar.org's first act. On a desktop window 800 pixels tall, an act's picture is at most 200 pixels tall at 25%. This sits beside the earlier stated cost that a small picture in an act is scaled up to the box's width.

### The site (`docs/dubsar.org/site.css`)

- `--band`: the text's colour mixed 12% into the page's colour (`color-mix`), so it follows light and dark by itself.
- `.shortcuts`: no space below them, so the gradient starts right under the shortcuts.
- `.doors`: as wide as the screen on a phone (the page's side margins pulled in), with a background going from the page's colour to `--band` over the first 8em, then staying at `--band`. The section boxes have no background of their own, so the gradient is behind their words and never over them.
- `index.html` is unchanged.

### Tests

- New browser test (`clients/site/test/browser.test.ts`), at 390 × 844 in light and dark, with a large square photograph:
  - the picture is fitted whole (`contain`, the whole picture inside its box), and the act's frame does not scroll;
  - the picture is no taller than `PICTURE_SHARE` of the screen;
  - both shortcuts are whole on the first screen;
  - the first section's first line is on the first screen;
  - the band, from the shortcuts' top down, is at least a quarter of the screen. This is the test's reading of "broadish". With the cap removed, the test fails: the band is then 197 of 844 pixels;
  - there is a gradient behind the sections, and their boxes draw nothing over it.
- Here (Chromium): `npm test` in `clients/site`, **30 of 30 pass** (site 15, browser 15). The typecheck is clean.
- `npm run test:build`: 1 of 2, as in the two sessions before. The core library's WebAssembly, built twice, is the same byte for byte. The display client differs from the released copy in `built/` (`gateway.js differs`), as expected: its source changed. The CI step "Reproducible build of the display client" will show this one failure until the release commit lands on `main`.
- On GitHub, the workflow "site in WebKit" runs the browser tests in WebKit and in Chromium, and now also takes the screenshots in WebKit and keeps them as an artifact (`first-screen-webkit`). The result for this branch is below.

**On GitHub,** run 7 of "site in WebKit" on this branch (commit `f72f51a`): WebKit, Safari's engine: **15 of 15 pass**, the new test included. Chromium: **15 of 15 pass**. The screenshots were taken in WebKit in the same run. The same pictures were then committed by the workflow "site first screen in WebKit", because the stored artifact could not be read from this session.

## Questions for Nobody, allegedly

1. **Which value:** 20%, 25% or 30%? The 25% set now is only the middle one shown.
2. **Should the value be the site's rather than the display client's?** As built, it is the display client's, the same for every site, because a page may not style what is inside an act (rule 13). If each site should set it for its own acts, the website cMIP needs a rule letting a page set how tall an act's picture may be. That is the same kind of question the Safari session left open about fading the photograph alone. Not chosen here.
3. **"The first line of the four sections":** on a phone the four sections sit one above the other, so the band shows the first one, *Read*, and the top of the gradient. If the four names were all meant to show in the band, the sections would need a different arrangement on phones, for example two by two. That was not decided, so it was not built.
4. **On a real iPhone the band is narrow.** With Safari's bars, the checking bar and the act's own lines take most of the screen, so even at 20% the band shows the shortcuts and only the top of the first section. Two things would give it more room, and neither is decided: a shorter checking bar on phones (it is three lines of text now), or the two shortcuts side by side.

5. **Sideways, the band does not show.** Making the shortcuts reach the first screen held sideways would take less height for the checking bar or the act's own lines, or a smaller share for the photograph on short screens only. None of that was decided, so none of it was built.

## For the machine session (the Mac)

1. Once a value is chosen, set `PICTURE_SHARE` if it is not 25%. Then release the display client: push a commit to `main` whose message contains `[release display client]`, or run the "release display client" workflow by hand.
2. Update the gateway on the server to that release (`clients/site/README.md`, "Run a gateway"). Check with `mor-site check https://dubsar.org`.
3. Publish a new version of the site from `docs/dubsar.org/`, because `site.css` changed. Set `--previous` to the version now served, `c60c8748…c17a`, and replace `FIRST-ACT` with the first act's id, as before.
4. Check on an iPhone, upright and sideways, in light and dark: the photograph whole, the shortcuts at the top of the band, the gradient behind the sections.

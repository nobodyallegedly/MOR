# The dubsar.org layout, built (8 October 2026)

*Report of a GitHub session on roadmap step 10a: the layout decided by Nobody, allegedly, on 7 October 2026. Nothing was published and the server was not touched: publishing the site and updating the server are a later machine session on the Mac.*

## In plain words

The front page now opens on the first act. Its photograph is as wide as the page and shown whole. Under it are the two shortcuts, *MOR in one page* and *Thank you for the shower*, then the four sections, and nothing else. Each section has a page with its line and its list: **Read** for the documents that are not technical, **Build** for the technical ones, **Run** for relays and the tools to run them, **Use** for the other clients. Every page ends with the same footer: the email address, the link to send a sealed message through the reader, and below them, as the very last thing, the clay tablet. The browser tab shows the KI icon.

Two things needed more than the pages:

- **The marks are SVG drawings, and a site may hold only JPEG pictures.** Asked and decided (Nobody, allegedly, 8 October 2026): the site holds JPEG copies. A JPEG cannot be see-through, so the tablet is drawn twice, once on the page's light colour and once on its dark colour, and the stylesheet shows the right one. The page's colours are therefore now fixed (white, and #121212 in dark) instead of following the browser's own. A site also had no way to name a tab icon. The website cMIP gains one rule for that, in draft 3.
- **The photograph sat in a box that scrolled on its own.** The picture itself was already scaled to fit. But the whole page was shown in a frame under the checking bar, and that frame scrolled separately from the browser window. The display client now makes the frame as tall as the page, so the browser's ordinary scrolling is the only scrolling. Without that, Safari on a phone can widen a frame to fit its contents.

**The display client changed, so it must be released again** before the server update (see "For the machine session").

## Precisely

### The pages (`docs/dubsar.org/`)

- `index.html`: the first act (`<mor-act act="FIRST-ACT">`), nothing under it; the shortcuts `#one-page` (`https://reader.dubsar.org/#ONE-PAGE`) and `#shower-text` (`https://reader.dubsar.org/#SHOWER-TEXT`), both placeholders until step 17; the four doors, each with its line.
- `read.html`, `build.html`, `run.html`, `use.html`: each with its line and its list, taken from `docs/README.md`, `spec/`, `cmips/`, `modules/` and `clients/`. One note per page says that the items will lead to their acts in the reader once they are published at step 17. The links that already exist stay: the code repository and the reader.
  - Read: MOR in one page, the full shower text, the fourteen case studies by title, the two companions.
  - Build: the core document, the six MIPs, the freeze test suite and report, the findings, the five cMIPs, the founding Modules, the paper and its review, the rule-to-code audit, the independent verifier, the adversarial test plan, the build brief and roadmap, the session reports, the code repository, the test vectors, the harness.
  - Run: the Run guide, `mor-relay`, the management page, the site gateway, the three homes.
  - Use: the reader, MOR Identities (the desk), the genesis, barebone, long-form, collective and repo clients, the connector for Claude, the offline signer, publishing and checking a site.
- The footer, on every page: `nobodyallegedly@dubsar.org` (a `mailto:` link) and "A sealed message, through the reader" (`https://reader.dubsar.org/`, whose front page carries the message form); then the tablet, 240 px wide.
- `site.css`: the page's colours fixed in light and dark, matching the colours the tablet JPEGs are drawn on; the tablet copy for the other colour hidden.
- `tablet-light.jpg`, `tablet-dark.jpg` (720 × 160) and `icon.jpg` (64 × 64): made by `clients/site/scripts/marks.ts` from the SVGs, rendered by Chromium and stripped to the picture alone. The SVGs moved to `docs/marks/`, out of the site folder. *Found:* the commit that put them in `docs/dubsar.org/marks/` broke the site tests, since `mor-site publish` refuses them and every test stalled at setup.
- **Drafted wording, for Nobody, allegedly, to redo:** the four lines, the list items' short descriptions and the footer's link text. *(Final drafts by the author, build brief.)*

### The display client (`clients/site/src/shell/`)

- `view.ts`, `app.ts`: **no inner scrolling.** The page's frame is sized to the page's height whenever the page changes (when an act appears, or a phone turns). The browser window scrolls; the bar scrolls away with the page and is never covered by it. The size is capped at 100,000 px, so a page whose height follows its frame cannot keep growing it. Both frames are `width:1px;min-width:100%`, which stops Safari on phones from widening a frame to fit its content.
- `view.ts`: inside an act's frame, the picture is `width:100%`, so the first act's photograph spans the act's box, whole. *Stated cost:* a small picture in any act shown on any site is scaled up too. The decision asked for the page's width.
- `page.ts`, `app.ts`: **the icon** (cMIP draft 3, rule 16a). The first `link rel="icon"` naming one of the site's own pictures is kept as checked bytes and set on the tab as a `data:` address. A picture that does not match fails the page, as a stylesheet does. Any other icon link is dropped, so an icon from elsewhere is never loaded.
- **When the checker cannot run** (roadmap, onion check): already built and tested before this session (`cannot.ts`, `web/core.ts`). A browser without WebAssembly, such as Tor Browser at its Safer level, is told on the bar that the page cannot be checked there, why, and how to see it another way, and nothing from the site is shown. If the core library fails to start for another reason, the bar gives that reason. After twenty seconds still loading, the bar says that a slow connection such as Tor can take a minute. At the Safest level no script runs at all; the page's `noscript` note then says why. Checked again in this session (browser tests).

### The website cMIP, draft 3 (`cmips/cmip-website-draft-3.md`)

Draft 3 is draft 2 plus rule 16a (a page's icon: one of the site's own pictures, shown only as checked bytes), with rule 12 naming it. The manifest is unchanged, so the spec's test value stays draft 2's (`clients/site/src/specs.ts`) and versions already published still verify. Draft 2 is kept beside it. Not approved.

### Checked

In headless Chromium, through the real gateway and display client, every page was checked at phone width (390 px) and on a desktop (1280 px), in light and dark: no console errors, no horizontal scroll, the icon set. A large photograph (2400 × 2400) fills the act's width on both, and the window scrolls to the footer.

The icon was checked at 16 px against a light and a dark tab strip: the KI reads. *Stated cost:* a JPEG icon is a solid square. Its cut-out sign is drawn in the light colour, and its rounded corners show a few light pixels on a dark tab.

### Tests

- `npm test` in `clients/site`: **29 of 29 pass** (site 15, browser 14). New in the browser tests:
  - the large photograph scaled to the width it has, whole, with neither frame scrolling, at 390 and 1280 px;
  - the footer of every page, in light and dark: only the two links, then the tablet as the last thing, at least 120 px wide, the copy drawn on the page's colour, and the tab's icon equal to `icon.jpg`;
  - the front page's order (first act, shortcuts, doors) and both shortcuts;
  - the hostile page's icon from elsewhere neither loaded nor set.

  The file counts in `site.test.ts` follow the three new pictures.
- `npm run test:build`: 1 of 2. The core library's WebAssembly, built in two folders, is the same byte for byte (passes). The display client, built twice, is the same both times, but no longer the same as the released copy in `built/` (`gateway.js differs`). That is expected: the source changed, and the release is rebuilt on GitHub, not here. The CI step "Reproducible build of the display client" will show this one failure on this branch until the release commit lands on `main`. It is not a fault in the build.
- No other client changed.

## For the machine session (the Mac)

1. **Release the display client first.** Push a commit to `main` whose message contains `[release display client]`, or run the "release display client" workflow by hand. GitHub rebuilds `clients/site/built/` and commits it.
2. Update the gateway on the server to that release (`clients/site/README.md`, "Run a gateway").
3. Publish a new version of the site from `docs/dubsar.org/` with `--previous` set to the version now served, replacing `FIRST-ACT` with the first act's id (a test post's id until step 17). `ONE-PAGE` and `SHOWER-TEXT` stay until their acts exist. Check with `mor-site check https://dubsar.org` and on a phone, in light and dark.
4. Still open from the roadmap: the tablet published as a signed act of its own, like the Earth photograph.

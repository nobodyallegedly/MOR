# Two more films on dubsar.org's front page

*Build report, 12 October 2026. Branch `claude/site-more-films`, from main at `2e69614`. For Nobody, allegedly. One roadmap step: the site client and the website cMIP. No MIP changed, nothing in `spec/` touched; nothing published; the server untouched. Built and tested with small synthetic films only (ffmpeg's test pattern and a tone, from `modules/video/test/fixtures/`); the masters go in when the site is published from the Mac.*

## In plain words

You asked for two small buttons under the film, "MOR use cases" and "The unwritten layer", each opening its film in a pop-up. That is built.

**What a visitor sees.** Under the main film, two small buttons, side by side. Pressing one darkens the page and plays that film on top of it, in the same player as the main film and under the same rules: the film is downloaded only now, checked against exactly what you signed, played inside the page on an iPhone (not full screen unless the visitor asks), and never starts talking by itself. Pressing the button counts as asking to play, so there is no second press. The pop-up closes with a "✕ Close" button, the Escape key, or a tap anywhere outside the film. Closing it stops the film. It works on a phone: the buttons fit side by side, the film fits the screen, and the close button is big enough for a thumb. Each button is shown only if its film is in the version you published. So the site can go out before, with, or without either film, and nothing breaks.

**What you run.** One new command, `mor-site films`, puts the films into the site's folder before you publish. You give it the main film and the two others, each with its poster picture and, for the two buttons, its label. It checks each film against the video Module's limits (size, length, picture size), strips everything that is not the film, and does the same for each poster. It writes them into the folder and writes the few lines the front page needs. If anything is wrong, it writes nothing and lists every problem at once. The exact commands for the Mac are in the last section.

**The rule.** The website cMIP draft 5 (draft 4 stays beside it) says a page may show several films, each from its own signed version, each with a poster from its own version, nothing from elsewhere. One film is shown in the page, the main one; the others are listed, each under a short label.

**One thing must happen before the films go out:** the display client (the checking code the gateway serves) has to be released with this change, and the gateway updated to it, *before* the version with the films is published. A gateway still running today's release would show the two labels as plain words, with no buttons. The main film would still play.

**What I need from you:** no decision. Nothing in a MIP or a cMIP turned out to be wrong. The readings below are mine, under the delegation of mechanics; each can change. One thing to look at on your phone once the films are published is noted under "To check".

## Precisely

### What changed

| Where | What |
| --- | --- |
| `cmips/cmip-website-draft-5.md` (new; draft 4 kept) | Rule 12b, **films listed**: a `mor-film` element naming a film of the same version (and optionally a poster of the same version) lists that film under its label (the element's text); the display client shows it as a small button in that place, which plays the film over the page under every rule of 12a; a `mor-film` naming anything else is dropped, label and all. Rules 12 and 17 name it; two stated costs (each listed film's poster is fetched with the page; a draft 4 display client shows the label as plain words). Manifest unchanged. |
| `clients/site/src/shell/page.ts` | A `mor-film` naming a film of the version becomes a place holding its label; any other `mor-film` goes. Posters are checked with the page, as for the main film. A place the page made itself gets nothing. |
| `clients/site/src/shell/popup.ts` (new) | The pop-up: in the display client's own page (the page's frame may run no script), a dialog with the label, a close control and the existing player. It closes on the control, Escape, or a press outside; it stops the film (paused, its bytes let go), keeps the focus inside while open, returns it to the button, and pauses any other film when it opens. |
| `clients/site/src/shell/film.ts` | The player can start at once (the press that opened the pop-up is the ask) and can be stopped; a stop during the fetch cancels it, and nothing plays later. |
| `clients/site/src/shell/app.ts`, `view.ts` | Each listed film's button laid over its place, moving with it, like the main film's player. The bar lists each listed film with its label and state. Styles for the button, the pop-up and the default look of the place. |
| `clients/site/src/films.ts` (new), `cli.ts` | `mor-site films`: checks, strips and places the films and posters under `films/`, and writes the page's block between its two marks. |
| `docs/dubsar.org/index.html`, `site.css` | The front page holds the two marks, empty, at the top of the sections (F243's place): published as it is, the page is unchanged. The look of the films block once filled: the main film at the page's width, on the band's gradient; the two buttons under it, small, side by side; the four sections continuing on the band. |
| Tests | `test/films.test.ts` (8 browser tests) and `test/films-tool.test.ts` (7); `films.test.ts` added to the WebKit workflow, in WebKit and Chromium beside the existing film tests. |
| `clients/site/README.md`, `cmips/README.md`, `package.json` | Pointed at draft 5; the new files, tests and command described. |

### Readings taken (mechanics, where the request and the texts are silent)

Each is built and tested; each can change.

1. **The main film is the one shown in the page; others are listed by a new element, `mor-film`.** Draft 4's `video` stays exactly as it was (shown where it stands). A listed film is `<mor-film src="…" poster="…">Label</mor-film>`, after the pattern of `mor-act`. *Other way:* a `video` with a marking attribute. Not taken: a display client written for draft 4 would then show every listed film as a second large player, while with `mor-film` it shows only the label's words.
2. **Draft 4 already allowed several films shown in a page; draft 5 keeps that,** rather than limiting a page to one. "One film may be marked as the main one" is read as: the film a page shows is its main one. A page that wants a single main film writes one `video`.
3. **Where the marking lives: in the page, not in the manifest.** The manifest's format stays unchanged, so every published version reads the same and the cMIP's test value holds. The publishing tool writes the marking into the page.
4. **The label is the element's text,** its spaces run together; any element inside it is dropped. Without text, the film's path is the label. The cMIP sets no length; the publishing tool refuses a label longer than 40 characters, empty, or holding control characters, and writes it as text, never as markup.
5. **The press on the button is the ask to play.** The pop-up starts fetching at once and plays once checked, with sound, as the main film does after its own press (video Module rule 11: the film plays when the viewer asks). *Other way:* the pop-up shows the poster and a second "Play" button. If fetching takes long, Safari may still want a second press (draft 4's reading 8); the player then shows its controls.
6. **Each listed film's poster is checked with the page,** as the main film's is: a poster that does not match fails the page. It costs one small JPEG per button whether or not the film is opened. Stated as a cost in draft 5.
7. **Closing stops the film and lets its bytes go;** a film checked once is kept by this page, so reopening it does not fetch it again. Closed during the fetch, the fetch is cancelled and the bar says "not fetched" again.
8. **One film at a time:** opening a pop-up pauses any film playing on the page.
9. **The buttons' look belongs to the page.** The button the visitor presses is the display client's own, laid exactly over the place the page gave it, and transparent; what is seen is the page's place, styled by its stylesheet (dubsar.org: small, outlined, side by side). This is how the main film's player works, for the same reason: WebKit runs no listener inside a page that may run no script.
10. **The publishing tool names the files from the labels:** `films/main.mp4` and `films/main.jpg` for the main film, `films/mor-use-cases.*`, `films/the-unwritten-layer.*` for the others, with paths written from the site's root (`/films/…`), so the block works on any page. Run again, it rewrites the block and removes the films it wrote before and no longer names. It never touches another file. The masters are never changed.
11. **The films block sits at the top of the sections, between two marks, empty in the repository.** F243 placed the film there ("the first thing after the scroll, at the top of the sections, above the four"). Kept empty in the repository so that the site, as published today, is unchanged.

### Checked against the working rule

"Is this core business? Or has core defined how the choice is made by participants?" Nothing here is core business: which films a site shows, and how a page lists them, is the publisher's choice within the website cMIP (development layer), and the pop-up is the display client's presentation. No question needed putting. Nothing in a MIP or a cMIP was found to be flawed.

### To check, on your phone, once published (presentation)

With the films in, the band at the bottom of the front page's first screen shows the top of the main film's poster through the gradient, where until now it showed Read's first line. That is what F243's reading says ("the scroll, the section, the top one the video"), but it changes the first screen of 9 October. The first-screen test runs on the repository's site, without films, and still passes. Please look at it on your phone with the films in.

### Tests

**Main, before writing anything** (`2e69614`): `scripts/test-all.sh` passed. Rust 633 passed, 0 failed; TypeScript barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, jpeg 14, video 6, all passing. (The first attempt stopped at the WebAssembly step because this container lacked `wasm-bindgen-cli` 0.2.129, which the script names as needed; installed, the run passed.)

**New tests:**

- `test/films.test.ts`, 8 tests, in a real browser, against real homes and a relay on local ports, two versions of dubsar.org (the repository's, and one with three synthetic films put in by the tool):
  - without the films, no film, no button, nothing in the bar;
  - with them, the two buttons labelled "MOR use cases" and "The unwritten layer", small, side by side, under the main film, laid exactly on their places; their posters checked with the page; nothing of any film fetched;
  - pressed, the pop-up opens (a dialog, labelled, the focus on its close control, the page behind not scrolling) and its player starts: in a browser that plays H.264, fetched, checked, played inline with its controls from the checked bytes, nothing set to start on its own; in one that does not, "does not play H.264", nothing fetched, the poster in place; the close control closes it and the film is stopped, let go and gone, the focus back on its button;
  - told it plays H.264, the browser fetches and checks the film in the pop-up; a press inside the pop-up does not close it; Escape closes it; reopened, it is not fetched again; a press outside closes it;
  - closed while the film is still being fetched, nothing plays later and the bar says "not fetched";
  - a listed film the gateway altered is not played, the bar names it failing, the page stays verified;
  - **a film from outside the version is refused:** a `mor-film` naming an address elsewhere, a picture, a film the version does not hold, or a place the page made itself gets no button; a poster from elsewhere is dropped; nothing is asked of anyone else;
  - on a phone (390 × 844, touch), the buttons fit side by side, the pop-up's film is whole on the screen, the close control is at least 44 pixels tall, and a tap outside closes it.
- `test/films-tool.test.ts`, 7 tests: the repository's front page holds the block, empty; the three films and posters checked, stripped (a film carrying metadata and a poster carrying camera data, both stripped; the masters unchanged), placed, and the block written with nothing else in the page changed, the folder then passing `publish`'s own checks; films over the limits (601 seconds; 2560 × 1440; 120 pictures a second; one byte over 67,108,848) or in another codec, and a poster that is not a JPEG, refused all at once with nothing written; labels (missing, empty, over 40 characters, two spaces, no letters, two films named alike, one named like the main film) and a page without its marks refused; a label written as text; run again, the block rewritten and the files it no longer names removed, a file of the publisher's left alone; and the command line itself, with its pairing of each `--film` with its `--poster` and `--label`.

**On this branch:** `scripts/test-all.sh` passed. Rust 633 passed, 0 failed; TypeScript barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, **site 57** (the 42 before, the 15 new, in Playwright's Chromium), jpeg 14, video 6, all passing. No test vector changed.

**Not run here:** WebKit (Playwright's WebKit cannot be downloaded in this container) and real H.264 playback (Playwright's Chromium plays no H.264). Both run on GitHub: the WebKit workflow now runs `films.test.ts` in WebKit and Chromium, as it runs `film.test.ts`. In both, the branches of each test cover a browser that plays H.264 and one that does not.

**Expected to fail until the release:** the step comparing a fresh build of the display client with `clients/site/built/` ("Reproducible build of the display client"). `built/` still holds the released client, without the pop-up. As for draft 4, it is rebuilt on GitHub after merging, by a commit whose message contains `[release display client]`.

### Not done in this step

- Nothing published; no real film touched; the server and the gateway untouched.
- The display client is not released (see above).
- A film in a post (video Module rule 13) is still not built in the barebone client or the reader.

## Publishing from the Mac

*For a Mac session with the repository, the owner's test identity and the three masters. Placeholders in capitals: put in what that machine holds. No address is written here.*

**0. First, the display client and the gateway.** After this pull request is merged, the display client is released on GitHub (a commit whose message contains `[release display client]`, as for draft 4), and the gateway is updated to that release with the update script, as on 11 October (machine report gateway-5): its served files match the release, and `mor-site check` says SAME. Only then publish the version with the films. A gateway on an older release shows the two labels as plain words, without buttons.

**1. The masters, as the tool takes them.** Each film must be an MP4 with H.264 pictures and AAC sound (or none), at most 67,108,848 bytes, ten minutes, 1920 × 1080 and 60 pictures a second. Each poster must be a JPEG. If a film comes out of the editor as `.mov`, remux it, without re-encoding:

```
ffmpeg -i FILM.mov -c copy -map_metadata -1 FILM.mp4
```

If a poster is a PNG, make a JPEG of it with the Mac's own tool: `sips -s format jpeg POSTER.png --out POSTER.jpg`.

**2. A copy of the site, with the first act's id** (as in `clients/site/README.md`, "Run a gateway", step 1):

```
cd clients/site && npm install
rm -rf /tmp/dubsar.org && cp -r ../../docs/dubsar.org /tmp/dubsar.org
sed -i.bak 's/act="FIRST-ACT"/act="POST_ID"/' /tmp/dubsar.org/index.html && rm /tmp/dubsar.org/index.html.bak
```

**3. The three films into the copy,** the main one, then "MOR use cases", then "The unwritten layer", each with its poster:

```
npm run -s cli -- films --dir /tmp/dubsar.org \
  --main MAIN_FILM.mp4 --main-poster MAIN_POSTER.jpg \
  --film USE_CASES_FILM.mp4 --poster USE_CASES_POSTER.jpg --label "MOR use cases" \
  --film UNWRITTEN_FILM.mp4 --poster UNWRITTEN_POSTER.jpg --label "The unwritten layer"
```

It prints, for each film, where it went (`films/main.mp4`, `films/mor-use-cases.mp4`, `films/the-unwritten-layer.mp4`, each with its `.jpg`), its size, length, picture size and codec, and what stripping removed. If it refuses anything, it writes nothing and lists every reason; fix them and run it again. The masters are not changed.

**4. Publish the next version,** naming the one the gateway serves now:

```
npm run -s cli -- publish --file ../genesis/me.json --dir /tmp/dubsar.org --name dubsar.org --relay RELAY1 --relay RELAY2 --previous CURRENT_VERSION
```

It prints the new version's id. A gateway following the site's latest version moves to it at its next look (or at once with `systemctl reload`). Check it from anywhere: `npm run -s cli -- verify NEW_VERSION --identity OWNER --at RELAY1` lists every file `ok`, the six films and posters among them.

**5. On the phone,** off the home network, in a private window: the front page says "Verified"; under the main film, the two buttons; each opens its film, which plays after "Fetching and checking…", and closes with "✕ Close", a tap outside, or Escape on a keyboard. Look at the first screen as noted under "To check".

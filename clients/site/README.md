# mor-site

Websites on MOR (roadmap step 10a), in TypeScript, with the core library through WebAssembly: the website cMIP (`cmips/cmip-website-draft-1.md`, draft 1), a gateway that serves a site at an address, and the command line. `dubsar.org` is the first site (`docs/dubsar.org/`).

## In plain words

A site is a few files: pages, a stylesheet, pictures. Its owner publishes a list of them, each with its fingerprint, signed with their identity, on relays, exactly as a release of the code is published. Nothing is ever updated: a new version is a new list, naming the one before.

A gateway stands at the domain. When it starts, it fetches the version its settings name from the relays and checks all of it: the owner's identity chain, the list, every file. Only then does it serve it. And it never sends a page on its own: at every address of the site it sends the same small program, the display client, which runs in the visitor's browser with MOR's core library. The display client checks again, for the visitor: who signed this site, and whether the page the gateway handed over is exactly the page they signed. It says so in a bar above the page. A page that does not match is not shown.

The display client is the gateway's code, not the site's, so a hostile gateway could change it. Nothing a page does can rule that out. What is done about it: the display client is the same for every site, not minified, and released as MOR's code, so anyone can compare what a gateway serves with the release from another machine (`mor-site check`); and every byte of a site can be checked with no gateway at all (`mor-site verify`).

Pages are for reading. No script in a page ever runs, and a page loads nothing from anywhere else: only its own stylesheets and pictures, as bytes already checked. To show an act (the first act, on dubsar.org's front page), a page names it, and the display client fetches it and judges it on its own, as the reader does, and lists it in the bar with its signer.

## Precisely

| File | What |
| --- | --- |
| `src/manifest.ts` | The site manifest: encoding, strict decoding, paths and their kinds, addresses both ways, references within a page. |
| `src/verify.ts` | What counts as a version (cMIP, "What counts as a version", "Verifying"): the publication, the signer's chain and the publication's standing, the identity expected, not a collective, no withdrawal found, the manifest; a file checked from any source. Runs on the server, on the command line and in the browser. |
| `src/publish.ts` | Publishing a version from a folder: the files checked first (paths, kinds, a front page, JPEGs stripped, UTF-8), unchanged files reusing the previous version's objects, the publication first, then the manifest and the new files. |
| `src/gateway.ts` | The gateway's server: checks the version before serving it; serves the display client at every address, the settings at `/_mor/site.json`, the display client's files at `/_mor/`, and the site's files only as bytes at `/_mor/file/PATH` (`application/octet-stream`, `attachment`). |
| `src/settings.ts`, `src/headers.ts` | The gateway's settings, checked; the headers of every answer, with the content security policy. |
| `src/shell/` | The display client: `app.ts` (the flow), `page.ts` (a page made ready: code and references to elsewhere dropped, pictures and stylesheets replaced by their checked bytes, links rewritten, acts boxed), `view.ts` (the bar and the styles). |
| `src/web/core.ts` | The core library in the browser, loaded from `/_mor/` whatever the page's address. |
| `src/cli.ts` | `mor-site publish`, `verify`, `check`, `gateway`, `strip` (`npm run cli -- help`). |
| `scripts/build.ts` | Builds the display client into `dist/` (not minified). The build fails if anything from Node reaches the bundle. |
| `gateway.example.json` | Settings to copy and fill in. |

It reuses the genesis client (identities, the relay transport, looking an identity up), the barebone client (reading a post, rendering it), the long-form client, the web reader's browser helpers and wording of standings, and the JPEG Module (stripping).

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../site
npm install
npm test            # starts real homes and a relay from target/debug/mor-relay (built if needed)
```

The browser test uses the Chromium at `/opt/pw-browsers` or the one `MOR_CHROMIUM` names; `MOR_SCREENSHOTS=DIR` keeps a picture of each page.

- `test/site.test.ts` (12 tests): paths, kinds and addresses; the manifest strict; files the cMIP refuses refused before anything is published, every reason at once (a JPEG still carrying its camera data among them); the dubsar.org folder published as a version, every file verified from a relay; a second version naming the first, uploading only the changed page, the first still verifying; refused, with the reason: a copy signed by another identity (naming the real signer), an act that is not a site, an id not found, a withdrawn version; a collective's site refused though validly signed; the gateway serving its display client at every address, its settings, the files only as bytes, 404 and 405, refusing to switch to a version that does not verify, and serving nothing (503) when no version ever verified; the settings checked; `mor-site verify` with no gateway, writing the files out; `mor-site check` from another process: an honest gateway the same, a gateway altering a page caught on that page, a gateway serving an altered display client caught on `gateway.js`; the Run guide canonical text, a long-form document with a title, carrying no identity, key, address, host, IP address, onion address or home folder.
- `test/browser.test.ts` (9 tests), headless Chromium, a fresh profile for every page, the gateway's real headers: **each of the five pages of dubsar.org shows as verified, signed by the owner's whole fingerprint**, the version named, nothing fetched from anywhere but the gateway and the relays; the front page opens on the first act (a test post with the photograph), shown verified with its picture, and listed in the bar with its signer; a door opens its page through the display client, checked again; **an altered page is shown as failing and not shown**, its altered words nowhere on the screen, while the other pages still verify; an altered stylesheet fails the pages that use it; a version signed by someone else fails, naming who did sign; an address the site does not hold says so; a page that tries everything (scripts in the head, in an SVG and in handlers, a refresh, a base, inline styles, pictures, stylesheets and frames from elsewhere, a form, a `javascript:` link) runs nothing and loads nothing from elsewhere, and what is left is shown, verified, with its own picture and stylesheet; a picture and a text file shown under the bar; the content security policy refused nothing on the real site (on the hostile page it refused only the page's own `base` and inline styles, before the display client dropped them).

## Questions for Nobody, allegedly

Where the texts are silent, this draft took the path below so that something could be built and tested. **None is settled until you say so.** In order of weight; the lean is what was built.

1. **What may a page be?** (a) HTML pages, shown with no script and nothing loaded from elsewhere: a site can have a design, pages link to each other by relative links, so the same site works at the domain and at the onion address. (b) Long-form documents only: bound by the Text MIP (nothing hidden, nothing moved), but no design, and links between pages must be full addresses, so a page would point at one domain only. (c) HTML with the site's own scripts: anything goes, and a site's own code could paint a false "verified". *Lean: (a).* Its cost, stated in the cMIP (rule 15): a stylesheet can hide or move words, so a page is a design, never terms; whatever is to be agreed is a text act.
2. **Where does the checking code come from?** (a) The gateway's own software, MOR's code, the same for every site, released and comparable with its release. (b) A file of each site. *Lean: (a)*: then a site carries no code at all, and visitors have one program to trust, which many can check.
3. **How is the display client compared with its release?** Its script, stylesheet and page build to the same bytes every time (checked: two builds identical, no machine paths in them). Its WebAssembly does not: it carries the build machine's folder names and depends on the Rust version. (a) Publish the built display client itself in the release, so the release names the exact bytes a gateway must serve (as the management page is committed built, in `relay/manage/`). (b) Make the WebAssembly build reproducible (a pinned Rust version, folder names stripped). (c) Both. *Lean: (a), with (b) later.* Until then `mor-site check --against DIR` compares with any folder, such as a release written out with `mor-repo verify --out`.
4. **Which version does a gateway serve?** (a) The one its operator names in its settings, changed by hand and a reload. (b) It follows the owner's newest on its own; MOR has no clock, so "newest" would need a rule, such as the end of the chain of versions naming each other, refusing forks. *Lean: (a)* for now: the owner and the operator of dubsar.org are the same person.
5. **A collective's site.** (a) Refused in draft 1, though validly signed. (b) Judged by Law now, as releases are (the member signatures its agreement asks for). *Lean: (a)*, and (b) in a later draft, once the real collective exists after V1. dubsar.org is the scribe's own site, so it is not affected.
6. **The first act on the front page.** (a) Shown as the act itself, fetched and judged on its own (`<mor-act act="…">`), so it keeps its own signer and standing. (b) A copy of its words and picture in the site, with a link to the act. *Lean: (a)*, the site holds the link, as decided for the doors.
7. **The gateway's server in TypeScript.** The rule is Rust for the core, relays and homes, TypeScript for clients. A gateway is a server and a client at once; its browser half must be TypeScript, and the server runs the very same verification code. (a) TypeScript, as built. (b) The server in Rust. (c) Built into `mor-relay`, as the management page is. *Lean: (a).*
8. **The reader's own code** (the reader's reading 12 pointed here). The reader runs scripts, so it cannot be a site under this cMIP; but the same settlement applies: it is released code that anyone can compare with its release. (a) Say so in the reader's README and teach `mor-site check` to compare a reader too. (b) Leave reading 12 as it is. *Lean: (a)*, a small change, not made in this window.
9. **The footnote's email address.** Left as a placeholder. (a) The address the reader already shows, until the dubsar.org one exists. (b) Only the reader's message over MOR. *Lean: (a)*, the same as the reader, so the two never disagree.
10. **Where the site lives in the repository:** `docs/dubsar.org/` (as built), or a folder of its own at the top. *Lean: `docs/`*, beside the documents it leads to.

## Readings

Smaller choices, taken the same way, for you to confirm:

1. **Paths** are lower-case ASCII letters, digits, `-`, `_` and `.`, segments of at most 100 characters, not starting with `.`; a path ends in `.html`, `.css`, `.jpg` or `.txt`; a site has `index.html`. Addresses are never decoded: a valid path needs no escape.
2. **Four kinds of file**, no more: pages, stylesheets, JPEG pictures, plain text. PNG and PDF can carry hidden data and have no Module; files to download belong in a release.
3. **Pictures are stripped** before publishing, as a posting client strips them (the decision of step 9, for posts, applied to sites): `mor-site publish` refuses a JPEG that still carries anything but the picture, and `mor-site strip` strips it.
4. **The display client takes a site's files only from the gateway that serves it**, and never falls back to a relay for a file the gateway served wrongly: what a gateway alters is what a visitor needs to know (cMIP rule 10). The publication, the signer's chain and the manifest come from the relays in the gateway's settings, then from those the publication names.
5. **One wrong file fails the whole page**: a page whose stylesheet or picture does not match is not shown at all.
6. **What is dropped from a page**: the elements and attributes in cMIP rule 11, plus `template`, `applet`, `portal`, `svg` and `math`, and any `src` or `href` on elements that are not pictures, links or stylesheets. A stylesheet's `@import` and `url()` are made inert. A link to a page the site does not hold, a `javascript:` link, or a link to a place within the same page, is shown as its text. The page is then shown in a frame whose sandbox forbids scripts, and the content security policy refuses inline styles, a `base` and anything from elsewhere, as walls behind the first one.
7. **Links leaving the site** open in a new tab; the address is shown when the pointer rests on the link (cMIP rule 14).
8. **Acts in a page** are fetched from the gateway's relays, read and judged as the barebone client reads a post, shown in a frame of their own, apart from the page's styles, and listed in the bar with their standing and their signer. An `act` attribute that is not an act id (such as the placeholder `FIRST-ACT`) shows "Not an act id".
9. **The gateway checks when it starts and when told to** (`SIGHUP`), switches only to a version that verifies, and otherwise keeps serving the version it checked before. Withdrawals are looked for at the places asked: by the server at each check, by the browser at every page.
10. **The settings may name the release** the display client comes from (`release`); the bar shows it.

## Run a gateway

*A human test or a machine session: the build window cannot reach the server.* On the server that runs the homes, behind the same Caddy.

1. **Publish the site** from the machine that holds the owner's test identity, with the first act's id in place of `FIRST-ACT` (until step 17, a test post's id):
   ```
   cd clients/site && npm install
   cp -r ../../docs/dubsar.org /tmp/dubsar.org
   sed -i.bak 's/act="FIRST-ACT"/act="POST_ID"/' /tmp/dubsar.org/index.html && rm /tmp/dubsar.org/index.html.bak
   npm run -s cli -- publish --file ../genesis/me.json --dir /tmp/dubsar.org --name dubsar.org --relay RELAY1 --relay RELAY2
   ```
   It prints the version's id. Check it from anywhere: `npm run -s cli -- verify VERSION --identity OWNER --at RELAY1`.
2. **Build the display client** (`npm run build`), and copy the client to the server with Node 22 or later: the repository's `clients/` (with `genesis/wasm` built) and `modules/`, then `npm install` in `clients/site`, `clients/genesis`, `clients/barebone`, `clients/longform` and `clients/reader`.
3. **Settings:** copy `gateway.example.json` to the server, fill in the version, the owner's identity and the relays.
4. **Run it** as a service under an account of its own, like the homes (`ExecStart=/usr/bin/node --import tsx src/cli.ts gateway --settings /etc/mor-site/gateway.json`, `WorkingDirectory` the `clients/site` folder). To switch to a new version: change `version` in the settings, then `systemctl reload` (sends `SIGHUP`; set `ExecReload=/bin/kill -HUP $MAINPID`).
5. **Caddy:** `dubsar.org { reverse_proxy 127.0.0.1:8090 }`. The gateway sends its own security headers; Caddy adds HTTPS.
6. **Check on a fresh device**, a phone off the home network in a private window: every page says "Verified" with the owner's fingerprint, the same as `mor-genesis show` gives. From another machine: `npm run -s cli -- check https://dubsar.org` says SAME.

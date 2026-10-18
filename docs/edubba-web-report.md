# Edubba's web client, for testing only: report

*18 October 2026. Branch `claude/edubba-web`. One roadmap step: the web Edubba without the Agents tab (`docs/state-of-mor.md`, "Open", item 1, round 3's prelude), decided by Nobody, allegedly, 17 and 18 October 2026: "so I can access it from other devices than the Mac". A GitHub session: test identities only; homes and relays on local ports; nothing touched the servers; no server address, onion address or key in the repository. The page is to be served at `edubba.dubsar.org` (the name is mapped already) by a later server session.*

## In plain words

Edubba now has a web page for testing, so a collective can be founded and run from the iPad or the iPhone, not only from the Mac.

- **It is the same page as Edubba on the Mac**, running Edubba's own code inside the browser. Nothing new was invented for the web: the founding, the signatures, the dealing of the shares, the member change, the record of an identity, relying on an act and corrections are the same code the Mac runs, and read back in the same plain words.
- **What it leaves out:** the **Agents tab** (no agent, no API key, nothing from Claude's connector: those stay on the Mac, as H18's reasons say); **making** an identity (you **bring** one you have, by its ID and its signing key's words, as in Damgar's and Ummia's web pages); **test collectives**; **money drafts** (Pay someone, anchoring); and **a collective's release** (below). Each of these, if asked for, is refused in plain words saying it needs Edubba on a computer.
- **A banner on every screen**, as on Dub's, Kišib's, Damgar's and Ummia's: for testing only, and the risks in plain words. Whoever serves the page's code when you bring an identity could copy its signing key. The browser's storage keeps, as they are and not locked, the signing and encryption keys of each identity you bring, the signing key of each collective you found there, and, while you sign as a member, the one-time key for your share until you have written the share down; that storage can be lost or read by what runs in the page. Founding deals the collective's chain key **in the page's memory, never in its storage**: for a moment the page holds the whole chain key, and your share (and any shown hand to hand) waits there an hour at most, lost on a reload. A dishonest page or device could keep the chain key and act alone later (F337). Never a real identity.
- **Releases: said, not made.** I chose the second option of the prompt. A page in a browser can be given a folder, but it cannot tell a link from a file in it (the browser follows links and hands over what they point to), and it cannot know what git tracks. Edubba on the Mac leaves links out and takes only what git tracks; the web would publish more, perhaps a file from outside the folder. That is a new risk, so the card says plainly that a collective's release is made in Edubba on a computer (and a release under one's own name in Ummia), and that a release proposed there is signed here, in "To sign", and checked here as anyone would.
- **The look** is Edubba's on the Mac: the emerald tint, the same icon in the tab and on a phone's home screen. **IDs** are shown and copied in the forms written for people (`mid1…`, acts `mact1…`) and taken in either form. **Every list and feed** scrolls in its own box (H42), on the Mac page too.
- **One tab at a time:** a second tab of the same site says Edubba is open in another tab, so two copies never sign from the same keys.
- **Built reproducibly**, as the other web pages, with its own workflow (`release-edubba-web.yml`); the built files are in `clients/desk/built/`, built in this pull request; `check URL` tells whether a server serves exactly them.

## Precisely

| Piece | What |
| --- | --- |
| `clients/desk/src/ops.ts` | Every operation by name, moved out of `server.ts` unchanged, the same for the program and the web client. `WEB_OPS`: the ones the web client answers. Anything else refused with `ON_A_COMPUTER`; a release with `RELEASE_ON_WEB`. On the web, `state` lists no agent and no test collective; `settings` keeps homes and relays only; `drafts` and `waiting` are empty; bringing an identity says nothing of Claude. |
| `src/page/ui.ts`, `src/page/app.ts` | The page, as before, started by `begin()`: paired with the program on a computer (`app.ts`), or with `begin({ web })` by the web client, whose operations run in the browser. On the web: the Collectives tab first (Identities while none is held), no drafts watching. |
| `src/page/view.ts` | `setWeb`: no Agents tab; the one door "Bring an identity you have"; no Claude switch, no drafts, no money; no test collective; Settings with homes and relays; the founding's warning "This is a web page" (`WEB_FOUNDING_SAY`); the release card (`RELEASE_ON_WEB`); "kept in this browser". `WEB_BANNER`. H42's boxes (`.list`, `.feed`, `.picks`). The record's latest act as `mact1…`. |
| `src/web/app.ts` | The web client: the folder opened, the Web Lock `edubba-web` taken, the same `Store`, `Desk`, `Setup`, `Real`, `AfterKishib`, `Member`, `Corrections`, `Collectives` as the program; each answer given only once what it changed is kept; `edubba.json` (optional, https only) fills empty Settings. |
| `src/web/vfs.ts` | Edubba's folder in IndexedDB (database `edubba`, store `files`, one record per file, the layout of `~/edubba`), read whole when the page opens, each change written back at once, in order. |
| `src/web/node-*.ts`, `buffer.ts`, `collective-server.ts` | Browser stand-ins for the Node pieces the shared code names: files (the folder above), paths, the home folder, SHA-256 and the secure random source, a module's own address, no programs run, `Buffer`; the collective client's server replaced by one that refuses. |
| `scripts/build-web.ts`, `static/web.html`, `built/` | The build: not minified, reproducible; any other Node import fails it, and so does program-only code (the agents, Claude's API, the pairing, money, the server). The release: `index.html`, `edubba.js`, `edubba.css`, `mor_wasm_bg.wasm`, Inter and its licence, `icon.png`, `apple-touch-icon.png`, and `BUILT-WITH.txt`. |
| `src/cli.ts` | `check URL [--built DIR]`: SAME, or each file that differs. |
| `.github/workflows/release-edubba-web.yml` | On the pattern of `release-damgar-web.yml`: on `[release edubba web]` in a merge message, or by hand, rebuilds and commits `built/`; on a pull request touching Edubba, rebuilds and checks that GitHub's machine gives the bytes the pull request carries. |
| Shared fixes (the Mac too) | `collectives.ts`: "Bring an existing collective" takes `mid1…`; `real.ts` and `setup.ts`: acts and the collective's ID said as `mact1…`/`mid1…` in what is shown; the page: no "Correct this" on a real or brought collective's posts. |

## What writing the code found

1. **The chain key during founding is in memory, not in storage.** The prompt asked the banner to say that the collective's chain key is held in the browser's storage until its shares are dealt. The code (the Mac's, run unchanged) deals the chain key inside one call and never writes it; the shares to show here wait in memory only. So the banner says what is true: in the page's memory, never in its storage, and a reload loses the shares to show. What *is* in storage, and the banner says so: the identities' keys, the collective's **signing** key, and a member's one-time key while its share waits.
2. **"Bring an existing collective" refused the `mid1…` form** (F349 says every typed ID is taken in either form). Fixed in the shared code, so the Mac is fixed too.
3. **"Correct this" on a real collective's post was a dead button on the Mac**: it asked the test-mode collective client, which does not hold a real collective. A real collective posts nothing from Edubba yet, so nothing to correct; the button now shows only for test-mode collectives (and one's own posts).
4. **Leaving a real collective is not built, on the Mac either.** "Leaving" in the README is the test-mode collective client's. For a real collective, the only path is a member change proposed by the founder, unticking the member who leaves, then Kišib. A member who is not the founder has no way to leave from their own app. Question 2 below.
5. **F337's own advice says "this app rather than any web page"**, and Nobody, allegedly decided a web Edubba that founds. Not a flaw in a MIR: the trusted-dealer weakness is the same, with one more party able to abuse it (whoever serves the page). Said on the founding form and in the banner. Question 1 below.
6. **A collective's signing key now lives in a browser's storage**, which Safari may clear after weeks without a visit (`docs/human-tests-v2.md` warns of this for identities). An identity survives through its signing words on paper; a collective's signing key has no words shown at founding, so losing it means a rotation in Kišib from the members' paper shares. A stated cost, in the readings.
7. **Short fingerprints in lists are hexadecimal** (`2c28b706…383d`), in Edubba as in Dub, while whole IDs are `mid1…`. Kept as every app does; Question 3.
8. **At a phone's width, Edubba's page was wider than the screen**: its tab bar did not wrap, and a line of acts written as one long word did not break, so the page scrolled sideways on an iPhone. Both now wrap (the Mac's page too); the browser test checks every tab and a collective's page at 390 pixels.
9. No flaw in a MIR or cMIP was exposed: the web client runs the Mac's code, and every rule it follows is the Mac's.

## Questions for Nobody, allegedly

1. **Founding on the web.** Options: (a) as built: allowed, with the banner and the warning "This is a web page" beside F337's; (b) allowed only once a box "I found a test collective, knowingly, in a web page" is ticked (a second tick beside F337's); (c) not on the web: found on the Mac, operate from the web. *Lean: (a), since the web client is for testing with test identities, and (c) would defeat the decision's purpose (founding from the iPad).*
2. **Leaving a real collective from one's own app.** Options: (a) as now: the founder proposes a member change without the member, which waits for Kišib; (b) a member proposes their own leaving from Edubba or Dub (a resignation, as the collective client's test mode signs one), which the founder's Edubba gathers as it gathers a member change. *Lean: (b), in a later session; it needs the Agreements reading of a resignation in a real collective, to be read with you first.*
3. **Short fingerprints.** Options: (a) hexadecimal, as every app now (`2c28b706…383d`); (b) the start and end of the form written for people (`mid1yu9vu4…wlvss7jplw`). *Lean: (a): a fingerprint is to compare at a glance, and changing it is a change for every app, for the site session.*
4. **Money drafts on the web.** Pay someone and anchoring a collective's act are left out (Damgar's web page follows no chain, so an anchor could not be checked there). Options: (a) as built; (b) Pay someone only. *Lean: (a) until round 3 asks for it.*

## Readings to confirm, and their costs

1. **Edubba's folder in the browser.** The whole folder is read into the page when it opens and each change is written back at once; an operation is answered only once its changes are kept. *Cost:* a folder grows with what each identity received; read whole at each opening. A change the browser refuses to keep is said, in red, after the act was sent.
2. **One tab at a time** (a Web Lock). *Cost:* a second tab only says so; close the first.
3. **Bring only.** No identity is made in the web client: an identity is made in Dub (web or Mac) or in Edubba on a computer. *Cost:* one more step on a phone: make the identity in Dub's web page, "Show the signing key's words", bring it here.
4. **The same identity in Dub and in Edubba's web client** keeps a line of acts in each (F152, as on the Mac): a change of keys in Kišib must keep both lines, read from the record.
5. **The collective's signing key** is kept in the founder's browser storage. *Cost:* if that storage is cleared, the collective signs nothing more until a rotation in Kišib from the members' paper shares gives a new one. Use the page often enough, or found on the Mac.
6. **Settings: homes and relays only, https.** No other way to reach an address (a browser reaches https only): no onion home from the web page. The optional `edubba.json` beside the page only fills empty fields.
7. **Releases on the web: not made** (above); signed and checked, yes.
8. **What it received** is kept on the Identities tab, as on the Mac (reading the inbox; nothing of Claude).

## Tests

| Test | Result |
| --- | --- |
| `test/web-browser.test.ts`: the banner on every screen and at a phone's width; no Agents tab, nothing of Claude's, no test collective; Settings; an identity brought by `mid1…` and words, wrong words refused, its ID and acts in the forms; kept across a reload, no chain key in storage; one tab at a time; a correction; a real collective founded with two members signing in Dub's web client, the shares dealt and kept nowhere (every browser's storage read whole); a member change signed in Dub on the web, then waiting for Kišib; a collective brought read only; H42's boxes; no console error | 2 tests, both pass |
| `test/web-build.test.ts`: the release's files and fingerprints, the banner's risks, Edubba's icons, built twice the same in two folders, nothing of the program in the script, `check`, the emerald tint, the operations answered and refused | 5 tests, all pass |
| `test/build/reproducible.test.ts` (`npm run test:build`): built here, the release byte for byte | passes |
| Edubba's whole suite (`npm test`), the Mac's program and page after the operations moved and the page split | see the pull request's description |

## Human test: Edubba on the iPad and the iPhone

*Test identities only. Before this test, a server session serves `clients/desk/built/` at `edubba.dubsar.org` as the README says ("Putting it behind Caddy"), optionally with an `edubba.json` naming home1, home2 and their relays, and checks it: `node --import tsx src/cli.ts check https://edubba.dubsar.org/` says SAME. The steps follow `clients/desk/README.md` ("The web client") and `clients/dub/README.md` ("The web client"). On the iPad and the iPhone: no private browsing (it keeps nothing), and the signing words on paper, since Safari may clear a site's storage after weeks without a visit.*

1. **The founder's identity, in Dub.** On the iPad, open `https://dub.dubsar.org`, make an identity (or use one you have). In its identity window, **Show the signing key's words**: write them down. Copy its ID (`mid1…`).
2. **Two members, in Dub.** On the iPhone, open `https://dub.dubsar.org` and make member B; in its identity window, turn **Signing** on. On the Mac, Dub: member C, Signing on. Copy each ID.
3. **Edubba on the iPad.** Open `https://edubba.dubsar.org` in Safari. Check: the banner and its four risks; the tabs **Collectives, Publishing, Identities** and **Settings**, no Agents. Is the banner clear?
4. **Settings** (if `edubba.json` did not fill them): homes `https://home1.dubsar.org` and `https://home2.dubsar.org`, relays the same two. **Save settings**.
5. **Identities, + Bring an identity**: a name, the founder's ID from step 1, its 24 words, **Bring it**. Check: "is here"; the ID shown as `mid1…`; **Its record** read from its homes.
6. **Collectives, + Found a real collective.** Under **Contacts**, add B and C by their `mid1…` IDs, with names. Fill the name, tick B and C, **Review the founding**. Read it, then **Sign**. Check: "This is a web page" said on the form; the proposal waiting, 1 of 3 signed.
7. **Each member signs**: on the iPhone (B) and on the Mac (C), Dub's **Signing** tab, read the founding in plain words, **Sign it**.
8. **Back on the iPad**: within about 20 seconds, 3 of 3 signed, by itself. Tick **I have read what this device will hold**, then **Found it: deal the shares**. **Show** your share, write the number and the 24 words on paper, **It is written down**, type the three words asked. Do it in one sitting: a reload loses it.
9. **Each member** opens their share once in Dub's Signing tab, writes it down, types three words back.
10. **A member change**: in the collective, **Change its members**, add a fourth identity (from a contact), **Review the change**, sign. Each member signs in Dub (reload Dub if it is not there yet), and the new one too. Check: 4 of 4, then "that is Kišib's work": the change waits for Kišib.
11. **A release**: open **A release: on a computer**. Check: it says releases are made in Edubba on a computer, and signed here.
12. **A correction**: on the Identities tab, **Its posts**, **Correct this** on one of the founder's posts (one made in Dub), **Sign the correction**. Check: labelled **Correction**, the original "Corrected by".
13. **On the iPhone**, open `https://edubba.dubsar.org` too, bring member B by its words, **Collectives, + Bring an existing collective**, the collective's `mid1…` ID. Check: "brought here · no key held", what its agreement says, read only.
14. **The icon**: on the iPhone, Share, **Add to Home Screen**. Check: Edubba's icon, emerald, filling the square, the same as on the Mac.
15. **Scrolling** (H42): with several contacts and posts, each list and feed scrolls in its own box, and nothing scrolls sideways.
16. **A second tab**: open `https://edubba.dubsar.org` in a second Safari tab. Check: it says Edubba is open in another tab.

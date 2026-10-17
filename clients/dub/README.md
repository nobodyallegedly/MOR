# Dub (mor-dub)

**Dub** (𒁾, "tablet"; called MOR Post until 13 October 2026), reshaped on 16 October 2026 (F332): a calm app for one person's public and private life on MOR. An identity window first; then two tabs, **Public** and **Private**. On the Mac, a program and its page; the same page runs on its own in a browser as **Dub's web client**, for testing only (F281), to be served at `dub.dubsar.org`.

**Test identities only, until MOR is frozen.** Every key is held in software.

## In plain words

**The identity window** comes first, and Dub opens only once an identity is there. It is also where you switch identity, give yourself a display name, and see the words that carry an identity elsewhere.

- **Make a new identity.** Give a home address and, if you like, relays and a display name (H12: published right after the genesis, the naming cMIP; a malformed name is refused before anything is made). Dub shows you **the chain key's 24 words**, once. Write them on paper. They are the only way to change the identity's keys if a device is stolen or lost, which is done in another app, Kišib, never in Dub. Dub keeps nothing of the chain key, on the Mac as on the web. When you say they are written down, the words disappear, and only then does Dub ask for three of them back (the human test's H3). The new identity gets its homes, an inbox and an encryption key at once, as the desk's identities do.
- **Bring an identity you have**: its ID and **the signing key's 24 words**. Dub reads it from its homes and checks the words give its current signing key. They also carry its encryption key, so its private messages open here (the carry Module, draft 2), unless the identity was made by an app that did not make its encryption key from its words; then Dub says so.
- **Show the signing key's words**: the words that bring this identity into Dub on another computer or device. Whoever holds them can post as you **and read your private messages**. Labelled as the signing key's words, never confused with the chain key's.
- **Your display name**: a name shown beside your fingerprint, never instead of it. Anyone can take the same name; the fingerprint tells you apart (the naming cMIP).
- Several identities can be held; one is in use. **Switch identity** (H28) leaves the one in use first (its keys stay here), then the window lists the identities held, each with **Use this one**, and the two doors, **Make a new identity** and **Bring an identity you have**, folded. **Forget it here** removes one from this app.

**Public.** One box to write in, a picture if you like, and **To…** to address the post to an identity (a public message, left in its inbox too). There is no public/private switch: the tabs are the switch. Below, the feed: your own posts and those of the identities you follow, each with a quiet row: **Reply**, **Follow**, **Mute**. No likes, no zaps. **To you** is a filter: replies to your posts and public messages addressed to you, with a count on the tab until you have seen them. **Relay** (H29) is another, chosen, never the default: every public act at this identity's relays, newest first in the order each relay received them (its own order, not a signed time), posts of anyone with Reply, Follow and Mute, and every other public act named by what it is (a display name, a new identity, a publication…); muted identities left out and counted. A long-form document is not shown in the feed: a link opens it in the reader. Under **Following**, follow by an identity's ID with a name of your own for it, or with **Follow** on any post; unfollow, unmute, and the choice to publish whom you follow.

**Whom you follow, sealed to yourself (H29; the people cMIP, draft 2).** The list, with the names you gave, is a private act sealed to your own identity and left at its homes. Any app holding the identity by its signing key's words reads it there (Dub on the Mac, Dub on the web, Edubba), so it survives a lost device and is the same everywhere. Private is the default (F59); publishing the IDs is the other option, the names staying sealed. A list Dub kept in the app before is carried over into it once, nothing removed. *Costs, said under Following:* the homes and relays see that a private act exists and roughly how big it is; whoever holds the signing key's words reads it; one act per change. Muting stays in this app, always.

**Private.** Your inbox, and a box to write a message to one identity: sealed to it, so only it can open it (F293). A count on the tab until you have seen what came.

**When your key is changed elsewhere.** If the identity's signing key is changed with its chain key (in Kišib), the words Dub holds stop counting. Dub says so in plain words, on opening and before every act (a change of keys is done in Kišib, never in Dub), signs nothing more with them, and takes the new signing key's words.

**Signing (H18): even more experimental than Dub itself, off by default.** Decided by Nobody, allegedly: "an optional tab only available via settings clearly labeled as even more experimental." Turned on with a box in the identity window (per identity, with a warning first); then a **Signing** tab appears. While it is off, proposals that arrive wait in the inbox, unread, and the Private tab says how many wait. In the tab:

- **A proposal** from a collective's founder (founding a collective, changing its members, signing its release) is read in plain words from the exact bytes of the act it names, before anything is signed: who signed, what each party is bound to, the stakes and fees, who judges, how it ends, what is owed, the collective's keys, who decides what, the risks (the deal-assessment tool's reading), and the words everyone signs as plain text. For a member change, what it changes; for a release, every file with its size and fingerprint (Dub cannot compare them with a copy of yours, and says so).
- **Sign it** or **Decline**. A signature is an act of yours, public, at your relays, where the act was found, and at the collective's homes; then an answer goes to the proposer in its thread, sealed. Declining sends only that answer, with your reason if you like.
- **Waiting for a share (H30).** Where a share is awaited, a plain **Look for my share** button; and while the Signing tab is open, Dub looks for it by itself every 15 seconds (never while a share is shown or its words typed). A reload keeps the tab you were on.
- **Your share of a collective's chain key.** When you sign a founding or a member change, Dub makes a one-time key for your share alone and sends its public half with your answer. Once every member has signed, the founder's Edubba deals the key and seals your share to that one-time key. **Show my share** opens it once: its number and 24 words, labelled as the collective's chain key share, with the dealing's fingerprint to compare with the other members. Write them on paper. Once you say they are written, they are hidden, three words are asked back (as H3), and then the one-time key is destroyed: the copy on the relays can never be opened again, by anyone, your signing words included. If it came by hand instead (shown on the founder's screen), **I received my share by hand** destroys the one-time key unused.

**Folds (H34).** Where a screen gets crowded, it folds: the identity window's doors once identities are held, its line and where it lives, Following, and a proposal's reading once answered (before, it is always shown in full). Each is remembered by the page, as you left it (this browser's storage: which fold is open, nothing else).

**Icons (H25, H36).** Dub's own icon, in the family's style since the agents session: a clay tablet carrying its name **𒁾** (DUB, U+1207E, "tablet"), carved once as one solid recessed carving, its Neo-Assyrian form traced from Noto Sans Cuneiform (SIL OFL 1.1); a thick warm-pearl edge `#a59f93` (70% of `#e9dfcd` over the dark), the dark `#141518`, the clay `#95785f` (the family's moved 12% toward pearl), no glow (`static/icon/dub.svg`), in the Mac's app, the Linux entry and the web client (H35). The sign was checked against the ePSD2 sign list (DUB: dub, kišib₃, ṭup…) and Borger's MZL 242 through search results quoting them: this build's network refused the sites themselves (`docs/edubba-agents-report.md`).

**The tint (H36).** The Text layer's warm pearl `#e9dfcd`, by Kišib's rule: separators 22% `#383736`, outlines 30% `#4a4946`, quiet accents 60% `#8e8980` over `#06080c` (`src/page/view.ts`, `TINT`, laid over the family's base `STYLE` in `PAGE_STYLE`, Dub's own page; the other apps tint the base with their own layer). Red stays for alarms.

**Whom to address (H37).** Public's **To…** and the Private message box offer the people this identity follows, each by the name given here and its display names, the fingerprint always beside them; typing or pasting an ID still works.

**Corrections and grants, shown (F344, F343).** A post in the corrections format naming an act of its own signer is labelled **Correction**; the act it corrects is shown as signed, with **Corrected by**. A post signed under a grant (an agent posting in its owner's name) is shown with on whose authority, as Agreements judge it (the grant read from the relays: `clients/grants`).

**Money, prepared for Damgar (F338).** **Tip** on a post, and **Ask someone to pay you** (Private tab, folded): each is a draft (the money messages cMIP, `cmips/cmip-money-messages-draft-1.md`), a private act sealed to your own identity at its homes, which Damgar finds, reads in plain words and offers for signing. Dub signs no money act: "Prepared, not signed". Amounts name their unit (the Bitcoin units Module's, regtest by default); nothing assumes satoshis.

Not here, on purpose: no rotation (Kišib's, the collective's too), no notification hub, no likes or zaps, no money signed (Damgar's), no founding or proposing (Edubba's).

## Precisely

| File | What |
| --- | --- |
| `src/dub.ts` | What Dub does, on the Mac and in the web client alike (a `Keep` says where it keeps things): the identity window (`begin`, `confirm`, `bring`, `renew`, `use`, `forget`, `carry`, `setName`), the key in use (`check`), the public side (`post` with a picture, `to` or a `reply`; `feed`, the site's feed code in signed order; `withdraw`), the inbox (`inbox`: "to you" and the private messages, read once and kept; `message`, sealed), the people cMIP (`follow`, `unfollow`, `callIt`, `mute`, `unmute`, `listOption`, `seen`). |
| `src/carryin.ts` | Bringing an identity by its signing key's words (the carry Module, draft 2, section 4): the look-up refusing words that do not give the current key, the chain as its homes serve it, the encryption key the words carry. Shared with Edubba's Identities tab (H15). |
| `src/signing.ts` | The Signing tab (H18): the act a proposal names, fetched by its id and read in plain words from its bytes (founding terms, a clone with what it changes, a release with its files), with the deal-assessment tool's reading; the words said where the tab is turned on and where a share is shown. The operations are in `dub.ts` (`setSigning`, `proposals`, `signProposal`, `declineProposal`, `shareShow`, `shareConfirm`, `shareByHand`), the messages and the sealed share in `../repo/src/proposals.ts`. |
| `src/names.ts` | The naming cMIP (`cmips/cmip-naming-draft-1.md`): a name's form, its act, and an identity's display names read and judged. |
| `src/people.ts` | The people cMIP (`cmips/cmip-people-draft-2.md`): what Dub keeps about people; the follow list sealed to the identity (`sealedListPayload`, `readSealedList`; written in `dub.ts`, `syncFollows`); the published list act, and a published list read from its chain (draft 1's versions continued). |
| `src/ops.ts` | Dub's operations by name, the same for the program and the web client. |
| `src/shapes.ts` | What the page is told: plain data, no import, shared by the page and Dub's code. |
| `src/store.ts` | The program's folder (default `~/mor-dub`, or `~/mor-poster` from before the rename, owner-only): `identities/ID/identity.json` (the genesis client's format, never a chain key), `settings.json`, `people.json`; `active.json`; `access.json`; `run.json`. A folder from before 16 October 2026 is moved into this layout when first read. A new identity waiting for three words is held in memory only. |
| `src/server.ts` | The program: the desk's server (`../desk/src/local.ts`): `127.0.0.1` only, the page built at start, not minified, under a content security policy, requests signed by a paired browser with Dub's own domain line, `MOR post, version 1`. |
| `src/cli.ts` | `open` (start the program if needed, open the page with a one-time pairing link), `run`, `stop`; `words --file FILE`, which prints a genesis-client test identity's ID and signing words, to bring it in; and `check URL`, which compares the web client a server serves with the release in `built/`. Port 8472. |
| `src/version.ts` | The program's version (the desk's fingerprint), so the app restarts a program left running from older code. |
| `src/page/` | The page: `ui.ts` its screens, clicks and forms, shared with the web client; `view.ts` its HTML and style; `app.ts` its start on the Mac, whose requests are signed by the desk's page client. |
| `src/chainwords.ts` | A new identity's chain key: a 256-bit seed written as the words seed Module's 24 words, and the chain key derived from it exactly as the air-gapped chain key Module derives key 0 (scheme 3). |
| `src/web/` | The web client: `app.ts` (Dub's code run in the browser), `keep.ts` (IndexedDB), `headers.ts` (its content security policy), `released.ts` (its files), and two shims the build puts in place of `node:crypto` and `node:fs`. |
| `scripts/build-web.ts`, `static/web.html`, `built/` | The web client's build (`npm run build` into `dist-web/`; `npm run release` into `built/`, with `BUILT-WITH.txt`). |
| `scripts/make-app.sh` | Makes `~/Applications/Dub.app` on macOS, which runs `open`, with its icon (`Contents/Resources/AppIcon.icns`). |
| `static/icon/`, `scripts/make-icons.ts` | The icon (H25): `dub.svg` drawn by hand; `dub.png` (256 pixels, Linux) and `dub.icns` (16 to 1024 pixels, the Mac) rendered from it by Chromium, in a page whose viewport is exactly each size (until 17 October 2026 a command-line window, whose PNGs came out cut off at the bottom; found and fixed by the Kišib session). The script makes Edubba's and Kišib's too, from `../desk/static/icon/edubba.svg` and `../kishib/static/icon/kishib.svg`. Run it only when a drawing changes. |
| `scripts/make-desktop.sh` | On Linux, the same: `~/.local/share/applications/dub.desktop` (and a copy on the desktop, if there is a desktop folder), running a launcher, `~/.local/share/mor/dub-launch.sh`, that remembers where Node and this folder are; its icon copied beside it, `~/.local/share/mor/dub.png`. The browser opens with `xdg-open`. |

The words are the identity carry Module's (`modules/module-identity-carry-words-draft-2.md`, code in `modules/carry/` and `modules/airgap/src/carry.rs`). The program's pairing domain line is still `MOR post, version 1`: changing it would unpair every browser already paired with an install.

### The look

Calm and sparse, one column, after Damus and Snort (studied for layout and feel only; no code copied, Damus being under the GPL): the visual bible's background `#06080c`, Inter, light and regular, bundled with Dub (below), colour only for a layer and at low saturation (a grey-blue for fingerprints, the Identity layer; a grey-violet for what is sealed, Envelopes), red only for a contest, a void act or a key changed elsewhere, no glow and no shadow. Compact posts and a quiet action row.

### Inter, bundled

*Decided by Nobody, allegedly (F332: "Inter bundled", "Yes."), so the look is the same everywhere.* Inter 4.1 (rsms/inter, its release's `web/` folder), light (300) and regular (400), woff2, unchanged, in `static/fonts/`: `inter_light.woff2`, `inter_regular.woff2`, and its licence beside them, `inter_license.txt`, the **SIL Open Font License 1.1**. The fonts are under that licence, not under Dub's (MIT or Apache 2.0); the OFL lets them be bundled and served with Dub as long as the licence goes with them. They are served from the page's own origin and nowhere else: on the Mac by the program (`/inter_light.woff2`, `/inter_regular.woff2`, `/inter_license.txt`, its policy then reading `font-src 'self'`; the desk's own policy is unchanged), and on the web as files of the release in `built/` beside the page. `src/fonts.ts` names them; the page's style declares them (`@font-face`, `font-display: swap`). Characters Inter does not cover fall back to the system font.

## Moving from MOR Post

Dub was MOR Post, in `clients/poster`, until 13 October 2026. On a Mac that has it:

1. In Terminal, from the MOR folder: `git pull`, then `cd clients/dub && npm install && sh scripts/make-app.sh`. This makes **Dub** in `~/Applications` and removes **MOR Post**, whose code is no longer where it pointed (double-clicking it after the pull would do nothing).
2. Nothing else: Dub keeps using `~/mor-poster`, its identity and its paired browsers, for as long as `~/mor-dub` does not exist. To give the folder the new name, quit Dub (`node --import tsx src/cli.ts stop`) and `mv ~/mor-poster ~/mor-dub`.

## Readings

Where the texts are silent, Dub takes these readings. *To be confirmed by Nobody, allegedly.* Readings 1 to 8 of the first Dub stand where still true; these replace them.

1. **A program on the Mac, a page in the browser,** paired without typing.
2. **The chain key's words shown once at creation, kept nowhere** (F332, amended), on the Mac as on the web; from then on only the signing key's words, on request. An identity made by Dub on the Mac before this change keeps its chain key in its folder, unused and untouched: nothing deleted, said in the identity window.
3. **H3:** the words are removed from the page before three are asked back; a reload asks for the three. Three positions, at random, different, in order.
4. **An inbox and an encryption key at once:** routes naming the relays as outbox and inbox; the encryption key the signing key's words carry (the carry Module, draft 2, 2a).
5. **An identity brought here publishes no routes and no encryption key** (versioned; a second writer forks them), but may publish and withdraw names (not versioned). After a rotation made elsewhere it renews the encryption key only where it published the last version.
6. **Before each act it signs, Dub looks the identity up** and refuses if its key is no longer the current one, saying so and pointing to Kišib. *Cost:* one look-up per act. The page also checks once when the app opens.
7. **The feed is the site's** (website cMIP, draft 6): the identity's own posts and those it follows, at their outbox routes and this identity's relays, judged together, **in signed order**, at most thirty. MOR has no clock; the page says so.
8. **"To you"** is what the inbox holds that answers one of this identity's posts or names it as recipient, and the feed's posts that answer it. Silence proves nothing: a reply never delivered to the inbox, by someone not followed, is not found.
9. **Replies** name the post they answer with its signer (F272) and are addressed to its signer, and left unsealed in its inbox, as Dub's public messages are.
10. **Private messages** are sealed to the recipient's current encryption key (F293) and left in its inbox; the private act itself, locked, goes to the sender's homes too, so this app's line can be rebuilt by whoever changes its keys (Identity rule 35). Sent messages are kept in the app; received and sent are listed in the order this app found or sent them, its own time, said.
11. **Counts** are what has not been looked at in this app; nothing is published about it.
12. **Several identities,** one in use; switching is a click in the identity window.
14. **The Signing tab is per identity, off by default** (F59), turned on in the identity window after a warning in its own words.
15. **Where the one-time secret is held, and for how long** (asked by Nobody, allegedly): in this app only, in the identity's `signing.json` on the Mac (owner-only, beside its keys) or its `signing:ID` entry in the web client's storage, from the moment you sign until your share has been shown and three of its words typed back, or you say it came by hand. Then it is deleted. If the app is lost before the share arrives, the share is lost too, and must be dealt again.
16. **A share is shown once:** a reload after it was shown asks for three words, never shows them again; a wrong set keeps the one-time key until they are right.
17. **A proposal is a thread's first message** whose first reference names the act to sign; later messages of the proposer in its thread are shown with it (the founding's "it is founded"), and the collective it concerns is its second reference.
18. **The follow list sealed to oneself** (people cMIP draft 2, H29): sealed to the identity's current encryption key as its homes serve it, only where this app holds that key; left at every home of the identity, its locked act at the homes too (Identity rule 35). Read when the feed is read (at most once a minute; at once with **Look again**) and before each change; one act per change. Where no home answers, the list stays here and is sealed at the next change.
19. **The relay view** reads each of this identity's relays from where it last read them (this app's memory only, the latest 300 acts per relay), shows at most thirty, and judges posts as the feed does. Its order is each relay's arrival order: not a time, said.
20. **Leaving an identity** (H28) forgets nothing: it only sets none in use.
21. **A reload keeps the tab** (H30) in this browser's session storage (`dub:tab`); the filter is never kept (Everyone again). **Folds** (H34) in its local storage (`dub:folds`). Neither holds anything of a key or a person.
22. **Look for my share** (H30) reads the inbox again, as opening the Signing tab does; the automatic look runs every 15 seconds while the tab is open and a share or an answer is awaited.
13. **A long-form document** (a text act naming the long-form format) is shown as its title and a link to the reader (`https://reader.dubsar.org/#ACT`, or the reader `dub.json` names).

## Signing and notarising (an open choice for Nobody, allegedly)

`scripts/make-app.sh` makes the app on the Mac it runs on. It is not signed or notarised; macOS opens it without a warning there, since it was not downloaded. It also needs this repository, Node 22 and the core library's WebAssembly on that Mac: it runs the code where it is.

For other people's Macs, two things would be needed:

1. **A self-contained app:** Node, the code and the WebAssembly inside the app, built by a script, so nothing else is installed. Not built.
2. **Signing and notarising,** so macOS opens it without "cannot be opened because the developer cannot be verified": an Apple developer account (the Apple Developer Program, a yearly fee, in a person's or an organisation's name), a "Developer ID Application" certificate, signing with `codesign` under the hardened runtime, sending it to Apple with `xcrun notarytool submit`, and stapling the ticket with `xcrun stapler staple`. Without it, others must right-click the app and choose Open, or allow it in System Settings, Privacy & Security.

Whose name the account is in is the choice: it is shown to everyone who opens the app.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../desk && npm install && cd ../site && npm install && cd ../dub
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed); Chromium at /opt/pw-browsers or MOR_CHROMIUM
npm run test:build  # the web client built here is the release in built/ (needs the tools BUILT-WITH.txt names)
MOR_SCREENSHOTS=DIR npm test   # also keeps a picture of every screen
```

- `test/dub.test.ts`, against three homes and a relay on local ports and the app's program, through a client signing exactly as the page does:
  - the first screen's words; the page asks only for operations the program answers;
  - **a new identity:** the chain key's words, nothing of them (words, seed or key) in the folder before or after; refused until three words are typed back, no genesis meanwhile; the genesis committing the key the words give; **an inbox and an encryption key at once**, the one the signing key's words carry; the signing key's words on request, labelled, not the chain key's; a post, a phone photo stripped, the feed newest first, a withdrawal; someone else's picture refused; starting again forgets only the new one;
  - **several identities**, switched and forgotten; **a folder from before** moved into the new layout;
  - **a public message** to an identity, left in its inbox; bad IDs and an identity with no inbox refused before anything is signed;
  - **two people:** follow by ID with a name kept here; the followed posts in the feed with the name beside the fingerprint; **a reply** naming the post and its signer, addressed to it, in its inbox; **"to you"** with its count until seen; follow from an act; **mute** hiding posts, replies and messages, never published; unmute; unfollow;
  - **the follow list:** private by default; published only with its warning; versions 1 and 2; back to private, an empty withdrawn version 3, then nothing; the names given never in an act;
  - **a display name at creation (H12):** a malformed one refused before anything is made, nothing waiting; given, published right after the genesis, read by anyone; none given, none published;
  - **a display name:** malformed names refused; shown beside the fingerprint; renamed with the old one withdrawn; seen by a follower; withdrawn;
  - **a private message, sealed:** at the relay never in the clear; opened by its recipient, verified, counted until seen; kept as sent; **the recipient brought into a third Dub by its signing key's words opens it too**;
  - **an identity made by the genesis client:** wrong sets refused; brought without private messages, said; it publishes no encryption key of its own; two lines, both valid; the genesis client, standing in for MOR Safety, rotates keeping every line; Dub refuses to sign, `check` says why; the old words refused, the new ones taken, a new line;
  - **after a rotation made with the chain key's words** (key 0 of the seed Module, as MOR Safety will do): Dub's line kept, the new words taken, **the encryption key renewed** from them; old and new messages open;
  - **a long-form document** in the feed: no text, its title, a link to the reader;
  - unpaired requests refused; nothing listens beyond 127.0.0.1.
- `test/dub.test.ts`, after human test 10: **the follow list sealed to the identity** (people cMIP draft 2): written at a change, with its names, sealed at its home, neither name nor ID in the clear anywhere; read by anyone holding its encryption key; nothing public; **another Dub holding the identity by its words** finds it with its names, changes it, and the first reads the change; versions continued; **a list kept in the app before carried over** once, then nothing new written; **switching (H28)**: leaving keeps every identity held, none in use, nothing signed, then used again; **the relay view (H29)**: posts of an identity not followed, newest first, verified; its display name named; muted ones left out and counted.
- `test/names.test.ts`: a name's form; two counting names both shown, in act id order; a withdrawn, malformed or other cMIP's name not shown.
- `test/people.test.ts`: a follow list's chain; a skipped version ignored; a fork read as forked; draft 1's versions and draft 2's one chain; **the sealed list**: opened only with its own key, names inside, never in the clear at the home; another's list sealed to it not taken; a fork taking the longer branch, said.
- `test/browser.test.ts`, headless Chromium, by clicks and typing alone, every screen in turn: the identity window, **a display name in the make form (H12)**, refused when malformed, then published at birth and shown in the header, the chain key's words with nothing asked beside them, **hidden before three are asked (H3)**, a wrong word refused, born; a post and a picture; another person's Dub, followed by ID with a name; a long-form document as a link; **a reply** from the action row; **counts** on both tabs; **To you**; **the private tab**, a message received, answered, sealed; **mute** and unmute; the identity window: **a display name**, **the signing key's words**; a second identity brought by clicks and the switch; **a key changed elsewhere**, said, the new words taken; **the relay view (H29)**; **a reload keeping the Private tab (H30)** and the people fold as left (H34), the filter back to Everyone; **Switch identity (H28)**: left first, then the held identities to choose and the doors folded; no console error, nothing the content security policy refused; **Inter, light and regular, loaded from the program**, served as `font/woff2` under a policy with `font-src 'self'`, its licence beside it.
- `test/web.test.ts`: the web client (below).
- `test/desktop.test.ts`: `scripts/make-desktop.sh` under a home folder of the test's own: the entry named Dub, running its launcher, **its icon beside it (H25)**; `scripts/make-app.sh`: `Dub.app` with `AppIcon.icns` named in its `Info.plist`, an icns file of PNG entries up to 1024 pixels; the launcher, run as the desktop runs it, starts the program in `~/mor-dub` and logs its one-time pairing link; then stopped. Runs on GitHub's Linux machines with the rest.
- The Signing tab across apps, in `../desk/test/real.test.ts` (Dubs on the Mac, by their requests) and `../desk/test/real-browser.test.ts` (Dub on the Mac and Dub's web client, in their own browsers, by clicks): a proposal waiting while Signing is off; read in plain words; signed; the share shown once, hidden, three words typed back, the one-time key destroyed; **Look for my share** said not arrived, a reload keeping the Signing tab, then the share found by itself (H30); a release read with its files and signed; a decline; a member change signed; nothing of a share or a one-time secret in the folder or the web client's storage, read whole.
- `test/launcher.test.ts`, `test/chainwords.test.ts`, `test/web-build.test.ts`, `test/build/`: unchanged.

## Using it (a human test, on the author's Mac)

*The build window cannot reach the deployed homes, and keeps no keys.*

1. Once, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install && cd ../site && npm install
   cd ../dub && npm install && sh scripts/make-app.sh
   ```
2. Double-click **Dub** in `~/Applications`. The page opens, paired, on the identity window. An identity Dub held before opens as it was.
3. **Make a new identity:** the home addresses you use for test identities, one per line; relays the same, or empty. Write the chain key's 24 words on paper, press **I have written them down**, type the three asked.
4. Post a text, then one with a phone photo. Give yourself a display name in the identity window.
5. On the web client (or a second copy: `node --import tsx src/cli.ts open --dir ~/mor-dub-2 --port 8473`), make a second identity. Follow each from the other by ID (Copy ID in the identity window). Reply to a post; see **To you** and its count on the other side. Write privately from one to the other; see it open on the Private tab.
6. **On Linux:** the same, with `sh scripts/make-desktop.sh` in place of `make-app.sh`; then choose **Dub** in the applications menu (or on the desktop: some desktops ask once to allow launching it).
7. To bring a test identity made earlier with the genesis client, print its words with `node --import tsx src/cli.ts words --file ~/mor-test/a.json` (only for test identities; the words are its signing key).

## The web client (F281: "With risks stated, for testing purpose only")

*Decided by Nobody, allegedly, 13 October 2026; to be served at `dub.dubsar.org`.*

### In plain words

The same Dub page, but nothing to install: it is served as a few files, and everything runs in the visitor's browser, every act checked by the core library compiled to WebAssembly. Every page carries a banner: **for testing only**, and two risks in plain words. Whoever serves the page's code at the moment an identity is made could copy its keys. And the browser's storage, where the signing and encryption keys are kept, can be lost, or read by what runs in the page.

It makes an identity as Dub on the Mac does: the chain key's 24 words shown once, never in the browser's storage (a test reads that storage to check); the signing and encryption keys kept in the browser, not locked, because the only lock the page could use is one it could open by itself. The way out is **Show the signing key's words**.

### Precisely

- **A new identity** (`Dub.begin`, the same on the Mac): a 256-bit seed from the secure random source; its 24 words (BIP-39 encoding, the words seed Module); the chain key derived as the Module derives key 0 under scheme 3 (`chainwords.ts`); the genesis committing it. The identity file never holds the chain key. Until three words are typed back, the seed is held in memory only; after, it is dropped.
- **Kept** in IndexedDB, database `dub`: `identity:ID`, `settings:ID`, `people:ID`, `active`. `WebKeep.saveIdentity` refuses a file holding a chain key. Every signing step runs under a Web Lock. An identity kept before 16 October 2026 is moved under its ID.
- **The banner** is in the page's HTML itself (`static/web.html`), so it shows even when the script does not run.
- **Its icon (H35)**: Dub's, as the tab's icon (`icon.png`, 256 pixels) and as the icon a phone keeps when the page is added to its home screen (`apple-touch-icon.png`, 180 pixels, full bleed on the icon's dark, made by `scripts/make-icons.ts`), both files of the release, served from the page's own origin within its policy; the release test checks them.
- **`dub.json`** beside the page, optional, https only: `{"homes": [...], "relays": [...], "reader": "https://…/"}` fills in the form and names the reader; trusted for nothing else.
- **The build** (`scripts/build-web.ts`): the shared client code with the reader's browser core library, not minified, reproducible; anything from Node fails the build except two shims. **The release**: `built/`, Inter and its licence included, with `BUILT-WITH.txt`; `mor-dub check URL` compares a server with it.

### Tests

- `test/web.test.ts`, headless Chromium, the built page served with its headers, real homes and a relay: the banner on every screen; a display name given in the make form, published at birth (H12); the chain key's words with nothing asked beside them, **hidden before three are asked (H3)**; **nothing of the chain key in the browser's storage** (IndexedDB, local and session storage, caches, cookies, read whole) nor on the page, before and after; the genesis committing the key the words give; an encryption key at once; a post, a reload, a second post in the same line; **the signing key's words**, not the chain key's; **brought into Dub on the Mac**, which starts its own line and opens the identity's private messages; a message from a third identity opening in both, with the count on the Private tab; **the follow list sealed on the Mac read in the web client with its names** (people cMIP draft 2); the lines going on, every post valid; forgetting it leaves no key in storage; **Inter, light and regular, loaded from the page's own origin**, its licence served, the policy reading `font-src 'self'`; no console error, nothing the content security policy refused. And an identity made by Dub on the Mac brought into the web client, its chain key's words refused where the signing key's are asked.
- `test/chainwords.test.ts`, `test/web-build.test.ts`, `test/build/`: as before.

### Putting it behind Caddy (a later machine session; not done here)

1. Build the release on GitHub (or `npm run release` with the tools `BUILT-WITH.txt` names), and copy every file of `built/` but `BUILT-WITH.txt` (`index.html`, `dub.js`, `dub.css`, `mor_wasm_bg.wasm`, `inter_light.woff2`, `inter_regular.woff2`, `inter_license.txt`, and since H35 `icon.png` and `apple-touch-icon.png`) to `/srv/dub` on the server. Optionally a `dub.json` naming the test homes and relays, and the reader long-form documents open in (`"reader"`, default `https://reader.dubsar.org/`).
2. DNS: `dub.dubsar.org`, A and AAAA, to the server (the author's to add).
3. Caddy, then `sudo systemctl reload caddy`:
   ```
   dub.dubsar.org {
       root * /srv/dub
       file_server
       header {
           Content-Security-Policy "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self' https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
           X-Content-Type-Options nosniff
           Referrer-Policy no-referrer
           Strict-Transport-Security "max-age=31536000"
           Cache-Control no-cache
       }
   }
   ```
   **What changes on a server already serving Dub (Inter, 16 October 2026):** one line only, the `Content-Security-Policy` line inside the `header` block of Dub's site, which gains `font-src 'self';` right after `style-src 'self';`. Without it, the browser refuses the fonts and the page falls back to the system font. Caddy's `file_server` gives the `.woff2` files their type (`font/woff2`) by itself. Then reload Caddy, and copy the three new files with the others.
**What changes on a server already serving Dub (its icon, H35, 17 October 2026):** nothing in Caddy (the policy's `img-src 'self'` already allows the page's own images, and `file_server` gives `.png` its type); copy the two new files, `icon.png` and `apple-touch-icon.png`, with the others.
4. From another machine: `node --import tsx src/cli.ts check https://dub.dubsar.org/` in `clients/dub` says SAME (it compares every file of the release, the fonts, the licence and the icons included).

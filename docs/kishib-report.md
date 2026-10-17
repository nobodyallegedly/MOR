# Kišib: report

*17 October 2026 (`docs/state-of-mor.md`, open item 4; F335, F337). A GitHub session: test identities only; nothing touched the servers. Branch `claude/kishib`, one pull request, not merged.*

## In plain words

Kišib is built: the one place where a chain key is used, from paper, and then forgotten. Like Dub, it is a program on the Mac and Linux with its page, and the same page as a web client for testing only (to be served at `kishib.dubsar.org`, a banner stating the risks on every screen). It has Dub's look and an icon of its own: a cylinder seal beside the strip of clay it leaves.

It holds nothing between uses. The words typed are turned into keys for one act and overwritten. The program's folder holds only which browsers are paired with it, and the web client keeps nothing in the browser's storage. The tests read both whole.

What it does:

- **Change an identity's keys** from its chain key's paper words. Kišib finds every line of the identity's acts (Dub's, Edubba's, the web client's) and says each in plain words. It reads everything back before signing, waits for the homes' receipts, and sends the exact same bytes again if they stall, never a second rotation. Then it shows the new signing key's words once, to carry to Dub and Edubba.
- **Rotate a collective** from its members' paper shares, completing a member change proposed in Edubba. Remote by default, as F337 lays out: a must-read screen first, then a one-time key that expires after an hour, exactly the threshold of shares, and rebuild, rotate and deal in one sitting. In the same room, the papers are typed into one device instead. The new shares go to the one-time keys the members' Dubs made when they signed the change, as at the founding. The collective's new signing key's words are shown once, for Edubba.
- **Escape a contested position** with both keys (F299): when someone else has changed the keys with the stolen paper, or two rotations contest a self-hosted position.
- **Name or confirm a successor** (F300), each side's screen saying what it signs.
- It may also **check paper words** without signing anything, and **show an identity's record**.

And in Edubba (agreed beforehand, step two): an identity's record and a member change waiting for Kišib each have a box for the new words Kišib shows. With them, Edubba follows the change and signs with the new key.

## The questions asked, and their answers

1. **How Kišib reaches the members' one-time keys, and who signs the acts that carry the new shares** (the one-time keys travelled sealed to the founder). Answered by F337 (read whole): shares travel as at founding; remote by default with a one-time key and an announcement; each member consents to the rotation shown with its fingerprint; best practice (the key in memory only, signed at once, wiped; the signed bytes kept, not the key; exactly the threshold; the one-time key expiring, "an hour, say"; one sitting); and Nobody, allegedly's decision, "Kišib needs to lay all this properly to its users", built as the must-read screen.
2. **The rest of that design, together:** the starter is the member who proposed the change and types their signing key's words beside their paper share (only those open the members' answers); each other member types their paper share and their own signing words (MOR seals only signed acts, and the act records consent); in the same room, no signing words; the collective's new signing words are shown once, for Edubba, which needs a small "take the new words"; the expiry is one hour. **Answered:** the overlap with Edubba asked for and given; then "The one-hour expiry stands", and the Edubba pieces "exactly as you proposed", fitted to Edubba's new code, after its session merged (pull request 73).

## What was built, precisely

| Where | What |
| --- | --- |
| `clients/kishib/` | Kišib: its code (`src/kishib.ts`, `collective.ts`, `read.ts`, `words.ts`, `common.ts`), its program and page, its web client and release (`built/`), the Mac app and Linux entry, the icon, its tests. The README says each file and its readings 1 to 13. |
| `wasm/src/lib.rs` | `makeRotation` takes `successor` (a MOR identity, as `["mor", id]`), `endSuccession`, and `homeless` (which must name new homes). |
| `clients/genesis/src/lookup.ts` | A reader also asks the new homes a held homeless rotation names, at the position after the latest that counts (the flaw below). |
| `clients/desk/src/kishib.ts`, `server.ts`, `setup.ts`, `real.ts`, `page/` | Edubba after Kišib: `identity renew` and `real collective renew`; the two boxes; `WAIT_FOR_KISIB` reworded (no longer "Kišib is not built yet"; it says where to start); a proposal marked in force (`rotated`); "MOR Safety" read as Kišib in the record. |
| `clients/desk/src/collectives.ts` | Edubba's reading of a collective follows a missing signature act's signer (the second flaw below). |
| `clients/desk/test/real.test.ts`, `edubba-setup-browser.test.ts` | The member change's rotation in Kišib instead of the repo client; Edubba taking the collective's new words, a release signed with the new key counting; the identity's box by clicks. |
| `clients/dub/scripts/make-icons.ts` | Renders each icon at exactly its size; makes Kišib's (the third flaw below). |
| `.github/workflows/test.yml`, `release-kishib-web.yml` | Kišib's tests in the GitHub run; its web client's release, as Dub's, on `[release kishib web]` or by hand. |

## Found while building (writing code is also a review)

None in a MIR or a Module. Three in clients, each fixed here:

1. **No reader could ever count an escape** (the genesis client's look-up, reading B2 of `docs/f272-build.md`). A reader asks only the homes in force at the latest position that counts, "never a home only a rotation that does not count names". A homeless rotation's receipts can come only from the new homes it names (Identity, receipt check 3; homeless procedure, step 5), so they were never read: Dub, the reader and Edubba would keep the thief's key current, and refuse the owner's new words. Fixed narrowly: the new homes of a held homeless rotation, at the next position only, are asked too. For the same reason Kišib leaves the escape at the old homes and relays too, where a reader meets it. *Taken as a development-layer correction; to confirm.*
2. **Edubba could not read a collective after its member change took effect.** It read only the current members' acts, so the joining member's signature, which the rotation declares, was "not held" and Agreements refused the reading (red, under "What you may do for it"). It now follows a missing act's signer. The repo client's stand-in would have hit it too; no test looked.
3. **Dub's and Edubba's icons were cut off at the bottom** (the 256-pixel PNG for Linux, and likely the Mac's small sizes): the script's command-line Chromium window came out shorter than asked. It now renders through a page of exactly each size. Both icons are remade, unchanged in drawing.

Also stated: **Edubba had no "renew"**; Dub had. Built here, as agreed.

## Readings (to confirm), and costs

In `clients/kishib/README.md`, readings 1 to 13, and its "Costs, stated". The main ones: the same paper serves every rotation (key *n* signs, key *n*+1 is committed); what a sitting holds in memory, and for how long; rule 29 without memory (the homes read first; the screen says that closing Kišib mid-rotation loses the new key, and that the next rotation from the same paper repairs it); the collective request leaves out the keys it creates (as the air-gapped Module's request hash does); the request travels as unsigned media found by its fingerprint; a member's share sealed in a private act the member signs; the hour on each device's clock; a self-hosted identity read from its relays too; an identity that declares a clock is not anchored by Kišib (said in the review).

## Tests

- **Kišib** (`clients/kishib`, all passing here):
  - `identity.test.ts`: a personal rotation keeping three lines (Dub, the web client's code, Edubba), every earlier act valid after it; a rotation stalled and sent again with the same bytes; the new words once, taken by Dub; nothing in the folder.
  - `rare.test.ts`: an escape after a thief's rotation; F299's self-hosted contest and its escape; a succession declared and confirmed.
  - `collective.test.ts`: a remote collective rotation from two of three paper shares, completing a member change proposed in Edubba; the hour; the same room.
  - `browser.test.ts`: the same in headless Chromium, by clicks: an identity made in Dub's web client, the escape and the succession, the program's page for a collective, Edubba's box. The web client's storage is read whole and empty.
  - Also: `web-build.test.ts`, `build/`, `desktop.test.ts`.
- **Every existing test** was run here after these changes: the Rust workspace and every client and Module package (results in the pull request). The GitHub run is in the pull request.
- **Screenshots** of every screen were sent in the session.

## H35 and H36: the web clients' icons, and Kišib's tint

**H35, the web pages' icons.**
- **Dub's web client and Kišib's** each show their app's icon:
  - as the page's tab icon: `icon.png`, the 256-pixel PNG;
  - as the icon a phone keeps when the page is added to its home screen: `apple-touch-icon.png`, 180 pixels.
- **The home-screen icon is full bleed**: the icon's dark square is scaled just past the edges, and the phone rounds the corners itself. `clients/dub/scripts/make-icons.ts` now makes it for every app (`NAME-touch.png`).
- **Served from the page's own files**, within the existing policy (`img-src 'self'`). Nothing in Caddy changes; the two files are copied with the others.
- **Checked:** both files are in each release, and the release test checks the page's links and the bytes. The browser tests load both icons as images under the policy.

**H36, Kišib's tint.** The Identity layer's glacier blue, `#8ec5f0`. It goes on outlines, separators and quiet accents only, never on text that must be read. Red (`#b4615f`) stays for a contest, a void act or a stolen key. **The rule, for every app to match:** each value is the layer colour laid over the background `#06080c` at a share, channel by channel:

| Use | Share | Kišib (glacier `#8ec5f0`) |
| --- | --- | --- |
| Separators (`--line`) | 22% | `#24323e` |
| Outlines of cards, fields, buttons (`--edge`) | 30% | `#2f4150` |
| Quiet accents (`--tint`): a hover or focus outline, a fold's mark | 60% | `#587995` |

Dub (pearl), Edubba (emerald), Damgar (gold) and Ummia (coral) take theirs the same way from their own layer colour; the visual bible's hex values for those are not in the repository, so they are not computed here. In code: `clients/kishib/src/page/view.ts`, `TINT`, laid over Dub's style; the release test checks the values against the rule.

**The icon, tinted more strongly** (the author, H36: "Colors are too subtle, thicker line, and subtle tints on the fills"). Each value is a colour moved toward the layer colour by a share, channel by channel. The same rule gives Dub (pearl) and Edubba (emerald) theirs later.

| Part | Rule | Kišib |
| --- | --- | --- |
| The thick edge, 16 units of 1024 | the layer colour at 70% over the dark `#06080c` | `#658cac` |
| The dark square | `#06080c` moved 6% toward it | `#0e131a` |
| The stone of the seal (body, top) | `#6c7683`, `#8b95a1` moved 25% | `#758a9e`, `#8ca1b5` |
| The clay | `#8a6a50` moved 12% | `#8a7563` |
| A line on the seal's top, 6 units | the layer colour itself | `#8ec5f0` |

The home-screen icon leaves the frame out and takes the square's fill, edge to edge; the phone rounds it.

**The name in cuneiform: 𒈩, carved.** H36's rule: a sign is checked against a standard reference before it is carved. This environment's network refuses the ePSD (`oracc.museum.upenn.edu`), the ETCSL and Wiktionary, so I worked from search results quoting them. They disagreed with 𒆨 as the sign:
- **𒆨, U+121A8**, is named KISIM₅ in Unicode; the ePSD2 sign list (letter K) gives it only the reading *kisim₅*.
- **kišib, "seal"**, is a value of the sign **MES**, 𒈩 (U+12229), in the Oracc Sign List's MES entry and in the ETCSL sign list (MES: kišib, meš₃). The Digital Corpus of Ancient West Asian Seals (the KIŠIB project) says the same: 𒈩 is the logogram for Sumerian kišib and Akkadian kunukku.
- **kišib₃** is a value of DUB 𒁾, and **kišib₂** of PEŠ₂.

The author confirmed **𒈩 (kišib)** against Wiktionary and sent its picture. Noto Sans Cuneiform, the only cuneiform font reachable here, draws the same structure. I traced the picture's eleven wedges by hand into the icon's drawing, then laid my tracing over the picture to check them wedge by wedge. It is carved once on the seal, mirrored, at the top, as a seal is cut, and once on the clay, at the bottom, as it leaves it (the author: "Bottom on the right, and top on the left"). The 𒆤 (KID) I had written beside Kišib's name earlier was wrong, and is removed. For Dub (𒁾) and Ummia (𒌝𒈪𒀀): the same check, then a traced or drawn form the author approves.

**The releases, rebuilt here:** putting the icons in Dub's web release meant rebuilding it, and Dub's release test requires its core library to equal the display client's. So the display client's release (`clients/site/built/`), Dub's and Kišib's are all rebuilt in this pull request, with the pinned tools of `BUILT-WITH.txt` (Linux x86-64, as the GitHub release workflows). Each `npm run test:build` passes here. GitHub's own build of the display client is compared in its run.

## After the merge

- **The releases are rebuilt in this pull request** (the display client's, Dub's web client's and Kišib's: the core library and the look-up changed, and H35). A server session copies them: `dubsar.org` (the display client), `dub.dubsar.org` (its two new icon files with the rest), and later `kishib.dubsar.org`. If GitHub's build of the display client differs from these bytes, release again with `[release display client]` and `[release dub web]`.
- **`kishib.dubsar.org`**: a later server session copies `clients/kishib/built/` (Caddy as Dub's, `root * /srv/kishib`). Until then, Kišib is the Mac and Linux app; a member on a phone gives their share in the same room instead (below).
- **For Edubba's next session**: F337's plain words where Edubba founds a collective (the founder's device as dealer); and the warning that sends a person to Kišib when a key was changed elsewhere (Edubba's record now takes the new words; the warning on opening and before every act is that session's). Dub's screens still say "MOR Safety" in two places; that session or Dub's next.

## Human test 9: the author's rotation test

*Test identities only. Use homes reachable without Tor (home1, home2): Kišib has no way to an onion address.*

1. **Get the code**, on the Mac, in Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../desk && npm install && sh scripts/make-app.sh
   cd ../dub && npm install && sh scripts/make-app.sh
   cd ../kishib && npm install && sh scripts/make-app.sh
   ```
   (On Linux: `make-desktop.sh` in place of `make-app.sh`.) This makes **Kišib** in `~/Applications`, beside Dub and Edubba.
2. **A test identity with three lines.**
   - In **Dub** on the Mac: make a new identity, homes `https://home1.dubsar.org` and `https://home2.dubsar.org`, relays the same. **Write the chain key's 24 words on paper**, labelled "chain key, test identity 9". Type the three asked. Post "Before the rotation, from Dub".
   - Identity window, **Show the signing key's words**, and **Copy ID**.
   - On `dub.dubsar.org` (phone or iPad): **Bring an identity you have**, with its ID, the signing key's words and `https://home1.dubsar.org`. Post "Before, from the web client".
   - In **Edubba**, Identities tab: bring it the same way. Then rely on any post of another test identity (Its record, **Rely on an act**, type RELY): Edubba's own line.
3. **Check the paper first** (nothing signed): open **Kišib**, **Check paper words**, then give the ID, `https://home1.dubsar.org` and the chain key's words. It must say "These are the right words" and "key 0 of these words". Try the signing key's words too: refused.
4. **The rotation:** **Change an identity's keys**, then the ID, the address and the chain key's words, then **Read it back**.
   - Read it all. Under "Its lines of acts: what this rotation keeps" there must be **three lines, each "Kept."**: two texts and a witness act. If there are fewer, stop and report.
   - **Sign it**. If it says "It does not count yet", press **Send it again (the same bytes)** until it counts.
5. **The new words:** **Show the new signing key's words**. Write them on paper, labelled "signing key, after the rotation". Press **I have written them down**, then type the three asked. Kišib says it forgot them. Close it.
6. **Give the new words to the apps:**
   - **Dub** on the Mac says the key was changed elsewhere: paste the new words and press **Use the new words**.
   - **Dub's web client**: the same.
   - **Edubba**, the identity's record: **Take the new words**.
   - Post once from each.
7. **Earlier posts still verified:** in Dub's Public tab on the Mac, the posts made before the rotation, from Dub and from the web client, still show, and none carries a red mark (Dub marks a void post in red). To check one as any reader would: hold the pointer over its "act …" to see its full id, then open `https://reader.dubsar.org/#` followed by that id. It must read **verified**, not void. That was the rehearsal's fix. The dubsar.org feed shows only your author identity's posts (H7).
8. **Nothing kept:** look in `~/mor-kishib`. It holds only `access.json`, `run.json` and `kishib.log`. Search it for any of your words: none.
9. **Report**, as for every human test.

## Finishing the member change of human test 10

*The state left by human test 10 (H24): the founder (made in Dub on the Mac, home1, brought into Edubba), ColA and ColB (on the iPad and the iPhone, in Dub's web client), and a fourth member, all signed the member change; Edubba says it waits for Kišib. The new members' Dubs hold the one-time keys they made when signing. Keep them as they are.*

1. **Get the code**, on the Mac, as in human test 9, step 1. Open **Edubba**, Collectives tab, the collective. Under the member change, the note now says where to start, and a box waits for the collective's new words. Copy the collective's ID (**Copy ID**).
2. **The founder's words**, from Dub on the Mac (the founder's identity): **Show the signing key's words**. Have your own paper share at hand (its number and 24 words, written at the founding).
3. **Start the rotation**, on the Mac: open **Kišib**, **Rotate a collective**, and give:
   - the collective's ID and `https://home1.dubsar.org`;
   - your share's number and 24 words;
   - your ID (the founder's) and your signing key's words.
   Press **Read it back**. Read the red-bordered screen first, about what this device will hold, and tick it. Then read the change, its signatures, the lines and who gets which new share. Press **Sign it**. Kišib shows the rotation's fingerprint, "1 of 2 shares are in", and the hour's end.
4. **A second paper**, two ways. The member's Kišib must give its share within the hour.
   - *Remote* (once `kishib.dubsar.org` is served after the merge, or with Kišib on a second computer):
     1. In ColA's Dub (iPad), Signing tab, the member change shows a message: "A rotation of the collective … waits for your paper share, in Kišib", with the fingerprint.
     2. Open Kišib there and choose **Give my share to a collective's rotation**. Give the collective's ID, the fingerprint and `https://home2.dubsar.org`, then press **Read the rotation first**. Compare the fingerprint, character by character.
     3. Type ColA's ID, ColA's share's number and 24 words, and ColA's signing key's words (ColA's Dub: Show the signing key's words). Press **Read it back**, then **Sign it**.
   - *In the same room, now:* instead of step 3, tick **Everyone is here** (no signing words), type your paper, sign, then type ColA's paper in the next box (**Add this paper**). Then every new share is shown on the Mac's screen, and each member's Dub will say **I received my share by hand**.
5. **Rotate**, on the Mac's Kišib: press **Look for the members' shares** (remote), then **Rebuild, rotate and deal now**. If it says "does not count yet", press **Send it again (the same bytes)**.
   - **Your new share:** **Show it**, write its number and 24 words on new paper, press **I have written them down**.
   - **The collective's new signing key's words:** **Show the collective's new signing key's words**, write them down, then type the three asked.
6. **Each member's new share:** in the Dubs of ColA, ColB and the fourth member, Signing tab, the member change: **Show my share of the chain key, once**. Write it on new paper and compare the new dealing's fingerprint across devices. In the same room, press **I received my share by hand** instead, after writing the share shown on the Mac.
7. **Edubba:** the collective's page, under the member change, **Take the new words**: the collective's new signing key's words. It says "The member change is in force"; the members list shows the new members.
8. **Destroy the old papers.** Once the rotation counts, they open nothing.
9. **Check:** a release from Edubba (the collective's page, **A release**), signed by one other member in their Dub, then **Check it as anyone would**. It counts, signed with the new key.
10. **Report**, as for every human test.

# Kišib (mor-kishib)

**Kišib** (𒆤, Sumerian "the cylinder seal": a person's mark of authority, serious to lose and serious to replace; F335): the one place where a chain key is used, from paper, and then forgotten. On the Mac and Linux, a program and its page, as Dub; the same page as a web client, **for testing only**, to be served at `kishib.dubsar.org`, with a banner stating the risks on every screen. Dub's look (F332), tinted with the Identity layer's glacier blue (H36: `src/page/view.ts`, `TINT`).

**Test identities only, until MOR is frozen.** Written "Kishib" in file and folder names.

## In plain words

An identity in MOR has two keys that matter here. The **signing key** signs everyday acts; Dub and Edubba hold it, and carry it by its words. The **chain key** exists only on paper: 24 words written once, when the identity was made. It is used only to change the signing key, for example when a phone is lost or stolen. Kišib is where that paper is typed, used for the act at hand, and forgotten.

**It holds nothing between uses.** The words typed are turned into keys for one act, then overwritten. Nothing is written to the program's folder (which holds only which browsers are paired with it) or to the browser's storage (the web client opens no database and writes nothing to local or session storage). A review left unconfirmed is dropped, with its words, after fifteen minutes. Close Kišib, and nothing of your words remains.

What it does:

- **Change an identity's keys** (F335). Give its ID, one of its homes, and its chain key's 24 words. Kišib reads the identity from every home its chain names and every relay its routes name, finds **every line of its acts**, the ones Dub made, Edubba made and the web client made, and says each in plain words (Identity rule 35): a line left out would have its acts become void. Everything is read back before anything is signed. Then it signs one rotation and sends it to every home. If the homes stall, **"Send it again" sends the exact same bytes**, never a second rotation (Identity rule 29). Once the homes' receipts are in, it shows **the new signing key's words, once**: write them down, they are hidden, three are asked back, and Kišib forgets them. Carry them to Dub (identity window, its "renew") and Edubba (the identity's record, "take the new words"). The same paper serves the next change: Kišib signs with key *n* of the words and commits key *n*+1 (the words seed Module).
- **Rotate a collective** (F337), completing a member change proposed in Edubba and signed by every member. Remote by default: the member who proposed it starts it in Kišib with their paper share and their signing key's words. Kišib first says, on a screen they must read and tick, what this device will hold and why it matters. It then announces the rotation in each member's thread (Dub shows it), with its fingerprint. Each other member opens their own Kišib, reads the rotation in plain words, and gives their paper share there. The share goes sealed to a one-time key that expires after an hour. Once exactly the threshold is in, the starter's Kišib does it all in one sitting: rebuilds the key, checks it against the commitment the collective's chain holds, signs, deals the new shares (each sealed to the one-time key its member's Dub made when it signed the change, as at the founding; the starter's own shown here once) and overwrites the key. In the same room instead: the papers are typed one after another into one Kišib, nothing is sent, and every new share is shown on that screen once. Afterwards the collective's new signing key's words are shown once, for the member who holds it (Edubba takes them).
- **Escape a contested position** (F299, Identity section 11): when someone else has changed your keys with your stolen chain-key paper, or two rotations contest one position of a self-hosted identity. With both papers (the chain key's words, and the signing key's words of the key you held before), Kišib signs a homeless rotation to new homes and an escape endorsement listing every rotation served at that position as abandoned.
- **Name or confirm a successor** (F300). The identity names its successor in a rotation, signed with its chain key's words. The successor confirms it with its own signing key's words: one act naming that rotation. Until then clients show it as declared and follow nobody. Each side's screen says what each signs.

What it may do: **check paper words** without signing anything ("these are the right words", or not, and which key of the words they give); **show an identity's record** (homes, receipts, lines, any contest, any succession).

## Precisely

| File | What |
| --- | --- |
| `src/kishib.ts` | The `Kishib` class: a sitting held in memory only (`state`, `forget`); reviews and their confirmation (`confirm`: the digest of exactly what was shown); `checkWords`, `record`; the identity's rotation (`rotatePlan`, `resend`, `refresh`, `showWords`, `written`, `typed`); the escape (`escapePlan`); the successor's confirmation (`confirmPlan`); the collective's operations, delegated to `collective.ts`. |
| `src/collective.ts` | F337: the starter's review with its plain words (`DEALER_SAY`), the change found from public acts (clones naming the agreement in force, every signature needed), the members' answers and one-time keys from the starter's inbox, the request (everything the rotation will say but the keys it creates) left at the collective's relays and found by its fingerprint, the announcement in each thread, a member's share sealed to the one-time key in a private act signed by the member, exactly the threshold gathered, the hour's expiry, rebuild/sign/deal in one sitting, the same room. |
| `src/read.ts` | Reading an identity as a reader of its homes and relays: the lookup the core library judges, every chain act found anywhere (a rival rotation served only at a relay included), the rotations served at the next position, the lines of acts, the record in plain words. |
| `src/words.ts` | The paper: chain keys from the words seed Module at any key index; a paper share's number and 24 words; overwriting secrets. |
| `src/common.ts` | What both share: the words said where words are typed and where new words are shown, addresses as typed, putting an act at a home (a home lacking the acts before it gets them first), an identity held in memory for one act. |
| `src/shapes.ts`, `src/ops.ts` | What the page is told; the operations by name, the same for the program and the web client. |
| `src/server.ts`, `src/cli.ts`, `src/version.ts` | The program: Edubba's local server on `127.0.0.1` only, paired browsers, Kišib's own domain line (`MOR Kišib, version 1`); its folder `~/mor-kishib` holds `access.json` and `run.json`, nothing else. Port 8474. `check URL` compares a server with the release. |
| `src/page/` | The page: `view.ts` (HTML and style: Dub's, with a few additions; the web banner), `ui.ts` (screens, clicks, forms; no browser storage at all), `app.ts` (from the program). |
| `src/web/` | The web client: `app.ts` (Kišib's code in the browser), headers, two shims for Node imports of the shared code, `released.ts`. |
| `scripts/build-web.ts`, `static/web.html`, `built/` | The web client's build, reproducible, not minified; `npm run release` writes `built/` with `BUILT-WITH.txt`. |
| `scripts/make-app.sh`, `scripts/make-desktop.sh` | `~/Applications/Kishib.app` on the Mac (shown as Kišib), and the Linux desktop entry, each with Kišib's icon. |
| `static/icon/` | The icon: a stone cylinder seal beside the strip of clay it leaves (`kishib.svg`), in the family's clay and stone, with glacier blue as a quiet touch (H36: the rim `#2f4150`, a thin edge on the seal's top `#8caac3` at 0.8), made into `kishib.png`, `kishib.icns` and `kishib-touch.png` (a phone's home screen) by `clients/dub/scripts/make-icons.ts`. The web client serves the first as its tab icon and the last as `apple-touch-icon.png` (H35). |

Shared, changed by this build: `wasm/src/lib.rs` (`makeRotation` takes `successor`, `endSuccession` and `homeless`); `clients/genesis/src/lookup.ts` (a reader also asks the new homes a held homeless rotation names, at the position after the latest that counts: without it, no reader could ever count an escape); `clients/desk/src/kishib.ts` and its hooks (Edubba takes the new words); `clients/desk/src/collectives.ts` (Edubba's reading of a collective follows a missing signature act's signer); `clients/dub/scripts/make-icons.ts` (exact sizes).

## Readings

*Where the texts are silent, Kišib takes these readings. To be confirmed by Nobody, allegedly.*

1. **The same paper for every rotation.** The rotation at position *n* is signed with key *n* − 1 of the words seed Module and commits key *n* of the same words (the air-gapped Module's key index, rule 3.3's "from its current seed"); nothing new is written on paper after a rotation. *Cost, stated:* whoever stole the words can derive every later key; after an escape, Kišib says so and advises moving to new paper.
2. **What a sitting holds, and how long, in memory only:** the words, from the review until it is confirmed or dropped (fifteen minutes at most), then overwritten; the signed rotation's bytes, to send again, until its new words are typed back; the new signing key, until three of its words are typed back. Strings the shared code keeps (a signing key in an identity held for one act) cannot be overwritten in JavaScript; they are dropped, never stored.
3. **No memory between uses, and rule 29.** Kišib does not remember what it signed once closed. Before signing it reads the homes: a rotation already served at the next position is never signed again; "Send it again" is offered, and if it was not yours, the escape. If Kišib is closed after a rotation reached a home but before its new words were shown, that rotation installs a key nobody holds; the identity is still yours, since the next rotation, from the same paper, installs a key you hold. Said on the screen while it waits.
4. **The new words are shown only once the rotation counts**, so they are never the words of a key that does not count.
5. **A collective's request leaves out the keys the rotation creates** (the next chain key, the new signing key), as the air-gapped Module's request hash leaves out the next commitment: members consent to everything else, shown with its fingerprint; the new keys are created at the moment of signing, in the same sitting as the rebuild.
6. **The request travels as media at the collective's relays, found by its SHA-256** (the fingerprint), unsigned: it decides nothing, and a member's Kišib checks it against the collective's chain (its previous act, its expiry) before showing it.
7. **A member's share is sealed in a private Envelopes publication signed by the member**, its media tagged `CONTRIBUTION_MEDIA` (a test value of Kišib's own), the share's number, value and the request's fingerprint inside. MOR seals only signed acts; the act also records consent. *Cost:* it starts a new line of the member's acts, which nobody else can read; leaving it out of the member's next rotation voids nothing of value.
8. **Exactly the threshold**: Kišib takes no more shares than the collective's agreement needs, and one per member; a share numbered for another member is taken and said, the rebuild decides.
9. **The hour runs on each device's clock**: MOR has no clock. A member's Kišib refuses a request past its expiry; the starter's Kišib destroys the one-time key at expiry, after which no sealed share can be opened.
10. **The escape's new homes must not be old homes** (an old home holds the rival and refuses any other rotation revealing the same key, rule 30). The escape is also left at the old homes and relays, where a reader meets it (an old home keeps it as evidence, rule 48) and asks the new homes for its receipts.
11. **A succession is confirmed by a link confirmation** (Identity type 7) naming the rotation, signed by the successor (F300 allows a witness act too).
12. **An identity that declares a clock** (Money rule 15): Kišib does not anchor a rotation's quorum, and says so in the review; the genesis client anchors.
13. **Reading a self-hosted identity:** a homes-only reader (the genesis client's lookup) does not see a rival served only at a relay; Kišib reads the identity's relays too, as the gauntlet's reader does.

## Costs, stated

- **The words are typed into an online device.** The air-gapped way (an offline device, the bytes by QR code, F335 (c)) is the gold standard and comes later; the web client is for testing only.
- **A collective's rotating device holds the whole old key and creates the new one** (F337, the Module's F97): if it were compromised or dishonest, it could keep the new key and later act alone. Said on the must-read screen.
- **The starter types their signing key's words** to open the members' answers and sign the announcement and the sealed shares; those acts start a new line of theirs.
- **Each member types their signing key's words** beside their paper share.

## Tests

```
cd ../genesis && npm install && npm run wasm
for p in desk dub barebone repo collective assess; do (cd ../$p && npm install); done
npm install
npm test            # real homes and relays from target/debug/mor-relay; Chromium at /opt/pw-browsers or MOR_CHROMIUM
npm run test:build  # the web client built here is the release in built/ (needs the tools BUILT-WITH.txt names)
MOR_SCREENSHOTS=DIR npm test   # also keeps a picture of every screen
```

- `test/identity.test.ts`: an identity made in Dub, brought into a second Dub (the web client's code) and into Edubba (a witness act), each with its own line; paper words checked (the signing words refused, the chain words right, a short set refused); the record's three lines; the rotation read back, three lines kept, nothing signed while reviewing, a wrong digest refused; **stalled** (two of three homes away), sent again while away, then **the same bytes** counting, every home holding the one same rotation; every earlier act valid; the new words once, hidden, three typed back, forgotten; Dub takes them; the next key is key 1 of the same paper; **nothing of the words, the seed or the new key in Kišib's folder**, read whole.
- `test/rare.test.ts`: **an escape** (a thief rotates in a Kišib of its own with the stolen paper; the owner escapes with both keys to a new home; counting as an escape for any reader, the earlier post valid, the new signing key the one shown); **F299** (a self-hosted identity, its home run by itself: the owner's rotation and a thief's at one position, contested, in red; a normal rotation refused; the escape listing both; counting); **a succession** declared, shown as declared, confirmed by the successor with its own words, then confirmed.
- `test/collective.test.ts`: human test 10's shape (a founder made in Dub and brought into Edubba, members in their own Dubs, a member change: one joins, one leaves); **a collective rotation from two of three paper shares, remote**: F337's screen first, the change and who gets what read back, the request's hour, the announcement in the member's Dub, the member's Kišib reading then giving, exactly two, rebuilt, rotated, counting; the new shares sealed to the members' one-time keys and opened in their Dubs, the starter's shown once; the collective's new words; the clone in force; nothing in either Kišib's folder. **The hour**: an expired request refused by a member's Kišib, the one-time key destroyed, nothing signed. **The same room**: papers typed one after another, no more than the threshold, every new share shown there.
- `test/browser.test.ts` (headless Chromium, by clicks): the web client, the banner on every screen, checking words, the record, **a rotation of an identity made in Dub's web client** keeping the lines of Dub's web client, Dub on the Mac and Edubba, stalled and sent again with the same bytes, the new words once; **the browser's storage empty**, read whole; the escape and the succession by clicks; **the program's page**: a collective rotation, F337's screen ticked first, a member giving their share in the web client, the new share and the collective's words shown once, Edubba taking them by clicks and reading the change in force; no console error, nothing the content security policy refused.
- `test/web-build.test.ts`, `test/build/`, `test/desktop.test.ts`: the release, reproducible, its icons (H35), the page asking only for operations that exist, its code touching no browser storage, the tint's values and where it may go (H36), `check`; the Linux entry and the Mac app with their icon.

## Using it

1. Once, in Terminal, from the MOR folder: `git pull`, then `cd clients/genesis && npm install && npm run wasm`, then `npm install` in `clients/desk`, `clients/dub` and `clients/kishib`, then in `clients/kishib`: `sh scripts/make-app.sh` (on Linux: `sh scripts/make-desktop.sh`).
2. Double-click **Kišib** in `~/Applications` (or choose it in the applications menu). The page opens, paired.

## The web client (testing only)

As Dub's (`clients/dub/README.md`, "The web client"): `npm run release` (or the GitHub workflow `release-kishib-web.yml`, on a merge message containing `[release kishib web]`), then copy every file of `built/` but `BUILT-WITH.txt` to `/srv/kishib` on the server, a DNS name `kishib.dubsar.org`, and the same Caddy block as Dub's with `root * /srv/kishib`. `node --import tsx src/cli.ts check https://kishib.dubsar.org/` says SAME. Not done here: a later machine session.

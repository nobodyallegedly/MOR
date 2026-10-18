# Ummia (mor-ummia)

**Ummia** (𒌝𒈪𒀀, Sumerian ummia, "the master" of the tablet house; F339): the developers' app, the Development layer's. It holds the developer's identity and acts in the Development layer only; whatever goes to another layer travels through MOR as acts, sealed to oneself where it is private (the working rule of 17 October 2026: the layers apart, talking through MOR). On the Mac and Linux, a program and its page, as Dub, Kišib and Damgar; the same page as a web client, **for testing only** (to be served at `ummia.dubsar.org`), with a banner stating the risks on every screen. Dub's look (F332: Inter bundled, low saturation, no glow), tinted with coral `#ee8b74` by Kišib's rule (H36: separators 22% `#392523`, outlines 30% `#4c2f2b`, accents 60% `#91574a` over `#06080c`; red only for alarms; `src/page/view.ts`, `TINT`).

**Test identities only, until MOR is frozen; regtest or signet only.** The report of its first round: `docs/ummia-report.md`.

## In plain words

**First, an identity.** Bring an identity you have, by its ID and its signing key's words, as in Dub (Ummia never makes one, and never holds a chain key). Ummia keeps its own line of acts for it; some of them are sealed (your accepted list, an anchor's payment), so its identity window shows the line's card to give Kišib when the keys are changed there.

**Who acts.** At the top of every tab: the chooser. In round 1 you act as yourself (decided by Nobody, allegedly: "Keep collectives for a second round of development"); the place where the collectives you belong to will show is kept, and says so. The chooser is a shared piece (`src/acting.ts`), for Edubba's Publishing tab to reuse.

**Releases.** A release of code under your own name, moved here from Edubba's Identities tab, with every check Edubba made: the folder chosen at each release (a git folder gives what git tracks; a plain folder every file but hidden ones; links never followed), typed as the Terminal or Finder writes a path, a near match named, or chosen with the picker; every file listed with its size and fingerprint, and the libraries from its lock files, before anything is signed; the release before it pre-set by name, chosen by hand; the specifications it implements, by their publications, read and named by spec hash; a file changed after the review refused. **Check it as anyone would**: the release fetched by its id from the relays alone, every file checked. **Anchor it on Bitcoin (optional)**: the anchoring service's offer read, a tier chosen; the payment prepared here as a draft sealed to you, signed and paid in Damgar; the anchor followed here, from asked to anchored at its block. A collective's releases stay in Edubba's Collectives tab until Ummia's second round. On a computer only: the web client reads no folder.

**Specifications.** A cMIP or a Module published as its act: its text, and only the fields your text fills (the tasks it fills, the act types it defines, the cMIP or MIR a Module works under, a rail's kind and binding, the layers it acts on as an extension, a predecessor, dependencies, a proof-of-delivery checker). Its **spec hash is shown before anything is signed**; content the core library does not read as a specification (F323), or text that is not canonical, is refused, saying why.

**Tracking.** Which cMIPs and Modules exist, by asking the public relays you name, with the filters relays already have (spec, type, signer): lines of drafts, creators and whether they claimed them, code released; **extensions**, which public agreements name which cMIPs; **xtypes**, act types defined from core pieces, and how many public acts use them; MIPs, by what they fork; and the plain look-up of one specification's acts. **Accept it** from a card adds it to your accepted list. The limit, said on the screen: *Ummia sees public agreements only; a sealed agreement's use of a cMIP stays invisible unless someone publishes it.* No index, nothing kept, no new cMIP; the listing on dubsar.org is one source among any, never a registry.

**MIPs.** A MIP started in the MIP shape (a fork of a MIR, of another MIP, or for a new layer of the MICS document), the shape checked as advice; drafts published for discussion as signed long-form documents, replies to them shown (from Dub or any client); **only when you are ready**, published as a specification (kind 8), naming you as its creator and what it would replace.

**Reports.** A bug report from your own identity, public, to the reporting identity named in Settings, left in its inbox (F287); its answers shown. The GitHub mirror is the reports client's, run by hand by the author.

**Accepted.** The whole sealed list of the cMIPs and Modules you accept (F340), one per identity, every app reading the same: each entry with its label and whose part it is; remove one, add one by hash or from Tracking; where two apps changed it at once, the fork shown and merged by your next change, nothing dropped; private by default, published by choice.

**Settings.** The relays your acts go to, the relays tracking asks, the reporting identity.


**Round 2 (F349).** A specification's hash is shown written for people (`mspec1…`), the hexadecimal beside, and taken in either form.

## Precisely

| File | What |
| --- | --- |
| `src/ummia.ts` | The `Ummia` class. The identity: `bring`, `renew`, `use`, `leave`, `forget`, `carry`, `check` (as Damgar's). Who acts: `setActing`. Reviews: `confirm` (the digest of exactly what was shown, within 15 minutes, once, never with reasons not to sign, the signing key checked current first), `cancel`. Specifications: `prepareSpec`, `specs`. Tracking: `track`, `actsOf`. The accepted list: `accepted`, `changeAccepted`, `publishList`. MIPs: `mips`, `newMip`, `saveMip`, `publishMipDraft`, `mipReplies`, `prepareMip`. Reports: `reports`, `sendReport`. Releases (the program's): `releases`, `suggestRelease`, `prepareRelease`, `confirmRelease`, `checkRelease`. Anchoring: `anchorOffers`, `anchorRelease`. The texts said on screen: `LINE_SAY`, `SPENT_SAY`, `NO_KEY_SAY`, `ACCEPTED_SAY`. |
| `src/acting.ts` | The chooser, shared (for Edubba's Publishing tab): `actors`, `chosen`, `chooserHtml`, `COLLECTIVES_LATER`. Nothing from Node. |
| `src/spec.ts` | A specification's content from a form (`specContent`), checked as canonical text and decoded by the core library (`prepareSpec`), published as Development's Part three says (`publishSpec`: a public publication whose media spec is the Development MIR's). |
| `src/track.ts` | Tracking: the website cMIP's listing code (`clients/site/src/listing.ts`) asked with filters (`track`); the acts of one specification (`actsOf`); `LIMIT_SAY`. |
| `src/mips.ts` | MIPs: what a MIP may fork (`FORKABLE`), the MIP shape (`SHAPE`, `template`, `shapeOf`), a draft as a long-form document (`publishDraft`), replies from the inbox (sealed copies opened) and the relays (`replies`). |
| `src/reports.ts` | Reports: `send` (the barebone client's `post` with `to`, and `leaveInInbox`), `answers` (the reporting identity's public text acts naming a report in `refs`). |
| `src/releases.ts` | Releases from a folder (Node, the program only): `Releases` (`suggest`, `prepare`, `confirm`, `check`), with Edubba's `filesOf` and folder reading, the repo client's manifests and `verifyRelease`. |
| `src/anchor.ts` | Anchoring a release: the service's offers (`offers`), the leaf and its blind, the draft for Damgar (`ask`), where it stands against the chain followed (`standing`). Nothing from Node. |
| `src/shapes.ts`, `src/ops.ts` | What the page is told; the operations by name, the same for the program and the web client. |
| `src/store.ts`, `src/server.ts`, `src/cli.ts`, `src/version.ts` | The program: its folder (`~/mor-ummia`), Edubba's local server on 127.0.0.1 (requests signed by a paired browser, domain line `MOR Ummia, version 1`; the folder picker `folders`), the command. Port 8477. `check URL` compares a server with the release. |
| `src/page/` | The page: `view.ts` (every screen, the tint, the web banner), `ui.ts` (clicks and forms; only the open tab kept in session storage), `app.ts` (the program's page). |
| `src/web/`, `scripts/build-web.ts`, `static/web.html`, `built/` | The web client: Ummia's code in the browser, its keep in IndexedDB; built into `built/` with the pinned tools, reproducibly (`BUILT-WITH.txt`). |
| `scripts/make-app.sh`, `scripts/make-desktop.sh` | `~/Applications/Ummia.app` on the Mac, and the Linux desktop entry, each with Ummia's icon. |
| `static/icon/ummia.svg` | The icon: a round school tablet of the tablet house, its name carved once between a ruled line above and a ruled line below (decided by Nobody, allegedly), one solid carving recessed in the clay, a thick coral edge `#a86455` (70% of the layer colour over the dark), the dark `#141012`, the clay `#966e59`, its rim `#ad856a`, the carving `#6f4e3c` (the family's colours moved 6% or 12% toward coral). The name, 𒌝𒈪𒀀 (UM.MI.A), its sign forms Noto Sans Cuneiform's (SIL Open Font License 1.1), traced as paths. Made into `ummia.png`, `ummia.icns` and `ummia-touch.png` by `clients/dub/scripts/make-icons.ts ummia`. |

The core library does every check: the specification's decoding, the acts' judgment through their signers' chains, the manifests and their files, the anchor's proof.

## Readings

*Where the texts are silent, Ummia takes these readings. To be confirmed by Nobody, allegedly.*

1. **Optional fields come from the person** (Development, F322: "A publishing tool writes every required field, and no optional field it cannot fill from the specification's text"). Ummia cannot read a text's meaning, so it writes only the optional fields the person fills, and says on the review: fill only what your text says. The creator is always the identity acting.
2. **A MIP may fork the six MIRs by name** (their test hashes until the freeze), or a MIP or the MICS document by its spec hash; the MIRs are not yet published as kind-4 specifications on the relays, so a MIP forking one shows in Tracking under the MIR's hash, as the listing groups it.
3. **Draft replies** are text acts naming a draft in `refs`, found in the author's inbox (Dub's sealed reply copies, opened) and on the relays Ummia knows (its own and tracking's).
4. **Tracking asks three queries a relay** (publications, optionally of one signer; Agreements' terms; their signatures), then one per xtype found, by its spec hash; at most 5,000 acts a relay, as the listing. The signer filter narrows specifications and releases only, never the agreements counted.
5. **The accepted list is shown whole and changed whole**: Ummia may add or remove any entry (F340: "configured from Ummia"); each other app keeps changing only its own part. A running Damgar reads the list again within a minute.
6. **An anchor of a release is paid by the identity that released it**, prepared as a draft sealed to itself (the money messages cMIP, `app: "Ummia"`).

## Costs, stated

- The signing key is held in software, in the program's folder or the browser's storage: a prototype, never for a real identity.
- The web client reads no folder and follows no chain: no release, no anchor checked there; said in its banner.
- Tracking sees public agreements only; what relays do not hold, Ummia does not see.

## Tests

`npm test` (Node, and headless Chromium for `browser.test.ts`; `MOR_CHROMIUM` names the browser):

| Test | What |
| --- | --- |
| `spec.test.ts` | A cMIP published, its hash shown first, a wrong digest and a second use refused; a Module under it; content not in the format and text not canonical refused before signing; both found again by tracking (an xtype among them); tracking filtered by another signer finds none. |
| `releases.test.ts` | A release from a plain folder and from a git folder, checked as anyone would, the next pre-set by name, a changed file refused, specifications implemented named by spec hash; **Edubba's release test carried over whole** (H16); **a release anchored**: asked in Ummia, its draft signed in Damgar, paid, anchored by the test service, checked here on the test chain. |
| `track.test.ts` | Extensions named by two public agreements (on two relays), a sealed one not counted; an xtype's use counted; one relay only; the acts of one specification by spec, type and signer. |
| `mips.test.ts` | A MIP in the shape, its draft a long-form document (no specification yet), a reply from Dub shown, then published as a MIP (kind 8) and found by tracking under the Money MIR; a report sent, read as the reports mirror reads it, answered, the answer shown. |
| `accepted.test.ts` | The list changed in Ummia read by Damgar; Damgar's change keeping Ummia's entry; a removal read by Damgar; two apps at once, the fork shown and merged; private by default, published by choice and withdrawn. |
| `kishib.test.ts` | A change of keys in Kišib: without the card, Ummia's sealed line left out and said void; with it, kept; Ummia refusing to sign until it takes the new words; everything before and after verified. |
| `browser.test.ts` | By clicks, in Chromium: the program's page (a release with the picker, checked; a cMIP with its hash; tracking and accepting; a MIP draft; a report); the folder checks carried from Edubba (H19, H23, H31); the web client (the banner on every screen, releases said to need a computer, a specification published, nothing of a chain key kept, no console error, nothing the content security policy refused). `MOR_SCREENSHOTS=DIR` keeps every screen. |
| `desktop.test.ts`, `web-build.test.ts`, `build/reproducible.test.ts` | The Mac app and the Linux entry; the release in `built/` (fingerprints, banner, icons), built twice the same, the page asking only for operations both sides answer, `check`, the coral tint by the rule and the icon's values; the release rebuilt byte for byte (`npm run test:build`). |

## Using it

On the Mac: `npm install` here and in `../desk`, `../dub` and `../damgar` (and the clients they use: see `scripts/test-all.sh`), then `sh scripts/make-app.sh` (Ummia in `~/Applications`). On Linux: `sh scripts/make-desktop.sh`. To check anchors on regtest: `npm start -- --regtest RUN_DIR` once (`docs/damgar-regtest.md`).

## The web client (testing only)

As Damgar's: `npm run release` (or the GitHub workflow `release-ummia-web.yml`, on a merge message containing `[release ummia web]`), then serve `built/` as Kišib's is. `node --import tsx src/cli.ts check URL` says SAME. Not done here: a later server session.

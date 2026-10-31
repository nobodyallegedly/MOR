# Ummia (mor-ummia)

**Ummia** (𒌝𒈪𒀀, Sumerian ummia, "the master" of the tablet house; F339): the developers' app, the Development layer's. It holds the developer's identity and acts in the Development layer only; whatever goes to another layer travels through MOR as acts, sealed to oneself where it is private (the working rule of 17 October 2026: the layers apart, talking through MOR). On the Mac and Linux, a program and its page, as Dub, Kišib and Damgar; the same page as a web client, **for testing only** (to be served at `ummia.dubsar.org`), with a one-line banner and its "?" on every screen. **On the Dubsar Suite's kit since 23 October 2026** (`clients/kit`; the redesign, `docs/design/suite-redesign.md`; `docs/ummia-kit-report.md`): dark, coral in pastel fills, red only for alarms.

**Test identities only, until MOR is frozen; regtest or signet only.** The report of its first round: `docs/ummia-report.md`.

## On the kit (23 October 2026)

*The last app of the redesign. Every function stays; only where it lives and how it looks changed. The table of where each function went is in `docs/ummia-kit-report.md`, section 2.*

- **Four tiles**, with their danger marks (decided on the mockups): **Look** (one bar), **Discuss** (one), **Publish** (two), **Choose** (two). A tile opens with its column on the left; on a phone, the column first, folding away with ← Back.
- **The identity, top right.** Its panel lists the identities held and **the collectives under each**: choosing a collective there is how you act as it (Publish also shows "Who acts" as chips, as drawn). **+ Add**: **Bring one** (Ummia never makes one) and **Use one from Kišib** (on the Mac: Ummia holds no key, and Kišib's panel appears inside Ummia's window for every act). Each identity's ⋯ menu: Words, Line and homes, New words from Kišib, A collective under it, Remove from Ummia… (said plainly first). **Relays** in the panel's foot. A key changed in Kišib: the warning under the top, the box for the new words right under it.
- **Look**: one feed box. **Point at** a relay, a single ID, **my contacts** (the follow list sealed to you, the same as Dub's) or **a release** (it and its line). **Filter by** releases, cMIPs, Modules, xtypes, extensions (and MIPs, off at first), and **by layer**. **Saved** points: Save this point, and a signer's menu › **Follow their releases** (added to the follow list, and saved as "…'s releases": "the same follow list, but here it filters"). A release's card says **what changed since the version before**; a specification's shows its creator's card's title and summary; tracking's counts (extensions named by public agreements, an xtype's use) are on the cards and behind "Public agreements only, as the relays answer ?". **A specification's page** (decided 23 October 2026) gathers its text, its creator's latest card, others' cards as their word, the releases implementing it, its vectors, its discussion, the public agreements naming it, its drafts before and after, and its creator; the eight core texts have built-in cards. **One specification's acts**: the plain look-up.
- **Discuss**: **MIP drafts** (+ Start a MIP, write, publish for discussion, publish as a MIP), **Discussions** (the threads started here and the drafts published, their replies; **a reply as a signed document**), **Bug reports** (the reporting identity set here) and their answers.
- **Publish**: **A release** (from a folder, checked as anyone would, the one before pre-set, as a collective with its keys), **A cMIP or Module** (its hash first, then Sign and publish; right after, **its card** and a **discussion thread** are offered), **Anchoring** (the anchors asked; asked from a release or any card's Anchor it, paid in Damgar), **Published here** (each specification with "Its card" or "A later card").
- **Choose**: the accepted list **by layer**, sealed to you and read by every app; Copy, Remove, Its page, + Accept by hash, Publish it.
- **Every card**: the kit's two menus. The act's: Copy act ID, Open what it answers, Why it's valid; below the line **Add to accepted list**, Rely on it, Anchor it (Correct it on one's own: a specification is never corrected, its card is signed again). The signer's: Copy ID, Copy ID link, Open profile; Follow, **Follow their releases**, Mute (muting is Dub's). **Hashes easy to copy everywhere** (a Copy beside each).
- **The Dubsar clock** orders the feed and gives each card its time; where it stamped nothing, the signer's own hint, labelled.

**Specification cards** (`cmips/cmip-specification-card-draft-1.md`, decided 23 October 2026: "I think it's cMIP territory"): a card is a plain public text act (every app shows it as a post) whose lines give a specification's hash, title, summary, and its releases, vectors and discussion; its creator's latest card counts, anyone else's is their word; the core's texts get no card on their behalf. `src/cards.ts`.

## In plain words

**First, an identity.** Bring an identity you have, by its ID and its signing key's words, as in Dub (Ummia never makes one, and never holds a chain key). Ummia keeps its own line of acts for it; some of them are sealed (your accepted list, an anchor's payment), so its identity window shows the line's card to give Kišib when the keys are changed there: only once your homes hold its latest act, ending with Ummia's name and how many of its acts Kišib cannot read (F373). Every private act Ummia signs (the accepted list, an anchor's payment, an ask to another holder for a collective's release) is left at your homes, readable again by your other apps. Since F376 its public acts (specifications, MIP drafts, releases, bug reports) and its private acts are on two lines: anyone follows the public line after a change of keys, and the window shows a card per line, joined by “; ”. *Cost, stated (accepted 21 October 2026, F376):* whoever holds your signing words can read the asks Ummia sent for you.

**Who acts.** Since the kit, in the identity panel (a collective under its identity) and as chips in Publish; the chooser's code is still a shared piece (`src/acting.ts`, reused by Edubba's Publishing tab): yourself, or, since round 2, a collective you act for. **A collective under it** (the identity's menu) adds a collective by its ID: kept where you hold a box in the finer area reaching its releases (bakes, Envelopes type 0), or else in its Envelopes layer's rule (Agreements rule 60). A collective has no key of its own and its members no member keys (round 8, rule 58): you act for it with your own identity's key, the act naming the collective; nothing is kept, sealed, resealed or read for a member key any more. A specification, a MIP draft and a report are published as yourself only.

**Releases.** A release of code under your own name, moved here from Edubba's Identities tab, with every check Edubba made: the folder chosen at each release (a git folder gives what git tracks; a plain folder every file but hidden ones; links never followed), typed as the Terminal or Finder writes a path, a near match named, or chosen with the picker; every file listed with its size and fingerprint, and the libraries from its lock files, before anything is signed; the release before it pre-set by name, chosen by hand; the specifications it implements, by their publications, read and named by spec hash; a file changed after the review refused. **Check it as anyone would**: the release fetched by its id from the relays alone, every file checked. **Anchor it on Bitcoin (optional)**: the anchoring service's offer read, a tier chosen; the payment prepared here as a draft sealed to you, signed and paid in Damgar; the anchor followed here, from asked to anchored at its block. **A collective's release** (round 2, moved here from Edubba, F339): with the collective chosen under Who acts, the same release, read back as the collective's, with the area it goes through and how many keys it needs; uploaded with your own identity's key, naming the collective and citing its latest decision (rule 58). Where its area asks more signatures, its other holders are asked, each sent a negotiation message, and sign it in Dub's Signing tab or Edubba's To sign with their own keys; **Does it count for the collective?** reads it as anyone would. Its anchoring is here too. On a computer only: the web client reads no folder.

**Specifications.** A cMIP or a Module published as its act: its text, and only the fields your text fills (the tasks it fills, the act types it defines, the cMIP or MIR a Module works under, a rail's kind and binding, the layers it acts on as an extension, a predecessor, dependencies, a proof-of-delivery checker). Its **spec hash is shown before anything is signed**; content the core library does not read as a specification (F323), or text that is not canonical, is refused, saying why.

**Tracking.** Which cMIPs and Modules exist, by asking the public relays you name, with the filters relays already have (spec, type, signer): lines of drafts, creators and whether they claimed them, code released; **extensions**, which public agreements name which cMIPs; **xtypes**, act types defined from core pieces, and how many public acts use them; MIPs, by what they fork; and the plain look-up of one specification's acts. **Accept it** from a card adds it to your accepted list. The limit, said on the screen: *Ummia sees public agreements only; a sealed agreement's use of a cMIP stays invisible unless someone publishes it.* No index, nothing kept, no new cMIP; the listing on dubsar.org is one source among any, never a registry.

**MIPs.** A MIP started in the MIP shape (a fork of a MIR, of another MIP, or for a new layer of the MICS document), the shape checked as advice; drafts published for discussion as signed long-form documents, replies to them shown (from Dub or any client); **only when you are ready**, published as a specification (kind 8), naming you as its creator and what it would replace.

**Reports.** A bug report from your own identity, public, to the reporting identity named in Settings, left in its inbox (F287); its answers shown. The GitHub mirror is the reports client's, run by hand by the author.

**Accepted.** The whole sealed list of the cMIPs and Modules you accept (F340), one per identity, every app reading the same: each entry with its label and whose part it is; remove one, add one by hash or from Tracking; where two apps changed it at once, the fork shown and merged by your next change, nothing dropped; private by default, published by choice.

**Settings.** Since the kit: the relays your acts go to and the relays Look asks in the identity panel's foot (**Relays**); the reporting identity in Discuss › Bug reports.


**Round 2 (F349).** A specification's hash is shown written for people (`mspec1…`), the hexadecimal beside, and taken in either form.

**Which clock** (decided 23 October 2026): every app of the suite orders its feeds by the stamps of **the Dubsar clock**, identity `1c743854ba1884b470f02221395d18d1abe977631bf86f0f221e32e6d83cf453` (its genesis at home1 and home2; a public identity, not an address), written in `clients/barebone/src/clock.ts`; each card shows its time, "… · by the Dubsar clock", or the signer's own hint, labelled.

## Precisely

| File | What |
| --- | --- |
| `src/ummia.ts` | The `Ummia` class. Since the kit: `look`, `specPage`, `clockWords`, `savedAdd`, `savedRemove`, `contactsList`, `follow`, `followReleases`, `prepareCard`, `publishedHere`, `discussions`, `reply`, `rely`, the runner's (`runnerState`, `runnerPair`, `runnerTake`, `runnerAsking`, `runnerDrop`, `runnerUnpair`); `anchorRelease` takes any public act (Anchor it). The identity: `bring`, `renew`, `use`, `leave`, `forget`, `carry`, `check` (as Damgar's). Who acts: `setActing`. Reviews: `confirm` (the digest of exactly what was shown, within 15 minutes, once, never with reasons not to sign, the signing key checked current first), `cancel`. Specifications: `prepareSpec`, `specs`. Tracking: `track`, `actsOf`. The accepted list: `accepted`, `changeAccepted`, `publishList`. MIPs: `mips`, `newMip`, `saveMip`, `publishMipDraft`, `mipReplies`, `prepareMip`. Reports: `reports`, `sendReport`. Releases (the program's): `releases`, `suggestRelease`, `prepareRelease`, `confirmRelease`, `checkRelease`. Anchoring: `anchorOffers`, `anchorRelease`. The texts said on screen: `LINE_SAY`, `SPENT_SAY`, `NO_KEY_SAY`, `ACCEPTED_SAY`. |
| `src/acting.ts` | The chooser, shared (Edubba's Publishing tab uses it): `actors` (oneself, and the collectives acted for), `chosen`, `chooserHtml` (with **Act for it**), `COLLECTIVES_LATER` (its words). Nothing from Node. |
| `src/spec.ts` | A specification's content from a form (`specContent`), checked as canonical text and decoded by the core library (`prepareSpec`), published as Development's Part three says (`publishSpec`: a public publication whose media spec is the Development MIR's). |
| `src/cards.ts` | Specification cards (the Dubsar Specification Card cMIP, draft 1): `cardText`, `readCardText`, `publishCard`, `publishDiscussion`, `readCards`, `cardsFor` (each signer's latest in its own sequence; two lines said), `ownCard`; the eight core texts' built-in cards (`BUILT_IN`, `MICS_HASH`, `SUITE_HASH`). Nothing from Node. |
| `src/look.ts` | Look: `look` (point at, filter by, by layer; the Dubsar clock's order), `releasesAt`, `releaseById`, `changedSince` (what changed since the version before), `specPage` (a page per specification). Nothing from Node. |
| `src/follows.ts` | The follow list sealed to oneself (the people cMIP), read for "my contacts" and written by Follow and Follow their releases, as Dub writes it. Nothing from Node. |
| `src/track.ts` | Tracking: the website cMIP's listing code (`clients/site/src/listing.ts`) asked with filters (`track`); the acts of one specification (`actsOf`); `LIMIT_SAY`. |
| `src/mips.ts` | MIPs: what a MIP may fork (`FORKABLE`), the MIP shape (`SHAPE`, `template`, `shapeOf`), a draft as a long-form document (`publishDraft`), replies from the inbox (sealed copies opened) and the relays (`replies`). |
| `src/reports.ts` | Reports: `send` (the barebone client's `post` with `to`, and `leaveInInbox`), `answers` (the reporting identity's public text acts naming a report in `refs`). |
| `src/releases.ts` | Releases from a folder (Node, the program only): `Releases` (`suggest`, `prepare`, `confirm`, `check`), with Edubba's `filesOf` and folder reading, the repo client's manifests and `verifyRelease`. |
| `src/anchor.ts` | Anchoring a release: the service's offers (`offers`), the leaf and its blind, the draft for Damgar (`ask`), where it stands against the chain followed (`standing`). Nothing from Node. |
| `src/shapes.ts`, `src/ops.ts` | What the page is told; the operations by name, the same for the program and the web client. |
| `src/store.ts`, `src/server.ts`, `src/cli.ts`, `src/version.ts` | The program: its folder (`~/mor-ummia`), Edubba's local server on 127.0.0.1 (requests signed by a paired browser, domain line `MOR Ummia, version 1`; the folder picker `folders`; Kišib's runner, `~/mor-kishib`, its origin the only one framed), the command. Port 8477. `check URL` compares a server with the release. |
| `src/page/` | The page, on the kit: `view.ts` (the tiles, columns, Look's rows and page, Discuss, Publish, Choose, the identity panel's parts, the web banner), `ui.ts` (clicks and forms, the kit's cards and menus, Kišib's panel in the slot; only the open tile and part kept in session storage), `app.ts` (the program's page). |
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
7. **A card's `refs` name the specification's publication, with its signer**, never the spec hash itself: a bare hash in `refs` means an act's id (Envelopes rule 20), and a spec hash is not one. The card's `Specification:` line decides which specification it is about, so a card can also name a core text, which no act publishes (the card cMIP, 1.4).
8. **The MICS document's and the freeze test suite's built-in cards** are keyed by the hashes Development rule 26 computes from the current drafts' text (MICS v30, suite v30): the core names no test value for them. The six MIRs' are their test values.
9. **Ummia writes the follow list** (Follow, Follow their releases) as Dub writes it, on the latest version read, sealed to oneself; it removes nobody and mutes nobody: those stay Dub's.
10. **MIPs are a sixth chip of Filter by**, off at first: tracking showed them, and the mockup's five chips did not name them.
11. **Anchor it** takes any public act shown (not only one's own releases), prepared as the release's anchor is, paid in Damgar.

## Costs, stated

- The signing key is held in software, in the program's folder or the browser's storage: a prototype, never for a real identity.
- The web client reads no folder and follows no chain: no release, no anchor checked there; said in its banner.
- Tracking sees public agreements only; what relays do not hold, Ummia does not see.

## Fix round 7 (F403, hand test v3)

### In plain words

- **Rules I follow** (H93): the list of rules you follow, shown whole in Choose, is now named so ("Rules I follow"); **Ummia's own rules** (long form, release manifest, naming) are each kept on your list or in Ummia only, and asked about under the top while not followed.
- **Names** (H96, H106): every identity shown by its names (your nickname first, the name it published beside it), the top right and the identity panel included; never a bare ID where a name is known.
- **Contacts** (H100, H109, H119): Contacts top left, the one list every app reads; Follow and "my contacts" go through it; a nickname asked when following; a Contacts button beside every field taking an ID.
- **Your own ID** (H88): at the end of bringing one, and in the panel, its ID whole with Copy ID and Share your ID link.
- **Short IDs** (H121): every short ID or hash a tap away from whole, a second tap copying it. **Two signs** (H99): the panels to work in (a MIP's text, the specification's optional fields) open with a chevron; "?" only explains.

### Precisely

`src/ummia.ts`: `Known('Ummia')` and the ops `names`, `contacts`, `contact add`, `contact nick`, `contact remove`; `rules`, `rules approve` (`UMMIA_RULES`, the kit's `engine/rules.ts`); each identity's `form`, `link` and `named` in the state. `src/follows.ts`: the explanation only, the list being the kit's. `src/page/`: the kit's `who`, `actId`, `hashButton`, `attachIds`, `attachContacts`, `rulesPart`, `rulesAsk`, `fold`. Tests: `test/names-contacts.test.ts`; `../desk/test/every-app.test.ts` (H93, H102, H82, H83, H105).

## Tests

`npm test` (Node, and headless Chromium for `browser.test.ts`; `MOR_CHROMIUM` names the browser):

| Test | What |
| --- | --- |
| `spec.test.ts` | A cMIP published, its hash shown first, a wrong digest and a second use refused; a Module under it; content not in the format and text not canonical refused before signing; both found again by tracking (an xtype among them); tracking filtered by another signer finds none. |
| `releases.test.ts` | A release from a plain folder and from a git folder, checked as anyone would, the next pre-set by name, a changed file refused, specifications implemented named by spec hash; **Edubba's release test carried over whole** (H16); **a release anchored**: asked in Ummia, its draft signed in Damgar, paid, anchored by the test service, checked here on the test chain. |
| `track.test.ts` | Extensions named by two public agreements (on two relays), a sealed one not counted; an xtype's use counted; one relay only; the acts of one specification by spec, type and signer. |
| `mips.test.ts` | A MIP in the shape, its draft a long-form document (no specification yet), a reply from Dub shown, then published as a MIP (kind 8) and found by tracking under the Money MIR; a report sent, read as the reports mirror reads it, answered, the answer shown. |
| `accepted.test.ts` | The list changed in Ummia read by Damgar; Damgar's change keeping Ummia's entry; a removal read by Damgar; two apps at once, the fork shown and merged; private by default, published by choice and withdrawn. |
| `kishib.test.ts` | A change of keys in Kišib: without the card, Ummia's sealed line left out and said void; with it, copied whole, kept; Ummia refusing to sign until it takes the new words; everything before and after verified. |
| `private-lines.test.ts` | F373 (here because it needs all four apps): one identity with lines from Dub, Edubba, Damgar and Ummia, private acts on each (a sealed message, the follow list, a payment draft, a founding's invitations, the accepted lists, an ask for a collective's promise), each at both homes, locked, and named by its app's card; a change of keys in Kišib places every line, nothing to tick, and Damgar signs for the collective with the member's own new key afterwards (round 8: no member keys); since F376, Edubba's payment draft comes before the founding on purpose, and every reader holding no key of the founder's reads the founding's terms and signature valid after the change; then one locked act removed from the homes on purpose: Kišib's review says so in red, names Damgar's line and what lives on it, refuses to sign until it is read, and signs nothing. |
| `cards.test.ts` | A card's text written and read; the eight texts' built-in titles, the MICS document's and the suite's hashes computed again from their files; what changed since the version before; a cMIP published, its card offered and signed with its thread, found on its page; a second card from its creator replacing the first; a card by someone else shown as their word; a card naming nothing shown so (and refused by Ummia); a core text's page; a card read by Dub as a plain post; Look pointed at an ID, a release and a relay, filtered by kind and by layer; Follow their releases into the follow list Dub reads, and a saved point. |
| `browser.test.ts` | By clicks, in Chromium, at a Mac's size and a phone's: the four tiles and their marks; Publish (a cMIP with its hash first, its card and thread, a release with the picker, checked); Look (point at each kind, filter by each kind and by layer, saved points, the act menu's Add to accepted list, Follow their releases, a specification's page, a core text's page, one specification's acts); Discuss (a MIP, a reply as a signed document, a bug report); Choose (by layer, + Accept by hash, Remove, Publish it); the identity panel; **every function of before, found in its new place**; acting as a collective from the identity panel; the folder checks carried from Edubba (H19, H23, H31); **Use one from Kišib** (Kišib's panel inside Ummia's window); the web client (the banner on every screen, releases said to need a computer, a specification published, nothing of a chain key kept, no console error, nothing the content security policy refused). `MOR_SCREENSHOTS=DIR` keeps every screen. |
| `desktop.test.ts`, `web-build.test.ts`, `build/reproducible.test.ts` | The Mac app and the Linux entry; the release in `built/` (fingerprints, banner, icons), built twice the same, the page asking only for operations both sides answer, `check`, the coral of the kit and the icon's values; the release rebuilt byte for byte (`npm run test:build`). |

## Using it

On the Mac: `npm install` here and in `../desk`, `../dub` and `../damgar` (and the clients they use: see `scripts/test-all.sh`), then `sh scripts/make-app.sh` (Ummia in `~/Applications`). On Linux: `sh scripts/make-desktop.sh`. To check anchors on regtest: `npm start -- --regtest RUN_DIR` once (`docs/damgar-regtest.md`).

## The web client (testing only)

As Damgar's: `npm run release` (or the GitHub workflow `release-ummia-web.yml`, on a merge message containing `[release ummia web]`), then serve `built/` as Kišib's is. `node --import tsx src/cli.ts check URL` says SAME. Not done here: a later server session.

## Round 9 (F411)

**The signing key as a string** (round 9, F411; H104, "Signing key, users choses"). In plain words: where the app asks for the signing key, you can give its 24 words or its string (it starts with `morsk1`), the same key either way; where it shows the words, "Show the same key as a string" unfolds the string. A copying mistake in the string is caught. The chain key stays words only. Precisely: `fromCarried` and `toKeyString` (`modules/carry/src/string.ts`), `keyStringHtml` (`modules/carry/src/key-html.ts`); `module-signing-key-string-draft-1.md`.

**The tip, always.** The anchoring reader (`src/anchor.ts`, `offers`), shared with Damgar, Edubba and Dub, keeps only a service's latest publication and each tier's latest tag, as the core's `agreementsPublicationTip` finds them.

## Round 8: the keyless collective, the six layers (F407)

*In plain words:* a collective has no key and its members no member keys any more: Ummia acts for a collective with your own key, naming it. The layers are numbered anew (Text 1, Envelopes 2, Money 3, Agreements 4, Development 5), so a collective's releases go through the Envelopes layer, or a finer area of it reaching bakes; and an extension's layers are read in the new numbers. The eight core texts changed, so the MICS document's and the freeze suite's hashes did (`src/cards.ts`, computed again from their files by `cards.test.ts`).

*Anchoring, on the anchoring cMIP draft 7* (round 8's follow-up, F409): a release anchored on Bitcoin reads the service's publication with its price tags, one per tier (`anchoringReadOffer`, the tags given), and the payment prepared for Damgar pays the chosen tier's tag (`tagFor`).

## Round 2: a collective's releases (F339, F353)

*Decided by Nobody, allegedly, 17 October 2026 ("Keep collectives for a second round of development") and 18 and 19 October 2026 (F353): Ummia signs with the member's own key, which answers round 1's open question 3 (how Ummia signs for a collective).*

- `collectiveAdd`: the collective's area reaching its releases read from its agreement in force (`releaseArea`), the member's key found (`clients/grants/src/member.ts`); `setActing` chooses it.
- `prepareRelease` / `confirmRelease` for a collective: the release's bake uploaded by the member with their own key, naming the collective (`signAsMember`, round 8: no member key, rule 58; through `Publisher.sign` in `clients/repo/src/release.ts`), the area's other holders asked where it needs more signatures, `collectiveReleaseStanding` (Agreements' answer).
- Test: `test/collective.test.ts`: a collective founded from Edubba's grid, Publishing held by A and iPa at two keys; A adds it, acts for it, releases a folder; refused "as anyone would" at one key of two; iPa signs in Dub with iPa's own key; it counts, two keys each a member's own; a specification refused as a collective; iPh, holding no box in Publishing, refused.

# Ummia: report

*17 October 2026 (F339, F340). Round 1 of Ummia, the developers' app. A GitHub session: test identities only; regtest only (a test chain made by the tests, for anchoring); nothing touched the servers (homes and relays ran on local ports). Branch `claude/ummia`, one pull request, not merged.*

## In plain words

Ummia is built: **the Development layer's own app**, so every layer now has one (Dub talks, Damgar pays, Edubba makes agreements and collectives, Kišib handles the chain key, Ummia develops). Like Damgar and Kišib, it is a program on the Mac and Linux with its page, and the same page as a web client for testing only (a banner stating the risks on every screen). It has Dub's look, tinted coral, and its own icon: a round school tablet with the name 𒌝𒈪𒀀 carved once, between a ruled line above and a ruled line below.

What it does:

- **Who acts.** You bring an identity by its ID and signing words (Ummia never makes one). A chooser at the top says who acts: in round 1, yourself. Collectives come in round 2, as you decided; the chooser already has their place, and Edubba's Publishing tab can reuse it.
- **Releases.** Releases of code under your own name **moved here from Edubba**, with every check Edubba made (the folder chosen each time, every file with its size and fingerprint before anything is signed, the release before it pre-set by name, a file changed after the review refused) and **"Check it as anyone would"**. **Anchoring a release on Bitcoin** is an option: Ummia prepares the payment as a draft sealed to you; Damgar signs and pays it; Ummia then follows the anchor until it is at its block. A collective's releases stay in Edubba until round 2.
- **Specifications.** A cMIP or a Module published as its act. **Its hash is shown before anything is signed.** What the core library would not read as a specification is refused, saying why.
- **Tracking.** Which cMIPs and Modules exist, which public agreements name which cMIPs (**extensions**), which new act types are defined and used (**xtypes**), and the MIPs by what they fork, by asking the public relays you name with the filters relays already have. It says its limit plainly: **it sees public agreements only; a sealed agreement's use of a cMIP stays invisible unless someone publishes it.** No index, no new cMIP; dubsar.org's listing is one source among any.
- **MIPs.** A MIP started in the MIP shape; drafts published for discussion as signed long-form documents, replies shown; **only when you are ready**, published as a specification naming you and what it would replace.
- **Reports.** A bug report from your own identity to the reporting identity, and its answers.
- **Accepted.** The whole sealed list of what you accept, one per identity, every app reading the same: change it here, and Damgar reads the change; where two apps changed it at once, both changes are merged, none lost.

## The questions asked, and their answers

1. **How Ummia signs as a collective** (a collective's act needs the collective's own key, which only the founder's Edubba holds). Answered by Nobody, allegedly: **"Keep collectives for a second round of development."** So round 1 acts as oneself only. The chooser is built with the collectives' place kept and said (`COLLECTIVES_LATER`). The test "a collective's release proposed in Ummia and signed elsewhere" is not built: it is round 2's. The question itself (bring the collective's signing words into Ummia; or have Edubba sign it; or any member propose it to the key holder) waits for round 2.
2. **Which releases move now.** Answered: **"Own name moves"**, then confirmed in a note from the project lead, decided by Nobody, allegedly: *"with collectives kept for Ummia's round 2, move only personal releases (and their anchoring) out of Edubba in this round. Edubba keeps collective releases and their anchoring, unchanged, until Ummia's round 2 takes them."* Built so, and said in Edubba's README and on its card.
3. **The name's middle sign.** The brief's string 𒌝𒈪𒀀 is UM.MI.A (the middle sign is MI, U+1222A), while its reading said UM.ME.A (ME is 𒈨, U+12228). Answered: **UM.MI.A, 𒌝𒈪𒀀**, the usual spelling um-mi-a. Carved so.

## What was built, precisely

| Where | What |
| --- | --- |
| `clients/ummia/` | Ummia: its code, program and page, web client and release (`built/`), the Mac app and Linux entry, the icon, its tests. Its README says each file. |
| `clients/ummia/src/acting.ts` | The chooser, a shared piece with nothing from Node and nothing of Ummia's own: `actors`, `chosen`, `chooserHtml`. |
| `clients/desk/` | Edubba: personal releases removed (the operations, the form and the review; `Setup` keeps `filesOf` for a collective's release and for Ummia); the Identities tab's card says releases are in Ummia and lists those made before. Its release test is carried to Ummia whole; its own tests check the operations are gone and the card says so. Collective releases and anchoring unchanged. |
| `clients/site/src/listing.ts` | `readListing` takes a filter (`Filtered`): instead of reading each relay whole, it asks with the feed's filters (publications, optionally of one signer; Agreements' terms; their signatures; then each xtype's acts by its spec hash). Unfiltered, as before. |
| `clients/genesis/src/transport.ts` | The client's `feed` passes `spec` and `type`, which relays already answered (relay transport cMIP, "Following: the feed"); a type only, no behaviour changed. |
| `clients/damgar/` | A draft's words name the app that keeps the anchor's blind (it said "Edubba" for every anchor); "anchoring" in what can be accepted names Ummia beside Edubba; README. |
| `clients/dub/scripts/make-icons.ts` | Ummia's icon added; with names given, only those icons are made (so the others' files are not re-rendered). |
| `.github/workflows/release-ummia-web.yml`, `test.yml`, `scripts/test-all.sh` | Ummia's web client released as Damgar's is (`[release ummia web]`); Ummia's tests in the run. |
| `clients/ummia/built/`, `clients/damgar/built/`, `clients/dub/built/`, `clients/kishib/built/`, `clients/site/built/` | Rebuilt here with the pinned tools (`BUILT-WITH.txt`: rustc 1.97.0, wasm-bindgen 0.2.129, esbuild 0.25.12, Linux x86-64), each `npm run test:build` passing: Ummia's new release; Damgar's, Dub's and Kišib's, because the Damgar code they bundle changed (the anchor's wording; "anchoring" naming Ummia); the display client's, because the listing it bundles gained the filtered read. The core library's WebAssembly is unchanged. The served copies (dubsar.org, dub.dubsar.org) differ from these until a server session deploys them. |

## The look (H36)

**Coral, `#ee8b74`, chosen** for the Development layer: warm, close to the clay the family's icons share, and far from Kišib's glacier blue, Damgar's gold and Edubba's emerald. By Kišib's rule, each value is the layer colour laid over `#06080c` at a share, channel by channel:

| Where | Share | Value |
| --- | --- | --- |
| Separators (`--line`) | 22% | `#392523` |
| Outlines of cards, fields, buttons (`--edge`) | 30% | `#4c2f2b` |
| Quiet accents (`--tint`): a hover or focus outline, a fold's mark | 60% | `#91574a` |
| The icon's thick edge, 16 units of 1024 | 70% | `#a86455` |

The icon's fills move the family's own colours toward coral: the dark `#06080c` by 6% (`#141012`), the clay `#8a6a55` by 12% (`#966e59`), its lit rim `#a48469` by 12% (`#ad856a`), the carving `#5e4634` by 12% (`#6f4e3c`) (the family's colours as Kišib's and Damgar's icons imply them). The release test checks every value against the rule. Red stays for alarms only.

**The icon.** A round school tablet (a "lentil", as the scribes' schools used them), the name carved once, between a ruled line above and a ruled line below. *First drawn with the master's model line above and the pupil's copy beneath, as F339 described; changed after review, decided by Nobody, allegedly: "do not repeat the word twice, only once, with line above and below".* One solid carving in one colour, recessed into the clay, no glow, a thick edge, as Kišib's and Damgar's.

**The name carved: 𒌝𒈪𒀀, UM.MI.A** (U+1231D UM, U+1222A MI, U+12000 A). *Sources, and their limits:* this environment's network refuses the ePSD (`oracc.museum.upenn.edu`), Wiktionary and the ETCSL, as it did for Kišib's session, and Borger's *Mesopotamisches Zeichenlexikon* is a printed book not reachable here. What was reachable: the Unicode Character Database's names for the three code points (UM, MI, A), read from Python's `unicodedata` (Unicode 15.1); an Akkadian lexicon (assyrianlanguages.org) giving *ummiānu* written with the logogram **UM.MI.A**, from Sumerian *ummia*; and secondary sources glossing *ummia* as the master of the tablet house. The sign forms carved are **Noto Sans Cuneiform's** (its glyphs for those three code points, which follow the Neo-Assyrian shapes of the Unicode charts' representative glyphs), traced as paths from the font's outlines (SIL Open Font License 1.1, which allows this); *To confirm by the author against the ePSD or Borger's Neo-Assyrian column*, as Kišib's 𒈩 was confirmed against Wiktionary; the drawing is one script away from a change (`ummia.svg` keeps the paths; the generator is not in the repository, being a one-off).

## Found while building (writing code is also a review)

1. **A release line begun in Edubba could not go on in Ummia.** Edubba kept its releases' manifests in its own folder; Ummia, under the working rule, cannot read Edubba's folder. Fixed through MOR: Ummia also finds this identity's own releases on its relays (the feed's `signer`, `spec` and `type` filters, each manifest fetched and checked against its work hash) and offers the last of the same name as the one before. Tested with a release published by another app holding the identity.
2. **The anchoring service's standing offer is an Agreements act** (a standing offer), not an act of the anchoring cMIP: a look-up filtered by the anchoring cMIP's spec finds the batches but no offer. Ummia asks for the service's Agreements acts; Edubba asked the unfiltered feed. Not a flaw: noted for whoever filters next.
3. **Damgar said "a random secret Edubba keeps" of every anchor's blind.** It now names the app the draft names.
4. **The relay client could not ask for `spec` and `type`**, though relays answer them: the type was missing in `transport.ts`. Added; nothing else changed.
5. **A running Damgar reads the accepted list again only after a minute** (it caches it). F340's "every app reading the same" holds, within a minute; said in Ummia's README, and the test reads with a Damgar opened afresh.
6. **Extensions are counted only where the parties' chains are found** at the relays asked (each agreement is judged through every party's chain). A deal whose parties never carried their chains to those relays is listed as not verified, not counted. Clients carry them (relay transport cMIP, "Clients", 7, a SHOULD); tracking depends on that being honoured.
7. **Ummia's line is partly sealed** (the accepted list, an anchor's draft), so a change of keys in Kišib without its card leaves the line out, and its acts become void: tested. Ummia's identity window shows the card, as Damgar's does.

No flaw in a MIR or cMIP was found. One reading of Development's text is put as a question below.

## Questions for Nobody, allegedly

1. **"No optional field it cannot fill from the specification's text"** (Development, F322). A tool cannot read a text's meaning, so Ummia writes only the optional fields the person fills (tasks, act types, layers, rail fields, predecessor, dependencies, checker), and tells them to fill only what their text says. Two honest tools may still differ if one person ticks a field another leaves out; F322 already shows those as two versions of one text. **(A)** keep it so (the build's lean); **(B)** Ummia writes no optional field at all, the text alone carrying them (then nothing can be discovered by field 2, 3 or 10); **(C)** a small cMIP saying how a text marks its fields, so a tool reads them from it.
2. **The sign forms of 𒌝𒈪𒀀**: please confirm the carving against the ePSD or Borger's Neo-Assyrian forms, as for 𒈩 (above).
3. **For round 2** (collectives): how Ummia signs a collective's act. Options as asked: (A) the key holder brings the collective's signing words into Ummia (Edubba shows them on request), Ummia one more device of the collective (Agreements F127 allows several devices' sequences); (B) Ummia prepares, the holder's Edubba signs; (C) any member proposes, sealed to the holder.

## Readings (to confirm), and costs

- **Optional fields from the person** (question 1).
- **A MIP forks the six MIRs by name** (their test hashes until the freeze), or a MIP or the MICS document by spec hash. The MIRs are not published as kind-4 specifications on the relays, so Tracking shows a MIP under the MIR's hash with "not found on these relays" if the MIR itself is not there.
- **Replies to a MIP draft** are text acts naming it in `refs`: from the author's inbox (Dub's sealed reply copies, opened) and the relays Ummia knows.
- **Tracking asks three queries a relay**, then one per xtype found; at most 5,000 acts a relay. The signer filter narrows specifications and releases only, never the agreements counted.
- **The accepted list is shown and changed whole in Ummia** (F340: "configured from Ummia"); each other app changes only its part.
- **An anchor of a release is paid by the identity that released it**, its draft sealed to itself, `app: "Ummia"`.
- **Costs:** the signing key held in software (folder or browser), a prototype; the web client reads no folder and follows no chain (no release, no anchor checked there: said in its banner); tracking sees what the named relays hold, and public agreements only.

## Tests

- **Ummia** (`npm test` in `clients/ummia`, 22 tests, Node and headless Chromium; and `npm run test:build`): a cMIP and a Module published, their hashes shown first, refusals before signing, found again by tracking; releases from plain and git folders, checked as anyone would, **Edubba's whole release test carried over** (H16), a line begun elsewhere continued, and **a release anchored**: asked in Ummia, signed and paid in Damgar, anchored by the test service, checked in Ummia; extensions from two public agreements (a sealed one not counted), an xtype's use, the acts of one specification; a MIP drafted, replied to from Dub, published as a MIP and **found by tracking**; a report sent and answered; **the accepted list changed in Ummia and read by Damgar**, Damgar's change keeping Ummia's entry, a fork merged, publishing; **Kišib keeping Ummia's line through a change of keys** (left out without the card, kept with it); by clicks, the program's page and the web client, and the folder checks carried from Edubba (H19, H23, H31); the Mac app and Linux entry; the release in `built/`, the tint, the icon's values. `npm run test:build`: the release rebuilt byte for byte.
- **Edubba** (69 tests), **Damgar** (20, its 3 regtest tests skipped without a network), **the site** (86, its listing read whole as before), **Kišib** (17), **Dub** (37), **genesis** (31), **repo** (21), **reports** (9): all passing here after the changes. Every web release (`test:build`) rebuilt byte for byte: Ummia, Damgar, Dub, Kišib, the display client.
- **Not built:** a collective's release proposed in Ummia and signed elsewhere (round 2, decided).

## Human test 12: Ummia on the author's Mac

*For Nobody, allegedly. Test identities only. The identities live on the test homes, as in human tests 10 and 11. Write one line per observation: what you did, what you expected, what happened, how it felt.*

1. **The Mac.** In Terminal, from the MOR folder: `git pull` (or `git checkout claude/ummia` before the merge). Then `cd clients/genesis && npm install && npm run wasm && cd ../..`, then `for p in desk dub damgar kishib site longform barebone repo collective assess manage connector reader reports anchoring-service ummia; do (cd clients/$p && npm install); done`, then `cd clients/dub && sh scripts/make-app.sh && cd ../damgar && sh scripts/make-app.sh && cd ../desk && sh scripts/make-app.sh && cd ../ummia && sh scripts/make-app.sh && cd ../..`.
2. **Two test identities in Dub.** Use P and Q from human test 11 (or make them: Dub, homes and relays `https://home1.dubsar.org`). P is the developer; Q stands in for the reporting identity (the real one is made at step 17). For P: **Copy ID** and **Show the signing key's words**. For Q: **Copy ID**.
3. **Ummia, first use (as P).** Open Ummia (its icon: check the round tablet, the name carved once between two ruled lines). **Bring it** with P's ID, signing words and `https://home1.dubsar.org`. Check: the **Who acts** card, yourself ticked, and the line saying collectives come in a second round. Open the identity (top right): Ummia's line and its card for Kišib.
4. **Settings.** Relays your acts go to: `https://home1.dubsar.org`. Tracking: `https://home1.dubsar.org` and `https://home2.dubsar.org`, one per line. The reporting identity: Q's ID. **Save**.
5. **A release.** In Finder, make a folder `~/Projects/testrelease` with two small text files (and one hidden file, `.secret`, made in Terminal: `echo x > ~/Projects/testrelease/.secret`). In Ummia, **Releases**, **Choose a folder…**: Home, Projects, testrelease, **Use this folder** (the name fills itself). Version `1.0`. **Read it back**: check every file with its size and fingerprint, no `.secret`, the libraries (none), "starts a new release line". **Sign and publish**. Then **Check it as anyone would**: VERIFIED, 2 of 2 files.
6. **Edubba no longer releases under one's own name.** Open Edubba, Identities, P (bring it there by its words if it is not held): the card "Releases under its own name: in Ummia". Collectives tab: a real collective's release is still there.
7. **A specification.** Ummia, **Specifications**: kind cMIP; text `# cMIP: Human test notes, draft 1`, an empty line, `Notes, for human test 12.` (no space at a line's end, no final line break); open "Act types it defines" and write `0 note note = tstr`. **Read it back, with its hash**: write down the first 8 characters of the hash. **Sign and publish**: the same hash said.
8. **Tracking.** **Tracking**, **Look**. Check: the limit in plain words first ("sees public agreements only…"); your cMIP under Xtypes and under cMIPs and Modules, by you, its hash the one written down. Press **Accept it**.
9. **The accepted list, between apps.** **Accepted**: your cMIP is there, and, if P accepted things in Damgar in human test 11, Damgar's entries too, marked "Money: Damgar's part". Remove **Lightning rail** here. Open Damgar as P after a minute: Settings shows Lightning unticked. Tick it again in Damgar and save; back in Ummia, **Accepted**: Lightning is back, and your cMIP still there.
10. **A MIP.** **MIPs**: title `Text, with footnotes`, forks **Text MIR**, **Start it in the MIP shape**. Open **Write it**: change a line, **Keep it here** (check the shape notes). **Publish this draft for discussion**. In Dub as Q: follow P by ID; the draft shows as a link to the reader; **Reply** to it ("Why footnotes?"). In Ummia, **Replies**: Q's reply, valid. Then **I am ready: publish it as a MIP…**: read the review (it forks the Text MIR, you are its creator), **Sign and publish**. **Tracking**, **Look**: the MIP under "MIPs, by what they fork".
11. **A report.** **Reports**: write `Ummia: human test 12 report` and a line under it; **Sign and send it**. In Dub as Q: **To you**: the report; **Reply** "Thank you". In Ummia, **Reports**: the answer shown, valid.
12. **Anchoring (optional, on regtest, with human test 11's network).** Start the network and the test anchoring service as in human test 11, steps 2 and 17; open Ummia with `cd clients/ummia && npm start -- --regtest ~/mor-regtest` (then close the tab and use the app). **Releases**, on testrelease 1.0: **Anchor it on Bitcoin (optional)**, the service's ID, **Read its offer**, a tier, **Prepare the payment for Damgar**. Damgar as P: **Look again**: the anchor's draft, "Prepared in Ummia"; sign, pay from the test wallet (alice), paste the preimage. Ummia, **Releases**: the anchor goes asked, then pending; **Mine** 6 in the test wallet; anchored at its block.
13. **Kišib keeps Ummia's line.** Open Ummia's identity window and copy its card. Kišib, **Change an identity's keys** for P with P's chain-key paper; paste the card where it asks for lines it cannot read; read the review (Ummia's line kept), sign, write the new words. Give them to Dub, Damgar and Ummia (identity window, **Use the new words**). In Ummia, **Tracking**, **Look**: the cMIP and the MIP published before still verified, claimed by P.
14. **The web client (optional, served later).** Once served at ummia.dubsar.org: the red banner on every tab; **Releases** says releases need a computer.
15. **Report.** One line per observation. Mark anything not in plain words, any button whose effect surprised you, and any check not verified.

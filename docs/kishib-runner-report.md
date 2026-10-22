# Kišib on the kit, and the Dubsar runner: report

*22 October 2026, Dubsar Suite, round 2 of the redesign, branch `claude/kishib-kit-runner`, for Nobody, allegedly, and the Suite lead. Built from the redesign drawn and approved (`docs/design/suite-redesign.md`; the mockups `docs/design/mockups/kishib-*` and `dub-runner`). Finding **F377**. Test identities only; regtest only; no server address or key in the repository.*

## 1. In plain words

### What Kišib looks like now

Kišib opens on **four big tiles**, each with its danger marks, as drawn and decided: **Identities** (one bar), **Runner** (two), **Paper** (three), **Collectives** (three). The web client shows three: no Runner (Mac only, decided). A tile opens with its **column** on the left; tabs across the top move between tiles. Top right, what Kišib holds: **"Holds nothing · runner off"**, or, with the runner on, the identities it keeps.

- **Identities**: **Make an identity** (new, H48), **Read a record**, **Confirm a succession** (moved here from Paper). With the runner on, **Held here** comes first.
- **Paper**, behind **the quiet door** ("Have your paper ready. Kišib uses the words for one act and forgets them.", Open Paper or Not now, nothing else on the screen): **Check the paper**, **Change keys**, **Change the vault**, **Name a successor**, and last, set apart, **Escape a contested position**. A change of keys shows its steps along the top: the words › read back › new chain paper › signed › new signing words.
- **Collectives**, behind the same door: **Waiting for you** (give your share), **Start a rotation**, **In the same room**, **Check a share** (new).
- **Runner**: **On or off**, **Apps**, **Waiting**, **Signed**.

Every function Kišib had is still there (section 2). On a phone, the tiles stack, a tile's column comes first and folds away once a part is chosen, with a back arrow.

### What the runner does

Until now every app held the signing words of the identities it uses. **The runner is a second way, on the Mac:** you give an identity's **signing** words to Kišib once, and the apps you approve ask Kišib to sign for them. **The app holds no key.**

- **It is off until you turn it on**, and nothing of it is kept while off. Turning it on, Kišib says the risk first, and you tick that you read it: while on, Kišib keeps those signing keys on this Mac; whoever gets into the Mac can sign as those identities; a malicious app could cover Kišib's panel or trick a click; **money, agreements and keys always ask**; turning it off forgets everything. **The chain key is never given to it**: Kišib refuses chain words there.
- **Pairing starts in the app and is approved in Kišib.** Dub shows a code; Kišib shows the same code under "Dub asks to pair"; you choose which identities Dub may use, and approve.
- **Each act is shown to you inside Dub's window.** When Dub would sign (a post, say), Kišib draws a small panel in the middle of Dub's window, striped in Kišib's blue, reading "Drawn by Kišib · Dub cannot read or change this frame": "Dub asks Kišib to sign a post", as whom, the post's words, Sign it or Decline. Dub cannot read the panel or click it for you; it only waits for the answer.
- **"Always yes"** for small things, per app and kind (Dub's posts and replies, private messages, display names, the contacts list): then Kišib signs without the panel. Money, agreements (relying on someone's act included) and keys always ask.
- **Waiting**: if you close a panel, the request waits in Kišib for ten minutes; answer it there, or show the panel again from Dub.
- **Signed**: what the runner signed, each act a card with the usual two menus.
- **Revoke** an app in Kišib, and it signs through Kišib no more.
- **After a change of keys** from paper, the runner refuses (its key no longer counts) until you give it the new signing words, in Kišib; Dub then goes on, in new lines.

**Why Dub talks to Kišib directly**, when the apps otherwise talk through MOR: the reason you gave. The asking app holds no key, so it cannot put a draft on MOR. It is the one exception, and the runner's cMIP says so.

### How to try it

On the Mac, section 6's steps: turn the runner on, give it an identity, pair Dub from its identity panel (+ Add › Use one from Kišib), post, try a standing yes, revoke, turn it off.

### The chain-key signer's code, to draft 6

The air-gapped signer's code (`modules/airgap/`) now does what draft 6 says: **a new paper at every change of keys**, no choice; **its words shown, hidden, and three typed back before the change is signed**; asking for the old paper's next key is refused.

### Pictures to look at first

In `docs/kishib-runner/`:
1. `runner-mac-05-panel.png`: Kišib's panel inside Dub's window (beside the mockup `dub-runner`).
2. `kishib-01-start.png` (the web client's three tiles) and `kishib-30-mac-start.png` (the Mac's four).
3. `kishib-01b-door.png`: the quiet door.
4. `runner-mac-01-off.png`: the runner off, its risk said first.
5. `runner-mac-04-approve.png`: Dub asking to pair, its code.
6. `runner-mac-07-signed.png`: what it signed, with Why it's valid.
7. `kishib-06b-new-chain-words.png`: a change of keys, the new chain paper before signing, its steps above.
8. `kishib-52-make-chain-words.png`: Make an identity.
9. `runner-phone-01-panel.png`, `kishib-55-phone-tiles.png`: at a phone's size.

## 2. Every function of Kišib, and where it lives now

| Function | Before | Now |
| --- | --- | --- |
| Change an identity's keys (from paper; every line kept, cards given; H79's two papers) | Start › door | **Paper › Change keys** (after the quiet door) |
| Change the vault | Start › door | **Paper › Change the vault** |
| Name a successor | Start › "Name or confirm a successor" | **Paper › Name a successor** |
| Confirm a succession (the successor's signing words) | the same door | **Identities › Confirm a succession** (accepted) |
| Escape a contested position | Start › door | **Paper › Escape**, last, set apart |
| Check paper words | Start › door (rare) | **Paper › Check the paper** |
| Show an identity's record | Start › door (rare) | **Identities › Read a record**; also each identity Held here › Its record |
| Rotate a collective, remote | Start › door | **Collectives › Start a rotation** |
| Rotate a collective, in the same room | the same form, a box ticked | **Collectives › In the same room** |
| Give my share to a rotation | Start › door | **Collectives › Waiting for you** |
| The rotation's sitting: send again, look again, words shown and typed back, a new share shown once | full page | in the tab's pane, with its steps for a change of keys |
| Pair this browser (the program) | pairing screen | unchanged |
| The web client's banner | a paragraph | one line with its "?" |
| **Make an identity** (H48) | — | **Identities › Make an identity** (new) |
| **Check a share** | — | **Collectives › Check a share** (new, accepted) |
| **The runner** | — | **Runner** tile; **Identities › Held here** |

Nothing was dropped.

## 3. Where the build differs from the mockups, and why

| Built (`docs/kishib-runner/`) | Mockup | Difference, and why |
| --- | --- | --- |
| `kishib-30-mac-start.png` | `kishib-home` | Identities' line names **Make an identity** (the brief, H48). Paper's line says "check them" first, as its column now begins. |
| `kishib-04-record.png` | `kishib-identities` | The column has **Make an identity** first; **Held here** comes first when the runner is on, "Held by the runner · off" at the foot when off (as drawn). The record is today's record in plain words (homes, keys, lines, contest, succession), under the form, not the mockup's condensed card. |
| `kishib-02-check-form.png` | `kishib-paper` | Paper's column follows the brief's order: Check the paper, Change keys, Change the vault, Name a successor, then Escape apart. |
| `kishib-06-rotate-review.png` | `kishib-paper-review` | The review keeps every section of today's (every line with its words, the vault, the succession, what is signed), not the mockup's short list: what is signed is read in full before signing. |
| `kishib-06b-new-chain-words.png`, `kishib-09-new-words.png` | `kishib-paper-chain-words`, `-signing-words` | **The steps read "new chain paper › signed"**, as built since H79 ("confirming the new chain key comes before signing the rotation", decided), where the mockup drew the chain paper after "Signed". |
| `kishib-01b-door.png` | `kishib-paper-door` | The door carries the brief's words first ("Have your paper ready…"), then the mockup's. The same door guards Collectives. |
| `kishib-33-collective-waiting.png` | `kishib-collectives` | Collectives' column follows the brief: Waiting for you, Start a rotation, In the same room, Check a share. |
| `runner-mac-01-off.png` | `kishib-runner` | The risk lists five lines (the folder and the reading of it, the click, always-ask, what turning off forgets). |
| `runner-mac-04-approve.png` | `kishib-runner-yeses` | **Apps** carries each app's standing yeses (Ask / Yes per kind, "always ask" for money, agreements, keys and what Kišib cannot read) and Revoke; the column reads On or off, Apps, Waiting, Signed (the brief), not "Standing yeses" and "What it signed". |
| `runner-mac-05-panel.png` | `dub-runner` | As drawn, with one line added under the words: on which of Dub's lines the act goes, and at which position. The frame is a little taller than the panel needs. |
| `runner-mac-07-signed.png` | none | New: each act a card with the kit's two menus; no ✓ (the card is not verified as it is drawn: "Why it's valid" reads the act at the identity's homes and relays). The act's menu has no Rely or Anchor: Kišib signs nothing everyday. |
| `kishib-55-phone-tiles.png`, `kishib-56-phone-record.png` | `kishib-home` (phone) | On a phone the tabs are hidden: Kišib's mark returns to the tiles. |
| none | none | Kišib's program on **Linux** shows the Runner tile too (the program is the same; "Mac only" read as "never on the web": question 5). |

## 4. For the MOR lead

**Nothing for the MOR lead.** No MIR, MICS, freeze test or verdict changes: the runner is a Dubsar cMIP and puts nothing on MOR but ordinary acts. Shared client code touched, none of it core, each change keeping every other app's behaviour: `clients/genesis/src/identity.ts` (a signer for a file holding no key: `signNow`, `signApartNow`; the private everyday path split, unchanged where a key is held), `clients/genesis/src/private.ts` (the public half of an encryption key where no secret is held), `clients/desk/src/local.ts` (two options: `frames`, `routes`), `clients/damgar/src/messages.ts` (`sendToSelf` signs through `signNow`, and compares a public half where no secret is held: Dub's "Ask Damgar" through the runner).

## 5. Questions for Nobody, allegedly

One at a time; the next only once the one before is answered.

**Question 1. The runner's keys at rest.** While on, Kišib keeps the signing keys in its folder, unencrypted (said in the risk). So "whoever gets into the Mac can sign as you within what you allowed" is true only for someone using Kišib's page; someone reading the folder can sign anything. nsecbunker asks a passphrase each time it starts, and keeps the keys encrypted otherwise. Options: (a) keep as built, the stated cost; (b) a passphrase at each start of Kišib, the keys encrypted at rest (a forgotten passphrase means giving the words again); (c) the Mac's keychain. *My lean: (b), in the runner's draft 2: it makes the stated risk exactly "within what you allowed" for anyone who did not see you type the passphrase, at the cost of one more thing typed when Kišib starts.*

**Question 2 (after question 1). Reading private messages through the runner.** Draft 1 signs; it opens nothing. So Dub, holding no key, sends private messages for an identity used through Kišib but cannot open the replies, and cannot seal its follow list to it. NIP-46 (which nsecbunker serves) lets a paired app ask for decryption as a separate permission. *My lean: yes, in draft 2: "may open what is sealed to this identity" as a choice made when approving the app, never a panel per message (it signs nothing), each opening counted in Signed.*

**Question 3 (after question 2). Relying on an act always asks.** The decision lists money, agreements and keys. I put a reliance (a witness act) with agreements, since it keeps another's act standing if its author disowns it. *My lean: keep it so.*

**Question 4 (after question 3). Turning off forgets the pairings too.** Built: off forgets keys, pairings and the record of what was signed; every app pairs again after. *My lean: keep it so: nothing of the runner remains while off.*

**Question 5 (after question 4). The runner on Linux.** "Mac only" was decided; Kišib's program also runs on Linux, and shows the Runner tile there. *My lean: keep it, reading "Mac only" as "never in the web client", since the reasons (a program that keeps running, keys out of the browser) hold on Linux as on the Mac.*

## 6. Human test steps (checked against the READMEs of Kišib, Dub and the kit)

*On the Mac, test identities only. The web clients at `*.dubsar.org` keep today's pages until released and served (section 7).*

**Bring the Mac up to this branch**, in Terminal, from the MOR folder:

```
git fetch origin && git checkout claude/kishib-kit-runner && git pull
cd clients/genesis && npm install && npm run wasm
cd ../desk && npm install && cd ../site && npm install && cd ../kit && npm install
cd ../dub && npm install && sh scripts/make-app.sh
cd ../kishib && npm install && sh scripts/make-app.sh
```

**Kišib on the Mac:**
1. Open **Kišib**. Four tiles, the bars on each: Identities one, Runner two, Paper three, Collectives three. Top right: "Holds nothing · runner off".
2. **Paper**: the quiet door, nothing else on the screen. Open Paper. The column: Check the paper, Change keys, Change the vault, Name a successor, then Escape apart.
3. **Identities › Make an identity**: a home (one of yours, test), relays if you like; Read it back; Sign it; write the chain words; three back; then the signing words, three back. Bring it into Dub with its ID and signing words.
4. **Paper › Change keys** for that identity (its chain words, the cards from Dub's Line and homes): the steps along the top; the new chain paper first, then signed, then the new signing words.
5. **Identities › Confirm a succession** and **Collectives › Check a share** if you have a collective's papers at hand (one paper: written right and whose; two papers: they rebuild the key).

**The runner, with Dub:**
6. **Runner › On or off**: read the risk; "Turn it on" refuses until you tick it; tick, turn it on.
7. **Identities › Held here**: give it the identity from step 3, by its ID, a home and its **signing** words. Top right now names it.
8. In **Dub**: the identity panel (top right) › **+ Add › Use one from Kišib** › Ask Kišib to pair. Dub shows a code.
9. In **Kišib › Runner › Apps**: "Dub asks to pair", the same code. Approve.
10. In **Dub**: I approved it in Kišib › **Use it**.
11. Post something: **Kišib's panel appears inside Dub's window**, striped blue, "Drawn by Kišib · Dub cannot read or change this frame". Sign it; the post appears.
12. Post again and tick **Always yes for Dub's posts and replies**; post a third time: no panel.
13. Tip someone's post with **Ask Damgar**: the panel asks, with no "always yes" box. Decline: nothing signed.
14. Post, then close the panel with its ×: Dub says Kišib waits. In **Kišib › Runner › Waiting** it is there; or in Dub, Show the panel again.
15. **Kišib › Runner › Signed**: each act a card; click its act ID (bottom right), Why it's valid.
16. **Kišib › Runner › Apps › Revoke**; in Dub, post: refused.
17. **Runner › On or off › Turn it off**: top right says "Holds nothing · runner off". In Finder, `~/mor-kishib` holds no `runner.json`.

**Kišib on the phone** (the web client, once released and served at `kishib.dubsar.org`): three tiles, no Runner; a tile's column first, then the part, with a back arrow; Paper's quiet door.

## 7. What changed, file by file

- `clients/kishib`: `src/runner.ts`, `src/runner-read.ts` (new: the runner), `src/server.ts` (its doors; the runner's operations; Kišib's icon), `src/kishib.ts` (`makePlan`, `checkShare`; the made identity's words), `src/collective.ts` (`checkShare`), `src/ops.ts` (`make plan`, `check share`, `RUNNER_OPS`), `src/shapes.ts`, `src/page/view.ts`, `src/page/ui.ts`, `src/page/panel.ts` (new), `src/page/app.ts`, `src/web/app.ts`; tests `runner.test.ts`, `runner-lines.test.ts`, `runner-browser.test.ts` (new), `browser.test.ts`, `vault-door.test.ts`, `web-build.test.ts`, `world.ts`; `built/` (the web release, rebuilt); README.
- `clients/dub`: `src/runner.ts` (new), `src/dub.ts` (an identity used through Kišib: `runnerState`, `runnerPair`, `runnerTake`, `runnerAsking`, `runnerDrop`, `runnerUnpair`; its key check; no key read where none is held), `src/ops.ts`, `src/server.ts` (the link; `frame-src`), `src/shapes.ts`, `src/page/ui.ts` (+ Add › Use one from Kišib; the panel in the slot), `src/page/view.ts`; `test/browser.test.ts`; README.
- `clients/kit`: `src/html.ts`, `src/dom.ts` (an act menu without Rely, Anchor and Correct for an app that signs nothing everyday; the slot's `closed`); README.
- `clients/genesis`: `src/identity.ts`, `src/private.ts` (section 4). `clients/desk/src/local.ts`, `clients/damgar/src/messages.ts` (section 4).
- `cmips/cmip-runner-draft-1.md` (new), `cmips/README.md`.
- `modules/airgap`: `src/device.rs`, `src/bin/mor-signer.rs`, tests, README; `modules/module-airgap-chain-key-signer-draft-6.md` (its code's note and section 7 marked run).
- Records: F377, H48; this report and `docs/kishib-runner/`.

**The web releases.** Kišib's is rebuilt here (`clients/kishib/built`, its test green). **Dub's is not:** its test requires Dub's WebAssembly to be the display client's (`clients/site/built`), and the display client's release still carries the WebAssembly from before the core's last changes; rebuilding Dub's alone fails that test, and the site is not this round's. The merge should carry `[release dub web]` together with a release of the display client, or a machine session releases both.

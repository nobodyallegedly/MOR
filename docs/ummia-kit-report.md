# Ummia on the kit, and specification cards: report

*23 October 2026, Dubsar Suite, round 5 of the redesign (the last app), branch `claude/ummia-kit-cards`, for Nobody, allegedly, and the Suite lead. Built from the redesign drawn and approved (`docs/design/suite-redesign.md`; the mockups `docs/design/mockups/ummia-*`; `docs/design/mockups-report.md`, its function table) and from the decision of 23 October on specification cards. Finding **F395**. Test identities only; regtest only; no server address or key in the repository.*

**Readings I took, running alone** (the brief: "take the most reasonable reading, say at the top of your report which reading you took"):
1. **A card's `refs` name the specification's publication, with its signer, never the spec hash itself.** The brief says a card's `refs` "names the specification". In the Envelopes MIR, a bare hash in `refs` is an act's id (rule 20), and a spec hash is not one. So the card's own text line `Specification: mspec1…` says which specification it is about, and `refs` points at the act that published it. This also lets a card name one of the core's texts, which no act publishes.
2. **`clients/site/src/listing.ts` is not changed.** The brief allowed it only to read cards, and dubsar.org's listing may show a card's title, nothing more. The listing's page lives in another file (`listing-view.ts`), which this round may not touch. Any change to `listing.ts` would also change the display client's release, for a title nobody could see yet. Ummia reads cards with its own code. See question 1.
3. **The MICS document's and the freeze test suite's built-in cards** are keyed by the hashes Development rule 26 computes from the current drafts (MICS v30, suite v30). The core has a test value for each MIR, but none for these two. A test computes them again from the files.
4. **S7f was not on main** when I last checked (main at `bc92660`, the splits round's merge). So the WebAssembly is main's, byte for byte, and only Ummia's release changes. See section 4.

## 1. In plain words first

### What Ummia looks like now

Ummia opens on **four big tiles**, like the other apps. Each has its danger marks, as decided on the mockups:
- **Look**: one bar.
- **Discuss**: one bar.
- **Publish**: two bars.
- **Choose**: two bars.

A tile opens with **its column on the left**, and the tabs across the top move between tiles. On a phone the tiles stack, and a tile opens on its first part; ← Back shows the column. The look is the kit's: dark, Ummia's coral in pastel fills, red only for alarms, every disclaimer in one line with a "?".

**Top right is the identity in use.** Its panel lists the identities and **the collectives under each one**. To act as a collective, you choose it there. Publish also shows "Who acts" as chips, as drawn. The panel has:
- **+ Add**, with **Bring one** (Ummia still never makes an identity) and **Use one from Kišib** (on the Mac).
- A **⋯** menu per identity: Words, Line and homes, New words from Kišib, A collective under it, Remove from Ummia… (Remove says plainly what it does first).
- **Relays** in its foot.

If a key held here was changed in Kišib, a warning shows under the top, with the box for the new words right under it.

- **Look**: one feed box.
  - **Point at** a relay, a single ID, **my contacts** or **a release**. "My contacts" is your follow list, the same one Dub uses. A release shows that release and the whole line before it.
  - **Filter by** releases, cMIPs, Modules, xtypes and extensions. MIPs are a sixth chip, off at first. There is also a **Layer** row.
  - **Saved** points in the column: any point you save, and a developer's releases.
  - A release's card says **what changed since the version before** ("What changed since 0.3: 1 file changed, 1 added").
  - A specification's card shows its **title from its creator's card**, with the summary.
  - Under the feed, one line: "Public agreements only, as the relays answer ?". Tracking's counts are behind its "?".
  - **A specification's page** and **One specification's acts** are parts of the column too.
- **Discuss**:
  - **MIP drafts**, and **+ Start a MIP**.
  - **Discussions**: the threads started here and the drafts published for discussion, each with its replies. You can **reply as a signed document**.
  - **Bug reports**: the reporting identity is set here, then the report and its answers.
- **Publish**:
  - **A release**: from a folder, checked as anyone would, the one before pre-set, or as a collective with its keys.
  - **A cMIP or Module**: its hash first, then Sign and publish.
  - **Anchoring**: the anchors asked, paid in Damgar.
  - **Published here**: each specification, with **Its card** or **A later card**.
- **Choose**: the accepted list **by layer**. Each entry has Copy, Remove and Its page; then **+ Accept by hash** and **Publish it**.

On every card, the act's menu has **Add to accepted list** below the line, then Rely on it and Anchor it. The signer's menu has **Follow their releases**. There is a **Copy** beside every hash.

### How a developer publishes a cMIP with its card

1. Go to **Publish › A cMIP or Module**. Paste the text, fill only the fields your text describes, then press **Read it back, with its hash**. The hash shows first, with a Copy button. Press **Sign and publish**.
2. Right away, Ummia offers **its card**:
   - the title (taken from the text's first line);
   - a short summary;
   - releases and test vectors, if you have any;
   - a box, ticked, to **start a discussion thread** for it.
3. Press **Read it back**. The card is shown exactly as it will be signed. Press **Sign and publish**. Ummia signs the thread first, then the card, which names the thread.
4. Later, when a release or vectors arrive, go to **Publish › Published here › A later card**. The newest card in your own sequence is the one that counts.

A card is **a plain post**. In Dub it appears in your feed as a post starting "Dubsar Specification Card". It changes nothing in the specification.

### How anyone finds it

- In **Look**, the specification shows its card's title and summary. **Its page** gathers everything tied to it:
  - its text;
  - the creator's latest card;
  - other people's cards, each **shown as their word**;
  - the releases implementing it;
  - its vectors and its discussion (with **Reply, as a signed document**);
  - the public agreements naming it;
  - the drafts before and after it;
  - its creator.
- From a page or a card's act menu: **Add to accepted list**.
- A hash nobody published shows "No specification with this hash was found", and only what others say about it.
- The core's eight texts have built-in cards: the text's own heading as title, plus a line in Ummia's words saying that no card speaks for them.

### Screenshots to look at first

In `docs/ummia-kit/`:
1. `mac-02-home.png`, `phone-01-home.png`: the tiles. Compare with `ummia-home`.
2. `mac-20-look.png`, `mac-21-look-filtered.png`, `phone-look.png`: Look. Compare with `ummia-look`.
3. `mac-22-act-menu.png`, `mac-23-signer-menu.png`: the two menus. Compare with `ummia-act-menu` and `ummia-act-signer-menu`.
4. `mac-10-spec-hash-first.png`, `mac-11-card-offered.png`, `mac-12-card-review.png`: a cMIP, then its card. Compare with `ummia-publish`.
5. `mac-26-spec-page.png`, `mac-27-mir-page.png`: a specification's page, and a core text's.
6. `mac-24-saved-point.png`, `mac-25-release-line.png`: a developer's releases, and a release line.
7. `mac-31-discussions.png`, `mac-30-mip.png`: Discuss. Compare with `ummia-discuss`.
8. `mac-40-choose-money.png`, `mac-41-choose.png`: Choose by layer. Compare with `ummia-choose`.
9. `mac-50-identity-panel.png`, `mac-51-collective-under.png`: the panel, and a collective under its member.
10. `mac-71-kishib-panel.png`: Kišib's panel inside Ummia's window, signing a card.

## 2. Every function of Ummia, and where it lives now

| Function (the mockups report's rows) | Before | Now |
| --- | --- | --- |
| Bring an identity (ID, signing words, address) | identity window | first screen; panel › + Add › Bring one |
| **Use an identity held in Kišib** | none | first screen; + Add › Use one from Kišib (Mac only) |
| Who acts (self or a collective) | chooser on every tab | identity panel (a collective under its identity), and "Who acts" chips in Publish |
| Act for a collective (add it by ID) | "Act for it" in the chooser | the identity's ⋯ › A collective under it |
| Words, Ummia's line and homes (the card for Kišib), forget | identity window | the identity's ⋯ menu |
| New words after a change of keys | the identity window's fold | the warning under the top with its box; ⋯ › New words from Kišib |
| A release from a folder; checked; the one before pre-set | Releases | Publish › A release |
| Does it count for the collective | Releases | Publish › A release (as the collective) |
| Anchoring: offer, tier, prepared for Damgar | Releases | Publish › A release › Anchor it; Publish › Anchoring; any card's act menu › Anchor it |
| cMIP or Module, hash first | Specifications | Publish › A cMIP or Module |
| Specifications published here | Specifications | Publish › Published here (with their cards) |
| Tracking relays: cMIPs, Modules, extensions, xtypes, MIPs | Tracking | Look: Point at, Filter by, Layer |
| The acts of one specification | Tracking | Look › One specification's acts |
| Accept from a tracked card | Tracking › Accept it | the act menu › Add to accepted list; a specification's page |
| **Following a dev's releases; a release line** | none | the signer's menu › Follow their releases; Look's Saved points; Point at › a release |
| **What changed between versions** | none | each release's card in Look |
| MIPs: start, write, discuss, publish | MIPs | Discuss › MIP drafts, + Start a MIP |
| Replies to MIP drafts | MIPs › Replies | Discuss › MIP drafts › Replies; Discuss › Discussions |
| **A reply as a signed document** | none (from Dub) | Discuss › Discussions; a specification's page |
| Bug reports and answers | Reports | Discuss › Bug reports |
| Accepted list: add, remove, publish | Accepted | Choose (by layer), + Accept by hash |
| Settings: relays, tracking relays | Settings | identity panel's foot › Relays |
| Settings: reporting identity | Settings | Discuss › Bug reports |
| **Rely on it** | none | the act menu (a witness act, RELY typed) |
| **Specification cards; a page per specification** | none | Publish (offered after publishing; Published here); Look › a specification's page |
| The web client's banner | a paragraph | one line with its "?" |

Nothing was dropped. `test/browser.test.ts`, "every function of Ummia before the redesign, found in its new place", visits each row of the table by clicks and finds it there.

## 3. Where the build differs from the mockups, and why

| Built (`docs/ummia-kit/`) | Mockup | Difference, and why |
| --- | --- | --- |
| `mac-20-look.png` | `ummia-look` | **A sixth chip, MIPs, off at first.** Tracking showed MIPs, by what they fork, and the mockup's five chips do not name them. With the chip off, the feed is as drawn. Also a **Layer** row, so Look can be filtered by layer as Choose is (the brief: "and by layer"). |
| `mac-20-look.png` | `ummia-look` | The column holds **A specification's page** and **One specification's acts** above Saved. The page is new this round, and the plain look-up is kept. |
| `mac-20-look.png` | `ummia-look` | **No time on the cards in the test pictures**: the Dubsar clock does not stamp the test homes. Where it stamps, the cards show its time and the feed is in its order. |
| `mac-20-look.png` | `ummia-look` | **The specification's hash is a Copy button on every card**, beside "Its page" ("hashes easy to copy everywhere", decided). Its short form stays in the card's text. |
| `mac-50-identity-panel.png` | `dub-identity-panel` | **+ Add has two ways, not three**: Ummia never makes an identity, as before (its README). |
| `mac-50-identity-panel.png` | all | An identity shows by its short ID, since Ummia reads no display name; a collective as "Collective mid1…". |
| `mac-22-act-menu.png` | `ummia-act-menu` | As drawn. On a release, "Add to accepted list" is greyed out ("not a specification"). **Correct it**, on one's own specification, says it is never corrected and offers "Sign a later card". |
| `mac-23-signer-menu.png` | `ummia-act-signer-menu` | As drawn. Follow and Follow their releases write the follow list Dub reads. Removing someone and Mute say that those are done in Dub. |
| `mac-11-card-offered.png` | `ummia-publish` | **New**: the card, offered right after Sign and publish (decided 23 October). |
| `mac-31-discussions.png` | `ummia-discuss` | Each thread is a box with its replies as cards, and a button for a signed reply (not the mockup's typing box at the bottom). A reply is a long-form document, which a typing line cannot show well. |

**Found while building, and done:**
- **Replies to one's own drafts were not found** when an identity's inbox relay was also the relay it published to. The inbox was asked only for what is addressed to it, never for public posts. Both are asked now (`src/mips.ts`).
- **A reply from Ummia leaves a copy in the inbox of whoever wrote what it answers**, as Dub's replies do, so their app finds it.
- **A card that names a discussion thread is not a reply to it**: it shows on the specification's page, not among the thread's replies.

## 4. For the MOR lead

**Nothing for the MOR lead.**
- No MIR, MICS, freeze test, core code or verifier's verdict changed. A card is an ordinary text act; verifiers ignore what it says.
- **The WebAssembly is main's**: SHA-256 `47af51a7…cdcf8`, unchanged. S7f was not on main at my last check, so only Ummia's release is rebuilt. If S7f lands first, the merge rebuilds all six (section 6, "Before merging").
- Two small things the lead may wish to know, nothing to do:
  - Ummia keys the MICS document's and the suite's built-in cards by the hashes rule 26 gives for v30. They change with each new draft, and a test checks them against the files.
  - The card cMIP reads "the latest in the creator's own sequence" per line, using `prev`. Two lines of one identity have no order of their own, and the Dubsar clock orders them where it stamped both. That is the cMIP's mechanic, not the core's.

## 5. Questions for Nobody, allegedly

One at a time; the next only once the one before is answered.

**Question 1. dubsar.org's listing and cards.** The brief let `listing.ts` read cards so the listing could show a card's title. But the listing's page is another file, and changing `listing.ts` changes the display client's release. So I left both as they are. The listing shows each specification's own first line.
- *My lean:* show the creator's latest card title in the listing in the site's next session, with the page change in the same pull request.

**Question 2 (after question 1). Who may sign a card for a core text?** Built: anyone; it is shown as their word under Ummia's built-in card, never above it.
- *My lean:* keep it. Your words: "Anyone may sign a card for them, shown as their word."

**Question 3 (after question 2). Signing a card for a specification nobody can find.** Ummia refuses ("No specification with this hash was found on your relays"). Another client may still sign one, and Ummia shows it as "not found". The test signs one from Dub.
- *My lean:* keep the refusal: a card pointing at nothing helps nobody find anything.

**Question 4 (after question 3). The MIPs chip.** Look has a sixth chip, MIPs, off at first (section 3).
- *My lean:* keep it, off at first. Tracking showed MIPs, and the chip keeps that function in Look.

**Question 5 (after question 4). Follow from Ummia.** Ummia now adds to the same follow list as Dub (Follow, Follow their releases), but never removes or mutes: those stay Dub's.
- *My lean:* keep it so. "Unfollow" belongs with the contacts list, which is Dub's.

## 6. Human test steps

*Test identities only, regtest only. Checked against Ummia's and Dub's READMEs ("Using it").*

**Install once**, on the Mac, from the MOR folder:
```
git fetch origin && git checkout claude/ummia-kit-cards && git pull
cd clients/genesis && npm install && npm run wasm
for p in kit barebone repo collective assess longform site reports connector reader manage anchoring-service grants; do (cd ../$p && npm install); done
cd ../desk && npm install && cd ../dub && npm install && sh scripts/make-app.sh
cd ../damgar && npm install && sh scripts/make-app.sh
cd ../kishib && npm install && sh scripts/make-app.sh
cd ../ummia && npm install && sh scripts/make-app.sh
```
(On Linux, use `make-desktop.sh` in place of `make-app.sh`.) The homes and relays are those the READMEs name.

**Ummia on the Mac**
1. In Dub, make a test identity, then show its signing key's words (Dub's identity menu › Words).
2. Open **Ummia** from `~/Applications`. On the first screen, **Bring one**: the ID, the words, a home's address.
3. Top right, open the identity › **Relays**: name the relays your acts go to, and the relays Look asks. Save.
4. On the home, check the four tiles: Look one bar, Discuss one, Publish two, Choose two.

**Publishing a cMIP with its card, and finding its page**
1. **Publish › A cMIP or Module**: paste a short text, for example `# cMIP: My notes, draft 1` and a line under it. Press **Read it back, with its hash**: the hash comes first. Press **Copy**, then **Sign and publish**.
2. Its card appears: check the title, write a summary, leave "Start a discussion thread" ticked. **Read it back**, then **Sign and publish**.
3. **Look**: the cMIP shows with your card's title and summary. Press **Its page**: your card, its discussion thread, and your name as creator.
4. In Dub, your feed shows the card as a plain post, and the thread too. Reply to the thread from Dub.
5. Back in Ummia, **Discuss › Discussions**: Dub's reply is under the thread. **Reply, as a signed document**.
6. **Publish › Published here › A later card**: change the summary and sign it. On its page, the new card counts, and "1 earlier card, superseded" shows.

**Following a developer's releases**
1. In a second identity's Ummia, publish two releases of one folder, 0.3 then 0.4 (**Publish › A release**; for 0.4, choose 0.3 as the one before).
2. In your Ummia, **Look**: the 0.4 card says "What changed since 0.3: …".
3. Open its signer's menu (their short ID, top left of the card) › **Follow their releases**, and give a name. In the column, **Saved** gains "…'s releases", which shows their releases only.
4. In Dub, your contacts now include them: it is the same follow list.
5. On the 0.4 card, press **Its line**: both releases.

**Accepting it from its card's menu**
1. In **Look**, on the second identity's cMIP card, open the act menu (the act's short ID, bottom right) › **Add to accepted list** › **Accept it**.
2. **Choose › Every layer**: it is listed; **Development** shows it, **Money** does not. Then **+ Accept by hash**, **Remove**, **Publish it**.

**Acting as a collective** (a collective founded in Edubba whose Publishing area you hold, as in Ummia's round 2 steps)
1. In the identity's ⋯ menu, **A collective under it**: give its ID, then **Act for it**.
2. Open the panel again and choose the collective under your identity. Top right now shows it; **Publish › A release** reads back "for the collective".

**Use one from Kišib** (Kišib open, its runner on, an identity given to it)
1. In Ummia: + Add › **Use one from Kišib** › **Ask Kišib to pair**. Compare the code, then approve Ummia in Kišib (Runner, Apps) for that identity.
2. Take the identity. In **Look › A specification's page**, open `MIR: Text` (paste the Text MIR's hash) and press **Write a card of your own**. Untick the thread, **Read it back**, **Sign and publish**. Kišib's panel appears inside Ummia's window: **Sign it**.

**Ummia on the phone** (the web client, once released and served as the README says)
1. Check the one-line banner and its "?". **Use one from Kišib** is greyed out.
2. Bring a test identity. The tiles stack. Open Look: the column comes first; choose The feed; **← Back** brings the column again.
3. Publish › A cMIP or Module: publish one, then sign its card.

**Before merging** (for the lead who merges second): if S7f is on main by then, merge main into this branch, `npm run wasm`, then `npm run release` in `clients/site`, `dub`, `kishib`, `damgar`, `ummia` and `desk`, and `npm run test:build` in each. Section 7 records what was done here.

## 7. What changed, file by file

- `clients/ummia`:
  - `src/cards.ts` (new): the card's text, read and written, published, found; built-in cards for the eight texts.
  - `src/look.ts` (new): Look's feed, releases and what changed, a specification's page.
  - `src/follows.ts` (new): the follow list, read and written.
  - `src/ummia.ts`: the operations above, the runner, Rely on it, Anchor it on any public act, the accepted list's layers, a reply as a document.
  - `src/track.ts`: each specification's publications, text and the agreements naming it, and every specification once, MIPs included.
  - `src/mips.ts`: replies found where an inbox relay is also a relay.
  - `src/shapes.ts`, `src/ops.ts`, `src/server.ts` (Kišib's runner, its origin framed).
  - `src/page/view.ts`, `src/page/ui.ts`: rewritten on the kit. `src/page/app.ts`, `src/web/app.ts`: one name each.
  - Tests:
    - new: `cards.test.ts`;
    - rewritten: `browser.test.ts`;
    - updated: `web-build.test.ts` (the kit's coral), `releases.test.ts` (Anchor it on any public act), `world.ts` (a test's own Kišib folder; the collective's founding shared).
  - `built/` (rebuilt), README.
- `clients/kit/README.md`: Ummia is on the kit. The kit's code did not change.
- `cmips/cmip-specification-card-draft-1.md` (new), `cmips/README.md`.
- Records: `docs/findings/MOR-findings-log-round-2.md` (F395), this report, `docs/ummia-kit/` (screenshots).

**Every test run here, on this branch:**

| Suite | Passed |
| --- | --- |
| Ummia (`clients/ummia`, `npm test`) | 34 of 34 |
| Edubba's tests that drive Ummia (`real`, `round-3`, `real-browser`) | 5 of 5 |

The other suites are untouched by this branch, and CI runs them all.

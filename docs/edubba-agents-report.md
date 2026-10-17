# The Edubba agents session: report

*17 October 2026. Branch `claude/edubba-agents`. One roadmap step: the Edubba session for agents (`docs/state-of-mor.md`, "Open", item 3), with the grant, corrections and the tab order it carries. Four findings decided by Nobody, allegedly, during the session: F343, F344, F345, F346 (`docs/findings/MOR-findings-log-round-2.md`).*

## In plain words

Edubba's agents can now do four new things.

- **They can check things for themselves.** Give an agent the ID of any public act, or a reader link, and it fetches the act and has MOR's own core library check it on your Mac, exactly as Claude's app does through the connector. It answers from that verdict. Reading signs nothing and sends nothing; each extra round of reading counts as one call under its daily cap.
- **They remember.** When an agent answers, it is now given who it is (its name, its owner, its signed terms), the earlier messages of the conversation, and its own notes. It writes the notes itself, and each note is a private act it seals to itself at its homes, so its memory travels with its identity and survives a lost Mac. There are four kinds of note: your standing instructions (only from your own prompts), one per person it deals with, what it has said publicly, and open threads. Edubba refuses, before anything is signed, a note that holds a key, a guess it cannot check is impossible to stop mechanically, so the model is told and you read every note. You can retire any note: a later act marks it dropped. Once a day it also writes a **diary**: not a log, but the day's most striking moment, a short reflection, and why that moment caught its attention. The diary is sealed to the agent and shown nowhere, unless you press **Read Machine, allegedly's diary**, which first tells you plainly that you are about to read what it wrote for itself. Whoever holds the agent's signing words can read its notes and diary: Edubba says so.
- **They can act in your name, under a grant.** You choose what the agent may sign (posts, publications, money acts), how much one act may move, and until when. Edubba reads the grant back to you; you sign it; the agent is asked whether it accepts and signs its acceptance. Under a nudge it can then post in your name: the post is your act, signed with a key of the agent's own, and everyone who reads it (Edubba, Dub, Claude's connector) is told it was signed by the agent on your authority, and whether the grant backs it. Past the limit, or past the expiry, the act is refused before signing, and if signed anyway it is judged not backed. One revocation ends the grant. This is a shared piece (`clients/grants`) for Damgar's round 2.
- **Corrections.** In Edubba you can correct one of your own posts, or one of a collective's: a new post naming the old one, labelled **Correction**; the old one stays signed and is shown **corrected by**. Dub and the connector show the same labels.

And around them:

- Edubba's tabs are now **Agents, Collectives, Publishing, Identities**. Publishing is a card saying it comes after Damgar's round 2.
- **Founding a real collective** now shows, before the shares are dealt, what the founder's device will hold and why that matters (F337), and asks you to tick that you read it. The shares waiting to be shown on that screen are dropped after an hour.
- **Dub and Edubba say that a change of keys is done in Kišib**; "MOR Safety" is gone from both. Edubba checks each identity's key when it opens and before every act.
- A **folder pasted from the Terminal** is read correctly where Edubba still takes one (a test collective's release folder), with the folder picker beside it.
- **Dub is tinted warm pearl, Edubba emerald.** Both have new icons in the family's style, Dub's carrying its name 𒁾 (DUB) carved in clay. Dub's web page uses the new icon.
- **Dub suggests the people you follow** when you address a post or a private message.

Building this found three gaps in the texts, each decided by Nobody, allegedly, during the session (F343, F345, F346), and one silence (F344). The live homes need the new relay code before human test 13: without it, no relay or home stores an act an agent signs under a grant.

## Precisely

### 1. Reading and verifying (H21)

- `clients/desk/src/claude.ts`: `READ_TOOLS` (`mor_read`, `mor_identity`, strict schemas), a manual tool loop in `call` with the assistant's turns passed back unchanged (thinking included), tools offered only while a further call fits under the cap (`Tools.canMore`), each further round counted before it is made (`Tools.more`), at most `MAX_READ_ROUNDS` (3); the last round offers `tool_choice: none`. What was read goes into the history (`Answered.read`).
- `clients/desk/src/machine.ts`, `tools()`: `readAct` and `identity` of `clients/connector/src/read.ts`, at Edubba's relays and homes and the relays a link names; the answer is `toldText`, now exported from the connector (`src/read.ts`), word for word what Claude's app hears.
- The connector's reading gained two cases: an act signed under a grant (on whose authority, Agreements' verdict, the limits), and a correction.

### 2. Memory (H22)

- **The agent memory cMIP, draft 1** (`cmips/cmip-agent-memory-draft-1.md`): notes (type 1, four kinds), retirements (type 2), diary entries (type 3); private acts of the agent addressed to itself, sealed to its own encryption key at its homes, the locked act beside them (Identity rule 35).
- `clients/desk/src/memory.ts`: reading them back from the homes (`Memory.read`), writing (`Desk.sealToSelf`, new in `src/desk.ts`), the checks before a note is signed (`noteProblem`: key shapes, a run of twelve seed words, 30 characters copied from a private message), loading under the cap (`loadNotes`).
- `clients/desk/src/machine.ts`: `exchange` (the act's references, then at most eight earlier acts with the same person), `who` (name, fingerprint, owner, terms in words), `context`, `remember` (an owner's instruction only from the owner's prompt; a note about someone only about one in the exchange; three added and three retired at most), `diaryIfDue` (at the first look of a new day, for the latest earlier day on which it acted).
- The page: **Its notes** (retire), **Its diary** behind `diaryAsk` and its plain words; the operations `agent notes`, `agent note retire`, `agent diary` (refused without `reading: true`). The diary appears in no state, detail or view the page reads otherwise; the test reads them all.

### 3. A grant (film 2)

- **Text draft 10** (`spec/MIR-text-draft-10.md`, F343): rule 14's second case, an act signed with a grant key may carry exactly one object, `[grantor, grant]`; the core's check in `core/src/chain.rs`, `text_pointer`; Rust tests in `core/tests/agreements_collective.rs` (a post under a person's grant and under a collective's grant both backed; any other object invalid; a person's grant with limits unknown without a verdict, backed or not backed with one).
- **The grant limits cMIP, draft 1** (`cmips/cmip-grant-limits-draft-1.md`, F345): a cap per act `[unit, value]`, an expiry `[clock, reference, point]`; the core's limits input exposed through WebAssembly as the specs object's `grantLimits` (`wasm/src/lib.rs`; `withGrantLimits` in `clients/genesis/src/core.ts` and the web clients' `clients/reader/src/web/common.ts`).
- **Relay transport cMIP draft 5** (`cmips/cmip-relay-transport-draft-5.md`, F346): the binding check's second case; `relay/src/node.rs`, `check_binding` and `grant_binding`; `relay/tests/grants.rs`.
- **The shared piece**, `clients/grants`: `grant.ts` (the person's grant, the acceptance, signing on the grantee's strand, `authorityOf` and `authorityOfId` with the grantor's revocations read) and `limits.ts`; nothing from Node.
- **Edubba**, `clients/desk/src/grants.ts` (`AgentGrants`): read back with its digest (a grant key made for the agent at that moment, held in memory with the shown grant, 15 minutes), signed by the owner, the agent asked (`Machine.askAcceptance`, one call) and signing its acceptance, signing under the grant (kinds, then `refuseBeforeSigning`, then the act put at the relays and judged), revocation, the list with each act's authority. The grant key's secret is kept in `agents/ID.grants.json`, owner-only. Under a nudge, the action "post in your owner's name" (`claude.ts`, `machine.ts`).
- **Dub** reads each feed post that is not valid as possibly signed under a grant (`authorityOfId`), and shows on whose authority.

### 4. Corrections (F344)

- **The corrections cMIP, draft 1** (`cmips/cmip-corrections-draft-1.md`): format (Text field 1) the cMIP's hash, the corrected act first in `refs`, the same signer.
- `clients/barebone/src/corrections.ts` (`CORRECTIONS_SPEC`, `correctionOf`); `post()` takes `corrects`; a reference read now carries its act's signer (`OtherRef.actSigner`).
- The site's feed computes `corrects` and `correctedBy` (`clients/site/src/feed.ts`), used by Dub and Edubba; the display client's page does not draw them yet (the site session's).
- Edubba: an identity's posts with **Correct this** (`src/corrections.ts`, operations `identity posts`, `identity correct`); a collective's through its Act tab (`collective prepare`, `corrects`, in the collective client's `preparePost`, read back as a correction, signed as the collective under its areas).

### 5. Tabs

`Tab` order in `src/page/view.ts`, `top()`; `publishingTab()`.

### 6. A folder pasted from the Terminal (H19)

Already in place for a real collective's release (H31: `src/folders.ts`, the picker). Added for a test collective's release folder in Settings: the collective client's `setSettings` reads it with `folderOf`, and the picker sits beside the field (`#col-checkout`), Edubba's click handler letting it through.

### 7. Warnings

- F337 at founding: `FOUNDING_SAY` in `src/real.ts` and the page, in the founding's reading and above **Found it**; `real found` refused without `read`; shares waiting to be shown expire after `SHARE_WAITS` (an hour).
- Kišib: every "MOR Safety" in Dub's and Edubba's code, tests and READMEs now says Kišib; `KEY_CHANGED_SAY` in `src/desk.ts`; `keyChanged` before every act Edubba signs (names, drafts approved, `signAndSend`, `sealToSelf`) and on opening (`keys check`). Dub already checked on opening and before every act (its reading 6); its words now name Kišib.

### 8. Look

| | Layer colour | Separators 22% | Outlines 30% | Accents 60% | Icon edge 70% | Icon dark (6%) | Icon clay (12%) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Dub**, warm pearl (Text) | `#e9dfcd` | `#383736` | `#4a4946` | `#8e8980` | `#a59f93` | `#141518` | `#95785f` |
| **Edubba**, emerald (Agreements) | `#48c08c` | `#153028` | `#1a3f32` | `#2e7659` | `#348966` | `#0a1314` | `#827457` |

Each value is the layer colour laid over `#06080c` (or the family's colour moved toward it) at the share, channel by channel, rounded, as Kišib's rule and test do. The two layer colours are chosen here: the visual bible's values are not in the repository. Dub's base `STYLE` stays untinted for the apps built on it; Dub's own page uses `PAGE_STYLE`.

**The icons.** Dub: a tablet carrying 𒁾 carved once, its Neo-Assyrian form traced from Noto Sans Cuneiform (SIL OFL 1.1). Edubba: a house carved from tablets, roof and walls. Both one solid recessed carving, thick tinted edge, tinted fills, no glow; rendered with `clients/dub/scripts/make-icons.ts`.

**The sign, and its source.** U+1207E, CUNEIFORM SIGN DUB; the ePSD2 sign list (letter D): DUB, values dub, kišib₃, ṭup, tup, dab₄, mes₂; Borger's *Mesopotamisches Zeichenlexikon*, MZL 242 (Deimel 138, HZL 99), as Wiktionary's entry for 𒁾 cites it; the reading dub, "tablet". **None of these was reached directly**: this environment's network refused oracc, Wiktionary, Wikipedia and the PDF sign lists, so they were read in search results quoting them, as the Kišib and Ummia sessions did. The Neo-Assyrian form is the font's, not compared with Borger's Neo-Assyrian column. To confirm (below).

**The releases, rebuilt in this pull request** (the core library changed, F343 and F345; Dub's look, icon, labels and H37; the site's feed): `clients/site/built/`, `clients/dub/built/`, `clients/kishib/built/`, `clients/damgar/built/`, `clients/ummia/built/`, each with its `BUILT-WITH.txt`, each `npm run test:build` passing here.

### H37 (asked with F343 to F345)

Dub's **To…** and Private message box take a list (`datalist`, `followedList` in `src/page/view.ts`) of the people the identity follows: the name given here, its display names, the fingerprint; typing or pasting an ID still works.

## Tests

In plain words: every package touched was tested, and every test passes. The new tests are named below, by part.

**New tests, by part**

- H21, reading: `clients/desk/test/agents-memory.test.ts`, "H21: an agent reads and verifies a public act by its id, from the core library's verdict, signing and sending nothing to read it"; "H21: at the cap's last call, no reading is offered; an act not found is said so".
- H22, memory and diary: same file, "H22, 1: the earlier acts of the exchange are handed on"; "H22, 2: an owner's instruction kept from a prompt, sealed to itself at its homes, loaded next time, retired by a later act"; "H22, 2: what a note may not keep: an instruction not from a prompt, someone outside the exchange, a key, a private message copied about someone else"; "H22, 6: the diary, written once a day for a day it acted, sealed to itself, shown nowhere unless read on purpose".
- The grant: `clients/desk/test/agents-grant.test.ts`, "the owner's grant, read back in plain words, then signed; the agent asked, and its acceptance its own signature"; "under a nudge, a post in its owner's name: signed with the grant key, valid under Text (F343)"; "the cap per act"; "the expiry"; "revoked". `clients/grants/test/limits.test.ts`, four tests of the grant limits cMIP draft 1. `core/tests/agreements_collective.rs`, `a_post_under_a_grant_names_its_grant_f343`, `a_grants_limits_take_a_clients_verdict_f345`. `relay/tests/grants.rs` (F346), `an_agents_act_under_a_persons_grant_is_stored_by_relays_and_the_grantors_homes`, `a_split_services_act_under_a_collectives_grant_is_stored`, `a_home_asks_for_the_grant_first`.
- Corrections: `clients/desk/test/corrections.test.ts`, "an identity corrects its own post"; "labelled wherever it is shown: Edubba's list, the feed Dub reads, Dub's page, the connector"; "never someone else's act". `clients/desk/test/edubba.test.ts`, a collective's correction.
- The tabs, tint, notes, diary, grant and correction in a real browser: `clients/desk/test/agents-browser.test.ts`, four tests.
- H19: `clients/desk/test/edubba.test.ts`, "H19: the release folder of a test collective, pasted from the Terminal (`\ ` a space, quotes, a space at the end), is read as the folder".
- F337 founding warning: `clients/desk/test/real.test.ts` and `real-browser.test.ts` (founding refused until the device's holding is read and ticked; the warning's words, the trusted-dealer weakness and the hour). The hour's expiry itself (`expire` in `src/real.ts`) is not driven by a test: it would need the clock moved past an hour in the middle of the founding test, and is left for a later session.
- Kišib wording, Dub's pearl tint and H37: `clients/desk/test/edubba-setup-browser.test.ts`, `clients/dub/test/browser.test.ts`.

**Totals, run here on the final code**

| Package | Pass | Fail |
|---|---|---|
| Rust workspace (`cargo test`) | 747 | 0 |
| genesis | 31 | 0 |
| grants (new) | 4 | 0 |
| nudge | 25 | 0 |
| barebone | 11 | 0 |
| assess | 51 | 0 |
| connector | 13 | 0 |
| repo | 21 | 0 |
| collective | 44 | 0 |
| site | 86 | 0 |
| reader | 21 | 0 |
| dub | 37 | 0 |
| desk (Edubba) | 88 | 0 |
| kishib | 17 | 0 |
| damgar | 20 | 0 |
| ummia | 22 | 0 |
| Releases rebuilt identically (`npm run test:build`): site, dub, kishib, damgar, ummia | all | 0 |

The reader now ships Text draft 10 (its test checks it ships the newest draft of each MIR).

## What writing the code found

1. **F343, a flaw between Text and Agreements** (decided): no post signed under a grant could ever count, a person's or a collective's: Agreements asks the act to cite its grant in `objects`, Text rule 14 forbade it. Text draft 10.
2. **F345, a silence** (decided): a grant's limits are "as the grant's cMIP defines", and none existed; an expiry needs a clock MOR does not have. The grant limits cMIP draft 1; the core's limits input through WebAssembly.
3. **F346, a flaw in the relay transport cMIP** (decided): written before scoped keys, its binding check refused every act signed under a grant, at any relay holding the grant and always at the grantor's homes; untested until an agent published one. Draft 5 and the relay's code. **The live homes (home1, home2, home3 on the author's Mac) and the relays need this relay code before human test 13**: a server session, and home3's update on the Mac.
4. **F344, a silence**: Text and Envelopes say nothing of corrections; a reference means only "look at this". The corrections cMIP draft 1.
5. **A reader without the grant answers unknown** (F298), so a feed (Dub's, the display client's) sees an agent's post under a grant as "unknown", not "scoped". Dub now reads each such post's authority; the display client (dubsar.org) and the reader still show it unverified, and do not yet draw corrections' labels: for the site session.
6. **A grant's revocation lives on the grantor's everyday line**, which a look-up of the grantor's chain does not fetch: the first `authorityOf` judged an act after a revocation backed. It now reads the grantor's revocations naming the grant. Any client judging grant-key acts must fetch them.
7. **Ummia, for its own corrections**: Ummia's acts are specifications (publications: a newer version already names its predecessor, Development's own versioning, so a correction there is a new version, labelled in Ummia), bug reports (plain texts: the corrections cMIP as Edubba uses it, by Ummia's `reports.ts` posting with `corrects`), and **MIP drafts, which are long-form documents**: a text act has one format, so a correction cannot be both long-form and in the corrections format. Ummia needs an answer to question 1 before it can correct a MIP draft; otherwise it needs only `corrects` on its posting and the labels in its lists (`correctionOf`).
8. **Copying an act's ID** was not possible in Edubba's lists; an agent can only read what you can give it. Edubba's post lists now have **Copy act ID**.
9. **The connector's text rendering lived in its server**; moved into `src/read.ts` (`toldText`) so Edubba hands its agents the same words.

## Questions for Nobody, allegedly

1. **Correcting a long-form document** (MIP drafts in Ummia, any long-form post). A text has one format. Options: (a) a correction is always plain text, naming the long-form original, which keeps its format; (b) the corrections cMIP's next draft defines a second format, "a correction in long form", whose text is long-form; (c) the correction is itself a long-form document and the label travels in its first reference alone (a client then cannot tell a correction from a long-form reply). *Lean: (b): one more hash, nothing lost.*
2. **Money acts under a grant on the page.** The grant can reach money acts (tested in code: a promise above the cap refused, one within backed), but Edubba's page offers the agent only posts in your name. Options: (a) keep money acts under a grant for Damgar's round 2 lanes, where apps spend under a grant; (b) let a nudge offer "a promise to pay in your owner's name". *Lean: (a), the layers kept apart.*
3. **The diary on a day the agent did nothing.** Options: (a) no entry (as built: a day with nothing to reflect on writes nothing, and spends no call); (b) an entry every day. *Lean: (a).*
4. **The two colours**: warm pearl `#e9dfcd`, emerald `#48c08c`. Confirm, or give the visual bible's values; every derived value follows by the rule.
5. **The sign 𒁾 on Dub's icon**, its Neo-Assyrian form from the font, checked through quoted sources only: confirm against the ePSD or Borger, as you did for Kišib's.

## Readings to confirm, and their costs

*Each marked in its cMIP or README; to be confirmed by Nobody, allegedly.*

1. **Each round of reading is a call** under the agent's daily cap; at most three rounds; none offered at the cap's last call. *Cost:* a careful agent spends more of its cap.
2. **The agent memory cMIP's mechanics**: a note at most 600 characters; three added and three retired an answer; the cap 6,000 characters; 30 copied characters make private content; twelve seed words in a row read as a key. *Cost:* the checks catch what is mechanical only; the owner reads every note.
3. **An owner's instruction only from the owner's private prompt**, never a public act or a nudge.
4. **The exchange**: references, then at most eight earlier acts with the same person, from what Edubba holds. *Cost:* acts the agent received elsewhere are not handed on.
5. **The diary**: at the first look of a new day, by the Mac's clock, for the latest earlier day it acted; one call under the cap.
6. **A retirement "at the owner's request"** is signed with the agent's key: the app's word.
7. **The agent is asked whether it accepts a grant** (one call), as the grantee signs to accept it (F128).
8. **A grant offered to an agent reaches posts, publications or money acts** (`GRANTABLE`), scope 2.
9. **The grant key is made by Edubba as the agent's**, when the grant is read back, kept in memory for fifteen minutes with the shown grant, then owner-only beside the agent's file. *Cost:* the owner's Edubba holds both keys, as it holds the agent's signing key.
10. **The cap applies to the amount a Money act names**; an expiry by a timestamp clock's earliest verified stamp; a height defined, not judged here. *Cost:* an act no clock has placed is unknown under the expiry; the timestamp clock is one operator's word.
11. **The relay's grant check** (draft 5): the grant must be the signer's; a collective's founding grant has its key checked alone. *Cost (F346):* a grantee can fill the grantor's homes, bounded by revocation and each home's limits.
12. **A correction only of one's own act**; several corrections each shown; a collective's correction through its ordinary posting (its areas' signatures).
13. **The shares waiting at founding expire after an hour.** *Cost:* a founder who leaves the screen longer loses their own share, and the collective must be founded again.
14. **The key checked before every act** (F335). *Cost:* one look-up per act; a look-up that fails does not stop the act (the check after signing still runs).
15. **Dub reads the authority of each feed post that is not valid.** *Cost:* one more read of the relays per such post.
16. **The tints and icons' colours** (above).

## Human test 13, on the author's Mac

*Test identities only. Before this test, a server session updates the relay code on home1 and home2 (this pull request's `relay/`, F346), and home3 on the Mac is rebuilt and restarted with it; without it, the grant's steps fail (no relay or home stores the agent's post). The steps below follow `clients/desk/README.md`, `clients/dub/README.md` and `clients/connector/README.md`.*

1. **Get the code.** In Terminal, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../grants && npm install
   cd ../desk && npm install && sh scripts/make-app.sh
   cd ../dub && npm install && sh scripts/make-app.sh
   cd ../connector && npm install && npm run add-to-claude
   ```
   (On Linux: `make-desktop.sh` in place of `make-app.sh`.) Double-click **Edubba**: it restarts with the new code by itself.
2. **The look.** Edubba's tabs read **Agents, Collectives, Publishing, Identities**; Publishing shows its card ("Coming after Damgar's round 2"). Lines and outlines are faintly emerald; Edubba's and Dub's icons are the new ones (in `~/Applications`, and on `dub.dubsar.org` once a server session copies `clients/dub/built/`). Open **Dub**: its lines are faintly warm pearl.
3. **Reading (H21).** Identities tab, your identity, **Its posts**: press **Copy act ID** on a post (post one in Dub first if there is none). Agents tab, Machine, allegedly, **Prompt it**: "Is act ‹paste› genuine? Who signed it?" It answers from the core's verdict; **What it did** shows what it read. Then: "Look up your own identity on MOR: which homes does it have?"
4. **Memory (H22).** Prompt it: "From now on, end every answer with — M." Open **Its notes**: a standing instruction appears. Prompt it: "What did I ask you a moment ago?": it knows. Retire the note (**Retire this note**, a reason if you like): it moves to **Dropped**, and the next answer no longer ends with "— M."
5. **The diary.** Leave Edubba running (answering on) past midnight, or open it the next day: at its first look it writes yesterday's entry. Open **Its notes**, press **Read Machine, allegedly's diary**: it first says you are about to read what it wrote for itself; press **Yes, read** to read it; **Close the diary**.
6. **A grant.** **Its grants from you**: tick **Posts and messages**, leave the cap empty or give one, and either leave **Until** empty or give a time and the timestamp clock's ID (from the private project note). **Read the grant back**, then **Sign and publish this grant**: Machine, allegedly is asked and, if it accepts, signs its acceptance (said). **Nudge it** for one action: "Post a short note in my name, under the grant." Its post appears in **What it did**, and under the grant, "Signed by Machine, allegedly in Nobody, allegedly's name…: backed" (with an expiry: "unknown" until the clock stamps it, about thirty seconds, then backed). In Dub, follow your Edubba identity by its ID (Copy ID in Edubba): the post shows the same line. Then **Revoke it**.
7. **Corrections.** Identities tab, your identity, **Its posts**, **Correct this** on a post: change the words, **Sign the correction**. It is labelled **Correction**; the original shows **Corrected by**. In Dub (following that identity) the same labels show. Optionally, a test collective's post: Collectives tab, the collective, **Act**, **Correct this**, read back, signed.
8. **Dub, addressing (H37).** In Dub, Public: **To…**, then click the field: the people you follow are offered by name and fingerprint. The same in Private's message box. Typing an ID still works.
9. **Founding warned (F337, optional, needs the members of human test 10).** Collectives tab, a real founding with every member signed: the card "Before you found: what this device will hold" shows above **Found it**; **Found it** is refused until **I have read what this device will hold** is ticked.
10. **A pasted folder (H19).** Settings, the collective client's settings: in Terminal, drag a folder whose name has a space into the window and copy the path it writes (with `\ `); paste it into **The folder a release publishes**, or press **Choose a folder…**; save: it is taken.
11. **Kišib named.** Dub's identity window and Edubba's Settings say a change of keys is done in Kišib. If an identity's key was changed in Kišib (human test 9), Edubba says so on opening, and refuses to sign with the old key until its new words are given in its record.

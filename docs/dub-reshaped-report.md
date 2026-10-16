# Dub reshaped: report

*16 October 2026, afternoon (roadmap, "16 October 2026, afternoon"; F332 and its amendment; the human tests H3, H7 to H10). A GitHub session: test identities only; nothing touched the servers. Branch `claude/dub-reshaped-sb606d` (the session's designated branch; the brief named `claude/dub-reshaped`), one pull request, not merged: the project lead merges.*

## In plain words

Dub is no longer "for one person alone". It opens on an **identity window**: make an identity, bring one, switch between those held, give yourself a display name, see the words that carry an identity elsewhere. Only once an identity is there does the app open, on two tabs. **Public**: one box to write in (a picture, and **To…** to address it), and the feed of your own posts and those you follow, each with a quiet row: reply, follow, mute. **To you** filters what answers you or is addressed to you, with a count on the tab. **Private**: your inbox, and a box to write to one identity, sealed so only it can open it, with a count on the tab. No likes, no zaps, no notification hub, no money, no rotation.

When Dub makes an identity it shows **the chain key's 24 words, once**, and keeps nothing of the chain key, on the Mac as on the web (your answer, F332 amended). The words disappear before Dub asks for three of them back (H3). From then on, the only words Dub ever shows are **the signing key's**, labelled as such: they carry the identity into another app, its encryption key with it, so its private messages open there too. The cost, plainly: **whoever holds the signing key's words can post as you and read your private messages; and paper chain-key words lost mean no change of keys, ever.**

Three documents above the core were drafted first: the **naming cMIP**, the **people cMIP**, and the **identity carry Module's draft 2**.

## What was built

### Above the core (drafted first, each its own document)

1. **The naming cMIP, draft 1** (`cmips/cmip-naming-draft-1.md`). A display name: the Identity name act (type 4) naming this cMIP by hash. Free text, one line, at most 48 characters, canonical, no control or direction-override character. Not unique; always beside the fingerprint, never instead of it, never used to find anyone (client conformance). A rename publishes the new name and withdraws the old (type 5). Where several count, every one is shown, in act id order. Code: `clients/dub/src/names.ts`.
2. **The people cMIP, draft 1** (`cmips/cmip-people-draft-1.md`). Follow and mute, both kept in the app. The follow list is **private by default** (F59: an option with a forced default; the other option, **published**) and, by choice, a versioned public act (type 0) carrying IDs only. Back to private publishes one empty "withdrawn" version, then nothing. **The names given to the followed stay in the app, always.** Muting is never published, never told. Code: `clients/dub/src/people.ts`.
3. **The identity carry Module, draft 2** (`modules/module-identity-carry-words-draft-2.md`; draft 1 kept beside it). The words carry the **encryption key** with the signing key: its X-Wing secret is derived from the signing seed (`tagged_hash("MOR/module/carry/encryption", signing seed)`), so the same 24 words carry both. Draft 2 also says three things. Words are hidden before three are asked back (H3). The signing key's words and the chain key's are always labelled. And after a rotation made elsewhere, an app takes the new words, and renews the encryption key if it published the last version. Code: `modules/carry/src/carry.ts`, `modules/airgap/src/carry.rs`, with new vectors in `modules/airgap/vectors/carry.json` (Rust and TypeScript agree).

### Dub (`clients/dub`), on the Mac and as the web client

- **The identity window** (`src/page/view.ts`, `identityWindow`): make, bring, the list of identities held and **Use this one**, **Forget it here**, the display name, **Show the signing key's words**, this app's line (folded away), and, on the Mac, the paired browsers.
- **Making an identity, one way on both** (F332 amended). The chain key comes from a seed shown once as the words seed Module's 24 words (key 0, scheme 3) and is kept nowhere: not in the Mac's folder, not in the browser's storage. While three words wait to be typed back, the seed is in memory only. Then the genesis goes out, and routes naming the relays as **outbox and inbox**, and **the encryption key its signing key's words carry**, as the desk's identities get theirs at once.
- **H3 fixed**: the words screen asks nothing; **I have written them down** removes them from the page; only then are three asked.
- **Public tab**: posting (text, a JPEG stripped as before, optionally **To** an identity); the feed (the site's feed code, `readFeed`, of the identity and those it follows, muted ones left out, in signed order); **Reply** on every post (the reply names the post with its signer, is addressed to it, and is left in its inbox); **Follow** / **Following** and **Mute** on every post of another; **To you** as a filter with a count on the tab and on the filter; following by ID with a name of one's own, unfollowing, renaming, unmuting and the follow list's option, folded under **Following**; a long-form document shown as its title and a link to the reader; withdraw a picture of one's own.
- **Private tab**: messages sealed to one identity's current encryption key (F293), left in its inbox; the inbox read once and kept, each container opened with the identity's encryption keys, its sender judged through its chain; sent messages kept in the app; **Reply**, **Follow**, **Mute** on what came; a count on the tab.
- **A key changed elsewhere**: on opening and before every act, Dub looks the identity up. Once a rotation made elsewhere counts, it says so in plain words, points to MOR Safety, signs nothing, and takes **the new signing key's words** (`renew`), starting a new line.
- **Several identities**, one in use. The Mac's folder now keeps each under `identities/ID/`, and the browser's storage under `identity:ID`; a folder or storage from before is moved there when first read.
- **The look**: one column, `#06080c`, Inter in light weights, colour only for a layer at low saturation (grey-blue fingerprints, grey-violet "sealed"), red only for a void or contested act or a key changed elsewhere, no glow, no shadow; after Damus and Snort, studied for layout and feel, no code copied.
- **One list of operations** (`src/ops.ts`) for the Mac program and the web client; the page's shapes in `src/shapes.ts`.
- Two small additions to shared code, both backward-compatible:
  - The genesis client's `publishEncryptionKey` takes an optional secret.
  - The barebone client's `post` takes optional `refs`, the acts a reply answers.
- **The web client's release** in `built/` is rebuilt; its WebAssembly is unchanged.

## The question asked, and the answer

**The words shown at creation** (the two Dubs differed). Proposed: one way, the web client's; reason: a chain key kept in the Mac's folder is lost with the Mac. **Answer (Nobody, allegedly, F332 amended):** the chain key's words once at creation, labelled, nothing of the chain key kept; afterwards only the signing key's words, labelled; **no rotation in Dub**, which goes to a separate app, **MOR Safety**, later; Dub, when its key is no longer current, says so, points to MOR Safety, and takes the new signing words. Built so.

**Rotation in the app**, which the brief asked for, was dropped by that answer. What rotation will need, for the record:
- **On the Mac and on the web, Dub needs nothing more for rotation itself:** it holds no chain key. It shows its line (latest act, position, running summary, under "This app's line"), which MOR Safety must keep (Identity rule 35). It sends its private acts, locked, to the identity's homes, so the line stays readable there. And when the new words come, it takes them and renews the encryption key it published.
- **MOR Safety will need** the chain key's paper words (key 0 of the words seed Module for the first rotation, key 1 after, and so on). It will also need every line read from the homes and relays before signing (rule 35), the genesis client's `planRotation` already does that, and the new signing key's words shown to carry back to Dub. For the test, the genesis client's code stood in for it (`test/dub.test.ts`, the chain key derived from the paper words).

**The core texts.** Nothing this work touched turned out wrong or unclear in a MIR, so nothing was stopped and asked. One slip in a development-layer text was corrected: carry draft 1 called names versioned. Two points are worth knowing, neither a flaw:
- The Identity MIR lets several names of one identity count at once ("Which value counts", 4). The naming cMIP shows them all.
- The Text MIR's `refs` means "responds to or mentions", and `to` marks whom a text answers. Dub reads any post of another naming one of yours as answering it (reading 8).

## Readings taken

Development-layer mechanics, taken by this session under the working practice (13 October 2026), each marked in its document as "(mechanic, this draft's)":

- **Naming cMIP:** the withdrawal's `objects` entry `[name, name]`; the form (one line, 48 characters, canonical, no control or direction character); all counting names shown in act id order.
- **People cMIP:** the follow list's payload and its version chain, read as the routes are, a fork shown; back to private as one empty withdrawn version; muting hiding a followed identity without unfollowing it.
- **Carry Module draft 2:** the encryption key **derived** from the signing seed, rather than written as a second set of 24 words. Derived, a person keeps one sheet, and a rotation renews both keys. Written beside, it would carry any identity's key, but doubles the paper, and a thief who once held both sheets would read the identity's messages for good. Its renewal is by the app that published the last version.

Dub's readings (thirteen, in `clients/dub/README.md`, "Readings"), to be confirmed. The ones that touch presentation:
- The feed is in **signed order** (the site's), said on the page.
- "To you" is the **inbox's**, plus the feed's posts that answer you.
- Private messages are listed in the order **this app found or sent them**, its own time, said.
- A long-form document links to `https://reader.dubsar.org/#ACT` (or the reader `dub.json` names).
- An identity made on the Mac **before** this change keeps the chain key in its folder, unused and said, never deleted. Deleting a person's key quietly was not the convenient path to take; MOR Safety can take it from there.

## Stated costs

- **Lost paper means no rotation.** The chain key lives only on the paper the identity was born with; Dub never holds it. (F332, amended.)
- **The signing key's words are the signing key and the encryption key.** Whoever holds them posts as the identity and reads its private messages, those already received included, until a rotation and the encryption key's renewal. A rotation does not take back what was read. Messages sealed between a rotation and the renewal go to the old key.
- **An identity whose encryption key was not made from its words** (made by the desk or the genesis client) is carried without it. Dub says so, and never publishes a key of its own in its place.
- **Display names prove nothing.** Anyone can take any name. The fingerprint beside it is the only defence. A withdrawn name stays readable as an act.
- **A published follow list is public for good.** Going private again stops new versions; it does not take back old ones. Two apps publishing one identity's list fork it (shown).
- **A private follow list lives in one app.** It is not carried by the words: another app starts empty.
- **Muting is local.** The muted identity's acts still reach the relays and the inbox; Dub only stops showing them.
- **"To you" finds what reached the inbox, or the feed.** A reply by someone not followed that was never delivered to the inbox is not found. Silence proves nothing.
- **Signed order is not a time.** Between posts no signed link orders, the order is the site's order of finding (website cMIP draft 6).
- **One look-up before every act, and one when the app opens,** to see whether the key still counts.
- **Inter is not bundled.** The page names Inter, falling back to the system font where Inter is not installed, as on most Macs. Bundling it would add a font file to the web client's release and a `font-src` to its content security policy (the Caddy lines too). Left for the author's word.

## Tests

All run here, all passing:

| Package | Tests |
| --- | --- |
| `clients/dub`, Node | `dub.test.ts`, 14 tests; `names.test.ts`, 2; `people.test.ts`, 1; `launcher`, `chainwords` and `web-build` tests, as before |
| `clients/dub`, headless Chromium | `browser.test.ts` (every screen of the Mac page, by clicks) and `web.test.ts`, 2 tests (the web client, its storage read whole) |
| Shared code | `npm run test:build` (the web client's release, byte for byte); `modules/carry` (7, with the new vectors); `cargo test -p mor-airgap`; the genesis client, the barebone client, the site, the desk and the reader, unchanged and passing |

The screenshots of every screen (`MOR_SCREENSHOTS`) were sent to Nobody, allegedly, for "more like this, less like that". His answer: "Boxes and separations are hard to see. Make the boxes a lil bit brighter… separation needs to be clearer." Adjusted in the same run: brighter lines and boxes, every post, message and the writing box in its own outlined card, a thin line above each action row; the tests rerun and new screenshots sent.

## What is left

- **MOR Safety**, the rotation app (F332 amended): its own session. Its first job is to rotate from the chain key's paper words, keep every line, and give the new signing words to carry to Dub.
- **The desk** still sends private messages without putting the locked act at the sender's homes. Its line may then not be fully readable by MOR Safety (rule 35). It is a fix for the desk's cleanup session, the next app after Dub.
- **The desk's and the genesis client's identities** draw their encryption key at random, so they cannot be carried with it. Making theirs from their signing words, as Dub now does, belongs to their cleanup sessions.
- **The other apps' cleanup** (the desk, the collective client, the site), as the roadmap says, and **the remaining human tests** on the cleaned apps, between the two Dubs (H7, H8).
- **Deploying the web client's new release** at `dub.dubsar.org` (a machine session; the Caddy lines are unchanged unless Inter is bundled).
- **Approval** of the three documents above the core, and confirmation of Dub's readings.

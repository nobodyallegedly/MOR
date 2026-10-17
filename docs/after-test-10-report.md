# After human test 10: Dub and Edubba made easier to use

*17 October 2026 (`docs/state-of-mor.md`, open item 1; H19, H23, H25 to H34 in `docs/human-tests-v1-findings.md`). A GitHub session: test identities only; nothing touched the servers. Branch `claude/after-test-10`, one pull request, not merged.*

## In plain words

What the author met in human test 10, and what changed:

- **Icons (H25).** Dub has its own icon, a clay tablet; Edubba has its own, a house whose roof and walls are tablets. Both on the visual bible's dark, the clay in a low-saturation brown like the site's tablet, no glow. On the Mac they are in the apps `make-app.sh` makes; on Linux in the desktop entries `make-desktop.sh` writes. Shown to Nobody, allegedly, during the session.
- **Switching identity in Dub (H28).** **Switch identity** leaves the identity in use first (its keys stay), then the identity window lists those held, to choose one, and the two doors, make or bring, folded.
- **A Relay view in Dub (H29).** Beside **To you**, a **Relay** filter: every public act at the identity's relays, newest first, posts of anyone (with Reply, Follow, Mute) and every other public act named by what it is. Chosen, never the default.
- **Following by ID, with a name (H29).** Already there under **Following**, besides **Follow** on any post; kept.
- **Whom you follow, sealed to yourself (H29; people cMIP draft 2).** The follow list, with the names you gave, is a private act sealed to your own identity and kept at its homes. Any app holding the identity by its signing key's words reads it: Dub on the Mac, Dub on the web, Edubba. Private is the default; publishing the IDs is the other option. Dub moved its list there, carrying over what it held.
- **A reload keeps the tab; a share looked for (H30).** Dub on the web (and on the Mac) comes back to the tab you were on. Where a share is awaited, a plain **Look for my share** button; and while the Signing tab is open, Dub looks by itself.
- **Test or real, said (H27).** Edubba's buttons now read **+ Found a real collective: members on their own devices** and **+ Found a test collective: everyone held here, for trying alone**, each with a sentence beside it saying what it means.
- **Answers looked for by themselves (H32).** While a proposal waits, Edubba looks for the answers every 20 seconds, and on opening; the button stays.
- **A folder picker, and paths read as the Terminal writes them (H19, H23, H31).** **Choose a folder…** browses the Mac's folders from the program (a page cannot open the Mac's own dialog), names shown as they are (“testrelease ”, *with a space at the end*). A path pasted from the Terminal has its “\ ” read as a space and its quotes taken off. Where no folder is found, a near match is named: “Did you mean ‘testrelease ’ (with a space at the end)?”. Where macOS refuses access, it is said plainly, with how to allow it.
- **“Acting as” and signing as a member in Edubba (H33).** The Collectives tab says which of Edubba's identities it acts as, with a switch among them, and has a **To sign, as …** entry: Edubba signs as a member, as Dub's Signing tab does, for any identity it holds. It is Dub's own code, so the reading, the answer, the one-time key and the share shown once are the same in both apps.
- **Edubba's contacts from the sealed follow lists.** The follow list sealed to each identity Edubba holds joins its contacts, with the names given in Dub.
- **Folds (H26, H34).** Where a screen gets crowded, it folds, and each fold is remembered as you left it. The list is below.

## Where folds were added, and why (H26, H34)

*Edubba remembers folds in its program (`book.json`, `unfolded`, by the fold's name), as H14 did; Dub in the page's own storage (`dub:folds`: which fold is open, nothing else), since its web client has no program.*

| App, screen | Fold | Default | Why |
| --- | --- | --- | --- |
| Edubba, Agents, an agent | Its terms; its queue; nudge it; its drafts from Claude | open | The page is seven cards long; each can be put away once read. |
| | Its cap and its key | **folded** | Set once, seldom touched. |
| | What it did | folded (as before) | A long history. |
| Edubba, Identities, an identity (H26) | Its record; a release under its own name; drafts from Claude; what it received | open | As the Agents tab: the setup page grew to six sections. |
| | Rely on an act | **folded** | Rarely used; opened by itself when “Rely on this act…” is pressed beside a received item. |
| | What you answered for it | folded (as before) | A long history. |
| Edubba, Collectives, a real collective | Its members; a release | open | |
| | Change its members | **folded** | A long form, used rarely; its review is the same as before. |
| | What you may do for it | open (H14, unchanged) | |
| Dub, identity window | Make a new identity; Bring an identity you have | **folded**, once identities are held | After leaving an identity (H28), the window is mostly for choosing one. |
| | This app's line, and where it lives | folded (as before), now remembered | |
| Dub, Public | Following | folded (as before), now remembered | |
| Dub, Signing | A proposal's reading, once answered (signed or declined) | **folded** | Answered proposals are long; before answering, the reading is always shown in full, never folded. |

## Questions asked, and readings taken

The decisions already taken (H29: the follow list sealed to oneself, private by default; H33: acting as, and signing as a member) settled what a person signs and keeps for most of this work. Readings taken where they left a choice (the first asked and decided; the others to confirm):

1. **Signing as a member is always on in Edubba**, labelled *even more experimental*, in its own entry of the Collectives tab, where Dub's Signing tab is off by default (F59). Reason: Dub is first for talking, and its Signing tab was decided as “an optional tab only available via settings”; Edubba's Collectives tab is where collectives are made. Asked, as the one reading that changes a default; **decided by Nobody, allegedly: "Yes, on by default, the collective tab exists for this kind of business."**
2. **Muting stays in the app**, not in the sealed list: the decision named the follow list. The cMIP says a later draft may carry mutes.
3. **The sealed list is written at each change** (one private act each), and **read when the feed is read** (at most once a minute, at once with **Look again**). A list Dub kept in the app before is carried over once, nothing removed (the session's instruction: “Dub moves its list there, carrying over what it holds”).
4. **Sealed to the encryption key the identity's homes serve, only where this app holds it**: otherwise the list stays in the app, said.
5. **Left at the identity's homes, not its inbox relays**, its locked act there too, so a change of its keys keeps the line (Identity rule 35).
6. **A fork** (two apps changing the list at once) takes the branch reaching the highest version, then the smaller act id, and says the list was forked.
7. **One published chain across drafts**: draft 1's published versions are continued by draft 2's.
8. **The relay view's order** is each relay's arrival order, said as not a time.
9. **A folder's path** is tried without the spaces at its end, then as typed; a near match is named, never taken without the person choosing it.

## What was built, precisely

| Where | What |
| --- | --- |
| `cmips/cmip-people-draft-2.md` | Draft 2: the sealed follow list (type 1: version, previous, `[ID, name?]` pairs), sealed to the identity's own encryption key, at its homes; reading, forks, carry-over; the published list (type 0) unchanged, one chain with draft 1's; costs. Draft 1 kept. `cmips/README.md` updated. |
| `clients/dub/src/people.ts` | `PEOPLE_SPEC` (draft 2's test hash), `SEALED_LIST`, `sealedListPayload`, `readSealedList`; `readFollowList` reading draft 1's and draft 2's type 0 acts as one chain. |
| `clients/dub/src/dub.ts` | `syncFollows` (read, carry over, change, seal and leave at the homes), `refreshFollows` (on reading the feed); `leave` (H28); `relay` and `whatAct` (H29). |
| `clients/dub/src/page/` | The identity window's switch; the Relay filter; the sealed list's words under Following; **Look for my share** and the automatic look; the tab kept across a reload; folds remembered. |
| `clients/dub/static/icon/`, `clients/desk/static/icon/`, `clients/dub/scripts/make-icons.ts` | The icons, drawn as SVG; PNG and icns rendered by Chromium, kept in the repository. `make-app.sh` and `make-desktop.sh` of both apps use them. |
| `clients/desk/src/member.ts` | Signing as a member: Dub's code over Edubba's folder (`MemberKeep`), “acting as”. |
| `clients/desk/src/folders.ts` | Paths read as the Terminal writes them, near matches, the refusal said, the picker's listing. |
| `clients/desk/src/real.ts` | Contacts from the sealed follow lists (`readLists`); the test and real words. |
| `clients/desk/src/page/`, `server.ts`, `desk.ts` | Acting as, To sign, the picker, answers looked for by themselves, folds by name. Edubba no longer lists an identity's own acts sealed to itself as received. |
| `clients/barebone/src/post.ts` | `Judge` exported, so the relay view judges its posts together. |

## Costs, stated

- **The sealed follow list:** the homes and relays see that a private act exists and roughly how big it is, and when it changes; whoever holds the signing key's words reads it, names included; one act per change in the identity's line. *Ways to say less are in the roadmap, “Private acts that say less”.*
- **Two apps changing the list at the same moment** fork it; the change on the branch not taken is not merged, and the fork is said.
- **The relay view** reads each relay whole the first time (up to its latest 300 acts kept in memory), then only what is new; on a busy relay the first look is slow.
- **Answers looked for by themselves** cost one read of the founder's inbox per waiting proposal every 20 seconds while Edubba's page is in view.
- **A one-time key's secret for a member held in Edubba** is in its folder from signing until the share is written down, as in Dub on the Mac.

## Tests

- **Dub** (`clients/dub`): `people.test.ts` (the sealed list at the protocol level: its own key only, names inside, never in the clear, another's list not taken, a fork; one published chain across drafts); `dub.test.ts` (the sealed list across two Dubs holding the identity, carry-over, leaving, the relay view); `browser.test.ts` (the Relay filter, a reload keeping the tab and the fold, Switch identity); `web.test.ts` (the list sealed on the Mac read in the web client with its names); `desktop.test.ts` (the icons in the Linux entry and the Mac app).
- **Edubba** (`clients/desk`): `folders.test.ts` (new); `real.test.ts` (acting as, signing as a member, the share kept nowhere, contacts from a sealed list); `real-browser.test.ts` (test and real said, acting as, answers found without a click, Dub's Look for my share and its tab kept, Edubba signing as a member by clicks, contacts from a sealed list); `edubba-setup-browser.test.ts` (folds remembered, the near match, a Terminal path, a quoted path, the picker); `edubba-browser.test.ts` (the cap folded at first); `desktop.test.ts` (icons).
- Every existing test passes; the results and the GitHub run are in the pull request.

Screenshots of every changed screen were sent in the session.

## After the merge

- **Dub's web client changed**: its release must be rebuilt (a merge message containing `[release dub web]`, or the workflow by hand), then copied to the server in a server session. Until then `dub.dubsar.org` has none of this.
- **On the Mac and Linux**, run `sh scripts/make-app.sh` (or `make-desktop.sh`) again in `clients/dub` and `clients/desk` for the icons.
- The homes and relays need nothing new: a sealed container addressed to an identity its home serves is a kind they already take.
- `docs/state-of-mor.md` is the project lead's to update at the merge.

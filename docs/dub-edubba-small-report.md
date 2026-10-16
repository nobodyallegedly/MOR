# The small session for Dub and Edubba: report

*16 October 2026, night (`docs/state-of-mor.md`, open item 1). A GitHub session: test identities only; nothing touched the servers. Branch `claude/dub-edubba-small`, one pull request, not merged.*

## In plain words

- **Dub (H12).** The form that makes an identity has a display name field, optional. A name that the naming cMIP refuses (a line break, a direction override, too long) is refused before anything is made. Given, it is published right after the identity is born, and shown beside the fingerprint, as before.
- **Edubba, Collectives (H14).** "What you may do for it" folds and unfolds with a click; the program remembers the choice for each collective, so a reload, or another paired browser, finds it as it was left.
- **Edubba, bringing (H15).** On the Identities tab, **+ A new identity** opens two doors: make a new one, or **bring one you have** by its ID and its signing key's words, exactly as Dub does (the same code, now shared). Nothing is signed or published by bringing it. On the Collectives tab, **+ Bring an existing collective** takes its ID, reads it from its homes and relays, and keeps it only if one of your identities is among the parties of its agreement in force. Edubba holds none of its keys: it shows what its agreement says, its constitution and its posts, and signs nothing for it.
- **Edubba, the Identities tab as the identity setup page (F333).** For the identity selected: **its record** in plain words (where it came from, its homes, its routes, its keys, its display names, and every line of its acts with the latest act, position and summary MOR Safety will need); **Rely on an act**, until now command line only, read back in plain words and signed only once RELY is typed, as the genesis client asks; **a release under its own name**; and the drafts from Claude and what it received, as before.
- **Edubba, releases (H16).** A release under one's own name is on the Identities tab now, as an action of the identity selected; collective releases stay under Constitution. The folder is chosen at each release: a git folder gives the files git tracks; a plain folder gives every file but hidden ones. Every file is listed with its size and fingerprint, and the libraries it depends on, before anything is signed.
- **Both apps on Linux.** `sh scripts/make-desktop.sh` in `clients/dub` or `clients/desk` puts **Dub** or **Edubba** in the applications menu (and on the desktop, if there is one), as `make-app.sh` makes the Mac's app: it starts the program and opens its page, paired. A test runs the script and the launcher on GitHub's Linux machines.

## The question asked, and its answer

One question changed what a person signs, and was asked before building:

- **Which release does a new release name as the one before it** (the manifest's "previous" field), now that one identity may release several folders? Today it was simply the identity's last release, so a library's release would have named a website's. Nobody, allegedly: "chosen by hand from previous publications and if none selected treated as a new one". On the project lead's addition: **"Yes, pre-set by name"**. Built so: the list of this identity's releases here, pre-set to the last one of the same name (the folder's name by default), or "None: a new release line"; the review says which release it follows and what changed since, so a wrong choice shows before anything is signed.

## What was built, precisely

| Where | What |
| --- | --- |
| `clients/dub/src/dub.ts`, `ops.ts`, `page/` | `begin` takes an optional `name`, checked at once (`readName`) and kept with the waiting identity in memory; `confirm` publishes it after the genesis, routes and encryption key (`publishName`, the code `setName` now shares). A failure to publish the name does not undo the birth: it is said, and the name can be given again in the identity window. |
| `clients/dub/src/carryin.ts` | The steps of bringing an identity by its words, taken out of `dub.ts` unchanged, so Edubba uses the same checks. |
| `clients/desk/src/setup.ts` | The Identities tab: `record`, `bring`, `readAct` and `witness` (RELY), `filesOf`, `suggest`, `prepareRelease`, `confirmRelease`. |
| `clients/desk/src/collectives.ts` | `bring` and a reading of a collective from its relays and homes alone, with no key: its chain, the agreement it declares (fetched when Agreements name it as missing), its parties' acts, Agreements' agreement in force. Permissions, constitution and posts for a brought collective. |
| `clients/desk/src/store.ts`, `desk.ts`, `server.ts`, `page/` | The book keeps, per identity, made or brought, the acts its homes held when brought, and its releases; brought collectives; the fold per collective. New operations: `record`, `bring`, `read act`, `release folder/prepare/confirm/cancel`, `fold`, `collective bring`; `witness` now needs `typed: "RELY"`. The page's forms read their own `id` attribute (a field named "id" shadows `form.id`, as Dub's code already said). |
| `clients/dub/scripts/make-desktop.sh`, `clients/desk/scripts/make-desktop.sh` | A launcher in `~/.local/share/mor/`, a `.desktop` entry in `~/.local/share/applications/`, a copy on the desktop where there is one (marked trusted with `gio` where available). |

**The GitHub tests on Linux.** `.github/workflows/test.yml` already runs every test on `ubuntu-latest`, Dub's and Edubba's included; it now also runs the two desktop tests there. Nothing in the workflow needed to change.

## Readings taken (to confirm by Nobody, allegedly)

In the READMEs: Edubba's readings 12 to 16 (`clients/desk/README.md`).

1. **An act Edubba cannot read is not relied on.** The genesis client signs a witness act for any id; Edubba first finds and reads it back, and refuses otherwise. *Cost:* an act published only elsewhere needs that relay in Settings first.
2. **A received item's "Rely on this act…"** now opens the same reading and asks for RELY too: one way to sign a witness act in Edubba, not two.
3. **A brought identity publishes nothing on arrival** (as Dub). Where its words do not carry its encryption key, its private messages do not open here, said.
4. **A brought identity's warning of a stolen key (F152).** Without care, every act the app it came from had made raised "the signing key may be stolen" forever. Edubba now notes what its homes held when it was brought; anything later is still said, worded for a brought identity ("if the app it came from made it, all is well").
5. **A brought collective is read only.** Membership is judged against the parties of its agreement in force, from your identities in Edubba or in the collective client's folder. Signing as a member on this device is H18's.
6. **A release's files:** links are not followed; a tracked file missing on disk is left out and listed; a file name the release manifest cMIP refuses blocks the review by name.

## Costs, stated

- **A release review is held in the program's memory** for fifteen minutes, as the collective client's are; every file is read again before signing and compared with its fingerprint. A very large folder is read twice.
- **A plain folder releases every file but hidden ones**, including build output and dependencies folders (`node_modules`): the list shows them all before anything is signed; nothing is left out silently.
- **The Linux entry has no icon of its own**, as the Mac's `Dub.app` and `Edubba.app` have none: the desktop shows its generic one. Like the Mac's app, it runs the code where it is, with this repository and Node 22; real installers stay for nearer the first wave.

## Not done here

- **Dub's web client release** (`clients/dub/built/`) is not rebuilt in this branch: the page changed (the name field), so the release workflow should run after the merge (a merge commit message containing `[release dub web]`, or the workflow by hand), then the server session copies `built/` as before. Until then `dub.dubsar.org` serves the page without the name field.
- `docs/state-of-mor.md` is the project lead's to update at the merge.

## Tests

Every behaviour above has a test, in Node and in headless Chromium:

- Dub: `test/dub.test.ts` (a name at creation: refused before anything is made; published after the genesis; none given, none published), `test/browser.test.ts` (the name in the form, refused then given, shown in the header, renamed later with the old one withdrawn), `test/web.test.ts` (the same on the web client), `test/desktop.test.ts`.
- Edubba: `test/setup.test.ts` and `test/edubba-setup-browser.test.ts` (everything above), `test/desktop.test.ts`; `test/desk.test.ts` and `test/browser.test.ts` updated for RELY.

Every existing test passes (results in the pull request). Screenshots of every changed screen were sent to Nobody, allegedly, in the session.

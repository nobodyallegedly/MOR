# Follow-up pass: reports from one's own identity, the mirror both ways, "implements", xtype use, F290

*GitHub session, 14 October 2026. Branch `claude/follow-up-pass-2026-10-14`, not merged. One roadmap step: the follow-ups recorded under "F285, the path to MOR 2, the first wave list, the listing and bug reports: merged" and its notes, F287, F288, F289's question 6 and F290. Test identities only; nothing published, nothing released.*

## Do the tests and implementations pass?

**Yes, everything this step built passes. One test fails, and it failed on main before this branch the same way.** `scripts/test-all.sh` stops at Dub's `test/web-build.test.ts`, "the release in built/", on main and on this branch alike. That test compares Dub's released core library with the display client's, and they have differed since the display client's release `81a34b0` (below, "Found, not fixed here"). The script stops at the first failure, so the packages after Dub were then run one by one, on main and on this branch, with the same commands.

| | main (`63ea283`) | this branch |
| --- | --- | --- |
| Rust workspace | 676 passed, 1 ignored | 676 passed, 1 ignored |
| `clients/assess`, `barebone`, `collective`, `connector`, `desk` | 51, 10, 42, 13, 30 | the same |
| `clients/dub` | 13: 12 passed, 1 failed (web-build) | **14**: 13 passed, the same 1 failed (+1, a post to an identity) |
| `clients/genesis`, `longform`, `manage`, `nudge`, `reader` | 27, 26, 7, 25, 18 | the same |
| `clients/repo` | 19 | **20** (+1, "implements") |
| `clients/reports` | 8 | **9** (+1, GitHub to MOR) |
| `clients/site` | 81 | **84** (+3: implements first, xtype use, F290) |
| `modules/jpeg`, `video`, `carry`, `timestamp` | 14, 6, 6, 5 | the same |
| **Total** | **1,077**: 1,076 passed, 1 failed | **1,083**: 1,082 passed, the same 1 failed |

The tests that changed were each run alone first, and passed: `clients/reports` 9 of 9; Dub's new test; `clients/repo` 14 of 14 in `repo.test.ts`; `clients/site` 15 of 15 in `listing.test.ts`, the phone-sized browser test included. Every package type-checks (`tsc --noEmit`).

## In plain words

**1. The report page has no writing box.** Nobody, allegedly: "Bug reports come from people truly on MOR, their own ID." `docs/dubsar.org/report.html` now shows the reporting identity's ID (the placeholder `REPORTS-IDENTITY` until step 17), and says how to report from your own identity: in Dub, or Dub on the web (for testing only), put that ID in **To an identity** and post; from any other client, send a public message to it, a text act naming it as recipient, left unsealed in its inbox. It says a report is public, copied to GitHub word for word and answered in the open, and that a sealed message is read by the reporting identity alone. Below, the reporting identity's answers, each with the public report it answers beside it. For those not on MOR, the GitHub mirror, which now runs both ways. The bullet "How to reach you… an identity made for it alone, which no answer can reach" is gone: a reporter's own identity can be answered.

**To make the page true, Dub had to learn one thing:** a post addressed to an identity. Dub (on the Mac and on the web) has a new optional field under the picture, **To an identity**: an identity's ID. The post then names that identity as its recipient and is also left, unsealed, in its inbox, with the reporter's identity chain so it can be checked there. An ID that is not 64 characters, this identity itself, an identity not found, or one with no inbox, is said, and nothing is signed.

**2. The mirror runs both ways** (F289, question 6: "If we can have it bidirectional yes please"). MOR to GitHub is as before. GitHub to MOR is new, and never automatic:

- Each run lists the GitHub issues not yet on MOR. **The dry run shows each one word for word as it would be published**: "Reported on GitHub by @" the author's GitHub name, a colon and the title; the issue's words; the issue's address as the last line.
- After reading it, the author names the ones to publish: `mor-reports --prepare 12`. The command writes a **draft** into MOR Identities' drafts folder, the same folder Claude's drafts go to. **It holds no key and signs nothing.**
- At MOR Identities the draft is read again from its own bytes and shown; the author **approves** it there (signed as the reporting identity, sent to its relays) or declines it. This is how the desk signs every draft: the reporting identity's keys stay where the author keeps them.
- The next run finds the post on MOR, tells the issue once ("Published again on MOR by the reporting identity…", with the act's ID), and takes the issue off the list. Every answer on MOR naming that post is then added to the issue as a comment, once, as answers to MOR reports already are.
- A draft waiting at the desk, approved, declined or sent back is said beside its issue and never prepared twice. A declined one stays declined until its file is removed.

**3. A release says what it implements.** The release manifest cMIP draft 3 (`cmips/cmip-release-manifest-draft-3.md`; draft 2 stays) adds field 6, **implements**: the specifications a release implements, by the act IDs of their publications, sorted, each once. It is inside the manifest, so it is signed with the release, by whoever publishes it and by every member who signs it. The repo client builds it: `mor-repo release … --implements ID` (repeatable), each ID checked first to be a specification's publication; `verify` prints it. **The listing reads it first.** A release whose manifest has field 6 is code released for exactly the specifications it names; a release without it (every release made before draft 3) is read as before, by its publication's references.

**4. The listing counts xtype use.** For each xtype it lists (a specification defining act types and filling no task), it counts the **public acts of its types** found on the relays it reads, each checked through its signer's chain, in all and by type, most used first, in a part of its own, "Xtypes, by use", after the extensions; the same count is on the xtype's card and in the bar. **Private acts are not counted**, and the page says so: which specification a private act belongs to cannot be read from outside. Website cMIP draft 10 (`cmips/cmip-website-draft-10.md`; draft 9 stays) writes both changes into rule 13c.

**5. F290 is written in.** Development draft 9 (`spec/MIR-development-draft-9.md`; draft 8 stays) adds one sentence to Part three, marked "new in draft 9 (F290)". The MICS v27 and the freeze suite v27 name it.

## Precisely

### What was built

| Where | What |
| --- | --- |
| `docs/dubsar.org/report.html` | No `mor-write`. The reporting identity's ID; "How to report, from your own identity" (Dub and Dub on the web by the field's name, any other client by what to send); public by default, the sealed message said; what a good report contains; the GitHub mirror both ways; the answers (`mor-feed`, unchanged). No script. |
| `clients/barebone/src/post.ts` | `post` takes `to` (the identities a post names as recipients) and returns the act; `leaveInInbox`, a public act left in a recipient's inbox with the signer's chain. |
| `clients/dub/src/dub.ts`, `server.ts`, `web/app.ts`, `page/ui.ts`, `page/view.ts`, `README.md` | Dub's **To an identity**: the recipient's inbox looked up before anything is signed; the post signed with `to`, published as before, and left in the inbox; each inbox relay's answer said. |
| `clients/reports/src/mirror.ts` | A re-publication recognised (the reporting identity's public text act, first line starting "Reported on GitHub by @", last line the issue's address); the issue told once (`<!-- mor-republished ID -->`); answers naming the re-publication added to its issue; the waiting list now "not yet on MOR". |
| `clients/reports/src/prepare.ts` (new) | What the drafts folder holds for each issue (with the desk's answer), and a new draft: the connector's own `postDraft` and `saveDraft`, a public post of the reporting identity, sent once signed to its route for public acts. |
| `clients/reports/src/read.ts`, `cli.ts`, `README.md` | Where the reporting identity's public acts go (`publishAt`); `--prepare N[,N…]`, `--drafts DIR` (or `"drafts"` in the settings, `MOR_DRAFTS`, `~/mor-drafts`); the dry run showing each re-publication word for word. |
| `clients/repo/src/release.ts`, `cli.ts` | Manifest field 6 (encoded sorted, decoded strictly: at least one, sorted, unique, 32 bytes each); `prepareRelease` and `publishRelease` take `implements`; `checkImplements`; `release --implements`; `verify` prints it. |
| `clients/site/src/listing.ts`, `shell/listing-view.ts`, `shell/view.ts`, `shell/app.ts` | Every release publication read (not only those with references); its manifest's field 6 first, its references only without it; `Release.by`. `Listed.use` and `Listing.xtypes`: the public acts of each xtype's types, judged, counted by type. The view: "(its manifest names it among what it implements)" or "(its publication refers to it)"; the section "Xtypes, by use" with its note on private acts; "Use: …" on an xtype's card; the bar's count. |
| `cmips/cmip-release-manifest-draft-3.md`, `cmips/cmip-website-draft-10.md`, `cmips/README.md` | Below. |
| `spec/MIR-development-draft-9.md`, `spec/02-MOR-MICS-v27.md`, `spec/03-MOR-freeze-test-suite-v27.md`, `spec/README.md` | Below. |
| `.github/workflows/test.yml` | A step for `clients/reports`, which GitHub did not run before (nor `clients/assess` and `clients/nudge`, left as they are). |

The core library, `core/`, the relays, `clients/desk` and `clients/connector` are unchanged. The display client's released copy (`clients/site/built/`) and Dub's web release (`clients/dub/built/`) are not rebuilt: that is a release, after the merge.

### The tests added

- **`clients/reports`**, 9 tests (was 8). The report now comes from a reporter's own identity, written as Dub writes it (`post` with `to`, then `leaveInInbox`); the sealed one as the reader sends one. The reporting identity is held by MOR Identities' own code (`Desk`, `Store`), as the author holds it, and every act of it in the test is signed from the desk's file. New: **GitHub to MOR**: the dry run shows the re-publication line by line (a body with Windows line ends composed to canonical text); a run naming nothing, and a dry run naming it, write no draft and send nothing to GitHub; `--prepare` writes exactly one draft, for the reporting identity, its relays the reporting identity's, its note saying it is from mor-reports, not Claude, and the desk's file signs nothing meanwhile; prepared again: refused, said as waiting at the desk; **the desk approves it** and the act reads back valid, word for word; the next run tells the issue once and takes it off the list; an answer naming the re-publication is added to the issue once; a draft **declined at the desk** is said and not prepared again; an issue number not waiting is said. The page test checks: no `mor-write`, the ID, Dub and its field, any other client, the feed, the mirror, no script.
- **`clients/dub`**, 1 test added: a post to an identity's ID (written in groups of four) left unsealed in its inbox at its own relay, naming it in `to`, readable and valid from the inbox alone; refused before signing: not an ID, this identity itself, an identity not found, one with no inbox.
- **`clients/repo`**, 1 test added, 1 extended: a release naming two specifications' publications (given unsorted, with one twice) holds them sorted, once, signs and verifies, and reads back; a release without names has no field 6; `checkImplements` refuses a release's own publication, an ID found nowhere, and a specification's content under another media spec (F290). Strict decoding: an empty list, an unsorted list, a repeated ID, a short hash.
- **`clients/site`**, 3 tests added, 3 extended (`listing.test.ts`): a release by Carol whose manifest implements the checker and whose publication refers to the rail Module is the checker's code and not the rail's; the older releases read by reference; the two xtypes' use (the first: note 2, answer 1, with one act whose signer's chain cannot be found not counted; a private act and an act of a type it does not define not counted; its successor: note 1), most used first; a cMIP filling a task has no use; F290: a specification's content under another media spec is not listed, not even as unverified. In the browser on a phone: the sections in order (extensions, xtypes, specifications), the note on private acts, the counts, "Use:" on the card, how each release names its specification, and the bar's line.

## Readings taken under the delegation (development-layer mechanics)

*Nobody, allegedly, 13 October 2026: "Don't really need to run these by me."* Each is in the code and the drafts, and easy to change.

1. **A public message to an identity** is a public text act naming it in `to`, left unsealed in its inbox, with the signer's chain carried there; published on the writer's own relays too. It is what the mirror already read as a report (bug reports doc, reading 1).
2. **Dub's field is "To an identity",** under the picture, optional, its note naming the report page. *Built because the page names Dub; a small client feature, not a protocol change.*
3. **A re-publication's words**: "Reported on GitHub by @handle: title", a blank line, the issue's words, a blank line, the issue's address. It is recognised by its first line's label and its last line, so later edits on GitHub change nothing on MOR, and an answer citing an issue's address (the earlier way) still counts.
4. **Never automatic:** the author names each issue (`--prepare N`) after the dry run, and approves each draft at the desk. A declined draft is not prepared again until its file is removed.
5. **The desk signs the mirror's drafts as it signs Claude's**: the reporting identity is held at MOR Identities and set to On. The draft's note says it comes from mor-reports, not Claude. *Question 1 below.*
6. **"Implements" by publication IDs, sorted, each once,** as asked; the repo client checks each is a specification's publication before releasing (written into the cMIP as a SHOULD). A release whose manifest has field 6 names exactly those specifications: its publication's references are then not read for "code released".
7. **An xtype, for counting,** is what the listing already calls one: act types (field 3) and no task (field 2). Each draft is counted on its own (each is its own specification). Only acts valid for their signers' chains count; the others are said, not counted. A cMIP that fills a task and also defines act types is not counted.
8. **"Xtypes, by use" sits after the extensions and before the cards**, so the two counts that track MOR 2's raw material come first.

## Stated costs, as written in the drafts

- Release manifest draft 3: **"Implements" is a claim**; **a manifest with field 6 is invalid to a draft 2 reader** (closed format, one shared test value until step 17).
- Website draft 10: **private acts are not counted** (a lower bound, never a measure); **a count of acts is of acts signed, not of worth**.

## The changed sentences

**Development draft 9** (`spec/MIR-development-draft-9.md`). Part three, before:

> A specification is a public act (Envelopes type 0, a publication) whose media is the specification's content, published and signed by its creator. The content is:

After:

> A specification is a public act (Envelopes type 0, a publication) whose media is the specification's content, published and signed by its creator. Its publication names the Development MIR's spec hash as its media spec (field 0 of the publication's media), since this MIR defines the format of that content (new in draft 9, F290). The content is:

Added to the marks under "How to read this draft": "**New in draft 9 (F290):** a sentence draft 9 writes in, filling a silence of Part three." The draft 8 mark now reads "a name draft 8 writes in" (was "this draft"). And the draft's own note at the top.

**The MICS v27** (`spec/02-MOR-MICS-v27.md`). The Development section, before:

> - **Specifications are named by the hash of their content,** wherever they are published. cMIPs and Modules name their creator inside, …

After:

> - **Specifications are named by the hash of their content,** wherever they are published. A specification is published as a public publication naming the Development MIR's spec hash as its media spec (F290). cMIPs and Modules name their creator inside, …

And the version note: version 27 naming Development draft 9; version 26's note moved to "Earlier versions", its opening now "Written for approval; version 27 names Development draft 9 beside it".

**The freeze suite v27** (`spec/03-MOR-freeze-test-suite-v27.md`). The Development line, before:

> - [ ] Specifications named by content hash; creator inside for cMIPs and Modules; MIRs without creator; a successor by another creator shown as such (8)

After:

> - [ ] Specifications named by content hash; creator inside for cMIPs and Modules; MIRs without creator; a successor by another creator shown as such; a specification's publication naming the Development MIR's spec hash as its media spec (F290) (8)

New step 8.7:

> 7. *(F290)* Two specifications are published, by two identities, each as a public publication naming the Development MIR's spec hash as its media spec; a third publication carries a specification's content under another media spec. A listing reading those relays finds the two specifications and takes the third for none; a second listing, any other, must find the same. A release names a specification in its manifest's "implements" (release manifest cMIP draft 3); a client making it refuses to name the third.

Scenario 8's "Passes if", before: "spec hashes are stable wherever published, every client computes …"; after: "spec hashes are stable wherever published, every publishing tool and listing agrees on what a specification's publication names as its media spec (F290), every client computes …". And the version note, as for the MICS. *Step 8.7 is run by one listing (the display client's) and the repo client; "a second listing" is the scenario's, for whoever writes one.*

## Question for Nobody, allegedly

1. **Area: presentation (MOR Identities, your desk).** To sign the mirror's drafts, the desk must hold the reporting identity and have it set to **On**, whose words are "Claude may prepare drafts for this identity". So On lets both Claude and the mirror prepare drafts for it; every draft is still signed only on your approval. And the desk shows the mirror's note under the heading "Claude's note to you", though the note itself says it is from mor-reports, not Claude. Options: (a) as built; (b) the desk gains a second switch, "The GitHub mirror may prepare drafts", and heads a note by who prepared the draft (a desk change, its own step); (c) as built, but the mirror writes no note, so nothing under that heading is the mirror's. *Lean: (a) until step 17, (b) with the reporting identity's making there.*

## Found, not fixed here

- **Dub's tests fail on main**, before this branch: `clients/dub/test/web-build.test.ts`, "the release in built/", compares Dub's released core library (`clients/dub/built/mor_wasm_bg.wasm`) with the display client's (`clients/site/built/mor_wasm_bg.wasm`), and they differ since the display client was released again (`81a34b0`) without a new Dub web release (`7650aaa` is the last). Here the assertion's message, comparing two large files byte by byte, grows until the test process is killed (SIGKILL), which is how it shows. The fix is a release of Dub's web client (its workflow, `[release dub web]`), which this branch's Dub change needs anyway after the merge.
- Dub's web client in `clients/dub/built/` does not have **To an identity** until that release; `https://dub.dubsar.org/`, once served, needs it before the report page's instruction works there.

## No flaw in a MIR found

F290 was a silence, now written in. Nothing in building this needed a core change.

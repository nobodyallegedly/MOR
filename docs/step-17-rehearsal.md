# The rehearsal of step 17, in a test environment

*14 October 2026. The "walkthrough of the actual release steps in test environment" Nobody, allegedly, asked for before the freeze ("The way to the freeze, and the first wave", `docs/roadmap-v1.md`). It runs roadmap step 17, "First acts and the repository on MOR", end to end on throwaway homes and a relay, with test identities only, and checks everything from outside as a stranger would. Nothing touched the real servers.*

**Run it:** `scripts/rehearse-step-17.sh`. One command, about two minutes once built; it prints the steps, the author's test seed words, a checklist and the list of what is done by hand at step 17; it leaves nothing running and nothing behind.

*15 October 2026, after the code after step 15 (`docs/code-after-step-15-part-4.md`): run again. The reader and the display client now hold the signer's sequence before judging (F298), so the first post stays verified after the rotation; the rehearsal publishes the specifications as Development draft 10 writes them and names what each release implements by spec hash. As committed, 14 of 17 checks pass (the display client's released build still predates the fix, and check 10 stands); with the display client rebuilt from the branch, 16 of 17, check 10 alone failing, by design until step 17. The record below is the run of 14 October.*

## Does it pass end to end?

**No: 14 of its 17 checks pass, and 3 fail, the same three in every run.**

Everything step 17 itself makes passes from outside: the identities are born as step 17 makes them, every first act is published in step 17's order and verifies through its signer's chain from a fresh process that knows one home's address, the display client says SAME, the listing finds every specification and release, the feed shows the first post, a stranger's report arrives. The three failures come from two real problems the rehearsal was built to find, neither in the rehearsal itself:

1. **After the author's first rotation, the site goes dark and the first acts read "void".** The rotation counts at both homes, and the first post is valid (the core library says so once it holds the author's whole sequence, check 15). But the reader and the display client judge an act without fetching the signer's sequence, so they cannot see that an act signed before the rotation lies in its kept ancestry, and the core library then answers "void" (checks 16, 17). In a browser, dubsar.org says "Failing: the site this gateway serves does not verify. Not shown." A client defect, not a MIR's: details in "What step 17 gets wrong or leaves out", 1.
2. **The first acts name test values as their formats, not the specifications step 17 publishes** (check 10). A cMIP's or Module's spec hash covers its creator, the author's identity, which exists only once step 17 begins; the clients carry test values until they are rebuilt with the real hashes. Step 17 as written has no such step: details in 2.

The final version was run three times in a row (92, 75 and 77 seconds), with the same checklist each time and nothing left running or behind; earlier versions about ten times while it was built. `scripts/test-all.sh`: everything passes except one test file of Dub's, which fails on `main` too and for a reason outside this step (see "Runs").

## In plain words

The rehearsal plays step 17 on this computer, for real but with nothing real at stake. It starts two empty homes, each run by its own operator, and a relay. It makes the four identities step 17 needs: the author's, whose chain key is made by the air-gapped Module's own signer program and written as 24 words (printed for this run only, then thrown away); Machine, allegedly; the reporting identity; and the clock. It publishes the first acts in step 17's order: the first short post with a stand-in for the photograph of the Earth, the full shower text, the 29 specifications, the code as three signed releases, the dubsar.org site, and a placeholder for "Thank you for MOR". Then a separate program, which knows only one home's address and the links a stranger would be given, checks everything as a stranger would. Last, it replaces the author's keys from the 24 words alone, on a fresh copy of the signer, as after a lost device, and checks that both homes count it. When it ends, every program it started is stopped and every file it made is deleted.

## The checklist

From the last run (identities and act ids differ each run):

```
  PASS   1. Two fresh homes under two different operators, and a relay, started for this run.
  PASS   2. The author's identity is born from the signer's commitment export (its chain key never leaves the signer), with a receipt from each home.
  PASS   3. Every act (40) verifies through its signer's identity chain, from a fresh process that knows only one home's address.
  PASS   4. The reader shows the first post (its photograph too), the shower text and Thank you for MOR, each verified and signed by the author's identity; the specifications, releases and site version, which the reader does not show as text, are signed by it too (check 1).
  PASS   5. The display client, verified from its release on MOR, is what the gateway serves, and the gateway serves the site exactly as signed: SAME.
  PASS   6. In a browser, the gateway's display client says the site is verified, signed by the author's identity, and shows the first act verified.
  PASS   7. The listing, reading the two homes the listing page names, finds every specification and every release, each verified; its extensions section is there, and empty.
  PASS   8. The public feed shows the first post, verified, and Machine, allegedly's first act, in the clock's order.
  PASS   9. A stranger's report, signed by its own test identity, reaches the reporting identity and is read there, verified.
  FAIL  10. The first acts name the specifications published at step 17 as their formats: the photograph the JPEG Module, the documents the long-form cMIP, the site the website cMIP, the releases the release manifest cMIP, the stamps the clock Module.
              the photograph, the shower text, the site version, the first release, a clock stamp name a test value, not the published specification's spec hash: the clients carry the test values until they are rebuilt with the hashes step 17 makes
  PASS  11. Machine, allegedly's co-signature names each of the author's documents (the shower text, every specification, Thank you for MOR).
  PASS  12. The rotation of the author's identity, signed on a signer restored from the seed words alone, counts at home 1, asked alone.
  PASS  13. The rotation of the author's identity, signed on a signer restored from the seed words alone, counts at home 2, asked alone.
  PASS  14. A post signed after the rotation, with the key it installed, verifies from outside.
  PASS  15. The first post, signed before the rotation, still verifies after it, judged with its signer's whole sequence (as the feed and the release verifier read).
  FAIL  16. After the rotation, the reader still shows the first post verified, signed by the author's identity.
              the reader shows it "void"
  FAIL  17. After the rotation, the gateway's display client still shows the site and its first act verified, in a browser.
              the bar says "Failing: the site this gateway serves does not verify. Not shown."; the first act is not shown verified ("no act listed; the bar says: Failing: the site this gateway serves does not verify. Not shown. Who signed it, and how to")

3 of 17 checks FAILED.
```

What each part does, precisely:

- **Infrastructure.** `mor-relay init --role home --new-test-operator` twice (two operators) and `--role relay` once, on free ports of 127.0.0.1, from `clients/genesis/test/world.ts`; every folder under the run's own folder (`TMPDIR`), which the script removes on exit, after stopping every process whose command line names it.
- **The author's identity** (`scripts/rehearsal/author.ts`): `mor-signer new words` makes the seed and prints the 24 words; `mor-signer export` writes the commitment to key 0; the online side (`modules/airgap/examples/online_side.rs`, calling the Module's own `online::genesis`) builds the genesis on it with a signing key made by the client; the client sends it to both homes, each signing a receipt. The client's file never holds the chain key. The rotation: the client plans it (new signing key, kept lines), the online side makes the Module's pending rotation (`online::pending`), a second signer restored by `mor-signer restore words` from the 24 words alone reviews and signs it and commits the next key itself, the online side checks what came back (`online::accept`), and the client sends it to both homes and settles it.
- **Machine, allegedly; the reporting identity; the clock; a stranger:** test identities as today (chain key in software), each on both homes, with routes; the reporting identity with an inbox and an encryption key.
- **The first acts,** all public, on both homes and the relay: the post (`clients/barebone`, the JPEG stripped by the JPEG Module); the shower text and "Thank you for MOR" (`clients/longform`); each specification as F290 says (`scripts/rehearsal/specs.ts`: a publication whose media is Development's `spec` map, naming the Development MIR as its format); three releases under the author's own name (`clients/repo`: the whole repository, 950 files; the display client; Dub's web client), each naming among its references the specifications it implements; the site (`clients/site`), dubsar.org's pages with their placeholders filled; Machine, allegedly's first act and its co-signature; the clock's stamp of the first acts; the stranger's report.
- **From outside** (`scripts/rehearsal/outside.ts`, a fresh process): each act followed from one home by its signer (identity, routes, then the act) and judged through its signer's chain by the core library; the reader's own reading (`clients/reader`); the display client's release verified file by file from MOR (`mor-repo verify`), then `mor-site check` against it; Chromium on the gateway, every address but 127.0.0.1 refused; the listing (`readListing` and its page's renderer); the feed with its clock; the reporting identity's reports (`clients/reports`).

## Done by hand at step 17

What the rehearsal cannot do for real, one line each (the script prints the same list):

1. Every server that carries on past the tests is reinstalled from scratch (home1 and home2 on their hosts), not emptied: no test data, no build window key, no leftover settings.
2. The home on the author's machine gets a fresh onion address; the test one, in old commits, leads nowhere.
3. The author's chain key is made on the real air-gapped device, offline for good, and its 24 words written on paper once; here a signer ran on this machine and printed the words for one run.
4. The commitment, and later each rotation, cross to the online device by file or by QR from the real air-gapped device; here they crossed as files in one folder.
5. The real photograph of the Earth, and the first post's own words, in place of the stand-ins.
6. "Thank you for MOR", written by the author, in place of the placeholder.
7. DNS: dubsar.org and the homes' names point at the reinstalled servers, with their certificates; here everything was 127.0.0.1.
8. The gateway's settings on the real server: the real site version, the display client's real release, the real relays and homes.
9. The frozen texts and their spec hashes in place of the test values every client and relay uses now, and every client rebuilt with them (step 16).
10. The keys of Machine, allegedly, the reporting identity and the clock, made where they will be kept, each written down by the author.
11. The site checked on real phones and browsers, and the reader opened by its links (step 18).

## What step 17 as written gets wrong or leaves out

Each names its area.

1. **A rotation makes the site and the first acts unreadable** *(development layer: clients; must be fixed before step 18).* The Identity MIR is clear: an act in a rotation's kept ancestry stays valid, however old (rules at "In short: a rotation judges the acts signed with the key it replaces"). The core library agrees, given the acts that link it to the kept tip. But `readPost`'s judge (`clients/barebone/src/post.ts`, used by the reader, the display client and Dub) and the site's `openVersion` (`clients/site/src/verify.ts`) look the signer up and judge the act alone, without the signer's sequence; the feed (`clients/site/src/feed.ts`) and the release verifier (`clients/repo`) already fetch it. So the first time the author rotates after step 17 (a lost phone), dubsar.org shows "Not shown" and the reader shows the first post "void", until a new site version is signed. *Proposed fix, for its own session:* those two judges fetch the signer's acts (`actsBy`) when a counting rotation follows the act's binding, as the feed does; then the display client and Dub are released again. *A note on the core:* without the linking acts, the core library answers "void", not "cannot tell yet"; the MIR says what is valid, not what a reader holding part of the picture should say. Not put as a question now.
2. **The order of step 17 cannot work with today's clients** *(development layer, with a core consequence).* A specification's spec hash covers its content, and Development requires the creator in the content of every kind but the MIR; the build brief names the author as creator of the founding cMIPs and Modules. So the JPEG Module's, the long-form cMIP's, the website cMIP's, the release manifest cMIP's, the clock Module's (and every other cMIP's and Module's) real spec hashes exist only once the author's identity is born, at step 17. The clients carry test values (`clients/*/src/specs.ts`; `modules/timestamp/src/stamp.ts` says "until its creator is named at step 17"), and the released display client and Dub have them built in. Step 17 needs, between the author's genesis and the first post: compute every cMIP's and Module's spec hash; rebuild every client and the display client with them; release those builds, signed by the author. The rehearsal shows the gap (check 10) and cannot close it without that rebuild. *Consequence taken here:* the MIRs, the MICS and the freeze suite are published with no creator, so their hashes can be fixed at the freeze, before the author's identity exists (Development allows it for MIRs only).
3. **The MICS document and the freeze test suite have no kind** *(core business: Development, Part three).* The specification format's kinds are cMIP, Module, unit, media type, MIR and signature scheme. F290 publishes "the specifications" as Development's format, but neither the MICS document nor the freeze test suite is one of those kinds. The rehearsal publishes both under the MIR kind, marked provisional, and says so when it runs. **This is the question below.**
4. **Step 16b is not built.** Step 17 creates the author's identity "with the air-gapped Module". The Module's online side exists in Rust (`modules/airgap/src/online.rs`) and its tests, but no client makes a genesis from the commitment export or carries a rotation to and from the signer (`clients/genesis/README.md`, "not yet"); nor is there the phone app with a camera for the animated QR codes. The rehearsal bridges it by file with `online_side`, a small program calling the Module's own functions; step 17 needs the real thing (16b's "done when").
5. **Nothing publishes the specifications.** No client turns `spec/`, `cmips/` and `modules/` into publications; the rehearsal's `scripts/rehearsal/specs.ts` does. Before step 17 it should become a command of a client. With it: (a) which drafts are published: the rehearsal takes the newest of each, several still "for Nobody, allegedly, to approve"; step 17 publishes the freeze-ready drafts, still to be written. (b) The specifications' other fields (tasks filled, act types, dependencies, the cMIP each Module implements, layers) are written down nowhere as data; the rehearsal publishes kind, creator and text only, so the listing cannot show which cMIP a Module implements. (c) A specification's text is canonical text (Text MIR): the repository's files end with a line break, which canonical text forbids, so the published text is the file without it, and the shower text loses one trailing space. Anyone hashing the repository's file gets a different hash from the published one, unless the frozen files are committed without the final line break.
6. **Releases must name what they implement.** The listing shows a release only where its publication refers to a specification (F290's reading 2, until the release manifest cMIP gains "implements"). The repo client published releases with no references; built here (`prepareRelease`'s `refs`, shown before signing, with a test). Step 17 must say which specifications each release implements; the rehearsal took: the repository, every specification; the display client, the website and relay transport cMIPs; Dub, the relay transport and long-form cMIPs and the JPEG Module.
7. **The release browser is not built** *(presentation; F277: "To build before this step").* The rehearsal checks the releases as the archive half does (every file against its fingerprint, `mor-repo verify`); nothing shows a release's file tree in a browser.
8. **Machine, allegedly's first act and co-signature are decided but not built.** No client publishes the disclosure or the co-signature (the desk publishes the agent's nudge terms as its first act, which would make the terms, not the disclosure, its first act). The rehearsal publishes the disclosure as a text act, then one text act naming each document in `objects` (as decided: "a second act naming each document in `objects`"), with a reference to each; homes and relay accept it and it verifies. *Readings taken here, for the development layer:* the co-signature is a text act, not Identity's witness act (the disclosure says it is "credit, not a second witness"); one act for all documents, not one each.
9. **Step 17 names one identity; it needs four.** The reporting identity (F287), the clock the feed names, and Machine, allegedly, are made at step 17 too (`docs/path-to-mor-2-draft.md` says so of the reporting identity). Step 17 does not say who holds their keys, or where the clock's service runs.
10. **The site's placeholders are more than the first acts.** Besides FIRST-ACT and SHOWER-TEXT: the feed page names two test identities' hashes for Nobody, allegedly, and Machine, allegedly, and CLOCK-IDENTITY; the report page REPORTS-IDENTITY; the gateway's settings the display client's release. All filled by the rehearsal. Two stay placeholders, since step 17 publishes no act for them: ONE-PAGE ("MOR in one page" on the front page) and THIRD-THANK-YOU (the feed page).
11. **Where the acts go.** Step 17 does not say; the listing page reads home1 and home2. The rehearsal publishes every act and its media on both homes and the relay, and the stranger reaches them through the author's routes.
12. **The author's genesis declares no clock.** Money rule 14b's warning applies (if the signing key is ever stolen, payments to what the thief published fall on the author); the Bitcoin clock's anchoring build is on an unmerged branch. Step 17 does not say whether the real identity declares a clock at birth; a later rotation can add one. Not put now: one question at a time.
13. **Dub's web client is released from older sources than the display client** *(development layer).* Their WebAssembly no longer match, which fails Dub's own test on `main` (see "Runs"). Dub's web client is one of the releases signed at step 17, so it is released again from the same sources as the display client first, with the hashes of 2.
14. **"Done when" says "everything the reader shows is signed by the author's identity"; the feed and the report page also show Machine, allegedly, the reporting identity and strangers, as decided. Wording only.

## The question (one)

**Area: core business (Development MIR, Part three, the specification format's kinds; F290).** Step 17 publishes the MICS document and the freeze test suite with the six MIRs, but the format's kinds (cMIP, Module, unit, media type, MIR, signature scheme) include neither. How are they published?

- (a) Under the MIR kind (4), as the rehearsal does now: no format change, but the listing and any client will call them MIRs.
- (b) Two new kinds, 6 "the MICS document" and 7 "a test suite": a change to Development's format, so before the freeze.
- (c) As long-form documents, not specifications: then they have no spec hash, and the listing does not show them.

The project lead's lean: (b), since the freeze is when the format can still change and the MICS is "the map", not a MIR; (a) only if the format must not change now.

## What was built

| File | What |
| --- | --- |
| `scripts/rehearse-step-17.sh` | The one command: builds what it runs, runs everything in one folder, prints the checklist and the list done by hand, removes the folder and every process of it on exit, and checks nothing is left. |
| `scripts/rehearsal/rehearse.ts` | The author's side: the homes and relay, the identities, the first acts in step 17's order, the gateway, then the rotation. |
| `scripts/rehearsal/outside.ts` | The stranger's side, a fresh process: every check from outside. |
| `scripts/rehearsal/author.ts` | The author's identity through the air-gapped Module's signer and seed words: the genesis from its commitment export, the rotation from a signer restored from the words. |
| `scripts/rehearsal/specs.ts` | Every specification as F290 says, the newest draft of each. |
| `scripts/rehearsal/checklist.ts` | The checklist: each check passes or fails with a plain sentence. |
| `modules/airgap/examples/online_side.rs` | The online side of the Module by file (genesis, pending rotation, the check of the signed rotation), standing in for step 16b in the rehearsal. |
| `clients/repo/src/release.ts` | A release's references, shown before signing (`prepareRelease`'s `refs`), so a release can name what it implements; a test in `clients/repo/test/repo.test.ts`. |

## Runs

- **The rehearsal, final version:** three runs in a row, each 14 of 17, the same three failing, each ending "Nothing left running, nothing left behind". No `mor-relay`, gateway or browser process remained, and no run folder.
- **`scripts/test-all.sh`:** the Rust workspace passes (676 tests, none failing), and so do the WebAssembly build and the packages before Dub (assess, barebone, collective, connector, desk). Then **`clients/dub/test/web-build.test.ts` fails, on `main` too, and nothing in this branch touches it.** Its first test asserts that Dub's released WebAssembly is the display client's byte for byte. Since the display client was released again (`81a34b0`) after Dub's web client (`7650aaa`), they differ. Node's assertion then builds a diff of two 3.8 MB buffers, which uses up memory until the system kills the process (seen in the kernel's log: about 14 GB). Fix: release Dub's web client again from the current sources (its GitHub workflow). For step 17 this matters too, since Dub's web client is one of the releases signed. The script stops at the first failure, so the packages after Dub were run by hand with the same commands: genesis 27, longform 26, manage 7, nudge 25, reader 18, repo 20 (the new test among them), reports 8, site 81, and the JPEG, video, carry and timestamp Modules 14, 6, 6 and 5, all passing.
- **Not run:** the WebKit browser (not downloadable here); `--reproducible`; the Lightning test on regtest (skipped as always without `MOR_LN_REGTEST`).

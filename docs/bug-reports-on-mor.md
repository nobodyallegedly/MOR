# Bugs and attacks reported on MOR, mirrored on GitHub (F287)

*GitHub session, 13 October 2026. Branch `claude/bug-reports-on-mor`, not merged. F287, decided by Nobody, allegedly, the same day: "Ideally A." Client work and one page: `core/`, `spec/`, `cmips/` and `clients/site`'s code unchanged (two expectations in its tests updated for the new page). Test identities only.*

## The five branches together: clients/site's tests

*14 October 2026.* **Yes, they pass now.** The cause was the two new pages on dubsar.org. The listing branch added `listing.html`, and this branch added `report.html`. Each branch updated the site test that counts dubsar.org's files, but only for its own page. Both changed the same line in the same way, from 10 + the doors to 11 + the doors. So Git merged the two edits as one, and the list of pages kept `listing.html` but not `report.html`. The combined site has 12 pages and files besides the doors, and the test expected 11, so two tests failed in `clients/site/test/site.test.ts`: the publication of dubsar.org, and the command line's `verify`. The fix is in that test only. It now lists `report.html` too and counts 12 + the doors. Nothing else changed.

Checked here: `clients/site`'s tests 5 times in a row, **81 of 81 each time**. Then `scripts/test-all.sh` once, all passing: **1,080 tests** (676 in the Rust workspace, 404 in the TypeScript packages and Modules).

Not touched: the GitHub step "Reproducible build of the display client" also failed. It compares the released copy in `clients/site/built/` with a fresh build, and on any branch with new display-client code these differ until the next release. Main has since made that step a notice on pull requests (`7eff11f`), and this branch does not have that commit yet. It is a separate step from `clients/site`, and only a merge of main or a new release changes it.

## Do the tests pass?

**Yes.** `scripts/test-all.sh` passes on this branch: **1,068 tests, none failing** (676 in the Rust workspace, 392 in the TypeScript packages and Modules), against **1,060 on main** at `a718f91`. The 8 more are the new mirror's tests; every other count is the same as main's.

## In plain words

**The page.** `docs/dubsar.org/report.html`, "Report a bug or an attack": the writing box addressed to the reporting identity only; Public and Private said in plain words (Public for almost every report, since a report is meant to be seen; Private for an attack not yet safe to show, sealed so that only the reporting identity can open it, never shown nor copied to GitHub); what a good report contains; the link to the GitHub mirror; and below, the reporting identity's answers, each with the public report it answers beside it. Its hash is the placeholder `REPORTS-IDENTITY` until step 17, said on the page in one line; until then the box and the answers show that they name no one, and nothing can be sent. The feed page links to it.

**One thing the page cannot do as asked: start on Public.** The box is the display client's own, and it starts on Private; the website cMIP (rule 13b) gives a page no way to choose. Changing that would change `clients/site`'s code and the cMIP, which this step was not to touch. So the page says, beside the box: "The box starts on Private: press Public for a report anyone may see." A report sent Private by mistake is only less seen, never more. Question 1 below.

**The mirror.** `clients/reports`, a small command, `mor-reports`, run by hand on the Mac. It reads the reporting identity's public reports (left unsealed in its inbox) and its own public answers, checks every one through its signer's identity chain with MOR's core library, and on GitHub:

- opens one issue for each public report: its first line as the title, its words exactly as signed, its act ID, its signer, the reporting identity, the label "reported on MOR";
- adds each answer to the issue of the report it names, as a comment, once;
- puts back an issue someone edited, so it always says what was signed.

The other way: an issue opened on GitHub by anyone else, still open and not answered on MOR, is listed at the end of each run, for the reporting identity to answer on MOR with the issue's address in its words. The next run copies that answer to the issue. Nothing is ever signed by the command: it holds no key, so it cannot even open a private report; it only counts them.

**The token** is read from `MOR_GITHUB_TOKEN` or `~/.config/mor/github-token`, as the desk reads its Anthropic key: never from inside the repository (refused), never printed, scrubbed from every error, even one where GitHub repeats what it was sent. `clients/reports/README.md` says how to make a token that can touch only this repository's issues.

**Running it twice changes nothing.** What is mirrored is read back from GitHub each time, so nothing is kept on the Mac and a run cut short is simply finished by the next. `--dry-run` shows what would be done first.

## What was built

| Where | What |
| --- | --- |
| `docs/dubsar.org/report.html` | The page, as above. No script (rule 11): the box (`mor-write`) and the answers (`mor-feed`) are laid by the display client. |
| `docs/dubsar.org/feed.html` | One line under "Take part": "Report a bug or an attack", to the new page. |
| `clients/reports/` | `mor-reports`: `src/read.ts` (what MOR holds), `src/mirror.ts` (the plan, and carrying it out), `src/github.ts` (the token, GitHub's API), `src/cli.ts`; README. |
| `clients/reports/test/` | `mirror.test.ts` and `fake-github.ts`, below. |
| `clients/README.md` | Its line. |
| `clients/site/test/site.test.ts` | The folder's expected file list and count, with `report.html` (tests only). |

## Tests

`clients/reports/test/mirror.test.ts`, 8 tests, against a real home and two relays on local ports (the reporting identity's inbox and outbox) and a fake of GitHub's API on another port, the command run as its own process as the author runs it. Reports are written exactly as the page's box writes them (the display client's own `writeNote`, called, not changed).

- A dry run says what it would do, and sends nothing to GitHub.
- **A public report mirrored once:** one issue, its words exactly (with backticks, an @mention and an HTML tag in them, all shown as written), its act ID, its signer (the one-time identity), the reporting identity, the label; run again, nothing sent.
- **A private report never mirrored:** its words and its ID in no request to GitHub and in no output; counted as one sealed item.
- **An answer appended:** the reporting identity answers the report on MOR; the next run adds it to the report's issue as a comment; run again, still one.
- An issue opened on GitHub is listed as waiting (a pull request and a closed issue are not); answered on MOR by its address, the answer is copied to it once and it leaves the list; a post naming issue 10 does not count for issue 1.
- An issue edited by hand is put back as signed; an issue by another account carrying the mirror's line is not taken for the mirror's.
- **The token in no output:** in no output of any run, in no request but its `Authorization` header, scrubbed where the fake GitHub repeats it in a refusal; read from the home folder; refused in a file inside the repository; none at all said plainly.
- The placeholder `REPORTS-IDENTITY` refused as an identity.
- The page: one box, naming the reporting identity alone; the mirror's link; no script.

Not tested here: the page in a browser through a gateway. The box, the feed and the notes beside answers are the display client's, already tested in `clients/site` (`feed-page.test.ts`), and `clients/site`'s own tests publish and serve the whole `docs/dubsar.org` folder, this page included.

### Counts against main

| | main (`a718f91`) | this branch |
| --- | --- | --- |
| Rust workspace | 676 | 676 |
| `clients/assess`, `barebone`, `collective`, `connector`, `desk`, `dub`, `genesis`, `longform`, `manage`, `nudge`, `reader`, `repo` | 51, 10, 42, 13, 30, 16, 27, 26, 7, 25, 18, 19 | the same |
| `clients/reports` (new) | — | 8 |
| `clients/site` | 69 | 69 |
| `modules/jpeg`, `video`, `carry`, `timestamp` | 14, 6, 6, 5 | the same |
| **Total** | **1,060** | **1,068** |

**One change to `clients/site`'s tests, not its code.** Two of its tests list the exact files of the `docs/dubsar.org` folder (and their number); adding `report.html` broke both, as expected. Their expected list now names `report.html`, and the count is one higher. Nothing else in `clients/site` is changed.

**Intermittent, and also on main.** On a fresh copy of main, one site browser test failed once because it ran before another test had built the display client ("the display client is not built"); run again, all 69 passed. On this branch, a different site browser test (the department doors) failed once and passed on every run after. Neither involves the new page. Both are older than this step and are not fixed here.

## Readings taken

Where the decision is silent, these readings are taken, for Nobody, allegedly, to confirm or change.

1. **A report** is a public text act addressed (`to`) to the reporting identity, left unsealed in its inbox, signed by anyone else. The page's box makes exactly that; any client may report the same way.
2. **An answer** is a public text act of the reporting identity naming the report in `refs` (as MOR Identities writes a reply). An answer to an issue opened on GitHub carries the issue's address in its words: the only thing GitHub's side can be named by.
3. **Everything public in the inbox is mirrored,** whoever wrote it, including nonsense or abuse, once its signature checks. The author runs the command by hand and sees `--dry-run` first. Question 2.
4. **The words go in a code block** on GitHub, so they are shown exactly and nothing in them acts (no mention notifies anyone, no picture loads, no link is made for the writer). The title is the first line, at most 80 characters.
5. **Only what checks as valid is mirrored;** anything else is said in the run's output and left out.
6. **The mirror's own issues and comments** are those written by the token's account and ending with the act ID line. GitHub is the record of what was mirrored; nothing is kept on the Mac.
7. **Waiting for an answer on MOR:** issues still open, not pull requests, not the mirror's. A closed issue is not listed.
8. **The page shows the answers** (a feed of the reporting identity, with the report beside each answer, website cMIP rule 13a), so "answered in the open" holds on dubsar.org too, not only on GitHub. The feed page links to it; whether the front page does too is the author's call.
9. **Not mirrored:** a reporter's follow-up to an answer, and a private report later made safe to show. A one-time identity cannot write again; a report made public later would be a new public act, which the mirror would then take.

## Questions for Nobody, allegedly

1. **Public by default.** The box starts on Private, and a page cannot change that (website cMIP draft 8, rule 13b; `clients/site`'s box). Options: (a) as built: the page tells the visitor to press Public; (b) website cMIP draft 9: a `mor-write` may say which way it starts (`public`), the display client honours it, a new release of the display client; (c) a box that is public only, and private reports by the reader's sealed message instead. *Lean: (b), a small change, in a session allowed to touch `clients/site` and the cMIP. Until then (a) errs on the safe side.*
2. **Everything public is mirrored.** Anyone can leave a public note in the reporting identity's inbox, so anything can reach GitHub through the command. Options: (a) as built: the author reads the dry run and runs it; (b) only reports the reporting identity has answered, or picked, are mirrored; (c) a list of act IDs the mirror skips, kept on the Mac. *Lean: (a) to start; (b) if it is abused, since a pick is already a signed, public act.*
3. **Who answers as the reporting identity** (for step 17): the author from MOR Identities, or Machine, allegedly, under the nudge cMIP (it would then need its own terms for the reporting identity)? Not needed by this step.

## No flaw in a MIR found.

The gap in question 1 is the website cMIP's (a choice it gives a page), not a MIR's.

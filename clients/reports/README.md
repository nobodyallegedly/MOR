# Reports on MOR, mirrored on GitHub (mor-reports)

F287, decided by Nobody, allegedly, 13 October 2026 ("Ideally A"): bugs and attacks are reported on MOR, to a public reporting identity with an inbox, each report a signed act kept and answered in the open; GitHub issues are open as a mirror for those not on MOR yet. Reports come from people on MOR, each from their own identity (Nobody, allegedly, 14 October 2026: "Bug reports come from people truly on MOR, their own ID."), and the mirror runs both ways (F289, question 6: "If we can have it bidirectional yes please."). This is the mirror: a small command, run by hand on the author's computer. The page that says how to report is `docs/dubsar.org/report.html`.

**Test identities only** until step 17, where the reporting identity is made and the page's placeholder `REPORTS-IDENTITY` replaced by its hash.

## In plain words

- **Someone reports** from their own identity: in Dub (or Dub on the web), a post with the reporting identity's ID in **To an identity**; from any other client, a public message to it, a text act naming it as recipient, left unsealed in its inbox. The report page says how. A sealed message to the reporting identity is private.
- **You run `mor-reports`.** It reads the public reports in the reporting identity's inbox, and the reporting identity's own public posts, checks every one through its signer's identity chain with MOR's core library, and then, on GitHub:
  - opens **one issue for each public report**: its first line as the title, its words exactly as signed in the body (in a block GitHub shows as it is: no link, mention, picture or formatting of the writer's is acted on), its act ID, its signer, the reporting identity, and the label "reported on MOR";
  - adds **each answer** of the reporting identity to the issue of the report it names, as a comment, once;
  - puts back an issue's title and body if someone edited them, so the issue always says what was signed.
- **A private report is never mirrored.** The command holds no key: it cannot open a sealed report, and only counts them.
- **The other way: GitHub to MOR.** An issue opened on GitHub by anyone else, still open and not yet on MOR, is **listed** at the end of each run. With `--dry-run`, each is shown **word for word as it would be published on MOR**: "Reported on GitHub by @" its author's handle and its title, its words, and its address as the last line. Nothing is published without you:
  1. Read the dry run. Name the issues to publish: `--prepare 12` (or `--prepare 12,15`).
  2. The command writes, for each, a **draft** into the drafts folder MOR Identities reads (`~/mor-drafts`, as for Claude's drafts; `clients/connector/DRAFTS.md`): a public post of the reporting identity. **It signs nothing: the reporting identity's keys stay at MOR Identities.**
  3. At MOR Identities, the draft is read again from its own bytes and shown; you **approve** it (it is signed there and sent to the reporting identity's relays), or decline it. Its note says it comes from mor-reports, not from Claude (the desk shows a draft's note under "Claude's note to you", whoever wrote the draft).
  4. The next run finds it on MOR: the issue is told, once, with the act's ID, and leaves the list. Answer it on MOR as you answer any report, naming the re-published post; each answer is added to the issue. An answer carrying the issue's address in its words also still counts.
  - A draft waiting at the desk, approved, declined or sent back is said beside its issue, and **never prepared twice**. To prepare a declined one again, remove its draft file.
- **Running it twice changes nothing.** What is already mirrored is read back from GitHub each time: the mirror's own issues and comments, written by the account the token belongs to, each ending with the act ID it carries. Another account writing the same line is not taken for the mirror.
- `--dry-run` says what would be done, and changes nothing.

## Setting it up on the Mac

1. The code, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
   cd ../connector && npm install
   cd ../reports && npm install
   ```
2. **A GitHub token.** On GitHub: Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token. Repository access: only `nobodyallegedly/MOR`. Permissions: Issues, Read and write (Metadata, read, comes with it). Copy the token, then in Terminal:
   ```
   mkdir -p ~/.config/mor && pbpaste > ~/.config/mor/github-token && chmod 600 ~/.config/mor/github-token
   ```
   Or set `MOR_GITHUB_TOKEN` in the shell instead. The token stays there: never in the repository (a token file inside it is refused), never printed, never in an issue (the command scrubs it from every error, even one GitHub echoes).
3. **The settings,** once the reporting identity exists (step 17), in `~/.config/mor/reports.json`:
   ```
   { "identity": "<the reporting identity's hash>",
     "places": ["https://home1.dubsar.org", "https://home2.dubsar.org"],
     "repository": "nobodyallegedly/MOR",
     "drafts": "/Users/you/mor-drafts" }
   ```
   `drafts` is MOR Identities' drafts folder (its Settings); left out, `MOR_DRAFTS` or `~/mor-drafts`.
4. **The reporting identity at MOR Identities.** It is held there, and set to **On** ("Claude may prepare drafts for this identity"): the desk signs a draft only for an identity it holds and that is On, whoever prepared the draft. Every draft is still signed only when you approve it.
5. **Run it:** from `clients/reports`, `npm run mirror -- --dry-run` to see, then `npm run mirror`; `npm run mirror -- --prepare N` for the issues you chose to publish on MOR.

## Precisely

| File | What |
| --- | --- |
| `src/read.ts` | The reporting identity looked up from the places given; its inbox for the Text MIR read from its routes, each relay's feed `to` it read page by page: an unsealed public text act addressed to it, by another signer, is a report; a sealed item is counted, never opened. Its own public text acts read from its outbox route (or its route for everything else) and the places, in its signed order. Each act read with the barebone client's `readPost` and judged through its signer's chain in one verifier; only `valid` is taken, anything else said. |
| `src/mirror.ts` | The plan (issues to open or put back, answers to add, issues published again on MOR, issues waiting to be) and carrying it out. A re-publication is a public text act of the reporting identity whose first line starts "Reported on GitHub by @" and whose last line is the issue's address; the issue gets one comment saying so. An answer naming a report in `refs` goes to that report's issue; one naming a re-publication goes to its issue; one whose words carry an issue's address (not followed by another digit) goes to that issue. The body's last line, `<!-- mor-report ID -->`, `<!-- mor-answer ID -->` or `<!-- mor-republished ID -->`, counts only on the mirror's own account's issues and comments. |
| `src/github.ts` | The token (`MOR_GITHUB_TOKEN`, else `~/.config/mor/github-token`; a file inside the repository refused), and GitHub's REST API: `/user`, issues (pull requests left out), comments, the label, page by page. `MOR_GITHUB_API` points it elsewhere (the tests' fake). |
| `src/prepare.ts` | GitHub to MOR: the drafts already in the folder for each issue (read back, with the desk's answer), and a new draft, the connector's own `postDraft`, written with `saveDraft`. |
| `src/cli.ts` | `mor-reports [--dry-run] [--prepare N[,N...]]... [--identity ID] [--at URL]... [--repo OWNER/NAME] [--drafts DIR] [--settings FILE]`. The placeholder `REPORTS-IDENTITY` is refused. |

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../connector && npm install && cd ../desk && npm install && cd ../reports
npm install
npm test
```

`test/mirror.test.ts`, against a home and two relays on local ports (the reporting identity's inbox and outbox), a fake of GitHub's API (`test/fake-github.ts`), and MOR Identities' own code holding the reporting identity, the command run as its own process: a report written from a reporter's own identity as Dub writes one (the barebone client's `post` with `to`, and `leaveInInbox`), and a sealed message; a dry run changes nothing; **a public report mirrored once**, its words exactly, its act ID and its reporter as signer; **a private report never mirrored** (its words and ID in no request to GitHub and no output); an issue opened on GitHub listed, a pull request and a closed issue not; run again, nothing sent; **an answer appended** to the report's issue, once; an issue opened on GitHub answered on MOR by its address, the answer copied to it once, and it leaves the list (a post naming issue 10 does not count for issue 1); an issue edited by hand put back as signed; another account's issue carrying the mirror's line not taken for the mirror's; **GitHub to MOR**: the dry run shows the re-publication word for word, a run naming nothing prepares nothing, `--prepare` writes one draft for the reporting identity and signs nothing, never twice; the desk approves it; the next run tells the issue once; an answer naming the re-publication flows back to the issue, once; a draft declined at the desk is said and not prepared again; **the token in no output** of any run, nor in any request but its header, scrubbed where GitHub echoes it, read from the home folder, refused inside the repository; the placeholder refused; the report page: no writing box, the reporting identity's ID, how to report from Dub or any client, its answers, the mirror both ways, no script.

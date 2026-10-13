# Reports on MOR, mirrored on GitHub (mor-reports)

F287, decided by Nobody, allegedly, 13 October 2026 ("Ideally A"): bugs and attacks are reported on MOR, to a public reporting identity with an inbox, each report a signed act kept and answered in the open; GitHub issues are open as a mirror for those not on MOR yet. This is the mirror: a small command, run by hand on the author's computer. The page people report from is `docs/dubsar.org/report.html`.

**Test identities only** until step 17, where the reporting identity is made and the page's placeholder `REPORTS-IDENTITY` replaced by its hash.

## In plain words

- **Someone reports** from dubsar.org's report page: the writing box, addressed to the reporting identity only. Public (pressed by hand: the box starts on Private) leaves the report unsealed in the reporting identity's inbox; Private seals it so that only the reporting identity can open it.
- **You run `mor-reports`.** It reads the public reports in the reporting identity's inbox, and the reporting identity's own public posts, checks every one through its signer's identity chain with MOR's core library, and then, on GitHub:
  - opens **one issue for each public report**: its first line as the title, its words exactly as signed in the body (in a block GitHub shows as it is: no link, mention, picture or formatting of the writer's is acted on), its act ID, its signer, the reporting identity, and the label "reported on MOR";
  - adds **each answer** of the reporting identity to the issue of the report it names, as a comment, once;
  - puts back an issue's title and body if someone edited them, so the issue always says what was signed.
- **A private report is never mirrored.** The command holds no key: it cannot open a sealed report, and only counts them.
- **The other way.** An issue opened on GitHub by anyone else, still open and not yet answered on MOR, is **listed** at the end of each run. Answer it on MOR as the reporting identity (from MOR Identities), with the issue's address in the words; the next run copies that answer to the issue, and the issue leaves the list. Nothing is ever signed by this command.
- **Running it twice changes nothing.** What is already mirrored is read back from GitHub each time: the mirror's own issues and comments, written by the account the token belongs to, each ending with the act ID it carries. Another account writing the same line is not taken for the mirror.
- `--dry-run` says what would be done, and changes nothing.

## Setting it up on the Mac

1. The code, from the MOR folder:
   ```
   git fetch origin && git checkout main && git pull
   cd clients/genesis && npm install && npm run wasm
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
     "repository": "nobodyallegedly/MOR" }
   ```
4. **Run it:** from `clients/reports`, `npm run mirror -- --dry-run` to see, then `npm run mirror`.

## Precisely

| File | What |
| --- | --- |
| `src/read.ts` | The reporting identity looked up from the places given; its inbox for the Text MIR read from its routes, each relay's feed `to` it read page by page: an unsealed public text act addressed to it, by another signer, is a report; a sealed item is counted, never opened. Its own public text acts read from its outbox route (or its route for everything else) and the places, in its signed order. Each act read with the barebone client's `readPost` and judged through its signer's chain in one verifier; only `valid` is taken, anything else said. |
| `src/mirror.ts` | The plan (issues to open or put back, answers to add, issues waiting for an answer on MOR) and carrying it out. An answer naming a report in `refs` goes to that report's issue; an answer whose words carry an issue's address (not followed by another digit) goes to that issue. The body's last line, `<!-- mor-report ID -->` or `<!-- mor-answer ID -->`, counts only on the mirror's own account's issues and comments. |
| `src/github.ts` | The token (`MOR_GITHUB_TOKEN`, else `~/.config/mor/github-token`; a file inside the repository refused), and GitHub's REST API: `/user`, issues (pull requests left out), comments, the label, page by page. `MOR_GITHUB_API` points it elsewhere (the tests' fake). |
| `src/cli.ts` | `mor-reports [--dry-run] [--identity ID] [--at URL]... [--repo OWNER/NAME] [--settings FILE]`. The placeholder `REPORTS-IDENTITY` is refused. |

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../reports
npm install
npm test
```

`test/mirror.test.ts`, against a home and two relays on local ports (the reporting identity's inbox and outbox) and a fake of GitHub's API (`test/fake-github.ts`), the command run as its own process: reports written exactly as the page's box writes them (the display client's own `writeNote`), one public, one private; a dry run changes nothing; **a public report mirrored once**, its words exactly, its act ID and signer; **a private report never mirrored** (its words and ID in no request to GitHub and no output); an issue opened on GitHub listed, a pull request and a closed issue not; run again, nothing sent; **an answer appended** to the report's issue, once; an issue opened on GitHub answered on MOR by its address, the answer copied to it once, and it leaves the list (a post naming issue 10 does not count for issue 1); an issue edited by hand put back as signed; another account's issue carrying the mirror's line not taken for the mirror's; **the token in no output** of any run, nor in any request but its header, scrubbed where GitHub echoes it, read from the home folder, refused inside the repository; the placeholder refused; the report page's box naming the reporting identity alone, with the mirror's link and no script.

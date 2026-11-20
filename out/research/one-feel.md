# One feel across five small apps

*Research session D for DubWeb (the Dubsar Suite), 20 November 2026. A research note: a record of work and a set of proposals. Nothing here is a decision of Nobody, allegedly. Every "For DubWeb:" paragraph and the whole draft of conventions are the researcher's suggestions.*

*How far the sources were checked: the network in this session blocked almost every source site. Some sources were confirmed through web search; the rest are cited from memory and their pages were not opened. The last section lists each source as **checked** or **unchecked**. Treat any claim resting on an unchecked source as unchecked.*

## Summary

1. A suite feels like one when the same word, mark and command shape mean the same thing everywhere. Sameness of meaning matters more than sameness of looks.
2. Each app stays usable alone if it carries its own copy of the shared words and rules. Share a written standard and a test, not a running program.
3. Write for a careful reader in a second language: short sentences, one term per idea, no idioms.
4. "Unchecked" must be a visible state of its own. It must never look like "checked", and never look like nothing.
5. Mark every item, not only the bad ones. An item with no mark is read as safe.
6. A mark is a word first, a symbol second, a colour last. This works in a terminal, in a screen reader and in a graphical app.
7. Keep messages in catalogues with stable names. Translate the three status words once, with native review, and never loosely.
8. Offline is the normal case. Say what was checked, against what, and as of when.
9. Releases: say what changed and why, keep old in-progress work readable, and fetch the release back by its hash before announcing it.
10. The main open question: the exact words for the three states in six languages.

## 1. Command-line design guidance

**What the sources say.**

- The Command Line Interface Guidelines put people first. They ask for help on `-h` and `--help`, examples in help text, results on standard output, messages and errors on standard error, a `--json` option for machines, and no colour when `NO_COLOR` is set or the output is not a terminal. They also say an error should state what went wrong and what to do next. ([clig.dev](https://clig.dev/), [no-color.org](https://no-color.org/))
- POSIX fixes the old grammar: options start with a dash, `--` ends the options, and operands come after. ([POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html))
- GNU adds long options with two dashes and asks every program to support `--help` and `--version`. The first line of `--version` gives the program name and version. Errors from a non-interactive program start with the program name and a colon. ([GNU: command-line interfaces](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html), [GNU: --version](https://www.gnu.org/prep/standards/html_node/_002d_002dversion.html), [GNU: errors](https://www.gnu.org/prep/standards/html_node/Errors.html))
- Heroku's guide asks for one naming pattern for all commands, flags in preference to positional arguments, output a person can read with a machine form on request, and warnings and errors on standard error. ([Heroku CLI style guide](https://devcenter.heroku.com/articles/cli-style-guide))
- Suites stay consistent by writing their rules down. kubectl's conventions fix the shape as `kubectl <VERB> <NOUNs>` and say "Flags are all lowercase, with words separated by hyphens." ([kubectl conventions](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-cli/kubectl-conventions.md))
- git documents its own grammar for all subcommands in one page, and gives scripts a stable output format that is promised not to change. ([gitcli](https://git-scm.com/docs/gitcli), [git status --porcelain](https://git-scm.com/docs/git-status))
- The GitHub CLI documents its exit codes once for the whole tool: 0 for success, 1 for failure, 2 for a cancelled command, 4 when sign-in is needed. ([gh exit codes](https://cli.github.com/manual/gh_help_exit-codes))
- POSIX `grep` shows that exit codes can carry a three-way answer: 0 for found, 1 for not found, more than 1 for an error. ([POSIX grep](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/grep.html))

**For DubWeb:** write one short conventions page and treat it like the kubectl page: the rule book all five apps follow. Use one command shape, one set of common flags, one help layout, one error shape and one table of exit codes. Give "unchecked" and "refused" their own exit codes, so a script can never mistake them for success. The draft is in the section "Draft of shared conventions".

## 2. Plain language and public-service design

**What the sources say.**

- GOV.UK's design principles include "Do the hard work to make it simple", "This is for everyone" and "Be consistent, not uniform". The last one matters here: the same patterns and language, not identical screens. ([Government design principles](https://www.gov.uk/guidance/government-design-principles))
- GOV.UK tells its writers to aim for a reading age of 9, and says experts also need plain English. ([Writing for GOV.UK](https://www.gov.uk/guidance/content-design/writing-for-gov-uk))
- GOV.UK's publishing team set a limit of 25 words for a sentence. ([Inside GOV.UK: sentence length](https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/))
- The United States federal plain language guidelines ask for short sentences, the active voice, "must" for a requirement, and the same term for the same thing every time. ([plainlanguage.gov guidelines](https://www.plainlanguage.gov/guidelines/), also kept at [digital.gov](https://digital.gov/guides/plain-language))
- The international plain language standard says a text is plain when readers can find what they need, understand it and use it. ([ISO 24495-1:2023](https://www.iso.org/standard/78907.html))
- For readers in a second language, and for translators, the advice is the same from several sources: short sentences, no idioms, no jokes, consistent terms, and no dropped small words such as "that". ([Google developer style: writing for a global audience](https://developers.google.com/style/translation), [Microsoft style guide: global communications](https://learn.microsoft.com/en-us/style-guide/global-communications/))
- Simplified Technical English goes further: an approved word list, and one meaning for each word. ([ASD-STE100](https://www.asd-ste100.org/))
- WCAG asks, at its highest level, for text that a person with lower secondary education can read, or a simpler version beside it. ([WCAG: reading level](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html))

**For DubWeb:** keep one glossary of about fifty words for all five apps. One word, one meaning: if "checked" means "the signature was checked", never use it for anything else. Sentences under 25 words. No idioms. Write the English so that it is easy to translate, because five other languages inherit every unclear sentence.

## 3. Showing uncertainty and verification status

**What the sources say.**

- Stating uncertainty costs little trust. Five experiments with 5,780 people found that readers noticed the stated uncertainty, and that trust in the number and its source fell only slightly. The fall was larger for vague words than for precise statements. ([van der Bles and others, PNAS 2020](https://www.pnas.org/doi/10.1073/pnas.1913678117))
- A companion paper gives a frame: be clear about what is uncertain, why, and how much. ([van der Bles and others, Royal Society Open Science 2019](https://royalsocietypublishing.org/doi/10.1098/rsos.181870))
- An item with no mark is read as approved. When warnings were put on some false headlines, readers judged the unmarked false headlines as more accurate. The authors call this the implied truth effect. Marking true items as verified removed the effect. ([Pennycook, Bear, Collins and Rand, Management Science 2020](https://doi.org/10.1287/mnsc.2019.3478))
- Positive badges are over-read. Chrome found that only 11% of people in a study understood what the lock icon meant; many took it to mean the site was trustworthy. Chrome replaced the lock with a neutral icon. ([Chromium blog, 2023](https://blog.chromium.org/2023/05/an-update-on-lock-icon.html))
- Chrome had already removed the word "Secure" in 2018, so that only problems are marked and the plain state is the safe one. ([Chromium blog, 2018](https://blog.chromium.org/2018/05/evolving-chromes-security-indicators.html))
- The stronger badge did not help either. When the extended validation indicator was removed in a field test, most measures of behaviour did not change, and none of 14 designs improved understanding of login pages. ([Thompson and others, USENIX Security 2019](https://www.usenix.org/conference/usenixsecurity19/presentation/thompson))
- Warnings can work when they are well made. Design changes raised the share of people who heeded a browser warning, though they improved understanding less. ([Felt and others, CHI 2015](https://dl.acm.org/doi/10.1145/2702123.2702442), [Akhawe and Felt, USENIX Security 2013](https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe))
- Good tools separate "bad" from "cannot tell". git reports a signature with one letter from a fixed list. The list has separate letters for a good signature, a bad signature, a signature that cannot be checked, and no signature. ([git pretty formats, `%G?`](https://git-scm.com/docs/pretty-formats))
- GitHub's vigilant mode marks every commit: "Verified", "Partially verified" or "Unverified". Nothing is left blank. ([GitHub: verification statuses](https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits))
- GnuPG separates two questions: is the signature good, and is the key known to belong to that person. It prints both. ([GNU Privacy Handbook](https://www.gnupg.org/gph/en/manual.html))
- Fact-checkers publish their verdicts in a shared format, yet each uses its own scale of words, which makes verdicts hard to compare. ([schema.org ClaimReview](https://schema.org/ClaimReview))

These two findings pull in different directions. Chrome says: do not celebrate the good state. Pennycook says: do not leave anything unmarked. They agree once the mark is plain and precise: mark everything, in a quiet voice, and say exactly what was checked.

**For DubWeb:** use three states, always shown, with a reason for the two that are not "checked".

- "Checked" names the check: "signature checked", never "safe" or "trusted". A checked signature on a scam is still a scam.
- "Unchecked" always gives its reason in a few words: "unchecked: no copy of the key", "unchecked: offline since 12 November". A precise reason costs less trust than a vague one.
- "Refused" means the check ran and failed, or the app will not go on.
- No item is ever left without a mark. In a list, every row carries one.
- "Unchecked" must not be shown as a softer kind of "checked". It gets its own mark, its own word and its own exit code.

## 4. Design systems for small teams

**What the sources say.**

- A design system is more than a look. GOV.UK's has styles, components and patterns, and a separate style guide for words. ([GOV.UK Design System](https://design-system.service.gov.uk/), [GOV.UK A to Z of style](https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style))
- Its warning component carries the hidden word "Warning" for screen readers, so the meaning does not rest on the icon. ([GOV.UK warning text](https://design-system.service.gov.uk/components/warning-text/))
- Its error guidance asks for specific messages that say what happened and how to fix it. ([GOV.UK error message](https://design-system.service.gov.uk/components/error-message/))
- A small team can publish its voice and word list as one public page. ([Mailchimp content style guide](https://styleguide.mailchimp.com/))
- Design tokens are named decisions, such as "the colour for a warning", kept in a neutral file. Tools turn one token file into values for each platform. ([Design Tokens Community Group](https://www.designtokens.org/), [Style Dictionary](https://styledictionary.com/))
- Sharing does not need a shared runtime. The Go proverb is "A little copying is better than a little dependency." ([Go proverbs](https://go-proverbs.github.io/))
- A prose linter can hold a team to its word list. ([Vale](https://vale.sh/))

**For DubWeb:** the kit should be three plain files and one test, copied into each app.

1. The glossary: each term, its meaning, and its translation in each language.
2. The message catalogue: every sentence the apps print, by name.
3. The tokens: for each status, its word, its text mark, its symbol and its colour role. The terminal uses the word and the text mark. A graphical app later reads the same file and adds the symbol and colour. This is how one feel survives the move from terminal to window.
4. A conformance test: fixed inputs and the exact output expected. An app that passes has the feel.

Each app carries its own copy and prints the kit version in its version line. So each app works alone, and a mismatch between apps is visible.

## 5. Internationalisation

**What the sources say.**

- Keep text out of code, in catalogues. gettext is the long-standing way; it supports plural forms, a context for each message and comments for translators. ([GNU gettext manual](https://www.gnu.org/software/gettext/manual/gettext.html))
- ICU MessageFormat handles plurals and choices inside one whole sentence. Languages differ in their plural rules, so code must not build plurals by hand. ([ICU: formatting messages](https://unicode-org.github.io/icu/userguide/format_parse/messages/), [CLDR plural rules](https://cldr.unicode.org/index/cldr-spec/plural-rules))
- MessageFormat 2.0 became stable in March 2025. ([Unicode blog: CLDR 47](https://blog.unicode.org/2025/03/unicode-cldr-47-release-messageformat-2.html), [messageformat.unicode.org](https://messageformat.unicode.org/))
- Fluent is another catalogue format, built so that translators can write natural sentences. ([Project Fluent](https://projectfluent.org/))
- Never build a sentence from pieces. Word order and agreement differ between languages. ([W3C: composite messages](https://www.w3.org/International/articles/composite-messages/))
- Node.js has plural rules, dates and numbers for many languages built in. ([Node.js Intl](https://nodejs.org/api/intl.html))
- POSIX says how a program learns the user's language: `LC_ALL`, then `LC_MESSAGES`, then `LANG`. ([POSIX: environment variables](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html))
- Right-to-left text needs care. Text of unknown direction placed inside a sentence should be isolated, so it cannot reorder what is around it. ([Unicode bidirectional algorithm](https://www.unicode.org/reports/tr9/), [W3C: bidi controls](https://www.w3.org/International/questions/qa-bidi-unicode-controls))
- Direction controls can be used to deceive. "Trojan Source" showed text that reads one way to a person and another way to a machine. Look-alike letters are a related risk. ([Trojan Source](https://trojansource.codes/), [Unicode security mechanisms](https://www.unicode.org/reports/tr39/))
- Terminals differ widely in right-to-left support. ([Terminal working group: BiDi](https://terminal-wg.pages.freedesktop.org/bidi/))
- Safety signs keep their force across languages by using a small fixed set of signal words with defined meanings, and symbols that need no words. ([ANSI Z535](https://www.nema.org/standards/z535), [ISO 7010](https://www.iso.org/standard/72424.html))

**For DubWeb:**

- One catalogue per language, keyed by stable message names. Whole sentences only.
- The three status words are fixed terms, like signal words on a safety sign. Translate each once, have a native speaker review it, and record it in the glossary. A translator may not soften them.
- A warning has the same parts in every language: the status word, what happened, what to do. A translation may not drop a part.
- Machine output (`--json`) is never translated. It carries stable codes.
- Hashes, commands and file names stay left-to-right, on their own line where possible.
- Text from outside (a display name, a post) is isolated before it is printed inside a sentence, and direction controls inside it are shown or removed. Otherwise a name could rearrange a warning.
- If a message is missing in the user's language, show the English one. Never show nothing.

## 6. Local-first software

**What the sources say.**

- The Ink & Switch essay sets seven ideals: fast, on all your devices, the network is optional, collaboration, long life, privacy and security by default, and the user keeps ownership and control. ([Ink & Switch: local-first software](https://www.inkandswitch.com/essay/local-first/))
- Five years on, Kleppmann proposed a sharper test. As the researcher recalls it: no other computer being unavailable should stop you working, including the maker's own servers shutting down. ([Kleppmann, Local-First Conf 2024](https://martin.kleppmann.com/2024/05/30/local-first-conference.html))
- Later Ink & Switch work looks at access control without a central server: the rules must travel with the data. ([Keyhive](https://www.inkandswitch.com/keyhive/notebook/))
- Signed data can be checked by anyone who holds it, with no trust in the server that carried it. ([Nostr NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md), as one public example of signed events on relays)
- A signature does not show that data is fresh or complete. A server can hold back newer data, or serve an old copy. The Update Framework names these freeze and rollback attacks. ([The Update Framework: security](https://theupdateframework.io/docs/security/))

**For DubWeb:** the apps already fit the essay well: they run offline, as single files, with no account. What the essay does not cover is the gap between "the signature is good" and "this is the latest word". A relay cannot forge, but it can stay silent. So:

- Offline is a normal state, not an error. The app says "offline" once and carries on.
- Every checked result says against what and as of when: "signature checked, with the key you hold, last fetched 12 November".
- Where an answer depends on news the app may not have, such as a key being withdrawn, the honest status offline is "unchecked", with the reason.
- The app never fetches without being asked, and says so in its help.
- This note makes no claim about what the MOR texts require here. That is for the specification, and for Nobody, allegedly.

## 7. Accessibility

**What the sources say.**

- Colour must not be the only carrier of meaning. ([WCAG 1.4.1 Use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- Text needs a contrast of at least 4.5 to 1. ([WCAG 1.4.3 Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- Every symbol needs a text equivalent. ([WCAG 1.1.1 Non-text content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html))
- A status change must reach assistive technology without moving the focus. ([WCAG 4.1.3 Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- An error must be named in text. ([WCAG 3.3.1 Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- The language of the page must be declared, so a screen reader uses the right voice. ([WCAG 3.1.1 Language of page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html))
- A study of 12 developers who use screen readers found that the main problem with command-line tools is that their output is unstructured text. Tables, long output and manual pages were hard to use. ([Sampath, Merrick and Macvean, CHI 2021](https://dl.acm.org/doi/10.1145/3411764.3445544))
- The GitHub CLI team reworked prompts and progress indicators for screen readers in version 2.72.0, and documents this under `gh a11y`. ([GitHub blog, 2025](https://github.blog/engineering/user-experience/building-a-more-accessible-github-cli/))
- `NO_COLOR` gives users one switch for all tools. ([no-color.org](https://no-color.org/))

**For DubWeb:**

- The status word is always printed. The symbol and the colour are extras. A screen reader then says "checked", not "check mark" or nothing.
- The status comes first on the line, so a listener hears it before the detail.
- One record per line, or labelled lines ("From: …"). No tables drawn with box characters. No pictures made of letters.
- No spinners or redrawn lines. Print "Fetching…" and then "Done."
- All marks have a plain ASCII form, for old terminals and Braille displays.
- Respect `NO_COLOR`. With colour, keep to the terminal's basic colours so the user's own theme decides contrast.
- The same rules carry to a graphical app: text beside every icon, 4.5 to 1 contrast, status announced, language declared.

## 8. Releases and updates

**What the sources say.**

- Semantic versioning gives three numbers: major for a breaking change, minor for a new feature, patch for a fix. It also advises a release that warns of a removal before the release that removes. ([semver.org](https://semver.org/))
- A changelog is for people. Keep a Changelog groups entries as Added, Changed, Deprecated, Removed, Fixed and Security, newest first, with dates. ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/))
- A firm compatibility promise builds trust: Go promises that programs written for version 1 keep working. ([Go 1 compatibility](https://go.dev/doc/go1compat))
- A build is reproducible when anyone can rebuild the same bytes from the same source. Then a hash names a release exactly. ([reproducible-builds.org](https://reproducible-builds.org/))
- Naming a file by its hash lets the receiver check it without trusting the carrier. ([W3C Subresource Integrity](https://www.w3.org/TR/SRI/), [GNU coreutils: sha2 utilities](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html))
- Update systems must resist a server that serves old or held-back files. ([The Update Framework: security](https://theupdateframework.io/docs/security/))
- The Command Line Interface Guidelines ask tools not to contact a server without consent. ([clig.dev](https://clig.dev/))

**For DubWeb:**

- Never strand a user mid-process. Anything a person can start and finish later (a draft, a prepared act waiting for a signature) is saved with a format number. A new version reads every older format, or says clearly: "This draft was made by version 1. Finish it with version 1, or run `convert`."
- An old version never stops working by itself. No forced update, no expiry.
- No app checks for updates unless asked.
- Each changelog entry says what changed, why, and what the user must do, which is usually "nothing".
- Before announcing a release: publish it, fetch it back by its hash from the place users will fetch it, compare, and only then announce. The announcement carries the hash. A release that cannot be fetched back is not announced.
- The version line carries the release hash, so a user can compare it with the announcement.

## Draft of shared conventions

*All of this is the researcher's proposal. Names and numbers are examples to react to.*

### Command shape

```
<app> <verb> [<thing>] [--flag <value>]
```

- App names in ASCII: `kishib`, `dub`, `damgar`, `edubba`, `ummia`. The display name keeps its own spelling (Kišib). *Source: POSIX utility conventions; ASCII marks for accessibility (section 7).*
- Verbs are shared. If two apps do the same thing, they use the same verb: `show`, `check`, `list`, `read`, `help`. *Source: kubectl conventions (`<VERB> <NOUNs>`); Heroku style guide (one naming pattern).*
- Flags are lowercase words joined by hyphens. *Source: kubectl conventions; GNU long options.*
- Common flags, the same in all five apps:

| Flag | Meaning | Source |
|---|---|---|
| `-h`, `--help` | show help | clig.dev; GNU |
| `--version` | show the version line | GNU |
| `--json` | output for machines, never translated | clig.dev; Heroku |
| `--lang <code>` | choose the language; otherwise `LC_ALL`, `LC_MESSAGES`, `LANG` | POSIX environment variables |
| `--no-color` | no colour; `NO_COLOR` does the same | no-color.org |
| `--quiet` | results only | clig.dev |
| `--` | end of options | POSIX |

- Results go to standard output. Everything else goes to standard error. *Source: clig.dev; Heroku.*

### Help text

The same five parts, in the same order, in every app. *Source: clig.dev (lead with examples); plain language guidelines (short sentences).*

```
dub: a feed reader with scam marks.

Use:
  dub <verb> [<thing>] [--flag]

Examples:
  dub read feed.json
  dub check post.json

Verbs:
  read    Show a feed.
  check   Check one post.
  help    Show help for a verb.

Marks:
  [checked]    The check ran and passed.
  [unchecked]  The app cannot tell. A reason follows.
  [refused]    The check ran and failed, or the app will not go on.

More: dub help <verb>
```

The "Marks" part appears in every app's help, word for word. *Source: GOV.UK "Be consistent, not uniform"; git documents its status letters in one place.*

### The words for the three states

| State | Meaning | English | Exit code |
|---|---|---|---|
| The check ran and passed | names the check, never "safe" | **checked** | 0 |
| The app cannot tell | always with a reason | **unchecked** | 4 |
| The check ran and failed, or the app will not go on | always with a reason | **refused** | 3 |

*Sources: three separate states, as in git's `%G?` letters; every item marked, as in GitHub's vigilant mode and Pennycook and others; "checked" kept modest, after Chrome's lock icon findings; a reason with "unchecked", after van der Bles and others.*

Rules:

1. "Checked" is followed by what was checked: `[checked] signature`.
2. "Unchecked" and "refused" are followed by a colon and a reason of ten words at most.
3. No other word may stand in for these three. Not "verified", "valid", "OK", "trusted", "unknown" or "failed".
4. When one command covers several items, the exit code is the worst of them: refused, then unchecked, then checked.

Draft translations, **unchecked: no native speaker has reviewed them**:

| English | French | Italian | German | Spanish | Portuguese |
|---|---|---|---|---|---|
| checked | vérifié | verificato | geprüft | comprobado | verificado |
| unchecked | non vérifié | non verificato | ungeprüft | sin comprobar | não verificado |
| refused | refusé | rifiutato | abgelehnt | rechazado | recusado |

*Source for fixing them as terms: ANSI Z535 signal words; ASD-STE100 (one word, one meaning).*

### Marks

| State | Text mark (always) | Symbol (optional) | Colour role (optional) |
|---|---|---|---|
| checked | `[checked]` | ✓ | none, or the terminal's green |
| unchecked | `[unchecked]` | ? | the terminal's yellow |
| refused | `[refused]` | ✗ | the terminal's red |

- The text mark is first on the line. *Source: Sampath and others (structure for screen readers); WCAG 1.1.1.*
- Colour never appears without the word. *Source: WCAG 1.4.1.*
- "Checked" is the quietest of the three. *Source: Chromium blog 2018 and 2023.*
- The table lives in the kit's token file, so a graphical app reads the same values. *Source: Design Tokens Community Group.*

### Errors

Shape, on standard error:

```
<app>: <what happened>. <why, if known>.
  Try: <one thing to do>
  (<message name>)
```

Example:

```
dub: cannot read "feed.json". The file is not there.
  Try: dub read <file>
  (dub.read.no-file)
```

- Program name and colon first. *Source: GNU errors.*
- What happened, then what to do. *Source: clig.dev; GOV.UK error message.*
- No blame, no "invalid", no "illegal". *Source: GOV.UK error message; plain language guidelines.*
- The message name in brackets is the same in every language, so a user can search for it and a helper can read it. *Source: gettext message context; this use is the researcher's suggestion.*
- Exit codes, the same in all five apps. *Source: gh exit codes (one table for the whole tool); POSIX grep (a three-way answer).*

| Code | Meaning |
|---|---|
| 0 | done; everything checked |
| 1 | the app failed (a fault, a missing file) |
| 2 | the command was not understood |
| 3 | refused |
| 4 | unchecked |

### Version line

```
dub 1.4.0 (DubWeb kit 3)
release sha256:<hash>
languages: en fr it de es pt
```

- First line: name and version. *Source: GNU --version.*
- Three-part version number. *Source: semver.org.*
- Kit version, so two apps can be compared. *Source: section 4, the researcher's suggestion.*
- Release hash, to compare with the announcement. *Source: reproducible-builds.org; W3C Subresource Integrity.*

## Open questions

1. **The words in six languages.** Is "non vérifié" read as "the app could not tell", or as "it was checked and failed"? Each language needs a native reader and a small test. Who will review them?
2. **Is three enough?** "Unchecked" covers "offline", "no key held" and "this app does not know that kind of thing". The reason line separates them. Would users want separate words?
3. **Checked what?** "Checked" may cover several checks (signature, key still in use, date). If only some passed, is the item "checked" with a list, or "unchecked"? This touches protocol rules, so it is a question for Nobody, allegedly, and the specification, not for this note.
4. **Exit codes 3 and 4.** They break the common habit that anything other than 0 is "failed". Is the gain in clarity worth it for scripts?
5. **Right-to-left languages.** None of the six languages named is right-to-left. Should the conventions be tested with Arabic or Hebrew now, or when a seventh language is added?
6. **One kit, copied five times.** How is a kit change rolled out so that a user with a new Dub and an old Damgar still sees one feel? Is a mismatch shown to the user?
7. **Staleness.** After how long offline should "checked" become "unchecked"? Or should the app only show the date and let the person judge?
8. **The graphical version.** Do the text marks stay visible beside the icons, or only for screen readers? The research on badges suggests keeping the word visible.
9. **Sources.** Most links below could not be opened in this session. Should a later session, with network access, check them before this note is relied on?

## Sources, and how far each was checked

**Checked** means: found through web search in this session, and the search result agreed with the claim made here. The page itself was opened in one case only (kubectl conventions). **Unchecked** means: cited from the researcher's memory; the link was not opened and may have moved.

Checked:

- kubectl conventions: <https://github.com/kubernetes/community/blob/master/contributors/devel/sig-cli/kubectl-conventions.md> (page opened; both quotations confirmed)
- gh exit codes: <https://cli.github.com/manual/gh_help_exit-codes>
- Writing for GOV.UK (reading age of 9; experts and plain English): <https://www.gov.uk/guidance/content-design/writing-for-gov-uk>
- Plain language guides at digital.gov (exist, adapted from plainlanguage.gov): <https://digital.gov/guides/plain-language>
- van der Bles and others, PNAS 2020: <https://www.pnas.org/doi/10.1073/pnas.1913678117>
- Pennycook, Bear, Collins and Rand, Management Science 2020: <https://doi.org/10.1287/mnsc.2019.3478>
- Chromium blog 2023, the lock icon (the 11% figure, through secondary reports): <https://blog.chromium.org/2023/05/an-update-on-lock-icon.html>
- Chromium blog 2018, security indicators (through secondary reports): <https://blog.chromium.org/2018/05/evolving-chromes-security-indicators.html>
- Thompson and others, USENIX Security 2019: <https://www.usenix.org/conference/usenixsecurity19/presentation/thompson>
- Unicode blog, CLDR 47, MessageFormat 2.0 stable: <https://blog.unicode.org/2025/03/unicode-cldr-47-release-messageformat-2.html>
- Ink & Switch, local-first software (authors, 2019; four of the seven ideals confirmed word for word, the others in summary): <https://www.inkandswitch.com/essay/local-first/>
- Kleppmann, Local-First Conf 2024 (the talk and page exist; the wording of the definition is **unchecked**): <https://martin.kleppmann.com/2024/05/30/local-first-conference.html>
- Ink & Switch, Keyhive: <https://www.inkandswitch.com/keyhive/notebook/>
- Sampath, Merrick and Macvean, CHI 2021: <https://dl.acm.org/doi/10.1145/3411764.3445544>
- GitHub blog, a more accessible GitHub CLI (version 2.72.0, `gh a11y`): <https://github.blog/engineering/user-experience/building-a-more-accessible-github-cli/>

Unchecked:

- <https://clig.dev/>
- <https://no-color.org/>
- <https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html>
- <https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html>
- <https://pubs.opengroup.org/onlinepubs/9699919799/utilities/grep.html>
- <https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html>
- <https://www.gnu.org/prep/standards/html_node/_002d_002dversion.html>
- <https://www.gnu.org/prep/standards/html_node/Errors.html>
- <https://devcenter.heroku.com/articles/cli-style-guide>
- <https://git-scm.com/docs/gitcli>
- <https://git-scm.com/docs/git-status>
- <https://git-scm.com/docs/pretty-formats>
- <https://www.gov.uk/guidance/government-design-principles>
- <https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/>
- <https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style>
- <https://www.plainlanguage.gov/guidelines/> (search results disagree on whether this site still serves the guidelines)
- <https://www.iso.org/standard/78907.html>
- <https://developers.google.com/style/translation>
- <https://learn.microsoft.com/en-us/style-guide/global-communications/>
- <https://www.asd-ste100.org/>
- <https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html>
- <https://royalsocietypublishing.org/doi/10.1098/rsos.181870>
- <https://dl.acm.org/doi/10.1145/2702123.2702442>
- <https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe>
- <https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits>
- <https://www.gnupg.org/gph/en/manual.html>
- <https://schema.org/ClaimReview>
- <https://design-system.service.gov.uk/>
- <https://design-system.service.gov.uk/components/warning-text/>
- <https://design-system.service.gov.uk/components/error-message/>
- <https://styleguide.mailchimp.com/>
- <https://www.designtokens.org/>
- <https://styledictionary.com/>
- <https://go-proverbs.github.io/>
- <https://vale.sh/>
- <https://www.gnu.org/software/gettext/manual/gettext.html>
- <https://unicode-org.github.io/icu/userguide/format_parse/messages/>
- <https://cldr.unicode.org/index/cldr-spec/plural-rules>
- <https://messageformat.unicode.org/>
- <https://projectfluent.org/>
- <https://www.w3.org/International/articles/composite-messages/>
- <https://nodejs.org/api/intl.html> (the link answered; the content was not read)
- <https://www.unicode.org/reports/tr9/>
- <https://www.w3.org/International/questions/qa-bidi-unicode-controls>
- <https://trojansource.codes/>
- <https://www.unicode.org/reports/tr39/>
- <https://terminal-wg.pages.freedesktop.org/bidi/>
- <https://www.nema.org/standards/z535>
- <https://www.iso.org/standard/72424.html>
- <https://github.com/nostr-protocol/nips/blob/master/01.md>
- <https://theupdateframework.io/docs/security/>
- <https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html>
- <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- <https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html>
- <https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html>
- <https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html>
- <https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html>
- <https://semver.org/>
- <https://keepachangelog.com/en/1.1.0/>
- <https://go.dev/doc/go1compat>
- <https://reproducible-builds.org/>
- <https://www.w3.org/TR/SRI/>
- <https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html>

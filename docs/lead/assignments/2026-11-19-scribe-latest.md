To the scribe, from the MOR lead (Machine, allegedly), relayed by Nobody, allegedly. One housekeeping session, overnight. No rule text changes: files move and links follow them, nothing more.

**His words, quoted from the ledger** (`docs/decisions.md`, branch `claude/lead-records-2`, "LATEST"): "We should always label the current version LATEST" Then, to the choices: "À plus B ?" And: "Yes, please do write it"

**Why, in my wording:** I read Money draft 9 as the current one while drafts 10 to 14 sat beside it, because a file listing sorted "draft-9" after "draft-14". `spec/README.md` already listed draft 14 as current; nobody had to open it.

## The task, on one branch from main

1. **Label.** In `spec/README.md`, head the table of current drafts "LATEST". Each text has exactly one LATEST row. Check every row against the files and the MICS's own list of what it names; if they disagree, change nothing and report it.
2. **Archive.** Move every version of every core text that is not LATEST from `spec/` into `spec/archive/`, with `git mv`, keeping the file names. This covers the MIRs, the old MIP files, the MICS and core documents, and the freeze test suite. Files in `spec/` that are not versions of a core text (`test-vectors.json`, `README.md` and any like them) stay where they are. In `spec/README.md`, the earlier drafts' table points into `spec/archive/`.
3. **Links.** Every link or path in the repository that points at a moved file is rewritten to its new path, and nothing else in that document changes. Do not edit `docs/decisions.md` except as below: list any path in it that pointed at a moved file, and leave it as it is. Report the count of links rewritten, by folder.
4. **Code that names files.** Check every script, test and verifier that names a file under `spec/` (at least `core/tests/spec_texts.rs`, `verifier2/agreements_endings.py`, `verifier2/README.md`, `scripts/mip-remaining.py`). The core's own test picks the newest file of each text under `spec/`; confirm it still picks the LATEST. If anything else would break, point it at the new path, and say what you changed.
5. **The reading rule.** Add one line to `CLAUDE.md`, beside the line on `docs/state-of-mor.md`: "The current version of every core text is the one marked LATEST in `spec/README.md`; older versions are in `spec/archive/`. Read it before citing any text."
6. **CI green.** Run the tests and the CI's checks yourself, and report the result with its link. Regenerated vectors must be unchanged.

Branch `claude/spec-latest`, a pull request, no merge. Never write the author's personal name; write "Nobody, allegedly". No server addresses, onion addresses or keys. Report to me short: what moved, what links changed, what code changed, CI's result, and anything that did not fit.

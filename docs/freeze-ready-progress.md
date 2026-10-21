# Freeze-ready texts: progress

*Kept by the freeze-ready texts session (S1, `docs/lead/prompts/s1-freeze-ready-texts.md`). If this session stops, the next one starts here. Branch: `claude/freeze-ready-texts`.*

## Where we are

| Text | New file | State |
| --- | --- | --- |
| Identity draft 15 | `spec/MIR-identity-draft-15.md` | Written, committed; stranger's reading running |
| Text draft 11 | `spec/MIR-text-draft-11.md` | Written; to commit |
| Envelopes draft 11 | — | Next |
| Money draft 11 | — | |
| Agreements draft 17 | — | |
| Development draft 11 | — | |
| MICS v30 | — | |
| Freeze test suite v30 | — | |
| `spec/README.md` | — | At the end |
| Report | `docs/freeze-ready-drafts-report.md` | At the end |

## How each text is made

1. Read the current draft in full, by parts.
2. A mechanical pass (a script in the session's scratchpad): drops "(was N)", finding numbers and review labels inside parentheticals, "new in draft N" marks; lists every line still carrying a history word.
3. A hand pass over every listed line and the whole text: header to one line, "How to read" rewritten, old-to-new tables dropped, history sentences rewritten as plain commentary or dropped, cross-references checked, decisions written in.
4. The provenance map regenerated from the old draft (`docs/freeze-provenance.md`).
5. A stranger's reading by a subagent with no access to `docs/`, findings or code.
6. Commit.

## Questions so far (for the report)

1. **Identity: how a home is queried** is still marked open (request and response formats for a chain, receipts, routes, names, links). Kept open in the text; question in the report.
2. **Text: the pinned Unicode version.** The definition says "Unicode 17.0 as of this draft"; the rule says the latest version at the freeze. The frozen text must name one version. Kept as it was; question in the report.

## Wording fixes taken (for the report)

- Identity: header to one line; "How to read" rewritten; marks for drafts dropped; old-to-new table dropped; "(Agreements round 2)", "round 2's standard", "as it does today", "no longer costs", "Receipts were closed for this in round 2", "Written in by the build (code after step 15, part 1), as readings of this paragraph", the author's quotes in "Written for people", "the identity carry Module", "existed in draft 6", "today", "exactly as before", "as before", "unchanged" rewritten; "Envelopes draft 10, rule 30" to "Envelopes rule 30"; keeper record pointer to Agreements rule 42; the efficient kept-ancestry proof said "not in MOR 1" (the text already said so); the MIR's hash "fixed at the freeze"; freeze scenarios name suite v30.
- Text: header; "How to read" rewritten; old-to-new table dropped; rule 14's "save one case… And one more case" written as "save two cases"; the quoted decisions dropped; freeze scenarios name suite v30.

## To check later

- Identity's freeze scenarios cite suite steps (5.7e, 5.7f, 5.7g, 5.5c, 5.8b, 8.4, 3.9aa): check against suite v30.
- Text's "a component under 'Envelopes and Text'": check the suite has that heading.
- Identity rule 34 and the keeper record: when Agreements 17's keeper section is written, check the pointer "(Agreements: the keeper record, and rule 42)".
- Identity's "encrypted form of private links": dropped from "still open" since Envelopes defines private acts and sealed containers; confirm when reading Envelopes.

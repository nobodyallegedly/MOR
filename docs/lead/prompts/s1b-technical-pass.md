The technical pass on MOR's freeze-ready texts, in the MOR repository (`nobodyallegedly/MOR`). Texts only: no code changes in this session (the next session aligns the code).

**What this is for.** The freeze-ready texts (pull request 83, branch `claude/freeze-ready-texts`) are clean, but their stranger's readings found formats never written and questions now decided. A verifier in C will be built from these eight texts alone, with nobody to ask. Every act it must decode needs its exact format in the texts; every verdict it must give needs one rule. This pass makes that true.

**Read first, yourself:** `CLAUDE.md`; `docs/state-of-mor.md`; `docs/lead/workbook.md`; `docs/lead/s1-questions.md`; the findings F363 to F369 at the top of `docs/findings/MOR-findings-log-round-2.md`, each in full; the S1 report `docs/freeze-ready-drafts-report.md` and the strangers' files `docs/freeze-ready-strangers/`; then the freeze-ready drafts on that branch: Identity 15, Text 11, Envelopes 11, Money 11, Agreements 17, Development 11, MICS v30, the freeze test suite v30. Work by part; never trust a summary.

**Where you work.** On the branch `claude/freeze-ready-texts` itself, amending the freeze-ready drafts in place: they are not yet approved, so no new draft numbers. Commit after each text. Update the provenance map (`docs/freeze-provenance.md`) and the glossary as you go. Keep a progress file, `docs/technical-pass-progress.md`, so a next session can start from it.

**Part 1. The decisions to write in** (the finding decides; this list only points):
- **F363:** a keeper record counts for an act that belongs to an agreement naming the keeper; "belongs to" defined once (names it in `objects`, or through the act it answers: a receipt through its claim, a claim or payment through its agreement field). Agreements rules 42 and 7.
- **F364:** a deadline met shown by an anchor of the act; missed only by a keeper's anchored sequence holding no record of it; a keeper's own later rotation never undoes what its records placed (Identity's evidence rule names the exception, in Agreements' words); several keepers; one sequence per keeper; a deal with no keeper.
- **F365:** an act under a revoked grant shown disputed confers nothing on an agreement chain and is shown; the grantor may adopt it; every "void" for an act a revocation does not hold says "void, or disputed under rule 76".
- **F366:** Money rule 7 lists every Money act a member key may sign; when a member key counts and stops; Text rule 14's grant-key case decides.
- **F367:** questions 4, 5, 9, 22, 37 (second half), 44, 45, 49, 51 as decided there.
- **F368:** the wording points and readings as S1 leaned; remove the "to confirm" marks they cover.

**Part 2. The formats** (F369; S1's questions 1, 2, 3, 8, 12, 13, 14, 16, 17, 34, 38, 54):
- Read how the core library builds each format (`core/src/`, its tests and `core/vectors/`), and write it into the text precisely: field numbers, types, lengths, which fields are required, how a decoder treats unknown or duplicate keys. The published vectors are fixed: a text must agree with them.
- Where the code and a decided rule disagree, do not choose: a question (below).
- Where neither code nor text has a format (the unit specification kind and the signature-scheme specification kind, if so), propose one in the text's style, marked in the report as proposed, with its reasoning.
- How a home is queried and how deliveries are found leave the core for the relay transport cMIP; the core keeps only what a verifier checks of a proof it is handed, in an encoding it fixes.

**Part 3. A stranger's reading again**, by a subagent with no access to `docs/`, the findings or the code, over every part you changed, then once over all eight: what it cannot decode, check or understand from the texts alone. Fix what is wording; list the rest.

**Questions.** When a format or a decision cannot be written without changing a verdict no finding decided, write the question in plain words first, then precisely, with options, your lean and each option's cost; leave the text as it stands there; go on. If a MIR shows a flaw at its foundations, stop and say so first.

**Do not:** change a rule beyond the findings named here; touch code, tests or vectors; write any finding number, review label or history into the eight texts; rename cMIPs or Modules.

**Report:** `docs/technical-pass-report.md`: plain words first (what a verifier in C can now decode and judge that it could not before; what is still missing, if anything), then precisely, text by text; the questions; the stranger's readings. Add to pull request 83's description what this pass did.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Do not merge.

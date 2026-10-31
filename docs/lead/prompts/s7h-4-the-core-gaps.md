The redesign's core gaps closed, on S7h's branch, in the MOR repository (`nobodyallegedly/MOR`): **on `claude/s7h-the-redesign` (pull request 113), continuing S7h, S7h-2 and S7h-3**, while the Dubsar Suite's round works on the same branch. The core brought to the texts where they are clear and it lags, and the 17 skipped core tests made to pass.

**Read first, yourself:** `CLAUDE.md`; `docs/s7h-3-report.md` ("Questions" and "Still open from S7h-2, in the core") and `docs/s7h-2-report.md`; in `docs/findings/MOR-findings-log-round-2.md` on `claude/lead-records`, **F406** (how each is decided) and F405; the texts on this branch, which are the specification.

**The suite works on this branch at the same time** (the cMIPs, the apps, Nakišib). **Touch only `core/`, `wasm/` (where a binding's shape must follow), `spec/` (rule 64.3 only, below) and `docs/`**; nothing in `cmips/`, `modules/`, `clients/` or `built/`. Pull before each push and rebase on what the suite pushed; never force-push. **Your work changes the WebAssembly: the suite rebuilds its releases only after you push your last commit, so say plainly in the report's first line when you are done.**

**1. The decisions (F406):**
- Q1: a sale before a price tag's withdrawal settled as a push rail settles an ending: a receipt the split service records after the withdrawal is in its history is no sale (`publishing.rs`'s purchase check). Vectors.
- Q2: Identity rule 49 as written: one valid objection from a live home voids a person's homeless rotation. Add scenario 9.5's vector.
- Q3: rule 83 is plain: add the stake (field 7) to rule 64.3's list of what a plan-marked clone may change, in the text and the core, so scenario 9.3's "their share to two children" passes in the automatic clone. Vectors.
- Q4: a plan's clone changes a layer's rule (field 19) only by putting the successor in the departing party's place; the core refuses any other change there.
- Q7: `after_closing` reads the collective an act names, not its signer.

**2. The 17 skipped tests in `core/tests/agreements_collective.rs`:** rule 93 for publications (12: a payment under a publication the collective signed during a broken stretch, owed back); rule 48 on a split agreement's versions (1); the owners' matters on a collective's split agreement (4). Build what the texts say; restore each test; where a test's expectation and the text differ, the text is right unless unclear, then a question.

**Vectors:** every earlier case keeps its verdict, acts and ids unless this session's decision is exactly that case: say which and why. Both READMEs and `scripts/c-box/vectors-README.md` (bring it level with `core/vectors/README.md`, S7h-3's bullet included); the Python check passes.

**For the Dubsar Suite:** in `wasm/README.md`, any binding change, old shape first, and any verdict an app may see change.

**Questions:** plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F408**; do not take another.

**Report:** `docs/s7h-4-report.md`, short, its first line saying whether you are done (the suite's signal to rebuild): the decisions built, the tests restored, verdicts moved, vectors added, binding changes, questions, `scripts/c-box/make-c-box.sh` into a scratch folder refusing nothing, Rust and vector checks green (the suite's red is theirs).

**Do not:** change any rule beyond these decisions; write any finding number, review label or history into the eight texts.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Push to `claude/s7h-the-redesign`; do not merge.

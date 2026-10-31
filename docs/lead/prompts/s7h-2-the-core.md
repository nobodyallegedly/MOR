The redesign's core, finished, in the MOR repository (`nobodyallegedly/MOR`), **on S7h's branch `claude/s7h-the-redesign` (pull request 113), continuing it**: the core brought to the eight texts S7h rewrote. The largest code session yet: work in the order below, commit at each clean point with every Rust test and both vector checks passing, and if you must stop, stop at one and say what remains.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md` ("Before merging a session's work"); **`docs/s7h-report.md` in full** (what is done, what remains, in order, and its 32 questions); in `docs/findings/MOR-findings-log-round-2.md` on the branch `claude/lead-records`, **F404** (how each question is decided) and F402, F401; `docs/design/bake-to-publication.md`; then the texts on this branch, which are the specification: where the core and a text differ, the text is right unless it is unclear, and then it is a question.

**Why one branch** (Nobody, allegedly: "Core has priority until everything is been updated"): the texts, the core and the apps arrive on main together, once, all green. You build the core; the Dubsar Suite's round then moves the apps on this same branch; then one merge.

**The work, S7h's "What remains", in its order:**
1. **The publication (type 6)**, replacing the standing offer and terms fields 8, 14, 28 and 29: split by its split service, backups in fields 11 and 12, partners as maps; the view's offer, purchase, split, pointer and cut checks, service accounts and turns moved to it, and their tests.
2. **The ownership agreement's target (field 33) and one stake; shares by reference:** the receipt's field 9 as `[ownership agreement, version]`, the version in force read from its history, wrong receipts.
3. **Purchases by price tag under a publication:** the tag counting under it; the request-rail commitment and push-rail settlement by the split service; a payment racing the ending owed back by the service, then the parties; a tip through a publication; a Money-only wallet refusing to tip a bake naming a collective (Q13: write the one sentence in Money, as F404 decides).
4. **The keyless collective:** field 19 as a map by layer, field 34 for finer areas, mark power `[6, layer]`; acts for a collective named in `objects`, signed by members; records drawn by any member; no member key, a collective's grants with no grant key; the line's history read on the collective's chain.
5. **The keyless genesis and rotation** (Identity rule 1): `Genesis::signing_key`, `Rotation::signing_key` and the chain state's key optional for a collective. **You may change `modules/airgap`** so the air-gapped signer learns keyless rotations (F404, Q30); keep its own tests green and say what changed for Nakišib.
6. **Vectors** for every new rule and each of scenario 9's walks, as acts; both READMEs' "What changed since the previous edition"; the Python check.

**Five of S7h's questions, decided after Fable (F404; `docs/reviews/fable-s7h-five.md` on `claude/fable-s7h-five`, pull request 114, whose sentences you write into the texts as well as the core):** Q2 and Q3 as S7h wrote them, with Fable's sentence for Q3 (an act for the collective is placed on its line only where a later act for it cites it; one nothing cites counts for nothing; a client acting for a collective cites every head it holds); **Q4: a record puts a membership clone in force; a rotation only where the key grammar changes or a party holding the key or a share of it leaves** (Fable's sentence for rule 69); **Q14: for a collective, the homeless rotation signed by its chain key is its own escape endorsement** (section 11 steps 1, 2 and 5, not 3 and 4; Identity decides it from its own data; the stated cost that an old home's objection never voids it); **Q24: "holds nothing" applies the complete transfers the closing's history cites, as rule 10 counts them** (Fable's sentence). Carry Fable's review into `docs/reviews/` on this branch.

**Also allowed** (F404, Q31): regenerate `clients/desk/src/core-types.ts` from the core's tables and give `clients/desk/src/kinds.ts` words for the new types. Nothing else in `clients/` or `cmips/`: the apps are the suite's round, after you.

**Verdicts:** where one moves, say which and why; every unmoved case keeps its acts and ids where its acts did not change.

**For the Dubsar Suite:** in `wasm/README.md`, every binding change with old and new names and shapes, and **a list of every client test that fails because of the core, with the reason**, so the suite's round can start from it. Do not rebuild the web releases or merge main: the suite's round does that last.

**A stranger's reading:** a subagent limited to the eight texts reads the cases you add for scenario 9 and says whether the texts give the verdict the core gives.

**Questions:** plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F405**; do not take another.

**Report:** `docs/s7h-2-report.md`, short: each step, the verdicts moved, the vectors added, `modules/airgap`, "For the Dubsar Suite" with the failing client tests, the questions, the stranger's reading, `scripts/c-box/make-c-box.sh` run into a scratch folder refusing nothing, CI checked yourself (Rust and vectors green; the apps' red expected and listed).

**Do not:** change any rule beyond the decisions; change a text save where building shows the text and a decision differ, said in the report; write any finding number, review label or history into the eight texts.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on `claude/s7h-the-redesign`; push to it; do not merge.

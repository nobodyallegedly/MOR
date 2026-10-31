The redesign's last text points, on S7h's branch, in the MOR repository (`nobodyallegedly/MOR`): **on `claude/s7h-the-redesign` (pull request 113), continuing S7h and S7h-2**, alongside the Dubsar Suite's round on the same branch. A short session: the six decisions on S7h-2's questions written into the texts, scenario 9 made to agree with the MIRs, and the second verifier's export ported.

**Read first, yourself:** `CLAUDE.md`; `docs/s7h-2-report.md` ("Questions" and "What remains"); in `docs/findings/MOR-findings-log-round-2.md` on `claude/lead-records`, **F405** (how each is decided); the texts on this branch.

**The suite works on this branch at the same time** (the cMIPs, the apps, Nakišib, the web releases). **Touch only `spec/`, `core/` (tests, vectors and the second verifier) and `docs/`**; nothing in `cmips/`, `modules/`, `clients/`, `wasm/` or `built/`. Pull before each push and rebase on what the suite pushed; never force-push. If a change of yours would change the WebAssembly or a binding's answer, stop and say so: the suite rebuilds against it.

**1. The decisions (F405), written into the texts, each with its vector where a verdict turns on it:**
- Q1: a vow no ownership agreement claims: the publication's drafter is the owners' side; the cost stated (a vow's owner unpaid unless a partner); rule 14 and its "No owner" bullet made to agree.
- Q2: a payment racing an ending is owed back on the owners' line by each holder paid, their own payout: one sentence in rules 11 and 30.
- Q3: rule 58's two sentences: the first decides consent; the second only what an ending's or record's line holds. One sentence saying so.
- Q4: a succession plan's clone may put the successor into a field 19 rule naming the departing member, as it may in field 34 (rules 64 and 83).
- Q5: a sale before a price tag's withdrawal is the payment naming the earlier, priced version, under rule 12's push-rail test.

**2. Scenario 9 made to agree with the MIRs** (Q6): 9.5 (a person's homeless rotation under objection stays pending while the old home lives; the collective's rotation is its own endorsement, no member signs one); 9.1 (the transfer names the ownership agreement); 9.2 (name a key grammar that keeps rule 59); 9.7 (say what checking a crossing means, or drop the claim). The stranger's smaller points: case 5 (whether the split cites the transfer), case 16 (the declaration's outcome 0), case 17 (rule 64.3 and field 7 against rule 83): settle each where the text is clear, or a question. Add the 9.5 case to the vectors once it agrees.

**3. The second verifier's export** (`verifier2/export/export.rs`) ported from the draft 10 model to the keyless collective; its tests restored to `core/tests/agreements_invariants.rs`.

**Vectors:** every earlier case keeps its verdict, its acts and its ids unless this session's decision is exactly that case: say which and why. Both READMEs; the Python check passes.

**A stranger's reading:** a subagent limited to the eight texts reads each changed sentence and scenario 9 whole, and says whether they read as one story with the rules.

**Questions:** plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F406**; do not take another.

**Report:** `docs/s7h-3-report.md`, short: the sentences written, scenario 9, the export, vectors, the stranger's reading, questions, `scripts/c-box/make-c-box.sh` into a scratch folder refusing nothing, Rust and vector checks green (the suite's red is theirs).

**Do not:** change any rule beyond these decisions; write any finding number, review label or history into the eight texts.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Push to `claude/s7h-the-redesign`; do not merge.

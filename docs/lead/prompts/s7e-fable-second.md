Fable's second review written in (F389), in the MOR repository (`nobodyallegedly/MOR`): a few sentences in the texts, two changes in the core, the vectors for the rules only one implementation has built, and the web releases. A medium session.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md` ("Before merging a session's work", "After the box"); F389 at the top of `docs/findings/MOR-findings-log-round-2.md` (on the branch `claude/lead-records` until the next records push: `git show origin/claude/lead-records:docs/findings/MOR-findings-log-round-2.md`), and F363 for "belongs to"; Fable's review, `docs/reviews/fable-second-review.md` on the branch `claude/fable-second-review` (pull request 102), in full: it gives each sentence, where it goes, and each vector.

**The texts** (Fable's sentences, in the texts' voice; one line each under "After the box" in the workbook):
- Agreements, "Belongs to" (line 98): a step is every `objects` entry, chain and predecessor alike, and each act answered, whatever the act named is, save an identity's genesis, rotations and Identity everyday acts (Q55).
- Agreements line 105: "predecessors" (Q56).
- Agreements rule 13 or Money rule 8, whichever reads better: a receipt or claim whose verification answer is not valid is no purchase and no sale; pending or not held, unknown (Q53).
- Money rule 12: a pair is counted between payments, never between records (Q52).
- Identity, the order of the stop reasons: the principle sentence says "what no objection can undo", or becomes italic (S7c question 1).
- The freeze test suite: one line saying its verdict questions are the list of answers Money rule 12 means (S7c question 3).
- Agreements, "A contest of a purchase": *Client conformance: where the offer the buyer paid names a vow, the buyer's client names the vow in the contest, so that the sale is marked* (S7d question 3).
- Agreements, Signature (type 1)'s field 0 comment: "or the offer it signs onto (rule 13)"; rule 12's opening: the carve-out for a payment following a lone seller's offer (rule 11; Money rule 18), and, if it reads well, one italic line that the lone seller's buyer is already a party with standing (the older points).

**The core:**
- `belongs_into` follows every `objects` entry and each act answered, as the sentence says (Q55). Check that every existing vector keeps its verdict; if one moves, stop and say why before going on.
- Sales and purchases fail closed (Q53): a claim or receipt counts toward a sale or a purchase only with a valid verification answer; pending or not held, the answer is unknown. Find every path that reads `rail_invalid` for this and read it as "not valid" instead.
- Nothing else moves.

**The vectors** (Fable's list, from the Rust side, each with its rule): Q55 (a party's contest naming an obligation of a deal, recorded by a keeper: placed under the deal's keepers); Q53 (a vow's sale whose claim has no verification answer: unknown); Q57 (a record whose named signatures fall short of the clone's mark: not in force; a record naming a clone whose parent is not in force: not in force); Q58 (a collective's closing signed by every remaining member after a registered resignation: complete; a closing under a share-counted rule: decided); Q60 (a settlement omitting a tip in its history: counts nothing; a judge's two first settlements keeping different versions: the next link active); Q61 (an outer deal whose party is an inner deal, forked and unsettled: the reference's parties sign); Q62 (a private link after a move of homes: found at the binding's home, valid; found only at the new home, unknown); Q64 (two final homeless rotations at one position with an objection whose status cannot be told: contested). Where Fable's expected verdict is not what the core gives, do not change the core to fit it: write it as a question. The generator cites rules as the texts number them (Q50): no "47a", "34a", "10a". Every earlier case keeps its verdict; the act ids change only where Q50 or a new act requires. Both READMEs updated, with "What changed since the previous edition". The Python check passes.

**The web releases:** this changes `core/` and the WebAssembly. Before the pull request is ready, merge main (round 4 may have merged by then), rebuild every web release that carries the core (the display client, Dub, Kišib, Damgar, Ummia, Edubba) as their READMEs say, and be green on GitHub, the reproducible display client included.

**A stranger's reading:** a subagent limited to the eight texts reads what you changed and says what it cannot follow.

**Questions** go to Fable before they are decided: write each in plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F390**; do not take another.

**The apps share this core:** under "For the Dubsar Suite", list any change to the WebAssembly interface, and **every** binding function whose answer can now be unknown for a sale or a purchase (Q53; and any whose answer moves with Q55), with whether its error or its result shape changes (a new throw, an entry marked unknown, a field added). The suite reads sales in Dub, Edubba (Sales; Vows, Track), Damgar (Account) and the split service: name the functions, not the apps, and say for each which inputs (for example `railValid` or `railPayments`) avoid the unknown.

**Report:** `docs/s7e-report.md`, short: what changed, the questions, the stranger's reading, the releases rebuilt, `scripts/c-box/make-c-box.sh` run into a scratch folder refusing nothing, CI checked yourself.

**Do not:** change a rule beyond F389; write any finding number, review label or history into the eight texts.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on a branch `claude/s7e-fable-second` from main; open a pull request; do not merge.

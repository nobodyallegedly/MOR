**Current wish** (Nobody, allegedly, `docs/decisions.md` on branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions."

Clean-up before the players' round, in the MOR repository (`nobodyallegedly/MOR`): a small draft 25 and an encoding 2 built from it, so that the players are briefed on a text and bytes where two honest writers cannot write the same act two ways. Start a branch `claude/agreements-clean-1` from `claude/agreements-encoding-1-nwgiyk` (pull request 179). Nobody, allegedly, chose to clean up first ("We can always provide new hashes").

**Read first, yourself:** `CLAUDE.md`; `docs/agreements-from-scratch/draft-24.md` and `reasons-24.md`; `encoding-1.md` and `encoding-1-report.md` (its 18 questions); Fable's review, `docs/reviews/fable-encoding-1.md` (branch `claude/fable-encoding-1`), in full; `docs/lead/proposals/report-block-3.md` (branch `claude/agreements-draft-20`); the module `core/src/agreements_new/`, the binding `wasm/src/agreements_new_js.rs`, `tools/agreements-check` and `core/vectors/agreements-new/`; then, for the act around the payload, Envelopes and Identity on main as `encoding-1.md` cites them. **Do not open** the old Agreements MIR, `core/src/agreements/`, `docs/findings/`, `docs/agreements-inventory/` or `docs/agreements-marking/`.

**Who decides what.** Every choice below is the MOR lead's, as technical wording; none changes anything Nobody, allegedly, decided (`docs/decisions.md`). If a fix turns out to change a rule he decided, stop on that one, list it for him, and go on with the rest.

**Part A. Draft 25:** draft 24 with these changes, nothing else.
1. **An unknown field is rejected** (report question 1). Section 3 and G2.2 stop saying a field is "left unread"; G2.2 keeps "left unread" only for what it is still true of, and says which.
2. **A resolving update carries nothing else** (question 2, Fable "otherwise"). A Terms act written as a resolving update that also carries `parties`, `authors` or `body` is rejected; say what a resolving update must carry (`replaces`, `agreement`, `resolves`, `continues`), as the vectors already do (question 14).
3. **The resolving Statement in a signer's line** (question 15). It is a Statement of one kind of its own, **resolve**, carrying `resolves` and `continues` and nothing that makes it also an assent, a counter signature or a contest. Say how a power of kind `resolves` matches it.
4. **Payment or settlement** (question 16). Wherever a call, a confirmation, a tie between two halves or a buyer's contest names a payment, it names the **settlement**: the act both sides can see. Rework G11.7, G11.8 and the report block's use to match; publish the block again as `report-block-4.md` with only that change, marked as the MOR lead's.
5. **The receiver** (question 5; Fable section 1, item 1). A party is named as receiver by its position among the parties; an agreement, party or not, by its root; the two are told apart in the bytes, not by guessing. A position that names an entry which is an agreement is rejected, with a sentence saying to name it by its root.
6. **Two powers of one kind** (question 4): any one of their rules saying yes is enough. Write the sentence.
7. **A held act that cannot be opened** (question 8): G6.1's answer is **unchecked**, not invalid. Write the sentence.
8. **The order of the cases of invalid**, and **one fault under two rules** (Fable section 1, "Where the text reads two ways"): make the order one order, matching what the code does, and say which single rule a fault that fits two is answered under.
9. **The spec hash, said aloud** (question 12): the hash is of the file as published on its branch; acts under it stay that text's; a later draft is a new specification.
10. **The other report questions** (3, 6, 7, 9, 10, 11, 13, 17, 18): as the report leans and Fable agrees; write each where a builder meets it.
11. **An author's assent and its `previous`** (Fable section 3): read G6.1 against the vectors' author assent with `previous` `[]`. If it forks the signer's own line, the fix is in the vectors and in a sentence of section 3 (an author who wrote the Terms names them in `previous`), not in the rule.

Housekeeping as before: `draft-25.md`, `reasons-25.md`, one part in `history.md`.

**Part B. Encoding 2,** from draft 25: `docs/agreements-from-scratch/encoding-2.md` (encoding 1 stays as it was, for history), and the module, binding, checker and vectors brought to it.
1. Every change of Part A in the bytes and the checks, each with its rule.
2. **The vectors chained.** Every act in a real signer's sequence (`prev`, position, running summary as Envelopes gives them), several acts per signer, authors' assents naming the Terms in `previous`. The README says in its first lines what a player must still take from Envelopes and Identity.
3. Fable's section 3 cases: every vector whose answer or cited rule Fable could not reach from the text, made to match the text, or the text made to say it.
4. Tests and CI green; the old core unchanged; the Python check agrees on every vector; regenerating leaves them unchanged.

**Part C. For the briefing:** `docs/agreements-from-scratch/encoding-2-report.md`, plain words first: what changed from encoding 1 and why, one line each; the new spec hashes and types, and the SHA-256 of `draft-25.md`, `encoding-2.md` and `report-block-4.md`; and Fable's "What a player will trip on first", rewritten for encoding 2, as the list the Dubsar Suite lead gives the players.

Decide nothing beyond these. A stranger's reading: a subagent limited to `draft-25.md` and `encoding-2.md` says where it still cannot tell what bytes to write. A pull request, no merge. Never write the author's personal name; write "Nobody, allegedly". No server addresses, onion addresses or keys; test identities only; regtest or signet only.

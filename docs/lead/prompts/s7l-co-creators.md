One point, on S7i's branch, in the MOR repository (`nobodyallegedly/MOR`): **on `claude/s7i-routes` (pull request 116)**, while the Dubsar Suite's round 10 works on the same branch. A very short session.

**Read first, yourself:** `CLAUDE.md`; in `docs/findings/MOR-findings-log-round-2.md` on `claude/lead-records`, **F417** and F412.

**Decided by Nobody, allegedly (F417):** "Co productions are common, ownership can be multiple IDs (collectives or individual)." A claim made for a collective may list any co-creators, members or not, collectives or persons, the collective counting as one. Find every place where the claim's text (Agreements, the claim's format and its comment, rule 58, the glossary, the MICS, the freeze test suite) or the core (`WorkClaim::decode`, `work_owners`) limits a collective's co-creators to its members, and remove the limit; vectors for a collective's claim with a non-member person and with another collective as co-creators, and the default holders the core then reads.

**The suite works on this branch at the same time:** touch only `spec/`, `core/` and `docs/`; nothing in `clients/`, `cmips/`, `modules/`, `wasm/` or `built/` (the suite's round is writing `agreementsWorkOwners` in `wasm/` under the MOR lead's permission). Pull before each push and rebase on what the suite pushed; never force-push; no release rebuild.

**Vectors:** every earlier case keeps its verdict, acts and ids unless it is exactly this decision's case: say which and why. Both READMEs and the c-box's; the Python check. **Ummia's pinned hashes:** give the final values if the MICS or the suite's text moves.

**Questions:** plain words, then precisely, with options, your lean and the cost.

**Finding number.** If this session records a finding of its own, it is **F418**; do not take another.

**Report:** `docs/s7l-report.md`, short, its first line whether you are done and whether the WebAssembly or a binding's answer moved (the suite's signal for its final rebuild).

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Push to `claude/s7i-routes`; do not merge.

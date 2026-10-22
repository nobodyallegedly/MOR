A buyer's contest of a purchase (F386), and the signer's time hint in the WebAssembly binding, in the MOR repository (`nobodyallegedly/MOR`): the texts, the core, a vector, and the web releases. A small session.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md` ("Before merging a session's work", "After the box"); F386 at the top of `docs/findings/MOR-findings-log-round-2.md`, in full; Agreements 17's rule 54, "Contest (type 14)" and the vows' contest passages; Envelopes 11's rule 21 and key delivery; Money 11 on purchases; the core's contest handling (`core/src/agreements/`).

**The change** (the finding decides): the buyer of a purchase has standing to contest that purchase, in the contest act's existing format: field 0 names the purchase (the buyer's payer's claim of the payment that is the purchase; for a free purchase, the buyer's signature act on the offer), field 1 absent or the promise not kept in words; the inside names the purchase as chain and predecessor, as the other contests do. Shown beside the purchase; voids nothing; changes no payment, refund, delivery or verdict. Signed by anyone else, it shows nothing.
- Agreements 17: rule 54 (standing) gains the buyer, for a contest of their own purchase; "Contest (type 14)" gains the case, in the voice of the vow's paragraph. If the vow's paragraph and the new one can say it once, say it once.
- The core: the contest of a purchase recognised, shown, its signer checked against the purchase's buyer; nothing else moves.
- Vectors: a buyer's contest of their purchase (shown); the same signed by another identity (shows nothing). Both READMEs updated, "What changed since the previous edition" included.
- One line under "After the box" in the workbook. A stranger's reading by a subagent limited to the eight texts over what you changed.

**The signer's time hint in the binding** (agreed with the Dubsar Suite lead, 22 October 2026; their note to the MOR lead, item 3): the texts already define the inside's field 9 as a hint, "a timestamp or other hint, never load-bearing" (Envelopes 11, field 9; rule 6, "Hints never decide"). The WebAssembly binding writes it when it signs (where the caller gives one) and exposes it when it reads, as display only: nothing a verdict reads may use it. No text changes. Name the binding's field and function exactly in the report's "For the Dubsar Suite", since round 4 shows it in the kit's act card, labelled as the signer's own hint.

**The web releases** (the Dubsar Suite lead's rule, now the MOR lead's): this changes `core/` and the WebAssembly, so rebuild in this branch every web release that carries it (the display client, Dub, Kišib, Damgar, Ummia, Edubba), as their READMEs say, and be green on GitHub, the reproducible display client included, before the pull request is ready.

**Questions** go to Fable before they are decided: write each in plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F387**; do not take another.

**The apps share this core:** list any change to the WebAssembly interface under "For the Dubsar Suite".

**Report:** `docs/s7d-report.md`, short: what changed, the questions, the stranger's reading, the releases rebuilt, `scripts/c-box/make-c-box.sh` run into a scratch folder refusing nothing, CI checked yourself.

**Do not:** change a rule beyond F386; write any finding number, review label or history into the eight texts.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on a branch `claude/s7d-buyer-contest` from main; open a pull request; do not merge. **Main's page:** do not start until `claude/MOR-main-merges.md` in the project shows "main green" after #97's releases (the MOR lead checks this before launching you).

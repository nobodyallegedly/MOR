The boundary for a second model, in the MOR repository (`nobodyallegedly/MOR`), from main (the trim, pull request 121, is merged): make the control-model boundary complete enough that a team which has never seen this repository can write a second control model from the texts alone, and two such teams would implement it alike. Texts first, then the code, the vectors, the binding and the web releases. Commit at each clean point; if you must stop, stop at one and say what remains.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md`; `docs/s7m-5-report.md` (the stranger's reading, its seven points) and `docs/s7m-6-report.md` and `docs/s7m-7-report.md`; in `docs/findings/MOR-findings-log-round-2.md`, **F425 and F426 in full**, then F420 to F424; Agreements draft 18 (rules 98 and 99 above all), the default cMIP (`cmips/cmip-collective-control-draft-1.md`), `core/src/agreements/control.rs` and `cmips/control/`.

**Why** (Nobody, allegedly, 3 November: "What we did not write down… to me translates to cMIP"; the cMIP leads under the Dubsar Suite will write models): today the core's own checks can be built from the texts, but a second model cannot.

**1. The seven points, settled by the MOR lead under delegation (F425):** a CDDL for a model's answer (and the `rule` grammar able to say "any k of these named holders" if the answer needs it); a model's own acts count where the collective's terms name it in field 35, under the types its specification declares; rule 99's queries extended by the line as data (S7m-5's design, as `control.rs` documents it), in the rule's words; two verdict names, "refused" for an act and "overreaching" for a model's answer; a mixed clone needs `[0]` plus what its operational part needs under the layers' rules; suite step 3.7c's publication needs the Agreements layer's rule as well; removal and succession both leave the parameters to the model. **And "bought under"** (S7m-7's reading, confirmed by the MOR lead): the version a transfer names, which the seller signed; say so in rule 48 in one clause.

**2. Types 26 to 28** (F426, 1): the issuance offer, a proxy and its revocation move to the default cMIP's specification as its own acts, under point 1's rule; the core no longer decodes them as Agreements types; tests and vectors migrate (their verdicts kept; their bytes and ids may change: say which).

**3. Money's pointer** (F421, question 8): Money's next draft (draft 12) changes only "a take-up of an issuance (Agreements rule 96)" to "(a control model's, Agreements rule 99)"; nothing else in Money.

**4. A second model, on paper:** a subagent limited to the texts writes a short specification of a different control model (for example, majority by share for everyday acts, one area for Money) and says where the texts left it guessing. A second subagent, given only the texts and that specification, says what verdicts it would give on five acts; compare with what the core gives through a stand-in. Report both; where they differ, it is a question.

**5. Vectors and the binding:** every earlier verdict kept unless point 1 moves one by decision (name it); vectors for an overreaching answer where a vector can carry it, a model's own act under field 35, and a mixed clone. Both READMEs; the Python check. `wasm/README.md`'s "For the Dubsar Suite": every change, old and new names and shapes (types 26 to 28 above all; Edubba uses proxies and issuance).

**6. The web releases:** before the pull request is ready, merge main, rebuild the six (the display client, Dub, Kišib, Damgar, Ummia, Edubba) as their READMEs say, and be green on GitHub. When you start that final merge of main, say so in your report's first line and stop to let the MOR lead write "preparing to merge". Where an app breaks on a moved type, say so plainly rather than changing `clients/`; the suite follows on your branch.

**Not yours here:** the say-it-once pass (the next session, S7o); any other cMIP; `clients/`, `modules/`; any rule's substance beyond these points.

**Questions:** plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F428**; do not take another.

**Report:** `docs/s7n-report.md`, short: the sentences; the types moved; Money's pointer; the second model on paper and where it guessed; vectors; "For the Dubsar Suite"; questions; the releases; `scripts/c-box/make-c-box.sh` into a scratch folder refusing nothing; CI checked yourself.

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on a branch `claude/s7n-second-model` from main; open a pull request; do not merge.

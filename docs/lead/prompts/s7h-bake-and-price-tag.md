The words and the price tag (F398), in the MOR repository (`nobodyallegedly/MOR`): one word per step of a work's life in all eight texts, the price taken out of the act that stores media and made a Money act of its own, the core, the vectors, the binding and the web releases. A larger session, mostly careful wording: work in the order below, and if you must stop, stop at a clean point and say what remains.

**Read first, yourself:** `CLAUDE.md`; `docs/lead/workbook.md` ("Before merging a session's work", "After the box"); F398 at the top of `docs/findings/MOR-findings-log-round-2.md`, in full, and F397 below it (what else is decided, for S7i, not for you); Envelopes 11's Publication (type 0) and every rule naming it; Money 11's "price" (its format section and every rule reading a publication's price); Agreements 17's rules 7, 11, 12, 14 and 15; the MICS's glossary.

**The decision, in Nobody, allegedly's words:** "A file is baked, then claimed, then offered, and possibly published." And: "Plainer verb is upload." And, for the price: "I think it is cleaner, it separates envelope and money acts."

**1. The words, in all eight texts.**
- **A bake**: the act that locks and stores media, today Envelopes' "Publication (type 0)". Its type number and every field it keeps are unchanged. "A file is baked." It carries, claims and sells nothing by itself.
- **Upload** (verb): putting any act on homes and relays, wherever the texts now say "publish" in that sense.
- **Publication, publish, publisher**: only a publisher carrying a work under its own agreement (Agreements rule 15 and what follows from it). Where that rule now reads "a publication carries two agreements", write what it is in the new words (for example: a publisher's offer of a baked work, under the publisher's agreement, the work's agreement one participant of it), and say plainly what act a publisher signs.
- Offered stays "offer" (a standing offer, Agreements); claimed stays "work claim".
Go sentence by sentence; a word that names a different thing in different places is what this decision exists to end. Where a sentence does not fit any of the four steps, write it as a question rather than forcing it. The glossaries (the MICS's, each MIR's) gain or change their entries; the freeze test suite's scenarios follow.

**2. The price tag, a Money act.**
- Envelopes type 0 loses its price (field 7) and its "for" (field 8); the bake keeps every other field, unchanged in meaning.
- Money gains one act type, the next free number: **a price tag**, signed by the seller, naming the bake (by its act id) or the work it sells, the price (Money's amount, as field 7 carried it), and the identity whose payee pointer is paid (as field 8 said, else the signer). Write its format, its validity rules and its place in Part three as the other Money acts are written. A Money-only wallet sells with a bake and a price tag; nothing in it needs Agreements.
- Every Money rule that read "a publication's price" reads the price tag; every Agreements rule that read a publication's price or its `for` (rules 12 and 14, and the purchase verdicts) reads the price tag; where a work is claimed, it is the price tag that is read against the claim, as the publication was.
- Keep everything the price did: a tip needs no price tag (it goes to a person's pointer); a priced bake's sale is now a bake plus a tag.
Where moving the price changes a verdict a vector shows, say which and why before going on; the decision does not mean to move a verdict, only who carries the price.

**3. The core, the vectors and the binding.**
- The core follows: the bake without fields 7 and 8; the price tag decoded and validated; every check that read the price reads the tag. The core's internal names may stay as they are (a rename of identifiers can follow the freeze); the vectors' labels, questions and `about` use the new words.
- The vectors: acts that carried a price or a `for` change their bytes and ids, and are regenerated with a price tag beside them; every other case keeps its acts and ids; every case keeps its verdict. Both READMEs updated, "What changed since the previous edition" included. The Python check follows.
- The binding: functions that build or read a publication's price or `for` gain their price-tag counterparts; list every change under "For the Dubsar Suite", with the old and new names and shapes. Keep the old functions' names where the apps call them, so that the suite's apps can move on their own schedule, unless keeping one would sign an act the texts no longer allow; then say so.

**4. The web releases:** this changes `core/` and the WebAssembly. Before the pull request is ready, merge main, rebuild every web release that carries the core (the display client, Dub, Kišib, Damgar, Ummia, Edubba) as their READMEs say, and be green on GitHub, the reproducible display client included. When you start that final merge of main, say so in your report's first line and stop to let the MOR lead write "preparing to merge" on the shared page.

**A stranger's reading:** a subagent limited to the eight texts reads them after the rename, whole, and says where a word still names two things, or where the four steps do not read as one story.

**Questions** go to Fable before they are decided: write each in plain words, then precisely, with options, your lean and the cost; go on with the rest.

**Finding number.** If this session records a finding of its own, it is **F399**; do not take another.

**Report:** `docs/s7h-report.md`, short: the words (how many places changed, and every place where you chose between meanings), the price tag's format, the verdicts checked, "For the Dubsar Suite", the questions, the stranger's reading, the releases rebuilt, `scripts/c-box/make-c-box.sh` run into a scratch folder refusing nothing, CI checked yourself.

**Do not:** change any rule beyond F398 (Fable's third review and the other decisions of F397 are S7i's, after you); write any finding number, review label or history into the eight texts; change `cmips/`, `modules/` or `clients/` beyond the releases' rebuilt `built/` (the cMIPs that say "publication", the website cMIP and the release manifest among them, are the suite's, and follow).

**Rules that never bend:** never write the author's personal name or nicknames in anything that enters the repository; write "Nobody, allegedly". No server addresses, onion addresses or keys. Test identities only; regtest or signet only. Work on a branch `claude/s7h-bake-and-price-tag` from main; open a pull request; do not merge.

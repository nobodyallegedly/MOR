# Agreements, draft 26: the report, after wave four

*The scribe's session N1, 27 November 2026, to the MOR lead and Nobody, allegedly; rewritten whole in M11's shape. A record of work, not a decision: nothing in it is chosen. Marks: TRACED (to a rule or a ledger entry), COUNTED (by a script, named in `draft-26-trace.md` under "N1"), INFERRED (the scribe's reading). Draft 26 is not merged and not LATEST; draft 25, encoding 2 and `spec/README.md` are untouched.*

**The wish** (Nobody, allegedly, 26 November, 16:46): "We need to change the current wish to updating the core after the findings". On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development." On this wave (16:54): "Yes pls".

## What wave four changed

**In plain words.** He answered five of the questions draft 26 had left open. Each answer is now written into the rules, in the text's own words, and into the bytes, the companion and the trace. Four words that each meant two things now mean one. Sixteen sentences that said a definition again now point to it. The list of what needs a choice is down to the lines no answer and no reading of the lead's reaches.

**His five answers** (TRACED, each to its entry in `docs/decisions.md` on main, read whole; his words quoted as the ledger has them):

1. **Two keepers named, both needed** (16:40–16:44): "If the terms stipulate two keepers, both keepers are needed. Sorry can’t do". Written in 5.8.3: every keeper named is needed; until each shows an act, **not shown**, with that reason; where they disagree, **not shown**, the keepers disagree. 5.8.4, 5.5.5(d), 5.6.4, §3.4 **Keeper** and §3.6 **Not shown** agree. The brief's item 5 closes.
2. **The known parties of a version are the signers it names** (16:44–16:46): "Is Dana a known party at the signing of the new act?", then "Yes". Written in §3.2 **Known party** (of a version, read version by version; a party an update adds is known from that update on, and not to the versions before it) and 5.5.5(a), (b), 5.5.7(e). Item 2 closes.
3. **"Renewed on the terms then current" cannot be built** (16:46–16:48): "How did they build such terms in agreements?" No sentence added: 5.10.6 to 5.10.8 already say it (INFERRED). The companion's scenario 8.24, the wall of terms, says it with his question. The lead's "her own deal" is withdrawn, by the entry's line (companion 6.9, 6.13). Item 14 closes.
4. **The signer of a Terms act is an author** (16:48–16:50): "Absolutely. The person publishing the act is by default an author, the rest adds signature later". Written in 5.3.1 (Terms whose `authors` do not name their own signer are **invalid**; the other authors sign by assents of their own), §3.2 **Author**, §4.2 `authors`, §4.4 case 5; encoding 3's E13 and sections 4 and 9. The first carried question closes.
5. **The giver bears it, not the agent** (16:50–16:53): "No, Ana took the risk, she bears the responsability. It’s my “blame the manager not the worker” mentality. What will be more likely is acting for an “agreement as a party” via granted powers, there two the agreement bears the responsability". Written in 5.6.1(a) and 5.6.3: an act made for another under a power binds the grantor, never the agent as its own act; the same where the grantor is an agreement. The agent's duties are the power's cMIP's, in the companion (section 5, §5.6). The second carried question closes.

Each answer's scenario and the vector it names for the codemeister are the companion's 8.22 to 8.26 (INFERRED).

**The renames**, the lead's lean applied as the lead's reading (COUNTED, `edit.py` and `where.py`; every place in the trace): **chain** for an agreement's versions only, 9 places in draft 26 (a keeper's is its **record**; "a chain of acts" reworded without a noun); **sort** for a spot's and a power's, 40 places (3 plain uses of "kind" reworded); **resolution** for a fork's end, the §3.3 entry, **resolve** staying the Statement's kind; **placed** for an act the keepers show, 6 places, with a new §3.4 entry. 59 places in draft 26, 30 in encoding 3, 10 in the companion.

**The sixteen**: done. M11's list holds seventeen terms in eleven rules (COUNTED); each rule keeps the words it needs and cites its §3 entry; each sentence that went and the one that stays is in the trace.

**The list**: of its 44 lines, 5 closed by his answers, 19 settled as the lead's, 1 done, 19 remain (below; COUNTED, the trace's table).

## In plain words

1. Draft 26 is the rules of Agreements rewritten after the round's findings: a new file beside draft 25, which stays as it is.
2. It is a grammar, not a rule book: it says how signed acts are read, and leaves what people agree to cMIPs in eight sockets.
3. Two people write the words (a Text act), Terms that name them, signed by one of their authors, and an assent each; the Terms count once their order is shown.
4. A change is an update: allowed by the old version's own condition (the gate), and ordered after it (the pin). Who decides is the known parties of the version being changed.
5. Two allowed changes that nothing orders are a fork: both stop, the old version stays, until the agreement resolves it its own way.
6. Someone who joins later through a role keeps exactly what the version they signed gave, on that version's clock; no update reaches them, and their words cannot move them to a later version.
7. Order comes from the keepers the Terms name, every one of them, or, where none is named, from knots: acts naming acts.
8. An act signed for someone else under a power binds the one who gave the power, not the one who signed.

## The files

COUNTED (`wc -lc`, the final files on `claude/draft-26-outline-vbtvu7`):

| File | Lines | Bytes |
|---|---|---|
| `draft-26.md` (the hashed text) | 429 | 147,279 |
| `encoding-3.md` (its bytes) | 466 | 58,230 |
| `draft-26-companion.md` | 1917 | 372,257 |
| `draft-26-trace.md` | 1382 | 267,521 |

**The hashes** of the final `draft-26.md`, computed last, after every other edit of it:
- E2's tagged hash, `SPEC_DRAFT_26`: `04bae25cb3416e111e1f65ddca2c99c5769d3945c0751a6846621929c0d29904`, by the core library's `Spec::mir_file_hash`, run from a scratch crate on the file.
- The plain sha256 of the file's bytes, `sha256sum draft-26.md`: `09ba9ce52f1e995872aaf7a35838442516f7c014e0b104256f273c2c7f0f85ff`.

The first names the text, as encoding 3's E2 has it, and as this wave's assignment names it. Both are written, each named, in encoding 3's E2 and the companion's head. M11's values (`e9e5b683…`, `6ee29fc2…`) name the text before wave four. Which value is `SPEC_DRAFT_26` is no longer listed for Nobody, allegedly: the lead's assignment settles it as E2 has it (the trace, N1).

## The counts

COUNTED unless marked.
- **Rules of draft 26**: 68 numbered (§5.1 5, §5.2 3, §5.3 2, §5.4 5, §5.5 7, §5.6 6, §5.7 2, §5.8 6, §5.9 1, §5.10 8, §5.11 9, §5.12 9, §5.13 5) and 33 lettered clauses (§5.5 21, §5.6 12); 8 tasks (§6), 7 modules, 6 open values (§7). Unchanged by wave four.
- **Draft 25's 124 rules**, by the brief's sort: 41 stay, 39 change, 26 move, 3 go, 15 read two ways by the lead; 92 carried into draft 26, 29 left, 3 not carried by the lead's readings (the companion's section 10, unchanged).
- **Words defined**: 79 entries in §3 (78 and **Placed**); 134 distinct bold terms there, with answer words, sorts and kinds.
- **References**: 903 in draft 26, 240 in encoding 3, 267 in the companion's sections 9 and 10, 83 in the companion's wave-four additions; none bad.
- **Edits**: 133 logged (draft 26, 77 in 95 places; encoding 3, 17, beside two block renames; the companion, 39).
- **Scenarios**: 26 (M10's 21 and 8.22 to 8.26), each of the five new naming one vector.

## What the check found and fixed

M11's eight again, by script, on the final files; each script and result is in the trace under N1.

1. **Words.** No spot's or power's "kind", no "chain" but an agreement's versions (beside the layer below's), no act "in force". Listed: "kind" of a value (§4.1, 11 uses), which the lean does not reach.
2. **References.** None bad in the three files.
3. **Only rules.** No mark of history, attribution or scenario in §4 to §7 (one flag, the verb "lead", a rule). §0 holds no rule.
4. **The bytes against the rules.** 20 Terms and 12 Statement fields, each with its key; E13 now asks what 5.3.1 gives.
5. **The companion's trace.** 68 rows for 68 rules; 219 of 220 cited headings found word for word, the other read by eye.
6. **Quotations.** His seven quoted spans in the wave-four additions all in the ledger. Fixed: 10 quotes of draft 26 in the companion and 1 in encoding 3 that no longer matched its words.
7. **The head and the hash.** The head unchanged; the hash above.
8. **What the files must not hold.** Nothing found: no key, address, port, access detail or personal name; no line ends in a space.

**The stranger** (one subagent, draft 26 alone). Its four answers matched the text (70% to 90% sure). The five sentences it understood least: 5.10.8's "anchoring of the purchase"; 5.12.2's sentence on the signatures of a fork of a line; 5.4.2's "read for who fills a role"; 5.11.9's contest naming an envelope, which §4.3 gives a Statement no field for; 5.4.5's counter signatures that "lean on one another". Fixed, needing no choice: 5.12.2's sentence (the scribe's own of this wave); §3.6's "(a fingerprint where §4 says fingerprint)", inverted; 5.5.7(a)'s pointer to 5.12.2 where tips stop in 5.12.3; "rule" alone for a grammar rule in 5.8.6 and 5.6.6. The rest is listed below.

## What needs a choice, for Nobody, allegedly

One line each, as M11 had it; nothing chosen. Every line no answer of his and no reading of the lead's reaches.

**The brief's unsaid items**
- **7.** How a fork that is not of a line is resolved in bytes (5.4.5, 5.12.4).
- **8.** Which acts compete "to change the same state": a list or a test (5.12.2, 5.6.4).
- **11.** How long a version binds a filling whose words state no term (5.10.8).
- **12.** Which act "the anchoring of the purchase" anchors; and a filling that is not bought (5.10.8; the blind reader and the stranger).
- **13.** What a verifier shows of an agreement the known parties dissolved while a filling's version still binds (5.5.6, 5.10.6).
- **29.** The line's list of what the known parties may still do (5.10.6).
- **30.** "Terms state their anchors" as a rule for all Terms (5.8.6).
- **34.** (a) How Terms name their clock; (b) where a cMIP's declared needs are written (§7, 5.8.6).
- **35.** The two copies of "A condition in time with no anchor is refused" (5.8.6).

**Found items**
- The lead's 09:47 sentence "a resolving update whose tips a verifier cannot read resolves nothing": not written.
- A resolve in one signer's line that resolves has no answer word (5.12.4 gives Terms' answers only).
- **Rival** (§3.3) against 5.12.8's heading, which also covers two resolving updates of one tip, no fork.
- **Knot** is MOR-wide in §0 and not said so in §3.4.
- §3.1 **Vow**, "without bytes attached": no test tells a vow from an offer (5.11.8).
- 5.11.7's payment "holds" K6, while §3.1 makes a task a field of an act that names a cMIP (the blind reader and the stranger).
- M8 finds (INFERRED): a set's value in `relies_on` or `answers` cannot be told from an act id (M8, 1; encoding 3's open item 4).
- M8 finds: case 8 (5.8.6) cannot be checked from bytes (M8, 3; open item 11).
- M8 finds: a held act that cannot be opened, named in `body`, is unsaid (M8, 4; open item 9).
- M8 finds: no layer gives a keeper's identifier (M8, 6; open item 7).

**Found in wave four** (the scribe's rows to check and the stranger's finds; each a choice)
- "Kind" also names a field's kind of value (§4.1), which the lean does not reach.
- **Sort** names a spot's and a power's, as the lean gives both the word (the stranger).
- §3.2 **Known party** keeps "as a signer or as an agreement", against the line's "the signers it names" (the lead's reading of 09:47).
- 5.3.1's "invalid" written without exception, against his "by default".
- §4.4's heading "One fault, one rule" and its "one fault fits two rules", against §3.1's "the word "rule" alone is never used" (encoding 3 quotes the heading).
- "Control" names both the layer that holds value and task K6.
- §3.1 **Rule** "trusts nobody", against K3's trust column ("whoever its modules name").
- Sentences said twice beyond the sixteen: 5.1.3 and §4.2's `receiver` row; 5.4.1's and 5.5.3's "Which keepers"; 5.4.4 and 5.4.5.
- 5.4.2's `in_force` "read for who fills a role", beside K5; 5.4.5's counter signatures that "lean on one another"; 5.11.9's contest naming an envelope (the stranger).

## What waits on the codemeister

Encoding 3's section 11, "Open in this text, not yet chosen": 1 the set's label; 2 how a set's members are joined; 3 where the set's rule stands; 4 which fields may hold a set's value (and Nobody, allegedly); 5 the keeper field's form; 6 whether the keeper list is sorted; 7 what a keeper's identifier is the hash of; 8 whether key 9 stands (and Nobody, allegedly); 9 a `words` act held without its key, or not held (and Nobody, allegedly); 10 which spec hashes are `TEXT` (and Nobody, allegedly); 11 how a cMIP's declared needs are read, case 8 (and Nobody, allegedly); 12 `SPEC_DRAFT_26`: computed again after wave four, for the codemeister to check. None is picked. Also: the impact sheet's line 1, vector 3 (**late** in draft 26, **unchecked** in the sheet); the five vectors of the companion's 8.22 to 8.26; E13's new case (an identity hash on the outside against `[0, signer]` in `authors`); and the renames in E10's and E14's CDDL labels, which change no byte.

## What draft 26 hands to other texts

In full in the companion's last section, "What draft 26 hands to other texts"; wave four adds nothing to it.
- **The MICS**: the thirteen rules of how a reader answers and reads across legs, the report block, and the evidence-and-accounting line beside MOR's opening definition.
- **Envelopes**: the thirteen rules of the baker, the baker's rule for a contest, the three verbs (lodge, relay, fetch), and "uploader".
- **Identity**: rule 34 and the keeper's record; the pair to renumber; a key change continuing the signer's line ("Two threads, two owners", 17 November).
- **Development**: how a cMIP declares what it needs; N9's and N10's client halves; the client duty of 5.12.9; the common cMIPs; and the ledger's "A specification is a Text act, named by its id" (27 November), queued behind draft 26 by that entry's line.

## The MOR lead's readings, by time

All of 27 November, given to the scribe; each with the rules it shaped and the other reading, in the companion's section 6.
- On the brief's heaviest unsaid items (items 1, 4, 28 and the rest): 6.1.
- The lines that say more than his words: 6.2.
- The outline's held rules: 6.3.
- 09:16, on M2's rows: 6.4.
- 09:27, on M3's questions: 6.5.
- 09:47, on M4's rows: 6.6.
- 10:07, on M5's rows: 6.7.
- 13:20, on M6's question: 6.8.
- The settled note's rows draft 26 is written on: 6.9.
- 14:33, on M7's question and rows: 6.10.
- 14:59, on M8 and M9: 6.11.
- 15:34, on M10's "For M11": 6.12.
- Wave four: the lean on four words, and what the five lines say beyond his words: 6.13.

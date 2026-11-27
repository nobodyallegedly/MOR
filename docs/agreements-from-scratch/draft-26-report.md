# Agreements, draft 26: the report, after wave five

*The scribe's session P3, 27 November 2026, to the MOR lead and Nobody, allegedly; rewritten whole in N1's shape. A record of work, not a decision: nothing in it is chosen. Marks: TRACED (to a rule or a ledger entry), COUNTED (by a script, named in `draft-26-trace.md` under "P3"), INFERRED (the scribe's reading). Draft 26 is not merged and not LATEST; draft 25, encoding 2 and `spec/README.md` are untouched.*

**The wish** (Nobody, allegedly, 26 November, 16:46): "We need to change the current wish to updating the core after the findings". On the order (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development."

## What wave five changed

**In plain words.** Three sessions carried this evening into the rules. A buyer's yes gives nobody a power over her. Known parties and unknown parties are two classes with two sets of rules. Publishing the Terms is its signer's yes. An update every known party signs, each after the other, is ordered by their own acts, keeper or not; any other update, two of three included, waits on every keeper named; a dead keeper is left only by a new version every known party signs. Draft 26 now says so, partly on the lead's readings, to check. The lead's readings of the last open questions are written into the rules they touch, each listed below for him to see. The bytes and the companion follow, and the three files were checked again as one.

**His words of the evening**, each exchange by the scribe's short name, what it arrived at to check (TRACED, each to its entry in `docs/decisions.md` on main, read whole; his words as the ledger has them):

1. **A filling gives no power** (18:39–18:47): "Yup, this should not happen. Not sure I caught all the details though"; "Buona did they build it in agreements?"; corrected: "“that fills an unknown party spot”". Rules: §3.2 **Power** and **Unknown party**, 5.4.3, 5.6.1(b), (c), 5.6.2, 5.6.3, 5.10.6, 5.10.7 (P1).
2. **Two classes**, in the same exchange (18:47): "It’s seems important to really make a point that these two are not the same class or IDs and are not bound by the same rules." Rules: §0, §3.2 **Two classes**, now with the rule beside each item (P1, P3-33).
3. **The pin in two halves**: "A dead keeper: an update every needed signer signs needs no keeper" (18:44–18:51): "A dead keeper forces a new version of the agreement, no?"; "Sounds good"; read again in "A dead keeper: two of three cannot leave it" (21:29–21:42): "Keeper is dead. That version of the agreement is dead. For the agreement to be valid, the keeper is indeed needed to verify the agreement. It’s not “act exists” as a condition, it’s “act exists @“. Condition is not met, agreement is dead. What can save them? All three signature that sign a clone to the agreement to a new keeper." Rules: §1, §3.3 **Pin**, 5.4.1, 5.5.1(b), 5.5.3, 5.5.5(d), 5.8.3, 5.8.4, 5.10.2, 5.13.3 (P1, P3-9 to P3-18).
4. **Publishing the Terms is the publisher's assent** (20:49–20:50): "Yes, I don’t see the need to have her sign twice". Rules: §3.1 **Terms** and **Assent**, §3.2 **Author**, §4.3 **An author's first act**, 5.4.1, 5.5.7(e) (P3-1 to P3-6); encoding 3's E13 and E17. Fable 1.1: his 20:50 answers it, as the lead reads it; to check.

**The lead's readings carried** (COUNTED): of the fifty rows, 39 by P1, 4 by P2 into encoding 3, 7 with no text change; of the seven of 20:41, all seven, as the batch of 21:45 and his 21:42 correct them; the codemeister's two; of the twelve of 20:55, nine into the text, three (11, 13, 14) with no change, as the note says; of the batch of 21:45, all five. Rows that could not be carried: none whole; what a carried row left open is listed below. Each reading P3 carried is in the table "The MOR lead's readings, for him to check".

**The wording splits.** Fable's ten (its section 1): 1.1, his 20:50, as the lead reads it, to check; 1.2, 1.3, 1.5 to 1.8, one reading each, P1's, to check; 1.4 P1's reading, to check; 1.9 a reading in encoding 3, P2's, to check; 1.10, its three listed parts written on the lead's readings 6 and 10, to check. The scribe's nineteen lines of P1 and N1's nine wordings: each now one reading, by the note's rows 8 to 19 (below), but N1's fifteen lines the note does not reach (listed).

## In plain words

*As draft 26 now says, partly on the lead's readings (below), to check.*

1. Draft 26 is the rules of Agreements rewritten after the round's findings: a new file beside draft 25, which stays as it is.
2. It is a grammar, not a rule book: it says how signed acts are read, and leaves what people agree to cMIPs in eight sockets.
3. Two people write the words (a Text act) and Terms that name them; the one who publishes the Terms has said yes by publishing; the other says yes in an act of their own; the Terms count once their order is shown.
4. A change is an update: allowed by the old version's own condition (the gate), and ordered after it (the pin).
5. Who orders it: every keeper the Terms name, always; and, for an update every known party signs one after the other, their own acts too. A dead keeper is left only by a new version every known party signs.
6. Two allowed changes that nothing orders are a fork: both stop, the old version stays, until the agreement resolves it its own way.
7. Someone who joins later through a role keeps exactly what the version they signed gave, on that version's clock; no update reaches them, and nobody can act for them but under a power they gave in a Statement of their own.
8. An act signed for someone else under a power binds the one who gave the power, not the one who signed.

## The files

COUNTED (`wc -lc`, the final files on `claude/draft-26-outline-vbtvu7`):

| File | Lines | Bytes |
|---|---|---|
| `draft-26.md` (the hashed text) | 433 | 155,996 |
| `encoding-3.md` (its bytes) | 500 | 68,020 |
| `draft-26-companion.md` | 2257 | 463,742 |
| `draft-26-trace.md` | 1840 | 402,016 |
| `draft-26-report.md` (this file) | 199 | 27,007 |

**The hashes** of the final `draft-26.md`, computed last, after every other edit of it:
- E2's tagged hash, `SPEC_DRAFT_26`: `60c0b84ed81a48e9e869bb6d0d813358f92019faa48a97115400736030bc9f12`, by the core library's `Spec::mir_file_hash`, run from a scratch crate on the file (the same binary gives N1's `04bae25c…` on the file as N1 left it).
- The plain sha256 of the file's bytes, `sha256sum draft-26.md`: `c770b32460a1390c08307d4858a9e07d2d700f309ff18459396b031a98ffb75c`.

The first names the text, as encoding 3's E2 has it. Both are written, each named, in encoding 3's E2 and the companion's head. N1's values (`04bae25c…`, `09ba9ce5…`) name the text before wave five.

## The counts

COUNTED unless marked.
- **Rules of draft 26**: 68 numbered and 33 lettered clauses, 32 headings; 8 tasks, 7 modules, 6 open values (§7). Unchanged by wave five.
- **Words defined**: 94 bold terms in §3's entry heads, 93 distinct; none new in P3.
- **References**: 965 in draft 26, 292 in encoding 3, 202 in the companion's sections 9 and 10; none bad.
- **Quotations**: of his words, 162 spans after "He:" in the four files as P3 found them, all in the ledger word for word; of draft 26, 135 in the companion and 34 in encoding 3 that stand in the text now, and 4 in the companion that quote an older draft 26 on purpose, each labelled.
- **Edits of wave five**: P1, 62 to draft 26; P2, 30 to encoding 3 and the companion's sections; P3, 47 to draft 26, 15 to encoding 3, 33 and 22 table rows to the companion.
- **Scenarios**: 36 (8.1 to 8.36); vectors named from 8.22 onward: 8.22 to 8.36, of which 8.36 waits (below).

## What the check found and fixed

Eight checks, by script; each script and result is in the trace under P3.

1. **References.** None bad in the three files.
2. **Words.** Fixed: §3.2 **Two classes** bolded two words it says are "defined below" (unbolded); encoding 3's "powers: [kind, rule]" and "a role of kind future" (now "sort", N1's rename). Listed: "agreement" twice in §3's heads (as **Party**'s third way and as **Agreement**); **grantor** (5.6.6) and **proof** (5.10.2) defined where they stand, not in §3; **Assent** now also a Terms act; "a filling" beside "an unknown party's filling"; "Control" in §1's list of operations.
3. **Only rules.** Nothing of the ledger, the lead, a session or a scenario in §4 to §7; §0 holds no MUST or MAY.
4. **The bytes against the rules.** 20 Terms fields and 12 Statement fields, each with its key; E3, E13 and step 7.4 ask what 5.13.1, 5.3.1 and §4.4 give.
5. **The companion's trace.** 68 rows for 68 rules; every draft 25 number of 9.1 in section 10; 250 ledger headings, all word for word.
6. **Quotations.** As counted above; P3's companion edits brought 11 quotations to the rules' words.
7. **The head.** Says what it rewrites, not merged, not LATEST, where the companion and encoding 3 are. Found: `draft-25.md`, named beside it, is not on this branch or on main.
8. **What the files must not hold.** Nothing: no key, address, port, access detail or personal name; no line ends in a space.

**The stranger** (one subagent, draft 26 alone). Its four answers matched the text. The three cases: (1) the seller's act for Ana under a power written into the offer is not her signature, and V3 does not change what her filling earned; she could have given the power by a Statement of her own while V1 was in force (90%, 70%). (2) With the keeper dead, a version all three sign, each after the others, is **in force**, **as shown**; one two of three sign under a named condition is **valid** and **not shown** as in force, and a fresh version all three sign beside it risks a fork (85%, 80%). (3) A known party's own filling is no unknown party's, and the update binds him; whether it reaches what the filling earned has "no single answer" (55%). The five sentences it understood least: 5.5.4(a)'s "no choice of acts enough for L to pass O's gate avoids an act so shown. Each such choice is read whole"; 5.5.1(b)'s "It is shown after them where it, or an act that put it through the gate, is" (fixed, its pronouns named); 5.12.2's "signed by all the parties that needed to sign it"; 5.6.1(b)'s Statement (which field names the grantee); 5.10.8's "anchoring of the purchase". The rest is listed below.

## What needs a choice, for Nobody, allegedly

One line each; nothing chosen. Where a reading of the lead's now answers a line, it is in the table after this one, for him to check.

**P1's thirteen lines**
1. The rules of each class (§3.2 **Two classes**): the lead's line, now with the rule beside each item (reading 12); to check.
2. A known party's own filling: 5.10.7 no longer stands for it (reading 7); 5.10.6, 5.10.8, 5.5.7(f) and §3.3 **Apply** still say "a filling" (the stranger's case 3).
3. Which signers an update needs, and "each shown after the other": answered by his 21:42 and the lead's answer 1 of 21:45; to check.
4. A first version every party signs, pinned by knots whatever keepers it names: reading 2, written as "every known party"; to check.
5. Lateness by knots with keepers named: reading 3; to check.
6. Fable 1.1: his 20:50 bears on it (the lead's reading); to check.
7. A Terms act signed by one who is no party: invalid, reading 6; to check.
8. Which act gives a power "in an act of her own": reading 5 and answer 4 of 21:45 (a Statement of a K7 kind), the lead's, to check; which field names the grantee is not said (the stranger).
9. A counter signature against an agent's assent, an agreement-party's pin: reading 10, the lead's, to check; its (b) beside 5.1.2's "x signs by every one of its signers" (below, the lead's question 2).
10. Where the principle stands: reading 11, P1-1 stands; to check.
11. N1's fifteen lines the note does not reach: below, "N1's list".
12. 5.6.1(b)'s "in force" beside 5.6.4: reading 8; to check.
13. What shows a signer's fork came after the update: reading 9; to check.

**P2's line**: under two of three, may the two leave a keeper without it: his 21:42 bears on it ("Condition is not met, agreement is dead"); the lead reads it as no; to check.

**N1's list, where no reading reached**: the brief's 7 (how a fork that is not of a line is resolved in bytes), 8 (which acts compete "to change the same state"), 11 (how long a filling binds when its words state no term), 12 ("the anchoring of the purchase"; a filling that is not bought; the stranger again), 13 (what a verifier shows of an agreement dissolved while a filling's version binds), 29 (what the known parties may still do), 30 ("Terms state their anchors" for all Terms), 34(a) (how Terms name their clock), 35 (the two copies of "A condition in time with no anchor is refused"); the lead's 09:47 sentence on unreadable tips; **Rival** against 5.12.8's heading; **Knot** MOR-wide, not said in §3.4; **Vow**, no test from an offer; a payment that "holds" K6; case 8 not checkable from bytes; a keeper's identifier.

**Found in wave five**
- A valid update two of three sign, unpinned behind a dead keeper, beside a new version every known party signs: by 5.5.1(b) as written they read as a fork (INFERRED; the stranger's case 2); whether it must be resolved first is his question below.
- "Naming a new keeper": whether a keeper the old version did not name is asked, or a version naming none leaves it too.
- 5.6.3's "the grantor (5.6.6), who gave the power" against 5.6.6's "the one in whose name it was made", which come apart where a known party gave the power (P2's blind reader).
- 5.5.5(a) and 5.5.7(e)'s "never a signer who fills a role", for a known party who fills its own spot (P2's blind reader).
- 5.5.4(a)'s "Each such choice is read whole" and 5.12.2's "signed by all the parties that needed to sign it" (the stranger).
- `draft-25.md`, named in the head, is not on this branch or on main.

## The MOR lead's readings, for him to check

Every reading of 20:41, 20:55 and 21:45 carried into draft 26 by P3, one line each, with the rule it changed; each is the lead's reading, not a decision of Nobody, allegedly; two rest on his words, as marked. The notes are `docs/lead/notes/2026-11-27-readings-for-p2.md` on main.

| Reading | What it made the text say | Rule (P3 row) |
|---|---|---|
| 20:41, 1, as 21:45's 1 corrects it | the signers an update needs for its gate are those the condition's cMIP (K4) requires; by default the known parties | 5.5.5, 5.5.7(d) (P3-7, P3-8) |
| 20:41, 1, "each shown after"; 21:45, 2 | every keeper named pins any update; knots also pin one every known party signs, each one's act shown after every other's assent | 5.5.1(b), §3.3 **Pin**, 5.5.5(d), 5.8.3, 5.8.4 (P3-9 to P3-13) |
| 21:45, 3, the lead's, resting on his 21:42 | any other update, two of three included, only by the keepers, or not shown; a dead keeper left only by a new version, naming a new keeper, every known party signs | 5.5.1(b), 5.8.3, §1 (P3-9, P3-12, P3-16) |
| 21:45, on P2's "For P3" 8 and 9 | 5.13.3's "only they pin" brought to agree with 5.5.1(b) | 5.13.3 (P3-15) |
| 20:41, 2 | a first version every known party signs is pinned by their knots whatever keepers it names | 5.4.1, 5.8.4 (P3-17, P3-18, P3-14) |
| 20:41, 3 | with keepers named, knots still show an update late; a keeper vouches for the chaining only | 5.5.4(a), (c), 5.8.4 (P3-19 to P3-21, P3-13) |
| 20:41, 4, the lead's, resting on his 20:50 | the Terms act is its signer's assent; the others assent later | §3.1, §3.2, §4.3, 5.4.1, 5.5.7(e) (P3-1 to P3-6) |
| 20:41, 5; 21:45, 4 | a holder gives a power only by a Statement in her own name, of a K7 kind, naming the grantee and the sort, read by K3 | 5.6.1(b), 5.10.7 (P3-22, P3-25) |
| 20:41, 6; 21:45, 5 | Terms that carry `parties` and whose signer is no party they name as a signer are invalid | 5.3.1, §4.4 case 5 (P3-26, P3-27) |
| 20:41, 7 | 5.10.7 stands for an unknown party's filling only | 5.10.7 (P3-23, P3-24) |
| for the codemeister, 1 and 2 | an empty keeper list is not an Agreements act (E18); the words note names 5.2.2 | §4.4 cases 1, 2 (P3-28, P3-29) |
| 20:55, 8 | "in force" in 5.6.1(b) read at the act's position, as 5.6.4 places it | 5.6.1(b) (P3-22) |
| 20:55, 9 | a signer's fork is after the update where shown so; otherwise the update not shown as in force, with the reason | 5.12.3 (P3-30) |
| 20:55, 10(a) | the party's own counter signature against an agent's assent: pointer to 5.6.6(c) | 5.4.5 (P3-31) |
| 20:55, 10(b) | an agreement's act for a pin is one act made for it under a power its Terms give | 5.1.2 (P3-32) |
| 20:55, 12 | the rule cited beside each item of **Two classes** | §3.2 (P3-33) |
| 20:55, 15 | "One fault, one grammar rule"; "fits two grammar rules"; encoding 3 quotes it so | §4.4 (P3-34) |
| 20:55, 16 | a layer by its own name: "(Money)", "the Money layer" | §3.1 **Settlement**, K6's trust (P3-35, P3-36) |
| 20:55, 17 | "It computes; what it leans on is named by its modules (§6.1)" | §3.1 **Rule** (P3-37) |
| 20:55, 18 | each sentence said once: the receiver 5.1.3's, the keepers 5.8.4's, the counter signature 5.4.5's | §4.2 `receiver`, 5.4.1, 5.5.3, 5.8.4, 5.4.4 (P3-38 to P3-42) |
| 20:55, 19 | `in_force` in an update read only for who fills a role; counter signatures that "each name the other"; the contest's `terms` and `relies_on` | 5.4.2, 5.4.5, 5.11.9 (P3-43 to P3-45) |
| 20:55, 11, 13, 14 | no change (the lead's): P1-1 stands; "kind" and "sort" stand | none |

**Questions for the MOR lead**, one batch, each with the scribe's lean (the scribe's reading, INFERRED, not a proposal):
1. 5.10.6's last sentence, 5.10.8, 5.5.7(f) and §3.3 **Apply** say "a filling": does reading 7 reach them, so that an update reaches a known party's own filling? *Lean*: yes.
2. Reading 10(b) against 5.1.2's "x signs by every one of its signers" where its Terms give no power: may that signing also serve for the pin? *Lean*: yes, one signing as one act.
3. "Naming a new keeper": is a new version naming only the surviving keeper, or none, a way out too? *Lean*: yes; the pin by knots asks nothing of the keepers it names.
4. Reading 2's "every party", written "every known party" (5.4.1): right? *Lean*: yes.

**For Nobody, allegedly**, one at a time, his:
1. *His*: where two of three have signed a valid update that the dead keeper will never pin, and all three then sign a new version naming a new keeper, the two are a fork by the rules as written; must they first resolve it, or does the version all three sign stand? (The stranger's case 2.)

## What waits on the codemeister

Encoding 3's section 11, as P2 left it and P3 kept: open, 1 the set's label, 2 how a set's members are joined (and the empty set), 3 where the set's rule stands, 7 what a keeper's identifier is the hash of, 11 how a cMIP's declared needs are read for case 8, 13 whether the checker applies Text's own rules; read as the lead's, 4, 5, 6, 8, 10; 9, which the lead reads as met by 5.2.2, to check; 12 `SPEC_DRAFT_26`, computed again by P3, for him to check. Also `TEXT`'s values (E25). The vectors the scenarios name, none written: 8.22 to 8.26 (wave four); 8.27 to 8.29 (on his words of 18:39 to 18:51); 8.4's and 8.28's variants, 8.30 (**not shown**, per keeper, two of three, his 21:42); 8.31 to 8.35, writable on P3's text, which rests on the lead's readings, to check; 8.36 waiting on the lead's question 1; 8.14's set vectors waiting on items 1 and 2.

## What draft 26 hands to other texts

In full in the companion's last section, "What draft 26 hands to other texts"; wave five adds the table below and nothing to the four lists but what P2 checked.
- **The MICS**: the thirteen rules of how a reader answers and reads across legs, the report block, and the evidence-and-accounting line.
- **Envelopes**: the thirteen rules of the baker, the baker's rule for a contest, the three verbs, "uploader", and `prev` and `refs` read as knots.
- **Identity**: rule 34 and the keeper's record; the pair to renumber; a key change continuing the signer's line.
- **Development**: how a cMIP declares what it needs (in its own published text); N9's and N10's client halves; the client duty of 5.12.9; the common cMIPs; "A specification is a Text act, named by its id".

### The 26 rules that moved, for the Dubsar Suite lead's rereads

Copied from the companion's last section (P2's; the pointer column is the scribe's search, INFERRED).

| draft 25 number | its heading | to | draft 25's text, short | the draft 26 rule that points to it |
|---|---|---|---|---|
| G7.3 | G7, Place to look (no heading of its own) | the MICS | With no place named, every answer about what is latest is qualified **as shown**, or **per anchoring** with the anchoring named; never given as latest or whole without saying what it stands on. | §3.6 **Answers** (the qualifiers); 5.5.3; 5.13.5 |
| G8.1 | G8, Say who said it (none) | the MICS | For any answer about the world, about time, or about value under Control, a verifier reports who stated it. | §2 (the MICS: "say who said it"); 5.9.1, 5.11.8, 5.11.9 ("the MICS, §2") |
| G8.2 | G8, Say who said it (none) | the MICS | A time written inside an act is its signer's claim; only a place gives a position; the time is the clock's, or a reader's anchoring, named. | §2; 5.8.5 (the clock the Terms name), 5.13.5 |
| G8.3 | G8, Say who said it (none) | the MICS | No value is reported as moved on an Agreements act alone; whether Control obeyed is the controller's or the receiver's signed word. | §2; 5.11.7 ("its signer's word") |
| G8.4 | G8, Say who said it (none) | the MICS | Who fills a spot, and what a leg received and passed on, are answers about the world, reported with whoever confirmed them. | 5.10.2 ("each act reported by who signed it (the MICS, §2)"); 5.11.3 |
| G9.1 | G9, Unchecked is not passed (none) | the MICS | Lacking a cMIP, an act, an agreement's acts or a place's answer it needs, a verifier answers **unchecked** for every answer that depends on it. | §3.6 **Unchecked**; §2 |
| G9.2 | Where a verifier stops | the MICS | A verifier that stops following answers **unchecked** for what lies beyond and says how far it followed, never **not shown** or **invalid**; how far is not fixed. | §3.6 **Unchecked** (its last sentence, wave five, P1-11: "A verifier that stops before it has applied a grammar rule answers **unchecked** for what it did not reach, and says how far it went"); 5.1.4; §7, "How far a verifier follows" |
| G11.4 | Reading across legs | the MICS | A result that depends on a sequence is read leg by leg, from the reports held, each leg's part given with who signed it. | 5.11.3 ("How a leg report is read is the MICS's report block's") |
| G11.4(a) | Where to look | the MICS | From the Terms that hold a Control task, whether they carry a call and from whom; a leg's reports are with its two sides. | 5.11.2, 5.11.4 |
| G11.4(b) | The tie | the MICS | Two halves of a leg are tied by the act both name (a settlement); shown **matched**, **mismatched** or **one side only**. | 5.11.7 ("How a payment and its confirmation are read together is the MICS's report block's") |
| G11.4(c) | Amounts | the MICS | Two leg reports naming one settlement match where they state the same amount; otherwise both are shown, neither chosen. | K6's row (§6); 5.11.3 |
| G11.4(d) | Silence | the MICS | A call with no report is **unanswered**; Terms holding Control and carrying no call, **no report called for**; neither read as kept or failed. | K8's row (§6: "the call that no report answers (the MICS, §2)") |
| G11.6 | One leg | the MICS | A report answers the call of its own leg and goes to the other side of that leg and no one else; the grammar never follows a receiver beyond one leg. | §3.1 **Report** ("A report goes to the other side of its own leg ... (the MICS)"); 5.1.4; 5.11.5 |
| G14.1 | G14, The baker (none) | Envelopes | Terms MAY name an `envelope`; the holder of the baker's rights is read from the envelope's chain, at the act the Terms cite. | §2 (Envelopes); §4.2 `envelope`, `envelope_at` |
| G14.2 | G14, The baker (none) | Envelopes | Terms naming an envelope count only if the holder at the act they cite is one of their parties, bound by them, and they are not late. | §4.2 `envelope_at` ("What follows from the act it names ... is Envelopes'"); §4.4, case 7 |
| G14.3 | Without the holder, nothing | Envelopes | A verifier asked anything resting on such Terms first reads the envelope, its baker, the act cited and the holder at it. | 5.1.4 ("the answer of Envelopes' rules for such Terms comes first") |
| G14.3(a) | Invalid | Envelopes | Where the holder at the act cited is not among the Terms' parties, nothing lacking, the Terms are **invalid**, and count for nothing. | §4.4, case 7; 5.1.4 |
| G14.3(b) | Not shown | Envelopes | Where the holder is named but not shown bound, the answer, and every answer resting on the Terms, is **not shown**. | 5.1.4 |
| G14.3(c) | Unchecked | Envelopes | Lacking the envelope, the act cited or the chain between, the answer is **unchecked**. | 5.1.4 |
| G14.3(d) | Shown | Envelopes | Where the acts held establish G14.2, the Terms count, and are read as any Terms are. | 5.1.4 |
| G14.4 | G14, The baker (none) | Envelopes | A work edited and baked again has another envelope and another baker. | none |
| G14.5 | The same work, baked again | Envelopes | Anyone may bake the same bytes again; Terms naming that envelope and its baker count; made legible, not forbidden. | none |
| G14.5(a) | Shown beside a bake | Envelopes | Holding several envelopes of the same work, a verifier shows each beside the others, **as shown**. | none |
| G14.5(b) | Never picks | Envelopes | A verifier never chooses between bakes of the same work, nor answers which baker made it. | 5.11.9 ("That its signer is the one who made the work is not shown by any act") |
| G14.5(c) | A client may rank | Envelopes | A client MAY rank such bakes for its person, by knots or an anchoring; the ranking is the client's. | none |
| G14.5(d) | Judging is a cMIP's, or an arbiter's | Envelopes | Which bake has the better claim needs judgment: a cMIP's or a named judge's, reported with whoever it rests on. | 5.11.9 (a baker may contest) |

## The MOR lead's readings, by time

All of 27 November, given to the scribe; each with the rules it shaped and the other reading, in the companion's section 6.
- On the brief's heaviest items: 6.1. The lines that say more than his words: 6.2. The outline's held rules: 6.3.
- 09:16, on M2's rows: 6.4. 09:27, on M3's questions: 6.5. 09:47, on M4's rows: 6.6. 10:07, on M5's rows: 6.7.
- 13:20, on M6's question: 6.8. The rows of the note the lead calls settled: 6.9. 14:33, on M7: 6.10. 14:59, on M8 and M9: 6.11. 15:34, on M10: 6.12.
- Wave four: the lean on four words, and the five lines: 6.13.
- The evening: the fifty rows, 6.14; 18:41, on "by default", 6.15; 20:41, 20:55 and 21:45, with his 20:50 and 21:42, 6.16.

# Agreements, draft 26: the report of stage two

*The scribe's session M11, 27 November 2026, to the MOR lead and Nobody, allegedly. A record of work, not a decision: nothing in it is chosen. Marks: TRACED (to a rule or a ledger entry), COUNTED (by a script, named in `draft-26-trace.md` under "M11"), INFERRED (the scribe's reading). Draft 26 is not merged and not LATEST; draft 25 and encoding 2 are untouched.*

**The wish** (Nobody, allegedly, 26 November, 16:46): "We need to change the current wish to updating the core after the findings". On what carries over (16:47): "Yes, we’ll go back to analysis, maybe add the focus on agreements".

## In plain words

1. Draft 26 is the rules of Agreements rewritten after the round's findings: a new file beside draft 25, which stays as it is.
2. It is a grammar, not a rule book: it says how signed acts are read, and leaves what people agree to cMIPs in eight sockets.
3. Two people write the words (a Text act), Terms that name them, and an assent each; the Terms count once their order is shown.
4. A change is an update: allowed by the old version's own condition (the gate), and ordered after it (the pin).
5. Two allowed changes that nothing orders are a fork: both stop, the old version stays, until the agreement resolves it its own way.
6. Someone who joins later through a role keeps exactly what the version they signed gave, on that version's clock; no update reaches them.
7. Order comes from the keepers the Terms name, or, where none is named, from knots: acts naming acts.
8. Encoding 3 gives its bytes; the companion explains and traces every rule; the trace records how each session wrote it.

## The files

COUNTED (`wc -lc`, the final files on `claude/draft-26-outline-vbtvu7`):

| File | Lines | Bytes |
|---|---|---|
| `draft-26.md` (the hashed text) | 428 | 146,051 |
| `encoding-3.md` (its bytes) | 466 | 57,532 |
| `draft-26-companion.md` | 1830 | 352,178 |
| `draft-26-trace.md` | 1130 | 227,120 |

**The hashes** of the final `draft-26.md`, computed last. E2's tagged hash, which encoding 3's E2 names `SPEC_DRAFT_26`: `e9e5b6837c10fd310157cc2a620ba268e3c3684efdb0e3ba68af068701e0e214` (the core library's `Spec::mir_file_hash`, a tagged hash of the file's text). The plain sha256 of the file's bytes (`sha256sum draft-26.md`) is `6ee29fc27844908b7a29205ddabcf3d704dc343bbc41bacf7a326980f315d541`. The assignment called the second `SPEC_DRAFT_26`; E2 calls the first so. Both are written, each named, in encoding 3 and the companion's head; which one is `SPEC_DRAFT_26` is listed below.

## The counts

COUNTED unless marked.
- **Rules of draft 26**: 68 numbered (§5.1 5, §5.2 3, §5.3 2, §5.4 5, §5.5 7, §5.6 6, §5.7 2, §5.8 6, §5.9 1, §5.10 8, §5.11 9, §5.12 9, §5.13 5) and 33 lettered clauses (§5.5 21, §5.6 12); 8 tasks (§6), 7 modules, 6 open values (§7).
- **Draft 25's 124 rules** (72 numbered, 52 lettered), by the brief's sort: 41 stay, 39 change, 26 move, 3 go, 15 read two ways by the lead. Where they are now (the companion's section 10): 92 carried into draft 26 (some into two rules), 29 left (3 gone, 13 to the MICS, 13 to Envelopes), 3 not carried by the lead's readings (G4.8(g) to the companion; G11.5, G11.6(c) to the MICS).
- **New rules**: 6 numbered rules from the brief's N rules alone (5.2.2 N4, 5.8.2 N2, 5.8.6 N9, 5.10.6 N5, 5.12.1 N8, 5.13.3 N7); N1, N3 and N6 folded into rules or definitions that also carry draft 25 (§3.3, §4.1, 5.10.8); N10 is client conformance, in the companion.
- **Words defined**: 78 entries in §3 (114 distinct terms in bold, with answer words and kinds).
- **References**: 880 in draft 26, 238 in encoding 3, 264 in the companion's sections 9 and 10; none bad.
- **Quotations checked**: 1,460 quoted spans (draft 26 5, encoding 3 74, the companion 1,381); of the companion's, 885 found in the ledger on main, 423 in another source, 73 in neither, each read by eye, none of them his words (INFERRED).

## What the check found and fixed

By the assignment's numbers; each check's script and full result are in the trace.

First, the MOR lead's edits, (a) to (i), all made: (a) 5.13.3's qualifier and §3.4 to agree; (b) encoding 3's 18 references to the one-fault list now §4.4; (c) the companion's 6.11 and 6.12; (d) 5.10.5's clock; (e) 5.5.5(a) and 5.7.2 reread; (f) 5.5.7(a)'s assents that count; (g) 5.12.4's answers; (h) **Rival** in §3.3; (i) 5.11.9 and the citation "The holder at the act cited" (17 November).

1. **Words.** Fixed: a bold answer word "no" in 5.11.6, not in §3.6's list; "chain" in edit (a), written "the clock the Terms name". Listed: four words used in two senses, sixteen definitions said again inside rules, seven words defined inside a rule only (grantor among them).
2. **References.** None bad, in the three files.
3. **Only rules.** Two reasons carried from draft 25 moved to the companion's section 5 (from 5.6.2 and 5.7.2). §0 holds no rule.
4. **The bytes against the rules.** Every field of §4.2 (20) and §4.3 (12) has its key; every E-rule's draft 26 number exists. No fault beyond encoding 3's "Open".
5. **The companion's trace.** 68 rows for 68 rules; every draft 25 number in draft 25; every ledger heading found. Fixed: section 10's row G1.4 now also gives 5.13.5.
6. **Quotations.** None of his words misquoted. Fixed: one draft 25 sentence the companion called "The ground he gave"; two stale quotes of draft 26 (5.10.5, 5.10.6).
7. **The head and the hash.** Fixed: the head now says what draft 26 rewrites, that it is not merged and not LATEST, and where the companion and encoding 3 are. Hash above.
8. **What the files must not hold.** Nothing found: no key, address, port, access detail or personal name; no line ends in a space.

**The blind reader** (one subagent, draft 26 alone). Its four answers matched the text (70% to 85% sure). The five sentences it understood least: §2's MICS line; §3.1 **Vow**; 5.4.1's pin by knots; 5.10.8's "anchoring of the purchase"; 5.11.7's payment holding K6. Fixed: 5.4.1's sentence, split in three, its words unchanged. Not fixed, each needing a choice: the other four (listed below).

## What needs a choice, for Nobody, allegedly

One line each; nothing chosen. Where a reading of the lead's has since answered one, that is said, and it stays listed for him to see.

**Carried to the end of the stage**
1. Whether the Terms act's signer must be among its `authors` (§3.2 Author, 5.3.1).
2. Whether an agent who signs for another is bound by that act (5.6.1(a), 5.6.3).

**The brief's unsaid items** (its section 7)
- **2.** Which Terms "when made" fix the known parties; whether a party a later version adds is known (5.5.5(a)).
- **3.** Whether an author named by role is a known party (the lead's reading, 09:27: an author is a signer).
- **5.** With several keepers, whether the pin needs every keeper or those that show it where none disagrees (5.8.3).
- **6.** What a keeper answers beyond order (5.8.4).
- **7.** How a fork that is not of a line is resolved in bytes (5.4.5, 5.12.4).
- **8.** Which acts compete "to change the same state": a list or a test (5.12.2, 5.6.4).
- **10.** Whether a resolving update must itself be pinned (the lead's reading for Terms, 15:34 item 4: "in force once pinned"; written in 5.12.4).
- **11.** How long a version binds a filling whose words state no term (5.10.8).
- **12.** Which act "the anchoring of the purchase" anchors; and a filling that is not bought (5.10.8; the blind reader).
- **13.** What a verifier shows of an agreement the known parties dissolved while a filling's version still binds (5.5.6, 5.10.6).
- **14.** Whether "renewed on the terms then current" is a later version reaching her (5.10.6).
- **16.** Whether the principle binds a verifier beyond the rules that apply it (5.10.6).
- **17.** Where N10's client reliance is written (the lead's reading, 09:16: client conformance, in the companion).
- **18.** Whether an assent made for her under a power she gave counts as hers (the lead's reading on G5.6(f) and G10.6(a), companion 6.3: it does; written in 5.10.7).
- **21.** Whether her client relies on the other parties' assents too, or on the words only (N10).
- **22.** Whether private words' key is delivered to each party first (the settled note's F10; N10).
- **24.** Whether "rejected" is a verifier's answer for a late update, or only the checker's word (§3.6).
- **29.** The line's list of what the known parties may still do (5.10.6).
- **30.** "Terms state their anchors" as a rule for all Terms (5.8.6).
- **34.** (a) How Terms name their clock; (b) where a cMIP's declared needs are written (§7, 5.8.6).
- **35.** The two copies of "A condition in time with no anchor is refused" (5.8.6).

**Found items**
- The lead's reading, 09:47, written in 5.5.5(a): the agreement named as a party that never signed is a default signer.
- The lead's reading, 09:27, written in 5.2.2: the act `body` names, held and not a Text act, makes the Terms invalid.
- The lead's readings, 13:20 to 15:34, written in 5.11.9: the holder of the baker's rights for a contest is read at the act the contest cites.
- Whether a counter signature in a fork with the coming into force cancels once the fork is resolved: the lead's reading, 09:47, "as the resolver decides" (companion only).
- The lead's 09:47 sentence "a resolving update whose tips a verifier cannot read resolves nothing": not written.
- A resolve in one signer's line that resolves has no answer word (5.12.4 gives Terms' answers only).
- A counter signature shown after the completion pins the Terms (5.4.1, the lead's 09:47 reading): the blind reader read it as cancelling completing them.
- **Chain** used for an agreement's versions only (§3.3) and also for "a chain of acts" and a keeper's chain.
- **Kind** used for a Statement's kind, a spot's kind and a power's kind.
- **Resolve** both a Statement kind (§3.1) and "said of forks only" (§3.3).
- **In force**, "said of Terms only", said of "an act" the keepers do not yet show (§3.3 Pin, 5.4.1, 5.5.1(b)).
- Sixteen §3 definitions said again in rules (5.12.2, 5.11.1, 5.5.4, 5.5.5, 5.5.7 and others): which wording stands.
- **Rival** (§3.3) against 5.12.8's heading, which also covers two resolving updates of one tip, no fork.
- **Knot** is MOR-wide in §0 and not said so in §3.4.
- §2's MICS line: rules kept in a companion that is not the text (the lead's 09:16 reading; the blind reader).
- §3.1 **Vow**, "without bytes attached": no test tells a vow from an offer (the blind reader; 5.11.8).
- 5.11.7's payment "holds" K6, while §3.1 makes a task a field of an act that names a cMIP (the blind reader).
- M8 finds (INFERRED): a set's value in `relies_on` or `answers` cannot be told from an act id (M8, for the text, 1).
- M8 finds: case 8 (5.8.6) cannot be checked from bytes (M8, 3).
- M8 finds: a held act that cannot be opened, named in `body`, is unsaid (M8, 4).
- M8 finds: a call's bytes stand without a text that gives them (M8, 5).
- M8 finds: no layer gives a keeper's identifier (M8, 6).
- The ledger's "A specification is a Text act, named by its id" (27 November, 14:47, his words and the lead's line, "a change to the Development MIR, queued behind draft 26"): draft 26's §2 reads Development draft 12's spec hash; whether its words change when Development does is not said.
- Which value is `SPEC_DRAFT_26`: E2's tagged hash, or the plain sha256 the assignment named.

## What waits on the codemeister

Encoding 3's section 11, "Open in this text, not yet chosen": 1 the set's label; 2 how a set's members are joined; 3 where the set's rule stands; 4 which fields may hold a set's value (and Nobody, allegedly); 5 the keeper field's form; 6 whether the keeper list is sorted; 7 what a keeper's identifier is the hash of; 8 whether key 9 stands (and Nobody, allegedly); 9 a `words` act held without its key, or not held (and Nobody, allegedly); 10 which spec hashes are `TEXT` (and Nobody, allegedly); 11 how a cMIP's declared needs are read, case 8 (and Nobody, allegedly); 12 `SPEC_DRAFT_26`: both values written, which one is listed above. Also the impact sheet's line 1, vector 3 (**late** in draft 26, **unchecked** in the sheet: M10's "For M11", 11).

## What draft 26 hands to other texts

In full in the companion's last section, "What draft 26 hands to other texts".
- **The MICS**: the thirteen rules of how a reader answers and reads across legs, the report block, and the evidence-and-accounting line beside MOR's opening definition.
- **Envelopes**: the thirteen rules of the baker, the baker's rule for a contest, the three verbs (lodge, relay, fetch), and "uploader".
- **Identity**: rule 34 and the keeper's record; the pair to renumber; a key change continuing the signer's line ("Two threads, two owners", 17 November).
- **Development**: how a cMIP declares what it needs; N9's and N10's client halves; the client duty of 5.12.9; the common cMIPs; and the ledger's "A specification is a Text act, named by its id" (27 November), for the Development rewrite.

## The MOR lead's readings, by time

All of 27 November, given to the scribe, not in the ledger; each with the rules it shaped and the other reading, in the companion's section 6.
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

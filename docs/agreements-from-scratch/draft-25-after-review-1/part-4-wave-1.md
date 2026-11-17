# Draft 25 after review 1, part 4 of 4: the wave-1 list

17 November 2026. Written by Claude, the scribe's session R4. A map only: it changes no text in the repository, decides nothing, and proposes no wording, fix or rule for draft 25. It is one of four parts; a joining session puts them together.

**The wish** (Nobody, allegedly, quoted from the ledger, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." And what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". On now: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite." And the budget rule: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode." (as the ledger has it)

**Why** (the MOR lead's wording): to show him, before he zooms out, what draft 25 would look like with today's decisions in it: what goes, what moves, what changes, and how much is left.

**Words used here.**

- *Draft 25* is the rewrite of the Agreements rulebook, written from scratch (`docs/agreements-from-scratch/draft-25.md`, branch `claude/agreements-clean-1-hahuwn`). It is not merged. *The old Agreements* is draft 24, in `spec/`.
- *The wave-1 list* is the scribe's earlier list of everything in the repository that leans on the old Agreements: `docs/agreements-from-scratch/old-agreements-pointers.md`, branch `claude/old-agreements-pointers-knyyf4`. It has 1,886 *places* (one sentence or test step each), in 31 files, kept as rows in three part files:
  - C- rows: the seven core files (the MICS and the rulebooks of `spec/`).
  - S- rows: the freeze test suite.
  - D- rows: the case studies, the paper and the companions.
- *The MICS* is the core document over all six layers. The *layers below* are the other rulebooks (Identity, Text, Envelopes, Money, Development).
- *Today's decisions* are the ten ledger entries from "Three lines cut back" to "Only rules in the hashed text". The numbers 1 to 10 are the MOR lead's, from `docs/lead/assignments/2026-11-17-wave-2-common.md`. Each entry ends with an *"Arrived at (to check)" line*: the MOR lead's reading of what the exchange arrived at, not yet checked with Nobody, allegedly. Where that line says more than his words, this file follows his words.
- *Touched* means: the decision changes what the row's draft-25 counterpart is, where it lives, or whether it is open. It does not mean the row is fixed.
- Draft 25's rules are cited as G1 to G14 (G14.2 is clause 2 of G14) and its eight cMIP fields as K1 to K8. A *cMIP* is a separate document that a field of an agreement names, to answer one question. A *verifier* is the software that applies the rules and gives answers.

## In plain words

"Place" below, as in the wave-1 list, means one sentence or test step somewhere in the repository that leans on the old Agreements; each is one row of the list. The decision numbers are those of section 1.

1. Today's ten decisions (Nobody, allegedly's, listed in section 1) touch 530 of the wave-1 list's 1,886 places, a little over a quarter. Each place is counted once in the 530, though 90 of them are touched by two decisions or more.
2. Three decisions do most of it, 371 places between them: decision 9, draft 25's ordering register (its "place", G7) becomes a pointer to a relay (111 places); decision 8, in two parts, the rules for reading payment reports move into the MICS, the core document, and the rule for who holds a baked work's rights moves into the Envelopes rulebook (174); decision 2, only the update condition (who must sign a change) decides whether a new version replaces the old (97).
3. Two groups are wide and touched only lightly: places that cite a part of draft 25 which decision 10 sends to a companion document beside the rules, and places that rest on draft 24's ownership agreement, whose question decision 1 opens again. Leave both out and 460 of the 530 remain.
4. Draft 25 needs 42 things from the rulebooks below it: 20 in its own section 8.1, and 22 more the wave-1 list found (N1 to N22). 15 are touched: 10 of the 20 and 5 of the 22. Most are moved to a named home (the MICS, Envelopes, or the rulebook below that keeps acts and keys); two are answered in part (what a key change does; that all six rulebooks freeze together).
5. The wave-1 list has 52 cases where draft 25 does not say what stands (UC-01 to UC-52). 17 are touched: moved, changed or answered in part; only one is answered, for MOR 1 (a version written under the next protocol, MOR 2, replacing a MOR 1 one). The three questions of the wave-1 list's section 4b are all open again, by decision 1.

## 1. Today's decisions, as the ledger has them

Each decision is given with his words (Nobody, allegedly's) quoted from the ledger, and the "Arrived at (to check)" line in short. The ledger holds each exchange whole. Where a decision can be read two ways, both readings are in section 6.

| # | entry | his words | arrived at (to check), the MOR lead's, shortened |
|---|---|---|---|
| 1 | Three lines cut back | "Agreed." | three earlier "Arrived at" lines are cut back to his words. Open again: whether a holder of the baker's rights must be "bound by" the Terms, beyond being a party (G14.2); whether agreements play any part in stating ownership; whether a thief's Terms are "an act that never counted" |
| 2 | The two gates | "Case against c? And for it?"; "A, agreed" | (a): where the update condition answers valid, the update replaces the version it names; the new version's own `in_force` (its own rule for when it starts to apply) governs only its own later life |
| 3 | A way out by default | "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out" | (c): by default a signer can leave Terms that are in force; only Terms that say so can keep someone in, and those Terms have their own way out |
| 4 | Unclear means unchecked | "Agreed" | (b): where it is unclear whether someone's assent counts, every answer that depends on it is unchecked; an update is not shown as replacing the old Terms until that person's position is clear |
| 5 | Crossing to a new text | "Wait… let.s slow down. A move to MOR2 potentially does end it, unless it is updated to MOR2, we update core drafts, that problem does not exist out there once we freeze"; "Agreed" | nothing new in MOR 1; a move to MOR 2 ends a MOR 1 agreement unless it is updated to MOR 2; how MOR 2 accepts that is MOR 2's to write |
| 6 | Two threads, two owners | "It does" | both threads stay; the signer's line (every act one person signs) belongs to the layer below (Identity and the act format); the agreement's thread is Agreements'; a key change continues the signer's line, never starts a fresh one |
| 7 | One freeze | "I have never considered freezing them one by one. What would be the merit?"; "That was when I was going crazy with agreements… I just wanted out of it and have people help me. A lot of time has passed"; "Fine with me" | F84 stands: all six texts freeze together, once |
| 8 | Where three rules live | "Agreed for the first, not sure I get the second, expand on third too"; "Remind me where the report was born, what layer?"; "Agreed" | the baker's rule moves into Envelopes; the report block's home is the MICS, and the rules for reading reports (matched, mismatched, one side only, both amounts shown, unanswered) go with it; Agreements keeps the receiver, the call in Terms, the buyer's leg, the contest and the consent to data beyond one leg. The place: explained, not confirmed here (see 9) |
| 9 | The place is a pointer | "What the « place »?"; "So, it's a keeper of sorts?"; "It's just a pointer to a relay then. Why the need for more grammar?"; "Yes, agreed. My point was: this is simpler than what we are discussing.agreed" | the place is a pointer to a relay, a field in Terms, with one rule: where the Terms name a place, every reader takes what is latest from it and from nothing else. The rest of G7 leaves the grammar |
| 10 | Only rules in the hashed text | "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested." | a hashed text holds its rules and nothing else; history, open lists and reasons go into companion documents |

Decision 11 (vouchers) is his first project, not the core, and is left out.

## 2. The needs: draft 25's section 8.1 and N1 to N22

As the wave-1 list (section 4) gives them. "8.1-1" to "8.1-20" are the wave-1 list's numbers for draft 25's unnumbered items. "Moved" means the decision names the layer the item now belongs to; "answered" means the decision settles it; "changed" means the decision changes what is asked. None is answered in full.

### 2a. Draft 25's section 8.1

| # | the item, shortened | touched? | decision | how |
|---|---|---|---|---|
| 8.1-1 | the core's act format: fingerprints, a per-signer line of acts (which would make G6 redundant), acts signed by several, field names | touched | 6 | moved: the signer's line belongs to the layer below; Agreements only reads it. The rest of the item (fingerprints, several signers, field names) is not touched |
| 8.1-2 | a place: a name without a server address; one ordered line of acts; signed answers of position; "anything after it"; telling two answers of one place contradict (G7.2) | touched | 9 | changed: the place is a pointer to a relay, with one rule. Parts (2) to (5), and "which answers count per place", leave the grammar, to the relay or a cMIP |
| 8.1-3 | what the Sign layer does when a key is replaced or lost | touched | 6 | answered in part: a key change continues the signer's line and never starts a fresh one. A lost key is not said |
| 8.1-4 | how cMIPs are identified in practice | not touched | — | — |
| 8.1-5 | the report, a block of the shared language, and its unsaid parts | touched | 8 | moved: its home is the MICS, with the rules for reading reports. Its unsaid parts (how a call is written, and the rest) stay unsaid |
| 8.1-6 | the seams between draft 25 and the report block | touched | 8 | moved: these become seams with the MICS. What they say is not decided |
| 8.1-7 | seeing beyond one leg: what no layer may do with reports; what a data cMIP for agreements is | touched | 8 | changed: "the consent to data beyond one leg" stays in Agreements. What the shared language must refuse goes with the block to the MICS. See section 6, reading 8c |
| 8.1-8 | "the same payment", and Money's counting | touched | 8 | moved: reading across legs (G11.4) goes with the report block to the MICS. The value layer's answer is still asked |
| 8.1-9 | what a settlement and a payment are | not touched | — | — |
| 8.1-10 | how an amount is written | not touched | — | — |
| 8.1-11 | how much a proven liar must stand to lose | not touched | — | — |
| 8.1-12 | the verifier's answers in other layers; where "invalid" stops (P19) | touched | 1 | changed: one case of "invalid" is open again (whether a thief's Terms are "an act that never counted") |
| 8.1-13 | the envelope's chain: the bake names the baker, the transfer act, who may sign it, the holder at an act, a double sale as a fork; two envelopes of the same work | touched | 8, 1 | moved: the baker's rule goes into Envelopes, so the layer below this item asks of is named. Decision 1 opens again whether the holder must be "bound by" the Terms (G14.2) |
| 8.1-14 | what a clock is, which layer gives it, how it is named | touched | 9 | moved, by the "Arrived at" line: the clock is among "the rest of G7" that leaves the grammar. See section 6, reading 9a |
| 8.1-15 | an act signed by several at once; the core's `for` | not touched | — | — |
| 8.1-16 | a receiving side's "automatic" report on a way of paying | not touched | — | decision 8 moves the report to the MICS, but this item asks the layer that holds value, which no decision touches |
| 8.1-17 | a payment as an act; the payer's call | not touched | — | — |
| 8.1-18 | what access to what was bought is | not touched | — | — |
| 8.1-19 | whether the core already has a contest | not touched | — | decision 8 lists the contest among what Agreements keeps; the question to the core stays |
| 8.1-20 | what a client is; how a client is tested | not touched | — | — |

10 of 20 touched.

### 2b. The needs the wave-1 list added (N1 to N22)

| # | the need, shortened | touched? | decision | how |
|---|---|---|---|---|
| N1 | whether draft 25 is the Agreements MIR: one of the six frozen texts, layer 4, the hash the freeze computes | touched | 7, 10 | answered in part (7): all six freeze together, once. Which file and which hash are not said; see section 6, reading 7a. Changed (10): what is hashed is the rules alone |
| N2 | Development's task numbers and `task-ref` | not touched | — | — |
| N3 | which names which, cMIP or Module | not touched | — | — |
| N4 | the payment cMIP an agreement names | not touched | — | — |
| N5 | money sent to a bare bake (a baked work with no Terms) | touched | 8 | moved: the rule it is set against (G14, who holds the baker's rights) goes into Envelopes. Where the money goes is still not said |
| N6 | a payment naming a bake against Terms naming its envelope | touched | 8 | moved: the envelope side goes into Envelopes. Not answered |
| N7 | a buyer read from a payment claim | not touched | — | the buyer's leg stays in Agreements (8) |
| N8 | obligations: what is owed when an update replaces a version | not touched | — | the MOR lead's lean in decision 3 ("leaving never erasing what is owed") is not in his words or in the "Arrived at" line |
| N9 | a receiver that is an agreement | not touched | — | the receiver stays in Agreements (8) |
| N10 | fees | not touched | — | — |
| N11 | the vow as an Envelopes act | not touched | — | — |
| N12 | whether draft 25's "envelope" is Envelopes' bake (type 0) | touched | 8 | moved: the baker's rule now lives in Envelopes, beside the bake. Not answered |
| N13 | whether the envelope's transfer act needs a chain signature | touched | 8 | moved: the transfer act is Envelopes'. Not answered |
| N14 | delegated key release | not touched | — | — |
| N15 | Identity's keyless genesis | not touched | — | — |
| N16 | scoped keys | not touched | — | — |
| N17 | acknowledging without `acks` | not touched | — | decision 6 gives the signer's line to the layer below, but does not say what counts as acknowledging |
| N18 | text acts and `objects` | not touched | — | — |
| N19 | Text's rule 6, what a client shows before signing | not touched | — | — |
| N20 | an agreement as a specification's creator | not touched | — | — |
| N21 | extensions | not touched | — | — |
| N22 | the core's tag list | not touched | — | — |

5 of 22 touched.

**Section 4b of the wave-1 list** (the three "Arrived at" lines that said more than their exchanges): all three are touched by decision 1, which cuts them back. "Bound by them", "not by agreements" and "an act that never counted" are open again, as questions for the review.

## 3. The places, by decision

**How they were found.** Every row of the three part files was read by a script into its six cells: file, section, quote, what it leans on, what draft 25 has instead, kind. A row counts for a decision when a cell matches the pattern below (case ignored), minus the rows named as left out, each with its reason. Where a pattern alone would not pick the right rows, the rows were chosen by hand and are named. "Leans on" is the fourth cell; "draft 25" is the fifth. To rerun: apply the same patterns to the same cells of the three files on branch `claude/old-agreements-pointers-knyyf4`.

Ranges ("C-167 to C-168") run over rows that follow one another in their part file.

### Decision 1, three lines cut back (89 places; two groups)

**1a. "Bound by them" and "an act that never counted"** (19). Pattern, draft-25 cell: `G14\.2|G14\.3|bound by them|thief`. These rows rest on G14.2 (Terms for an envelope count only if the holder is a party, "bound by them") or G14.3 (Terms without the holder are invalid).

- C (13): C-029, C-040, C-156, C-167 to C-168, C-180 to C-182, C-385, C-416, C-580, C-628, C-798
- S (2): S-017, S-051
- D (4): D-496, D-520 to D-522

**1b. Whether agreements play any part in stating ownership** (76). Pattern, leans-on cell: part 1 `\bW13\b`, part 2 `\bW10\b`, part 3 `ownership agreement` (each part's own code for draft 24's ownership agreement). This is the widest reading of the reopened question: every row that rests on the ownership agreement, whatever draft 25 has in its place. It is counted apart in the totals.

- C (57): C-007, C-009, C-011, C-064, C-094, C-141, C-157 to C-162, C-164, C-171 to C-173, C-180 to C-182, C-185, C-188, C-201, C-209, C-211, C-225, C-228, C-259, C-271, C-467, C-484, C-516, C-523, C-528 to C-530, C-536, C-648, C-654, C-666, C-678, C-680, C-683, C-687, C-697, C-717, C-719, C-789, C-793, C-798, C-828 to C-829, C-834, C-864, C-897, C-967, C-983, C-985
- S (18): S-005, S-017, S-031, S-039, S-048, S-051 to S-052, S-084, S-093, S-099, S-136, S-138, S-141, S-190, S-241, S-284, S-295, S-310
- D (1): D-089

### Decision 2, the two gates (97 places)

Pattern, draft-25 cell: `G4\.11|update condition|\bK4\b|`condition`|in_force`. Left out: C-103, C-107, C-186, S-042, where `in_force` is about Terms first coming into force, not about an update. These rows point to the update condition (who must sign a change) as draft 25's answer. With decision 2 that answer stands alone: the new version's own `in_force` no longer decides whether it replaces the old one.

- C (49): C-027, C-100 to C-101, C-105 to C-106, C-110 to C-111, C-127 to C-130, C-132, C-134, C-136, C-143, C-150, C-166, C-195 to C-197, C-296, C-301, C-305, C-308, C-310, C-326, C-355 to C-356, C-362, C-374, C-409, C-430, C-457, C-470, C-475, C-499, C-513, C-661, C-745, C-854, C-899, C-918 to C-919, C-937, C-943 to C-944, C-973, C-987, C-1012
- S (7): S-064, S-077, S-099, S-127, S-184, S-187, S-288
- D (41): D-002, D-030, D-053 to D-054, D-063, D-066, D-074, D-088, D-091, D-100, D-103, D-106, D-111 to D-113, D-125, D-140, D-147, D-150, D-173, D-185, D-193, D-195, D-238, D-248, D-295 to D-296, D-314, D-355, D-367, D-386, D-393 to D-394, D-396, D-402 to D-403, D-413, D-437, D-490, D-505, D-510

### Decision 3, a way out by default (26 places)

Pattern, leans-on and draft-25 cells: `resign|\bleav|departed|rule 70|way out`. Left out: C-051, C-222, C-410, C-852, C-928, where "leave" means "leaves something to" and not a person leaving; D-539, the doors report's "the way out" (unclear case UC-51), which asks which text the report means. These rows are about a person leaving: resignation, departed holders, draft 24's rule 70 ("a member can always leave alone"), and draft 25's answer that a party leaves only by an update. With decision 3, a signer can leave by default.

- C (16): C-100, C-112, C-131, C-197, C-232, C-308, C-320 to C-321, C-324, C-331, C-405, C-408, C-995, C-1019 to C-1021
- S (6): S-061, S-173, S-178, S-185, S-192, S-227
- D (4): D-106, D-403, D-493, D-528

### Decision 4, unclear means unchecked (4 places)

Pattern, leans-on and draft-25 cells: `rule 48|reduced without`. These are the rows on a share reduced without its holder's signature, which is the case decision 4 was set out on (Carla's share taken by an update she did not sign). No row of the three parts speaks of an assent withdrawn in an unclear order or held private. That was searched for in every cell, with `withdraw… assent|signature`, `cancel… assent`, `unread`: nothing found.

- C (3): C-099, C-130, C-166
- D (1): D-054

### Decision 5, crossing to a new text (16 places)

Chosen by hand. First every row was found whose quote matches `MOR ?2|migrat`, or that sits in the case study "Migration to MOR2" or in "The path to MOR 2". From those, the rows kept are the ones where agreements, works or the texts themselves cross into MOR 2, or stay or end in MOR 1. Left out: C-079, C-468 and C-766 (things "noted for MOR 2", not a crossing); D-103 and D-111 (the clone rule, counted under decision 2); D-105 (moving between cMIPs); D-106 (leaving, under decision 3); D-107 (withdrawing a publication); D-109 (key grammar); D-119 (keepers, under decision 9); D-524 to D-526 (tasks, extensions, fees).

- C (2): C-877, C-943
- S (1): S-093
- D (13): D-104, D-108, D-110, D-112 to D-118, D-120 to D-121, D-523

### Decision 6, two threads, two owners (25 places)

Pattern, leans-on and draft-25 cells: `\bG6|signer.s line|per-signer|one signer.s acts|rotat|key (is )?replaced|replaced or lost`. Left out: D-002 and D-303, where the rotation is a collective's, and draft 25 has no keys there. These rows point to draft 25's G6 (one signer's line of acts) or to what happens when a key is replaced. With decision 6, that line belongs to the layer below.

- C (20): C-002, C-028, C-052, C-098, C-118 to C-119, C-262, C-277, C-393, C-485, C-524, C-538, C-589, C-670, C-765, C-768, C-770, C-773, C-829, C-853
- S (2): S-105, S-129
- D (3): D-305, D-312, D-317

### Decision 7, one freeze (37 places)

Chosen by group: the rows of unclear cases UC-20, UC-26 and UC-30 in the wave-1 list (whether draft 25 is the Agreements MIR, one of the six, and under which hash). Searching for `freez|frozen` gave mostly rows where the word only sits in a quote about collectives; those are not counted. With decision 7, all six freeze together once; which text and which hash Agreements freezes under is not said.

- C (36): C-003 to C-004, C-023, C-093, C-096, C-461, C-514 to C-515, C-537, C-566, C-658, C-677, C-711, C-721, C-766, C-852, C-869, C-873, C-877, C-894, C-940 to C-942, C-964, C-968 to C-971, C-979 to C-980, C-984, C-991, C-998, C-1023 to C-1025
- S (1): S-312

### Decision 8, where three rules live (174 places; two groups)

**8a. The baker's rule, into Envelopes** (78). Pattern, draft-25 cell, after removing the ranges "G1..G14" and "G1 to G14": `G14|baker|envelope.s chain`. These rows point to G14 (the envelope, its baker, the transfer of the baker's rights) as draft 25's answer. With decision 8, that rule lives in Envelopes, and Agreements only asks whether the holder is a party.

- C (52): C-002, C-009, C-012, C-029, C-039 to C-040, C-055 to C-056, C-059, C-152 to C-156, C-162, C-167 to C-168, C-180 to C-182, C-193, C-385, C-416, C-467, C-483, C-486, C-530, C-536, C-548, C-579 to C-580, C-596 to C-597, C-628, C-655, C-666, C-680, C-682 to C-683, C-685 to C-686, C-688, C-699, C-705, C-711, C-714, C-797 to C-798, C-821, C-835, C-903, C-985
- S (4): S-017, S-051, S-133, S-136
- D (22): D-011 to D-012, D-067, D-076, D-089, D-092, D-122, D-127, D-175, D-183, D-199, D-226, D-243, D-251, D-270, D-286, D-352, D-384, D-496, D-520 to D-522

**8b. The report block, into the MICS** (97). Pattern, draft-25 cell: `leg reports?|\breports?\b|G11\.4|G11\.5|mismatch|\bmatched|unanswered|one side only`. These rows point to a leg report, or to the rules for reading reports, as draft 25's answer. With decision 8, the report and those rules live in the MICS. Rows pointing only to what Agreements keeps (G11.7 the buyer's leg, G11.8 the contest, K6 the Control field) are not counted unless they also name a report.

- C (52): C-007, C-027, C-030, C-062, C-077 to C-078, C-095, C-099, C-118, C-183, C-202, C-206, C-209, C-214 to C-215, C-220, C-223, C-228, C-231 to C-232, C-240 to C-241, C-245, C-345, C-465, C-473, C-486, C-679, C-687, C-692, C-717, C-723, C-751, C-753, C-764, C-789, C-794, C-802 to C-804, C-806, C-827, C-830 to C-831, C-862, C-874, C-889, C-898, C-920, C-925, C-931, C-967
- S (11): S-016, S-054, S-057 to S-058, S-064, S-103, S-139, S-144, S-153, S-287, S-296
- D (34): D-010, D-016, D-024 to D-025, D-027, D-049, D-055, D-073, D-093, D-097, D-131, D-136, D-141, D-146, D-167, D-179, D-196, D-201, D-219, D-222, D-227 to D-228, D-247, D-263, D-289, D-313, D-419, D-422, D-424, D-440, D-444, D-466, D-486, D-507

The third rule of decision 8, the place, is counted under decision 9.

### Decision 9, the place is a pointer (111 places)

Pattern, draft-25 cell: `\bplace\b|\bG7\b|G7\.|clock|per place`. Left out: C-006 ("in place of", not the place). These rows point to draft 25's place (G7), which stands in for draft 24's keepers, or to its clock (G7.4). With decision 9, the place is a pointer to a relay with one rule, and the rest of G7 leaves the grammar. 31 of the rows point only to the clock; their touch depends on reading 9a (section 6).

- C (52): C-002, C-007, C-025 to C-026, C-037, C-039, C-042, C-044, C-067, C-118, C-121, C-137, C-183, C-185, C-196, C-246 to C-248, C-253 to C-256, C-258, C-260 to C-266, C-269, C-279, C-394, C-401, C-428, C-432, C-471 to C-472, C-509, C-511, C-534, C-538, C-576, C-673, C-701, C-708, C-711, C-762, C-900 to C-901, C-936, C-983
- S (8): S-003, S-032, S-068, S-100 to S-101, S-122, S-154, S-286
- D (51): D-008 to D-009, D-036 to D-037, D-040, D-057, D-084 to D-086, D-089, D-098, D-100, D-119, D-124, D-126, D-134, D-138 to D-139, D-148, D-156, D-164, D-170, D-191, D-211, D-216, D-235, D-259, D-264 to D-265, D-291, D-297, D-321, D-330 to D-331, D-339, D-347, D-351, D-354, D-373, D-390 to D-391, D-411 to D-412, D-428, D-456, D-465, D-475, D-481, D-487, D-512, D-537

### Decision 10, only rules in the hashed text (53 places)

Pattern, draft-25 cell: `section 8|section 6\b|\bP\d{1,2}\b|preamble|reasons-25|open parameter`. These rows point, for draft 25's answer, to a part of draft 25 that is not a rule: its preamble, its open parameters (section 6, P1 to P21), its open lists (section 8, 8.1, 8.4) or its reasons. With decision 10, those parts leave the hashed text for companion documents. For most of these rows only the address of the pointer changes, not what it says. It is counted apart in the totals.

- C (49): C-002, C-006, C-010, C-012, C-025 to C-027, C-060, C-067, C-069, C-071, C-083, C-087, C-118, C-189, C-213, C-215, C-253 to C-256, C-262, C-266, C-461, C-478 to C-479, C-509, C-511, C-522, C-544, C-548 to C-549, C-567, C-575, C-579 to C-580, C-597, C-628, C-711, C-720 to C-721, C-723, C-728, C-756, C-764, C-789, C-791, C-828, C-858
- S (2): S-031, S-151
- D (2): D-015, D-037

## 4. The unclear cases (UC-01 to UC-52)

17 of the 52 are touched: one is answered (UC-48, for MOR 1), the others are moved, changed or answered in part. Each is given with the words of Nobody, allegedly, that touch it; the "Arrived at" line is the MOR lead's. The other 35 are not touched by any decision: UC-02, UC-03, UC-05, UC-06, UC-07, UC-09, UC-10, UC-11, UC-15, UC-16, UC-17, UC-18, UC-19, UC-21, UC-22, UC-23, UC-24, UC-25, UC-27, UC-29, UC-31, UC-32, UC-34, UC-36, UC-37, UC-38, UC-40, UC-41, UC-42, UC-44, UC-45, UC-47, UC-49, UC-51, UC-52.

| case | what it asks, shortened | decision | what the decision does (moved, changed, answered in part, answered) | his words |
|---|---|---|---|---|
| UC-01, UC-50 | a co-owner sells the work alone: valid, or invalid under G14.3 | 8, 1 | moved (8): the baker's rule goes into Envelopes, and Agreements asks only whether the holder is a party. Open again (1): whether that holder must be "bound by" the Terms. Not answered | "Agreed for the first"; "Agreed." |
| UC-04 | a signer rotates their key and disowns an act others relied on | 6 | answered in part: a key change continues the signer's line and never starts a fresh one, and that line is the layer below's. Whether a rotation can disown an act is not said | "It does", his answer to the MOR lead's lean as a whole (see section 6, reading 6a) |
| UC-08 | acts racing the end of a power, with no order and no place named: "per place" or "not shown" | 9 | changed: "which answers count per place" leaves the grammar; one rule is left, for Terms that name a place. Where Terms name none, not answered | "It's just a pointer to a relay then. Why the need for more grammar?"; "Yes, agreed." |
| UC-12 | a share reduced without its holder's signature | 2, 4 | changed (2): the update condition alone decides whether the update replaces the old version. Changed (4): where it is unclear whether the holder's assent counts, the update is not shown as replacing until that is clear | "A, agreed"; "Agreed" |
| UC-13 | "the payment decides", and a wrong receipt | 8 | moved: matched and mismatched are reading rules of the report block, now the MICS's | "Agreed" |
| UC-14, UC-28, UC-33 | money sent to a bare bake, or a tip | 8 | moved: the rule they are set against (G14) goes into Envelopes. Where the money goes is not answered | "Agreed for the first" |
| UC-20, UC-26, UC-30 | whether draft 25 is the Agreements MIR, one of the six, in `spec/`, under which hash | 7, 10 | answered in part (7): all six freeze together, once. Changed (10): the hashed text holds only rules. Which file and which hash are not said | "Fine with me"; "Yes, the text should be just that." |
| UC-35 | works, offers, shares and receivers | 1 | open again, on the widest reading (group 1b): whether agreements play any part in stating ownership | "Agreed." |
| UC-39 | keys, rotations, keyless identities, "disputed" | 6 | answered in part, for rotations only: a key change continues the signer's line | "It does" |
| UC-43 | the place (C-260, C-266) | 9 | changed: the place is a pointer to a relay; signed answers of a place (C-266) leave the grammar | "It's just a pointer to a relay then."; "Yes, agreed." |
| UC-46 | "publication" in Envelopes' older sense; the bake | 8 | moved, for the bake (C-666): the baker's rule now lives in Envelopes, beside the bake | "Agreed for the first" |
| UC-48 | a MOR 2 act replacing a MOR 1 version | 5 | answered for MOR 1: nothing new in MOR 1; a move to MOR 2 ends a MOR 1 agreement unless it is updated to MOR 2; how MOR 2 accepts that is MOR 2's | "A move to MOR2 potentially does end it, unless it is updated to MOR2"; "Agreed" |

UC-31 (records of earlier drafts and approvals, all in `spec/README.md`) is not counted: decision 10 speaks of the hashed text, and the sources read here do not say whether that README is hashed. UC-51 ("the way out" in the doors report) shares words with decision 3's title but asks which text the report means; not counted.

## 5. Counts

### By decision

| decision | C | S | D | places |
|---|---|---|---|---|
| 1a, "bound by them", "never counted" | 13 | 2 | 4 | 19 |
| 1b, ownership reopened (widest reading) | 57 | 18 | 1 | 76 |
| *1, both groups, once each* | | | | *89* |
| 2, the two gates | 49 | 7 | 41 | 97 |
| 3, a way out by default | 16 | 6 | 4 | 26 |
| 4, unclear means unchecked | 3 | 0 | 1 | 4 |
| 5, crossing to a new text | 2 | 1 | 13 | 16 |
| 6, two threads, two owners | 20 | 2 | 3 | 25 |
| 7, one freeze | 36 | 1 | 0 | 37 |
| 8a, the baker into Envelopes | 52 | 4 | 22 | 78 |
| 8b, the report block into the MICS | 52 | 11 | 34 | 97 |
| *8, both groups, once each* | | | | *174* |
| 9, the place is a pointer | 52 | 8 | 51 | 111 |
| 10, only rules in the hashed text (pointer moves) | 49 | 2 | 2 | 53 |
| **any decision, each place once** | **314** | **53** | **163** | **530 of 1,886** |
| without 1b | 281 | 41 | 163 | 485 |
| without 10 | 293 | 52 | 162 | 507 |
| without 1b and 10 | 259 | 39 | 162 | 460 |

90 places are touched by two decisions or more; they are listed under each and counted once in the totals.

### By file

Columns are the decisions; "any" counts each place once.

| file | 1a | 1b | 2 | 3 | 4 | 5 | 6 | 7 | 8a | 8b | 9 | 10 | any | of |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `spec/02-MOR-MICS-v37.md` | 10 | 36 | 37 | 12 | 3 | 0 | 11 | 8 | 28 | 27 | 41 | 29 | 185 | 536 |
| `spec/MIR-identity-draft-16.md` | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | 6 | 0 | 2 | 9 | 15 | 96 |
| `spec/MIR-text-draft-11.md` | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 5 | 30 |
| `spec/MIR-envelopes-draft-12.md` | 0 | 6 | 0 | 0 | 0 | 0 | 1 | 2 | 11 | 3 | 4 | 1 | 21 | 52 |
| `spec/MIR-money-draft-14.md` | 1 | 9 | 2 | 0 | 0 | 0 | 6 | 4 | 4 | 15 | 1 | 10 | 42 | 156 |
| `spec/MIR-development-draft-12.md` | 0 | 2 | 7 | 0 | 0 | 2 | 0 | 12 | 1 | 7 | 3 | 0 | 31 | 109 |
| `spec/README.md` | 0 | 2 | 2 | 4 | 0 | 0 | 0 | 7 | 1 | 0 | 1 | 0 | 15 | 55 |
| *the core, part 1* | | | | | | | | | | | | | *314* | *1,034* |
| `spec/03-MOR-freeze-test-suite-v37.md` | 2 | 18 | 7 | 6 | 0 | 1 | 2 | 1 | 4 | 11 | 8 | 2 | 53 | 313 |
| case study 04, augmented democracy | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 4 | 10 |
| case study 08, musician to label | 0 | 0 | 4 | 0 | 1 | 0 | 0 | 0 | 2 | 6 | 4 | 2 | 17 | 54 |
| case study 09, cat video to coproduction | 0 | 1 | 5 | 0 | 0 | 0 | 0 | 0 | 4 | 3 | 6 | 0 | 16 | 38 |
| case study 10, migration to MOR2 | 0 | 0 | 5 | 1 | 0 | 12 | 0 | 0 | 0 | 0 | 1 | 0 | 16 | 19 |
| case study 11, journalism | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | 5 | 0 | 10 | 18 |
| case study 12, gig economy | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 4 | 0 | 10 | 33 |
| case study 13, gaming | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 2 | 1 | 1 | 0 | 8 | 23 |
| case study 14, learning and work | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 3 | 12 |
| case study 15, advertising | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 10 |
| case study 16, commerce | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 4 | 1 | 0 | 6 | 18 |
| case study 17, live sports | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | 3 | 0 | 9 | 34 |
| case study 18, adult content | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 15 |
| case study 19, software | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 2 | 0 | 6 | 19 |
| case study 20, AI | 0 | 0 | 1 | 0 | 0 | 0 | 3 | 0 | 0 | 1 | 4 | 0 | 9 | 41 |
| case study 21, academic publishing | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 4 | 0 | 7 | 36 |
| case studies' README | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 4 |
| the paper, draft 3 | 0 | 0 | 7 | 1 | 0 | 0 | 0 | 0 | 0 | 2 | 4 | 0 | 13 | 39 |
| the unwritten layer, v3 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 6 | 0 | 13 | 67 |
| who can earn, v6 | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 0 | 6 | 27 |
| core principle: legible greed, v3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 3 | 5 |
| the path to MOR 2, draft 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 4 |
| MOR in one page, v11 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 2 | 11 |
| the doors list, 9 October 2026 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| *the documents, part 3* | | | | | | | | | | | | | *163* | *539* |

### The needs and the unclear cases

| | touched | of |
|---|---|---|
| draft 25's section 8.1 | 10 | 20 |
| N1 to N22 | 5 | 22 |
| all needs | 15 | 42 |
| section 4b's open lines | 3 | 3 |
| unclear cases | 17 | 52 |

## 6. Decisions that can be read two ways

Both readings are given; neither is chosen.

- **3a. What "agreements have their own way out" asks.** (i) Terms that keep someone in must themselves contain a way out. (ii) Such Terms are left to their own update condition, which is their way out already. The "Arrived at" line says "those Terms have their own way out", which fits both.
- **4a. How far "unclear means unchecked" reaches.** (i) Every answer that depends on an unclear assent ("every answer that depends on it", in the "Arrived at" line). (ii) Only whether an update replaces the old Terms, the case set out (Carla's). His word is "Agreed", to the case.
- **5a. "potentially does end it".** (i) A move to MOR 2 ends a MOR 1 agreement unless it is updated to MOR 2 (the "Arrived at" line). (ii) It may or may not end it, and MOR 2 decides which. Either way, "nothing new in MOR 1" leaves draft 25's G4.9 ("an agreement never ends") as it is inside MOR 1. That touches rows D-108, D-115 and D-120, which cite G4.9 about the crossing.
- **6a. What "It does" answers.** The ledger records the MOR lead's lean in full and then "It does". (i) It agrees with the whole lean: both threads, the line to the layer below, the key change continuing the line. (ii) It answers only the last thing asked, which the ledger does not quote as a question.
- **7a. What "Fine with me" says of Agreements.** (i) F84 stands, so Agreements is one of the six texts that freeze together. (ii) It says only when the six freeze, and not whether draft 25's file, under its own hash, is the Agreements text that freezes (N1).
- **8a. What the last "Agreed" covers.** He agreed to the first rule (the baker); on the second he asked where the report was born, was told, and said "Agreed". (i) It covers the report block's home and the list of what Agreements keeps. (ii) It covers the report block's home only; the list of what Agreements keeps is the MOR lead's.
- **8b. How much of G14 moves into Envelopes.** (i) The whole baker's rule, Agreements keeping only "whether the current holder is a party" (G14.2 in part). (ii) Only the envelope's chain; G14.3 (Terms without the holder are invalid) and G14.5 (a copier's bake shown beside) stay with Agreements. Also: decision 8 says "the current holder", while the earlier envelope exchange (wave-1 list, 4b) moved to the holder "at that point". Which one Agreements asks about is not said.
- **8c. Where "a report goes no further than its leg" (G11.6) lives.** (i) It is a rule of the report block, and moves to the MICS (the block's own need, 8.1-5, says "in every layer"). (ii) It is part of "the consent to data beyond one leg", which Agreements keeps. The rows citing G11.6 are counted under 8b either way.
- **9a. Whether the clock leaves with the place.** (i) Yes: the "Arrived at" line sends "the rest of G7" out of the grammar, and the MOR lead's list of what goes named the clock. (ii) His words speak only of the place ("It's just a pointer to a relay"); the clock (G7.4) is not named by him. 31 of decision 9's rows point only to the clock (C-025, C-121, C-183, C-185, C-246, C-428, C-471, C-762, C-900, S-068, S-122, S-286, D-008, D-009, D-036, D-040, D-084, D-086, D-100, D-156, D-211, D-216, D-235, D-265, D-291, D-297, D-330, D-339, D-347, D-390, D-411).
- **10a. Which texts "the text" means.** (i) Draft 25 (or the Agreements text that follows it), the text the proposal was about. (ii) Every hashed text: the MICS and the other rulebooks too. On reading (ii), more rows would be touched (records of earlier drafts kept inside hashed texts); they are not counted here.

## 7. The cold reader's check

Before the push, "In plain words" and five entries drawn at random (8.1-9, 8.1-16, N4, UC-04, UC-08) were given to a subagent that had seen neither the ledger nor the prompt. It listed 41 stumbles.

**Fixed in the wording.** "Places" now said, in "In plain words", to be rows of the list and not the protocol's place; that 530 counts each place once; how many places the three main decisions cover together (371); that 460 is a part of 530; what the two light groups are and which decision makes each; that decision 8 is one decision in two parts; where the 42 needs and the 52 unclear cases come from, and what N- and UC- mean; "the layers below" and "the layer below" said in one way; which decision reopens section 4b; the decision numbers pointed to section 1; MICS, Envelopes, update condition and MOR 2 given a few words each; 8.1-16's note no longer looks like a decision against "—"; the unclear cases' column header now names "changed" and "answered in part"; UC-04's "It does" said to answer the MOR lead's whole lean.

**Not fixed.** The protocol's words (relay, pointer, Terms, the grammar, cMIP, signer's line, key rotation, a power, "per place", "not shown", settlement, receiving side, baker) are explained in "Words used here" and section 1, which the reader was not given, or need draft 25 itself; a map cannot explain draft 25 again at each row. The tables have different columns because they hold different things (needs, cases), as their headings say. The randomly drawn entries included three "not touched" rows; they are shown as drawn. Who "he" is is said at the head of the file. Whether a key change (8.1-3) and UC-04 are the same thing counted twice: they are, on purpose; one is a need and one an unclear case, and each list is counted on its own.

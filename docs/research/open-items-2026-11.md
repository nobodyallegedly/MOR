# The open items on the new Agreements, sorted

17 November 2026. Written by Claude, for the MOR lead. A record of work, not a decision.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions." On the budget: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

This is reading only. It lists, sorts and cites. It judges no rule and proposes no fix. No text, code or vector was changed.

## In plain words: what is open

1. **234 open items**, once the same question found in two sources is counted once. They come from draft 25 (sections 6 to 9), the second verifier's report, the second encoding's report and the Kišib report.
2. **124 point at the grammar itself** (G): the text reads two ways, or rests on a reading nobody has confirmed, or states a cost that follows from a rule.
3. **40 change a verifier's answer.** 13 are the verifier report's own; for the other 27 that is my inference, said with each. For 104 more I cannot tell.
4. **26 are a cMIP's** (C): the text hands them, in words, to a cMIP in a socket it already has. Most go to the update condition (K4, 8), a service or escrow (K6, 6) and the data path (K8, 4).
5. **39 wait on another layer** (L): a place, a clock, what the Sign layer does with a lost key, Money's payment and settlement, the envelope's chain, and the report block, which is still a proposal in no spec.
6. **12 are about the bytes only** (E).
7. **33 fit none of the four, or I cannot tell.** 16 are limits the text states and says no rule closes; 7 are places where the ledger's line says more than the exchange; 3 are contradictions between sources; 7 are left where the text does not say enough.
8. **46 touch the way out.** The plainest: draft 25 gives no way to leave Terms once they are in force, unless the Terms name an update condition that allows it (OI-033); and the client rule points at a guarantee the text does not hold (the contradiction listed in cluster 9).
9. **The verifier's 13 are spread over five clusters**: seven in coming into force and lateness (cluster 1), one in forks (2), one in acting for others (3), two in legs and reports (4) and two on the baker (6). No sheet of the 13 in plain words was found on any branch, so the report's own words are used.
10. **58 items are known here only from one line of section 8.4**, which points into `history.md`. For those, what the item asks is the bullet's own wording, and whether it changes an answer is mostly "can't tell".

## Whether the frame held

**It held for the larger part, and broke on its own test.** The frame says most open items are either a reading the text leaves two ways (the grammar's) or something a cMIP in an existing socket can say (a cMIP's). 150 of 234 are one or the other (124 G, 26 C): a majority. But 84 fit neither, which is many:

- **39 belong to another layer, or to the report block** (L). 30 are in cluster 7, 5 are the baker's and sit in cluster 6, 3 are about what a client must show (cluster 9) and 1 is a tool's (cluster 8).
- **12 belong to the bytes only** (E). 10 are in cluster 8 and 2 in cluster 4.
- **16 fit none of the four.** They are limits the text states and says no rule closes (minds, force outside the protocol, a witness's honesty), and requests about tools. The coding has no value for them; they are recorded as "can't tell" with the words "fits none of the four". They are in clusters 9 and 8, with a few beside the rule they sit under.
- **10 are not about a rule at all**: 7 places where the ledger's arrived-at line says more than the exchange, and 3 contradictions between sources.

So three clusters were added that the frame did not foresee: **what the layers below and the shared language have not yet given** (7), **bytes, vectors and tools** (8), and **limits the text states, the record, the words and the client** (9).

Two more things about the frame, as counts and not as judgments:

- **The two halves are unequal.** G is 124 and C is 26. None of the verifier report's 24 open questions is C. The C items come from section 5.2, section 7 and section 8.2 of draft 25.
- **G is wider than "reads two ways".** Of the 124 G items, 39 change an answer (two honest verifiers would differ), 27 do not, and for 58 I cannot tell. 9 of the G items are stated costs that follow from a grammar rule, where no reading is in doubt.

## The clusters, with their counts

| # | Cluster | Items | C | G | E | L | can't tell | change an answer | touch the way out |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Coming into force, updating, order and lateness (OI-001 to OI-039) | 39 | 6 | 33 | 0 | 0 | 0 | 19 | 16 |
| 2 | Forks, and resolving them (OI-040 to OI-065) | 26 | 1 | 25 | 0 | 0 | 0 | 4 | 2 |
| 3 | Acting for others: agreements as parties, powers, agents, spots (OI-066 to OI-090) | 25 | 7 | 16 | 0 | 0 | 2 | 5 | 9 |
| 4 | Legs, reports and money (OI-091 to OI-120) | 30 | 6 | 19 | 2 | 0 | 3 | 4 | 0 |
| 5 | Seeing beyond one leg, and the contest (OI-121 to OI-138) | 18 | 5 | 12 | 0 | 0 | 1 | 1 | 0 |
| 6 | The baker and the envelope (OI-139 to OI-161) | 23 | 1 | 15 | 0 | 5 | 2 | 6 | 13 |
| 7 | What the layers below and the shared language have not yet given (OI-162 to OI-192) | 31 | 0 | 0 | 0 | 30 | 1 | 1 | 5 |
| 8 | Bytes, vectors and tools (OI-193 to OI-209) | 17 | 0 | 0 | 10 | 1 | 6 | 0 | 0 |
| 9 | Limits the text states, the record, the words and the client (OI-210 to OI-234) | 25 | 0 | 4 | 0 | 3 | 18 | 0 | 1 |
| | **Total** | **234** | **26** | **124** | **12** | **39** | **33** | **40** | **46** |

**The check.** The total is 234. By the cMIP check: 26 C + 124 G + 12 E + 39 L + 33 can't tell = 234. By whether an answer changes: 40 yes + 90 no + 104 can't tell = 234. By the way out: 46 yes + 176 no + 12 can't tell = 234. By area: 163 core + 50 development + 21 presentation = 234. The counts are computed from the list, not added by hand.

**The way out, by what it touches** (the first ground named with each item): leaving, ending or taking a signature back, 18; anchored history, 13; succession, 13; portable identity, 2. No item in these sources is about cloning an agreement across.

**The verifier report's numbers, and where each is in the list.** Those that change an answer (13): A1 is OI-001, A2 is OI-139, A3 is OI-002, A4 is OI-003, A5 is OI-004, A6 is OI-005, A8 is OI-066, A9 is OI-014, A10 is OI-040, A11 is OI-140, A12 is OI-008, N1 is OI-091, N2 is OI-092. Those that do not (11): B1 is OI-012, B2 is OI-073, B3 is OI-141, B4 is OI-142, B5 is OI-121, B6 is OI-122, B7 is OI-048, B8 is OI-049, B9 is OI-193, B10 is OI-047, N3 is OI-094. A7 is settled and is not listed.

## The full list

**How to read it.** The unit is one open item. Each has six lines, fixed before the reading:

1. what it asks, in plain words (the line in bold);
2. the area: core, development or presentation;
3. the cMIP check: **C** (choosing another cMIP, or a cMIP in an existing socket, already answers it; the socket is named, K1 to K8), **G** (it points at the grammar itself; the grammar rule is named), **E** (the encoding only), **L** (another layer, or the report block), or **can't tell**; then how sure: "the text says so", with the sentence quoted, or "inferred", with from what;
4. whether it changes a verifier's answer: yes, no or can't tell;
5. whether it touches the way out (leaving, ending, succession, portable identity, cloning an agreement across, anchored history), with the rule;
6. its source: file, section and the source's own number.

**The files.** `draft-25.md` and `encoding-2-report.md` are in `docs/agreements-from-scratch/` on branch `claude/agreements-clean-1-hahuwn`; `verifier-2-report.md` is in the same folder on branch `claude/agreements-verifier-2`; `kishib-agreements-new-report.md` is in `docs/` on branch `claude/kishib-agreements-new`. "From draft 16's list" and the like are the paragraphs of draft 25's section 8.4.

**Three readings of mine, so that the coding can be redone if they are wrong.**

- *The areas.* The sources do not define them. I read **core** as what a verifier answers from acts, the sockets included; **development** as what a builder needs in order to build and test it (bytes, what other layers must hand over, vectors, tools); **presentation** as what a person is shown and the words used (clients, names, the record's wording).
- *A stated cost.* Section 8 of draft 25 says sections 6 and 7 are open too, so each cost of section 7 is an item. It is C where the text itself names the cMIP that answers it, G where it follows from a grammar rule the cost names, L where it waits on another layer, and "fits none of the four" otherwise.
- *The unit in section 8.4.* Section 8.4 lists what is open from earlier drafts as short bullets that point into `history.md`. One bullet is one item, unless it names things that are items elsewhere, which are merged there. A finer cut would give a higher total.

The near-miss rule was kept: an item the text hands to a cMIP in words is C even though no such cMIP exists yet; an item where two honest verifiers would answer differently from the same acts is G, even where a cMIP could paper over it.

### Cluster 1. Coming into force, updating, order and lateness (39)

**OI-001. Which answer word a verifier gives for an update that came late.**
- Area: core.
- cMIP check: **G** (G4.7(c)). How sure: the text says so: "About L, a verifier answers that it replaces nothing and is no tip" (`draft-25.md`, G4.7(c)).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 1 (A1)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A1; draft-25.md, section 8.4, from draft 21's list (its 8.2, items 1 to 8: "the answer about a late update").

**OI-002. Under a named place, is the later of two updates always late, so that a fork of Terms stands only where both become valid at one position; and which anchoring counts.**
- Area: core.
- cMIP check: **G** (G4.7(b)). How sure: the text says so: "Under a named place, the later of two updates is late, so a fork of Terms stands only where both become valid at one position." (`verifier-2-report.md`, section 3, item 3).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 3 (A3)).
- Touches the way out: yes (anchored history: G4.7(b)).
- Source: verifier-2-report.md, sections 2 and 3, A3; draft-25.md, section 8.4, from draft 21's list (its 8.2, items 1 to 8: "which knots and which anchoring count").

**OI-003. Which namings (knots) show an update late: one act's alone, or several added together.**
- Area: core.
- cMIP check: **G** (G4.7(a)). How sure: the text says so: "L's own namings, or one needed assent's, each alone, not several added together." (`verifier-2-report.md`, section 3, item 4).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 4 (A4)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A4; draft-25.md, section 8.4, from draft 21's list (its 8.2, items 1 to 8: "which knots and which anchoring count").

**OI-004. Which act that is not held "might be what shows" an update late, so that the answer is unchecked.**
- Area: core.
- cMIP check: **G** (G4.7(c)). How sure: the text says so: "and that act might be what shows L came late" (`draft-25.md`, G4.7(c)).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 5 (A5)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A5.

**OI-005. Is a signer whose assent may have been cancelled, the order not being shown, among "everyone who signed the original".**
- Area: core.
- cMIP check: **G** (G4.8(a)). How sure: the text says so: "its signer is not counted among those who signed the original" (`verifier-2-report.md`, section 3, item 6).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 6 (A6)).
- Touches the way out: yes (who must sign an update, which is the only way an agreement changes: G4.8(a), G4.11(e)).
- Source: verifier-2-report.md, sections 2 and 3, A6.

**OI-006. Whether "the original" is rightly read as the version an update would replace.**
- Area: core.
- cMIP check: **G** (G4.8(a)). How sure: the text says so: "**The original**, said of an update, is the version that update would replace" (`draft-25.md`, section 2, "Version").
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.2, item 5).

**OI-007. What replaces Terms that no one signed: the default then asks for no one's signature.**
- Area: core.
- cMIP check: **G** (G4.8(a)). How sure: the text says so: "Where no one signed the original (its `in_force` rule asked for no one's assent), the default asks for no one's signature" (`draft-25.md`, G4.8(a)).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (who can replace an agreement's Terms: G4.8(a)).
- Source: draft-25.md, G4.8(a) ("that is listed as open"); section 8.4, from draft 20's list (its 8.3), draft 19's list (its 8.3) and draft 18's list (its 8.2, item 6).

**OI-008. Which counter signature is "the first" where two follow an assent and neither follows the other.**
- Area: core.
- cMIP check: **G** (G4.10). How sure: the text says so: "the one that follows no other; between two that follow none of each other, the first by id" (`verifier-2-report.md`, section 3, item 11).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 11 (A12)).
- Touches the way out: yes (taking an assent back before Terms are in force: G4.10).
- Source: verifier-2-report.md, sections 2 and 3, A12.

**OI-009. Whether "until every party has signed" means "until the Terms are in force" where an `in_force` rule asks for fewer signatures than everyone's.**
- Area: core.
- cMIP check: **G** (G4.10). How sure: the text says so: "A counter signature is available only until every party has signed, which these grammar rules read as: until those Terms are in force (G4.1)." (`draft-25.md`, G4.10).
- Changes a verifier's answer: yes (inferred: under the other reading a counter signature made after the Terms are in force, and before all have signed, would still cancel).
- Touches the way out: yes (taking an assent back: G4.10).
- Source: draft-25.md, section 8.4, from drafts 3 to 9 (history.md, section 9.13, item 2) and from draft 20's list (its 8.2, items 1 to 9: "the counter signature under an `in_force` cMIP").

**OI-010. The race between a counter signature and the last assent, which nothing in the acts settles.**
- Area: core.
- cMIP check: **C** (K2). How sure: the text says so: "that only a place, or an `in_force` rule with a deadline read from a place or a clock, settles" (`draft-25.md`, section 7, "Withdrawing before in force").
- Changes a verifier's answer: no (inferred: a stated cost; the readings are G4.10's).
- Touches the way out: yes (taking an assent back: G4.10).
- Source: draft-25.md, section 7, "Withdrawing before in force".

**OI-011. Whether the default for `in_force` (every party named as a signer) is the default wanted.**
- Area: core.
- cMIP check: **G** (G4.1). How sure: the text says so: "Whether a different default is wanted is open." (`draft-25.md`, section 6, P1).
- Changes a verifier's answer: yes (inferred: another default changes which Terms are in force on the same acts).
- Touches the way out: no.
- Source: draft-25.md, section 6, P1.

**OI-012. A resolving update of Terms names no party: is it in force at once, by G4.1's default read literally.**
- Area: core.
- cMIP check: **G** (G4.1). How sure: the text says so: "so it never names a party, and G4.1 read literally puts it in force at once" (`verifier-2-report.md`, section 2, B1).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B1)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B1; encoding-2-report.md, "What a stranger's reading found", left as they are ("G4.1's default read literally for a resolving update of Terms").

**OI-013. A new version's own `in_force`: a version that names a party as a signer and carries no `in_force` waits for that party's assent, even where the update condition answered valid without it.**
- Area: core.
- cMIP check: **G** (G4.1, G4.8). How sure: the text says so: "a version that names the baker as a signer and carries no `in_force` is in force, by G4.1's default, only with an assent in her name" (`draft-25.md`, section 8.3, item 2).
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (it decides whether a version made without a party takes effect: G4.1, G4.8).
- Source: draft-25.md, section 8.3, item 2; section 8.4, from draft 22's list (its 8.3, item 2), draft 20's list (its 8.3), draft 19's list (its 8.3).

**OI-014. An act held that cannot be read (a private act without its key, an unknown signature scheme) and may be an assent: does it make "in force" unchecked.**
- Area: core.
- cMIP check: **G** (G9, G6.1). How sure: the text says so: "Whether an unreadable act held that may be an assent makes in force unchecked is still open" (`verifier-2-report.md`, section 2, A9).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 8 (A9, the part left)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A9.

**OI-015. How a `previous` that names no act is read (the text and the second C session's tests differ).**
- Area: core.
- cMIP check: **G** (G6.1). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: yes (draft-25.md, section 9, item 15: "its tests answer otherwise").
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.2, items 1 to 9).

**OI-016. At which position, or by which citing, replacing Terms "came into force".**
- Area: core.
- cMIP check: **G** (G5.4, G13.3). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: yes (draft-25.md, section 9, item 15: "its tests answer otherwise").
- Touches the way out: yes (anchored history: the position a place gives, G13.3).
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.2, items 1 to 9) and draft 18's list (its 8.2, item 14).

**OI-017. A replacement that lacks a signature is answered "not shown"; the word of Nobody, allegedly, for that case was "invalid".**
- Area: core.
- cMIP check: **G** (G4.8(c)). How sure: the text says so: "A replacement that lacks a signature is, by that line, not shown (G4.8); his word for such a case was "invalid" (section 8.4)." (`draft-25.md`, section 6, P19).
- Changes a verifier's answer: yes (inferred: the answer word differs).
- Touches the way out: no.
- Source: draft-25.md, section 6, P19; section 8.4, from draft 15's list (item 11) and draft 19's list (item 3).

**OI-018. Whether "not valid" (a cMIP's answer about an update) and "invalid" (this text's answer about an act) should be one word.**
- Area: presentation.
- cMIP check: **G** (section 2, "Answers"). How sure: the text says so: "Whether the two should be one word is not said." (`draft-25.md`, section 6, P19).
- Changes a verifier's answer: yes (inferred: the answer word differs).
- Touches the way out: no.
- Source: draft-25.md, section 6, P19.

**OI-019. "Locked": the text has no such value, and a verifier may not say an agreement can never be updated.**
- Area: core.
- cMIP check: **G** (G4.11(i)). How sure: the text says so: "A verifier MUST NOT answer, of itself, that an agreement is locked, or that it can never be updated." (`draft-25.md`, G4.11(i)).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (an agreement no update can change: G4.11(i)).
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.2, item 8).

**OI-020. Whether a version may name several update conditions (one for each part), and whether the condition sits on the version or on the role.**
- Area: core.
- cMIP check: **G** (section 3.1, `condition`; G4.11). How sure: the text says so: "Not said: whether a version may name several (one for each part of an agreement), or whether the one cMIP's parameters must carry all of it." (`draft-25.md`, section 6, P21).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 6, P21; section 8.4, from draft 10's list (item 10).

**OI-021. Which update condition is asked about a filling's rights where several versions lie between.**
- Area: core.
- cMIP check: **G** (G10.6). How sure: the text says so: "which condition is asked about a filling where several versions lie between" (`draft-25.md`, section 6, P21).
- Changes a verifier's answer: yes (inferred: another condition asked gives another answer about the filling's rights).
- Touches the way out: no.
- Source: draft-25.md, section 6, P21; section 8.4, from draft 17's list (its 8.2, items 3 and 4).

**OI-022. That the update condition is asked of a resolving update is Claude's reading.**
- Area: core.
- cMIP check: **G** (G4.11(g)). How sure: the text says so: "that those signatures are now the condition's answer is Claude's reading (section 8.4)" (`draft-25.md`, G4.11(g)).
- Changes a verifier's answer: yes (inferred: it decides who must sign a resolving update).
- Touches the way out: no.
- Source: draft-25.md, G4.11(g); section 6, P21; section 8.4, from draft 19's list (item 4) and draft 17's list (item 8).

**OI-023. Where two versions of one agreement name different clocks, which one the update condition reads.**
- Area: core.
- cMIP check: **G** (G7.4, G4.11). How sure: the text says so: "where two versions of one agreement name different clocks, which one the update condition (G4.11) reads" (`draft-25.md`, section 6, P16).
- Changes a verifier's answer: yes (inferred: a time-based condition answers by the clock it is read on).
- Touches the way out: yes (anchored history: G7.4).
- Source: draft-25.md, section 6, P16.

**OI-024. What the update condition's cMIP may read.**
- Area: core.
- cMIP check: **G** (G4.11(a)). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 17's list (its 8.2, item 6).

**OI-025. Changing the update condition itself.**
- Area: core.
- cMIP check: **C** (K4). How sure: the text says so: "which parts of an agreement an update may change (a share, a party, the rights a version offers, the offer itself, a power, the judge, the condition itself)" (`draft-25.md`, G4.11).
- Changes a verifier's answer: no (inferred: the text gives it to the condition's own cMIP).
- Touches the way out: can't tell (the condition is what lets a party leave or not: G4.11).
- Source: draft-25.md, section 8.4, from draft 17's list (item 8).

**OI-026. "It should be able to run": whether rights can stop, or apply again, with no update at all.**
- Area: core.
- cMIP check: **G** (G4.11(f), G10.7). How sure: the text says so: "These grammar rules have no condition that triggers." (`draft-25.md`, G4.11(f)).
- Changes a verifier's answer: yes (inferred: with a condition that runs by itself, a verifier would answer that rights stopped where the text now says nothing changed).
- Touches the way out: yes (ending: rights that stop on a date stop only by an update, G4.11(f), G10.7).
- Source: draft-25.md, section 8.4, from draft 17's list (its 8.2, item 5) and from drafts 3 to 9 (history.md, section 9.13, item 6); section 7, "Valid is as sure as the update condition's cMIP".

**OI-027. An update's validity is only as sure as the cMIP that answers it: two readers with different anchorings can differ; a condition that answers valid for nothing is a lock.**
- Area: core.
- cMIP check: **C** (K4). How sure: the text says so: "a lock, which is people's own choice of cMIP" (`draft-25.md`, section 7, "Valid is as sure as the update condition's cMIP").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (an agreement that even all its parties together cannot update: G4.11).
- Source: draft-25.md, section 7, "Valid is as sure as the update condition's cMIP"; section 5.2 (the row on a lock).

**OI-028. A party is bound by an update it did not sign, where the update condition lets fewer than all update.**
- Area: core.
- cMIP check: **C** (K4). How sure: the text says so: "It signed for that when it signed Terms that name the condition" (`draft-25.md`, section 7, "Bound by an update one did not sign").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Bound by an update one did not sign"; section 8.4, from draft 19's list (its 8.2, items 1 and 17 to 19).

**OI-029. Who is bound by an update that does not name them.**
- Area: core.
- cMIP check: **G** (G5.1(c)). How sure: the text says so: "G14.2 reads that binding only for a party the version names" (`draft-25.md`, section 8.3, item 4).
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (a party a version takes out: G4.8(a), G5.1(c)).
- Source: draft-25.md, section 8.3, item 4; section 8.4, from draft 22's list (its 8.3, item 5).

**OI-030. A late act in one signer's own line (lateness is written for Terms only).**
- Area: core.
- cMIP check: **G** (G6, G4.7). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.3, items 1 to 7 and 9 to 13).

**OI-031. Knots and an anchoring that disagree about whether an update came late.**
- Area: core.
- cMIP check: **G** (G4.7(c)). How sure: the text says so: "Where knots or an anchoring show it, nothing else (a place that shows L before F, a later resolving update) makes L an update again." (`draft-25.md`, G4.7(c)).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (anchored history: G4.7(b), G4.7(c)).
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.3).

**OI-032. A rival update signed late that nothing shows to be late takes the agreement back to an old version (a fork).**
- Area: core.
- cMIP check: **C** (K4). How sure: the text says so: "Whether an update made after another, and not shown to be late, may still be valid is the update condition's to say" (`draft-25.md`, G4.7(d)).
- Changes a verifier's answer: no (inferred: the text gives it to the condition's cMIP).
- Touches the way out: no.
- Source: draft-25.md, G4.7(d); section 5.2 (the row on a rival update signed late); section 8.4, from draft 21's list (its 8.3: "the update condition beside a late update").

**OI-033. No way to leave Terms once they are in force, and no default for a party's own part or its leaving, unless the Terms name an update condition that allows it.**
- Area: core.
- cMIP check: **C** (K4). How sure: the text says so: "an update condition that answers valid for an update that party alone signed, only where it takes its own signer out" (`draft-25.md`, section 5.2).
- Changes a verifier's answer: no (inferred: the grammar's answers (G4.9, G4.11(e)) are not in doubt; what is open is whether that is wanted).
- Touches the way out: yes (leaving and ending: G4.9, G4.11(e); section 7, "No default way out").
- Source: draft-25.md, section 7, "No default way out"; section 6, P15; section 8.4, from draft 15's list (items 8 and 9); kishib-agreements-new-report.md, section 1 and section 4 (the passage "What draft 25 does not give you: a way to leave Terms once they are in force") and section 6, finding 1.

**OI-034. Whether Terms may name several places, with a rule over their answers.**
- Area: core.
- cMIP check: **G** (G7.1). How sure: the text says so: "Whether Terms may name several places with a rule over their answers (plural witnesses of order) is open." (`draft-25.md`, section 6, P4).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (anchored history: G7).
- Source: draft-25.md, section 6, P4.

**OI-035. Whether a verifier answers from the set of acts it is given, or must also ask the place for more.**
- Area: core.
- cMIP check: **G** (G6, G9). How sure: the text says so: "Whether a verifier answers from a set it is given, or must also ask the place for more, is open." (`draft-25.md`, section 6, P5).
- Changes a verifier's answer: yes (inferred: shown, not shown and fork all depend on the acts held).
- Touches the way out: no.
- Source: draft-25.md, section 6, P5.

**OI-036. How far a verifier must follow (powers through powers, receivers, long chains) before it may stop and answer unchecked.**
- Area: core.
- cMIP check: **G** (G9.2). How sure: the text says so: "How far a verifier must follow is not fixed (P2, P8)." (`draft-25.md`, G9.2).
- Changes a verifier's answer: yes (inferred: one verifier stops and answers unchecked where another goes on and answers).
- Touches the way out: no.
- Source: draft-25.md, section 6, P2; section 8.4, from draft 20's list (its 8.3: "the numbers a verifier stops at") and draft 18's list (item 13).

**OI-037. Without an anchoring, order is partial: the bytes cannot tell late from simultaneous.**
- Area: core.
- cMIP check: **G** (G13.3, G13.4). How sure: the text says so: "the bytes alone cannot tell late from simultaneous" (`draft-25.md`, section 7, "Order without an anchoring is partial").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (anchored history: G13.4).
- Source: draft-25.md, section 7, "Order without an anchoring is partial".

**OI-038. A genuine act that never reached the named place does not count.**
- Area: core.
- cMIP check: **G** (G7.2). How sure: the text says so: "a party's own act that never reached the place does not count, even if it is genuine" (`draft-25.md`, section 7, "Closed world hurts the one who did not lodge").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (anchored history: G7.2).
- Source: draft-25.md, section 7, "Closed world hurts the one who did not lodge".

**OI-039. A payer who names the version they read has paid as it says, even if the agreement had changed.**
- Area: core.
- cMIP check: **G** (G13). How sure: the text says so: "the owners under a later version can see money go by an earlier one" (`draft-25.md`, section 7, ""Now" is what was read, and no more").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, ""Now" is what was read, and no more".

### Cluster 2. Forks, and resolving them (26)

**OI-040. Two rival versions by one author fork Terms and also that author's own line: can one act resolve both, or must it be two.**
- Area: core.
- cMIP check: **G** (G6.2, G12.3). How sure: the text says so: "Draft 25 does not say whether one act can resolve both, or must be two acts." (`verifier-2-report.md`, section 3, item 9).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 9 (A10)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A10.

**OI-041. Another signer, under a power, cannot write a Terms act that resolves a fork of one signer's line of Terms acts, since a Terms act has no `for` and `under`.**
- Area: core.
- cMIP check: **G** (G12.4; section 3.1). How sure: the text says so: "A Terms act has no `for`/`under`, so another signer, under a power, cannot write a Terms act that resolves a fork of one signer's line of Terms acts." (`encoding-2-report.md`, "What a stranger's reading found").
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: encoding-2-report.md, "What a stranger's reading found", left as they are.

**OI-042. Which Terms act a resolve's `terms` names, where the forked line spans several versions.**
- Area: core.
- cMIP check: **G** (section 3.2; G12.3). How sure: the text says so: "Which Terms act a resolve's `terms` names, where the forked line spans several versions, is not said." (`encoding-2-report.md`, "What a stranger's reading found").
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: encoding-2-report.md, "What a stranger's reading found", left as they are.

**OI-043. A choice made in writing the bytes: a resolving update of Terms may name what it relied on.**
- Area: core.
- cMIP check: **G** (section 3.2; G13.2). How sure: the text says so: ""Carries nothing else" read literally would refuse it" (`encoding-2-report.md`, "Where writing it needed a choice").
- Changes a verifier's answer: no (inferred: a naming, not a new reading of a well-written act).
- Touches the way out: no.
- Source: encoding-2-report.md, "Where writing it needed a choice", first point.

**OI-044. A choice made in writing the bytes: a resolve may carry `for` and `under`, `answers`, `relies_on` and `settlement`; only `content` is refused.**
- Area: core.
- cMIP check: **G** (section 3.2). How sure: the text says so: "only `content` is refused, as for an assent" (`encoding-2-report.md`, "Where writing it needed a choice").
- Changes a verifier's answer: no (inferred).
- Touches the way out: no.
- Source: encoding-2-report.md, "Where writing it needed a choice", second point.

**OI-045. A choice made in writing the bytes: a Statement with `resolves` and no `continues` can no longer be written.**
- Area: core.
- cMIP check: **G** (section 3.2; G12.3). How sure: the text says so: "Draft 24's reading of such an act ("resolves nothing") now applies to Terms only." (`encoding-2-report.md`, "Where writing it needed a choice").
- Changes a verifier's answer: no (inferred: such an act is now rejected before the grammar).
- Touches the way out: no.
- Source: encoding-2-report.md, "Where writing it needed a choice", third point.

**OI-046. A fork in one signer's own line: is the signer of an assent that is a tip, or follows one, bound meanwhile.**
- Area: core.
- cMIP check: **G** (G12.2, G4.3). How sure: the text says so: "whether the signer of such an assent is bound meanwhile is not said (section 8.4)" (`draft-25.md`, section 6, P9).
- Changes a verifier's answer: yes (inferred: bound or not bound, on the same acts).
- Touches the way out: can't tell (a signer can hold back their own assent by forking: P9; G4.9).
- Source: draft-25.md, section 6, P9; section 8.4, from draft 16's list (its 8.2, item 7) and draft 20's list (its 8.3: "an assent that is a tip").

**OI-047. An assent to a tip that also names the tip in `relies_on`: built on it, so not counted.**
- Area: core.
- cMIP check: **G** (G12.2). How sure: the text says so: "An assent to a tip that also names it in `relies_on`" (`verifier-2-report.md`, section 2, B10).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B10)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B10.

**OI-048. A contest against a tip of a fork that stands.**
- Area: core.
- cMIP check: **G** (G11.8, G12.2). How sure: the text says so: "A contest against a tip of a fork that stands" (`verifier-2-report.md`, section 2, B7).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B7)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B7.

**OI-049. The qualifier of an answer that rests on the version an act names.**
- Area: core.
- cMIP check: **G** (G1.4; section 2, "Answers"). How sure: the text says so: "The qualifier of an answer resting on the version an act names" (`verifier-2-report.md`, section 2, B8).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B8)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B8.

**OI-050. "Built on a tip" reaches as far as the naming goes (the text and the second C session's tests differ).**
- Area: core.
- cMIP check: **G** (G12.2). How sure: the text says so: "The words reach as far as the naming goes" (`draft-25.md`, section 2, "Built on a tip").
- Changes a verifier's answer: yes (draft-25.md, section 9, item 15: "its tests answer otherwise").
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.2, items 1 to 9).

**OI-051. A payment that names a tip, or a version along a branch set aside.**
- Area: core.
- cMIP check: **G** (G12.5, G1.4). How sure: the text says so: "A payment that names a version of that branch is read as if the tip had stood alone" (`draft-25.md`, G12.5).
- Changes a verifier's answer: yes (draft-25.md, section 9, item 15: "its tests answer otherwise").
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.2, items 1 to 9) and draft 16's list (its 8.2, items 7 to 12).

**OI-052. A filling earned in a branch set aside.**
- Area: core.
- cMIP check: **G** (G12.5). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.3, items 1 to 13).

**OI-053. An agent's act that is a tip of a fork.**
- Area: core.
- cMIP check: **G** (G5.7, G12). How sure: the text says so: "an act made under a power that is a tip of a fork stops as any tip does" (`draft-25.md`, G5.7).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.3).

**OI-054. A resolving update that came late.**
- Area: core.
- cMIP check: **G** (G12.7, G4.7). How sure: the text says so: "one that the knots or an anchoring show came after another had resolved the fork is a late update, and resolves nothing" (`draft-25.md`, G12.7).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.2, items 1 to 8).

**OI-055. Merging two branches is not kept: a resolving update only says which tip continues.**
- Area: core.
- cMIP check: **G** (G12.3). How sure: the text says so: "A join that merged the branches is not kept" (`draft-25.md`, section 2, "Join").
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.2, items 7 to 12).

**OI-056. Two resolving updates that continue the same tip.**
- Area: core.
- cMIP check: **G** (G12.7). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.2, items 7 to 12).

**OI-057. What those who signed a branch had built on it, once its tip is set aside.**
- Area: core.
- cMIP check: **G** (G12.5). How sure: the text says so: "whoever signed one of them is not protected here for what they built on it" (`draft-25.md`, G12.5).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.3, items 8 to 13).

**OI-058. A fork with more than two tips.**
- Area: core.
- cMIP check: **G** (G12.1). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.3, items 8 to 13).

**OI-059. How a resolving update signed under a power sits in another signer's line.**
- Area: core.
- cMIP check: **G** (G12.4, G6.1). How sure: the text says so: "the resolving update then stands in the line of whoever signed it" (`draft-25.md`, G12.4).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.3, items 8 to 13) and draft 10's list (item 11).

**OI-060. Since when a continued tip counts.**
- Area: core.
- cMIP check: **G** (G12.3). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.3, items 8 to 13).

**OI-061. Which act the next version names after a resolving update.**
- Area: core.
- cMIP check: **G** (G12.3). How sure: the text says so: "So the next act MAY name either." (`draft-25.md`, G12.3).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.3, items 5 to 12).

**OI-062. A power to resolve beside the update condition, and which Terms say how a resolving update is signed.**
- Area: core.
- cMIP check: **G** (G12.4, G4.11(g)). How sure: the text says so: "the update condition is not asked of it (G4.11(g)), so it is neither valid nor not valid" (`draft-25.md`, G12.4).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 17's list (its 8.3, item 3) and draft 16's list (its 8.2, item 9; its 8.3, item 8).

**OI-063. An honest fork (a lost device, a restored backup) looks exactly like a lie.**
- Area: core.
- cMIP check: **G** (G6.2, G12.3). How sure: the text says so: "Honest drift and lying look the same from outside." (`draft-25.md`, section 7, "Honest forks").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (portable identity: one signer on several devices, or restored from a backup; G6.2).
- Source: draft-25.md, section 7, "Honest forks".

**OI-064. A fork of Terms holds the agreement where it was; where fewer than all can update, a fork is a veto.**
- Area: core.
- cMIP check: **C** (K3). How sure: the text says so: "a power to resolve whose rule accepts only the one resolving update it computes from the acts and the place (G12.4). That is a cMIP's." (`draft-25.md`, section 7, "A fork of Terms holds the agreement where it was").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (an agreement that is stuck: G12.4; the text's own words are "The way out can be said in the language").
- Source: draft-25.md, section 7, "A fork of Terms holds the agreement where it was".

**OI-065. Resolving does not undo what a stranger did relying on the tip set aside.**
- Area: core.
- cMIP check: **G** (G12.5). How sure: the text says so: "it cannot take back what a stranger did relying on the other" (`draft-25.md`, section 7, "Resolving does not undo").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Resolving does not undo".

### Cluster 3. Acting for others: agreements as parties, powers, agents, spots (25)

**OI-066. An agreement whose Terms give a power of the kind, and that power's rule says no: has it signed, where every one of its signers signs.**
- Area: core.
- cMIP check: **G** (G1.2). How sure: the text says so: "it has not signed, even if every signer signs" (`verifier-2-report.md`, section 3, item 7).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 7 (A8)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A8.

**OI-067. How an agreement signs where its Terms give no power (one act by each signer), and that an act made for it under other Terms is not its signature: the least reading, to be confirmed.**
- Area: core.
- cMIP check: **G** (G1.2). How sure: the text says so: "Both are for the MOR lead and for Nobody, allegedly, to confirm" (`draft-25.md`, section 6, P17).
- Changes a verifier's answer: yes (inferred: another reading changes whether the agreement has signed).
- Touches the way out: no.
- Source: draft-25.md, section 6, P17; section 8.4, from draft 15's list (its 8.3, items 1 to 4) and draft 12's list (item 5).

**OI-068. Whether the default of G4.1 should count a party named as an agreement: nothing tells a party that must sign from one that is only pointed at.**
- Area: core.
- cMIP check: **G** (G4.4, G4.1). How sure: the text says so: "nothing else in the grammar tells a party that must sign from one that is only pointed at" (`draft-25.md`, section 6, P17).
- Changes a verifier's answer: yes (inferred: another default changes which Terms are in force. (Section 5.2 hands the need itself, a group that wants a say, to an `in_force` rule or an update condition.)).
- Touches the way out: no.
- Source: draft-25.md, section 6, P17; section 8.4, from draft 12's list (item 4).

**OI-069. Whether someone who fills a role of an agreement is one of its signers when it signs as a party; and how its Terms "say otherwise".**
- Area: core.
- cMIP check: **G** (G1.2). How sure: the text says so: "whether someone who fills a role of an agreement is one of its signers when it signs as a party" (`draft-25.md`, section 6, P17).
- Changes a verifier's answer: yes (inferred: it changes who must sign for the agreement to have signed).
- Touches the way out: no.
- Source: draft-25.md, section 6, P17; section 8.4, from draft 13's list (item 19).

**OI-070. Which acts of an agreement's several signers are one signing; how such a party takes its signature back; and that a party may itself cancel an assent its agent made: Claude's readings.**
- Area: core.
- cMIP check: **G** (G1.2, G4.10, G5.7). How sure: the text says so: "That the party itself may make it is Claude's reading of what follows (section 8.2)." (`draft-25.md`, section 6, P17).
- Changes a verifier's answer: yes (inferred: draft-25.md, section 9, item 15 says the second C session's tests answer otherwise on "one signing").
- Touches the way out: yes (taking a signature back before Terms are in force: G4.10).
- Source: draft-25.md, section 6, P17; section 8.4, from draft 20's list (its 8.2: "one signing"), draft 21's list (its 8.2: "the counter signature before Terms are in force") and draft 15's list (its 8.3, items 1 to 4).

**OI-071. An agreement's signature ("a collective signature of sorts") rests on a question of Nobody, allegedly, and on "I think it is".**
- Area: core.
- cMIP check: **G** (G1.2). How sure: inferred, from the bullet in section 8.4, which quotes those words; the exchange is in docs/decisions.md and history.md.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 15's list (its 8.2, items 5 and 6).

**OI-072. Whether one decision or judgment that binds many who are not the parties of one agreement is one act, or one per person.**
- Area: core.
- cMIP check: **G** (G5.1(b); section 3.2, `for`). How sure: the text says so: "Whether one decision or judgment binding many who are not the parties of one agreement is one act or one per person is open." (`draft-25.md`, section 6, P12).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 6, P12.

**OI-073. When a version "removes or narrows" a power: the `powers` entries less one or more; a changed rule is not read as narrower.**
- Area: core.
- cMIP check: **G** (G5.5). How sure: the text says so: "whether an entry whose rule was changed is narrower is not read by these grammar rules (section 8.4)" (`draft-25.md`, G5.5).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B2)).
- Touches the way out: yes (ending a delegation: G5.5).
- Source: verifier-2-report.md, sections 2 and 3, B2; draft-25.md, section 8.4, from draft 18's list (its 8.3: "a power narrowed by changing its rule").

**OI-074. The delegator's default (ending a delegation alone, at any time) rests on a leaning: "I lean a."**
- Area: core.
- cMIP check: **G** (G5.5). How sure: inferred, from the bullet in section 8.4, which quotes those words.
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (ending a delegation: G5.5).
- Source: draft-25.md, section 8.4, from drafts 3 to 9 (history.md, section 9.11, item 5).

**OI-075. Whether "no limit" on signed conditions holds beyond ending a delegation.**
- Area: core.
- cMIP check: **G** (G5.5). How sure: the text says so: "These grammar rules put no limit on what such a condition may say" (`draft-25.md`, G5.5).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (ending: G5.5).
- Source: draft-25.md, section 8.4, from drafts 3 to 9 (history.md, section 9.13, item 5).

**OI-076. A delegation's signed conditions on ending it, beside its `condition`: where an update condition is named, the words are not read.**
- Area: core.
- cMIP check: **G** (G5.5). How sure: the text says so: "(i) where those Terms name an update condition, its answer is the whole answer (G4.8), and the conditions their words state are not read for it" (`draft-25.md`, G5.5).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (ending a delegation: G5.5).
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.3), draft 19's list (item 5; its 8.3) and draft 17's list (its 8.3, item 2).

**OI-077. That Terms are a delegation is read from their words (the body's cMIP); no field says so.**
- Area: core.
- cMIP check: **G** (G5.5). How sure: the text says so: "No field says so" (`draft-25.md`, G5.5).
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (whether the delegator's default way of ending applies rests on it: G5.5).
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.2, item 12).

**OI-078. An agent has what was signed and no more: no notice, no pay; and a delegator can sign away ending the delegation.**
- Area: core.
- cMIP check: **C** (K1 (the delegation's own words); the text names no socket for "a cMIP beside the delegation"). How sure: the text says so: "has it written, as signed conditions or as a cMIP beside the delegation" (`draft-25.md`, section 7, "An agent has what was signed, and no more").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (ending a delegation: G5.5).
- Source: draft-25.md, section 7, "An agent has what was signed, and no more"; section 5.1 (the paragraph after the table).

**OI-079. What an agent signed stays signed: the one it acted for cannot set it aside.**
- Area: core.
- cMIP check: **C** (K4 (and K3 for how far the agent reaches)). How sure: the text says so: "an update of the agreement, as its update condition asks, or, before it is in force, a counter signature; and a version of the grant, for what comes after (G5.7); nothing is set aside" (`draft-25.md`, section 5.2).
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (undoing what was signed in one's name: G5.7, G4.10).
- Source: draft-25.md, section 7, "What an agent signed stays signed"; section 5.2 (its last row).

**OI-080. Where the judicial is said, and what is set in the Terms: the contest, a judge, a power to resolve.**
- Area: core.
- cMIP check: **G** (G5.6). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 19's list (its 8.2, items 6 to 9 and 20 to 23).

**OI-081. A judge named in the Terms is as hard to change as the Terms: if the judge is gone and everyone must sign, the judge stays named.**
- Area: core.
- cMIP check: **C** (K4). How sure: the text says so: "People who want a judge that can be replaced say how in their update condition, in advance." (`draft-25.md`, section 7, "A judge is as hard to change as the Terms").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (succession: a judge who is gone, with no way named in advance; G5.6).
- Source: draft-25.md, section 7, "A judge is as hard to change as the Terms".

**OI-082. The modules (a judge, a tally, identity, assurance, delivery, standing): none is a socket; for the judge, also where in the Terms it is named.**
- Area: core.
- cMIP check: **C** (any socket whose cMIP names the module; the text names none in particular). How sure: the text says so: "Nothing in the grammar needs to change for any of them." (`draft-25.md`, section 8.2, item 17).
- Changes a verifier's answer: no (inferred from that sentence).
- Touches the way out: no.
- Source: draft-25.md, section 8.2, item 17; section 8.4, from draft 20's list (its 8.3: "who the judge is") and draft 19's list (its 8.3: "a judge named inside a cMIP's text").

**OI-083. An entry of `powers` of kind `replaces` gives no power and is left unread.**
- Area: core.
- cMIP check: **G** (G5.2, G2.2). How sure: the text says so: "An entry of `powers` of that kind gives no power" (`draft-25.md`, G5.2).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 19's list (its 8.2, item 2).

**OI-084. The sockets read off the fields; what a module is; no socket for a dividing rule; the field `control` and its name.**
- Area: core.
- cMIP check: **G** (section 5; section 3.1). How sure: the text says so: "No socket is kept for a dividing rule alone (section 8.4)." (`draft-25.md`, section 2, "Shares").
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.2, items 1 to 4).

**OI-085. Whether a filled spot can pass to another, and whether a later claimant can displace an earlier one.**
- Area: core.
- cMIP check: **can't tell** (G10.2, or the spot's cMIP (K5)). How sure: inferred, the text gives "one filling or many" to the K5 cMIP (G10.2) and is silent on passing and displacing.
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession: a spot, and the rights earned in it, passing to another; G10.2, G10.6).
- Source: draft-25.md, section 6, P7.

**OI-086. How an offer stops taking new people, or takes them again; and whether a role's cMIP takes parameters.**
- Area: core.
- cMIP check: **C** (K5). How sure: the text says so: "Whether a spot still takes new identities is said by its K5 cMIP" (`draft-25.md`, G10.5).
- Changes a verifier's answer: no (inferred: the answer is passed on as the cMIP's).
- Touches the way out: no.
- Source: draft-25.md, section 5.1 (the row "Closing, reopening, closing by itself"); section 7, "An offer that stops taking new people"; section 8.4, from draft 17's list (its 8.3, item 1) and draft 10's list (item 9).

**OI-087. Who must sign a renewed offer.**
- Area: core.
- cMIP check: **C** (K4). How sure: inferred, G10.7: a later version "made as G4.8 says MAY offer again", and G4.8 gives who must sign to the update condition.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from drafts 3 to 9 (history.md, section 9.13, item 8).

**OI-088. Each kind of spot has its own fraud, and nothing makes the confirmer honest.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "neither makes the confirmer honest" (`draft-25.md`, section 7, "Spots lean on their confirmers").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Spots lean on their confirmers".

**OI-089. Whether a future spot was used only for participants no one could anticipate cannot be checked.**
- Area: core.
- cMIP check: **G** (G10.4). How sure: the text says so: "No verifier can check that a future spot was used only for them" (`draft-25.md`, G10.4).
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Future spots are the authors' word".

**OI-090. Counted attention rests on whoever counts; the grammar no longer requires an agreed witness.**
- Area: core.
- cMIP check: **C** (K5). How sure: the text says so: "is then exposed only as far as that cMIP goes" (`draft-25.md`, section 7, "Counted attention leans on whoever counts, and the grammar names no one").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Counted attention leans on whoever counts, and the grammar names no one"; section 5.1 (the row "The agreed witness"); section 8.4, from draft 10's list (item 8).

### Cluster 4. Legs, reports and money (30)

**OI-091. A report whose call names the payment itself, and not its settlement: listed, or a confirmation.**
- Area: core.
- cMIP check: **G** (G11.7). How sure: the text says so: "The bytes cannot tell a payment's id from another act's, so such a report is not rejected." (`verifier-2-report.md`, section 3, item 12).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 12 (N1)).
- Touches the way out: no.
- Source: verifier-2-report.md, section 3, N1.

**OI-092. Who the doer is where the receiver is an agreement that is also one of the Terms' parties.**
- Area: core.
- cMIP check: **G** (G11.2). How sure: the text says so: "Encoding 2 names an agreement as receiver by its root even where it is a party." (`verifier-2-report.md`, section 3, item 13).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 13 (N2)).
- Touches the way out: no.
- Source: verifier-2-report.md, section 3, N2; encoding-2-report.md, "What a stranger's reading found", left as they are ("G11.2's "(another agreement, or none)"").

**OI-093. Who the doer and the receiving side are for the Control task.**
- Area: core.
- cMIP check: **G** (G11.2). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 11's list (item 5).

**OI-094. A call attached to a task other than the Control task: left unread, whether or not the Terms hold that task.**
- Area: core.
- cMIP check: **G** (G2.2, G11.2). How sure: the text says so: "a call attached to another task is not read" (`verifier-2-report.md`, section 3, N3).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, N3: "It changes no answer word.").
- Touches the way out: no.
- Source: verifier-2-report.md, section 3, N3.

**OI-095. Whether a work whose owner receives for the others, or a work with no service, holds the Control task with its socket empty.**
- Area: core.
- cMIP check: **G** (G11.2). How sure: the text says so: "whether a work whose owner receives for the others holds the Control task with its socket empty, as G11.2 reads it" (`draft-25.md`, section 6, P20).
- Changes a verifier's answer: yes (inferred: whether its calls are read, or left unread, turns on it).
- Touches the way out: no.
- Source: draft-25.md, section 6, P20; section 8.4, from draft 18's list (its 8.3) and draft 12's list (item 9).

**OI-096. By which act a doer's own part is named, since nothing moves when a holder keeps their share; and what a doer's report carries.**
- Area: core.
- cMIP check: **G** (G11.3; K6's row (section 5)). How sure: the text says so: "by which act a doer's own part is named, since nothing moves when a holder keeps their share" (`draft-25.md`, section 6, P20).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 6, P20; section 8.4, from draft 13's list (item 20) and draft 15's list (its 8.3, item 7).

**OI-097. Whether money shown as still owed is later shown as paid, and by what.**
- Area: core.
- cMIP check: **C** (K6 (after the bytes of a leg report's lines give a "still owed" line something a later line can name)). How sure: the text says so: "then a cMIP of K6 says whether a later report's "passed on" line, naming it, closes it" (`draft-25.md`, section 8.2, item 15).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.2, item 15; section 6, P20; section 8.4, from draft 11's list (item 10).

**OI-098. Pools: who holds one and on whose word, when it is divided and by which rule, how a claim is counted when false claims take from real ones, and what becomes of a share no one has claimed.**
- Area: core.
- cMIP check: **C** (K6). How sure: the text says so: "a cMIP of K6 for the pool, with a rule as its module, says when it is divided and how a claim is counted" (`draft-25.md`, section 8.2, item 16).
- Changes a verifier's answer: no (inferred: the text gives it to the pool's cMIP).
- Touches the way out: no.
- Source: draft-25.md, section 6, P6; section 8.2, item 16; section 5.2 (the row on a pool); section 8.4, from draft 11's list (item 12).

**OI-099. Pools: how one line of a leg report names several settlements, or one settlement covers many counts; and what "tied to a settlement" means for a count paid out of a pool.**
- Area: development.
- cMIP check: **E** (the bytes of a leg report). How sure: the text says so: "the encoding of a leg report says how one line names several settlements, or one settlement covers many counts" (`draft-25.md`, section 8.2, item 16).
- Changes a verifier's answer: no (inferred: "Until then one report line names one settlement.").
- Touches the way out: no.
- Source: draft-25.md, section 6, P6; section 8.2, item 16.

**OI-100. "How much of my click reached the band": with one report for a batch, that is arithmetic the reader does, which nobody states.**
- Area: core.
- cMIP check: **can't tell** (K6, the report block, or no one). How sure: the text says so: "which nobody states; the sketch marks it "not stated". Left open." (`draft-25.md`, section 6, P6).
- Changes a verifier's answer: no (inferred: no answer word is in doubt).
- Touches the way out: no.
- Source: draft-25.md, section 6, P6 ("What the click test showed").

**OI-101. Which lines of a doer's report each receiving side receives (all of them, or those of its own leg).**
- Area: core.
- cMIP check: **C** (K6). How sure: the text says so: "is said by the cMIP that answers the task (K6)" (`draft-25.md`, G11.3).
- Changes a verifier's answer: no (inferred: "These grammar rules do not say it.").
- Touches the way out: no.
- Source: draft-25.md, G11.3; section 5.2 (the row on a doer's report); section 8.1 ("Which lines each side receives"); section 8.4, from draft 15's list (item 10).

**OI-102. What "match" means for the Control task, and whether two honest reports can state different amounts for one settlement.**
- Area: core.
- cMIP check: **G** (G11.4(c)). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 11's list (item 7).

**OI-103. The tie by an act both name, the amounts, and kept-or-owed are the MOR lead's proposals, still to check.**
- Area: core.
- cMIP check: **G** (G11.4(b), G11.4(c); K6's row). How sure: inferred, from the bullet in section 8.4, which says so.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 12's list (item 19).

**OI-104. That a leg report must be readable without the leg's cMIP.**
- Area: core.
- cMIP check: **G** (G11.3). How sure: the text says so: "What K6's row asks of a leg report MUST be readable without any cMIP those Terms name" (`draft-25.md`, G11.3).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 11's list (item 9).

**OI-105. Whether reports that do not agree are a fork.**
- Area: core.
- cMIP check: **G** (section 3.2; G6). How sure: the text says so: "no fork is seen among reports" (`draft-25.md`, section 3.2).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 11's list (item 11).

**OI-106. Whether a report is a Statement of this text and stands in its signer's line.**
- Area: core.
- cMIP check: **G** (section 3.2; G6). How sure: the text says so: "These grammar rules read no report as standing in a signer's line" (`draft-25.md`, section 3.2).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 11's list (item 14) and draft 20's list (its 8.3: "a report in no line").

**OI-107. "The report about the payment only comes from the receiver", read as: of the work's people.**
- Area: core.
- cMIP check: **G** (G11.2). How sure: inferred, from the bullet in section 8.4, which quotes those words.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 12's list (item 6).

**OI-108. May, or must: no Terms need carry a call and no one need answer one, so a sequence is readable only as far as its agreements call for reports and are answered.**
- Area: core.
- cMIP check: **G** (G11.2, G11.5). How sure: the text says so: "These grammar rules make no Terms carry a call, and make no one answer one." (`draft-25.md`, G11.2).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 7, "A sequence is readable only as far as its agreements call for reports, and are answered"; section 8.4, from draft 12's list (item 8).

**OI-109. The buyer's leg: whose leg it is, may or must, and who confirms.**
- Area: core.
- cMIP check: **G** (G11.7). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 13's list (items 1 to 3 and 5).

**OI-110. A payer whose assent to the version their payment names is not held.**
- Area: core.
- cMIP check: **G** (G11.6(b)). How sure: the text says so: "Where no assent of the payer to the version its payment names is held, the payer is not shown as bound by those Terms" (`draft-25.md`, G11.6(b)).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.3); G11.6(b) points to section 8.3.

**OI-111. How a buyer's assent stands beside the payment: two acts, or one act that is both.**
- Area: development.
- cMIP check: **E** (the bytes of an assent and of a payment). How sure: the text says so: "the encoding must say whether those are two acts, or one act can be both" (`draft-25.md`, section 10, item 10).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.3); section 10, item 10.

**OI-112. Whether "a payment is divided by the version it was made under" should itself stand in the grammar, for every leg whatever its cMIP.**
- Area: core.
- cMIP check: **G** (G13.2 (with G10.6, G13.1)). How sure: inferred, from the bullet in section 8.4, which states the question.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 10's list (item 1).

**OI-113. Which deal is meant where a service pays people who signed nothing with it.**
- Area: core.
- cMIP check: **C** (K6). How sure: the text says so: "what makes an agreement the work's deal with the service" (`draft-25.md`, section 5.1).
- Changes a verifier's answer: no (inferred: the text gives it to the service's cMIP).
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 12's list (item 1); section 5.1 (the first row).

**OI-114. A deal is as complete as its words: who bears a fee, and what becomes of a late payment, are whatever the deal states.**
- Area: core.
- cMIP check: **C** (K1 and K6). How sure: the text says so: "are whatever the deal states, read by its cMIP" (`draft-25.md`, section 7, "A deal is as complete as its words").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "A deal is as complete as its words".

**OI-115. Nothing makes a service, or an owner who receives for the others, divide as the shares say, or pay at all.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "Nothing in the grammar makes a service divide as the shares say, or pay at all." (`draft-25.md`, section 7, "A service is a hand").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "A service is a hand".

**OI-116. The record holds no value: the gap between what the record says and what is there must be checked continuously.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "Every act about value is a claim or an instruction." (`draft-25.md`, section 7, "The record holds no value").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "The record holds no value".

**OI-117. A buyer who paid an author who then vanished: the contest stays on the record, and the record cannot give the money back.**
- Area: core.
- cMIP check: **C** (K6 (escrow)). How sure: the text says so: "A buyer who wants that pays through an escrow service" (`draft-25.md`, section 7, "Paid, and the author gone").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Paid, and the author gone".

**OI-118. A receiver that points onward through agreements inside one leg: no limit on how many, and "not shown" where an agreement is met a second time.**
- Area: core.
- cMIP check: **G** (G1.4). How sure: the text says so: "Both are Claude's least reading, for the MOR lead to confirm (section 8.4)." (`draft-25.md`, section 6, P8).
- Changes a verifier's answer: yes (inferred: another reading changes who receives).
- Touches the way out: no.
- Source: draft-25.md, section 6, P8; section 8.4, from draft 15's list (items 12 and 13).

**OI-119. A work whose version names no receiver cannot be paid.**
- Area: core.
- cMIP check: **G** (G1.4). How sure: the text says so: "has nowhere to go, and is not shown" (`draft-25.md`, section 7, "A work that points nowhere cannot be paid").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "A work that points nowhere cannot be paid".

**OI-120. A work that names a service's public offer, and not its own deal, as its receiver is not stopped by the grammar.**
- Area: core.
- cMIP check: **G** (G1.3, G1.4). How sure: inferred, from the bullet in section 8.4, which states it.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 10's list (item 2).

### Cluster 5. Seeing beyond one leg, and the contest (18)

**OI-121. Who is a side of a leg where there is no report (silence); what "one leg" covers; and what lies beyond a silent leg.**
- Area: core.
- cMIP check: **G** (G11.4(d)). How sure: the text says so: "On whose behalf a verifier reads is not in the acts: whoever asks tells it." (`draft-25.md`, G11.4(d)).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B5)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B5; draft-25.md, section 8.4, from draft 12's list (items 12 and 13) and draft 11's list (item 8).

**OI-122. Which Terms' data cMIPs are asked about a buyer's confirmation.**
- Area: core.
- cMIP check: **G** (G11.6(b)). How sure: the text says so: "A confirmation now names the settlement (G11.7), so the verifier finds the payment by its settlement; which Terms are asked is read as before" (`verifier-2-report.md`, section 2, B6).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B6)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B6; draft-25.md, section 8.4, from draft 21's list (its 8.2: "the buyer's Terms for data").

**OI-123. The data task's one question; a report that carries the data of people bound by different Terms (every data cMIP asked must say yes: Claude's reading); and an empty `data`.**
- Area: core.
- cMIP check: **G** (G11.6(a)). How sure: the text says so: "that last reading is Claude's (section 8.4)" (`draft-25.md`, G11.6(a)).
- Changes a verifier's answer: yes (inferred: under another reading, one yes would let a report be read beyond its leg).
- Touches the way out: no.
- Source: draft-25.md, G11.6(a); section 8.4, from draft 19's list (its 8.2, items 11 to 14).

**OI-124. What a data cMIP focused on agreements is, beyond its socket; and whether such a cMIP belongs to Agreements alone.**
- Area: core.
- cMIP check: **C** (K8). How sure: the text says so: "until one is written and signed for, nobody reads further than their own leg" (`draft-25.md`, section 7, "One leg, and no further").
- Changes a verifier's answer: no (inferred: with `data` empty the answer is no, in every reading).
- Touches the way out: no.
- Source: draft-25.md, section 8.1 ("Seeing beyond one leg: an agreed path"); section 7, "One leg, and no further"; section 9, item 12; section 8.4, from draft 19's list (its 8.3), draft 15's list (item 22), draft 14's list (items 1 and 21), draft 13's list (item 22) and draft 12's list (item 14).

**OI-125. Whose signature a path for data needs, an outvoted member included ("at inception", what the cMIP decides, how wide a majority rule must be).**
- Area: core.
- cMIP check: **C** (K8). How sure: the text says so: "Which consent a data cMIP asks of the people it reads is that cMIP's to say." (`draft-25.md`, G11.6(b)).
- Changes a verifier's answer: no (inferred: the text gives it to the data cMIP).
- Touches the way out: no.
- Source: draft-25.md, section 5.2 (the row on an outvoted member); section 8.4, from draft 14's list (item 16) and draft 13's list (items 16 to 18).

**OI-126. Someone receives under a call in Terms they did not sign, themselves or through an agreement's signature: the path to them is not a signed one.**
- Area: core.
- cMIP check: **C** (K8). How sure: the text says so: "closing that gap is a cMIP's (section 5.2)" (`draft-25.md`, G11.2).
- Changes a verifier's answer: no (inferred: the text gives it to a cMIP).
- Touches the way out: no.
- Source: draft-25.md, G11.2; section 5.2 (the row quoting "I’d use a data cMIP to bridge the gaps."); section 8.4, from draft 15's list (its 8.3, item 6).

**OI-127. "Has to inform": a member paid by a service who tells her own agreement that she was paid has no grammar rule.**
- Area: core.
- cMIP check: **C** (K8, or a task and a call of that agreement's own). How sure: the text says so: "that agreement's own Terms: a task and a call of their own, or a data cMIP (K8)" (`draft-25.md`, section 5.2).
- Changes a verifier's answer: no (inferred: the text gives it to that agreement's Terms).
- Touches the way out: no.
- Source: draft-25.md, section 5.2; section 8.4, from draft 15's list (its 8.2, item 7).

**OI-128. "Only", after "by default": whether "Leg by leg only." means that no further path should exist at all.**
- Area: core.
- cMIP check: **G** (G11.6(a)). How sure: inferred, from the bullet in section 8.4, which states the question.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 14's list (item 8).

**OI-129. Whether a call that a leg's people signed could name a reader.**
- Area: core.
- cMIP check: **G** (G11.6). How sure: the text says so: "A call MUST NOT be read as naming a place, or a reader." (`draft-25.md`, G11.6).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 14's list (items 11 and 12).

**OI-130. Whether reading across legs should leave the grammar altogether, for data cMIPs.**
- Area: core.
- cMIP check: **G** (G11.4). How sure: inferred, from the bullet in section 8.4, which states the question.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 14's list (item 14).

**OI-131. "The grammar to support it should be there, in agreements only", and requests from further upstream.**
- Area: core.
- cMIP check: **G** (G11.6). How sure: inferred, from the bullet in section 8.4, which quotes those words.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 12's list (items 16 to 18).

**OI-132. What "so many processes" covers, and data that is not a report: Terms and their calls, what a payer learns of a work, standing.**
- Area: core.
- cMIP check: **G** (G11.6(a) (K8's one question)). How sure: the text says so: "Its one question, asked for one reader and one report of a leg carried out under those Terms" (`draft-25.md`, G11.6(a)).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 19's list (its 8.2, items 16 and 24 to 26; its 8.3) and draft 14's list (item 20).

**OI-133. Whether seeing one's own leg is enough for the wish: by default the buyer is not shown whether the money reached every member.**
- Area: core.
- cMIP check: **can't tell** (the question is about the wish, not about a rule). How sure: the text says so: "not whether the money reached every member" (`draft-25.md`, section 7, "One leg, and no further").
- Changes a verifier's answer: no (inferred: no answer word is in doubt).
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 13's list (item 7); section 7, "One leg, and no further".

**OI-134. "Vow", and what "bytes attached" means.**
- Area: presentation.
- cMIP check: **G** (section 2, "Vow"; G11.8). How sure: the text says so: "What "bytes attached" means is open (section 8.4)." (`draft-25.md`, section 2, "Vow").
- Changes a verifier's answer: no (draft-25.md, section 2: "no answer of a verifier turns on which of the two an agreement is").
- Touches the way out: no.
- Source: draft-25.md, section 2, "Vow"; section 8.4, from draft 16's list (its 8.2, item 3).

**OI-135. "Offer", read as Terms that name a party by role: Claude's reading; a contest is read against any version alike.**
- Area: core.
- cMIP check: **G** (section 2, "Offer"; G11.8). How sure: the text says so: "That reading is Claude's (section 8.4)." (`draft-25.md`, section 2, "Offer").
- Changes a verifier's answer: no (draft-25.md, G11.8: "whether that version names a party by role is shown beside it, and changes no answer").
- Touches the way out: no.
- Source: draft-25.md, section 2, "Offer"; section 8.4, from draft 16's list (its 8.2, item 4) and draft 18's list (item 11).

**OI-136. Who may make a contest besides a buyer and a baker, and when.**
- Area: core.
- cMIP check: **G** (G11.8). How sure: the text says so: "Who else may make a contest, and when, is not said (section 8.4)." (`draft-25.md`, G11.8).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, G11.8; section 8.4, from draft 16's list (its 8.2, item 6).

**OI-137. What a contest is and does; who is contested "at first"; the signers' own contest of their service, and whether a deal signed by known parties is an offer or a vow; what "only" rules out.**
- Area: core.
- cMIP check: **G** (G11.8). How sure: the text says so: "Whether such a deal, signed by parties who were known, is an offer or a vow is not said (section 8.4)." (`draft-25.md`, G11.8).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, G11.8; section 8.4, from draft 16's list (its 8.3, items 1 to 4) and draft 13's list (items 8 to 14).

**OI-138. A contest reaches one agreement: if the fault is a service's, the buyer depends on the signers to contest it in turn, and the money may already have been passed on.**
- Area: core.
- cMIP check: **C** (K6 (escrow)). How sure: the text says so: "escrow, as a service's cMIP (K6)" (`draft-25.md`, section 5.2).
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "A contest reaches one agreement"; section 5.2 (the row on a contest).

### Cluster 6. The baker and the envelope (23)

**OI-139. Which answer word a verifier gives for Terms that are late against a transfer of the baker's rights.**
- Area: core.
- cMIP check: **G** (G14.2(c)). How sure: the text says so: "**The answer:** no new answer word." (`draft-25.md`, G14.2).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 2 (A2)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A2; draft-25.md, section 8.2, item 5.

**OI-140. "Nothing they name is lacking", for a thief's Terms: which lacking act makes the answer unchecked and not invalid.**
- Area: core.
- cMIP check: **G** (G14.3(a)). How sure: the text says so: "and nothing they name is lacking, they are **invalid**" (`draft-25.md`, G14.3(a)).
- Changes a verifier's answer: yes (verifier-2-report.md, section 3, item 10 (A11)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, A11; draft-25.md, section 8.4, from draft 21's list (its 8.2: "a thief's Terms not shown and unchecked").

**OI-141. A double sale: who holds the baker's rights at an act that lies in a fork of the envelope's chain; "not shown" where that layer gives no holder.**
- Area: core.
- cMIP check: **G** (G14.2, G14.3(b)). How sure: the text says so: "Where that layer gives no holder while the fork stands, no party is shown to be the holder at that act, and the answer is **not shown** (G14.3(b))." (`draft-25.md`, G14.2).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B3)).
- Touches the way out: yes (succession of the baker's rights: G14.2).
- Source: verifier-2-report.md, sections 2 and 3, B3; draft-25.md, section 8.3, item 3; section 8.4, from draft 23's list (its 8.2, item 3) and draft 21's list (its 8.2, item 8).

**OI-142. Late Terms per place: read from the Terms act's own position against the transfer's, or from the position at which they came into force.**
- Area: core.
- cMIP check: **G** (G14.2(b)). How sure: the text says so: "Late Terms per place" (`verifier-2-report.md`, section 2, B4).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B4)).
- Touches the way out: yes (anchored history, and succession of the baker's rights: G14.2(b)).
- Source: verifier-2-report.md, sections 2 and 3, B4.

**OI-143. Which knots, and which anchoring, show Terms late against a transfer: Claude's reading, carried over from late updates.**
- Area: core.
- cMIP check: **G** (G14.2). How sure: the text says so: "None is decided; each is for the MOR lead and for Nobody, allegedly, to take, change or refuse." (`draft-25.md`, section 8.2).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (anchored history, and succession of the baker's rights: G14.2).
- Source: draft-25.md, section 8.2, item 3.

**OI-144. Whether the envelope's own layer may give an anchoring that shows Terms late.**
- Area: development.
- cMIP check: **L** (the envelope's layer). How sure: the text says so: "whether that layer gives an anchoring of its own that orders Terms against its transfers" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (anchored history: G14.2(b)).
- Source: draft-25.md, section 8.2, item 3; section 8.1 (the envelope's chain, need (4)); section 6, P18.

**OI-145. A seller who has sold the baker's rights can still make Terms citing a point before the sale, which count where nothing shows them late.**
- Area: core.
- cMIP check: **G** (G14.2). How sure: the text says so: "A seller who has sold can so still make Terms citing a point before the sale, which count where nothing shows them late: a stated cost." (`draft-25.md`, section 8.2, item 4).
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: yes (succession of the baker's rights: G14.2).
- Source: draft-25.md, section 8.2, item 4; section 7, "Ownership is as wide as its place".

**OI-146. The field `envelope_at`: a field of its own is Claude's choice, and its name is the MOR lead's to change.**
- Area: development.
- cMIP check: **G** (section 3.1). How sure: the text says so: "a field of its own is Claude's choice, and its name is the MOR lead's to change" (`draft-25.md`, section 8.2, item 1).
- Changes a verifier's answer: no (inferred: the same act is named either way).
- Touches the way out: no.
- Source: draft-25.md, section 8.2, item 1.

**OI-147. The holder at an act: the baker at the bake, otherwise the one the last transfer at or before that act names: Claude's reading.**
- Area: core.
- cMIP check: **G** (G14.1). How sure: the text says so: "None is decided; each is for the MOR lead and for Nobody, allegedly, to take, change or refuse." (`draft-25.md`, section 8.2).
- Changes a verifier's answer: yes (inferred: another reading of the holder changes whether Terms count).
- Touches the way out: yes (succession of the baker's rights: G14.1).
- Source: draft-25.md, section 8.2, item 2.

**OI-148. A new version after a sale: the old version stays in force, and a later update of it needs the buyer of the rights.**
- Area: core.
- cMIP check: **G** (G14.2). How sure: the text says so: "So the old version stays in force after a sale, and a later update of it needs the buyer" (`draft-25.md`, section 8.2, item 6).
- Changes a verifier's answer: yes (inferred: another reading changes whether such a version counts).
- Touches the way out: yes (succession of the baker's rights, and updating after it: G14.2, G5.1(c)).
- Source: draft-25.md, section 8.2, item 6.

**OI-149. A fork resolved in the envelope's chain: what that does to Terms that cite the branch set aside.**
- Area: development.
- cMIP check: **L** (the envelope's layer). How sure: the text says so: "what that does to Terms that cite it is not in the exchange, and not said; the holder at that act is still read as that layer gives it" (`draft-25.md`, section 8.2, item 7).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession of the baker's rights: G14.2).
- Source: draft-25.md, section 8.2, item 7; section 6, P18.

**OI-150. Terms where the holder's place is not yet shown count for nothing until it is shown: the MOR lead's settlement.**
- Area: core.
- cMIP check: **G** (G14.3(b)). How sure: the text says so: "They count for nothing until it is shown: the MOR lead's settlement" (`draft-25.md`, section 8.3, item 1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.3, item 1; section 8.4, from draft 22's list (its 8.3, item 1).

**OI-151. "Bound by them", for the holder of the baker's rights: bound in any way G5.1 allows, the party still named, the Terms replaced asked too, "before and apart from G14.3": Claude's readings.**
- Area: core.
- cMIP check: **G** (G14.2). How sure: the text says so: "For this question alone, whether the Terms are a version, in whose name an assent counts, and whether an update condition answers valid for them are read from the acts as for any Terms, before and apart from G14.3's answer about these Terms, which waits on it." (`draft-25.md`, G14.2).
- Changes a verifier's answer: yes (inferred: another reading of "bound" changes whether Terms count).
- Touches the way out: yes (succession of the baker's rights; an update without the baker: G14.2, G5.1(c)).
- Source: draft-25.md, section 8.4, from draft 22's list (its 8.2, items 1 to 4 and 6).

**OI-152. A baker, or holder, who fills a role of the Terms.**
- Area: core.
- cMIP check: **G** (G14.3(b)). How sure: the text says so: "A holder who fills a role of those Terms is one of their parties from then on (G10.3)" (`draft-25.md`, G14.3(b)).
- Changes a verifier's answer: yes (draft-25.md, section 9, item 15: "its tests answer otherwise").
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.2, items 1 to 9).

**OI-153. Whether a transfer of the baker's rights, or the sale it carries out, calls for reports.**
- Area: development.
- cMIP check: **L** (the envelope's layer). How sure: the text says so: "a transfer is not an act of this text" (`draft-25.md`, section 6, P18).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession of the baker's rights: G14.1).
- Source: draft-25.md, section 6, P18; section 8.3, item 5; section 8.4, from draft 11's list (item 13).

**OI-154. One envelope with several bakers; a transfer that names several holders; whether a holder may be an agreement.**
- Area: development.
- cMIP check: **L** (the envelope's layer). How sure: the text says so: "is that layer's to say, and this text needs to be told" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession of the baker's rights: G14.1).
- Source: draft-25.md, section 6, P18; section 8.3, item 5; section 8.1 (the envelope's chain, need (2)).

**OI-155. Terms that sell a baked work's bytes without naming its envelope: the same thing sold in two agreements that name no envelope is seen by neither.**
- Area: core.
- cMIP check: **G** (G14 (it reads only Terms that name an envelope)). How sure: the text says so: "G14 reads only Terms that name one" (`draft-25.md`, section 6, P18).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 6, P18; section 8.3, item 5; section 7, "Ownership is as wide as its place".

**OI-156. How Terms of a sale stand beside the transfer that carries it out.**
- Area: core.
- cMIP check: **can't tell** (G14, or the envelope's layer). How sure: inferred, P18 lists it as not said and names no rule or layer for it.
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession of the baker's rights: G14.2).
- Source: draft-25.md, section 6, P18; section 8.3, item 5.

**OI-157. Which baker may contest: a baker's contest against Terms that name her own envelope without her, or against a thief's Terms.**
- Area: core.
- cMIP check: **G** (G14.5(e), G11.8). How sure: inferred, G14.5(e) gives a baker a contest against Terms for another envelope of the same work; section 8.3, item 5 lists the contest against Terms for her own envelope as not covered.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.3, item 5; section 8.4, from draft 21's list (its 8.3: "a contest against a thief's Terms") and draft 18's list (item 9).

**OI-158. The baker is as the envelope says: an edited work baked again is another envelope, and whether it owes anything to the first is not read.**
- Area: development.
- cMIP check: **L** (the core (the bake)). How sure: the text says so: "as the core gives them" (`draft-25.md`, section 7, "The baker is as the envelope says").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "The baker is as the envelope says".

**OI-159. A copy is made legible, not forbidden: which bake is the original is never a verifier's answer.**
- Area: core.
- cMIP check: **C** (a cMIP people name, or a judge named in their Terms; the text names no socket). How sure: the text says so: "A cMIP that people name may give it, or a judge they name in their Terms" (`draft-25.md`, G14.5).
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "A copy is made legible, not forbidden"; section 5.2 (the row on a copier).

**OI-160. A succession that is held and passes nothing.**
- Area: core.
- cMIP check: **can't tell** (the term is gone from the text since draft 23). How sure: the text says so: "**Succession**: no longer a term of this text." (`draft-25.md`, section 2).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession).
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.3).

**OI-161. "Chain" said of the envelope, and who must be named.**
- Area: presentation.
- cMIP check: **G** (G14.1; section 2, "Chain"). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 23's list (its 8.2, items 5 and 6).

### Cluster 7. What the layers below and the shared language have not yet given (31)

**OI-162. The core's act format: fingerprints, a per-signer line of acts (which would make G6 redundant), an act signed by several at once, field names, whether the core's `for` can hold an agreement's root.**
- Area: development.
- cMIP check: **L** (the core). How sure: the text says so: "whether it already gives fingerprints, a per-signer line of acts (which would make G6 redundant), acts signed by several people at once, and field names" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 (first point; and "Whether the core has an act signed by several people at once"); section 9, item 1. encoding-2-report.md says the bytes are now written (encoding-2.md, not among the sources).

**OI-163. A place, from the layer that orders acts: five needs, none met by a current lower text.**
- Area: development.
- cMIP check: **L** (the layer that orders acts). How sure: the text says so: "Until this exists, every "per place" in this text has nothing under it that can be built." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (anchored history: G7).
- Source: draft-25.md, section 8.1; section 9, item 4.

**OI-164. Without a place: no scarcity and no freshness; and two parties who accept different places cannot settle who holds a thing.**
- Area: core.
- cMIP check: **L** (the layer that orders acts). How sure: inferred, both costs rest on G7, whose place section 8.1 says no current lower text gives.
- Changes a verifier's answer: no (inferred: stated costs).
- Touches the way out: yes (anchored history: G7.3).
- Source: draft-25.md, section 7, "Without a place, no scarcity and no freshness" and "Ownership is as wide as its place".

**OI-165. What the Sign layer does when a key is replaced or lost, and what a change of key does to a signer's line.**
- Area: development.
- cMIP check: **L** (the Sign layer). How sure: the text says so: "since that decides whether G6 sees a fork" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: yes (inferred from that sentence: fork, or no fork).
- Touches the way out: yes (portable identity: a signer that outlives its keys; G6).
- Source: draft-25.md, section 8.1; section 9, item 2.

**OI-166. How cMIPs are identified in practice, so that "named by fingerprint" can be met.**
- Area: development.
- cMIP check: **L** (another layer (the text does not say which)). How sure: the text says so: "How cMIPs are identified in practice, so that "named by fingerprint" in G2 can be met." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1.

**OI-167. What a clock is, which layer gives it, how it is identified, and whether the place may also be the clock.**
- Area: development.
- cMIP check: **L** (the layer that gives a clock). How sure: the text says so: "What a clock is, which layer gives it, and how it is identified without a server address (G7.4)." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (anchored history: G7.4).
- Source: draft-25.md, section 8.1; section 6, P11 and P16; section 9, item 5; section 8.4, from draft 21's list (its 8.3: "a clock").

**OI-168. The report block is the MOR lead's proposal, written into no spec; G11 and the Control task's row follow it if it changes.**
- Area: development.
- cMIP check: **L** (the report block). How sure: the text says so: "the MOR lead's proposal, not a decision, not yet written into any spec, its wording his to change" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 8.3, item 6; section 9, item 6; section 8.4, from draft 11's list (item 1); kishib-agreements-new-report.md, section 1 ("not yet in any spec").

**OI-169. The block: how a call is written, where it sits in the act that holds the task, whether it is per task or per act, and the field `calls`.**
- Area: development.
- cMIP check: **L** (the report block). How sure: the text says so: "how a call is written, where it sits in the act that holds the task, and how a report names it by fingerprint" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 8.4, from draft 11's list (item 3).

**OI-170. The block: how "where that side receives" is found without a server address; a report's one leg is not in its bytes.**
- Area: development.
- cMIP check: **L** (the report block; the Deliver layer). How sure: the text says so: "encoding 2's report carries no addressee" (`kishib-agreements-new-report.md`, section 6, finding 8).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 8.4, from draft 14's list (item 10); kishib-agreements-new-report.md, section 6, finding 8.

**OI-171. The block: how a report is written as an act, and which text holds that one definition.**
- Area: development.
- cMIP check: **L** (the report block). How sure: the text says so: "how a report is written as an act, and which text holds that one definition" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 9, item 6.

**OI-172. The block: whether one report can answer several calls, or cover many payments.**
- Area: development.
- cMIP check: **L** (the report block). How sure: the text says so: "whether one report can answer several calls at once (P6)" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 (twice: the block's open points, and the seam "One report, several calls"); section 6, P6 and P20; section 8.2, item 16.

**OI-173. The block: whether "unanswered" ever ends.**
- Area: development.
- cMIP check: **L** (the report block). How sure: the text says so: "whether "unanswered" ever ends" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1.

**OI-174. The block: its words, which are the MOR lead's, but for "leg".**
- Area: presentation.
- cMIP check: **L** (the report block). How sure: the text says so: "and its words, which are the MOR lead's, as technical wording, but for "leg"" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: no (inferred: words only).
- Touches the way out: no.
- Source: draft-25.md, section 8.1.

**OI-175. Seam with the block: a confirmation with no call written (a call made by default, named by the settlement).**
- Area: development.
- cMIP check: **L** (the report block (its R1, R2, R5)). How sure: the text says so: "since a call made by default has no bytes of its own (R2)" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 (the seams, first).

**OI-176. Seam with the block: "two sides who both signed", where this text's two sides need not have signed anything together.**
- Area: development.
- cMIP check: **L** (the report block (its plain words)). How sure: the text says so: "*The block would need* to drop "who both signed" from its plain words and say the two sides as G11.1 does." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 (the seams, second).

**OI-177. Seam with the block: halves compared where the call expects one side only.**
- Area: development.
- cMIP check: **L** (the report block (its R4)). How sure: the text says so: "*The block would need* R4 to say the second case." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 (the seams, third).

**OI-178. That no other layer of MOR carries a report further than its leg, lets a call name a place or a reader, or gives a path the people concerned did not sign for.**
- Area: development.
- cMIP check: **L** (the shared language and every other layer). How sure: the text says so: "that none of them carries a report further than its leg" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 ("Seeing beyond one leg: an agreed path"); G11.6(c).

**OI-179. "The same payment" where Money records one payment as two acts; and Money's counting of one of two differing amounts.**
- Area: development.
- cMIP check: **L** (the Money layer). How sure: the text says so: "this text needs its answer to whether two such acts are of the same payment (G11.4(b))" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 9, item 7.

**OI-180. What a settlement and a payment are as acts: how a payment names the version it read, where the payer's call sits, and whether a payer can state that no confirmation is called for.**
- Area: development.
- cMIP check: **L** (the Money layer). How sure: the text says so: "where the payer's call sits in it, and whether a payer can state that no confirmation is called for (G11.7)" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1 (two points); section 9, item 7; section 8.4, from draft 18's list (its 8.3: "the task of paying in a payment") and draft 15's list (items 10 and 11).

**OI-181. How an amount is written, so that every reader reads it alike.**
- Area: development.
- cMIP check: **L** (the Money layer). How sure: the text says so: "How that layer writes an amount, so that the amounts in a leg report (task K6) can be read by everyone alike (P20)." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 6, P20.

**OI-182. What a receiving side's "automatic" report is: who signs it, and whether a settlement can itself be the confirmation.**
- Area: development.
- cMIP check: **L** (the Money layer). How sure: the text says so: "who signs it, and whether a settlement can itself be the confirmation" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 6, P20; section 8.4, from draft 12's list (item 10).

**OI-183. A payment that is pending: no answer word exists for it here.**
- Area: development.
- cMIP check: **L** (the Money layer (then a cMIP of K6, or the bytes of the answer words)). How sure: the text says so: "the Money layer's encoding says whether a payment or a settlement has a pending state, as which act, and what it names" (`draft-25.md`, section 8.2, item 14).
- Changes a verifier's answer: can't tell (the text says: "The least reading until then is unchecked (G9).").
- Touches the way out: no.
- Source: draft-25.md, section 8.2, item 14; section 9, item 7; section 8.4, from draft 18's list (its 8.3: "a settlement answered "pending"").

**OI-184. Whether the verifier's answer words are already named in another layer, where "invalid" stops there, and the core's "unknown", "void" and "pending".**
- Area: presentation.
- cMIP check: **L** (the core and the other layers). How sure: the text says so: "Whether that is the line the other layers draw is not known to this text (section 8.1)." (`draft-25.md`, section 6, P19).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 6, P19; section 9, item 13; section 8.4, from draft 18's list (its 8.3: "the core's names").

**OI-185. The envelope's chain, from the layer below: the bake names the baker, a transfer act, who may sign it, the holder at an act, what a fork there shows; the core's words (bake, uploader) differ from this text's.**
- Area: development.
- cMIP check: **L** (the layer below (the envelope)). How sure: the text says so: "Until this exists, G14 has nothing under it that can be built." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: yes (succession of the baker's rights: G14.1).
- Source: draft-25.md, section 8.1; section 9, item 8.

**OI-186. How a verifier tells that two envelopes carry the same work.**
- Area: development.
- cMIP check: **L** (the core). How sure: the text says so: "how a verifier tells that two envelopes carry the same work (G14.5)" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 8.4, from draft 18's list (item 10).

**OI-187. What access to what was bought is, who gives it, and what shows that it was given or was not.**
- Area: development.
- cMIP check: **L** (the Deliver layer). How sure: the text says so: "What access to what was bought is, who gives it, and what shows that it was given or was not (G11.7, G11.8)" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 9, item 9; section 8.4, from draft 13's list (items 1 to 3 and 5: "what access is").

**OI-188. Whether the core already has a contest act ("It is just extended").**
- Area: development.
- cMIP check: **L** (the core). How sure: the text says so: "If the core has a contest act, this text should name it and say only what is extended: that it is made against an offer or a vow." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 8.4, from draft 16's list (its 8.2, item 5).

**OI-189. What a client is, where the duties of clients (and of cMIPs) are kept, and how a client is tested against them.**
- Area: presentation.
- cMIP check: **L** (wherever clients' duties are kept (the text does not say)). How sure: the text says so: "What a client is, where the duties of clients are kept, and how a client is tested against them, since no verifier can check G12.8." (`draft-25.md`, section 8.1).
- Changes a verifier's answer: no (inferred: the text says no verifier can check it).
- Touches the way out: no.
- Source: draft-25.md, section 8.1; section 8.4, from draft 20's list (its 8.3: "duties of cMIPs and clients").

**OI-190. Who is reading: a verifier must be told on whose behalf it reads and which anchoring that reader accepts.**
- Area: development.
- cMIP check: **L** (no layer yet). How sure: the text says so: "No layer says how." (`draft-25.md`, section 9, item 11).
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 9, item 11.

**OI-191. The lower layers' texts still speak of the earlier Agreements (publications, split services, collectives with keys, keepers, grants).**
- Area: presentation.
- cMIP check: **L** (the lower layers' texts). How sure: the text says so: "A builder handed them with this text needs either their rewrite or a table of which of their sentences to pass over" (`draft-25.md`, section 9, item 14).
- Changes a verifier's answer: no (inferred: words only).
- Touches the way out: no.
- Source: draft-25.md, section 9, item 14.

**OI-192. The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an evidence-only record to be enough.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "G6 depends on the answer for its force" (`draft-25.md`, section 8.1).
- Changes a verifier's answer: no (inferred: no answer word is in doubt).
- Touches the way out: no.
- Source: draft-25.md, section 8.1.

### Cluster 8. Bytes, vectors and tools (17)

**OI-193. What each socket hands its cMIP and gets back, as data; and the stub cMIPs every builder shares.**
- Area: development.
- cMIP check: **E** (the bytes of a socket's input and output). How sure: the text says so: "Unchanged (section 10, item 12)" (`verifier-2-report.md`, section 2, B9).
- Changes a verifier's answer: no (verifier-2-report.md, section 3, "Those that do not change an answer" (B9)).
- Touches the way out: no.
- Source: verifier-2-report.md, sections 2 and 3, B9; draft-25.md, section 9, item 3.

**OI-194. The "parts for machines" a body's cMIP gives back: the part each party is given; that Terms are a delegation, who delegates to whom, and the conditions on ending.**
- Area: development.
- cMIP check: **E** (the bytes of what the body's socket hands back). How sure: the text says so: "the encoding of what a socket hands back is needed for every task" (`draft-25.md`, section 10, item 12).
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (the conditions on ending a delegation are read from it: G5.5).
- Source: draft-25.md, section 9, item 10; section 10, item 12.

**OI-195. How a role is named by `authors` and `receiver`.**
- Area: development.
- cMIP check: **E** (the bytes of `authors` and `receiver`). How sure: the text says so: "the text lets both point at a role and gives no way to do it" (`draft-25.md`, section 10, item 4).
- Changes a verifier's answer: no (inferred: encoding-2-report.md and draft-25.md, G1.3 now give the receiver by position).
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.3, item 1); section 10, item 4.

**OI-196. A choice made in writing the bytes: the receiver's first items are 0 and 2; a position beyond the list is read as "no one receives".**
- Area: development.
- cMIP check: **E** (the bytes of `receiver`). How sure: the text says so: "A position beyond the list is still read as "no one receives, not shown" (a note)" (`encoding-2-report.md`, "Where writing it needed a choice").
- Changes a verifier's answer: no (inferred).
- Touches the way out: no.
- Source: encoding-2-report.md, "Where writing it needed a choice", fourth point.

**OI-197. `parties` keeps the writer's order, so the same parties in another order are a different act.**
- Area: development.
- cMIP check: **E** (the bytes of `parties`). How sure: the text says so: "`parties` keeps the writer's order, so listing the same parties in another order is a different act (E18, by design: positions name parties)." (`encoding-2-report.md`, "What a stranger's reading found").
- Changes a verifier's answer: no (inferred: by design).
- Touches the way out: no.
- Source: encoding-2-report.md, "What a stranger's reading found", left as they are.

**OI-198. `relies_on` may repeat what another field names, so one meaning has more than one byte form.**
- Area: development.
- cMIP check: **E** (the bytes of `relies_on`). How sure: the text says so: "so one meaning has more than one byte form" (`encoding-2-report.md`, "What a stranger's reading found").
- Changes a verifier's answer: no (inferred: "read once and not refused").
- Touches the way out: no.
- Source: encoding-2-report.md, "What a stranger's reading found", left as they are.

**OI-199. A report that names Terms may leave out the task.**
- Area: development.
- cMIP check: **E** (the bytes of a report). How sure: the text says so: "A report naming Terms may leave out the task (E21)." (`encoding-2-report.md`, "What a stranger's reading found").
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: encoding-2-report.md, "What a stranger's reading found", left as they are.

**OI-200. Where an act has two faults that are both rejections, which one is named is not fixed.**
- Area: development.
- cMIP check: **E** (the checker). How sure: the text says so: "Two faults that are both rejections: which one is named is not fixed" (`encoding-2-report.md`, "What a stranger's reading found").
- Changes a verifier's answer: no (inferred: rejected either way; the rule named differs).
- Touches the way out: no.
- Source: encoding-2-report.md, "What a stranger's reading found", left as they are.

**OI-201. The check before signing relies on the present reading that a signature is verified with the key the act carries.**
- Area: development.
- cMIP check: **E** (encoding 2, E1). How sure: the text says so: "The check before signing relies on E1's present reading" (`kishib-agreements-new-report.md`, section 6, finding 6).
- Changes a verifier's answer: no (inferred: a dependency, stated).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 6, finding 6.

**OI-202. The grammar's answers shown before signing are about the draft, not the act then signed: the two have different ids.**
- Area: development.
- cMIP check: **E** (the act's id (signature, salts, nonces)). How sure: inferred, finding 7 gives the cause as the bytes of the two acts.
- Changes a verifier's answer: no (kishib-agreements-new-report.md, section 6, finding 7: "The answers are the same for both").
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 6, finding 7.

**OI-203. An act for a collective is not read where the suite's runner reads it: the runner reads `objects`, which encoding 2 forbids.**
- Area: development.
- cMIP check: **L** (the suite's runner cMIP). How sure: the text says so: "the runner cMIP's next draft should read `for`" (`kishib-agreements-new-report.md`, section 6, finding 5).
- Changes a verifier's answer: no (inferred: "Nothing is lost for the person").
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 6, finding 5.

**OI-204. A reader in the binding: a payload back to the builder's own input form, so that every client shows the same fields.**
- Area: development.
- cMIP check: **can't tell** (fits none of the four (a tool)). How sure: the text says so: "which would drift silently if the numbering changed" (`kishib-agreements-new-report.md`, section 7, request 1).
- Changes a verifier's answer: no (inferred: a tool).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 7, request 1.

**OI-205. Structured refusals from the builders.**
- Area: development.
- cMIP check: **can't tell** (fits none of the four (a tool)). How sure: the text says so: "Structured refusals from the builders" (`kishib-agreements-new-report.md`, section 7, request 2).
- Changes a verifier's answer: no (inferred: a tool).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 7, request 2.

**OI-206. Each change to the binding needs the client's release built again.**
- Area: development.
- cMIP check: **can't tell** (fits none of the four (a tool)). How sure: the text says so: "each later change to the binding needs Kišib's release built again on GitHub" (`kishib-agreements-new-report.md`, section 7, request 3).
- Changes a verifier's answer: no (inferred: a tool).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 7, request 3.

**OI-207. Vectors whose expected answers are written from the text before any code runs, by another reader than the one who wrote the code.**
- Area: development.
- cMIP check: **can't tell** (fits none of the four (how the vectors are made)). How sure: the text says so: "Each was written by the same reader who wrote the code, and fixes that reader's reading." (`draft-25.md`, section 9, item 15).
- Changes a verifier's answer: no (inferred: about the tests, not a rule).
- Touches the way out: no.
- Source: draft-25.md, section 9, item 15.

**OI-208. A contradiction between sources, not resolved here: draft 25 says of vectors "None exist."; the encoding report gives 44 valid and 116 invalid cases, and the verifier report 120 cases.**
- Area: development.
- cMIP check: **can't tell** (a contradiction between sources). How sure: the text says so: "44 valid and 116 invalid cases" (`encoding-2-report.md`, "What was written").
- Changes a verifier's answer: no (inferred: about the tests, not a rule).
- Touches the way out: no.
- Source: draft-25.md, section 9, item 15 ("None exist."); encoding-2-report.md, "What was written"; verifier-2-report.md, section 1 ("120 cases").

**OI-209. A contradiction inside one source, not resolved here: the bytes were cleaned "so that two honest writers cannot write the same act in two ways"; the same report leaves, knowingly, an act whose one meaning has more than one byte form.**
- Area: development.
- cMIP check: **can't tell** (a contradiction between two passages). How sure: the text says so: "so that two honest writers cannot write the same act in two ways" (`encoding-2-report.md`, "In plain words").
- Changes a verifier's answer: no (inferred from "read once and not refused").
- Touches the way out: no.
- Source: encoding-2-report.md, "In plain words" and "What a stranger's reading found", left as they are; draft-25.md, the opening ("What draft 25 is").

### Cluster 9. Limits the text states, the record, the words and the client (25)

**OI-210. Minds: whether a party was able, or free, cannot be shown by any act.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "nothing assigns its failure" (`draft-25.md`, section 7, "Minds").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Minds".

**OI-211. Conceal: nothing can show that private words were not told to someone.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "nothing can show the words were not told to someone, and telling cannot be undone" (`draft-25.md`, section 7, "Conceal (#39)").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Conceal (#39)".

**OI-212. Enforce beyond what was posted: against value not under Control, force lies outside the protocol.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "force lies outside the protocol" (`draft-25.md`, section 7, "Enforce beyond what was posted (#45)").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Enforce beyond what was posted (#45)".

**OI-213. Deeds lean on witnesses, whose statements prove only that the witness said them.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "whose statements prove only that the witness said them" (`draft-25.md`, section 7, "Deeds lean on witnesses").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Deeds lean on witnesses".

**OI-214. Reputation is as wide as the acts one holds: two people holding different acts compute different standing.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four (standing is a reader's own cMIP, named by no act)). How sure: the text says so: "Two people holding different acts compute different standing for the same signer" (`draft-25.md`, section 7, "Reputation is as wide as the acts one holds").
- Changes a verifier's answer: no (inferred: standing is no answer of a verifier).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Reputation is as wide as the acts one holds".

**OI-215. Secret votes need a teller.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "requires trusting whoever counts" (`draft-25.md`, section 7, "Secret votes need a teller").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Secret votes need a teller".

**OI-216. Identity ends in acquaintance.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "the grammar cannot express that" (`draft-25.md`, section 7, "Identity ends in acquaintance").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Identity ends in acquaintance".

**OI-217. Those who cannot sign (the long dead, the unknowing) can be named in words but are no party, and nothing can arrive for them.**
- Area: core.
- cMIP check: **can't tell** (fits none of the four). How sure: the text says so: "can be named in words but is no party, and nothing can arrive for them" (`draft-25.md`, section 7, "Those who cannot sign").
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: can't tell (a contributor who is gone: succession, perhaps).
- Source: draft-25.md, section 7, "Those who cannot sign".

**OI-218. Ordering and lines show the shape of an agreement (who acted, how often, in what order) even when the words are concealed.**
- Area: core.
- cMIP check: **G** (G6, G7). How sure: inferred, the cost names G6 and G7 as what makes the shape visible.
- Changes a verifier's answer: no (inferred: a stated cost).
- Touches the way out: no.
- Source: draft-25.md, section 7, "Ordering and lines show patterns".

**OI-219. A contradiction between sources, not resolved here: the client rule of 11 November names "what the person can always do"; draft 25 has no such rule.**
- Area: presentation.
- cMIP check: **can't tell** (a contradiction between a decided client rule and the text). How sure: the text says so: "the client duty points at a guarantee the new text chose not to hold" (`kishib-agreements-new-report.md`, section 6, finding 1).
- Changes a verifier's answer: no (inferred: about what a client shows).
- Touches the way out: yes (leaving: the report says the rule pointed at "the way out").
- Source: kishib-agreements-new-report.md, section 6, finding 1 (which cites F441, gate 1); draft-25.md, section 7, "No default way out".

**OI-220. Before which acts the client's duty to show Terms is owed: a Terms act, an assent, a resolve, a kind a cMIP defines.**
- Area: presentation.
- cMIP check: **L** (wherever clients' duties are kept). How sure: the text says so: "Open: before which acts the duty is owed." (`kishib-agreements-new-report.md`, section 6, finding 2).
- Changes a verifier's answer: no (inferred: about what a client shows).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 6, finding 2.

**OI-221. The words of Terms are only a fingerprint in the bytes: should a client refuse to sign where it was not handed the words.**
- Area: presentation.
- cMIP check: **L** (wherever clients' duties are kept). How sure: the text says so: "refuse once the apps hand the words" (`kishib-agreements-new-report.md`, section 6, finding 3).
- Changes a verifier's answer: no (inferred: about what a client shows).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 6, finding 3.

**OI-222. An assent whose Terms the client was not handed can still be signed: the one case where the client does not meet the decided client rule.**
- Area: presentation.
- cMIP check: **L** (wherever clients' duties are kept). How sure: the text says so: "This is the one case where Kišib does not meet the decided client rule." (`kishib-agreements-new-report.md`, section 6, finding 4).
- Changes a verifier's answer: no (inferred: about what a client shows).
- Touches the way out: no.
- Source: kishib-agreements-new-report.md, section 6, finding 4.

**OI-223. Words chosen by Claude: "resolving update", "set aside", "built on", `resolves`, "succession", "receiver for an act", "receiving side", "applies", "own line".**
- Area: presentation.
- cMIP check: **G** (section 2). How sure: inferred, from the bullets in section 8.4, which list the words.
- Changes a verifier's answer: no (inferred: words only).
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.2, item 13) and draft 15's list (items 14 and 15).

**OI-224. "Should not", written MUST NOT.**
- Area: presentation.
- cMIP check: **G** (G12 (the bullet names no clause)). How sure: inferred, from the bullet's title and the rule it names; the question itself is in history.md, which is not among the sources.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.2, items 7 to 12).

**OI-225. G11 is a newer grammar rule under an older number.**
- Area: presentation.
- cMIP check: **G** (G11). How sure: inferred, from the bullet in section 8.4, which states it.
- Changes a verifier's answer: no (inferred: a number only).
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 10's list (item 13).

**OI-226. Where the ledger's arrived-at line says more than the exchange "The holder at the time": "to dodge a later transfer", "the buyer holds the rights from then on", "so 'invalid' stays an act that never counted".**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger (docs/decisions.md) and the text; G14.2). How sure: the text says so: "The arrived-at line is the MOR lead's reading, marked "to check"." (`draft-25.md`, section 8.2).
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (the exchange is about a sale of the baker's rights).
- Source: draft-25.md, section 8.2, items 8 to 10.

**OI-227. Where the ledger's line said more than the exchange "The envelope states its owner": "ownership", "naming the new one", "(or should be)".**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger and the text; G14). How sure: inferred, from the bullet in section 8.4.
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (the exchange is about who holds the baker's rights).
- Source: draft-25.md, section 8.4, from draft 23's list (its 8.2, items 7 to 9).

**OI-228. Where the ledger's line said more than the exchange on the baker's rights after a sale.**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger and the text; G14.2). How sure: inferred, from the bullet in section 8.4.
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell (the exchange is about a sale of the baker's rights).
- Source: draft-25.md, section 8.4, from draft 22's list (its 8.2, items 7 to 9).

**OI-229. Where the ledger's lines say more than the four exchanges of draft 21 (a late rival, setting aside what an agent made, the buyer signs the offer, a thief's Terms).**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger and the text). How sure: inferred, from the bullet in section 8.4.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 21's list (its 8.2, items 9 to 13).

**OI-230. Where the ledger's lines say more than "An agent and the judicial", "The encoding first" and "After box 2".**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger and the text). How sure: inferred, from the bullet in section 8.4.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 20's list (its 8.2, items 18 to 20).

**OI-231. Where the ledger's lines say more than the exchanges on sockets, bakes and the default.**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger and the text). How sure: inferred, from the bullet in section 8.4.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.2, items 16 to 22).

**OI-232. Where the ledger's lines say more than the exchanges on the contest and on forks.**
- Area: presentation.
- cMIP check: **can't tell** (a matter between the ledger and the text). How sure: inferred, from the bullet in section 8.4.
- Changes a verifier's answer: can't tell.
- Touches the way out: no.
- Source: draft-25.md, section 8.4, from draft 16's list (its 8.2, items 14, 15 and 19 to 24).

**OI-233. Three of the first C session's questions, listed and not fixed.**
- Area: core.
- cMIP check: **can't tell** (the text does not say which three). How sure: inferred, the bullet in section 8.4 names no question and no rule.
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell.
- Source: draft-25.md, section 8.4, from draft 18's list (its 8.3, item 14).

**OI-234. Six things from Fable's review of draft 14 that were left untouched.**
- Area: core.
- cMIP check: **can't tell** (the text does not say which six). How sure: inferred, the bullet in section 8.4 names no question and no rule.
- Changes a verifier's answer: can't tell.
- Touches the way out: can't tell.
- Source: draft-25.md, section 8.4, from draft 15's list (items 16 to 21).
## What these sources cannot tell

- **What most of section 8.4's items ask in full.** Section 8.4 of draft 25 gives one line for each, and the question itself is in `history.md`, which was not among the sources. 58 items are known here from such lines alone. For them "what it asks" is the bullet's wording, the grammar rule is the one the bullet names, and whether an answer changes is mostly "can't tell". Reading `history.md` (its sections 9.3 to 9.13 and D.4 to Q.4) would fill these in, and would probably split some bullets into several items.
- **Whether an item is still open after encoding 2.** `encoding-2.md` itself was not among the sources, only its report. Draft 25's section 9 was written before the bytes: its items 1 (the act as bytes), 3 (a cMIP in a socket), 6 (the report as an act) and 15 (vectors) may be answered there in part. They are listed as draft 25 states them. Section 10 of draft 25 (nineteen places the encoding must fix) is not in the list, for the same reason, except where another item cites it.
- **Whether the four choices under "Where writing it needed a choice" are open.** The encoding report calls them the MOR lead's, as technical wording. They are listed (OI-043 to OI-045, and one in cluster 8) because the brief names that section; the report does not say whether anyone is still to confirm them.
- **Which three faulty acts the stranger could not judge.** The encoding report says the stranger reached the checker's answer and rule for ten of thirteen; it does not name the other three.
- **Which "three of the C session's questions" and which "six things from Fable's review"** section 8.4 means (the last two items of cluster 9).
- **What the areas mean.** Core, development and presentation are not defined in any source read; the reading used is said above the list.
- **Anything the players found.** No finding of the players' round is in these sources.
- **Anything about cloning an agreement across, and little about portable identity.** No item speaks of the first. The second appears only as what the Sign layer does with a lost or replaced key, and as an honest fork from a second device.
- **The sheet of the 13 in plain words.** On 17 November it was in `docs/` on none of the 249 branches of the repository (the file names of every branch's `docs/` were searched). The verifier report's own wording is used; for the ten B questions, which the second report gives only by title, the first report's one-line wording (`verifier-1-report.md`, same branch) was looked at to say what each asks, and nothing else was taken from it.
- **Whether a reading is right.** Nothing here says which reading of any rule is the better one.

`reasons-25.md` was not needed: no code in the list rests on it.

## Exploratory

Noticed while reading, outside the six lines. None of it is in the list or the counts.

- **The verifier report counts its new questions two ways.** Its plain words say "Two new questions come with it"; its section 3 has three (N1, N2, N3). Its heading says "Those that do not change an answer (10)" and then adds N3, which makes eleven. The list above has all 24.
- **Draft 25 still points at lists that have moved.** P17 sends a reader to "section 8.2" for a reading of Claude's that section 8.2 no longer holds (it is draft 24's list, as it stands); G11.6(b) sends a reader to "section 8.3" for the payer whose assent is not held, which is now only a line of section 8.4. Section 8.3, item 8 still says "Nothing was tested against draft 24", beside a verifier with 120 cases on draft 25.
- **Three proposals of the report block are named at once** in draft 25 (`report-block-2.md`, `-3` and `-4`), and encoding 2 gives a report bytes and a spec hash of its own while draft 25 says the report "has no fields" until the block is written into the shared language (section 9, item 6). Kišib signs such a report and says it is "not yet in any spec".
- **What becomes of an agreement when the text changes.** Draft 25 says acts written under its spec hash "stay this text's", and that a later draft is a new specification; the encoding report and the Kišib report say acts under encoding 1's hashes are now "not this encoding". No source lists, as an open item, how an agreement made under one spec hash goes on under the next. It is the nearest thing in these sources to cloning an agreement across, and it is not in the list because no source asks it.
- **Where the C items come from.** Almost every C item is a stated cost, or a row of section 5.2. The players' findings may be the first test of whether "you did not use the right cMIP" answers things that were found by use and not by reading.
- **The way out, by code.** Of the 46 items that touch it, 26 are G, 9 L, 7 C and 4 can't tell. The seven C items each rest on a cMIP people would have to choose, most of them an update condition (K4); the verifier report says only stub cMIPs stand in so far.
- **One reading is asked for in three places.** Who "signed the original" (OI-005), whether a version's own `in_force` asks for a party the update condition did not need (OI-013), and who is bound by an update that does not name them (OI-029) each sit under another number in the sources, and each decides whether an update made without someone counts.
- **The second verifier's independent check is no longer independent** for draft 25's changes: the report says its author made those edits, and that "a stranger's second reading of them is open". Five of its 120 cases cannot be judged by that check at all.
- **A place all but removes forks of Terms** (the first verifier report's note under A3, OI-002). If that reading holds, several fork items of cluster 2 apply only to agreements that name no place.

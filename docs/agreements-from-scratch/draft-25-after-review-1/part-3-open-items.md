# Draft 25 after review 1, part 3: the open items

17 November 2026. Written by Claude, the scribe's session R3, for the MOR lead. A map, and a record of work: it decides nothing, proposes no wording for draft 25, and changes no other file.

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "can I with a single click reward all the people that contributed to the service or good via MOR". On now: "Before redrafting any layer I want to really look at the findings in details, find the right questions and then find one last way for me to zoom out before deciding on the rewrite." And: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

**Why** (the MOR lead's wording): to show him, before he zooms out, what draft 25 would look like with today's decisions in it: what goes, what moves, what changes, and how much is left.

## In plain words

1. Of the 234 open items on draft 25, today's ten decisions close 5, change 68 and leave 155 as they were; the last 6 of the 234 close or only change depending on how a decision is read.
2. The five closed: draft 25 gives no way to leave Terms once they are in force (OI-033); whether an update waits on the new version's own `in_force` rule (OI-013); whether a person whose assent is unclear is counted when others update without her (OI-005, OI-014); and one ledger line that said more than his words (OI-226).
3. "Changes" means the question moves elsewhere or becomes a different one, sometimes half-answered. Most are moves: 46 go with decision 8 (the baker's rule into Envelopes, the report block into the MICS), 13 with decision 6 (the signer's line to the layer below), 7 with decision 9 (the place, out of the grammar), a few with decisions 1, 3 and 10; some items move with two decisions, so these add up to more than 68.
4. Of the 40 items the research window marked as changing a verifier's answer, 2 close, 11 change, 2 are among the 6 read two ways, and 25 stay. Decisions 5 and 7 touch no item.
5. One reading needs his eye before the baker's rows move: decision 8 was framed as Agreements asking whether the *current* holder of the baker's rights is a party, while his 13 November exchange "The holder at the time" settled on the holder at the act the Terms cite. This map does not choose.

**Key.** "He", "his words": Nobody, allegedly. "The ledger": `docs/decisions.md`. D1 to D10: today's decisions, numbered as in `docs/lead/assignments/2026-11-17-wave-2-common.md`. Terms, `in_force`, the report block, the place, a verifier: as draft 25 uses them. Envelopes and the MICS: other drafts of MOR, where decision 8 sends two sets of rules. "The research window": the session that wrote the open-items list.

## The sources

- His words: `docs/decisions.md` on branch `claude/lead-records-2`, the ten entries from "Three lines cut back" to "Only rules in the hashed text", each read whole with its "Arrived at (to check)" line (the MOR lead's reading). Where that line says more than his words, his words are quoted and the difference is listed below.
- The items: `docs/research/open-items-2026-11.md` on branch `claude/research-open-items-3t05ih`, OI-001 to OI-234, in nine clusters.
- Draft 25: `docs/agreements-from-scratch/draft-25.md` on branch `claude/agreements-clean-1-hahuwn`, only the rules an item cites (G4, G6, G7, G11.4, G14, section 7's "No default way out").

## The three words

- **closes**: a decision answers the item's question, in his words; the words are quoted.
- **changes**: no decision answers it, but one moves it (to Envelopes, the MICS, the layer below, a companion document, the relay or a cMIP) or turns it into a different question, sometimes by answering half of it. Each row says how.
- **stays**: no decision touches it. Where a row says "D8 names where this lives", decision 8 keeps the topic in Agreements without answering anything in it, so the decision column is "—".
- **two readings**: closed under one reading of a decision, only changed (or, for OI-010, untouched) under another. Both readings are given; neither is chosen.

## Decisions that can be read two ways

These are readings of the decisions themselves. None is chosen here.

1. **D8, "the current holder".** The lead framed the first part as "the baker into Envelopes, Agreements asking only whether the current holder is a party"; he: "Agreed for the first". Read as written, "current" is the reading his exchange "The holder at the time" (13 November) set aside ("read as 'current', a sale makes every earlier agreement stop counting"). Read as shorthand, it means the holder at the act the Terms cite, as that exchange arrived at. Bears on OI-139, OI-142, OI-143, OI-145, OI-146, OI-147.
2. **D4, how wide.** The option he agreed to was about Carla's case: "the update is not shown as replacing the old Terms until Carla's position is clear". The arrived-at line widens it: "every answer that depends on it is unchecked". Narrow: updates only. Wide: any answer that rests on an assent whose counting is unclear. Bears on OI-010 and OI-046. The two also use two answer words: "not shown" (the option) and "unchecked" (the title and the arrived-at line).
3. **D3, "always".** His words: "Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out". Read one way: the default always includes an exit, and Terms that say so may switch it off (the arrived-at line). Read another: a way out is always on offer, and Terms that keep someone in must carry their own. Bears on OI-027 and OI-219.
4. **D9, how little.** He: "It's just a pointer to a relay then. Why the need for more grammar?" then "Yes, agreed. My point was: this is simpler than what we are discussing.agreed". Read one way: he agreed to the lead's cut, the field and one sentence. Read another: "simpler than what we are discussing" asks for less still. Bears on OI-002, OI-035, OI-038.
5. **D6, "It does".** The lead's lean had four parts (keep both threads; the signer's line is the layer below's; the agreement's thread is Agreements'; a key change continues the line). "It does" does not say which it answers. Bears on OI-063 and OI-165.
6. **D5, "potentially".** He: "A move to MOR2 potentially does end it, unless it is updated to MOR2". The arrived-at line says it "ends". No item in the list turns on it.

## To check

Items this map marks closed where the decision's own words do not quite reach the whole item.

- **OI-005 and OI-014** (D4). His word: "Agreed", to option (b). The option says the update "is not shown as replacing the old Terms until Carla's position is clear"; the arrived-at line says "every answer that depends on it is unchecked". OI-014 asks whether the unreadable act "makes in force unchecked": which answer word, and whether "in force" (not only "replaces") is covered, his word does not say.
- **OI-013** (D2). His words: "A, agreed", to (a), "the update condition alone decides". The arrived-at line adds: "The new version's own `in_force` governs only its own later life". That second sentence is the lead's wording; what "its own later life" means for a version that names a party who did not sign is not in his words.
- **OI-033** (D3). His words: "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out". The lead's lean added "leaving never erasing what is owed, the record showing who left, and a contest still possible"; those are not in his words. Section 7's case of a party who is gone with no successor (draft 25: "it is stuck") is not a signer leaving, and his words do not speak of it.
- **OI-226** (D1). His word: "Agreed." The lead named one phrase of "The holder at the time": "an act that never counted". The item names three: "to dodge a later transfer", "the buyer holds the rights from then on", "so 'invalid' stays an act that never counted". The current arrived-at line holds none of the three, but D1 names only the third.

## Counts

Computed from the table, not added by hand.

**By result.** closes 5; changes 68; stays 155; two readings 6 (OI-002, OI-010, OI-035, OI-074, OI-130, OI-219). Total 234.

**By cluster.**

| # | Cluster (the research window's names) | Items | closes | changes | stays | two readings |
|---|---|---|---|---|---|---|
| 1 | Coming into force, updating, order and lateness | 39 | 4 | 6 | 26 | 3 |
| 2 | Forks, and resolving them | 26 | 0 | 5 | 21 | 0 |
| 3 | Acting for others | 25 | 0 | 0 | 24 | 1 |
| 4 | Legs, reports and money | 30 | 0 | 9 | 21 | 0 |
| 5 | Seeing beyond one leg, and the contest | 18 | 0 | 2 | 15 | 1 |
| 6 | The baker and the envelope | 23 | 0 | 22 | 1 | 0 |
| 7 | What the layers below and the shared language have not yet given | 31 | 0 | 18 | 13 | 0 |
| 8 | Bytes, vectors and tools | 17 | 0 | 1 | 16 | 0 |
| 9 | Limits the text states, the record, the words and the client | 25 | 1 | 5 | 18 | 1 |
| | **Total** | **234** | **5** | **68** | **155** | **6** |

**By decision.** An item with two decisions counts under each, so this table adds up to more than 79.

| Decision | closes | changes | two readings | items touched |
|---|---|---|---|---|
| 1. Three lines cut back | 1 | 5 | 0 | 6 |
| 2. The two gates | 1 | 0 | 0 | 1 |
| 3. A way out by default | 1 | 1 | 2 | 4 |
| 4. Unclear means unchecked | 2 | 0 | 1 | 3 |
| 5. Crossing to a new text | 0 | 0 | 0 | 0 |
| 6. Two threads, two owners | 0 | 13 | 0 | 13 |
| 7. One freeze | 0 | 0 | 0 | 0 |
| 8. Where three rules live | 0 | 46 | 1 | 47 |
| 9. The place is a pointer | 0 | 7 | 2 | 9 |
| 10. Only rules in the hashed text | 0 | 3 | 0 | 3 |

Decision 10 moves the open lists themselves into companion documents, so in a sense every item moves. It is counted only where the item is about text that is not a rule (OI-208, OI-233, OI-234).

**Kept apart: the 40 items marked as changing a verifier's answer.** The research window marked 40 (13 from the second verifier's report, 27 its own inference).

| Result | Count | Items |
|---|---|---|
| closes | 2 | OI-005 (A6), OI-014 (A9) |
| two readings | 2 | OI-002 (A3), OI-035 |
| changes | 11 | OI-015, OI-023, OI-040 (A10), OI-046, OI-139 (A2), OI-140 (A11), OI-147, OI-148, OI-151, OI-152, OI-165 |
| stays | 25 | OI-001 (A1), OI-003 (A4), OI-004 (A5), OI-008 (A12), OI-009, OI-011, OI-016, OI-017, OI-018, OI-021, OI-022, OI-026, OI-036, OI-050, OI-051, OI-066 (A8), OI-067, OI-068, OI-069, OI-070, OI-091 (N1), OI-092 (N2), OI-095, OI-118, OI-123 |

Of the verifier report's own 13: 2 close, 1 two readings, 3 change, 7 stay.

## The table

| item | its title, shortened | result | decision(s) | the quote or the one line of why |
|---|---|---|---|---|
| OI-001 | Which answer word a verifier gives for an update that came late | stays | — | About lateness, which no decision answers. |
| OI-002 | Under a named place, is the later of two updates always late, so that a fork of Terms stands only where both … | two readings | 9 | Closes: the agreed sentence "every reader takes what is latest from it and from nothing else" orders the two updates by the place. Changes: it says what is latest, not whether the later one is late or a fork; which anchoring counts stays open. |
| OI-003 | Which namings (knots) show an update late: one act's alone, or several added together | stays | — | No decision touches it. |
| OI-004 | Which act that is not held "might be what shows" an update late, so that the answer is unchecked | stays | — | About an act that might show lateness, not about an assent; D4 speaks of assents. |
| OI-005 | Is a signer whose assent may have been cancelled, the order not being shown, among "everyone who signed the … | closes | 4 | "Agreed" to (b), unclear means unchecked; the entry names verifier 2's A6, which is this item. |
| OI-006 | Whether "the original" is rightly read as the version an update would replace | stays | — | No decision touches it. |
| OI-007 | What replaces Terms that no one signed: the default then asks for no one's signature | stays | — | No decision touches it. |
| OI-008 | Which counter signature is "the first" where two follow an assent and neither follows the other | stays | — | No decision touches it. |
| OI-009 | Whether "until every party has signed" means "until the Terms are in force" where an `in_force` rule asks for … | stays | — | No decision touches it. |
| OI-010 | The race between a counter signature and the last assent, which nothing in the acts settles | two readings | 4 | Stays: read narrowly, D4 is about an update replacing old Terms, and this race is before Terms are in force. Changes: read as the arrived-at line ("every answer that depends on it is unchecked"), the verifier answers unchecked until the race is settled. |
| OI-011 | Whether the default for `in_force` (every party named as a signer) is the default wanted | stays | — | No decision touches it. |
| OI-012 | A resolving update of Terms names no party: is it in force at once, by G4.1's default read literally | stays | — | D2 is about updates the condition answers; a resolving update's footing is OI-022's. |
| OI-013 | A new version's own `in_force`: a version that names a party as a signer and carries no `in_force` waits for … | closes | 2 | "A, agreed": choice (a), the update condition alone decides whether an update replaces; the new version does not wait on its own `in_force` to replace. |
| OI-014 | An act held that cannot be read (a private act without its key, an unknown signature scheme) and may be an … | closes | 4 | "Agreed" to (b); the entry names verifier 2's A9 (an assent private and held unread), which is this item. |
| OI-015 | How a `previous` that names no act is read (the text and the second C session's tests differ) | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. How `previous` is read becomes that layer's question. |
| OI-016 | At which position, or by which citing, replacing Terms "came into force" | stays | — | No decision touches it. |
| OI-017 | A replacement that lacks a signature is answered "not shown"; the word of Nobody, allegedly, for that case was … | stays | — | No decision touches it. |
| OI-018 | Whether "not valid" (a cMIP's answer about an update) and "invalid" (this text's answer about an act) should be … | stays | — | No decision touches it. |
| OI-019 | "Locked": the text has no such value, and a verifier may not say an agreement can never be updated | stays | — | D3 gives a way out by leaving, not by updating; a verifier still may not answer "locked". |
| OI-020 | Whether a version may name several update conditions (one for each part), and whether the condition sits on the … | stays | — | No decision touches it. |
| OI-021 | Which update condition is asked about a filling's rights where several versions lie between | stays | — | No decision touches it. |
| OI-022 | That the update condition is asked of a resolving update is Claude's reading | stays | — | No decision touches it. |
| OI-023 | Where two versions of one agreement name different clocks, which one the update condition reads | changes | 9 | D9: "It's just a pointer to a relay then. Why the need for more grammar?" The rest of G7 leaves the grammar. The clock goes with it, so which clock a condition reads becomes the relay's or the condition's cMIP's. |
| OI-024 | What the update condition's cMIP may read | stays | — | No decision touches it. |
| OI-025 | Changing the update condition itself | stays | — | No decision touches it. |
| OI-026 | "It should be able to run": whether rights can stop, or apply again, with no update at all | stays | — | No decision touches it. |
| OI-027 | An update's validity is only as sure as the cMIP that answers it: two readers with different anchorings can … | changes | 3 | D3: "Only an agreement can keep you into something, and agreements have their own way out." A lock on updates no longer holds a signer in by default; whether a lock can, becomes whether its Terms switch the default exit off. |
| OI-028 | A party is bound by an update it did not sign, where the update condition lets fewer than all update | stays | — | A stated cost of the update condition; D2 confirms the condition decides, and does not reach the cost. |
| OI-029 | Who is bound by an update that does not name them | stays | — | No decision touches it. |
| OI-030 | A late act in one signer's own line (lateness is written for Terms only) | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. A late act in a signer's own line becomes that layer's question. |
| OI-031 | Knots and an anchoring that disagree about whether an update came late | stays | — | No decision touches it. |
| OI-032 | A rival update signed late that nothing shows to be late takes the agreement back to an old version (a fork) | stays | — | No decision touches it. |
| OI-033 | No way to leave Terms once they are in force, and no default for a party's own part or its leaving, unless the … | closes | 3 | "Agreed. Only an agreement can keep you into something, and agreements have their own way out. But default should always offer a way out" |
| OI-034 | Whether Terms may name several places, with a rule over their answers | changes | 9 | D9: "It's just a pointer to a relay then. Why the need for more grammar?" The rest of G7 leaves the grammar. Several places with a rule over them becomes a relay's or a cMIP's question. |
| OI-035 | Whether a verifier answers from the set of acts it is given, or must also ask the place for more | two readings | 9 | Closes: where a place is named, a reader "takes what is latest from it", so it asks the place. Changes: P5 asks it for every answer and for Terms that name no place; the sentence covers only what is latest under a named place. |
| OI-036 | How far a verifier must follow (powers through powers, receivers, long chains) before it may stop and answer … | stays | — | No decision touches it. |
| OI-037 | Without an anchoring, order is partial: the bytes cannot tell late from simultaneous | stays | — | No decision touches it. |
| OI-038 | A genuine act that never reached the named place does not count | changes | 9 | D9 keeps one sentence: "every reader takes what is latest from it and from nothing else". The cost now rests on that sentence alone. |
| OI-039 | A payer who names the version they read has paid as it says, even if the agreement had changed | stays | — | No decision touches it. |
| OI-040 | Two rival versions by one author fork Terms and also that author's own line: can one act resolve both, or must … | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. The fork of the author's line is resolved there; the question becomes how a resolve in Agreements meets it. |
| OI-041 | Another signer, under a power, cannot write a Terms act that resolves a fork of one signer's line of Terms acts … | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. Who may resolve a fork of one signer's line becomes that layer's question. |
| OI-042 | Which Terms act a resolve's `terms` names, where the forked line spans several versions | stays | — | No decision touches it. |
| OI-043 | A choice made in writing the bytes: a resolving update of Terms may name what it relied on | stays | — | No decision touches it. |
| OI-044 | A choice made in writing the bytes: a resolve may carry `for` and `under`, `answers`, `relies_on` and … | stays | — | No decision touches it. |
| OI-045 | A choice made in writing the bytes: a Statement with `resolves` and no `continues` can no longer be written | stays | — | No decision touches it. |
| OI-046 | A fork in one signer's own line: is the signer of an assent that is a tip, or follows one, bound meanwhile | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. Whether a signer forking their own line is bound meanwhile now turns on what that layer shows. (Under the wide reading of D4 it might be unchecked.) |
| OI-047 | An assent to a tip that also names the tip in `relies_on`: built on it, so not counted | stays | — | No decision touches it. |
| OI-048 | A contest against a tip of a fork that stands | stays | — | No decision touches it. |
| OI-049 | The qualifier of an answer that rests on the version an act names | stays | — | No decision touches it. |
| OI-050 | "Built on a tip" reaches as far as the naming goes (the text and the second C session's tests differ) | stays | — | No decision touches it. |
| OI-051 | A payment that names a tip, or a version along a branch set aside | stays | — | No decision touches it. |
| OI-052 | A filling earned in a branch set aside | stays | — | No decision touches it. |
| OI-053 | An agent's act that is a tip of a fork | stays | — | No decision touches it. |
| OI-054 | A resolving update that came late | stays | — | No decision touches it. |
| OI-055 | Merging two branches is not kept: a resolving update only says which tip continues | stays | — | No decision touches it. |
| OI-056 | Two resolving updates that continue the same tip | stays | — | No decision touches it. |
| OI-057 | What those who signed a branch had built on it, once its tip is set aside | stays | — | No decision touches it. |
| OI-058 | A fork with more than two tips | stays | — | No decision touches it. |
| OI-059 | How a resolving update signed under a power sits in another signer's line | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. Where a resolve made under a power sits in a line is that layer's to say. |
| OI-060 | Since when a continued tip counts | stays | — | No decision touches it. |
| OI-061 | Which act the next version names after a resolving update | stays | — | No decision touches it. |
| OI-062 | A power to resolve beside the update condition, and which Terms say how a resolving update is signed | stays | — | No decision touches it. |
| OI-063 | An honest fork (a lost device, a restored backup) looks exactly like a lie | changes | 6 | D6: the signer's line belongs to the layer below (acts and keys); Agreements only reads it. "A key change continues the signer's line and never starts a fresh one" (the lead's lean; he: "It does"); an honest fork is now the layer below's cost. |
| OI-064 | A fork of Terms holds the agreement where it was; where fewer than all can update, a fork is a veto | stays | — | A fork still holds the agreement; D3 does not speak of forks. |
| OI-065 | Resolving does not undo what a stranger did relying on the tip set aside | stays | — | No decision touches it. |
| OI-066 | An agreement whose Terms give a power of the kind, and that power's rule says no: has it signed, where every one … | stays | — | No decision touches it. |
| OI-067 | How an agreement signs where its Terms give no power (one act by each signer), and that an act made for it under … | stays | — | No decision touches it. |
| OI-068 | Whether the default of G4.1 should count a party named as an agreement: nothing tells a party that must sign … | stays | — | No decision touches it. |
| OI-069 | Whether someone who fills a role of an agreement is one of its signers when it signs as a party; and how its … | stays | — | No decision touches it. |
| OI-070 | Which acts of an agreement's several signers are one signing; how such a party takes its signature back; and … | stays | — | No decision touches it. |
| OI-071 | An agreement's signature ("a collective signature of sorts") rests on a question of Nobody, allegedly, and on "I … | stays | — | No decision touches it. |
| OI-072 | Whether one decision or judgment that binds many who are not the parties of one agreement is one act, or one per … | stays | — | No decision touches it. |
| OI-073 | When a version "removes or narrows" a power: the `powers` entries less one or more; a changed rule is not read … | stays | — | No decision touches it. |
| OI-074 | The delegator's default (ending a delegation alone, at any time) rests on a leaning: "I lean a." | two readings | 3 | Closes: "default should always offer a way out" covers a delegator, who signed the delegation. Changes: D3 is about a signer leaving Terms; ending a delegation for both sides still rests on "I lean a." |
| OI-075 | Whether "no limit" on signed conditions holds beyond ending a delegation | stays | — | No decision touches it. |
| OI-076 | A delegation's signed conditions on ending it, beside its `condition`: where an update condition is named, the … | stays | — | No decision touches it. |
| OI-077 | That Terms are a delegation is read from their words (the body's cMIP); no field says so | stays | — | No decision touches it. |
| OI-078 | An agent has what was signed and no more: no notice, no pay; and a delegator can sign away ending the delegation | stays | — | No decision touches it. |
| OI-079 | What an agent signed stays signed: the one it acted for cannot set it aside | stays | — | No decision touches it. |
| OI-080 | Where the judicial is said, and what is set in the Terms: the contest, a judge, a power to resolve | stays | — | No decision touches it. |
| OI-081 | A judge named in the Terms is as hard to change as the Terms: if the judge is gone and everyone must sign, the … | stays | — | A judge who is gone is not a signer leaving; D3 does not reach it. |
| OI-082 | The modules (a judge, a tally, identity, assurance, delivery, standing): none is a socket; for the judge, also … | stays | — | No decision touches it. |
| OI-083 | An entry of `powers` of kind `replaces` gives no power and is left unread | stays | — | No decision touches it. |
| OI-084 | The sockets read off the fields; what a module is; no socket for a dividing rule; the field `control` and its name | stays | — | No decision touches it. |
| OI-085 | Whether a filled spot can pass to another, and whether a later claimant can displace an earlier one | stays | — | No decision touches it. |
| OI-086 | How an offer stops taking new people, or takes them again; and whether a role's cMIP takes parameters | stays | — | No decision touches it. |
| OI-087 | Who must sign a renewed offer | stays | — | No decision touches it. |
| OI-088 | Each kind of spot has its own fraud, and nothing makes the confirmer honest | stays | — | No decision touches it. |
| OI-089 | Whether a future spot was used only for participants no one could anticipate cannot be checked | stays | — | No decision touches it. |
| OI-090 | Counted attention rests on whoever counts; the grammar no longer requires an agreed witness | stays | — | No decision touches it. |
| OI-091 | A report whose call names the payment itself, and not its settlement: listed, or a confirmation | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-092 | Who the doer is where the receiver is an agreement that is also one of the Terms' parties | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-093 | Who the doer and the receiving side are for the Control task | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-094 | A call attached to a task other than the Control task: left unread, whether or not the Terms hold that task | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-095 | Whether a work whose owner receives for the others, or a work with no service, holds the Control task with its … | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-096 | By which act a doer's own part is named, since nothing moves when a holder keeps their share; and what a doer's … | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. What a doer's report carries becomes the MICS block's; by which act a doer's part is named stays a question for both. |
| OI-097 | Whether money shown as still owed is later shown as paid, and by what | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. "Still owed", and what closes it, are among the reading rules that move. |
| OI-098 | Pools: who holds one and on whose word, when it is divided and by which rule, how a claim is counted when false … | stays | — | No decision touches it. |
| OI-099 | Pools: how one line of a leg report names several settlements, or one settlement covers many counts; and what … | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. The bytes of a report line move with the block. |
| OI-100 | "How much of my click reached the band": with one report for a batch, that is arithmetic the reader does, which … | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. The arithmetic across legs moves with reading across legs (G11.4). |
| OI-101 | Which lines of a doer's report each receiving side receives (all of them, or those of its own leg) | stays | — | No decision touches it. |
| OI-102 | What "match" means for the Control task, and whether two honest reports can state different amounts for one … | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. "Matched, mismatched ... both amounts shown" move to the MICS. |
| OI-103 | The tie by an act both name, the amounts, and kept-or-owed are the MOR lead's proposals, still to check | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. The tie, the amounts and kept-or-owed move with the block; still the lead's proposals to check. |
| OI-104 | That a leg report must be readable without the leg's cMIP | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Whether a report reads without the leg's cMIP becomes the block's rule. |
| OI-105 | Whether reports that do not agree are a fork | changes | 6, 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Whether disagreeing reports are a fork is the block's; lines are the layer below's (D6). |
| OI-106 | Whether a report is a Statement of this text and stands in its signer's line | changes | 6, 8 | Whether a report stands in a signer's line becomes a question between the MICS block (D8) and the layer below that owns the line (D6). |
| OI-107 | "The report about the payment only comes from the receiver", read as: of the work's people | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-108 | May, or must: no Terms need carry a call and no one need answer one, so a sequence is readable only as far as … | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-109 | The buyer's leg: whose leg it is, may or must, and who confirms | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-110 | A payer whose assent to the version their payment names is not held | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-111 | How a buyer's assent stands beside the payment: two acts, or one act that is both | stays | — | No decision touches it. |
| OI-112 | Whether "a payment is divided by the version it was made under" should itself stand in the grammar, for every … | stays | — | No decision touches it. |
| OI-113 | Which deal is meant where a service pays people who signed nothing with it | stays | — | No decision touches it. |
| OI-114 | A deal is as complete as its words: who bears a fee, and what becomes of a late payment, are whatever the deal … | stays | — | No decision touches it. |
| OI-115 | Nothing makes a service, or an owner who receives for the others, divide as the shares say, or pay at all | stays | — | No decision touches it. |
| OI-116 | The record holds no value: the gap between what the record says and what is there must be checked continuously | stays | — | No decision touches it. |
| OI-117 | A buyer who paid an author who then vanished: the contest stays on the record, and the record cannot give the … | stays | — | No decision touches it. |
| OI-118 | A receiver that points onward through agreements inside one leg: no limit on how many, and "not shown" where an … | stays | — | No decision touches it. |
| OI-119 | A work whose version names no receiver cannot be paid | stays | — | No decision touches it. |
| OI-120 | A work that names a service's public offer, and not its own deal, as its receiver is not stopped by the grammar | stays | — | No decision touches it. |
| OI-121 | Who is a side of a leg where there is no report (silence); what "one leg" covers; and what lies beyond a silent leg | changes | 8 | D8 moves reading across legs (G11.4) to the report block in the MICS; silence and "what one leg covers" go with it. |
| OI-122 | Which Terms' data cMIPs are asked about a buyer's confirmation | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-123 | The data task's one question; a report that carries the data of people bound by different Terms (every data cMIP … | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-124 | What a data cMIP focused on agreements is, beyond its socket; and whether such a cMIP belongs to Agreements alone | stays | — | No decision touches it. |
| OI-125 | Whose signature a path for data needs, an outvoted member included ("at inception", what the cMIP decides, how … | stays | — | No decision touches it. |
| OI-126 | Someone receives under a call in Terms they did not sign, themselves or through an agreement's signature: the … | stays | — | No decision touches it. |
| OI-127 | "Has to inform": a member paid by a service who tells her own agreement that she was paid has no grammar rule | stays | — | No decision touches it. |
| OI-128 | "Only", after "by default": whether "Leg by leg only." means that no further path should exist at all | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-129 | Whether a call that a leg's people signed could name a reader | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-130 | Whether reading across legs should leave the grammar altogether, for data cMIPs | two readings | 8 | Closes: reading across legs leaves the Agreements grammar ("Agreed"). Changes: it goes to the report block in the MICS, not to data cMIPs as the item asks; the question becomes the MICS block's. |
| OI-131 | "The grammar to support it should be there, in agreements only", and requests from further upstream | changes | 8 | D8 puts the reading rules in the MICS; the earlier words "The grammar to support it should be there, in agreements only" now stand beside that move. |
| OI-132 | What "so many processes" covers, and data that is not a report: Terms and their calls, what a payer learns of a … | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-133 | Whether seeing one's own leg is enough for the wish: by default the buyer is not shown whether the money reached … | stays | — | No decision touches it. |
| OI-134 | "Vow", and what "bytes attached" means | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-135 | "Offer", read as Terms that name a party by role: Claude's reading; a contest is read against any version alike | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-136 | Who may make a contest besides a buyer and a baker, and when | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-137 | What a contest is and does; who is contested "at first"; the signers' own contest of their service, and whether … | stays | — | D8 names where this lives (it stays in Agreements) but answers nothing in it. |
| OI-138 | A contest reaches one agreement: if the fault is a service's, the buyer depends on the signers to contest it in … | stays | — | No decision touches it. |
| OI-139 | Which answer word a verifier gives for Terms that are late against a transfer of the baker's rights | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The answer word for late Terms becomes Envelopes'. |
| OI-140 | "Nothing they name is lacking", for a thief's Terms: which lacking act makes the answer unchecked and not invalid | changes | 1, 8 | D1 puts back on the open list "whether a thief's Terms are an act that never counted"; D8 moves the baker's rule into Envelopes, so the answer word becomes Envelopes' to give. |
| OI-141 | A double sale: who holds the baker's rights at an act that lies in a fork of the envelope's chain; "not shown" … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. A double sale is read in Envelopes. |
| OI-142 | Late Terms per place: read from the Terms act's own position against the transfer's, or from the position at … | changes | 8, 9 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. "Per place" also becomes a pointer to a relay (D9). |
| OI-143 | Which knots, and which anchoring, show Terms late against a transfer: Claude's reading, carried over from late … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. Which knots show Terms late against a transfer is Envelopes'. |
| OI-144 | Whether the envelope's own layer may give an anchoring that shows Terms late | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. Already the envelope's layer; the rule that would use the anchoring now lives there too. |
| OI-145 | A seller who has sold the baker's rights can still make Terms citing a point before the sale, which count where … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The stated cost moves with the rule. See the two ways "current holder" can be read. |
| OI-146 | The field `envelope_at`: a field of its own is Claude's choice, and its name is the MOR lead's to change | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. Whether the field is needed turns on the two ways "current holder" can be read. |
| OI-147 | The holder at an act: the baker at the bake, otherwise the one the last transfer at or before that act names … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The holder at an act is read in Envelopes; "current holder" in the lead's framing can be read two ways. |
| OI-148 | A new version after a sale: the old version stays in force, and a later update of it needs the buyer of the rights | changes | 1, 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. And "bound by them" is open again (D1). |
| OI-149 | A fork resolved in the envelope's chain: what that does to Terms that cite the branch set aside | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party.  |
| OI-150 | Terms where the holder's place is not yet shown count for nothing until it is shown: the MOR lead's settlement | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The lead's settlement ("count for nothing until shown") moves with the rule. |
| OI-151 | "Bound by them", for the holder of the baker's rights: bound in any way G5.1 allows, the party still named, the … | changes | 1, 8 | D1 puts back on the open list "whether a holder of the baker's rights must be bound by the Terms, beyond being a party"; D8 moves the rule into Envelopes. |
| OI-152 | A baker, or holder, who fills a role of the Terms | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party.  |
| OI-153 | Whether a transfer of the baker's rights, or the sale it carries out, calls for reports | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. Whether a transfer calls for reports is between Envelopes and the MICS block. |
| OI-154 | One envelope with several bakers; a transfer that names several holders; whether a holder may be an agreement | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party.  |
| OI-155 | Terms that sell a baked work's bytes without naming its envelope: the same thing sold in two agreements that … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The limit "G14 reads only Terms that name one" moves with G14. |
| OI-156 | How Terms of a sale stand beside the transfer that carries it out | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party.  |
| OI-157 | Which baker may contest: a baker's contest against Terms that name her own envelope without her, or against a … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The contest stays in Agreements (D8), so the question now spans both texts. |
| OI-158 | The baker is as the envelope says: an edited work baked again is another envelope, and whether it owes anything … | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. The stated cost (G14.4) moves with the rule. |
| OI-159 | A copy is made legible, not forbidden: which bake is the original is never a verifier's answer | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. G14.5 moves with the rule. |
| OI-160 | A succession that is held and passes nothing | stays | — | "Succession" is no longer a term; D8 moves the baker, not this word. |
| OI-161 | "Chain" said of the envelope, and who must be named | changes | 8 | D8: "Agreed for the first": the baker's rule moves into Envelopes; Agreements asks only whether the holder is a party. "Chain" becomes Envelopes' word. |
| OI-162 | The core's act format: fingerprints, a per-signer line of acts (which would make G6 redundant), an act signed by … | changes | 6 | D6 answers in which layer the per-signer line lives (the layer below), the question the item asks of the core; fingerprints, multi-signer acts and field names stay open there. |
| OI-163 | A place, from the layer that orders acts: five needs, none met by a current lower text | changes | 9 | D9: "It's just a pointer to a relay then. Why the need for more grammar?" The rest of G7 leaves the grammar. The five needs shrink to a relay that answers what is latest. |
| OI-164 | Without a place: no scarcity and no freshness; and two parties who accept different places cannot settle who … | stays | — | No decision touches it. |
| OI-165 | What the Sign layer does when a key is replaced or lost, and what a change of key does to a signer's line | changes | 6 | D6: what a key change does to the line is asked of the layer below: it "continues the signer's line and never starts a fresh one" (the lead's lean; he: "It does"). What the Sign layer does with a lost key stays its own. |
| OI-166 | How cMIPs are identified in practice, so that "named by fingerprint" can be met | stays | — | No decision touches it. |
| OI-167 | What a clock is, which layer gives it, how it is identified, and whether the place may also be the clock | changes | 9 | D9: "It's just a pointer to a relay then. Why the need for more grammar?" The rest of G7 leaves the grammar. The clock leaves the grammar; what a clock is is no longer asked by Agreements. |
| OI-168 | The report block is the MOR lead's proposal, written into no spec; G11 and the Control task's row follow it if … | changes | 8 | D8 gives the report block a home: the MICS (his "Agreed"). It is still written into no spec. |
| OI-169 | The block: how a call is written, where it sits in the act that holds the task, whether it is per task or per … | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-170 | The block: how "where that side receives" is found without a server address; a report's one leg is not in its bytes | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-171 | The block: how a report is written as an act, and which text holds that one definition | changes | 8 | D8 answers the second half, which text holds the definition: the MICS (his "Agreed"). How a report is written as an act stays open there. |
| OI-172 | The block: whether one report can answer several calls, or cover many payments | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-173 | The block: whether "unanswered" ever ends | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-174 | The block: its words, which are the MOR lead's, but for "leg" | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-175 | Seam with the block: a confirmation with no call written (a call made by default, named by the settlement) | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-176 | Seam with the block: "two sides who both signed", where this text's two sides need not have signed anything … | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-177 | Seam with the block: halves compared where the call expects one side only | changes | 8 | D8: the report block's home is the MICS, and the rules for reading reports go with it. Already waiting on the block (L); it now has a home to be written in, the MICS. |
| OI-178 | That no other layer of MOR carries a report further than its leg, lets a call name a place or a reader, or gives … | changes | 8 | D8 makes the MICS the home of the report block; whether any layer carries a report beyond its leg becomes partly the MICS's to say. |
| OI-179 | "The same payment" where Money records one payment as two acts; and Money's counting of one of two differing … | stays | — | No decision touches it. |
| OI-180 | What a settlement and a payment are as acts: how a payment names the version it read, where the payer's call … | stays | — | No decision touches it. |
| OI-181 | How an amount is written, so that every reader reads it alike | stays | — | No decision touches it. |
| OI-182 | What a receiving side's "automatic" report is: who signs it, and whether a settlement can itself be the … | stays | — | No decision touches it. |
| OI-183 | A payment that is pending: no answer word exists for it here | stays | — | No decision touches it. |
| OI-184 | Whether the verifier's answer words are already named in another layer, where "invalid" stops there, and the … | stays | — | No decision touches it. |
| OI-185 | The envelope's chain, from the layer below: the bake names the baker, a transfer act, who may sign it, the … | changes | 8 | D8 moves the baker's rule into Envelopes; what Agreements needs from the envelope's chain shrinks to whether the holder is a party. |
| OI-186 | How a verifier tells that two envelopes carry the same work | changes | 8 | D8: G14.5 (the same work baked again) moves into Envelopes with the baker's rule. |
| OI-187 | What access to what was bought is, who gives it, and what shows that it was given or was not | stays | — | No decision touches it. |
| OI-188 | Whether the core already has a contest act ("It is just extended") | stays | — | The contest stays in Agreements (D8); whether the core has a contest act is untouched. |
| OI-189 | What a client is, where the duties of clients (and of cMIPs) are kept, and how a client is tested against them | stays | — | No decision touches it. |
| OI-190 | Who is reading: a verifier must be told on whose behalf it reads and which anchoring that reader accepts | stays | — | No decision touches it. |
| OI-191 | The lower layers' texts still speak of the earlier Agreements (publications, split services, collectives with … | stays | — | No decision touches it. |
| OI-192 | The research's own open question: how much a proven liar must stand to lose, and where it is kept, for an … | changes | 6 | The research names G6 as what depends on the answer; with D6, G6's line moves to the layer below, so the question moves with it. |
| OI-193 | What each socket hands its cMIP and gets back, as data; and the stub cMIPs every builder shares | stays | — | No decision touches it. |
| OI-194 | The "parts for machines" a body's cMIP gives back: the part each party is given; that Terms are a delegation … | stays | — | No decision touches it. |
| OI-195 | How a role is named by `authors` and `receiver` | stays | — | No decision touches it. |
| OI-196 | A choice made in writing the bytes: the receiver's first items are 0 and 2; a position beyond the list is read … | stays | — | No decision touches it. |
| OI-197 | `parties` keeps the writer's order, so the same parties in another order are a different act | stays | — | No decision touches it. |
| OI-198 | `relies_on` may repeat what another field names, so one meaning has more than one byte form | stays | — | No decision touches it. |
| OI-199 | A report that names Terms may leave out the task | stays | — | No decision touches it. |
| OI-200 | Where an act has two faults that are both rejections, which one is named is not fixed | stays | — | No decision touches it. |
| OI-201 | The check before signing relies on the present reading that a signature is verified with the key the act carries | stays | — | No decision touches it. |
| OI-202 | The grammar's answers shown before signing are about the draft, not the act then signed: the two have different ids | stays | — | No decision touches it. |
| OI-203 | An act for a collective is not read where the suite's runner reads it: the runner reads `objects`, which … | stays | — | No decision touches it. |
| OI-204 | A reader in the binding: a payload back to the builder's own input form, so that every client shows the same fields | stays | — | No decision touches it. |
| OI-205 | Structured refusals from the builders | stays | — | No decision touches it. |
| OI-206 | Each change to the binding needs the client's release built again | stays | — | No decision touches it. |
| OI-207 | Vectors whose expected answers are written from the text before any code runs, by another reader than the one … | stays | — | No decision touches it. |
| OI-208 | A contradiction between sources, not resolved here: draft 25 says of vectors "None exist."; the encoding report … | changes | 10 | D10: section 9 is no rule, so "None exist." leaves the hashed text for a companion document; the contradiction is then between companion documents. |
| OI-209 | A contradiction inside one source, not resolved here: the bytes were cleaned "so that two honest writers cannot … | stays | — | No decision touches it. |
| OI-210 | Minds: whether a party was able, or free, cannot be shown by any act | stays | — | No decision touches it. |
| OI-211 | Conceal: nothing can show that private words were not told to someone | stays | — | No decision touches it. |
| OI-212 | Enforce beyond what was posted: against value not under Control, force lies outside the protocol | stays | — | No decision touches it. |
| OI-213 | Deeds lean on witnesses, whose statements prove only that the witness said them | stays | — | No decision touches it. |
| OI-214 | Reputation is as wide as the acts one holds: two people holding different acts compute different standing | stays | — | No decision touches it. |
| OI-215 | Secret votes need a teller | stays | — | No decision touches it. |
| OI-216 | Identity ends in acquaintance | stays | — | No decision touches it. |
| OI-217 | Those who cannot sign (the long dead, the unknowing) can be named in words but are no party, and nothing can … | stays | — | No decision touches it. |
| OI-218 | Ordering and lines show the shape of an agreement (who acted, how often, in what order) even when the words are … | changes | 6, 9 | The two things that show the pattern move: the signer's line to the layer below (D6), the rest of G7 out of the grammar (D9). |
| OI-219 | A contradiction between sources, not resolved here: the client rule of 11 November names "what the person can … | two readings | 3 | Closes: the text will hold a default way out, so the client duty has a guarantee to point at. Changes: the client rule says "what the person can always do", while D3 lets Terms that say so keep someone in ("Only an agreement can keep you into something"). |
| OI-220 | Before which acts the client's duty to show Terms is owed: a Terms act, an assent, a resolve, a kind a cMIP defines | stays | — | No decision touches it. |
| OI-221 | The words of Terms are only a fingerprint in the bytes: should a client refuse to sign where it was not handed … | stays | — | No decision touches it. |
| OI-222 | An assent whose Terms the client was not handed can still be signed: the one case where the client does not meet … | stays | — | No decision touches it. |
| OI-223 | Words chosen by Claude: "resolving update", "set aside", "built on", `resolves`, "succession", "receiver for an … | stays | — | No decision touches it. |
| OI-224 | "Should not", written MUST NOT | stays | — | No decision touches it. |
| OI-225 | G11 is a newer grammar rule under an older number | stays | — | No decision touches it. |
| OI-226 | Where the ledger's arrived-at line says more than the exchange "The holder at the time": "to dodge a later … | closes | 1 | "Agreed." to cutting "an act that never counted" from the line of "The holder at the time" (see To check: the other two phrases). |
| OI-227 | Where the ledger's line said more than the exchange "The envelope states its owner": "ownership", "naming the … | changes | 1 | D1 cut back the same entry, but other words ("bound by them", "not by agreements"); the three words this item names are not among them, and "whether agreements play any part in stating ownership" is open again. |
| OI-228 | Where the ledger's line said more than the exchange on the baker's rights after a sale | changes | 1 | D1 did not cut this entry's line; it reopened what draft 25 built on it: whether a holder must be "bound by them" beyond being a party. |
| OI-229 | Where the ledger's lines say more than the four exchanges of draft 21 (a late rival, setting aside what an agent … | stays | — | D1 cut lines of two draft 22 and 23 exchanges ("The envelope states its owner", "The holder at the time"); this item is about draft 21's. |
| OI-230 | Where the ledger's lines say more than "An agent and the judicial", "The encoding first" and "After box 2" | stays | — | D1 cut lines of "The envelope states its owner" and "The holder at the time" only; these exchanges are untouched. |
| OI-231 | Where the ledger's lines say more than the exchanges on sockets, bakes and the default | stays | — | D1 cut lines of "The envelope states its owner" and "The holder at the time" only; these exchanges are untouched. |
| OI-232 | Where the ledger's lines say more than the exchanges on the contest and on forks | stays | — | D1 cut lines of "The envelope states its owner" and "The holder at the time" only; these exchanges are untouched. |
| OI-233 | Three of the first C session's questions, listed and not fixed | changes | 10 | D10: the open lists go to companion documents ("Everything else goes into companion documents"); this pointer into history moves there. |
| OI-234 | Six things from Fable's review of draft 14 that were left untouched | changes | 10 | D10: as for OI-233; this pointer into history moves to a companion document. |

## The cold read

Before pushing, "In plain words" and five rows chosen at random (OI-006, OI-095, OI-171, OI-215, OI-231) went to a subagent that had seen neither the ledger nor the brief. Where it stumbled, and what was done:

- Point 3's numbers did not add up to 68: fixed (the overlap and the smaller decisions are now said).
- "6 more" read as extra to the 234, and point 4's "2 read two ways" as unrelated: fixed.
- "changes" read sometimes as a move, sometimes as a half-answer: the word is now defined in point 3 and under "The three words".
- "he", "his", "the research", "13 November": fixed by the key and by naming the exchange.
- "before anything moves": narrowed to the baker's rows.
- OI-095 cites D8 with "—" in the decision column; OI-171's "Agreed" had no owner; OI-231's "other exchanges" had no referent; titles were cut too short: fixed in the wording of those rows and the title length.
- **Not fixed:** the protocol's own words (Terms, `in_force`, Envelopes, the MICS, the report block, the signer's line, the layer below, a verifier, "the original" in OI-006's title) are defined only by pointing at draft 25 and the other drafts; defining them here would mean writing new wording for draft 25. Titles of items are the research window's, shortened, and some still quote words without their source.

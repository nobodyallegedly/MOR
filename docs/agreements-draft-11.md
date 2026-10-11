# Agreements draft 11: the report

*11 October 2026. Roadmap: the Agreements redraft, draft 11 (F251), one step, texts only. Branch `claude/agreements-draft-11-spec-d4cj0o`, two commits. For Nobody, allegedly, to review and re-approve.*

## In plain words

Draft 10 of Agreements had become very hard to read: 512 KB of rules, each grown long through ten drafts, with its history written into the rules themselves. Draft 11 says the same rules again so they can be followed.

**The first commit changes no rule.** It reorders the text so that how agreements run most of the time comes first: signing, works, selling, splits, judges, keepers, changing a deal. Collectives come second. The rare cases (forks, endings, a broken collective, how "before" and "after" are read) come third. Then the act formats, for reference, and the tasks, reasoning and freeze scenarios. Long rules are cut into short paragraphs and lists, and each opens with a plain sentence. The story of how each rule came about stays in draft 10 and the findings log, not in the rules. Every rule has a new number in reading order with its old number beside it ("Rule 14 (was 15b)"), and a table maps old to new. "Vow" replaces "announcement" everywhere; the act's number (Envelopes type 5) and its bytes do not change. The text is now 390 KB.

How we know no rule moved: no code changed, so the code's 826 tests check the same rules as before, and they pass. Each part of the text was also rewritten against a checklist of its rules, then read a second time, independently, against draft 10, looking only for a rule that moved. That second reading found 20 places where the wording could be read differently, none of them an intended change. All 20 are fixed. The list below names each rule and what the second reading found.

**The second commit writes in the decisions since draft 10** (F252 to F260), each marked "new in draft 11" where it stands, and "to build" where the code does not do it yet. A vow now covers anything MOR cannot hash, and every sale of a good or service names one. A vow may bundle promises, and a contest names the one sale that failed. Any agreement may be a party to another. The vault's limit protects refunds. Responsibility ends at the designated pointer. A compilation is a layer or a derivative depending on consent. Reselling under a fresh vow is a stated cost. Two vows on one event stay separate. Every payer tries the backup services in order.

**Writing them in exposed contradictions, put below as questions** (Q1 to Q6). Two matter most. The anchoring service is a service, yet it is sold without a vow (Q1). The decided "stakes liquidated at closing" meets a closing that requires the collective to hold nothing, and a deal has no closing at all (Q4, Q5). None is worked around: each is marked "Open" in the draft where it stands.

## What changed, file by file

- `spec/MIP-agreements-draft-11.md`: new.
- `spec/02-MOR-core-v21.md`: two sentences that quote a changed sentence. The vow's contest now names the sale (F253). The refund rail is now bounded by the vault limit (F255).
- `spec/03-MOR-freeze-test-suite-v21.md`: the same two sentences: line "Announcements" (component list) and scenario step "The debt rule" (QG2).
- `spec/README.md`: a line for draft 11.
- Nothing else. No code, test or record was edited. Draft 10 stays the approved text until draft 11 is approved, and code, tests and records keep citing draft 10's numbers.

## Old numbers to new

Every old rule has exactly one new number. None was split, merged or dropped. The points of rule 64 (was 44c) keep their numbers ("44c.1" is now "64.1"), and so do the points of "Made before, made after".

| Old | New | Rule |
| --- | --- | --- |
| 1 | 1 | Proposal and signatures |
| 2 | 2 | cMIPs |
| 3 | 3 | Commitments of identities |
| 4 | 5 | Positions |
| 4a | 4 | What you sign is what you saw |
| 5 | 6 | Agreement chains |
| 6 | 36 | Named by the agreement |
| 7 | 37 | Records |
| 8 | 38 | Several keepers |
| 9 | 39 | Copies |
| 10 | 40 | Keepers check homes |
| 11 | 41 | What a rotation cannot erase |
| 11a | 42 | A record counts only alongside the act it names |
| 12 | 43 | Keepers are always sealed |
| 12a | 44 | Judging content is someone else's job |
| 13 | 8 | Stake rule |
| 14 | 10 | Transfer |
| 15 | 7 | Binding a work |
| 15a | 9 | Stakes are written in millionths |
| 15b | 14 | A sale is tied to the seller's agreement, not to the work's stakes |
| 16 | 15 | A publication carries two agreements |
| 17 | 55 | Public domain |
| 18 | 16 | Named by grant key |
| 18a | 17 | The split task, handed to the split cMIP the agreement names |
| 18b | 18 | Each participant's check |
| 19 | 19 | What it receives |
| 20 | 20 | Publish a split |
| 21 | 21 | Conservation |
| 22 | 22 | Role shares with evidence |
| 23 | 23 | Pay out |
| 24 | 24 | Keep what it cannot deliver |
| 24a | 25 | Payout fees |
| 25 | 26 | Batching |
| 26 | 27 | Only the plan |
| 27 | 28 | Fees |
| 28 | 29 | Attention |
| 29 | 30 | Open obligations |
| 30 | 31 | Switching services |
| 31 | 32 | The trust that remains |
| 32 | 11 | Standing offers, accepted by performance |
| 32a | 12 | A purchase names the claim it pays under |
| 32b | 13 | Vows: the state of each sale |
| 33 | 33 | Time |
| 34 | 34 | Conditions |
| 34a | 35 | The chain of judgment |
| 35 | 56 | A collective is a full identity |
| 35a | 57 | An act is done once sealed to every member and on the chain |
| 35b | 58 | Two chains |
| 36 | 59 | Key grammar |
| 36a | 60 | Areas: rules by layer, powers of members |
| 36b | 61 | Every constitutional voice is covered |
| 37 | 69 | Changing members |
| 37a | 70 | A member can always leave alone |
| 37b | 71 | Leaving an area |
| 37c | 72 | Every complete clone is written on the record at once |
| 37d | 93 | A broken collective, and its way back |
| 38 | 73 | Grants |
| 38a | 74 | A grant never reaches beyond its issuer's power |
| 39 | 75 | Strands |
| 40 | 76 | Revocation |
| 41 | 77 | Import |
| 42 | 78 | Acknowledgements |
| 43 | 79 | Fate of acts |
| 44 | 80 | Evaluation |
| 44a | 62 | Every field belongs to one tier |
| 44b | 63 | What a clone changes |
| 44c | 64 | Which powers a clone needs |
| 44d | 65 | Counting a power |
| 44e | 66 | Protections still hold |
| 45 | 45 | Clone, never modify |
| 45a | 46 | A false mark makes a clone invalid |
| 45b | 47 | A deal changes only with everyone's signature |
| 46 | 48 | No stake reduced without its holder |
| 46a | 67 | Protected clauses: the judicial tier |
| 46b | 68 | Departed holders |
| 47 | 90 | Forks of records |
| 47a | 91 | How a collective ends: four shapes |
| 47b | 92 | The creditor's release |
| 48 | 49 | Exit |
| 48a | 81 | The core gives the language, not the answers |
| 48b | 82 | Triggers |
| 48c | 83 | Execution |
| 48d | 84 | Fallback |
| 49 | 85 | Clause |
| 50 | 86 | Liveness |
| 51 | 87 | Declaration |
| 52 | 88 | Contest |
| 53 | 89 | Outcomes |
| 54 | 50 | Atomic where possible |
| 55 | 51 | Failure attribution |
| 56 | 52 | Negotiation record |
| 57 | 53 | Disclosure by choice |
| 57a | 54 | Standing |

## No rule moved: the rule-by-rule list

*How it was checked.* Each part of draft 10 was rewritten for plain reading by one reader, with a checklist of every condition, exception, MUST, "invalid", "counts for nothing", number and field, client conformance, stated cost, reading to confirm and mechanic mark in its range. A second reader, who had not written it, then compared the part line by line against draft 10, looking only for a statement changed, dropped, weakened, strengthened or added. That second reading found 20 places: wording that could be read as a change, or a summary that left out an exception. Each was fixed as the second reader suggested, and the list says which. The code's tests, unchanged, pass (below).

What the rewrite removed: the revision notes of drafts 1 to 10, "Decided in this draft" and the record of questions and readings answered in earlier passes, all kept in draft 10. It also removed decision narration ("decided by Nobody, allegedly, date, 'Agreed'") and commentary that only told how an earlier draft read. Quotes of Nobody, allegedly, that explain a rule's reason stay, in italics. Every finding tag that backs a clause stays. "Open in this draft" now points to draft 10's list, unchanged: this rewrite answers no open question and adds none.

### The 93 rules

| New | Was | Rule | Second reading |
| --- | --- | --- | --- |
| 1 | 1 | Proposal and signatures | no difference |
| 2 | 2 | cMIPs | no difference |
| 3 | 3 | Commitments of identities | no difference |
| 4 | 4a | What you sign is what you saw | no difference |
| 5 | 4 | Positions | no difference |
| 6 | 5 | Agreement chains | no difference |
| 7 | 15 | Binding a work | no difference |
| 8 | 13 | Stake rule | no difference |
| 9 | 15a | Stakes are written in millionths | no difference |
| 10 | 14 | Transfer | fixed: a "most of the time" label wrongly framing a MUST removed |
| 11 | 32 | Standing offers, accepted by performance | no difference |
| 12 | 32a | A purchase names the claim it pays under | fixed: opening summary made italic and complete (standing offers too) |
| 13 | 32b | Vows: the state of each sale | no difference |
| 14 | 15b | A sale is tied to the seller's agreement, not to the work's stakes | no difference |
| 15 | 16 | A publication carries two agreements | no difference |
| 16 | 18 | Named by grant key | fixed: a "most of the time" label replaced by "The grant:" |
| 17 | 18a | The split task, handed to the split cMIP the agreement names | no difference |
| 18 | 18b | Each participant's check | no difference |
| 19 | 19 | What it receives | no difference |
| 20 | 20 | Publish a split | no difference |
| 21 | 21 | Conservation | no difference |
| 22 | 22 | Role shares with evidence | fixed: summary keeps the rail Module exception; a lead-in made commentary |
| 23 | 23 | Pay out | no difference |
| 24 | 24 | Keep what it cannot deliver | no difference |
| 25 | 24a | Payout fees | no difference |
| 26 | 25 | Batching | no difference |
| 27 | 26 | Only the plan | no difference |
| 28 | 27 | Fees | no difference |
| 29 | 28 | Attention | no difference |
| 30 | 29 | Open obligations | no difference |
| 31 | 30 | Switching services | no difference |
| 32 | 31 | The trust that remains | no difference |
| 33 | 33 | Time | no difference |
| 34 | 34 | Conditions | no difference |
| 35 | 34a | The chain of judgment | no difference |
| 36 | 6 | Named by the agreement | no difference |
| 37 | 7 | Records | no difference |
| 38 | 8 | Several keepers | no difference |
| 39 | 9 | Copies | no difference |
| 40 | 10 | Keepers check homes | no difference |
| 41 | 11 | What a rotation cannot erase | no difference |
| 42 | 11a | A record counts only alongside the act it names | no difference |
| 43 | 12 | Keepers are always sealed | fixed: summary corrected (a keeper is never given content *for being* a keeper) |
| 44 | 12a | Judging content is someone else's job | no difference |
| 45 | 45 | Clone, never modify | no difference |
| 46 | 45a | A false mark makes a clone invalid | no difference |
| 47 | 45b | A deal changes only with everyone's signature | fixed: a clause about the judge of forks' consent put back in protocol text |
| 48 | 46 | No stake reduced without its holder | no difference |
| 49 | 48 | Exit | no difference |
| 50 | 54 | Atomic where possible | no difference |
| 51 | 55 | Failure attribution | no difference |
| 52 | 56 | Negotiation record | no difference |
| 53 | 57 | Disclosure by choice | no difference |
| 54 | 57a | Standing | no difference |
| 55 | 17 | Public domain | no difference |
| 56 | 35 | A collective is a full identity | no difference |
| 57 | 35a | An act is done once sealed to every member and on the chain | no difference |
| 58 | 35b | Two chains | no difference |
| 59 | 36 | Key grammar | no difference |
| 60 | 36a | Areas: rules by layer, powers of members | no difference |
| 61 | 36b | Every constitutional voice is covered | no difference |
| 62 | 44a | Every field belongs to one tier | no difference |
| 63 | 44b | What a clone changes | no difference |
| 64 | 44c | Which powers a clone needs | no difference |
| 65 | 44d | Counting a power | no difference |
| 66 | 44e | Protections still hold | no difference |
| 67 | 46a | Protected clauses: the judicial tier | no difference |
| 68 | 46b | Departed holders | no difference |
| 69 | 37 | Changing members | no difference |
| 70 | 37a | A member can always leave alone | no difference |
| 71 | 37b | Leaving an area | fixed: a frequency lead-in made commentary |
| 72 | 37c | Every complete clone is written on the record at once | no difference |
| 73 | 38 | Grants | no difference |
| 74 | 38a | A grant never reaches beyond its issuer's power | no difference |
| 75 | 39 | Strands | no difference |
| 76 | 40 | Revocation | no difference |
| 77 | 41 | Import | no difference |
| 78 | 42 | Acknowledgements | no difference |
| 79 | 43 | Fate of acts | no difference |
| 80 | 44 | Evaluation | no difference |
| 81 | 48a | The core gives the language, not the answers | no difference |
| 82 | 48b | Triggers | no difference |
| 83 | 48c | Execution | fixed: "that approval is counted" (not the nominee) restored |
| 84 | 48d | Fallback | no difference |
| 85 | 49 | Clause | no difference |
| 86 | 50 | Liveness | no difference |
| 87 | 51 | Declaration | no difference |
| 88 | 52 | Contest | no difference |
| 89 | 53 | Outcomes | fixed: the rotation after a removal tied back to the voice-removed outcome |
| 90 | 47 | Forks of records | fixed: "only a clone recorded after both lines resolves it" restored; summary corrected |
| 91 | 47a | How a collective ends: four shapes | no difference |
| 92 | 47b | The creditor's release | no difference |
| 93 | 37d | A broken collective, and its way back | no difference |

### The other sections

| Section | Second reading |
| --- | --- |
| Purpose, dependencies, definitions (54 kept, plus "Vow"), the act table, terms (type 0) | no difference. "Vow" is added as a definition, since Envelopes defined the act and draft 10 had none. |
| Signature, resignation, record, abandonment declaration, settlement request and settlement, notice, collectives in the identity chain | no difference |
| Negotiation message (type 18) | fixed: "rule 4a" there is the Text MIP's, and had been marked as Agreements' |
| Contest (type 14) | fixed: the summary now covers both cases, a declared party and a vow's buyer |
| Made before, made after (points 1 to 7 keep their numbers) | no difference |
| Standing offer, refund terms, work claim, stake transfer, request to a judge | fixed: the note on "(mechanic, the build's)" kept to the step 12b formats it covered |
| Liveness (type 12) | fixed: "in a collective, it counts **only** where the collective placed it" |
| Split plan and split, grant and revocation, release, closing, creditor's release | no difference |
| Fork (type 19) | fixed: the summary keeps joint assignment and "binding the collective" |
| Decided in text only, not yet in code | fixed: names step 12b, as draft 10 did |
| Tasks, open technical parameters | no difference |
| Reasoning | fixed: two citations of withdrawn rules kept as "withdrawn" (D1, C8) |
| Freeze scenarios (119 bullets, regrouped by part; each kept with its scenario numbers, a script checked none lost or doubled) | no difference |

## What is new, finding by finding (the second commit)

Each is marked in the draft "new in draft 11 (Fxxx)".

- **F242 to F250: checked, each stated once already.** F242 in rules 10, 12, 25 and 93 (the obligations Money's text used to decide). F244 and F248 in rule 15, the home of the designated pointer; rule 23 and the split format refer to it. F245 and F246 in rule 35 (one active link per question), with rule 47 for forks. F247 in rule 14. F249 and F250 in rule 17 and terms field 29, with rules 16, 18, 31 and 67 referring to them. F243 (the film on the site) has nothing in Agreements. Nothing needed writing.
- **F252** (definitions, rules 11 and 13): a vow covers anything MOR cannot hash, existing or to come; every sale of a physical good or a service names a vow, and so has a state. The access form `[ 2, [ cMIP, params ] ]` sells access to bytes under a cMIP's terms, such as a subscription's keys. *Open: Q1.*
- **F253** (rule 13, contest format): a vow holds promises, which a seller bundles in public as it chooses. A contest names the sale it contests and the promise that failed; a confirmation names the sale. A bundle's partial refund is set by its terms; the core fixes none. The contest format gains the sale in field 0 and the promise in an optional field 1. *To build* (the code does draft 10's V-R9). *Open: Q3.*
- **F254** (rules 7 and 15, open parameters): any agreement may be a party of another, consenting by its own rule, named by its line (its founding version), carrying what it signed through every later version. No loops, failing closed. Nesting bounded at 8, a freeze parameter. At closing, stakes go where the closing says, and an absentee's share becomes an open obligation. A manifest neither claims its parts nor is reached by their claims. Naming by line replaces the build's mechanic (a version's hash), which stays marked as what the code does until built. *To build. Open: Q4, Q5.*
- **F255** (rules 11 and 93): a refund paid to a claim's refund rail counts only up to the payer's vault limit for its unit; above it, only at the vault. A reading to confirm: a bare key has no vault, so the limit does not reach it. *To build* (`repaid`). *See Q6 for Money's text.*
- **F256** (rule 15): any agreement paying another pays its designated pointer, and its responsibility for that payment ends there, in every chain.
- **F257** (rule 15): a compilation is a layer when its parts' agreements are its parties, a derivative when they are not.
- **F258** (rule 14): a stated cost beside F247. A resale under a fresh vow escapes the marking; catching it is the provenance cMIP's; the fresh vow, signed by the reseller, is the point to look.
- **F259** (rule 13): a vow names what is promised to the buyer, never the event. Two vows on one event stay separate, and one may name the other as a reference in its `refs`, carrying no claim, no stake and no marking. *Open: Q2.*
- **F260** (rules 17 and 18): every payer, publisher or direct buyer, tries field 14's service, then field 29's, in order, attempt by attempt. A backup paid directly receipts in the owners' name with the grants it already holds. Money's pointer format is unchanged. *To build.*

Core v21 and freeze suite v21: changed only where they quote a sentence that changed, both in the second commit. The vow's contest is in core "Announcements" and the suite's component line. The refund rail is in core's broken-collective paragraph and the suite's step "The debt rule" (QG2). The first commit changed no sentence they quote. Core's "Announcements" entries keep that word, as Envelopes draft 7 does.

## Questions for Nobody, allegedly

One at a time, most important first. None is worked around: each is marked "Open" in the draft.

**Q1. The anchoring service is a service, sold without a vow (F252).** F252 says every sale of a physical good or a service names a vow. The pooled anchoring service (anchoring cMIP draft 3, F225) sells a service, anchoring hashes, through the access form `[ 2, [ cMIP, terms ] ]`, with deadlines and refunds the cMIP judges. So one of the two must give.
- (a) A service whose delivery a cMIP checks by machine (anchoring: the hash is in the batch or it is not) keeps the access form; vows are for what people must confirm. *My lean: one form for one task still holds, since the cMIP is the confirmation.*
- (b) Anchoring moves to a vow: the offer names a vow whose cMIP field carries the anchoring terms. That means anchoring cMIP draft 4 and code.
- (c) The access form covers anything whose delivery a cMIP judges, and vows cover the rest; F252's "service" is read as "service judged by people".

The same boundary decides where a live stream's access sits: bytes under a cMIP (the access form), or a promise (Dario's vow, F259).

**Q2. A reference between two vows can confirm a sale (F259 against rule 13's mechanic).** The vow grammar build read "an act about the vow" as any valid act naming its name in `objects` or `refs`. Under F259, Dario's stream vow names the club's seat vow in its `refs`. That makes it "an act about" the club's vow, so a seat buyer could confirm their seat by acknowledging Dario's vow.
- (a) A vow's reference to another vow is not "an act about" it. *Lean.*
- (b) Leave it: harmless.
- (c) Narrow "an act about the vow" to its versions and acts its signer signs.

**Q3. Must a contest name the promise that failed (F253)?** The finding says a contest "may say" which promise failed. The task for this draft said it "names the sale and the promise". Written as optional (field 1).
- (a) Optional. *Lean: a buyer may know only that something went wrong.*
- (b) Required, in words at least.

**Q4. "Stakes liquidated at closing" against "a closing holds nothing" (F254, part 5).** A collective's closing (type 20) counts only when the collective holds nothing: every stake sold or released first. F254 says the closing itself says where each of its stakes goes.
- (a) The closing carries where each stake goes (a new closing field), and "holds nothing" is judged after those transfers.
- (b) Stakes move by ordinary transfers before the closing, as today; "per the closing" is read as those transfers, and an absentee's share is an open obligation of the collective, named in the closing like money owed to nobody (field 4).
- (c) Something else.

*Lean: (a), since the absentee's share needs one act that names it.*

**Q5. A deal has no closing (F254, part 5).** A deal that is a party of another agreement (two songwriters' deal inside an album's) cannot close: only a collective has a closing act.
- (a) A deal "closes" by a last clone, every party signing, that moves its stakes and names where each goes.
- (b) A closing act for deals.
- (c) Deals never close as parties: they are cloned, and the outer agreement keeps paying their pointer.

**Q6. Money's own text says otherwise until its redraft (F255).** Money draft 6, rule 14, still counts a refund to the refund rail at any size. Agreements draft 11 now states the limit and points to Money rules 14 and 14a.
- (a) Leave Money until its redraft, after Agreements (F251's order). *Lean.*
- (b) Revise Money draft 6 in place now, one sentence.

### Noticed in draft 10, carried unchanged

Writing a text for plain reading is also a review. These were in draft 10, were kept exactly as they were (the first commit changes no rule), and are listed for the freeze-ready draft. The first three look like contradictions; the rest are housekeeping.

1. **The notice and a one-time key.** The notice section (type 24) says a payer who committed only a one-time key "cannot be reached by a notice" (F197), and also that such a payer gets a public notice naming the payment (F208).
2. **A receipt following a standing offer.** The grant section's reading 4 refuses a split service's receipt following a standing offer, "whose format is open". The standing offer's section lifts that refusal (H5's reading 4, lifted) now that the format is written.
3. **Fees.** Rule 28 (was 27) keeps the pre-step-12b paragraph ("No split can include a fee without the signature of whoever bears its cost"; the modules' list "open"). It sits beside step 12b's text, where the bearers consent by the power field 28 falls under, and the split's list of Modules (key 6) is written. Nothing says which governs.
4. **Field 10.** Terms field 10, the concurrency rule, is withdrawn (step 12b), yet the definitions, the protected clauses, the tier table and rules 72 and 90 still speak of it as live. Read as written: with field 10 withdrawn, the default (the parent stays in force) always applies.
5. **Task 14.** The absence-proof task (14) is a judge in the chain of judgment, but the check "a judge never handles what it judges" lists tasks 9 to 11 only.
6. **"Undetermined".** Rule 11 says a payment whose place is undetermined is a purchase; rule 12 says no payment is undetermined. These are two senses of the word, the time reference's and the sale's.
7. **Open technical parameters.** The list is stale: it names refund terms, the split plan and splits as not yet exact, though they are written.
8. **Unnumbered tasks.** The tasks list has no numbers, though rules cite tasks 8 to 14 by number (the numbers are Development's table).
9. **Missing labels.** Two places lack their label: a stated cost in rule 59 ("the members' risk, stated", F77), and a client MUST in rule 70 (the last constitutional voice's warning, "likewise").
10. **QH4.** The resignation's paragraph says F207 "replaces QH4's reading", next to that same reading still marked "to confirm".
11. **Closing commentary.** It calls the stake transfer's format "still open", though it is written.
12. **The split numbering (rule 9).** It joins "one numbering runs across every split the service makes under the deal" to the forked-deal sentence. Read as general, since split key 5 numbers every split. Its "(client conformance)" labels a split service's duty.
13. **Succession lists.** Rule 83 (was 48c) lists what an automatic succession may change slightly differently from rule 64.3. It refers to 64, so there is no conflict.

## Tests

**Main, before writing anything** (commit `af8a4d8`, `scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed.**
- Rust workspace: 606 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 220 passed, 0 failed, in 12 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, jpeg 14, video 6.

**The branch, after both commits** (`scripts/test-all.sh`, same options): **all tests passed**, the same counts as on main: Rust 606 passed, 0 failed, 1 ignored; TypeScript 220 passed, 0 failed. No code or test changed, so the code's tests pass unchanged: the check that no rule moved.

## Second pass

*11 October 2026. Roadmap: Agreements draft 11, second pass (F251), texts only. Same branch, after merging main (which brought F259 revised, F261, F262, F263 and the readings of Q2, Q3 and Q6). One commit for the texts, one for this report.*

### In plain words

The first pass left six questions (Q1 to Q6). Nobody, allegedly, has answered all six, and this pass writes the answers into draft 11. Every "Open: Qn" marker for them is gone. Each change says where it comes from: "new in draft 11 (F261)" for a decided finding, "reading (Q2)" or "reading (Q3)" for a reading.

In short:

- **Two kinds of offer.** Some deliveries prove themselves: anyone can check them from the data, trusting no one's word (a hash in an anchoring batch, a key that unlocks the promised file). Those are *proven* offers and use the access form. Everything else rests on someone's word and is a *promised* offer, sold under a vow and confirmed or contested by its buyers. So the anchoring service needs no vow, and it does not change.
- **Two vows on one event stay apart.** The seat and the stream do not point to each other; each may point to the match, if the match is on MOR as an act of its own. A vow that does point to another vow does not count as confirming anything about it.
- **A contest names the sale.** Naming which promise failed is optional.
- **Ending.** A collective sells or gives away what it holds using the normal acts, then closes. Money it cannot pay to an absent person stays visible as owed, listed in the closing. A deal has no closing: it ends with a last version that all its parties sign, saying where things went and what is still owed.
- **Money draft 6 stays as it is** until its own redraft.

Writing this exposed **two new questions** (Q7 and Q8, below). Neither is worked around: each is marked "Open" in the draft.

### What changed, item by item

- **F261, Q1 (proven and promised offers).**
  - Definitions: a new entry, "Proven offer, promised offer". The "Vow" entry now says every sale of a good or service names a vow *unless its delivery is proven*.
  - Rule 11: what an offer sells now lists the three forms (publication, vow, proven delivery). The paragraph "What the access form still serves" is replaced by "Two classes of offers": the access form is widened from access to bytes to any delivery proven from data alone; a cMIP may produce the proof, but the verifier checks the proof itself, never the cMIP's say-so; the pooled anchoring service is a proven offer, unchanged.
  - Rule 13: F252's sentence gains "unless its delivery is proven". New paragraph: a proof may sit inside a vow as evidence beside a confirmation or contest, without replacing either; the sale's state is still the signer's.
  - Act formats: the comment on `[ 2, [ cmip, any ] ]` in the standing offer, and the paragraph "A service sold under a cMIP's terms", now say the access form is the proven offer's form.
  - *To build:* no format changes. The code judges a delivery under the access form only for the anchoring cMIP; checking any other proven offer's proof is not built.
- **F259, revised.** Rule 13 and the "Vow" definition: two vows on one event stay separate and neither references the other; each may reference the event where the event exists on MOR as an act of its own, never as a vow. The old sentence "one may name the other as a reference" is gone. The text says this describes how such vows are made and is not a check a verifier runs, because Q2's reading still allows a vow to name another.
- **Reading (Q2).** Rule 13: a vow's reference to another vow is not "an act about" it, and moves none of its sales' states. The build's mechanic ("an act about the vow") now has that exception. *To build:* `about_vow` in `core/src/agreements/view/vows.rs` still counts any valid act naming the vow in `refs`, a vow included.
- **Reading (Q3).** Rule 13 and the contest's format: the contest names the sale; naming the failed promise (field 1) is optional. The "Mechanics, to confirm" note no longer carries field 1.
- **F262, Q4 (a collective's liquidation).** Rule 15 (the F254 list), rule 91 (shape D), the "Closing" definition and the closing's format: liquidation is the ordinary sales, transfers and releases before the closing. The closing still counts only when the collective holds nothing. An absentee's money share is an open obligation named in field 4, and does not block the closing. No new field. Batching is a client's or cMIP's convenience, never a second way in the core. *To build.* *Open: Q8* (how the field 4 entry names such a share).
- **F263, Q5 (a deal's end).** Rule 47 (new paragraph), rule 15 (the F254 list) and a new definition, "A deal's end": a deal ends or winds down by a clone every party signs (F107). The clone states where the deal's stakes went, what is still owed, and to whom its outer agreement now pays. Deals have no closing act. An absent party is handled by the absence rules (B19): the declaration removes the voice where the deal provides it, and the stake is never reduced without its holder (rule 48). Nothing to build: it is an ordinary clone of a deal.
- **Q6.** Rule 11's F255 paragraph now records that Money draft 6 is unchanged until its redraft, and keeps its pointer to Money rules 14 and 14a.
- **Elsewhere in the draft.** The header now describes a third part and findings up to F263. "How to read this draft" explains the "Reading (Qn)" mark. "Open in this draft" records Q1 to Q6 as answered and lists Q7 and Q8.
- **Core v21**, two sentences that quote a changed sentence:
  - "Announcements": the contest names the sale "and optionally the promise not kept" (Q3).
  - The dissolution bullet: a collective cannot close while it owes anything "save what the closing names as left open, an absentee's money share among it" (F262).
- **Freeze suite v21**, one sentence: the component line "Announcements", with the same change for Q3. The suite's closing lines ("a closing ending a collective that holds nothing", scenario 9f) do not quote anything that changed.
- **`spec/README.md`**: draft 11's line mentions the second pass.
- **Left alone, as asked:** the thirteen points carried from draft 10, for the freeze-ready draft. No code, test or record was edited.

### New questions for Nobody, allegedly

One at a time, most important first.

**Q7. Is access to a live stream a proven offer or a promised one (F261)?** Rule 11 says paid access to a live stream is sold by a standing offer that names the stream's vow "where it has one". The code's tests also sell stream access through the access form with no vow. Under F261, the access form is for proven deliveries only. A key that decrypts the segments the stream's opener signs can be checked from data. But "the match is streamed in full, live" cannot be checked, and no hash is known when the sale is made. F259 treats Dario's stream as sold under a vow.
- (a) Promised: stream access always names a vow. The access form stays for deliveries whose hash or proof is fixed when the offer is made. *My lean: the buyer pays for the stream happening, and only the buyer can say whether it did.*
- (b) Proven: a key to the signed segments is the proof, so the access form stays. A seller who also promises the stream will happen in full adds a vow.
- (c) The seller chooses, each offer in its own class: the access form for the key only, a vow for the stream.

**Q8. How does the closing's field 4 name an absentee's money share (F262)?** F262 puts that share in "the closing's existing field for money owed", with no new field. Field 4's entries are written for money owed *back*: `[ payment, notice / null, ? holder ]`, meaning a receipt or claim of the refunded payment, the notice sent to its payer (type 24) or null for money owed to nobody, and an optional holder. An absentee's share is not a refund, and no element names who it is owed to. A notice today is sent only to a payer owed back, with a deadline.
- (a) The same entry, read more widely: the payment is the receipt or claim of the money the share comes from (a stake's sale), and the notice is a notice (type 24) sealed to the absentee, its use widened to a share owed. F197's shape applies: the share is left open once the notice's deadline has passed with no address given, and a holder may be named. *My lean: no new field, and the notice names whom it is owed to.*
- (b) The same entry with a null notice: the share is left open at once, and whom it is owed to is read from the agreement (its stakes and departed members entry), not from the closing.
- (c) An absentee's share is paid through the split like any income, and anything undeliverable is the split service's open obligation (rule 24). Field 4 then names nothing for it, and F262's "named in the closing" is read as "visible beside it".

### Tests

**After merging main, before writing anything** (`scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed** (merge commit `d76015a`).
- Rust workspace: 606 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 220 passed, 0 failed, in 12 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 42, jpeg 14, video 6.

*How it ran:* the first attempt passed the Rust half, then stopped because this container had no `wasm-bindgen`. The script names the tool it needs, so I installed that version (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`). I then ran the whole script again on the merge commit, in a separate checkout, and it passed as above.

**After the texts commit** (same options): **all tests passed**, the same counts: Rust 606 passed, 0 failed, 1 ignored; TypeScript 220 passed, 0 failed. Only texts changed, so this confirms that nothing in the code moved.

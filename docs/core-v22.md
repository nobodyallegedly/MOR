# The marked pass and core v22: the report

*12 October 2026. Roadmap: the next wave, session (g): the marked pass (F252 in Envelopes draft 8, F267 in Money draft 7, F268 in Development draft 7 and Agreements draft 11), then core v22 and freeze suite v22 naming the six current drafts. Texts only. Branch `claude/core-v22-marked-pass`. For Nobody, allegedly, to review and approve.*

## In plain words

Four drafts were approved this afternoon, each written again for plain reading with no rule changed. Three decisions were waiting to be written into them. This pass writes them in, and marks each one where it stands, so you can find every change by its mark.

- **Envelopes draft 8 (F252).** A vow used to name "something to come". It now names anything MOR cannot hash, whether it exists already or is still to come: a good in stock, a service, an hourly rate, a seat. Agreements draft 11 already said so; now both say the same.
- **Money draft 7 (F267).** When a conversion service passes money on and the next payee never signs a receipt, the service could not show it had paid. Now the service's own payment claim may name the receipt it is passing on, and Money's route rules read that claim as they read a receipt. One payment still counts once. This is one optional field in the claim, marked "to build".
- **Development draft 7 (F268).** The checker of a proven offer is not a task. A task is a hand-off an agreement names by its number. Each proven offer names its own checker, and a cMIP that checks proofs of delivery says so in one new field of its specification (field 12), so checkers can be found. The field is marked "to build".
- **Agreements draft 11.** Two pointers updated: the proven offers' paragraph now points to Development's new field; the vault-limit paragraph (F255) now points to Money draft 7, rule 17, since Money draft 7 is approved, and the line saying Money would follow "at its redraft" is gone. F266's sentence in rule 9 is unchanged.
- **Identity draft 12 and Text draft 7:** nothing to write in.

Then **core v22** and **freeze suite v22**, new files beside v21. Both name the six current drafts and say, in one header paragraph, everything decided since v21 (F242 to F268). Core v22 now maps what the drafts decided since: vows, proven and promised offers, an agreement as a party of another, a deal's end, leftover turns, the route claim, the proof checker. Two of its sentences had lagged older decisions; they are brought up to date. The suite gains lines for those findings, and two new steps for what is still to build.

**Six questions** came up, all core business, none worked around: each is marked in its draft ("Reading, to confirm" or "Open") and set out below. Three are Development's grammar around F268 (what "a task" means for tasks 1 to 5; whether a verifier reads the new field; whether a proven offer's checker is an extension). Three are Money's routes around F267 (a batch; a receipt and a claim that disagree on the previous hop; whether a claim that shows a hop must be disclosed like a receipt). A second reader, who had not written the texts, found four of them.

All tests passed on main before writing (below).

## The marked pass, draft by draft

Each change is marked in its draft: "new in draft N (Fxxx)", and "to build" where the code does not do it yet. No other rule changed.

### Envelopes draft 8: F252

| Where | Before | After |
| --- | --- | --- |
| Section 9, the vow's definition | "naming in words something to come: something MOR cannot hash, or cannot hash yet" | "naming in words **something MOR cannot hash, existing or to come** (new in draft 8, F252): a good in stock or to be made, a service, an hourly rate, storage, a seat, a work not yet made" |
| Part three, the vow's format, field 0's comment | "its words: what is to come" | "its words: what is vowed, existing or to come (F252)" (a comment, not the wire) |
| Header | "It changes no rule"; F252 "put as a question" | "The rewrite changes no rule"; then the marked pass, writing F252 in |
| How to read this draft | one mark | the mark "New in draft 8 (Fxxx)" added |

Nothing to build: no code tells a thing that exists from one to come (the envelopes report's Q1 lean).

### Money draft 7: F267

| Where | Change |
| --- | --- |
| Rule 24 (was 5), a valid route | "every receipt **and claim** in it is valid"; a hop names the previous hop's receipt **when a valid receipt or claim of that hop names it**: the next payee's receipt (field 6), or the paying hop's own claim (key 10), F267's own words. A new italic *In short*, and an italic line: this is double entry along a route, as rule 11 gives a single hop. *Open (Q5).* |
| Rule 24, a second paragraph | **Rule 12 bounds it:** claims of one payment that name different previous receipts count only as rule 12 lets receipts or claims share a payment: one payment, one count. *Open (Q4).* |
| Rule 26 (was 8), disclosure | unchanged; *Open (Q6)* beside it |
| Rule 27 (was 9), a hop that forwarded nothing | "no valid receipt **or claim of the next hop** names it" |
| Claim format (type 3) | `? 10 => hash`: the previous hop's receipt, where this payment passes on a forward, as receipt field 6 |
| The anonymous claim's signed array | `field 10 or null` added after `field 9 or null`; the prose lists the previous hop among what the signature binds, and key 10 among the keys written as null where absent |
| Words used: "Route" | "where the next payee signs no receipt, the paying hop's claim may name it instead" |
| Freeze scenarios, routes | the silent next payee: the service's claim passes the forward on; two claims of one payment, naming two forwards and no batch, count for neither (scenario 2) |
| Header; How to read this draft | the marked pass; the mark *To build* added |

Every item is marked "new in draft 7 (F267); to build".

**To build** (session (h)): the claim's key 10 in the core library; the anonymous claim's signed bytes (every anonymous claim signs one more null, so its test vectors change); the route reading in `cmips/conversion/src/route.rs` (`link`, `from`, `ending_at`); the conversion cMIP's checker taking the claim as proof; the pinned test `question_cv1_a_silent_next_payee_keeps_a_paid_forward_open` flipping to "passed on".

### Development draft 7: F268

| Where | Change |
| --- | --- |
| Words used: "Task" | "A point where a MIP hands work to a cMIP **that an agreement names by the task's number** (Agreements, terms field 2; new in draft 7, F268)". A hand-off no agreement names by a task number, such as the proof checker of a proven offer, is not a task. *Reading, to confirm (Q1)* beside it. |
| Under the tasks table | the heading "Besides the numbered tasks" becomes "**Not a task: the proof checker of a proven offer**"; the line "Agreements draft 11 gives this checker no task number" replaced by a paragraph: each proven offer names its checker, the cMIP in its access form; no agreement names one by a task number, so a collective sets no checker for all its offers; a cMIP that checks proofs of delivery declares so by field 12, as a rail Module declares its kind in field 11, so checkers can be found. Your words on F268 kept in italics. *Open (Q2)* beside it. |
| Specification format | `? 12 => true`: a proof-of-delivery checker (to build) |
| Part three, a new section "A proof-of-delivery checker (field 12)" | what the field says; a specification without it declares nothing; the verifier still checks the proof, never the cMIP's say-so (F261); *Open (Q2)* |
| Freeze scenarios, Part one | a cMIP declaring itself a checker, found by it, named by a proven offer (scenario 8) |
| Header; How to read this draft | the marked pass; the marks "New in draft 7", *To build*, *Reading, to confirm (Qn)* and *Open (Qn)* |

**To build** (session (h)): field 12 in the library's specification reader; how a client finds checkers by it.

### Agreements draft 11

| Where | Change |
| --- | --- |
| Rule 11, "Two classes of offers" | a new bullet: **each proven offer names its checker**, the cMIP in its access form; the checker is not a task (Development draft 7, F268); a cMIP that checks proofs of delivery declares so by Development's field 12 (new in draft 11, F268; to build) |
| Rule 11, "The vault's limit protects refunds too" (F255) | points to **Money draft 7, rule 17**, with rule 3's limit (keeping draft 6's rules 14 and 14a for older citations); the bare key's "no limit" no longer a reading to confirm, since Money draft 7's approval confirmed it; the italic line on Money draft 6 waiting "until its redraft" (Q6) removed |
| Rule 9, F266's sentence | unchanged, as asked |
| Header | the marked pass, no rule changed |

### Readings and mechanics taken, not put as questions

Each is listed for you to see; none changes a decided rule.

1. *(Withdrawn as a reading: now Q4.)* My first draft read F267's "rule 12 bounds it" as rule 12 applied as written, batch included. The second reader showed that this is narrower than F267's own words, "one payment serves one forward", so it is put.
2. **Key 10 is not also put in `objects` (Money).** A receipt names the previous hop's receipt in field 6 and in `objects`. F267 decided one field in the claim, mirroring field 6; the pass adds the field only. Whether the claim should also cite it in `objects` is a mechanic for the build, noted in the carried points.
3. **Where field 10 sits in the anonymous claim's signed array (Money):** after field 9, in field order. A mechanic; existing vectors change at the build.
4. **Field 12's number and value (Development):** the next free field, `true` only. A mechanic. What it means beyond "declares" is Q2.

**The second reader.** A reader who had not written the texts compared the pass with F252, F267 and F268, and core v22 and suite v22 with the drafts. They found nothing decided left out, every change marked, the CDDL well formed, and v21's history moved byte for byte. Their points, and what was done:
- my first rule 24 let a claim count only "where the next payee signs none", narrower than F267's "a valid receipt or claim of the next hop names it" (which rule 27 used): **fixed** to F267's words; the case it leaves open is Q5;
- the batch under rule 12: **Q4**; a proven offer's checker read as an extension: **Q3**; a claim standing in for a receipt being private by default against rule 26: **Q6**;
- core v22 said "a good" where Agreements says "a physical good", and "(Envelopes)" where the Envelopes report suggested "(Envelopes draft 8)": **fixed**;
- the suite's header left out F258, and "nesting bounded (8)" read like a scenario number: **fixed**;
- the "written against" lists of Agreements and Envelopes predate the pass: the marked pass now says it was written against the six current drafts;
- key 10 not also in `objects`, and field 12 on another kind of specification: **carried** (points 28 and 47).

## Core v22

`spec/02-MOR-core-v22.md`, new. Version 21 stays in `spec/`.

**The header:** one paragraph saying what version 22 is, naming the six current drafts (Identity 12, Text 7, Envelopes 8, Money 7, Agreements 11, Development 7), and everything decided since v21, F242 to F268, each in a few words. It also says that a rule number cited without its draft is the number in the draft v21 named, as code and records cite them until the freeze-ready drafts (the reports' convention). Version 21's header and its revisions in place moved, word for word, to "Earlier versions", in front of version 20.

**Sentences the reports listed as quoting a changed sentence:**
- the Envelopes report's three: the bullet "Announcements" becomes "Vows" (F237, F239, F240, F241), naming "something MOR cannot hash, existing or to come" (F252); the glossary row "Announcement" becomes "Vow", in its alphabetical place, "To be renamed vow" dropped; the suite's component line, below.
- the Identity, Text and Development reports listed none; Money's and Agreements' were already applied in place in v21 (F253, F255, F262, F265) and carry over.

**What the body now maps, decided since v21:**
- **Structure, "Tasks"**, and **Development, "Tasks are the contract"**: a task is a hand-off an agreement names by its number; a proven offer names its own checker (F268).
- **Envelopes, "Vows"**: existing or to come (F252); promises, bundled (F253); two vows on one event stay separate, a vow naming another moving none of its sales (F259, reading Q2); every sale of a good or a service names a vow unless its delivery is proven (F252, F261); an offer outside the claiming agreement shown so (F247), a resale under a fresh vow escaping it, a stated cost (F258).
- **Money, "Routes across rails"**: where the next payee signs no receipt, the paying hop's claim naming the previous receipt shows the forward passed on, one payment counted once (F267, to build).
- **Agreements and deals**: two new bullets: an agreement may be a party of another, with the designated pointer ending a payer's responsibility and the compilation as layer or derivative (F244, F248, F254, F256, F257); a deal ends by a clone (F263).
- **Splits**: every payer follows the order of attempts, a backup paid directly receipting in the owners' name (F260).
- **Offers**: a new bullet, two classes of offers (F261, F264, F268).
- **Development**: a new bullet, a proof checker is no task (F268).
- **Glossary**: "Vow", "Proven offer, promised offer", and "Task" (F268).
- **Open before freeze**: QS1 answered by F260; a new item for the freeze-ready drafts, what is to build first, and this pass's six questions.

**Two sentences that lagged earlier decisions**, brought up to date and said so in the header:
- "Stakes": "what is left over by rounding goes to the first party listed" said what F150 and F165 replaced (largest remainder, ties taking turns, the list's order deciding nothing). It now says so, with F266.
- "Earning through signed terms": "Creators earn through standing fee offers" lagged F211 (the Development report's carried point 2). It now says a creator who charges states its fee in its specification, owed only through an agreement's fee entry.

**Stands on its own, names no use:** the new sentences name no person, work, event or market; examples stay in the drafts and the case studies.

## Freeze suite v22

`spec/03-MOR-freeze-test-suite-v22.md`, new. Version 21 stays in `spec/`.

- **Header:** one paragraph, as core's: the six drafts, F242 to F268, where each is tested, and the same note on rule numbers. Version 21's header and revisions moved to "Earlier versions".
- **The component line on vows** (the Envelopes report's third sentence): "Vows (F237, F239, F240)", "a vow's own chain", "an offer naming a vow"; and F252 (existing or to come), F259 with reading Q2 (built), F264 (a key as evidence). The test file name `review_announcements.rs` stays.
- **New or extended lines:** the route across rails, a silent next payee (F267, to build); stakes, leftover turns across a deal's versions (F266); the split service, every payer trying the services in order (F260); an agreement as a party of another (F254, F256, F257); how a collective ends, liquidation and an absentee's share (F262, F265), a deal ending by a clone (F263); two classes of offers (F252, F261, F264); a proof checker no task (F268, to build).
- **New steps:** 2.4g, the silent next payee, the claim passing the forward on, two claims of one payment without a batch counting for neither (F267, to build; until then the stated cost stays pinned by the conversion test); 8.6, a cMIP declaring field 12, found by it, a proven offer naming it (F268, to build).
- **Marked so:** the lines no scenario exercises yet say "*(scenario: to write)*" (F254 to F257; F262, F263, F265), so the freeze report cannot mistake them for run.

## spec/README.md

Core v22 and suite v22 listed as awaiting approval, above v21 (v21 kept, the approved text until then). Each draft's line records the marked pass: Envelopes 8 (F252), Money 7 (F267, Q4 to Q6), Development 7 (F268, Q1 to Q3), Agreements 11 (the two pointers), Identity 12 and Text 7 (nothing to write in). The findings range now reads F1 to F268.

## Questions for Nobody, allegedly

One at a time, most important first within each area. Each was checked against the working rule "core business, or the participants' choice": each is about the core's own rules, which no participant chooses (a cMIP cannot make Money's route rules read differently, nor change what Development calls a task), so each is put.

### Q1. "A task is a hand-off an agreement names by number": what of tasks 1 to 5?

**Area: core business** (Development's task grammar, F268).

*In plain words:* F268 sharpened the word "task": a task is a hand-off an agreement names by its number. That separates the proof checker well. But five tasks in the table are usually chosen by no agreement: a text act names its own format (task 4), a publication names its media cMIP (task 5), and clients choose their naming, identity-proof and link-proof cMIPs (tasks 1 to 3). Read strictly, the new words would make them not tasks.

*Laid beside it:* terms field 2 lets an agreement name a cMIP for any task by its number (`{ * uint => hash }`), and Development rule 6 says agreements name their cMIPs by these numbers.

*Options:*
- **(a) "Names" read as "may name"** (*my lean*, written into Development draft 7 as "Reading, to confirm (Q1)"): a task is a hand-off with a number by which an agreement may name its cMIP. Tasks 1 to 5 stay tasks; acts and clients may still choose those cMIPs directly where their MIP says so. The proof checker has no number, so it is not a task. No code changes.
- **(b) Two kinds of task stated:** tasks an agreement names (6 to 14) and tasks an act or a client names (1 to 5), both numbered; the definition says both. Clearer, longer.
- **(c) Strict:** only what an agreement names is a task; tasks 1 to 5 leave the table as "hand-offs without number". That changes Identity's, Text's and Envelopes' task lists and every client's count.

### Q2. Does a verifier read field 12, or does it serve discovery only?

**Area: core business** (Agreements rule 11, Development's field 12; F261, F268).

*In plain words:* F268 says a cMIP that checks proofs of delivery declares so by one field, "so checkers stay discoverable". It does not say what a verifier does with a proven offer naming a cMIP that does not declare it.

*Options:*
- **(a) Discovery only** (*my lean*): a verifier asks the checker of whatever cMIP the offer names, among those it holds, as the build does today; field 12 helps people and clients find checkers. F261 already makes the proof decide, "never the cMIP's say-so", and the field is the cMIP's say-so. No offer made so far changes.
- **(b) Fail closed:** a delivery counts as proven only where the named cMIP declares field 12. A cMIP that forgets the field proves nothing. The anchoring and conversion cMIPs would be republished with the field, new specification hashes, and offers naming the old ones would stop being proven.

### Q3. Is the cMIP a proven offer names an extension?

**Area: core business** (Development's grammar; F215, F268).

*In plain words:* Development calls an extension "a cMIP an agreement names outside the listed tasks". F268 relies on F215: a lone seller's offer is its agreement. That offer names a checker's cMIP, outside the tasks. Read literally, the checker is then an extension, with what extensions bring: terms field 15, declared layers, and, in a collective, the approval of each layer's lane.

*Options:*
- **(a) Not an extension** (*my lean*, written as the reading in Development draft 7, marked Open (Q3)): an extension is what an agreement names in terms field 15, to add rules to the agreement itself; the access form names what is sold and the cMIP whose checker reads its proof, and adds no rule to anyone's agreement. The definition would say "names in terms field 15". No code changes.
- **(b) An extension:** an offer naming a checker carries it in field 15 too, and a collective's offers need the lanes' approval for each checker. Heavier, and against F268's "each offer chooses the checker that suits what it sells".

### Q4. Under F267, may one payment pass on several forwards in a batch?

**Area: core business** (Money rules 12 and 24; F267).

*In plain words:* F267 says rule 12 bounds the new claim, "one payment serves one forward". But rule 12 itself lets several receipts or claims share one payment when they name the same batch and their amounts together are no more than the payment. A conversion service that pays two forwards to the same next payee in one transaction could then show both with two claims. Today, two receipts of the next payee could already do so.

*Options:*
- **(a) Rule 12 as written** (*my lean*): a named batch lets one payment carry several forwards in parts, for claims as for receipts; the money never counts twice. Mirrors receipts, as F267 asks.
- **(b) One payment, one forward, for claims:** a claim naming a previous receipt may not share its payment, batch or not. Stricter for claims than for receipts.
- **(c) One payment, one forward, for both:** the same rule for receipts naming a previous hop. Changes what receipts may do today.

### Q5. A receipt and a claim of one hop name different previous receipts: which counts?

**Area: core business** (Money rules 11, 24 and 27; F267).

*In plain words:* with F267, a hop is passed on when the next payee's receipt or the paying service's claim names the previous receipt. If both exist and name different previous receipts (the next payee says "this was for another order", the service says "this was for that one"), rule 24 and rule 27 each find a valid act naming it, and rule 11's list of disagreements (amount, payee, what the payment fulfils) does not name this one.

*Options:*
- **(a) The payment's own commitment decides** (*my lean*), as rule 11 already does for payee and purpose: where the rail binds the previous hop in the commitment, the act matching it counts; where it binds nothing, the payer's claim decides, the receiver's contrary receipt shown as a dispute on the receiver (rule 11's second bullet). Same pattern, no new mechanism.
- **(b) The receiver's receipt decides:** against round 2's first pattern, since the receiver gains from the forward staying open.
- **(c) Neither counts until the receiver signs a matching receipt:** the forward stays open, which is the case F267 set out to close.

### Q6. Must a claim that shows a hop be disclosed like a receipt?

**Area: core business** (Money rule 26; F267).

*In plain words:* rule 26 says each hop's receipt must be disclosed at least to the next payee and to the final creditor, so the creditor can check the whole route. A claim is private by default. Where a claim now shows a hop in place of a receipt, nothing makes the service show it to the final creditor, who then cannot check the route.

*Options:*
- **(a) Yes** (*my lean*): rule 26 reads "each hop's receipt, or the claim that shows it": a service relying on its claim must disclose it to the final creditor. It is the service's interest anyway: an undisclosed claim leaves the forward open for the creditor.
- **(b) No rule:** the service discloses it when it wants the forward read as passed on; rule 26 unchanged, a stated cost (the creditor sees an open forward until shown).

## Carried points for the freeze-ready drafts

In one place: what the reports carried, unchanged, plus what this pass noticed. "Done" marks the ones this pass settled.

**Across the texts**
1. **Rule numbers.** Code comments, tests, records, core v22 and suite v22 cite the older drafts' numbers (Identity 11, Envelopes 7, Text 6, Money 6, Agreements 10, Development 6), save where a draft is named. One pass at the freeze-ready drafts updates every citation (F251's mechanic).
2. **Envelopes' three lists, one set of numbers.** Draft 7's bare citations ("Envelopes rule 2", "rule 4") never say which list; resolve each by its context (Envelopes report, 2).
3. **On-wire tags with old names:** `"MOR/safety"` (Identity report, 6) and `"MOR/finance/anonymous-claim"` (Money report, 7): they stay until a freeze decides otherwise.

**Identity** (`docs/identity-draft-12.md`)
4. Check 2 ("check that it is public") should name the private-link exception for types 6 to 8 (F134).
5. Rule 44's two receipts "that count" should read "that pass receipt check 1".
6. The freeze scenarios cite "freeze test suite v16"; the suite is at v22, and the scenario numbers were not rechecked.
7. Two lists of what may not rely on "re-homed without audit"; state one.
8. "Envelopes. The signed container of an act" carries the layer's name onto one act's container.
9. Agreements and Money cite Identity by draft 11's numbers (see 1).

**Envelopes** (`docs/envelopes-text-drafts.md`)
10. Agreements draft 11's "Vow" definition still says Envelopes draft 7 says "announcement" "until its own redraft": stale since draft 8.
11. A withdrawal's `objects` entry: which pair `[chain, predecessor]` it writes is not fixed; two implementations could differ.
12. The same statement twice: rules 8, 23, 24, and 18 with 19.
13. Type 4, the encryption key, "an Identity act in spirit": Identity's own list does not name it.
14. The running-summary vector's two descriptions could point to its file.
15. *Done:* F252 written in (this pass).

**Text** (`docs/envelopes-text-drafts.md`)
16. U+2031 listed twice in the format task; U+060A not listed (a reading confirmed at F182).
17. Rule 6 names two lists ("agreements, terms and grants"; "terms, a grant or a clone").
18. Rule 2 has no order; "until the text is canonical" would close it.
19. Overlaps (CR in rules 8 and 9; U+200B to U+200D as Cf) worth a sentence.
20. "The envelope defined in the Identity MIP": the act is Envelopes'.
21. *Done in draft 7:* the stale header (F1 to F102).

**Money** (`docs/money-draft-7.md`)
22. "FORMAT OPEN, F140 item 1" in rule 11 looks stale: the rail kind is Development's field 11 (OF26 a).
23. The payment commitment is still "proposed … to be confirmed" in the open parameters, though built on.
24. The vault section names the Lightning rail Module draft 1; the header draft 2.
25. Request rail, push rail, the clock, lock change and refund rail are defined where used, not in "Words used".
26. "The treasurer" in a freeze scenario stands for whoever holds the Money lane.
27. Rule 7 cites Agreements rule 80 for Identity's scoped key; it could cite both.
28. *New:* whether a claim's key 10 is also named in `objects`, as a receipt's field 6 is (reading 2 above; the second reader).
29. *Done:* Agreements draft 11's rule 11 lagging Money (this pass).

**Agreements** (`docs/agreements-draft-11.md`)
30. The notice and a one-time key: "cannot be reached by a notice" (F197) beside a public notice naming the payment (F208).
31. A receipt following a standing offer: the grant section's reading 4 still refuses it; the standing offer's section lifts it.
32. Fees: rule 28 keeps the pre-step-12b paragraph beside step 12b's text.
33. Terms field 10 is withdrawn, yet spoken of as live in several places.
34. Task 14 is a judge, but "a judge never handles what it judges" lists tasks 9 to 11; rule 60 likewise (Development report, 6).
35. "Undetermined" in two senses (rules 11 and 12).
36. The open technical parameters list is stale.
37. The tasks list has no numbers, though rules cite them.
38. Two missing labels: a stated cost in rule 59, a client MUST in rule 70.
39. QH4: "replaces QH4's reading" beside the reading still "to confirm".
40. The closing's commentary calls the stake transfer's format "still open".
41. Rule 9's numbering sentence, and its "(client conformance)" label on a service's duty.
42. Rule 83 and rule 64.3 list what an automatic succession may change slightly differently.

**Development** (`docs/development-draft-7.md`)
43. Task 6's output still says the cMIP tells whether each rail Module is a request or a push rail; the Module declares it in field 11 (Money's point 22).
44. RV32IM and the checkers: the rail rules and the anchoring checker run natively today; the freeze-ready draft should say a proven offer's checker is a rule anyone can run (by its definition).
45. Money's "Tasks" leaves out the claim a purchase pays under; Development's row 6 has it.
46. No freeze scenario for the proof checker in Development's list. *Done:* this pass adds one, and the suite's step 8.6.
47. *New:* field 12 on a specification of another kind than a cMIP (a Module under a checking cMIP): nothing says whether it is read.
48. *Done:* Q1 of the Development report answered (F268) and written in. Core's lag on F211, done in core v22.

**Core and suite**
49. Core's "Open before freeze" still lists Agreements draft 10's open points by draft 10's names; the freeze-ready Agreements draft should carry its own list.
50. The suite's lines marked "*(scenario: to write)*" need scenario steps before the freeze report.

## Tests

**Main, before writing anything** (commit `04f743a`, `scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed.**
- Rust workspace: 647 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 249 passed, 0 failed, in 14 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, poster 7, reader 16, repo 18, site 58, jpeg 14, video 6, carry 6.

*How it ran:* this container had no `wasm-bindgen`, so I installed the version the script names (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`), outside the repository, first. The site's browser test used the container's Chromium (`MOR_CHROMIUM`). The run used a separate checkout of `04f743a`, so the working tree was untouched during it; the texts were written in a scratch folder meanwhile, and entered the tree only after the run passed. *An error of mine, caught before it mattered:* this clone's local `main` pointed at an old commit (6 October); a first run started there was stopped within minutes, before any result, and everything above ran on `04f743a`, the remote's `main`.

**The branch, after the texts** (`a803f66`, the marked pass and core v22, same options, a separate checkout): **all tests passed**, with the same counts as on main: Rust 647 passed, 0 failed, 1 ignored; TypeScript 249 passed, 0 failed. The working tree was untouched during the run. The commit after it (the second reader's wording points and this report) changes only Markdown files under `spec/` and `docs/`, as `git diff --stat` shows, so the run covers the branch's code as it stands. No code or test changed.

## Second pass

*12 October 2026, evening. The same branch, main merged in first. Texts only.*

### In plain words

You confirmed this pass's six questions as leaned, and decided two questions from the deal assessment tool (F270, F271). This pass writes all eight in, and fixes four slips the tool noticed.

- **The six readings** now stand in the texts as rules, each marked "reading, confirmed"; no "Open" or "to confirm" mark is left for them.
- **F270:** a holder who has no say in the power that sets the split plan or the fees (an investor in a deal who is not one of its parties, or a member who has left a collective) can no longer be paid less without signing.
- **F271:** a split plan *may* cap the fee a payout loses. With no cap there is no limit, and a client must warn before signing.
- **Four slips**, each fixed in the text only (**no rule changed**): what the text said lagged what was already decided, and the code already does it.

### What changed

**Development draft 7 (Q1 to Q3).**
- "Task": a hand-off an agreement *may* name by its number. Tasks 1 to 5 stay tasks; the proof checker is not one.
- Field 12 serves discovery only. A verifier asks the checker of whatever cMIP the offer names, and the proof decides. The proof-checker paragraph, the field's section, the freeze scenario and suite step 8.6 say so.
- "Extension": a cMIP an agreement names in terms field 15. A proven offer's checker is not one.

**Money draft 7 (Q4 to Q6).**
- Rule 12, with rule 24's second paragraph: under a named batch, one payment may carry several forwards in parts, for claims as for receipts.
- Rule 11's two lists add "the previous hop's receipt", and rule 24 points to rule 11: the payment's commitment decides; where it binds no previous hop, the payer's claim decides, and the receiver's contrary receipt shows as a dispute. Rule 27 reads the hops "as rule 24 reads them".
- Rule 26: "each hop's receipt, or the claim that shows it".
- Rule 21 points to F271. The freeze scenarios are extended.

**Agreements draft 11.**
- **Rule 48 (was 46), F270, to build.** A version that lowers a stake's part of the split plan, or adds or raises a fee it bears, needs the signature of every holder it pays less who has no voice in the power making that change: in a deal, a holder who is no party; in a collective, a departed holder. Members are left to the collective's own rules.
- Rules 28, 45 (the clone's list of signatures, the code's `must_sign`), 66 and 68 point to rule 48. Rule 68 now says a departed holder's one signature is on its own stake and pay, never on anything else.
- A freeze scenario is added.
- **Rule 25 (was 24a), F271.** The plan "may state" a maximum fee per payout; with none stated, there is no cap. *Client conformance:* the client flags the absence before signing. The plan's key 6 comment and the glossary say so.

**The four slips (text only, no rule changed):**
1. Field 28 (fees, F213) is added to the terms format and to the tier table (operational). The area references now name field 28.
2. Field 10 (the concurrency rule) is shown as withdrawn (step 12b) in the tier table, the glossary (two entries) and rule 67. So that the draft does not contradict itself, the same was done in rules 6 and 72, the reasoning and two freeze lines, which still read the field as live.
3. Task 14 (absence proof) is judicial in the tier table, in the area references and in rule 67.
4. The fee entry's comment cites rule 28, not rule 27.

**Core v22 and suite v22.**
- Core v22: the header (F270, F271, the confirmed readings), "Tasks", routes, stakes, the protected clauses (concurrency rule out, absence proof in), fees, departed holders, "Tasks are the contract", the proof checker, the forks of records, "Open before freeze", and the glossary (Task, Extension, Concurrency rule).
- Suite v22: the header; the route, fees, departed holders and clone lines; steps 2.4g (Q4 to Q6), 3.3 (the concurrency rule withdrawn) and 8.6 (Q2). The new lines for F270 and F271 are marked "*(scenario: to write)*".
- `spec/README.md`: each draft's line, and the findings range F1 to F271.

**A second reader** checked the pass against the decisions. Points fixed after the review:
- the concurrency rule was still treated as live in rule 72;
- "no veto" in rule 68;
- the short forms of F270 read too widely;
- a wider class I had added in rule 48 ("any other holder who is no member") is dropped, since F270 names departed holders only;
- the question labels;
- the suite's "invalid" for field 10 (the text says "withdrawn, never reused"; the code refuses it);
- three wording slips.

*Noticed, not changed:* rule 90 still says a collective "must define how forks are settled", with no field left to do so. This is for the freeze-ready draft (carried point 33). Money rule 26 now names the next payee as well as the final creditor for the claim, as Q6's words read.

### Questions for Nobody, allegedly

Both questions are about F270, in Agreements rule 48, marked "Open (core v22, Q7)" and "(Q8)". Both were checked against the working rule (F265). Each asks what F270 protects, which no participant's choice may break, so each is put.

**Q7. Does "unless the agreement pre-authorised it" reach F270?** *(area: Agreements, stakes; rule 48)*

*In plain words:* rule 48 lets a share be cut without the holder's signature where the agreement allowed it in advance, for example through the abandonment clause. Does that exception also apply to cutting a holder's pay?
- **(a) No, for a deal's non-party holder; yes, for a departed holder** (*my lean*). The non-party never signed the agreement, so the parties' advance permission would reopen exactly the case F270 closes. The departed holder signed it as a member. It is also the way out when a departed holder disappears: without it, one silent departed holder blocks every new fee for the whole collective, since fees fall alike on every stake (rule 68).
- **(b) Yes, for both.** Simplest, but in a deal the parties could write in permission to cut an investor's pay.
- **(c) No, for both.** Strictest. Stated cost: a vanished departed holder freezes the collective's fees.

**Q8. Which changes "lower a stake's part of the split plan"?** *(area: Agreements, splits; rule 48, to build)*

*In plain words:* a stake can be paid less without its own number changing. Examples: another share is raised or added; a role share is added; unfilled roles are sent elsewhere; the rail fee is moved onto receivers; the maximum fee is raised or removed; the split cMIP or its parameters change.
- **(a) A computable list** (*my lean*): any change to the plan's shares that lowers the stake's portion of a payment, and any change to who bears the rail fee, to the maximum fee, to unfilled roles, or to the split cMIP and its parameters. What a cMIP pays cannot be read from the plan alone, so changing it counts as lowering.
- **(b) Shares only:** the stake's own part lowered, or another's raised or added. Stated cost: the other changes escape.
- **(c) The stake's own number only.** Narrowest.

### Tests

The texts were written while the tests ran on a separate checkout of the branch after the merge (`a8b2225`), using `scripts/test-all.sh` without `--reproducible` or regtest. The working tree was untouched during the run. Only Markdown under `spec/` and `docs/` changed after that commit. Results: see below.

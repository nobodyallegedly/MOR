# The freeze-ready drafts: report

*For Nobody, allegedly, to approve. Written by the freeze-ready texts session (S1), branch `claude/freeze-ready-texts`.*

## In plain words

The core's eight texts now exist in their freeze-ready form, each as a new file beside the old:

- Identity draft 15
- Text draft 11
- Envelopes draft 11
- Money draft 11
- Agreements draft 17
- Development draft 11
- MICS v30
- freeze test suite v30

Each is written to be read alone by someone who holds only these eight. A later session builds a verifier in C from them.

**What changed in the texts:**

- **History is gone.** No old rule numbers, finding numbers or review labels. No "new in draft N", no version notes. Each header is one line. A retired rule or type keeps one line saying so, and its number is never reused.
- **Every cross-reference is checked.** Each one names a MIR and a current rule number, and was checked against the target's heading. Several texts still cited other MIRs by numbers from before the renumbering; those are corrected.
- **"Open before freeze" is empty.** Whatever was still open is a question below, never a silent choice.

**The decisions written in:**

- **Keepers redefined.** A keeper orders; it never times. Only anchors place anything on the clock. The keeper record's format is in the core (type 2, `{ 0 => [act, signer] }`). A deadline is shown missed only by an anchor (Agreements rule 33), and Agreements rule 42 states the trust that remains.
- **A revoked grant's acts.** Another identity may have acknowledged an act under a revoked grant, or a keeper may have recorded it before the revocation. Such an act is shown disputed, not void, in Identity rule 34's words (Agreements rule 76). A revocation cites every act under the grant (client conformance).
- **"Lane" is "area" everywhere.** A person's grant to an app is "a grant to oneself" (Agreements rule 73). A holder's member key is named by the holder's signature (Agreements rules 60 and 73).
- **Identity's "Written for people"** section and Text's two cases of rule 14 are named by the MICS and tested by the suite.

**What was checked along the way:**

- **Money rule 7 against Agreements 17.** It reads cleanly for a person's grant. For a collective's member keys it does not yet: that is question 20.
- **F351** (a grant to oneself) and **F353** (a member key named by its holder's founding signature) are each written in, as they were decided.
- **F295** applies the same way everywhere. A text, Money or Agreements act outside its own format is invalid, and only acts valid in their own format count (Agreements, "Dependencies"). Its reach over cMIP records is question 44.

**What a stranger's reading found.** Each MIR, then all eight together, was read by a subagent with no access to anything else. Its wording slips were fixed. What was left is the questions below. Most are small: a field nobody says the type of, a word with two meanings. A few could change a verdict, and those are marked.

**No MIR was found flawed at its foundations.** The most serious questions are 20 (collectives' member keys in Money), 39 (which keeper records can count) and 24 (what a disputed act under a revoked grant confers).

## Precisely

### The files

| Text | File | From |
| --- | --- | --- |
| Identity draft 15 | `spec/MIR-identity-draft-15.md` | draft 14 |
| Text draft 11 | `spec/MIR-text-draft-11.md` | draft 10 |
| Envelopes draft 11 | `spec/MIR-envelopes-draft-11.md` | draft 10 |
| Money draft 11 | `spec/MIR-money-draft-11.md` | draft 10 |
| Agreements draft 17 | `spec/MIR-agreements-draft-17.md` | draft 16 |
| Development draft 11 | `spec/MIR-development-draft-11.md` | draft 10 |
| MICS v30 | `spec/02-MOR-MICS-v30.md` | v29 |
| Freeze test suite v30 | `spec/03-MOR-freeze-test-suite-v30.md` | v29 |

Each text ends with a single line break and carries no trailing spaces. Whether a frozen text ends with a line break at all is question 12.

### The freeze-ready checklist, as applied

1. **No history.** The following were removed:
   - "(was N)" marks, old-to-new tables and "new in" marks;
   - the words "taken", "reading" and "mechanic" in their review senses;
   - transition notes, version history, approval notes and author quotes.

   Each header is one line. Retired rules and types keep one line each: Envelopes rule 28 and type 2; Agreements types 7, 11, 15 and 21 and terms field 10; Money's retired items.
2. **No finding numbers or review labels.** The useful reasons stay, as italic commentary. Where each rule came from is mapped in `docs/freeze-provenance.md`.
3. **Nothing open.** MICS "Open before freeze" says "Nothing". Its former items are in the questions below; the review rounds it listed are now steps of the suite's freeze procedure. The open items the texts still name in their own words are questions too (1, 2, 3, 8, 26 to 29, 34, 35).
4. **Every cross-reference resolves** by text and rule number. The citations were checked with a script listing each "X rule N" against the target's current heading. No pointer leads to docs, findings, reviews, clients or code. cMIPs and Modules are named by role.
5. **One meaning per word.** See `docs/freeze-ready-glossary.md`. "Lane" appears nowhere. "Unrecorded" became "pending", the MICS's word.
6. **The voice.** Normal text is the protocol, italics are commentary, and requirements use MUST, SHOULD and MAY. The six MIRs and the MICS name no particular use, place or jurisdiction; the app names Money carried were removed. The suite's scenarios keep their titles and test identities (question 46).

### Wording fixes taken

**In each text**, the fixes are listed in its commit message and, item by item, in its stranger's file (`docs/freeze-ready-strangers/`, items marked **[fixed]**). Beyond the strangers' lists:

- **Identity:**
  - history sentences removed;
  - rule 34's pointer now reads "Agreements: the keeper record, type 2, and Agreements rules 41 and 42";
  - the scoped-key entry includes member keys;
  - the disputed status's commentary names Agreements rule 76;
  - a freeze-scenario line now names the component where no step tests it.
- **Envelopes:**
  - rule 28 and type 2 are one retired line each;
  - code comments cite rules;
  - Development rule 12 corrected to 22;
  - two freeze-scenario lines corrected against the suite.
- **Money:**
  - the app names and "lane" removed;
  - Identity rules 16, "rule 7" and 22a corrected to 34, 28 and 4;
  - Development rules 7, 8 and 17 corrected to 8, 9 and 15;
  - the split service's grant key names Agreements rule 16's layer-share exception;
  - "past its terms" points to Agreements rule 33.
- **Agreements:**
  - cross-references corrected ("Parameters", rule 60 for prices, rule 73 for a grant key signing no grant, the closing's receipt reading, the receipt's field 5 and the claim's field 4, terms field 6 for the time reference, the tasks table's heading);
  - change language removed ("unchanged", "no new field", "for now", "as before", "were refused");
  - quotes written as plain commentary;
  - the concurrency rule's entry made a retired line;
  - a doubled comma fixed.
- **Development:**
  - task 4's bound aligned with Text's format task;
  - extension approvals cite Agreements rule 60;
  - rule 13's example split sums to the sale (the publisher 1.80);
  - a freeze-scenario line names the component.
- **MICS:**
  - every rule citation converted to the freeze-ready numbers;
  - the text act's two `objects` exceptions;
  - the format bound as Text states it;
  - keepers and time as decided;
  - areas without lanes, with member keys;
  - the revocation bullet;
  - "MOR 1's core has none" (MIPs);
  - the split service named as no judge;
  - "Four design rules" in place of a review label;
  - a deal carrying no holders' rule "since a deal has no line";
  - the glossary's Keeper, Keeper record, Disputed and Grant rows.
- **Suite:**
  - every citation converted to the freeze-ready numbers;
  - build status, test names and code paths removed (run or reasoned belongs to the freeze report);
  - lanes become areas;
  - keepers order, anchors time;
  - the revoked grant's disputed acts;
  - the import act retired;
  - new component lines for Text rule 14's two cases, keeper records, a revoked grant's acts, a grant to oneself, a member key, and a Module under a MIR with no cMIP;
  - step 3.7o's verdicts aligned with step 3.7m and Agreements rule 71 (question 48);
  - details in `docs/freeze-ready-suite-notes.md`.

### The questions

Each question is in plain words, followed by its options, a lean and a cost. "Verdict" marks the questions on which a verifier's answer could change; the rest are wording or format gaps, where the text says too little but no verdict turns on the answer alone.

**Formats still open in the texts**

1. **How a home is queried.** The texts still mark open: the request and response formats, how a client finds the deliveries addressed to it (Envelopes), and the encoding of inclusion and consistency proofs. *Options:* (a) a home transport cMIP, the core naming only what a verifier checks; (b) formats in Identity. *Lean:* (a). These are transport, and a verifier checks what it is given. *Cost:* a C verifier reads proofs from a cMIP's encoding.
2. **The pinned Unicode version.** Text says "Unicode 17.0 as of this draft". *Options:* pin 17.0, or the latest at the freeze. *Lean:* the latest stable release at the freeze, written as a number with no "as of". *Cost:* none; it must be one number.
3. **The unit specification format** (Money) is still marked open. *Options:* (a) a Development kind with its fields, now; (b) a cMIP. *Lean:* (a), since units are specifications and Money's rules name them. *Cost:* one more kind to freeze.
8. **The signature-scheme specification format** (Development, "still open"). Identity's schemes named by hash rest on it. *Lean:* write it as a kind with its fields before freezing. *Cost:* the technical review the MICS listed.
34. **Development's three items "still open":** the CDDL conventions for type definitions, the signature-scheme format (question 8), and how the MIRs are published so their hashes are fixed. Rule 26 partly answers the last. *Lean:* the first two written before the freeze, the third closed by question 17.

**Identity**

4. **An act under a pending rotation** (verdict). Rule 28 says pending; everyday check 2 needs a binding that counts; contested and unknown positions; an escape endorsement bound to a chain signature. *Lean:* an act bound to a pending rotation is pending, never valid, until the rotation counts. *Cost:* none beyond a stated rule.
5. **Dishonesty: "and" or "or"** (verdict). Rule 45 and "Conflicting receipts", step 3, differ, as do rule 44's "receipts that count" and step 1's "pass receipt check 1". *Lean:* both receipts must pass receipt check 1 and name genuine rotations at one position, and either proves the home dishonest. *Cost:* none.
6. **Re-homed without audit: two lists** of what may not rely on it, one after rule 35 and one in "Re-homed without audit". *Lean:* one list, the longer. *Cost:* none (wording, once confirmed).
7. **A keeper's record and its keeper's rotation** (verdict). Identity's evidence rule counts a record only while its signer's chain keeps it. Agreements' line keeps a placed record's effect whatever the keeper's later rotation disowned. *Lean:* Identity's rule, with Agreements' exception only where a collective's line placed the record, as both texts say for receipts. *Cost:* a keeper's rotation can unmake an unplaced record's effect.

**Text**

9. **Text rule 14 at a Text-only verifier** (verdict). It cannot tell a collective or a grant key apart, so what does it answer? *Lean:* unknown for a text carrying one object of either shape, invalid for any other `objects`. *Cost:* a Text-only client shows such texts unknown.
10. **Rule 14's two cases overlap** (a collective's grant key; one object against joining heads; "invalid" against Agreements' "counts for nothing"; a holder's member key's binding). *Lean:* the grant-key case decides where the key is a grant key, a member key's included. *Cost:* none.
11. **Which strings are "text fields"** under a specification the verifier does not implement. *Lean:* only the fields the core's own types define; a cMIP's fields are its own business. *Cost:* none.

**Across texts**

12. **The frozen files' final line break.** Development's root check refuses a text ending with a line break, and every spec file in the repository ends with one. *Options:* (a) the texts end without one; (b) the rule allows exactly one. *Lean:* (b). *Cost:* none.
13. **Format gaps the strangers found** (one grouped question):
   - Identity's escape endorsement CDDL;
   - the `objects` entries of acts that "name X in objects";
   - the inside fields Identity acts carry;
   - rotation checks on payload position and field 11;
   - the log index base and key lengths;
   - routes' double version 1;
   - Development's content format (question 38).

   The lists are in `docs/freeze-ready-strangers/`. *Lean:* each written as a field type before the freeze. *Cost:* a technical pass.
14. **Deterministic CBOR's floats, tags and simple values.** Identity and Envelopes describe them differently. *Lean:* said once, in Identity's encoding section: no floats, no tags, no simple values but true, false and null.
15. **Time reference, one meaning.** It is a clock Module under the anchoring cMIP (Envelopes) or a cMIP filling task 10 (Development, Agreements). *Lean:* "time reference" only for task 10; Envelopes says "clock". *Cost:* none (wording, once confirmed).
16. **The running summary: inclusive or exclusive** (verdict). Envelopes' CDDL comment, its Part three, and Identity's kept tip each say it differently. *Lean:* as the published vector computes it, written once.
17. **How a MIR's spec hash is computed.** Development rule 26 and `tagged_hash("MOR/spec", content)` differ, and the content's field set is unstated. *Lean:* the hash of the deterministic CBOR content map `{0 => 4, 9 => text}`, with no other field, and "the hash of the frozen text" in Identity reworded to say so. *Cost:* the six hashes fixed by one rule.
18. **"Everyday act" has no one definition.** *Lean:* every act other than genesis, a rotation and a chain signature.
19. **Freeze-scenario numbers against the suite's.** These were checked at v30: Envelopes' and Development's lines that named a scenario with no such step now name the component. *Remaining:* Development's extension line "3, 8" rests on scenario 3's adoption steps.

**Money**

20. **Money rule 7 and a collective's member keys** (verdict). This is the check the prompt asked for, and it does not yet read cleanly with Agreements rules 60, 73, 74 and 80:
   - member keys are listed for payee pointers only;
   - a collective's own-key receipt against rule 60's threshold;
   - the split service's grant naming no area, against rule 74;
   - "such a pointer";
   - which area counts;
   - a replaced member key;
   - rule 80 for a person's grant and for a member key.

   *Options:* (a) Money rule 7 lists every Money act a member key may sign (pointer, receipt, claim, obligation, release), each judged by Agreements under the area reaching Money; (b) pointers only, as now. *Lean:* (a), the principle F358 gave ("money areas should be able to do it"). *Cost:* a Money-only client shows more of a collective's acts unknown.
21. **Refunds paid to a claim's refund rail, against Money rule 4.** *Lean:* a refund rail the payer names counts as the payer's own naming, as Agreements rule 11 already bounds it.
22. **A collective's pointer left outside a fork** (Money rule 4 cites Agreements rule 91, which does not say it). *Lean:* it counts for payments made before the fork's line, and not after.
23. **Money rule 12's wording.** Read literally, a receipt and a claim of one payment need a batch. *Lean:* wording, "a batch only where one proof covers several payments".

**Agreements**

24. **What an act disputed under rule 76 confers** (verdict). Does it bind, as rule 80's "binds" asks? Must a fork hand it out? Does it block a closing? The tie rule, rule 79, points 2 and 5 and two freeze scenarios state void without the exception. *Options:* (a) as a rotation's disputed act: it confers nothing on an agreement chain (rule 6) and is shown; Money counts it as it counts a disputed receipt; (b) it binds the grantor. *Lean:* (a), with the other passages saying "void or disputed". *Cost:* a counterparty who relied on a revoked agent's act holds a visible dispute, not a debt.
25. **The keeper record's details, written in for approval:**
   - one record per act;
   - public;
   - chained by `prev` in one sequence;
   - its named signer must match the act's;
   - records of two sequences are not ordered against each other.

   *Open within it:* an operator with two devices has two sequences. *Lean:* a keeper keeps one sequence for its records, written as a MUST.
26. **The readings Agreements still marks "to confirm":**
   - rule 13, twice, and its list;
   - rule 14;
   - rule 93;
   - "Forked from";
   - the release rule;
   - the split's delivery;
   - the split service's grant;
   - the resignation;
   - the fork's two-step naming;
   - the contest's field numbers.

   *Lean:* each confirmed as written, the marks removed.
27. **Draft 10's open questions the texts still carry:**
   - QK2: what a seller still held across versions;
   - QK4: a transfer and a later payment (the text states the as-built answer);
   - QH3: a relay's delivery record's object;
   - QH4: a resignation and the version registering it;
   - QH5: a notice to a one-time key, where "public notice" and "cannot be reached" are both in the text;
   - QH6: a pointer inside a fork's history that the fork left out;
   - QJ3: `[1, work]` in a standing offer, now "not defined".

   *Lean:* each as the text now reads.
28. **The general contest's format for other acts** (kept as "Still open"). *Lean:* the contest act's format as written covers every act; the "still open" line removed.
29. **Rule 70's last paragraph.** Money through a split service under a grant tied to no area is "still to be checked". *Lean:* it flows while the grant stands, as any grant does.
30. **A closing's "holds nothing"** does not see stakes sold by transfer outside what a verifier holds. It is a stated cost as written. *Lean:* keep the stated cost.
31. *(Same as question 7.)*
32. *(Same as question 20.)*
33. **Standing for a request to a judge**, written "a party who signed the version". *Lean:* confirm.
39. **Rule 42's third condition** (verdict). A keeper record counts only from a keeper named by an agreement the recorded act's `objects` names. Rotations, founding terms, Money receipts (their claim is in field 9), work claims and posts name none, so their records could never count, though rules 7, 40 and 41 rely on them. *Options:* (a) the keeper must be named by an agreement the act names in `objects`, in a Money act's claim or agreement field, or that names the act's signer as a party; (b) as written. *Lean:* (a). *Cost:* one wider sentence.
40. **Several keepers** (rule 38): the `keepers` format's codes against "any one, a threshold, or all", and how "recorded before the rotation" combines under a threshold. *Lean:* each keeper's record judged alone, and the agreement's rule counting how many keepers' records stand before their own record of the rotation.
41. **An anchor of the act itself** (rule 33). An anchor shows an act existed by a point. How an anchor of the act itself shows a deadline missed is not stated; a keeper's anchored sequence shows it by the act's absence. *Options:* (a) only an anchored keeper's sequence shows a deadline missed; (b) also an act that names a later anchor of its own. *Lean:* (a), with "of the act itself" kept for showing a deadline met. *Cost:* none. This was decided in F358's words, so it is put, not changed.
42. **A deal with no keeper.** A declaration's line, and every signature act "counting as made after it", against rule 47's "relied on stays complete". *Lean:* in a deal with no keeper, the declaration decides only what no relied-on version holds.
43. **Member keys in detail** (with question 20):
   - how a member key is removed;
   - which areas count: those the naming version gives, or those in force;
   - when the key counts, against rule 72's record;
   - the agreement in force for its acts;
   - a forked line;
   - the member's own rotation disowning the installing signature;
   - a grant to oneself and type 1 acceptance.

   *Lean:* the areas in force for the act, from the moment a record or rotation puts the naming version in force, ending with a later version naming another key or with the holder's departure.
44. **"Only acts valid in their own format count"** against delivery, use and metric records (cMIP acts), and transfer field 3 against a valid over-sale. *Lean:* the rule reaches acts of the core's types; a cMIP's record counts where the verifier reads its format, as the text says; transfer field 3's bound is a status rule, not a format one.
45. **Agreements' internal contradictions** (one grouped question):
   - abandonment outcomes against a holder with a named stake successor, stated three ways;
   - areas over Identity;
   - judicial tasks with or without task 14;
   - fork completeness and non-member holders' chain signatures;
   - record field 3 and take-ups;
   - the field tiers table missing fields 26 and 27.

   *Lean:*
   - the empty list (the stake passes by succession);
   - genesis and rotations outside any area;
   - task 14 judicial, as the Development table says;
   - the chain signatures checked;
   - take-ups listed;
   - fields 26 and 27 placed.

**Development**

35. **Fields 11 and 13 are "a rail Module's (a reading, to confirm)"**: on any other kind they make the specification no specification. *Lean:* confirm.
36. **Task 4's bound** in the tasks table now points to Text's task. *Lean:* confirm (wording).
37. **Normative text in italics:**
   - several lines;
   - rule 21, which has no normal text at all;
   - Part three, called "for reference".

   Separately, "unknown, never invalid" for an act naming a malformed specification sits against Envelopes rule 30's "invalid beats unknown". *Lean:* move the rules into normal text, and say "unknown, unless a rule the verifier can apply shows it invalid".
38. **Development's content format:**
   - unknown or duplicate keys;
   - which kinds may carry fields 1, 2, 5, 7, 10 and 12;
   - field 2 "required" yet undetectable from bytes;
   - field 6's hash and binary.

   *Lean:* one paragraph of decoding rules, as Envelopes has for acts.

**The suite and the voice**

46. **Scenario titles name uses** ("a feature film", "a nym journalist", "a democracy round", "a streaming service"), and steps name rails (Lightning, on-chain, a stablecoin). The core names no particular use. *Options:* (a) the suite is the test of the core, not the core, and keeps them; (b) neutral titles ("A deal, end to end", "A self-hosted identity under attack"). *Lean:* (a); the scenario numbers are cited by the MIRs either way. *Cost:* none.
47. **Step 1.7a's "(open)" clause was removed**, since the same step decides that case later and Agreements rule 47 says "any judge speaks once per fork". *Lean:* confirm.
48. **Step 3.7o's emptied-area story** contradicted step 3.7m and Agreements rule 71 ("undetermined", "once imported"). It was rewritten to rule 71's verdicts: void, nothing undetermined, a reinstated grant taking nothing on. *Lean:* confirm; the MIR decides.
49. **Step 3.8b: "a clone placing the successor elsewhere than in the dead member's place is refused as unsettled".** Agreements 17 does not say what such a clone is. *Options:* (a) invalid when marked with the plan alone, as a clone that reorders the other parties; (b) as written. *Lean:* (a).
50. **The MICS's opening ("The test")**, for Nobody, allegedly's own reading of the freeze-ready wording, as "Open before freeze" asked.

**Words used two ways (one question).** The strangers' lists include:

- the verdict words in their display uses;
- record;
- line;
- chain;
- layer;
- specification;
- kind;
- task;
- extension;
- adoption against implement;
- holder;
- owner.

The glossary resolves those that are wording. *Lean:* the rest kept as each text defines them in place, since none was found where a verdict turns on the word alone, except "implement" against "adopt" (question 37) and "time reference" (question 15).

### The stranger's readings

- Identity 15: `docs/freeze-ready-strangers/identity-15.md`
- Text 11: `docs/freeze-ready-strangers/text-11.md`
- Envelopes 11: `docs/freeze-ready-strangers/envelopes-11.md`
- Money 11: `docs/freeze-ready-strangers/money-11.md`
- Agreements 17: `docs/freeze-ready-strangers/agreements-17.md`
- Development 11: `docs/freeze-ready-strangers/development-11.md`
- All eight together: `docs/freeze-ready-strangers/all-eight.md`

Each file condenses the reading and marks what was done with each item: fixed, a question, a gap (listed for the technical pass), as designed, or fixed in another text.

### The provenance map and the glossary

- `docs/freeze-provenance.md`: each rule or section, with the findings that shaped it, built from the drafts just before the freeze-ready ones, plus the rows added where a freeze-ready draft wrote in a decision.
- `docs/freeze-ready-glossary.md`: one meaning per word, and the words checked.
- `docs/freeze-ready-progress.md`: the session's progress file.
- `docs/freeze-ready-suite-notes.md`: the suite's cleaning notes, part by part.
- `docs/freeze-ready-agreements-notes.md`: notes kept while writing Agreements 17.

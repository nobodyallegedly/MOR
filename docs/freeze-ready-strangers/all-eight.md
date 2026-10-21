# Stranger's reading: all eight together

*A subagent read the eight freeze-ready texts together, with access to nothing else, looking for what shows only across them. Its lists, condensed; what the session did in brackets: **[fixed]**, **[Q n]** (a question in the report), **[gap]**, **[as designed]**.*

## 1. Contradictions

- Money "never depends on Development" against a receipt's validity resting on a rail Module's fields 5, 11 and 13 and on "no specification". [Q 51]
- MICS "Open before freeze: Nothing" against open items in Identity (home queries), Envelopes (finding deliveries), Money (unit format), Development (CDDL conventions, scheme format, MIR publication), Agreements (contest format, "still to be checked") and the suite's freeze procedure. [Q 1, 3, 8, 28, 29, 34; the MICS's line now means nothing is open that is not a question for the approval]
- Judicial tasks: three or four (task 14). [Q 45]
- An area over the Identity layer. [Q 45]
- "Time reference" three ways, and an anchoring cMIP named as the time reference against the judges' exclusion. [Q 15]
- A notice to a one-time key. [Q 27 (QH5)]
- Suite pass criteria against steps 3.9 and 3.9g (a late debt owed by every successor; a stray payment owed to the successors) and 3.7am's description. [fixed]
- Suite step 2.5 running a verification rule that cannot exist in MOR 1. [fixed: reasoned, as step 8.2]
- An act in a format the MIR leaves open: unknown (Agreements) against invalid (Envelopes rule 30). [Q 28]
- "Disputed" a display (MICS) and a status (Identity rule 34, MICS glossary), with other sources of "shown as a dispute" (Money, Agreements rules 6 and 47, Development rule 3). [Q 24 and the term question]
- MICS "require a backed-up signing seed" against Identity's SHOULD. [fixed]
- MICS's split-service key limit without the layer-share exception. [fixed]
- "Unrecorded" left in Agreements' freeze scenarios. [fixed: "pending"; one "unrecorded" signature reworded]

## 2. Cross-references

Every rule citation in the MICS resolves; about 160 others checked. These did not:
- Suite: scenario "17" (there are eight); vows filed under scenario 6. [fixed: the vow step is 1.9f]
- Agreements' push-payment wrong-receipt line filed under scenario 1. [fixed: 3]
- Discharge filed under scenario 4, which has no obligation (Money's freeze line and the suite). [fixed: 1]
- Agreements' "(scope)" naming no section. [gap]
- Identity's "(rule 84)" without a MIR name. [fixed: Agreements rule 84]
- Identity's "(rule 55)" beside "found the same acts at the signer's homes". [gap]
- Development's (Money, "Unit") pointing to a glossary bullet. [gap]
- Agreements and the suite pointing into the relay transport cMIP by section and type. [as designed: named by role]
- Test vectors and the pinned Unicode version outside the texts. [Q 2, Q 16]

## 3. Terms used two ways

line; keeper (release field 4, "a keeper or custodian role"); record; grant key and member key (the MICS glossary has no member key) [gap: the glossary in `docs/freeze-ready-glossary.md` has it]; contested (Money's contested pointers and Envelopes' contested encryption keys beside Identity's four); pending (a vow sale's); area; everyday act [Q 18]. [The term question]

## 4. History, labels, names and particulars

- "Reading, to confirm" and "still to be checked" in Agreements and Development. [Q 26, 29, 35]
- MICS "(wording)" and "Reviewers should try to break it". [as designed: "wording" names a display word; the reviewers' line is commentary]
- Every header "freeze-ready, for Nobody, allegedly, to approve", which would enter the frozen hashes. [Q 52]
- Text "Unicode 17.0 as of this draft". [Q 2]
- Identity "written before this section keeps working". [fixed]
- Agreements' past-tense reasoning ("widened from access to bytes", "every time check tried", "every patch that asked", "Set aside:", "stated here, not in Money", field 25's former relays). [kept: reasoning in italics; listed]
- MICS "as before" and "unchanged". [fixed]
- Development "open to the first wave". [gap]
- A person's name in Development's example ("Lea"). [fixed: "the singer"]
- Named rails and clocks in the MIRs (Lightning, Bitcoin, ecash, stablecoin, bank transfers, regtest; Money rule 29's Bitcoin clock and "within the hour"; FROST; "home.example.org"; "the journalist"). [Q 53]
- External standards (RFCs, BIPs, FIPS, RISC-V, Unicode, the X-Wing draft "fixed by hash at the freeze", with no hash given). [Q 54]

## 5. What a C implementer still cannot decide

The six MIR hashes [Q 17]; rail Module well-formedness resting on another specification [Q 51]; units [Q 3]; the X-Wing version and the running-summary vectors [Q 16, 54]; the area kind `[0, 0]`, task 14's exclusivity, what field 6 names, a notice to a bare key [Q 45, 15, 27]; contests of other acts [Q 28]; which acts carry `prev`, position and summary outside Identity [Q 18]; how a task-10 answer and a task-11 anchor relate under rule 33 [Q 15, 41].

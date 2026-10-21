# Stranger's reading: Money draft 11

*A subagent read `spec/MIR-money-draft-11.md` with access only to the core texts (Agreements as draft 16). Its lists, condensed; what the session did in brackets: **[fixed]**, **[Q]**, **[gap]**, **[as designed]**, **[other text]**.*

## 1. Rules it could not understand or check

**Rule 7 against Agreements rules 60, 73 and 80** (the decision "Money rule 7 as built" asked this check; the reading found it does not yet read cleanly). [Q: Money rule 7 and a collective's member keys]
- Member keys are listed for a collective's payee pointer only, never for its receipts, claims, obligations or releases, while Agreements rule 60 makes a member-key act the collective's own act and that holder's signature.
- A collective's receipt signed with its own key, where an area reaches Money: rule 60 counts it only with the area holders' signature acts (suite step 3.7g says so); rule 7 does not.
- A collective's split service's grant names no area, and Agreements rule 74 lets such a grant reach only acts no area reaches; then in a collective with a Money area the service could sign no receipt, against rule 7.
- "Such a pointer is judged as scoped": only member-key pointers, or every collective pointer? Either reading leaves something unsaid (a pointer under the collective's own key escaping the area's threshold; or the stated cost being wrong).
- "Its limits judged as for every act of the area (a pointer moves no amount)" against rule 60's unknown where the limits cMIP is not held.
- Which area must meet its threshold where several reach type 0.
- Whether a pointer signed with a member key later replaced still counts in the pointer chain.
- "The other holders signing it with their own member keys": with what act (a signature act), and rule 60 also counts holders' identity keys.
- A pointer signed with a person's grant key: invalid by "signed with that identity's own key", against the suite's "beyond its reach and not backed".
- Rule 2's "a flow pointer is changed with the signing key" against member-key pointers.
- Rule 80's procedure is written for collectives; a person's grant key has none; a member key's binding is a signature act, not a grant.
- The split-service grant key's limits omit the layer-share exception of Agreements rule 16. [fixed: Money names the exception]
- "(Agreements rule 60)" for the key a holder's signature names; the text is in rule 73. [fixed]

**Other rules**
- Rule 3 "every payment not yet shown as made" against rule 29. [gap]
- A refund to a refund rail in a unit the payer's vault does not cover. [gap]
- Rule 4 against a refund paid to a claim's refund rail (not in any pointer or vault). [Q: refunds and rule 4]
- Rule 4 "by rules 1 and 17": rule 1 keeps only the latest pointer, rule 17 older versions. [as designed: rule 1 decides the chain, rule 17 which version counts for a debt]
- Fresh addresses derived from a vault entry: the derivation input is in no format. [gap: the rail Module's]
- A collective's pointer left outside a fork: "payments already made" has no criterion; Agreements rule 91 does not say it. [Q]
- "Redirected" and "closed by clone" are not Agreements terms. [gap]
- Rule 8's "published rule" when no rule is published in MOR 1. [as designed: Development's machine profile; a C verifier implements rail Modules' texts]
- Formats missing: the trusted party's confirmation; the batch's hash; the receiver's visibility dial; a payer's delivery key; the rail fee actually paid; anchors. [gap]
- "Open question on the receiver" against "dispute". [gap]
- Rule 12 read literally makes every receipt-and-claim pair need a batch. [Q: rule 12's wording]
- Discharge "ending at the creditor's payee pointer" against payments to the vault. [gap]
- "Unsigned" state of a signed obligation (it means the agreement it arises from is unsigned). [as designed]
- Stake transfers: receipt field 5 does not list a transfer; a refund claim naming "the payment refunded" in field 4. [gap]
- Two receipt-less hops in a row cannot be chained. [gap]
- "Where the clock's Module reads the rail's own proof as the payment's anchor" cannot be read from a specification field. [gap]
- Unmarked client MUSTs (check the vault, read the clock, disclose hops). [gap]
- "Pending" (Money) against "unrecorded" (Agreements). [other text: Agreements now says pending]
- A lone seller's standing offer names no claim, against "a payment for a standing offer names a claim". [as designed: rule 18 says the exception]

## 2. Terms used two ways

valid, invalid, unknown (a rail's answer and an act's verdict; "counts for nothing"); pending; disputed; void; receipt (settlement, home); claim (payment claim, Agreements claim, a creditor's statement); obligation (the act, and any money owed); pointer (payee pointer, designated pointer, the pointer check); clock; anchor (an anchoring proof, a rail proof read as anchor); time reference (a clock Module under anchoring, against the time-reference task); lock (lock change, and encryption's lock); grant key and member key; lane (Agreements' two senses); area; batch; route; hop; line. [In the glossary and the report's term question; "lane" removed from every text.]

## 3. Cross-references

- Rule 4 "(Agreements rule 91)" for a pointer left outside a fork. [Q, with the item above]
- "Past its terms (Agreements rule 11)". [fixed: rule 33]
- "(Identity, the receipt checks, and rule 28)" read as Money rule 28. [fixed]
- Concrete Modules named (the on-chain rail, the Bitcoin clock Module). [as designed: examples, named by role]
- The tag "MOR/finance/anonymous-claim" carries the layer's old name. [as designed: wire format, unchanged]
- Suite v29 still cites Money's old numbers. [suite: fixed in v30]

## 4. History left

"F181's cost" [fixed]; "as it always has" [fixed]; "Moved to Agreements" [fixed: "Covered by Agreements"]; "Not chosen: …" [kept: reasoning]; "Agreements' type 21 is retired" [as designed].

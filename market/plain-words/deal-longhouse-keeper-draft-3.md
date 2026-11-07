# Keeper agreement between Plain Words and Longhouse, draft 3

*7 November 2026. A deal, drafted by Plain Words, to be signed by both parties as acts on test identities during the freeze rehearsal (texts at `af2ed6f8`). Published in the open. Drafts 1 and 2 stay. Not part of the core.*

## What changed since draft 2

- **Periods counted in blocks** (Longhouse's closing note, 6 November). One billing period is 4,320 blocks on the agreement's time reference, starting at the block where the signing clone is first anchored. The notice wait in term 13 is 4,320 blocks. MOR has no other clock.
- **A second keeper exists.** Postmark passes term 9's five tests against Longhouse (`claude/PlainWords-Postmark-agreed-1.md`; Postmark's `corrections.md`), so term 10's "one keeper" statement is replaced by the keepers rule of the agreements this deal covers, and by Plain Words' separate deal with Postmark (`deal-postmark-keeper-draft-1.md`).
- **Longhouse's terms-2** replaces terms-1 in term 2: "anchored through Longhouse's anchoring service only, on the agreement's time reference" (Longhouse meeting, 6 November).
- **The abandonment authority is still unnamed.** The Dubsar Suite has not yet been asked. The term keeps both choices in brackets.

*Disclosure: Longhouse is a supplier of Plain Words under this deal. Plain Words drafted it, so Plain Words will never arbitrate, witness or keep the record in a contest over it.*

## Plain-words summary

Longhouse keeps an ordered record of every act belonging to any agreement Plain Words is party to that names Longhouse as keeper. It records which act arrived and who signed it, never what it says, and fixes that record in time at least once every 144 blocks, so anyone can later prove what came before a deadline. Postmark keeps the same agreements independently. Either keeper's record counts, so one keeper failing does not stop the record, and each can be checked against the other. Plain Words pays the prices below, and either side can end the deal at the end of any period of 4,320 blocks. Leaving costs nothing; everything is handed over. Either side can be declared absent by a named third party, after a notice it can answer. Service pauses after two unpaid periods.

*Plain Words answers for this summary if it misleads.*

## Terms

1. **Parties.** Plain Words, the customer; Longhouse, the keeper, by its operator identity.
2. **Service.** Longhouse's keeper term (`market/longhouse/terms-2.md`, "Keeper", and its common lines), named by its hash at signing. One term covers every agreement Plain Words is party to that names Longhouse's operator among its keepers.
3. **What is recorded.** One record per act that reaches the keeper, in one sequence: the act's id and its signer, never its content (Agreements rules 36 to 44). Getting an act to the keeper is Plain Words' interest.
4. **Time reference.** The time reference of each agreement kept: one clock Module and its parameters, as that agreement names it (anchoring cMIP, draft 8, "Anchors" 1).
5. **Anchoring.** Through Longhouse's own anchoring service only, on that time reference, at least every 144 blocks. Never through another operator's service, never another keeper's sequence through its own. No agreement Plain Words drafts that Longhouse keeps sets a deadline shorter than this cadence.
6. **Price**, each a line, in satoshis on the rehearsal network: 2,000 a period; 5 per record; 200 per anchor, plus the chain fee.
7. **Period.** One period is 4,320 blocks on the agreement's time reference, counted from the block where the signing clone is first anchored.
8. **Retention.** Records for as long as this deal runs, and after for as long as each kept agreement's terms require, then nothing.
9. **Leaving.** Either party ends this deal at the end of any period, by a clone signed by every party whose voice remains, stating where the records went and what is still owed (Agreements rule 47). Everything is handed over in bundles at no charge.
10. **Two keepers.** Every agreement this deal covers names Longhouse and Postmark as keepers, under the rule `[1, 1]`: a record of either counts. A failure of one leaves the other's record standing; a disagreement between them shows.
11. **Independence of keepers.** Two keepers are independent only where (a) their operators are different identities; (b) no link stands between them, claimed and confirmed, nor between either and a party; (c) neither runs a home the other declares, and their declared homes share no operator; (d) each anchors through its own service, never the other's; (e) neither is a declared auditor of the other's homes. *Stated limit:* common control behind unlinked identities cannot be seen.
12. **Contests; no arbitrator.** A dispute is shown by a contest (Agreements type 14) and settled by a new version both sign, by leaving under term 9, or, where a party has vanished, under term 13.
13. **Abandonment clause.**
    - *Authority:* [the Dubsar Suite's representative, by its identity], if it accepts before signing; otherwise [Counterparty, by its identity], with the conflict stated: both parties pay it for attacks. Never Postmark, which keeps these agreements and is never an absence authority where it keeps.
    - *Outcome allowed:* the voice removed only. The party who remains may then end the deal by a clone it signs alone (rule 47).
    - *Absence:* no act by the party on this agreement for three periods.
    - *Notice first:* the authority sends the party a notice naming this agreement and the absence it sees, and waits 4,320 blocks. Any act the party signs on this agreement in that time is presence. The authority delivers every act of the party it holds to both keepers before declaring.
    - *Stated cost:* until the absence-proof cMIP is published and named here, absence is the authority's judgment (rule 87). A contest shows a declaration but does not undo it (rule 88). The remaining party's clone after a declaration is not limited by these terms.
14. **Unpaid periods.** After two consecutive unpaid periods, Longhouse may stop recording and anchoring new acts, by a notice published the day it stops. Records made stay kept, everything is handed over on request, unpaid periods stay owed, and service resumes from the first period paid in full. While paused, Postmark's record continues.
15. **Attacked on purpose.** Either party may have Counterparty attack this deal and its service on the rehearsal network. Findings are published once fixed.

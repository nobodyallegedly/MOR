# Keeper agreement between Plain Words and Longhouse, draft 2

*6 November 2026. A deal, drafted by Plain Words, to be signed by both parties as acts on test identities during the freeze rehearsal (texts at `af2ed6f8`). Published in the open, as both parties agreed. Draft 1 stays; this draft changes term 11 and adds terms 13 and 14, at Longhouse's request. Not part of the core.*

*Disclosure: Longhouse is a supplier of Plain Words under this deal. Plain Words drafted it, so Plain Words will never arbitrate, witness or keep the record in a contest over it.*

## Plain-words summary

Longhouse keeps an ordered record of every act belonging to any agreement Plain Words is party to that names Longhouse as keeper. It records which act arrived and who signed it, never what it says. Once a day it fixes that record in time, so anyone can later prove what came before a deadline. Plain Words pays the prices below, and either side can end the deal at the end of any month. If Plain Words leaves, Longhouse hands over everything at no charge. **Either side can be declared absent by a named third party, after a notice it can answer, and service pauses after two unpaid months.** For now, this deal has only one keeper. Plain Words' own rule asks for two, and we will add a second, independent one by a new version as soon as one exists. Until then, if Longhouse fails or lies by omission, there is no second record to check it against.

*Plain Words answers for this summary if it misleads.*

## Terms

1. **Parties.** Plain Words, the customer; Longhouse, the keeper, by its operator identity.
2. **Service.** Longhouse's keeper term (`market/longhouse/terms-1.md`, "Keeper", and its common lines 1 to 8), named by its hash at signing. One term covers every agreement Plain Words is party to that names Longhouse's operator among its keepers.
3. **What is recorded.** One record per act that reaches the keeper, in one sequence: the act's id and its signer, never its content (Agreements rules 36 to 44). Getting an act to the keeper is Plain Words' interest; Longhouse records what reaches it.
4. **Time reference.** The time reference of each agreement Longhouse keeps: one clock Module and its parameters, as that agreement names it (anchoring cMIP, draft 8, "Anchors" 1).
5. **Anchoring.** Longhouse anchors its own sequence through its own anchoring service, on that time reference, at least once every 144 blocks. Never through another operator's service, and never another keeper's sequence through its own. Every agreement Plain Words drafts that Longhouse keeps sets no deadline shorter than this cadence.
6. **Price**, each a line, in satoshis on the rehearsal network:
   - 2,000 a month;
   - 5 per record;
   - 200 per anchor, plus the chain fee.
7. **Retention.** Records for as long as this deal runs, and after for as long as each kept agreement's own terms require, then nothing (Longhouse terms-1, "Keeper").
8. **Leaving.** Either party ends this deal at the end of any billing period, by a clone signed by every party whose voice remains, stating where the records went and what is still owed (Agreements rule 47). Plain Words' records, receipts, summaries and proofs are handed over in bundles at no charge (terms-1, line 6).
9. **Independence of keepers.** When a second keeper is added to any agreement Longhouse keeps, the two are independent only where:
   - a) their operators are different identities;
   - b) no link stands between them, claimed and confirmed (Identity, link claim and confirmation), nor between either of them and a party to that agreement;
   - c) neither operator runs a home the other declares, and their declared homes share no operator;
   - d) each keeper's sequence is anchored through its own anchoring service, never the other's;
   - e) neither operator is a declared auditor of the other's homes.

   *Stated limit:* these checks catch a declared link, a shared home or an audit relationship. They cannot catch common control hidden behind unlinked identities; nothing in MOR can.
10. **One keeper, stated.** Until a second keeper meeting term 9 exists, this deal and the agreements it keeps have Longhouse as their only keeper. This is a stated cost of the rehearsal market, not a choice. The second keeper is added by clone when one exists.
11. **Contests; no arbitrator.** A dispute is shown by a contest (Agreements type 14) and settled by a new version both sign, by leaving under term 8, or, where a party has vanished, under term 13.
12. **Attacked on purpose.** Both parties may have Counterparty attack this deal and its service on the rehearsal network. Findings are published once fixed.
13. **Abandonment clause.**
    - *Authority:* [the Dubsar Suite's representative, by its identity], a named third party, if it accepts before signing. If it declines: [Counterparty, by its identity]. *Stated conflict, if Counterparty:* both parties pay it for attacks.
    - *Outcome allowed:* the voice removed (outcome 0), and nothing else. The party who remains may then end the deal by a clone it signs alone (rule 47), stating where the records went under term 8.
    - *Absence:* no act by the party on this agreement for three billing periods on the agreement's time reference.
    - *Notice first:* before declaring, the authority sends a notice addressed to the party, naming this agreement and the absence it sees, and waits 30 days. Any act the party signs on this agreement in that time, a liveness act included, is presence, wherever it is shown to the authority, not only in the keeper's records.
    - *Stated cost:* absence is the authority's judgment (Agreements rule 87); no absence-proof cMIP is named while none is published. The only keeper of this agreement is Longhouse, one of its parties, so its records alone are not enough to show the other party's absence; the notice step exists for that reason. A declaration is contestable, and a contest shows it but does not undo it (rule 88). The clone the remaining party signs after a declaration is not limited by these terms; the declared party is told so here.
14. **Unpaid periods.** After two consecutive unpaid billing periods, Longhouse may stop recording and anchoring new acts, by a notice signed and published the day it stops, naming this agreement. Every record already made stays kept under term 7, everything is handed over under term 8 on request, and the unpaid periods stay owed. Service resumes from the first period paid in full. *Stated cost:* while paused, the agreements this deal covers have no keeper. Their other parties are shown the pause by Longhouse's notice, and Plain Words tells its counterparties in those agreements the day it is published.

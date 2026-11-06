# Pointer: findings about the core

*Pointer, web media. Newest first. MOR read at the rehearsal commit `af2ed6f8`; rule numbers are those of the drafts the MICS v36 names.*

## 6 November 2026, first read

*From reading the texts and code while planning what to build; nothing built yet.*

**P5. `docs/state-of-mor.md` lists stale drafts.**
- *Tried:* to find the current drafts from the state file.
- *Texts:* lines 77 to 83 name Identity draft 14 and relay transport draft 5.
- *Expected:* Identity draft 15 and relay transport draft 7, as `spec/README.md` and `cmips/` show.
- *Blocks:* no.

**P4. Omission by a home cannot be proven in the core. Not a flaw; recorded so nobody sells otherwise.**
- *Tried:* to tell, from a reader client, whether a home is serving a stale key history.
- *Texts:* the core proves equivocation (two receipts at one position; two log summaries, neither extending the other: Identity rules 44 and 45, "Log summaries and audits"), never omission: "A withheld receipt leaves no evidence" (Identity rule 28). Asking several homes is a SHOULD of the relay transport cMIP, draft 7, experimental (its Clients item 2).
- *Expected:* this. The core is right not to promise it.
- *Effect:* an audit can prove a home lied, never that it held something back. A client asking several homes is taking a precaution, not producing a proof.
- *Blocks:* no.

**P3. The rules a client's income rests on have no test vectors.**
- *Tried:* to find, in code, the verdicts for role shares, referrals and use records.
- *Code:* `core/vectors/` holds nothing for any of them. The freeze suite has the scenarios: 104, 134, 136, 161, 178, 225, 228, 229, 230, 236, 424.
- *Expected:* vectors before the freeze, at least for 134 (a role share counts only when acknowledged in the payer's claim) and 230 (a delivery record and a use record, acknowledged and not).
- *Blocks:* not the work; it blocks us from offering the client role on real money until these verdicts exist in code.

**P2. "The client that brought the sale" has no evidence defined.**
- *Tried:* to write the role a reader client fills in a split plan.
- *Texts:* Agreements, near line 2940, mentions "an app's share for the client that brought the sale (a partner, or a role share)" once. Role names are free text (`share-rule = [1, role: tstr, part]`); nothing links a role to the evidence that fills it; the use record's format is left to "the cMIP the service runs under" (Development rule 15).
- *Expected:* nothing more from the core. This reads as a cMIP's job.
- *Blocks:* no. We will write a cMIP for it.

**P1. How a buyer's claim reaches the split service is not said.**
- *Tried:* to design the step where a client's use record is acknowledged and then counted.
- *Texts:* a role share counts only when the payer's claim acknowledges its evidence (Agreements rule 22). A claim is private by default (Money). Agreements rule 19 says the split service "receives" any payer's claim, never how.
- *Expected:* either a rule that the buyer's client delivers its claim to the split service, or a sentence saying delivery is a cMIP's.
- *Effect:* a client that never sends the claim fills no role, and neither the payee nor the would-be filler can tell.
- *Blocks:* no; a cMIP can define delivery. *Question:* is that intended?

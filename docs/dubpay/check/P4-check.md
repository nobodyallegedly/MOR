# DubPay P4: check of constitution draft 2 against the research

Author: Nobody, allegedly. Date: 22 November 2026.

A check, not a decision. Nothing here is rewritten or settled. The reader's lean is marked "Lean:".

## In plain words

- Most of the draft follows the research. Splits, "undecided", narrow wallet links and the checklist are all there.
- Five things in it go further than the reports. A holder that can be audited from public acts alone. A preimage or a locked token counted as "paid". A text that is never edited. Two readers making a text final. A release step the money-testing report does not contain.
- The draft says every principle names its source, and that it marks evidence that rests on search summaries. Neither is true of the constitution block.
- It cites a split row, S17, that does not exist.
- It leaves out the whole ecash side of the failures report. It also leaves out a private place to report a flaw, and the point that a wallet link has no retry key.
- Several principles reach into DubLaw's area (who decides, what is owed, held money). Others reach into DubWeb's (what is shown, names, records).
- One reframing ("not holds nothing against holds money") and the "still owed" line could let DubPay end up holding money.

**Could not be read:** the lead's constitution (`claude/MOR-dubsar-constitutions-after-round-2.md`). It is not in the repository, on any branch or in any commit. The draft says it lives in the MOR project (line 3), which this session cannot open. So nothing below compares the draft with the lead's text. Draft line 38 ("The lead's text stands as written") is unchecked.

**How to read the references.** "D42" is line 42 of `docs/dubpay/constitution/draft-2.md` on `claude/dubpay-constitution-draft-2`. "P1 139" is line 139 of `spec-process.md`, "P2" is `money-testing.md`, and "P3" is `payment-failures.md`, each read on the branch the brief names. Row IDs (S5, X15) and rule numbers are P3's own.

---

## 1. Principles the research does not support, or contradicts

1. **Audit from public acts alone.** D42 says the holder is someone "who can audit them from public acts alone". The research says this cannot be done yet.
   - Fedimint's audit catches accounting bugs, not theft (P2 217).
   - The watchdog does not prove the backend's balance (P2 351).
   - Lightning channel funds "cannot be publicly accounted for" (P2 276).
   - Public proof of what a mint owes "is still a proposal" (P3 92, E15).
   - No source shows any holder audited from public acts.
2. **What counts as "paid".** D45: paid means "a preimage against an invoice the payee signed, or a token locked to the payee's key". The research weakens both halves.
   - A preimage shows an invoice was paid, "not who paid it" (P2 321).
   - An LND bug once handed out "proof of payment for stolen payments" (P2 368).
   - For one receiver, the receiver "is free to reveal" the secret before all parts arrive (P3 133, S9).
   - A locked ecash token is "not yet money". It can be burned at a mint the receiver has not listed (P3 91 E14, P3 219 rule 6).
   - Credit comes from the settled amounts of the payment's parts, not from invoice status (P2 92). The amount received can differ from the amount invoiced (P2 58).
3. **"Never failed" (D47).** Not quite what the sources say.
   - A timeout before the first attempt is a plain failure (P2 315).
   - One source says indeterminate errors "will have to be marked as failed" when the downstream call cannot be safely repeated (P2 307).
   - Alby Hub reports a send that no relay confirmed as failed (P3 186, W13).
   - Nothing in the draft says what ends "pending". No spec says how long to keep polling (P2 455), and a share can sit undecided for hours (P3 135, S11).
4. **"A text, once used, is never edited" (D53).** P1 supports freezing plus versioned, dated corrections (P1 135, P1 119). Bitcoin allows small logged changes after a text is Complete (P1 119). "Never edited" comes from MOR's hash naming (D24), not from the research.
5. **"Final only when two independent readers agree" (D53, D26).**
   - P1's gate is two independent *programs* that work together (P1 139, P1 65).
   - P1 adds that the gate "proves that implementers agree, not that the text is right" (P1 139). Its 2019 case was a check the text never required, which the gate could not catch (P1 75).
   - In practice the gate is self-reported in a thread (P1 71).
   - The draft keeps the gate and drops the warning.
6. **Principle 8, rails are parameters (D49).** No report section supports it.
7. **Principle 13, readers before payers (D54).** No report section supports it. The nearest is P1 87 (cross-testing found what reading the text had not), which is a different point.
8. **Principle 14 (D55).** This is a working rule, not something drawn from the research. That is fine, but it is not marked as such.
9. **Principle 9, "reconcile against the rail's own records" (D50).** P2 marks this as an inference. Its only source for the principle is an unverified search excerpt (P2 100).
10. **Principle 11, "identity key alone" (D52).** P3 rule 25 rests on "an unverified report and a structural fact; no confirmed diversion" (P3 297).
11. **Principle 11, narrowest link.** P3: "No case of a limit capping a theft is documented; this is inference" (P3 285).

## 2. Research points left out that would change how DubPay works

**Ecash (P3 rules 5 to 7, P3 215 to 225).** None of this is in the draft:
- an ecash balance is shown as "held by the mint";
- it is capped per mint;
- mints are used only if the user approved them;
- a mint is never added because a token arrived from it (E8);
- ecash is paid only to a mint the receiver lists;
- the health of each mint is watched.

**Receipts (P3 rules 9 and 10).**
- "Could not check" is its own state, shown as unverified (P3 231, Z7). D45 covers only "service says".
- Nothing of value is released on a public receipt alone (P3 235).

**Before sending a split (P3 rule 13, P3 247).** Every share is worked out first. The payer sees which shares cannot be paid (shares that round to zero, dead destinations: S2, S3) and confirms with that in view. D46 covers only what happens after sending.

**A payment name that changes (P3 rule 12, P3 243).** Remember the address last used for a contact and warn when it changes.

**Wallet links (P3 rules 24, 26, 27, 29).**
- Expect a link to be cancelled without notice, and guide the user through reconnecting (P3 291).
- Tell the user of every payment made through the link, and how much of the limit is used (P3 299).
- Advise a small, separate wallet (P3 303).
- Do not depend on one relay, store or server, and say "could not reach your wallet" rather than "failed" (P3 311, W13).

**What DubPay says up front (P3 rules 28, 30, 32).**
- Whether anyone covers losses caused by software (P3 307). The gate (D63) has the incident plan but not this.
- The costs of holding your own money (P3 315).
- That DubPay cannot protect against fraud on the ordinary-money side (P3 323).

**Retrying over a wallet link (P2 325, P2 458).** The wallet-link standard (NIP-47) defines no key that marks a retry as the same request. DubPay's ID rule (D61) is therefore DubPay's own and cannot be checked on the wallet's side. A fresh invoice means a fresh hash, so the node's guard does not help either (P2 325).

**Reporting flaws (P1 25, P1 145, P2 129).** The research calls this the weakest point everywhere: one named, private place to report a flaw in a text, and a rule for what is published afterwards. Principle 12 has the dated disclosure but no place to report and no embargo rule. P1 167 adds: do not hold a known fix for the next routine release.

**Dependencies (P2 117, P2 444).** Fixes ship quietly and are disclosed 6 to 24 months later. "Which version of each wallet or node are we on" is itself a release-gate question. It matters more for a tool that sits on other people's wallets.

**Missing from the gate (D58 to D63).** P2 lists each of these as a separate check:
- a restart in each pending state (P2 39);
- two identical requests at the same moment (P2 95);
- older answers never overwrite newer ones (P2 91);
- catching up from a stored index (P2 89);
- test-only settings cannot reach a release (P2 43);
- results from a mocked network are not counted as covering reserves (P2 41);
- signed, reproducible releases, and a published tag is never replaced (P2 119, P2 431).

**Amounts.**
- Each unit is its own type, and every conversion names its rounding direction (P2 50).
- Overflow, zero, negative and finer-than-smallest-unit amounts are rejected (P2 51, P2 52).
- Overpayment has a named destination (P2 58).
- Amounts crossing between Rust and TypeScript are tested at the largest values (P2 62). P2 marks this one as inference only.

**Texts (P1).** Each is a separate habit:
- one allocator for shared number spaces (P1 147, P1 148, P1 163);
- writer and reader rules stated separately (P1 144);
- no text deprecated before its replacement exists (P1 158);
- check what depends on a text before retiring it (P1 171);
- "published", "in use" and "recommended" kept apart (P1 170);
- a migration guide (P1 152);
- vectors run on a schedule (P1 143);
- a small, separate reference program (P1 150);
- who decides that a text is final, and how that role is appointed and removed (P1 160, P1 161). The workflow (D66) names who merges, not who calls a text final.

## 3. Overlaps with DubLaw and DubWeb

**DubLaw (agreements, disputes, deposits)**
- Principle 2 (D43), the trust table's "who decides" (D44) and D21 are dispute rules. D89 hands X7, X8, X16 and X17 to DubLaw, but the rule built on X15 stays in DubPay's text.
- D46: "stays owed, in the receiver's name … until a later act closes it" describes an obligation, which is agreement territory. So does "one rule for a share that cannot be delivered" (P3 255 offers: payer keeps it, or it stays owed).
- D42, "a text that needs a holder names the holder", touches deposits.
- Research DubLaw would need that the draft does not pass on: held-payment states with a latest end time, decided and told to both sides in advance (P3 275, rule 20); dispute rules and evidence in the same signed channel (P3 271, rule 19).

**DubWeb (what people see, identity safety, records and time)**
- What people see: D45 ("shown as such"), D51 (notices inside the app), D52 (show where to cancel), and "pending" as a shown state (D47).
- Identity safety: D51 (a payment name to re-point), D52 (identity key). Also P3 rules 12 and 21 (warn on a changed address; never contact first, P3 279), which are not passed on in D90.
- Records and time: D46 (a record the receiver can read), D50 (append-only records). D84 notes the reputation seam already.

## 4. Anything that would make DubPay hold money, decide a release, or change the core

- **D20 and D46, the "still owed" line.** P3's source for it, S5, is a forwarder: "the undelivered money stays with the forwarding wallet's owner" (P3 129). If splits run on the service side (left open at D82), an owed entry means someone is holding the money. D20's reframing ("not 'holds nothing' against 'holds money'") makes that easier to slip into. Lean: this needs Nobody, allegedly's answer before the catalogue wave.
- **D47, "retried or refunded".** A refund needs someone holding the money to refund from. The draft does not say who.
- **D50, ledger discipline and reconciliation.** P2's examples are mints and federations that hold money (P2 48, P2 104). A tool that holds nothing would be keeping books of whose money? This is not settled in the draft.
- **D63, the stop switch.** A power over other people's payments. It is narrow (new payments only), but it is not named in the trust table.
- **D53, principle 12, is not limited to Money texts.** Read broadly, it adds a two-reader gate, role-split vectors and hash pinning to every text, MOR's core included. If it is meant only for DubPay's texts, the draft does not say so.
- **P3 235, rule 10** (nothing released on a receipt alone) implies somebody releases things. The draft does not say who, and should not be DubPay (D42).

## 5. Claims stated more strongly than their source

- **D10:** "Each principle below names the report section it rests on. Where a principle goes beyond its sources, it says so." None of the 14 principles in D40 to D55 names a section or marks itself as going beyond its sources.
- **D10:** "the reports mark [search summaries], and so does this draft where it leans on them." Principle 10 (D51) rests on rows C1 to C9 and X1 to X3. Every one of those is "search summary, page not opened" (P3 47 to 55, P3 148 to 150). The draft does not mark this. Only 34 of P3's 96 cases were read at source (P3 14).
- **D18, "(S14, S17)":** there is no row S17. Split rows end at S14 (P3 138). The claim is P3 rule 17 (P3 263).
- **D20, "the missing piece P3 asks for":** the S5 text is in P3's design-choice column, which P3 calls "the researchers' inference, not a finding" (P3 26). "DubPay used in round two" is not in any report.
- **D21:** "the hold runs out before a long dispute does". P3 says holds last about 48 to 96 hours and "some disputes take over a month" (P3 163). It is a structural point, and no such loss is documented.
- **D26 and the Copy list:** P1 offers every point as "a proposal to consider" (P1 131). The draft turns them into requirements and swaps "programs" for "readers".
- **D30:** "They are used everywhere" has no source in P1. The apps-stuck claim is in P1 156 (Avoid 1) only, not P1 3.1, and it is "search summary only, single source". The draft says "one source" but not "search summary".
- **D57, "the checklist in P2":** "fetching it back by hash from every home it names" (D62) is not in P2. P2's release items are signed drafts, a tag never replaced, a clean install, and passing compatibility tests (P2 119 to 121).
- **D58 and D62:** regtest against real nodes (P2 33) and amount caps while new (P2 124) are P2's inferences. P2 found no per-amount caps in wallet READMEs (P2 497). The gate states both as plain requirements.
- **D31, the hand-back rule as "decided by Nobody, allegedly":** the source of that decision is not among the files this check may read, so it is unchecked here.

---

*Read for this check: the draft and the three reports named above, nothing else of DubPay's. The lead's constitution was not reachable.*
